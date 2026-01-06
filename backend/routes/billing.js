// backend/routes/billing.js
import express from "express";
import Stripe from "stripe";
import prisma from "../lib/prismaClient.js";

const router = express.Router();

// ---- Stripe setup ----
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET;
const STRIPE_PRICE_ID = process.env.STRIPE_PRICE_ID;

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
    if (!STRIPE_PRICE_ID) {
      return res.status(500).json({ ok: false, error: "Missing STRIPE_PRICE_ID on the backend env vars." });
    }

    const { customerId } = req.body || {};
    const id = Number(customerId);
    if (!id || !Number.isFinite(id)) {
      return res.status(400).json({ ok: false, error: "customerId is required." });
    }

    const customer = await prisma.customer.findUnique({ where: { id } });
    if (!customer) return res.status(404).json({ ok: false, error: "Customer not found." });

    const stripeCustomerId = await ensureStripeCustomer(customer);
    const frontendBase = getFrontendBaseUrl(req);

    const successUrl = `${frontendBase}/matches/${id}?checkout=success`;
    const cancelUrl = `${frontendBase}/matches/${id}?checkout=cancel`;

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: stripeCustomerId,
      line_items: [{ price: STRIPE_PRICE_ID, quantity: 1 }],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: { customerId: String(id) },
      client_reference_id: String(id),
      subscription_data: { metadata: { customerId: String(id) } },
      allow_promotion_codes: true,
    });

    return res.status(200).json({ ok: true, url: session.url });
  } catch (err) {
    console.error("Billing create-checkout-session error:", err);
    return res.status(500).json({ ok: false, error: err?.message || "Billing error creating checkout session." });
  }
}

/**
 * ✅ NEW
 * POST /engine/billing/create-portal-session
 * Body: { customerId?: number, email?: string }
 * Returns: { ok: true, url }
 *
 * This sends the user to Stripe’s Customer Portal where they can cancel.
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

    // Where Stripe sends them back after they cancel/update
    const returnUrl = `${frontendBase}/support?portal=return`;

    const session = await stripe.billingPortal.sessions.create({
      customer: stripeCustomerId,
      return_url: returnUrl,
    });

    return res.status(200).json({ ok: true, url: session.url });
  } catch (err) {
    console.error("Billing create-portal-session error:", err);
    return res.status(500).json({ ok: false, error: err?.message || "Billing error creating portal session." });
  }
}

router.post("/create-checkout-session", createCheckoutSession);
router.post("/checkout", createCheckoutSession);

// ✅ NEW route
router.post("/create-portal-session", createPortalSession);
router.post("/portal", createPortalSession); // optional alias

export default router;
