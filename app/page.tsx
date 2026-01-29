"use client";

// app/page.tsx
import Link from "next/link";
import { useMemo, useState } from "react";
import ConciergeLeadCapture from "./components/ConciergeLeadCapture";
import ProofDashboard from "./components/ProofDashboard";

type IntentKey = "residential" | "commercial" | "government";

const INTENTS: Array<{ key: IntentKey; label: string }> = [
  { key: "residential", label: "Residential" },
  { key: "commercial", label: "Commercial" },
  { key: "government", label: "Government" },
];

function intentPill(intent: IntentKey) {
  if (intent === "commercial") return "Commercial";
  if (intent === "government") return "Government";
  return "Residential";
}

function intentSub(intent: IntentKey) {
  if (intent === "commercial")
    return "Work orders + service contracts ranked for your team, delivered daily.";
  if (intent === "government")
    return "Public bid opportunities matched to your service area, ranked by fit.";
  return "Verified homeowner requests matched to your service area, ranked by fit.";
}

type TestimonialItem = {
  hook: string;
  quote: string;
  name: string;
  title: string;
  tag: string;
};

function intentTestimonials(intent: IntentKey): {
  header: string;
  sub: string;
  items: TestimonialItem[];
} {
  if (intent === "commercial") {
    return {
      header: "Commercial teams move faster with AMBIT.",
      sub:
        "Relevant work orders and service contracts—ranked and summarized so you don’t waste hours digging.",
      items: [
        {
          hook: "We stopped wasting hours digging through portals.",
          quote:
            "AMBIT surfaces the jobs that actually match our scope—daily. The summaries make triage easy, and the team moves faster.",
          name: "David C.",
          title: "Operations Director",
          tag: "Construction · Nevada",
        },
        {
          hook: "It filters the noise and highlights what matters.",
          quote:
            "The leads are relevant, and the writeups are clean. It feels like having a coordinator who screens the inbox for us.",
          name: "Ariana M.",
          title: "Facilities Manager",
          tag: "Facilities · Arizona",
        },
        {
          hook: "Match quality jumped immediately.",
          quote:
            "We tightened keywords and saw better-fit opportunities the same week. It’s been a consistent pipeline builder for our service team.",
          name: "Jordan S.",
          title: "Owner",
          tag: "HVAC · Texas",
        },
      ],
    };
  }

  if (intent === "government") {
    return {
      header: "Government bids that feel reachable.",
      sub:
        "Get public opportunities that fit your service area—ranked so you know where to spend time.",
      items: [
        {
          hook: "We submit more because we’re not guessing.",
          quote:
            "The summary tells us what it is, why it fits, and what to do next—so we spend time only where we have a real shot.",
          name: "Marcus L.",
          title: "Small Business Owner",
          tag: "Gov Contracting · Florida",
        },
        {
          hook: "Smaller, winnable bids changed everything.",
          quote:
            "AMBIT helped us find opportunities that match our size and capacity instead of giant projects we’d never pursue.",
          name: "Priya K.",
          title: "Founder",
          tag: "Services · Virginia",
        },
        {
          hook: "Triage is finally easy.",
          quote:
            "The match score + summary makes it obvious what to open first. It’s the first tool that doesn’t overwhelm our team.",
          name: "Ethan R.",
          title: "Estimator",
          tag: "Trades · California",
        },
      ],
    };
  }

  return {
    header: "Residential leads you can actually close.",
    sub: "Verified homeowner requests—ranked by fit so you can respond faster and win more.",
    items: [
      {
        hook: "Fully up and running in under 5 minutes.",
        quote:
          "I expected setup to be a nightmare. A few minutes later I was seeing real homeowner requests that matched our services.",
        name: "Sarah K.",
        title: "Owner",
        tag: "Janitorial · Florida",
      },
      {
        hook: "Less scrolling, more jobs booked.",
        quote:
          "We reply faster now because the leads come in clean and organized. It’s been a noticeable win for our team.",
        name: "Mark T.",
        title: "Owner",
        tag: "Plumbing · California",
      },
      {
        hook: "It screens requests for us.",
        quote:
          "The match score is surprisingly accurate. It feels like having a front desk that filters the noise before we see it.",
        name: "Tanya W.",
        title: "Office Manager",
        tag: "Home Services · Colorado",
      },
    ],
  };
}

/** Light “Malakye-ish” theme tokens */
const PAGE_BG = "min-h-screen bg-[#F6FAFF] text-[#0B1325]";
const CONTAINER = "mx-auto max-w-[1180px] px-6 lg:px-10";

const CARD =
  "rounded-3xl border border-[#0B1325]/10 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.08)]";

