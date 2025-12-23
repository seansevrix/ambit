import express from "express";
import Stripe from "stripe";
import prisma from "../lib/prisma.js";

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

router.post(
  "/",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const sig = req.headers["stripe-signature"];

    let event;
    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error("❌ Webhook signature verification failed:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    console.log("✅ Webhook received:", event.type);

    try {
      if (event.type === "checkout.session.completed") {
        const session = event.data.object;

        const customerId = Number(session?.metadata?.customerId);
        const stripeCustomerId = session.customer;
        const stripeSubscriptionId = session.subscription;

        console.log("session.metadata.customerId =", customerId);
        console.log("session.subscription =", stripeSubscriptionId);

        if (!customerId) {
          console.log("⚠️ Missing metadata.customerId — cannot update DB");
          return res.json({ received: true });
        }

        await prisma.customer.update({
          where: { id: customerId },
          data: {
            stripeCustomerId: String(stripeCustomerId),
            stripeSubscriptionId: stripeSubscriptionId
              ? String(stripeSubscriptionId)
              : null,
            subscriptionStatus: "active",
            isActive: true,
          },
        });

        console.log("✅ Updated customer active:", customerId);
      }

      if (event.type === "customer.subscription.deleted") {
        const sub = event.data.object;

        await prisma.customer.updateMany({
          where: { stripeSubscriptionId: String(sub.id) },
          data: {
            subscriptionStatus: "canceled",
            isActive: false,
          },
        });

        console.log("🟡 Marked customer inactive (subscription deleted)");
      }

      return res.json({ received: true });
    } catch (err) {
      console.error("❌ Webhook handler error:", err);
      return res.status(500).json({ error: "Webhook handler failed" });
    }
  }
);

export default router;
