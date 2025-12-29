// backend/routes/stripeWebhook.js
import express from "express";
import Stripe from "stripe";
import prisma from "../lib/prismaClient.js";

const router = express.Router();

const STRIPE_SECRET_KEY =
  process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET;
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

const stripe = STRIPE_SECRET_KEY ? new Stripe(STRIPE_SECRET_KEY) : null;

function isActiveStatus(status) {
  return status === "active" || status === "trialing";
}

router.post("/", express.raw({ type: "application/json" }), async (req, res) => {
  // If env is missing, fail loudly (otherwise you’ll silently never unlock)
  if (!stripe) {
    console.error("❌ Missing STRIPE_SECRET_KEY / STRIPE_SECRET");
    return res.status(500).json({ ok: false, error: "Stripe not configured" });
  }
  if (!STRIPE_WEBHOOK_SECRET) {
    console.error("❌ Missing STRIPE_WEBHOOK_SECRET");
    return res
      .status(500)
      .json({ ok: false, error: "Webhook secret not configured" });
  }

  const sig = req.headers["stripe-signature"];

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("❌ Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  console.log("✅ Stripe webhook:", event.type);

  try {
    // 1) Checkout completed (initial subscription creation)
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;

      // customerId can come from metadata OR client_reference_id
      const customerId =
        Number(session?.metadata?.customerId) ||
        Number(session?.client_reference_id);

      const stripeCustomerId = session.customer ? String(session.customer) : null;
      const stripeSubscriptionId = session.subscription
        ? String(session.subscription)
        : null;

      if (!customerId) {
        console.log("⚠️ Missing customerId (metadata/client_reference_id).");
        return res.json({ received: true });
      }

      // Get real subscription status (active/trialing/past_due/etc)
      let status = "active";
      if (stripeSubscriptionId) {
        const sub = await stripe.subscriptions.retrieve(stripeSubscriptionId);
        status = sub?.status || status;
      }

      await prisma.customer.update({
        where: { id: customerId },
        data: {
          stripeCustomerId,
          stripeSubscriptionId,
          subscriptionStatus: status,
          isActive: isActiveStatus(status),
        },
      });

      console.log(
        `✅ Customer ${customerId} updated from checkout: status=${status}`
      );
    }

    // 2) Subscription updated (renewals, past_due, pause, etc)
    if (event.type === "customer.subscription.updated") {
      const sub = event.data.object;
      const stripeSubscriptionId = String(sub.id);
      const status = sub?.status || "active";

      await prisma.customer.updateMany({
        where: { stripeSubscriptionId },
        data: {
          subscriptionStatus: status,
          isActive: isActiveStatus(status),
        },
      });

      console.log(
        `🟦 Subscription updated: ${stripeSubscriptionId} status=${status}`
      );
    }

    // 3) Subscription cancelled/deleted
    if (event.type === "customer.subscription.deleted") {
      const sub = event.data.object;
      const stripeSubscriptionId = String(sub.id);

      await prisma.customer.updateMany({
        where: { stripeSubscriptionId },
        data: {
          subscriptionStatus: "canceled",
          isActive: false,
        },
      });

      console.log(`🟥 Subscription deleted: ${stripeSubscriptionId}`);
    }

    return res.json({ received: true });
  } catch (err) {
    console.error("❌ Webhook handler error:", err);
    return res
      .status(500)
      .json({ ok: false, error: err?.message || "Webhook handler failed" });
  }
});

export default router;
