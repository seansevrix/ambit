// backend/routes/billing.js
import express from "express";
import Stripe from "stripe";
import prisma from "../lib/prismaClient.js";

const router = express.Router();

// ---- Stripe setup ----
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET;
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

async function ensureStripeCustomer(customer) {
  if (!stripe) throw new Error("Stripe not configured.");

  if (customer.stripeCustomerId) return customer.stripeCustomerId;

  const created = await stripe.customers.create({
    email: customer.email || undefined,
    name: customer.name || undefined,
    metadata: { customerId: String(customer.id) },
  });

  await prisma.customer.update({
    where: { id: customer.id },
    data: { stripeCustomerId: created.id },
  });

  return created.id;
}

/**
 * POST /engine/billing/create-checkout-session
 * Body: { customerId: number }
 *
 * ✅ Creates a Stripe Checkout Session for a subscription:
 * - 7-day free trial (configurable via STRIPE_TRIAL_DAYS)
 * - Credit card REQUIRED up front (payment_method_collection: "always")
 */
async function createCheckoutSession(req, res) {
  try {
    // --- basic config checks ---
    if (!stripe) {
      return res.status(500).json({
        ok: false,
        error:
          "Stripe is not configured on the backend. Missing STRIPE_SECRET_KEY (or STRIPE_SECRET).",
      });
    }
    if (!STRIPE_PRICE_ID) {
      return res.status(500).json({
        ok: false,
        error: "Missing STRIPE_PRICE_ID on the backend env vars.",
      });
    }

    // --- validate body ---
    const { customerId } = req.body || {};
    const id = Number(customerId);
    if (!id || !Number.isFinite(id)) {
      return res.status(400).json({ ok: false, error: "customerId is required." });
    }

    // --- load customer ---
    const customer = await prisma.customer.findUnique({ where: { id } });
    if (!customer) return res.status(404).json({ ok: false, error: "Customer not found." });

    const stripeCustomerId = await ensureStripeCustomer(customer);
    const frontendBase = getFrontendBaseUrl(req);

    const successUrl = `${frontendBase}/matches/${id}?checkout=success`;
    const cancelUrl = `${frontendBase}/matches/${id}?checkout=cancel`;

    // ✅ Create subscription checkout with trial + card required
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",

      customer: stripeCustomerId,

      // ✅ $39.99/month price
      line_items: [{ price: STRIPE_PRICE_ID, quantity: 1 }],

      // ✅ REQUIRE a payment method (credit card) to start the trial
      // This prevents "no-card free trials"
      payment_method_collection: "always",

      success_url: successUrl,
      cancel_url: cancelUrl,

      // Optional: allow promo codes if you want
      allow_promotion_codes: true,

      // Helpful identifiers
      metadata: { customerId: String(id) },
      client_reference_id: String(id),

      // ✅ TRIAL HERE (NOT in Stripe product/price screen)
      subscription_data: {
        trial_period_days: TRIAL_DAYS,
        metadata: { customerId: String(id) },
      },
    });

    return res.status(200).json({ ok: true, url: session.url });
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
 *
 * Sends the user to Stripe’s Customer Portal where they can cancel/update billing.
 */
async function createPortalSession(req, res) {
  try {
    if (!stripe) {
      return res.status(500).json({
        ok: false,
        error: "Stripe is not configured on the backend. Missing STRIPE_SECRET_KEY (or STRIPE_SECRET).",
      });
    }

    const { customerId, email } = req.body || {};
    let customer = null;

    // Prefer customerId if provided
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
router.post("/portal", createPortalSession); // optional alias

export default router;
