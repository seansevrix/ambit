import Stripe from "stripe";
import { NextResponse } from "next/server";

export const runtime = "nodejs"; // IMPORTANT for Stripe (Node runtime)

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  // If TS still complains about apiVersion, either remove this line or keep the "as any"
  apiVersion: "2024-06-20" as any,
});

export async function POST(req: Request) {
  const { customerId } = await req.json();

  if (!customerId) {
    return NextResponse.json({ error: "Missing customerId" }, { status: 400 });
  }

  const origin = req.headers.get("origin") || "http://localhost:3000";

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: process.env.STRIPE_PRICE_ID!, quantity: 1 }],
    success_url: `${origin}/matches/${customerId}?checkout=success`,
    cancel_url: `${origin}/matches/${customerId}?checkout=cancel`,
    metadata: { customerId: String(customerId) },
  });

  return NextResponse.json({ url: session.url });
}
