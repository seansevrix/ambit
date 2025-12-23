import express from "express";
import Stripe from "stripe";
import prisma from "../lib/prisma.js";

const router = express.Router();
router.get("/ping", (req, res) => res.json({ ok: true }));

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

router.post("/checkout-session", async (req, res) => {
  try {
    const { customerId } = req.body;

    if (!customerId) {
      return res.status(400).json({ error: "customerId is required" });
    }

    const id = Number(customerId);

    const customer = await prisma.customer.findUnique({
      where: { id },
    });

    if (!customer) {
      return res.status(404).json({ error: "Customer not found" });
    }

    // 1) Ensure a Stripe Customer exists
    let stripeCustomerId = customer.stripeCustomerId;

    if (!stripeCustomerId) {
      const sc = await stripe.customers.create({
        email: customer.email,
        name: customer.name,
        metadata: { customerId: String(customer.id) },
      });

      stripeCustomerId = sc.id;

      await prisma.customer.update({
        where: { id: customer.id },
        data: { stripeCustomerId },
      });
    }

    // 2) Create Checkout Session (IMPORTANT: metadata.customerId here)
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: stripeCustomerId,
      line_items: [{ price: process.env.STRIPE_PRICE_ID, quantity: 1 }],

      // ✅ THIS is what your webhook reads
      metadata: { customerId: String(customer.id) },

      // Optional but helpful (shows customer on Stripe side)
      client_reference_id: String(customer.id),

      success_url: `${process.env.APP_URL}/billing/success`,
      cancel_url: `${process.env.APP_URL}/billing/cancel`,
    });

    return res.json({ url: session.url, sessionId: session.id });
  } catch (err) {
    console.error("checkout-session error:", err);
    return res.status(500).json({ error: "Failed to create checkout session" });
  }
});

export default router;
