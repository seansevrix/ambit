"use client";

// app/page.tsx
import Link from "next/link";
import { useMemo, useState } from "react";
import ConciergeLeadCapture from "./components/ConciergeLeadCapture";
import ProofDashboard from "./components/ProofDashboard";

const LINK = "text-sm font-semibold text-white/75 hover:text-white transition";

const PRIMARY_CTA =
  "inline-flex items-center justify-center rounded-2xl px-6 py-3 text-sm font-semibold text-[#061017] shadow-[0_10px_40px_rgba(0,0,0,0.35)] transition hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-emerald-300/60 focus:ring-offset-0";

const SECONDARY_BTN =
  "inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white/80 hover:bg-white/10 hover:text-white transition";

const TOGGLE_BTN =
  "inline-flex items-center justify-center rounded-xl border px-4 py-2 text-sm font-semibold transition";

type IntentKey = "residential" | "commercial" | "government";

const INTENTS: Array<{
  key: IntentKey;
  label: string;
  short: string;
}> = [
  { key: "residential", label: "Residential", short: "Homeowner requests" },
  { key: "commercial", label: "Commercial", short: "Business work orders" },
  { key: "government", label: "Government", short: "Public bid opportunities" },
];

export default function HomePage() {
  const [intent, setIntent] = useState<IntentKey>("residential");

  const heroPill = useMemo(() => {
    if (intent === "commercial") return "Live commercial matches";
    if (intent === "government") return "Live government matches";
    return "Live residential matches";
  }, [intent]);

  const heroSubhead = useMemo(() => {
    return "Verified contracts delivered to your inbox daily. View current matches below.";
  }, []);

  const ctaHref = useMemo(() => {
    return `/get-started?intent=${encodeURIComponent(intent)}`;
  }, [intent]);

  return (
    <div className="min-h-screen bg-[#070B18] text-white">
      {/* Global background glow + subtle grid */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(900px_600px_at_20%_0%,rgba(26,79,163,0.25),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(800px_520px_at_80%_25%,rgba(52,211,153,0.16),transparent_55%)]" />
        <div className="absolute inset-0 opacity-[0.06] [background-image:linear-gradient(to_right,rgba(255,255,255,0.25)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.25)_1px,transparent_1px)] [background-size:72px_72px]" />
        <div className="absolute inset-0 bg-gradient-to-b from-white/[0.03] via-transparent to-transparent" />
      </div>

      <div className="mx-auto max-w-[1200px] px-6 py-10 lg:px-10">
        <div className="space-y-8 overflow-x-hidden sm:space-y-12">
          {/* HERO + GLASS PANEL */}
          <section className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-[0_10px_60px_rgba(0,0,0,0.35)] sm:rounded-3xl">
            {/* Hero gradient */}
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(1200px_600px_at_50%_-10%,rgba(110,168,255,0.28),transparent_60%)]" />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#08122B]/80 via-[#070F22]/75 to-[#060A16]/80" />
            <div className="pointer-events-none absolute inset-0 opacity-[0.05] [background-image:linear-gradient(to_right,rgba(255,255,255,0.18)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.18)_1px,transparent_1px)] [background-size:92px_92px]" />

            <div className="relative px-4 py-10 sm:px-10 sm:py-14">
              <div className="mx-auto max-w-5xl text-center">
                {/* Live pill */}
                <div className="mx-auto flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[11px] font-semibold text-white/80">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/60" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                  </span>
                  {heroPill}
                </div>

                {/* HERO HEADLINE */}
                <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-5xl">
                  Stop chasing leads. Start winning contracts.
                </h1>

                {/* Punchy subhead */}
                <p className="mt-3 text-sm text-white/70 sm:text-base">{heroSubhead}</p>

                {/* Intent selector */}
                <div className="mx-auto mt-6 flex w-full max-w-xl flex-col gap-2 sm:flex-row sm:justify-center">
                  {INTENTS.map((i) => {
                    const active = i.key === intent;
                    return (
                      <button
                        key={i.key}
                        type="button"
                        onClick={() => setIntent(i.key)}
                        className={[
                          TOGGLE_BTN,
                          active
                            ? "border-white/25 bg-white/10 text-white"
                            : "border-white/10 bg-white/5 text-white/70 hover:bg-white/8 hover:text-white",
                        ].join(" ")}
                        aria-pressed={active}
                      >
                        <span className="mr-2">{i.label}</span>
                        <span className="hidden text-xs font-semibold text-white/50 sm:inline">
                          {i.short}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* CTA row */}
                <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
                  <Link href={ctaHref} className={`${PRIMARY_CTA} bg-emerald-400`}>
                    See My Matches — It’s Free
                  </Link>

                  <Link href="/live-opportunities" className={LINK}>
                    View Live Leads →
                  </Link>
                </div>

                {/* Clean value stack (only the big hook) */}
                <p className="mt-3 text-xs text-white/65 sm:text-sm">
                  <span className="font-semibold text-white/85">7-day free trial</span>
                  <span className="mx-2 text-white/35">•</span>
                  No credit card required.
                </p>
              </div>

              {/* SIGNUP AREA */}
              <div id="preview" className="mx-auto mt-8 max-w-6xl sm:mt-10">
                <ConciergeLeadCapture />
              </div>

              {/* Second-wave social proof (moved down) */}
              <div className="mx-auto mt-5 max-w-6xl">
                <div className="flex flex-wrap items-center justify-center gap-2 text-[11px] font-semibold text-white/55">
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                    Trusted by 200+ clients
                  </span>
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                    Secure Data
                  </span>
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                    24/7 Support
                  </span>
                </div>
              </div>

              {/* PROOF DASHBOARD */}
              <div className="mx-auto mt-10 max-w-6xl sm:mt-12">
                <ProofDashboard />
              </div>

              {/* TESTIMONIALS */}
              <div className="mx-auto mt-10 max-w-6xl sm:mt-12">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <div className="inline-flex items-center rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold text-white/80">
                      TESTIMONIALS
                    </div>

                    <h2 className="mt-3 text-xl font-semibold tracking-tight text-white sm:text-2xl">
                      Real contractors. Real results.
                    </h2>

                    <p className="mt-2 max-w-2xl text-sm text-white/70">
                      Skimmable feedback from teams using AMBIT to find better-fit opportunities
                      faster.
                    </p>

                    <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-white/60">
                      <span>✓ Faster response times</span>
                      <span>✓ Cleaner summaries</span>
                      <span>✓ Better-fit opportunities</span>
                    </div>
                  </div>

                  <div className="flex">
                    <Link href="/testimonials" className={SECONDARY_BTN}>
                      See more reviews by trade →
                    </Link>
                  </div>
                </div>

                <div className="mt-6 grid gap-6 lg:mt-8 lg:grid-cols-3">
                  {/* SARAH */}
                  <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.03)_inset]">
                    <p className="text-sm leading-relaxed text-white/75">
                      <span className="text-white/40">“</span>
                      I sat on this for weeks because I’m a disaster with new tech and expected
                      setup to be a nightmare.
                      <strong className="font-semibold text-white">
                        {" "}
                        Fully up and running in under 5 minutes.
                      </strong>{" "}
                      I set our service area + NAICS, and matches started coming in immediately.
                      <span className="text-white/40">”</span>
                    </p>

                    <div className="mt-5 h-px w-full bg-white/10" />

                    <div className="mt-4">
                      <div className="text-sm font-semibold text-white">Sarah K.</div>
                      <div className="mt-1 text-xs text-white/65">Owner, Janitorial Company</div>
                      <div className="mt-2 inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold text-white/75">
                        Janitorial · Florida
                      </div>
                    </div>
                  </div>

                  {/* DAVID */}
                  <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.03)_inset]">
                    <p className="text-sm leading-relaxed text-white/75">
                      <span className="text-white/40">“</span>
                      We’ve tested a lot of tools, but AMBIT is the first one that actually scaled
                      with us.
                      <strong className="font-semibold text-white">
                        {" "}
                        We stopped wasting hours digging through portals.
                      </strong>{" "}
                      Daily matches are relevant and clearly summarized.
                      <span className="text-white/40">”</span>
                    </p>

                    <div className="mt-5 h-px w-full bg-white/10" />

                    <div className="mt-4">
                      <div className="text-sm font-semibold text-white">David Chen</div>
                      <div className="mt-1 text-xs text-white/65">Operations Director</div>
                      <div className="mt-2 inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold text-white/75">
                        Construction · Nevada
                      </div>
                    </div>
                  </div>

                  {/* MARK */}
                  <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.03)_inset]">
                    <p className="text-sm leading-relaxed text-white/75">
                      <span className="text-white/40">“</span>
                      What impressed me most was the accuracy.
                      <strong className="font-semibold text-white">
                        {" "}
                        It sends work we can actually bid and win.
                      </strong>{" "}
                      After tightening our NAICS + keywords, match quality jumped immediately.
                      <span className="text-white/40">”</span>
                    </p>

                    <div className="mt-5 h-px w-full bg-white/10" />

                    <div className="mt-4">
                      <div className="text-sm font-semibold text-white">Mark T.</div>
                      <div className="mt-1 text-xs text-white/65">Owner, Plumbing Company</div>
                      <div className="mt-2 inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold text-white/75">
                        Plumbing · California
                      </div>
                    </div>
                  </div>
                </div>

                <p className="mt-6 text-center text-xs text-white/45">
                  Testimonials are real feedback. Results vary by trade, service area, and response
                  time.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
