// app/get-started/page.tsx
import { Suspense } from "react";
import Link from "next/link";
import GetStartedClient from "./GetStartedClient";

const TRUST_BADGES = [
  "7-day free trial",
  "No credit card required",
  "Cancel anytime",
  "No spam",
];

export default function Page() {
  return (
    <div className="min-h-screen bg-[#070B18] text-white">
      {/* Background glow + subtle grid (matches Pricing) */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(900px_600px_at_20%_0%,rgba(26,79,163,0.25),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(800px_520px_at_80%_25%,rgba(52,211,153,0.16),transparent_55%)]" />
        <div className="absolute inset-0 opacity-[0.06] [background-image:linear-gradient(to_right,rgba(255,255,255,0.25)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.25)_1px,transparent_1px)] [background-size:72px_72px]" />
        <div className="absolute inset-0 bg-gradient-to-b from-white/[0.03] via-transparent to-transparent" />
      </div>

      <div className="mx-auto max-w-[1200px] px-6 py-14 lg:px-10">
        {/* Back link */}
        <Link href="/" className="text-sm text-white/70 hover:text-white">
          ← Back
        </Link>

        {/* Header */}
        <div className="mt-6 flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <h1 className="text-4xl font-semibold tracking-tight">
              Get started
            </h1>

            {/* Live pill */}
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[11px] font-semibold text-white/80">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>
              Live setup
            </span>
          </div>

          <p className="max-w-2xl text-white/70">
            Create your profile once. AMBIT delivers matched opportunities daily.
          </p>

          {/* Trust bar */}
          <div className="flex flex-wrap gap-2">
            {TRUST_BADGES.map((t) => (
              <span
                key={t}
                className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/80"
              >
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* Form container */}
        <div className="mt-10 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_10px_60px_rgba(0,0,0,0.35)]">
          <Suspense fallback={<div className="h-[420px]" />}>
            <GetStartedClient />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
