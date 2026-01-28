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

const INTENTS: Array<{ key: IntentKey; label: string }> = [
  { key: "residential", label: "Residential" },
  { key: "commercial", label: "Commercial" },
  { key: "government", label: "Government" },
];

function intentPill(intent: IntentKey) {
  if (intent === "commercial") return "Live commercial matches";
  if (intent === "government") return "Live government matches";
  return "Live residential matches";
}

function intentProofLine(intent: IntentKey) {
  if (intent === "commercial")
    return "Preview: Commercial work orders + service contracts near you.";
  if (intent === "government")
    return "Preview: Public bid opportunities you can actually pursue.";
  return "Preview: Verified homeowner requests in your service area.";
}

type TestimonialItem = {
  hook: string; // bold lead-in sentence
  quote: string; // remainder (non-hook) text
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
          name: "David Chen",
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
        "Get public opportunities that fit your NAICS + service area—ranked so you know where to spend time.",
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

  // residential (default)
  return {
    header: "Residential leads you can actually close.",
    sub: "Verified homeowner requests—ranked by fit so you can respond faster and win more.",
    items: [
      {
        hook: "Fully up and running in under 5 minutes.",
        quote:
          "I expected setup to be a nightmare. Five minutes later I was seeing real homeowner requests that matched our services.",
        name: "Sarah K.",
        title: "Owner, Janitorial Company",
        tag: "Janitorial · Florida",
      },
      {
        hook: "Less scrolling, more jobs booked.",
        quote:
          "We reply faster now because the leads come in clean and organized. It’s been a noticeable win for our team.",
        name: "Mark T.",
        title: "Owner, Plumbing Company",
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

export default function HomePage() {
  const [intent, setIntent] = useState<IntentKey>("residential");

  const heroPill = useMemo(() => intentPill(intent), [intent]);

  const heroSubhead = useMemo(() => {
    return "We find, rank, and deliver high-intent jobs directly to you. See what’s waiting in your area right now.";
  }, []);

  const ctaHref = useMemo(() => {
    return `/get-started?intent=${encodeURIComponent(intent)}`;
  }, [intent]);

  const proofLine = useMemo(() => intentProofLine(intent), [intent]);

  const t = useMemo(() => intentTestimonials(intent), [intent]);

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

                <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-5xl">
                  Stop chasing leads. Start winning contracts.
                </h1>

                <p className="mx-auto mt-3 max-w-3xl text-sm text-white/70 sm:text-base">
                  {heroSubhead}
                </p>

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
                          "min-w-[160px]",
                          active
                            ? "border-white/25 bg-white/10 text-white"
                            : "border-white/10 bg-white/5 text-white/70 hover:bg-white/8 hover:text-white",
                        ].join(" ")}
                        aria-pressed={active}
                      >
                        {i.label}
                      </button>
                    );
                  })}
                </div>

                {/* CTA row */}
                <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
                  <Link href={ctaHref} className={`${PRIMARY_CTA} bg-emerald-400`}>
                    See My Matches — It’s Free
                  </Link>

                  {/* ✅ Changed from Live Leads -> Reviews */}
                  <Link href="/testimonials" className={LINK}>
                    Reviews →
                  </Link>
                </div>

                <p className="mt-3 text-xs text-white/65 sm:text-sm">No credit card required.</p>

                {/* Trust badges */}
                <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-[11px] font-semibold text-white/55">
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                    Verified buyers
                  </span>
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                    Secure data
                  </span>
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                    24/7 support
                  </span>
                </div>

                <p className="mt-3 text-xs text-white/55">{proofLine}</p>
              </div>

              {/* SIGNUP / PREVIEW */}
              <div id="preview" className="mx-auto mt-8 max-w-6xl sm:mt-10">
                <ConciergeLeadCapture intent={intent} />
              </div>

              {/* PROOF DASHBOARD */}
              <div className="mx-auto mt-10 max-w-6xl sm:mt-12">
                <ProofDashboard intent={intent} />
              </div>

              {/* TESTIMONIALS (mutates by intent) */}
              <div className="mx-auto mt-10 max-w-6xl sm:mt-12">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <div className="inline-flex items-center rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold text-white/80">
                      TESTIMONIALS
                    </div>

                    <h2 className="mt-3 text-xl font-semibold tracking-tight text-white sm:text-2xl">
                      {t.header}
                    </h2>

                    <p className="mt-2 max-w-2xl text-sm text-white/70">{t.sub}</p>

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
                  {t.items.map((x) => (
                    <div
                      key={x.name}
                      className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.03)_inset]"
                    >
                      <p className="text-sm leading-relaxed text-white/75">
                        <span className="text-white/40">“</span>
                        <strong className="font-semibold text-white">{x.hook}</strong>{" "}
                        {x.quote}
                        <span className="text-white/40">”</span>
                      </p>

                      <div className="mt-5 h-px w-full bg-white/10" />

                      <div className="mt-4">
                        <div className="text-sm font-semibold text-white">{x.name}</div>
                        <div className="mt-1 text-xs text-white/65">{x.title}</div>
                        <div className="mt-2 inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold text-white/75">
                          {x.tag}
                        </div>
                      </div>
                    </div>
                  ))}
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
