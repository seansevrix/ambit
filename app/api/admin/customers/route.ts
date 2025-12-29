import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function cleanBaseUrl(url: string) {
  return url.replace(/\/+$/, "");
}

export async function GET() {
  const base =
    process.env.NEXT_PUBLIC_API_BASE_URL || process.env.API_BASE_URL || "";

  const adminKey = process.env.ADMIN_API_KEY || "";

  if (!base) {
    return NextResponse.json(
      { error: "Missing API base URL env var (NEXT_PUBLIC_API_BASE_URL or API_BASE_URL)." },
      { status: 500 }
    );
  }

  if (!adminKey) {
    return NextResponse.json(
      { error: "Missing ADMIN_API_KEY env var on Vercel." },
      { status: 500 }
    );
  }

  const cleanBase = cleanBaseUrl(base);

  // Try the “admin protected” endpoint first, then fall back if your backend uses a different path.
  const candidates = [
    `${cleanBase}/engine/admin/customers`,
    `${cleanBase}/engine/customers`,
  ];

  let lastStatus = 500;
  let lastText = "";

  for (const url of candidates) {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        "accept": "application/json",
        "x-admin-api-key": adminKey, // <-- matches your Render ADMIN_API_KEY pattern
      },
      cache: "no-store",
    });

    lastStatus = res.status;
    lastText = await res.text();

    // If it’s not a 404, we found the right endpoint (even if it’s 401/500).
    if (res.status !== 404) {
      return new NextResponse(lastText, {
        status: res.status,
        headers: {
          "content-type": res.headers.get("content-type") || "application/json",
        },
      });
    }
  }

  // Both candidates were 404
  return NextResponse.json(
    {
      error: "Backend customers endpoint not found (both /engine/admin/customers and /engine/customers returned 404).",
      tried: candidates,
      lastStatus,
      lastText: lastText?.slice(0, 300),
    },
    { status: 404 }
  );
}
