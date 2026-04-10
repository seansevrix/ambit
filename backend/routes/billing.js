// backend/routes/billing.js
import express from "express";
import Stripe from "stripe";
import prisma from "../lib/prismaClient.js";

const router = express.Router();

// ---- Stripe setup ----
const STRIPE_SECRET_KEY =
  process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET || "";

const stripe = STRIPE_SECRET_KEY ? new Stripe(STRIPE_SECRET_KEY) : null;

/**
 * ✅ Plans
 *  - associate   (LEGACY / grandfathered only)
 *  - starter     ($49.99/mo)
 *  - pro         ($129.99/mo)
 *  - enterprise  (Managed Capture)
 *
 * ✅ Env vars
 *  - STRIPE_PRICE_ID_ASSOCIATE
 *  - STRIPE_PRICE_ID_STARTER
 *  - STRIPE_PRICE_ID_PRO
 *  - STRIPE_PRICE_ID_ENTERPRISE   -> full monthly price ($1499)
 *  - STRIPE_PRICE_ID_PILOT        -> first-month pilot price ($499)
 */

// Legacy / Associate (grandfathered)
const STRIPE_PRICE_ID_ASSOCIATE =
  process.env.STRIPE_PRICE_ID_ASSOCIATE ||
  process.env.STRIPE_PRICE_ASSOCIATE ||
  process.env.STRIPE_PRICE_SINGLE_ID ||
  process.env.STRIPE_PRICE_SINGLE ||
  process.env.STRIPE_PRICE_ID ||
  "";

// Starter
const STRIPE_PRICE_ID_STARTER =
  process.env.STRIPE_PRICE_ID_STARTER ||
  process.env.STRIPE_PRICE_STARTER ||
  "";

// Pro
const STRIPE_PRICE_ID_PRO =
  process.env.STRIPE_PRICE_ID_PRO ||
  process.env.STRIPE_PRICE_PRO ||
  "";

// Enterprise full price
const STRIPE_PRICE_ID_ENTERPRISE =
  process.env.STRIPE_PRICE_ID_ENTERPRISE ||
  process.env.STRIPE_PRICE_ENTERPRISE ||
  process.env.STRIPE_PRICE_ENTERPRISE_ID ||
  "";

// Enterprise pilot first month
const STRIPE_PRICE_ID_PILOT =
  process.env.STRIPE_PRICE_ID_PILOT ||
  process.env.STRIPE_PRICE_PILOT ||
  "";

// Optional: old executive fallbacks
const STRIPE_PRICE_ID_EXECUTIVE =
  process.env.STRIPE_PRICE_ID_EXECUTIVE ||
  process.env.STRIPE_PRICE_EXECUTIVE ||
  process.env.STRIPE_PRICE_ALL_ID ||
  process.env.STRIPE_PRICE_ALL ||
  "";

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

/**
 * Plans:
 *  - starter (public)
 *  - pro (public)
 *  - enterprise (public)
 *  - associate (legacy/grandfathered)
 *
 * Back-compat:
 *  - associate/single/basic => associate
 *  - executive/prime/all/all3/all_markets => pro
 */
function normalizePlan(planRaw) {
  const p = String(planRaw || "").trim().toLowerCase();

  if (p === "starter") return "starter";
  if (p === "pro") return "pro";
  if (p === "enterprise") return "enterprise";

  if (p === "associate") return "associate";
  if (p === "single" || p === "single_market" || p === "basic") return "associate";

  if (p === "corp" || p === "corporate" || p === "enterprise_plus") return "enterprise";

  if (p === "executive" || p === "prime" || p === "all" || p === "all3" || p === "all_markets") {
    return "pro";
  }

  return "pro";
}

function resolvePriceId(plan) {
  if (plan === "starter") return STRIPE_PRICE_ID_STARTER || "";
  if (plan === "pro") return STRIPE_PRICE_ID_PRO || "";
  if (plan === "enterprise") return STRIPE_PRICE_ID_ENTERPRISE || "";
  if (plan === "associate") return STRIPE_PRICE_ID_ASSOCIATE || "";
  return "";
}

