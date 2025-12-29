// app/api/admin/customers/route.ts
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const adminKey =
    req.headers.get("x-admin-key") ||
    req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");

  if (!adminKey || adminKey !== process.env.ADMIN_API_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!baseUrl) {
    return NextResponse.json(
      { error: "Missing NEXT_PUBLIC_API_BASE_URL in env" },
      { status: 500 }
    );
  }

  try {
    const upstream = await fetch(`${baseUrl}/engine/customers`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-admin-key": adminKey, // pass through to backend if it checks this
      },
      cache: "no-store",
    });

    const text = await upstream.text();

    return new NextResponse(text, {
      status: upstream.status,
      headers: {
        "content-type": upstream.headers.get("content-type") ?? "application/json",
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Upstream fetch failed", detail: err?.message ?? String(err) },
      { status: 502 }
    );
  }
}
