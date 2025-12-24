import Stripe from "stripe";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    const priceId = process.env.STRIPE_PRICE_ID;

    if (!stripeKey) {
      return NextResponse.json(
        { error: "Missing STRIPE_SECRET_KEY (set in Vercel env vars)" },
        { status: 500 }
      );
    }
    if (!priceId) {
      return NextResponse.json(
        { error: "Missing STRIPE_PRICE_ID (set in Vercel env vars)" },
        { status: 500 }
      );
    }

    const stripe = new Stripe(stripeKey, {
      apiVersion: "2024-06-20" as any,
    });

    const { customerId } = await req.json();
    if (!customerId) {
      return NextResponse.json({ error: "Missing customerId" }, { status: 400 });
    }

    const origin = req.headers.get("origin") || "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/matches/${customerId}?checkout=success`,
      cancel_url: `${origin}/matches/${customerId}?checkout=cancel`,
      metadata: { customerId: String(customerId) },
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Stripe checkout error" },
      { status: 500 }
    );
  }
}
