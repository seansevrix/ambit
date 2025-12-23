// proxy.ts (Next.js 16 replacement for middleware.ts)
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function proxy(req: NextRequest) {
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // If not logged in, send them to /login
  if (!token) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("callbackUrl", req.nextUrl.pathname + req.nextUrl.search);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

// Protect these routes
export const config = {
  matcher: ["/dashboard/:path*", "/winning-opportunities/:path*", "/profile/:path*"],
};
