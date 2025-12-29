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
      // apiVersion optional; Stripe auto-selects. Keep if you want consistency:
      // apiVersion: "2024-06-20",
    })
  : null;

// Helper: pick frontend base URL (prod or local)
function getFrontendBaseUrl(req) {
  const isProd = process.env.NODE_ENV === "production";

  // In prod: require explicit env var (don’t trust Origin headers)
  const envUrl = process.env.FRONTEND_URL || process.env.NEXT_PUBLIC_FRONTEND_URL;
  if (envUrl) return envUrl.replace(/\/$/, "");

  if (isProd) {
    // Safer: block if missing (prevents open redirect via forged Origin)
    throw new Error("Missing FRONTEND_URL on backend env vars (required in production).");
  }

  // Dev fallback: request origin (OK locally)
  const origin = req.headers.origin;
  if (origin) return String(origin).replace(/\/$/, "");

  // Final dev fallback
  return "http://localhost:3000";
}

async function ensureStripeCustomer(customer) {
  if (!stripe) throw new Error("Stripe not configured.");

  // If we already have stripeCustomerId, we're good
  if (customer.stripeCustomerId) return customer.stripeCustomerId;

  // Create one
  const created = await stripe.customers.create({
    email: customer.email || undefined,
    name: customer.name || undefined,
    metadata: { customerId: String(customer.id) },
  });

  // Save to DB
  await prisma.customer.update({
    where: { id: customer.id },
    data: { stripeCustomerId: created.id },
  });

  return created.id;
}

/**
 * POST /engine/billing/create-checkout-session
 * Body: { customerId: number }
 * Returns: { ok: true, url: string }
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
      return res.status(500).json({
        ok: false,
        error: "Missing STRIPE_PRICE_ID on the backend env vars.",
      });
    }

    const { customerId } = req.body || {};
    const id = Number(customerId);

    if (!id || !Number.isFinite(id)) {
      return res.status(400).json({ ok: false, error: "customerId is required." });
    }

    const customer = await prisma.customer.findUnique({ where: { id } });

    if (!customer) {
      return res.status(404).json({ ok: false, error: "Customer not found." });
    }

    const stripeCustomerId = await ensureStripeCustomer(customer);
    const frontendBase = getFrontendBaseUrl(req);

    // Send them back to matches page on success/cancel
    const successUrl = `${frontendBase}/matches/${id}?checkout=success`;
    const cancelUrl = `${frontendBase}/matches/${id}?checkout=cancel`;

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: stripeCustomerId,
      line_items: [{ price: STRIPE_PRICE_ID, quantity: 1 }],

      success_url: successUrl,
      cancel_url: cancelUrl,

      // ✅ Critical: matches your webhook lookup
      metadata: { customerId: String(id) },
      client_reference_id: String(id),

      // ✅ Extra safety: put customerId on the subscription too
      subscription_data: {
        metadata: { customerId: String(id) },
      },

      allow_promotion_codes: true,
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

router.post("/create-checkout-session", createCheckoutSession);

// Optional alias: POST /engine/billing/checkout
router.post("/checkout", createCheckoutSession);

export default router;
