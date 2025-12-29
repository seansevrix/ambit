import express from "express";
import Stripe from "stripe";
import prisma from "../lib/prismaClient.js";

const router = express.Router();

const STRIPE_SECRET_KEY =
  process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET;

const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

const stripe = STRIPE_SECRET_KEY ? new Stripe(STRIPE_SECRET_KEY) : null;

function setIfDefined(obj, key, value) {
  if (value !== undefined && value !== null && value !== "") obj[key] = value;
}

function isActiveStatus(status) {
  return status === "active" || status === "trialing";
}

async function updateCustomerById(customerId, patch) {
  return prisma.customer.update({
    where: { id: customerId },
    data: patch,
  });
}

async function updateCustomerByStripeIds({ stripeCustomerId, stripeSubscriptionId }, patch) {
  // Try subscriptionId first (most specific), then fallback to customerId
  const where = stripeSubscriptionId
    ? { stripeSubscriptionId: String(stripeSubscriptionId) }
    : { stripeCustomerId: String(stripeCustomerId) };

  return prisma.customer.updateMany({
    where,
    data: patch,
  });
}

router.post(
  "/",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    if (!stripe) {
      console.error("❌ Stripe not configured: missing STRIPE_SECRET_KEY");
      return res.status(500).json({ ok: false, error: "Stripe not configured" });
    }
    if (!STRIPE_WEBHOOK_SECRET) {
      console.error("❌ Missing STRIPE_WEBHOOK_SECRET env var");
      return res
        .status(500)
        .json({ ok: false, error: "Missing STRIPE_WEBHOOK_SECRET" });
    }

    const sig = req.headers["stripe-signature"];
    if (!sig) {
      return res.status(400).json({ ok: false, error: "Missing stripe-signature header" });
    }

    let event;
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, STRIPE_WEBHOOK_SECRET);
    } catch (err) {
      console.error("❌ Webhook signature verification failed:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    console.log("✅ Stripe webhook received:", event.type);

    try {
      switch (event.type) {
        case "checkout.session.completed": {
          const session = event.data.object;

          const customerId = Number(session?.metadata?.customerId);
          const stripeCustomerId = session?.customer ? String(session.customer) : null;
          const stripeSubscriptionId = session?.subscription
            ? String(session.subscription)
            : null;

          // Status is more reliable from subscription object, but we can default safely.
          let status = "active";

          if (stripeSubscriptionId) {
            try {
              const sub = await stripe.subscriptions.retrieve(stripeSubscriptionId);
              if (sub?.status) status = sub.status;
            } catch (e) {
              console.warn("⚠️ Could not retrieve subscription to confirm status:", e?.message);
            }
          }

          const patch = {
            subscriptionStatus: status,
            isActive: isActiveStatus(status),
          };
          setIfDefined(patch, "stripeCustomerId", stripeCustomerId);
          setIfDefined(patch, "stripeSubscriptionId", stripeSubscriptionId);

          if (customerId) {
            await updateCustomerById(customerId, patch);
            console.log("✅ Updated customer from checkout.session.completed:", customerId);
          } else if (stripeCustomerId || stripeSubscriptionId) {
            await updateCustomerByStripeIds(
              { stripeCustomerId, stripeSubscriptionId },
              patch
            );
            console.log("✅ Updated customer from checkout.session.completed via stripe IDs");
          } else {
            console.log("⚠️ No customerId/stripe IDs on session — nothing to update");
          }

          break;
        }

        case "customer.subscription.created":
        case "customer.subscription.updated":
        case "customer.subscription.deleted": {
          const sub = event.data.object;

          const stripeCustomerId = sub?.customer ? String(sub.customer) : null;
          const stripeSubscriptionId = sub?.id ? String(sub.id) : null;

          // Stripe subscription status values include:
          // trialing, active, past_due, canceled, unpaid, incomplete, incomplete_expired, paused
          let status = sub?.status || "active";

          // If Stripe says "deleted" event, treat as canceled/inactive
          if (event.type === "customer.subscription.deleted") {
            status = "canceled";
          }

          const patch = {
            subscriptionStatus: status,
            isActive: isActiveStatus(status),
          };
          setIfDefined(patch, "stripeCustomerId", stripeCustomerId);
          setIfDefined(patch, "stripeSubscriptionId", stripeSubscriptionId);

          if (!stripeCustomerId && !stripeSubscriptionId) {
            console.log("⚠️ subscription event missing stripe IDs — skipping");
            break;
          }

          await updateCustomerByStripeIds({ stripeCustomerId, stripeSubscriptionId }, patch);

          console.log(
            `✅ Updated customer from ${event.type}: status=${status}, active=${patch.isActive}`
          );
          break;
        }

        // OPTIONAL: if you want to auto-mark as inactive on failed payments:
        // case "invoice.payment_failed": { ... break; }

        default:
          // Not needed for gating/unlocking
          break;
      }

      return res.json({ received: true });
    } catch (err) {
      console.error("❌ Webhook handler error:", err);
      return res.status(500).json({ ok: false, error: "Webhook handler failed" });
    }
  }
);

export default router;
