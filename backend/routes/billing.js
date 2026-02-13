// backend/routes/billing.js
import express from "express";
import Stripe from "stripe";
import prisma from "../lib/prismaClient.js";

const router = express.Router();

// ---- Stripe setup ----
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET || "";

// New preferred env vars
const STRIPE_PRICE_ASSOCIATE = process.env.STRIPE_PRICE_ASSOCIATE || "";
const STRIPE_PRICE_EXECUTIVE = process.env.STRIPE_PRICE_EXECUTIVE || "";
const STRIPE_PRICE_ENTERPRISE =
  process.env.STRIPE_PRICE_ENTERPRISE || process.env.STRIPE_PRICE_ENTERPRISE_ID || "";

// Back-compat env vars (older naming)
const STRIPE_PRICE_SINGLE_ID =
  process.env.STRIPE_PRICE_SINGLE_ID || process.env.STRIPE_PRICE_SINGLE || "";
const STRIPE_PRICE_ALL_ID =
  process.env.STRIPE_PRICE_ALL_ID || process.env.STRIPE_PRICE_ALL || "";
const STRIPE_PRICE_ID = process.env.STRIPE_PRICE_ID || ""; // legacy single fallback

const stripe = STRIPE_SECRET_KEY ? new Stripe(STRIPE_SECRET_KEY) : null;

function getFrontendBaseUrl(req) {
  const isProd = process.env.NODE_ENV === "production";
  const envUrl = process.env.FRONTEND_URL || process.env.NEXT_PUBLIC_FRONTEND_URL;

  if (envUrl) return String(envUrl).replace(/\/$/, "");

  if (isProd) {
    throw new Error("Missing FRONTEND_URL on backend env vars (required in production).");
  }

  const origin = req.headers.origin;
  if (origin) return String(origin).replace(/\/$/, "");

  return "http://localhost:3000";
}

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function normalizePlan(planRaw) {
  const p = String(planRaw || "").trim().toLowerCase();

  // New names
  if (p === "enterprise") return "enterprise";
  if (p === "executive") return "executive";
  if (p === "associate") return "associate";

  // Enterprise aliases (safe additions)
  if (p === "corp" || p === "corporate" || p === "enterprise_plus") return "enterprise";

  // Back-compat names
  // NOTE: keep "prime" mapped to executive to avoid accidentally charging legacy links at enterprise price.
  if (p === "all" || p === "all3" || p === "all_markets" || p === "prime") return "executive";
  if (p === "single" || p === "single_market" || p === "basic") return "associate";

  // Default safe fallback
  return "associate";
}

function resolvePriceId(plan) {
  if (plan === "enterprise") {
    return STRIPE_PRICE_ENTERPRISE || "";
  }

  if (plan === "executive") {
    return STRIPE_PRICE_EXECUTIVE || STRIPE_PRICE_ALL_ID || "";
  }

  // associate
  return STRIPE_PRICE_ASSOCIATE || STRIPE_PRICE_SINGLE_ID || STRIPE_PRICE_ID || "";
}

async function ensureStripeCustomer(customer) {
  if (!stripe) throw new Error("Stripe not configured.");

  const existingId = customer?.stripeCustomerId ? String(customer.stripeCustomerId) : null;

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

async function findCustomer({ customerId, email }) {
  const idNum = Number(customerId);

  if (idNum && Number.isFinite(idNum)) {
    return prisma.customer.findUnique({ where: { id: idNum } });
  }

  const normalized = normalizeEmail(email);
  if (!normalized) return null;

  return prisma.customer.findFirst({
    where: { email: normalized },
  });
}

/**
 * POST /engine/billing/create-checkout-session
 * Body:
 *   {
 *     customerId?: number,
 *     email?: string,
 *     plan?: "associate" | "executive" | "enterprise" | "single" | "all"
 *   }
 *
 * IMPORTANT:
 * - Paid-first flow (no free trial)
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

    const { customerId, email, plan: planRaw } = req.body || {};
    const plan = normalizePlan(planRaw);
    const priceId = resolvePriceId(plan);

    if (!priceId) {
      let missing = "Missing STRIPE price env var on backend.";
      if (plan === "enterprise") {
        missing = "Missing STRIPE_PRICE_ENTERPRISE on backend env vars.";
      } else if (plan === "executive") {
        missing = "Missing STRIPE_PRICE_EXECUTIVE (or STRIPE_PRICE_ALL_ID) on backend env vars.";
      } else {
        missing =
          "Missing STRIPE_PRICE_ASSOCIATE (or STRIPE_PRICE_SINGLE_ID / STRIPE_PRICE_ID) on backend env vars.";
      }

      return res.status(500).json({
        ok: false,
        error: missing,
      });
    }

    const customer = await findCustomer({ customerId, email });
    if (!customer) {
      return res.status(404).json({
        ok: false,
        error: "Customer not found. Please finish signup first.",
      });
    }

    const stripeCustomerId = await ensureStripeCustomer(customer);
    const frontendBase = getFrontendBaseUrl(req);

    const successUrl = `${frontendBase}/matches/${customer.id}?checkout=success&plan=${plan}`;
    const cancelUrl = `${frontendBase}/get-started?checkout=cancel&plan=${plan}&email=${encodeURIComponent(
      customer.email || ""
    )}`;

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: stripeCustomerId,
      line_items: [{ price: priceId, quantity: 1 }],
      payment_method_collection: "always",
      allow_promotion_codes: true,
      success_url: successUrl,
      cancel_url: cancelUrl,
      client_reference_id: String(customer.id),
      metadata: {
        customerId: String(customer.id),
        plan,
        tier: plan,
      },
      // No trial_period_days in paid-first model
      subscription_data: {
        metadata: {
          customerId: String(customer.id),
          plan,
          tier: plan,
        },
      },
    });

    return res.status(200).json({
      ok: true,
      url: session.url,
      plan,
      customerId: customer.id,
    });
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
    const customer = await findCustomer({ customerId, email });

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

router.post("/create-portal-session", createPortalSession);
router.post("/portal", createPortalSession);

export default router;
