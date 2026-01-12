// backend/routes/billing.js
import express from "express";
import Stripe from "stripe";
import prisma from "../lib/prismaClient.js";

const router = express.Router();

// ---- Stripe setup ----
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET;

// ✅ NEW: two-tier pricing
const STRIPE_PRICE_SINGLE_ID = process.env.STRIPE_PRICE_SINGLE_ID || process.env.STRIPE_PRICE_SINGLE;
const STRIPE_PRICE_ALL_ID = process.env.STRIPE_PRICE_ALL_ID || process.env.STRIPE_PRICE_ALL;

// ✅ Back-compat (if you already had one price)
const STRIPE_PRICE_ID = process.env.STRIPE_PRICE_ID;

// ✅ Trial settings
const TRIAL_DAYS = Number(process.env.STRIPE_TRIAL_DAYS || 7); // default 7

const stripe = STRIPE_SECRET_KEY
  ? new Stripe(STRIPE_SECRET_KEY, {
      // apiVersion optional
    })
  : null;

// Helper: pick frontend base URL (prod or local)
function getFrontendBaseUrl(req) {
  const isProd = process.env.NODE_ENV === "production";

  const envUrl = process.env.FRONTEND_URL || process.env.NEXT_PUBLIC_FRONTEND_URL;
  if (envUrl) return envUrl.replace(/\/$/, "");

  if (isProd) {
    throw new Error("Missing FRONTEND_URL on backend env vars (required in production).");
  }

  const origin = req.headers.origin;
  if (origin) return String(origin).replace(/\/$/, "");

  return "http://localhost:3000";
}

/**
 * ✅ FIXED:
 * Some DB rows may contain an old stripeCustomerId from a different Stripe account/key.
 * In that case Stripe returns: resource_missing (param: customer).
 * We verify the customer exists; if not, we create a new one and update DB.
 */
async function ensureStripeCustomer(customer) {
  if (!stripe) throw new Error("Stripe not configured.");

  const existingId = customer.stripeCustomerId ? String(customer.stripeCustomerId) : null;

  if (existingId) {
    try {
      const existing = await stripe.customers.retrieve(existingId);
      if (existing && !existing.deleted) return existing.id;
    } catch (err) {
      const code = err?.code || err?.raw?.code;
      console.warn(
        "⚠️ Saved Stripe customerId invalid or not found; recreating:",
        code || err?.message || err
      );
    }
  }

  const created = await stripe.customers.create({
    email: customer.email || undefined,
    name: customer.companyName || customer.name || undefined,
    metadata: { customerId: String(customer.id) },
  });

  await prisma.customer.update({
    where: { id: customer.id },
    data: { stripeCustomerId: created.id },
  });

  return created.id;
}

function normalizePlan(p) {
  const plan = String(p || "").toLowerCase().trim();
  if (plan === "all" || plan === "all3" || plan === "all_markets") return "all";
  return "single";
}

function pickPriceId(plan) {
  // Prefer new env vars if set
  if (plan === "all") {
    return STRIPE_PRICE_ALL_ID || null;
  }
  return STRIPE_PRICE_SINGLE_ID || STRIPE_PRICE_ID || null; // fallback to old single price
}

/**
 * POST /engine/billing/create-checkout-session
 * Body: { customerId: number, plan?: "single" | "all" }
 */
async function createCheckoutSession(req, res) {
  try {
    if (!stripe) {
      return res.status(500).json({
        ok: false,
        error:
          "Stripe is not configured on the backend. Missing STRIPE_SECRET_KEY (or STRIPE_SECRET).",
      });
    }

    // --- validate body ---
    const { customerId, plan: planRaw } = req.body || {};
    const id = Number(customerId);
    if (!id || !Number.isFinite(id)) {
      return res.status(400).json({ ok: false, error: "customerId is required." });
    }

    const plan = normalizePlan(planRaw);

    // --- pick price ---
    const priceId = pickPriceId(plan);
    if (!priceId) {
      return res.status(500).json({
        ok: false,
        error:
          plan === "all"
            ? "Missing STRIPE_PRICE_ALL_ID on backend env vars."
            : "Missing STRIPE_PRICE_SINGLE_ID (or STRIPE_PRICE_ID) on backend env vars.",
      });
    }

    // --- load customer ---
    const customer = await prisma.customer.findUnique({ where: { id } });
    if (!customer) return res.status(404).json({ ok: false, error: "Customer not found." });

    const stripeCustomerId = await ensureStripeCustomer(customer);
    const frontendBase = getFrontendBaseUrl(req);

    const successUrl = `${frontendBase}/matches/${id}?checkout=success&plan=${plan}`;
    const cancelUrl = `${frontendBase}/matches/${id}?checkout=cancel&plan=${plan}`;

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: stripeCustomerId,

      // ✅ price chosen by plan
      line_items: [{ price: priceId, quantity: 1 }],

      // ✅ REQUIRE a payment method (credit card) to start the trial
      payment_method_collection: "always",

      success_url: successUrl,
      cancel_url: cancelUrl,

      allow_promotion_codes: true,

      metadata: { customerId: String(id), plan },
      client_reference_id: String(id),

      subscription_data: {
        trial_period_days: TRIAL_DAYS,
        metadata: { customerId: String(id), plan },
      },
    });

    return res.status(200).json({ ok: true, url: session.url, plan });
  } catch (err) {
    console.error("Billing create-checkout-session error:", err);
    return res.status(500).json({
      ok: false,
      error: err?.message || "Billing error creating checkout session.",
    });
  }
}

/**
 * POST /engine/billing/create-portal-session
 * Body: { customerId?: number, email?: string }
 * Returns: { ok: true, url }
 */
async function createPortalSession(req, res) {
  try {
    if (!stripe) {
      return res.status(500).json({
        ok: false,
        error:
          "Stripe is not configured on the backend. Missing STRIPE_SECRET_KEY (or STRIPE_SECRET).",
      });
    }

    const { customerId, email } = req.body || {};
    let customer = null;

    if (customerId != null && customerId !== "") {
      const id = Number(customerId);
      if (!id || !Number.isFinite(id)) {
        return res.status(400).json({ ok: false, error: "customerId must be a number." });
      }
      customer = await prisma.customer.findUnique({ where: { id } });
    } else if (email) {
      customer = await prisma.customer.findFirst({
        where: { email: String(email).toLowerCase().trim() },
      });
    } else {
      return res.status(400).json({ ok: false, error: "Provide customerId or email." });
    }

    if (!customer) {
      return res.status(404).json({ ok: false, error: "Customer not found." });
    }

    const stripeCustomerId = await ensureStripeCustomer(customer);
    const frontendBase = getFrontendBaseUrl(req);

    const returnUrl = `${frontendBase}/support?portal=return`;

    const session = await stripe.billingPortal.sessions.create({
      customer: stripeCustomerId,
      return_url: returnUrl,
    });

    return res.status(200).json({ ok: true, url: session.url });
  } catch (err) {
    console.error("Billing create-portal-session error:", err);
    return res.status(500).json({
      ok: false,
      error: err?.message || "Billing error creating portal session.",
    });
  }
}

// Routes
router.post("/create-checkout-session", createCheckoutSession);
router.post("/checkout", createCheckoutSession);

// Portal routes
router.post("/create-portal-session", createPortalSession);
router.post("/portal", createPortalSession);

export default router;
