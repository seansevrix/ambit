import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const incomingKey = req.headers.get("x-admin-key") || "";
  const adminKey = process.env.ADMIN_KEY || "";
  const backendUrl = process.env.BACKEND_URL || "";

  if (!adminKey) {
    return NextResponse.json({ error: "Missing ADMIN_KEY on server" }, { status: 500 });
  }
  if (!backendUrl) {
    return NextResponse.json({ error: "Missing BACKEND_URL on server" }, { status: 500 });
  }
  if (incomingKey !== adminKey) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // ✅ Your real backend endpoint
  const r = await fetch(`${backendUrl}/engine/customers`, {
    headers: { "x-admin-key": adminKey },
    cache: "no-store",
  });

  const text = await r.text();

  return new Response(text, {
    status: r.status,
    headers: {
      "content-type": r.headers.get("content-type") || "application/json",
    },
  });
}
