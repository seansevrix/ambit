// backend/lib/stripe.js
import Stripe from "stripe";

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;

if (!STRIPE_SECRET_KEY) {
  console.warn("[stripe] STRIPE_SECRET_KEY is missing. Stripe routes will fail until it is set.");
}

const stripe = new Stripe(STRIPE_SECRET_KEY || "sk_test_missing_key", {
  apiVersion: "2024-06-20",
});

export default stripe;
