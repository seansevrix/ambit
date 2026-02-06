// app/get-started/page.tsx
import { Suspense } from "react";
import Link from "next/link";
import GetStartedClient from "./GetStartedClient";

const TRUST_BADGES = [
  "7-day free trial",
  "No credit card required",
  "$49.99/mo",
  "$299/mo - Ambit Prime",
];

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden="true">
      <path
        d="M7.5 10.2V8.6a4.5 4.5 0 0 1 9 0v1.6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M6.8 10.2h10.4c.9 0 1.6.7 1.6 1.6v7.6c0 .9-.7 1.6-1.6 1.6H6.8c-.9 0-1.6-.7-1.6-1.6v-7.6c0-.9.7-1.6 1.6-1.6Z"
        stroke="currentColor"
        strokeWidth="2"
      />
    </svg>
  );
}

function LoadingFallback() {
  return (
    <div className="h-[360px] flex items-center justify-center">
      <div className="w-full max-w-xl rounded-3xl border border-black/10 bg-white/75 backdrop-blur-md p-6 shadow-[0_24px_80px_rgba(0,0,0,0.10)]">
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

function Step({
  n,
  title,
  desc,
}: {
  n: number;
  title: string;
  desc: string;
}) {
  return (
    <div className="flex gap-3">
      <div className="mt-0.5 h-7 w-7 shrink-0 rounded-full bg-black/5 flex items-center justify-center text-[11px] font-black text-black/70">
        {n}
      </div>
      <div>
        <div className="font-semibold text-black/85">{title}</div>
        <div className="text-black/60 text-sm">{desc}</div>
      </div>
    </div>
  );
}

function MicroTrustRow() {
  const items = [
    { k: "No credit card", v: "required" },
    { k: "Setup time", v: "~60 seconds" },
    { k: "Edit anytime", v: "keywords + NAICS" },
  ];

  return (
    <div className="mt-6 rounded-3xl border border-black/10 bg-white/70 backdrop-blur-md px-5 py-4 shadow-[0_18px_55px_rgba(0,0,0,0.08)]">
      <div className="grid gap-3 sm:grid-cols-3">
        {items.map((x) => (
          <div key={x.k} className="flex items-center gap-3">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-2xl bg-black/5">
              <span className="h-2 w-2 rounded-full bg-[#1A4FA3]" />
            </span>
            <div className="leading-tight">
              <div className="text-xs font-semibold text-black/55">{x.k}</div>
              <div className="text-sm font-black text-black/80">{x.v}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <main className="min-h-screen text-black">
      {/* Base tone */}
      <div className="pointer-events-none fixed inset-0 -z-[90] bg-[#DEDEDE]" />

      {/* Blueprint grid (minor + major) */}
      <div className="pointer-events-none fixed inset-0 -z-[85]">
        <div className="absolute inset-0 opacity-[0.10] [background-image:linear-gradient(to_right,rgba(0,0,0,0.14)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.14)_1px,transparent_1px)] [background-size:72px_72px]" />
        <div className="absolute inset-0 opacity-[0.06] [background-image:linear-gradient(to_right,rgba(0,0,0,0.20)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.20)_1px,transparent_1px)] [background-size:360px_360px]" />
      </div>

      {/* Soft depth */}
      <div className="pointer-events-none fixed inset-0 -z-[80]">
        <div className="absolute inset-0 bg-[radial-gradient(900px_520px_at_50%_0%,rgba(92,116,255,0.16),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(700px_420px_at_85%_20%,rgba(52,211,153,0.10),transparent_55%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-white/[0.18] via-transparent to-transparent" />
      </div>

      <div className="mx-auto max-w-[980px] px-6 py-12 lg:px-10">
        {/* Top row */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="text-sm font-semibold text-black/60 hover:text-black"
          >
            ← Back
          </Link>

          <span className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/60 px-3 py-1 text-[11px] font-semibold text-black/70 backdrop-blur">
            <span className="text-black/70">
              <LockIcon />
            </span>
            Secure signup
          </span>
        </div>

        {/* Header */}
        <div className="mt-8">
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight">
            Start getting matched opportunities today
          </h1>

          <p className="mt-3 max-w-2xl text-black/65">
            Create your profile in about 60 seconds. We’ll deliver ranked matches
            daily across{" "}
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
                className="rounded-full border border-black/10 bg-white/60 px-3 py-1 text-xs font-semibold text-black/70 backdrop-blur"
              >
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* SIGNUP CARD */}
        <div className="mt-10 rounded-3xl border border-black/10 bg-white/75 backdrop-blur-md shadow-[0_24px_80px_rgba(0,0,0,0.12)]">
          <div className="flex items-center justify-between border-b border-black/10 px-6 py-5 sm:px-8">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-black/5 flex items-center justify-center font-black">
                A
              </div>
              <div>
                <div className="text-sm font-black">AMBIT</div>
                <div className="text-xs text-black/55">Secure signup • Encrypted</div>
              </div>
            </div>

            <span className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/60 px-3 py-1 text-[11px] font-semibold text-black/70 backdrop-blur">
              <span className="text-black/70">
                <LockIcon />
              </span>
              No credit card required
            </span>
          </div>

          <div className="px-6 py-6 sm:px-8 sm:py-8">
            <Suspense fallback={<LoadingFallback />}>
              <GetStartedClient />
            </Suspense>
          </div>
        </div>

        {/* BELOW */}
        <div className="mt-8 space-y-4">
          {/* What happens next */}
          <div className="rounded-3xl border border-black/10 bg-white/70 backdrop-blur-md p-6 shadow-[0_18px_55px_rgba(0,0,0,0.10)]">
            <div className="text-lg font-black">What happens next</div>

            <div className="mt-4 space-y-4">
              <Step
                n={1}
                title="We build your profile"
                desc="Service area + keywords + NAICS → match accuracy."
              />
              <Step
                n={2}
                title="Matches email daily"
                desc="Ranked opportunities delivered every morning."
              />
              <Step
                n={3}
                title="You get the winning plan"
                desc="Reply to connect with an AMBIT associate for strategy."
              />
            </div>

            <div className="mt-5 rounded-2xl border border-black/10 bg-white/70 p-4 text-sm text-black/60">
              <span className="font-semibold text-black/75">Privacy:</span> AMBIT
              uses your profile only to match and deliver opportunities. No spam.
            </div>
          </div>

          {/* Perfect for */}
          <div className="rounded-3xl border border-black/10 bg-white/70 backdrop-blur-md p-6 shadow-[0_18px_55px_rgba(0,0,0,0.10)]">
            <div className="text-lg font-black">Perfect for</div>

            <div className="mt-4 flex flex-wrap gap-2">
              {["Landscaping", "HVAC", "Plumbing", "Junk removal", "Concrete", "Janitorial"].map(
                (t) => (
                  <span
                    key={t}
                    className="rounded-full border border-black/10 bg-white/70 px-3 py-1 text-xs font-semibold text-black/70 shadow-sm transition hover:-translate-y-[1px] hover:bg-white"
                  >
                    {t}
                  </span>
                )
              )}
            </div>

            <div className="mt-4 text-sm text-black/55">
              You can update keywords/NAICS anytime to refine matches.
            </div>

            <div className="mt-3 text-xs text-black/50">
              Popular keywords:{" "}
              <span className="font-semibold text-black/60">
                emergency, preventive maintenance, install, repair, demo, cleanup
              </span>
            </div>
          </div>
        </div>

        {/* Replace the lonely tip with a clean micro-trust row */}
        <MicroTrustRow />
      </div>
    </main>
  );
}
