import { NextResponse } from "next/server";

export const runtime = "nodejs"; // avoids edge weirdness if you use node libs

export async function GET(req: Request) {
  const incomingKey = req.headers.get("x-admin-key") || "";
  const adminKey = process.env.ADMIN_KEY;

  if (!adminKey || incomingKey !== adminKey) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // OPTION A (recommended): proxy to backend admin endpoint
  const backendUrl = process.env.BACKEND_URL; // e.g. https://ambit-xxxxx.onrender.com
  if (!backendUrl) {
    return NextResponse.json({ error: "Missing BACKEND_URL" }, { status: 500 });
  }

  const r = await fetch(`${backendUrl}/engine/admin/customers`, {
    headers: { "x-admin-key": adminKey },
    cache: "no-store",
  });

  const text = await r.text();
  return new NextResponse(text, {
    status: r.status,
    headers: {
      "content-type": r.headers.get("content-type") || "application/json",
    },
  });
}
