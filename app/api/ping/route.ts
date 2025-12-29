import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({
    ok: true,
    pong: true,
    ts: new Date().toISOString(),
  });
}