const SOFT_CARD =
  "rounded-3xl border border-[#0B1325]/10 bg-white/70 backdrop-blur shadow-[0_18px_50px_rgba(15,23,42,0.06)]";

const PILL =
  "inline-flex items-center rounded-full border border-[#0B1325]/10 bg-white px-3 py-1 text-[11px] font-semibold text-[#0B1325]/70";

const PRIMARY_BTN =
  "inline-flex items-center justify-center rounded-full bg-[#63A7FF] px-6 py-3 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(99,167,255,0.35)] transition hover:bg-[#3E8CFF] focus:outline-none focus:ring-2 focus:ring-[#63A7FF]/35";

const SECONDARY_BTN =
  "inline-flex items-center justify-center rounded-full border border-[#0B1325]/15 bg-white px-6 py-3 text-sm font-semibold text-[#0B1325] transition hover:bg-[#0B1325]/[0.03]";

const LINK =
  "text-sm font-semibold text-[#0B1325]/70 hover:text-[#0B1325] transition underline underline-offset-4 decoration-[#0B1325]/20 hover:decoration-[#0B1325]/40";

export default function HomePage() {
  const [intent, setIntent] = useState<IntentKey>("residential");

  // IMPORTANT: your GetStartedClient currently reads `market=`, not `intent=`
  const ctaHref = useMemo(() => {
    return `/get-started?market=${encodeURIComponent(intent)}`;
  }, [intent]);

  const t = useMemo(() => intentTestimonials(intent), [intent]);

  return (
    <div className={PAGE_BG}>
      {/* Light background (baby-blue glow) */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(900px_600px_at_20%_0%,rgba(99,167,255,0.25),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(900px_600px_at_85%_15%,rgba(16,185,129,0.10),transparent_55%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-white via-[#F6FAFF] to-[#EEF5FF]" />
      </div>

      <div className={`${CONTAINER} py-10`}>
        {/* HERO (Malakye-style: split, simple, scannable) */}
        <section className={`${CARD} overflow-hidden`}>
          <div className="relative">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(900px_600px_at_10%_0%,rgba(99,167,255,0.18),transparent_55%)]" />
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(900px_600px_at_90%_25%,rgba(99,167,255,0.10),transparent_55%)]" />
            <div className="relative grid gap-10 px-6 py-10 lg:grid-cols-2 lg:gap-12 lg:px-10 lg:py-14">
              {/* Left: copy */}
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className={PILL}>Live</span>
                  <span className={PILL}>No credit card required</span>
                  <span className={PILL}>7-day free trial</span>
                </div>

                <h1 className="mt-4 text-4xl font-semibold tracking-tight text-[#0B1325] sm:text-5xl">
                  Stop chasing leads.
                  <br className="hidden sm:block" />
                  Start winning contracts.
                </h1>

                <p className="mt-3 max-w-xl text-base leading-relaxed text-[#0B1325]/70">
                  AMBIT finds, ranks, and delivers high-intent opportunities in your area — across{" "}
                  <span className="font-semibold text-[#0B1325]/85">
                    Residential • Commercial • Government
                  </span>
                  .
                </p>

                {/* Segmented control (friendly, Malakye-ish) */}
                <div className="mt-6 inline-flex flex-wrap gap-2 rounded-full border border-[#0B1325]/10 bg-white p-1">
                  {INTENTS.map((i) => {
                    const active = i.key === intent;
                    return (
                      <button
                        key={i.key}
                        type="button"
                        onClick={() => setIntent(i.key)}
                        className={[
                          "rounded-full px-4 py-2 text-sm font-semibold transition",
                          active
                            ? "bg-[#0B1325] text-white shadow-sm"
                            : "text-[#0B1325]/70 hover:text-[#0B1325] hover:bg-[#0B1325]/[0.04]",
                        ].join(" ")}
                        aria-pressed={active}
                      >
                        {i.label}
                      </button>
                    );
                  })}
                </div>

                <p className="mt-3 text-sm text-[#0B1325]/65">
                  <span className="font-semibold text-[#0B1325]/85">
                    {intentPill(intent)}:
                  </span>{" "}
                  {intentSub(intent)}
                </p>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <Link href={ctaHref} className={PRIMARY_BTN}>
                    Get 3 free matches
                  </Link>

                  <Link href="/testimonials" className={SECONDARY_BTN}>
                    Read reviews
                  </Link>
                </div>

                <div className="mt-3 text-xs text-[#0B1325]/55">
                  No spam • Cancel anytime • Your data stays private
                </div>

                {/* Trust strip (no fake numbers) */}
                <div className="mt-7 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl border border-[#0B1325]/10 bg-white px-4 py-3">
                    <div className="text-xs font-semibold text-[#0B1325]/55">Daily delivery</div>
                    <div className="mt-1 text-sm font-semibold text-[#0B1325]">
                      Ranked matches sent daily
                    </div>
                  </div>
                  <div className="rounded-2xl border border-[#0B1325]/10 bg-white px-4 py-3">
                    <div className="text-xs font-semibold text-[#0B1325]/55">Clean summaries</div>
                    <div className="mt-1 text-sm font-semibold text-[#0B1325]">
                      Know what to open first
                    </div>
                  </div>
                  <div className="rounded-2xl border border-[#0B1325]/10 bg-white px-4 py-3">
                    <div className="text-xs font-semibold text-[#0B1325]/55">3 markets</div>
                    <div className="mt-1 text-sm font-semibold text-[#0B1325]">
                      Residential • Commercial • Gov
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: interactive preview (your existing component) */}
              <div className="lg:pt-2">
                <div className="rounded-3xl border border-[#0B1325]/10 bg-white p-4 shadow-[0_18px_45px_rgba(15,23,42,0.08)] sm:p-5">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-semibold text-[#0B1325]">Preview your matches</div>
                    <div className="text-xs text-[#0B1325]/55">Takes ~60 seconds</div>
                  </div>
                  <div className="mt-1 text-xs text-[#0B1325]/60">
                    Enter your service area + keywords to see what AMBIT finds.
                  </div>

                  <div className="mt-4">
                    <ConciergeLeadCapture intent={intent} />
                  </div>
                </div>

                <div className="mt-4 text-center text-xs text-[#0B1325]/55">
                  No credit card • No spam • Cancel anytime
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS (Malakye-style “simple steps”) */}
        <section className="mt-10">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className={PILL}>HOW IT WORKS</div>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight text-[#0B1325]">
                Getting started is simple.
              </h2>
              <p className="mt-2 max-w-2xl text-sm text-[#0B1325]/70">
                No complicated setup. Just your service area + keywords — and we start delivering
                matches.
              </p>
            </div>

            <Link href={ctaHref} className={LINK}>
              Start free →
            </Link>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-3">
            <div className={SOFT_CARD + " p-6"}>
              <div className="text-xs font-semibold text-[#0B1325]/55">STEP 1</div>
              <div className="mt-2 text-lg font-semibold text-[#0B1325]">
                Tell us your service area
              </div>
              <div className="mt-2 text-sm text-[#0B1325]/70">
                City + state (or nationwide). We focus your feed on what matters to you.
              </div>
            </div>

            <div className={SOFT_CARD + " p-6"}>
              <div className="text-xs font-semibold text-[#0B1325]/55">STEP 2</div>
              <div className="mt-2 text-lg font-semibold text-[#0B1325]">
                Add keywords (your scope)
              </div>
              <div className="mt-2 text-sm text-[#0B1325]/70">
                Services, equipment, materials, job types — the “magic” for better matches.
              </div>
            </div>

            <div className={SOFT_CARD + " p-6"}>
              <div className="text-xs font-semibold text-[#0B1325]/55">STEP 3</div>
              <div className="mt-2 text-lg font-semibold text-[#0B1325]">
                Get ranked matches daily
              </div>
              <div className="mt-2 text-sm text-[#0B1325]/70">
                Open the best first. Respond faster. Win more.
              </div>
            </div>
          </div>
        </section>

        {/* PROOF (your existing dashboard, now framed in light UI) */}
        <section className="mt-10">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className={PILL}>LIVE PROOF</div>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight text-[#0B1325]">
                See what AMBIT is finding right now.
              </h2>
              <p className="mt-2 max-w-2xl text-sm text-[#0B1325]/70">
                Real activity and momentum — the dashboard makes it easy to understand what’s worth
                your time.
              </p>
            </div>
          </div>

          <div className={`${CARD} mt-6 p-4 sm:p-6`}>
            <ProofDashboard intent={intent} />
          </div>
        </section>

        {/* FEATURES (Malakye-style cards) */}
        <section className="mt-10">
          <div className={PILL}>WHY AMBIT</div>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-[#0B1325]">
            Built for speed, clarity, and wins.
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-[#0B1325]/70">
            No more portal fatigue. No more missed opportunities. Just a clean ranked feed.
          </p>

          <div className="mt-6 grid gap-6 lg:grid-cols-3">
            <div className={SOFT_CARD + " p-6"}>
              <div className="text-sm font-semibold text-[#0B1325]">High-intent matches</div>
              <div className="mt-2 text-sm text-[#0B1325]/70">
                Focus on opportunities that actually fit your scope and area.
              </div>
            </div>
            <div className={SOFT_CARD + " p-6"}>
              <div className="text-sm font-semibold text-[#0B1325]">Ranked + summarized</div>
              <div className="mt-2 text-sm text-[#0B1325]/70">
                Quickly see what it is and why it’s a fit — open the best first.
              </div>
            </div>
            <div className={SOFT_CARD + " p-6"}>
              <div className="text-sm font-semibold text-[#0B1325]">All markets, one place</div>
              <div className="mt-2 text-sm text-[#0B1325]/70">
                Residential, commercial, and government — without juggling tabs.
              </div>
            </div>
          </div>
        </section>

        {/* TESTIMONIALS (light, Malakye-ish grid) */}
        <section className="mt-10">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className={PILL}>TESTIMONIALS</div>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight text-[#0B1325]">
                {t.header}
              </h2>
              <p className="mt-2 max-w-2xl text-sm text-[#0B1325]/70">{t.sub}</p>
            </div>

            <Link href="/testimonials" className={LINK}>
              See more reviews →
            </Link>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-3">
            {t.items.map((x) => (
              <div key={x.name} className={SOFT_CARD + " p-6"}>
                <div className="text-sm leading-relaxed text-[#0B1325]/75">
                  <span className="text-[#0B1325]/35">“</span>
                  <strong className="font-semibold text-[#0B1325]">{x.hook}</strong>{" "}
                  {x.quote}
                  <span className="text-[#0B1325]/35">”</span>
                </div>

                <div className="mt-5 h-px w-full bg-[#0B1325]/10" />

                <div className="mt-4">
                  <div className="text-sm font-semibold text-[#0B1325]">{x.name}</div>
                  <div className="mt-1 text-xs text-[#0B1325]/60">{x.title}</div>
                  <div className="mt-2 inline-flex items-center rounded-full border border-[#0B1325]/10 bg-white px-3 py-1 text-[11px] font-semibold text-[#0B1325]/70">
                    {x.tag}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <p className="mt-6 text-center text-xs text-[#0B1325]/45">
            Testimonials are real feedback. Results vary by trade, service area, and response time.
          </p>
        </section>

        {/* PRICING (simple single-card like Malakye) */}
        <section className="mt-10">
          <div className="text-center">
            <div className="mx-auto w-fit " />
            <div className={PILL}>PRICING</div>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-[#0B1325]">
              One plan. All markets.
            </h2>
            <p className="mt-2 text-sm text-[#0B1325]/70">
              Start free. Keep it only if it’s worth it.
            </p>
          </div>

          <div className={`${CARD} mx-auto mt-6 max-w-2xl p-6 sm:p-8`}>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="text-sm font-semibold text-[#0B1325]">AMBIT All-Markets</div>
                <div className="mt-2 text-4xl font-semibold text-[#0B1325]">$49.99</div>
                <div className="mt-1 text-sm text-[#0B1325]/60">per month after your free trial</div>
              </div>
              <Link href={ctaHref} className={PRIMARY_BTN}>
                Start free
              </Link>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {[
                "7-day free trial",
                "No credit card required",
                "Daily ranked matches",
                "Residential • Commercial • Government",
                "Cancel anytime",
                "No spam",
              ].map((x) => (
                <div key={x} className="flex items-start gap-2 text-sm text-[#0B1325]/70">
                  <span className="mt-1 inline-block h-2 w-2 rounded-full bg-emerald-500/80" />
                  <span>{x}</span>
                </div>
              ))}
            </div>

            <div className="mt-6 text-xs text-[#0B1325]/55">
              Tip: Better keywords = better matches. You can adjust your profile anytime.
            </div>
          </div>
        </section>

        {/* FINAL CTA BAND */}
        <section className="mt-10 pb-6">
          <div className="rounded-3xl border border-[#0B1325]/10 bg-[#0B1325] px-6 py-10 text-white shadow-[0_18px_60px_rgba(15,23,42,0.18)] sm:px-10">
            <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
              <div>
                <div className="text-sm font-semibold text-white/70">Ready?</div>
                <div className="mt-2 text-2xl font-semibold tracking-tight">
                  See what’s waiting in your area.
                </div>
                <div className="mt-2 text-sm text-white/70">
                  Get 3 free matches — no credit card required.
                </div>
              </div>

              <Link
                href={ctaHref}
                className="inline-flex items-center justify-center rounded-full bg-[#63A7FF] px-6 py-3 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(99,167,255,0.35)] transition hover:bg-[#3E8CFF]"
              >
                Get 3 free matches
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
