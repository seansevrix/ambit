import Stripe from "stripe";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

function getOrigin(req: Request) {
  // Works on Vercel/proxies + local dev
  const proto = req.headers.get("x-forwarded-proto") ?? "http";
  const host =
    req.headers.get("x-forwarded-host") ??
    req.headers.get("host") ??
    "localhost:3000";
  return `${proto}://${host}`;
}

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

    const body = await req.json().catch(() => ({}));
    const customerId = body?.customerId;

    if (!customerId) {
      return NextResponse.json({ error: "Missing customerId" }, { status: 400 });
    }

    const stripe = new Stripe(stripeKey, {
      apiVersion: "2024-06-20" as any,
    });

    const origin = req.headers.get("origin") ?? getOrigin(req);

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
