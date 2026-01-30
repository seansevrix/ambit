// app/get-started/page.tsx
import { Suspense } from "react";
import Link from "next/link";
import GetStartedClient from "./GetStartedClient";

const TRUST_BADGES = [
  "7-day free trial",
  "No credit card required",
  "$49.99/mo after trial",
  "Cancel anytime",
  "No spam",
];

function LoadingFallback() {
  return (
    <div className="h-[420px] flex items-center justify-center">
      <div className="w-full max-w-xl rounded-3xl border border-black/10 bg-white/70 backdrop-blur-md p-6 shadow-[0_24px_80px_rgba(0,0,0,0.10)]">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-2xl bg-black/5 flex items-center justify-center">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-black/20 border-t-black/60" />
          </div>

          <div className="min-w-0">
            <div className="text-black text-base font-semibold">
              Getting your setup ready…
            </div>
            <div className="text-black/60 text-sm mt-0.5">
              Loading your profile builder.
            </div>
          </div>
        </div>

        <div className="mt-5 h-2 w-full rounded-full bg-black/10 overflow-hidden">
          <div className="h-full w-[55%] bg-black/30" />
        </div>

        <div className="mt-4 text-xs text-black/50">
          One moment — this usually takes a second.
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <main className="min-h-screen text-black">
      {/* Base background tone (behind the site-wide grid) */}
      <div className="pointer-events-none fixed inset-0 -z-[90] bg-[#DEDEDE]" />

      {/* Soft depth (also behind grid) */}
      <div className="pointer-events-none fixed inset-0 -z-[80]">
        <div className="absolute inset-0 bg-[radial-gradient(900px_520px_at_50%_0%,rgba(92,116,255,0.16),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(700px_420px_at_85%_20%,rgba(52,211,153,0.10),transparent_55%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-white/[0.18] via-transparent to-transparent" />
      </div>

      <div className="mx-auto max-w-[1100px] px-6 py-14 lg:px-10">
        {/* Back link */}
        <Link href="/" className="text-sm text-black/60 hover:text-black">
          ← Back
        </Link>

        {/* Header */}
        <div className="mt-7">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-4xl font-black tracking-tight">
              Start getting matched opportunities today
            </h1>

            {/* Live pill */}
            <span className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/60 px-3 py-1 text-[11px] font-semibold text-black/70 backdrop-blur">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#5C74FF] opacity-30" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[#5C74FF]" />
              </span>
              Live setup
            </span>
          </div>

          <p className="mt-2 max-w-2xl text-black/65">
            Create your profile in about 60 seconds. We’ll deliver ranked matches daily across{" "}
            <span className="font-semibold text-black/80">
              Residential • Commercial • Government
            </span>
            .
          </p>

          {/* Trust bar */}
          <div className="mt-4 flex flex-wrap gap-2">
            {TRUST_BADGES.map((t) => (
              <span
                key={t}
                className="rounded-full border border-black/10 bg-white/60 px-3 py-1 text-xs text-black/70 backdrop-blur"
              >
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* Form container (landing-vibe glass card) */}
        <div className="mt-10 rounded-3xl border border-black/10 bg-white/70 backdrop-blur-md p-6 shadow-[0_24px_80px_rgba(0,0,0,0.12)] sm:p-8">
          <Suspense fallback={<LoadingFallback />}>
            <GetStartedClient />
          </Suspense>
        </div>

        <div className="mt-6 text-center text-xs text-black/45">
          Tip: Keywords are the “magic” — services, equipment, materials, and job types.
        </div>
      </div>
    </main>
  );
}
