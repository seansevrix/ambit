import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const incomingKey = req.headers.get("x-admin-key") || "";
  const adminKey = process.env.ADMIN_KEY || "";

  // If ADMIN_KEY isn't set on Vercel yet, this makes it obvious
  if (!adminKey) {
    return NextResponse.json({ error: "Missing ADMIN_KEY on server" }, { status: 500 });
  }

  if (incomingKey !== adminKey) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // "Proof of life" response
  return NextResponse.json({ ok: true, route: "/api/admin/customers" }, { status: 200 });
}