function missingPriceMessage(plan) {
  if (plan === "starter") {
    return "Missing STRIPE_PRICE_ID_STARTER (or STRIPE_PRICE_STARTER) on backend env vars.";
  }
  if (plan === "pro") {
    return "Missing STRIPE_PRICE_ID_PRO (or STRIPE_PRICE_PRO) on backend env vars.";
  }
  if (plan === "enterprise") {
    return "Missing STRIPE_PRICE_ID_PILOT and/or STRIPE_PRICE_ID_ENTERPRISE on backend env vars.";
  }
  if (plan === "associate") {
    return "Missing STRIPE_PRICE_ID_ASSOCIATE (or STRIPE_PRICE_ASSOCIATE / STRIPE_PRICE_SINGLE_ID / STRIPE_PRICE_ID) on backend env vars.";
  }
  return "Missing Stripe price env var on backend.";
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
 *   { customerId?: number, email?: string, plan?: "associate" | "starter" | "pro" | "enterprise" | legacy strings }
 *
 * Flows:
 *  - starter/pro/associate => direct subscription Checkout
 *  - enterprise => setup-mode Checkout, then webhook creates 2-phase schedule
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

    const customer = await findCustomer({ customerId, email });
    if (!customer) {
      return res.status(404).json({
        ok: false,
        error: "Customer not found. Please finish signup first.",
      });
    }

    const planRequested = String(planRaw || "").trim().toLowerCase();
    let plan = normalizePlan(planRaw);

    if (!planRequested && String(customer?.plan || "").toLowerCase() === "associate") {
      plan = "associate";
    }

    const allowExecutive =
      (planRequested === "executive" || planRequested === "prime") && STRIPE_PRICE_ID_EXECUTIVE;

    const stripeCustomerId = await ensureStripeCustomer(customer);
    const frontendBase = getFrontendBaseUrl(req);

    const successUrl = `${frontendBase}/matches/${customer.id}?checkout=success&plan=${plan}`;
    const cancelUrl = `${frontendBase}/get-started?checkout=cancel&plan=${plan}&email=${encodeURIComponent(
      customer.email || ""
    )}`;

    // Enterprise / Managed Capture:
    // Save the payment method first, then let the webhook create the 2-phase schedule:
    // month 1 = pilot, month 2+ = full price.
    if (plan === "enterprise") {
      if (!STRIPE_PRICE_ID_PILOT || !STRIPE_PRICE_ID_ENTERPRISE) {
        return res.status(500).json({
          ok: false,
          error: missingPriceMessage(plan),
        });
      }

      const session = await stripe.checkout.sessions.create({
        mode: "setup",
        customer: stripeCustomerId,
        success_url: successUrl,
        cancel_url: cancelUrl,
        client_reference_id: String(customer.id),
        metadata: {
          customerId: String(customer.id),
          plan,
          tier: plan,
          billingFlow: "enterprise_pilot_schedule",
        },
      });

      return res.status(200).json({
        ok: true,
        url: session.url,
        plan,
        customerId: customer.id,
      });
    }

    const priceId = allowExecutive ? STRIPE_PRICE_ID_EXECUTIVE : resolvePriceId(plan);

    if (!priceId) {
      return res.status(500).json({ ok: false, error: missingPriceMessage(plan) });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: stripeCustomerId,
      line_items: [{ price: priceId, quantity: 1 }],
      payment_method_collection: "always",
      allow_promotion_codes: true,
      success_url: successUrl,
      cancel_url: cancelUrl,
      client_reference_id: String(customer.id),
      metadata: { customerId: String(customer.id), plan, tier: plan },
      subscription_data: {
        metadata: { customerId: String(customer.id), plan, tier: plan },
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

    if (!customer) return res.status(404).json({ ok: false, error: "Customer not found." });

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