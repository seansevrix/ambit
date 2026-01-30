"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import LandingBackground from "./components/LandingBackground";

type Market = "residential" | "commercial" | "government";

const MARKETS: Array<{ key: Market; label: string }> = [
  { key: "residential", label: "Residential" },
  { key: "commercial", label: "Commercial" },
  { key: "government", label: "Government" },
];

function marketSub(m: Market) {
  if (m === "commercial") return "Work orders + service contracts ranked for your team.";
  if (m === "government") return "Public bid opportunities matched to your scope.";
  return "Verified homeowner requests matched to your service area.";
}

const CONTAINER = "mx-auto max-w-[1180px] px-6 lg:px-10";

function ArrowBadge({ dark = false }: { dark?: boolean }) {
  return (
    <span
      className={[
        "mr-3 inline-flex h-9 w-9 items-center justify-center rounded-full border-2",
        dark ? "border-black" : "border-white",
      ].join(" ")}
    >
      <span className="text-lg font-black">→</span>
    </span>
  );
}

/**
 * Social proof logos:
 *   /public/landing/social/golden-state-landscapes.jpeg
 *   /public/landing/social/old-dominion-plumbing.jpeg
 *   /public/landing/social/power-mechanical.jpeg
 */
function SignupSocialProof() {
  const logos = [
    { src: "/landing/social/golden-state-landscapes.jpeg", alt: "Golden State Landscapes" },
    { src: "/landing/social/old-dominion-plumbing.jpeg", alt: "Old Dominion Plumbing Co." },
    { src: "/landing/social/power-mechanical.jpeg", alt: "Power Mechanical" },
  ];

  return (
    <div className="mt-5 flex flex-col items-center gap-2">
      <div className="flex items-center justify-center">
        <div className="flex -space-x-4">
          {logos.map((l) => (
            <div
              key={l.src}
              className="h-11 w-11 overflow-hidden rounded-full bg-white shadow-sm border border-black/10 ring-2 ring-black/5"
              title={l.alt}
              aria-label={l.alt}
            >
              <img src={l.src} alt={l.alt} className="h-full w-full object-cover object-center" loading="lazy" />
            </div>
          ))}

          <div
            className="h-11 w-11 rounded-full bg-white shadow-sm border border-black/10 ring-2 ring-black/5 flex items-center justify-center text-xs font-semibold text-black/70"
            aria-hidden="true"
            title="More users"
          >
            +200
          </div>
        </div>
      </div>

      <div className="text-xs text-black/55">
        Trusted by <span className="font-semibold text-black/70">200+</span> local businesses
      </div>
    </div>
  );
}

/* ---------- LIVE PREVIEW ---------- */

type PreviewMatch = {
  title: string;
  location: string;
  score: number;
  badges: Array<{ label: string; tone: "new" | "verified" | "due" }>;
  reasons: string[];
  valueRange: string;
  margin: "High" | "Medium" | "Low";
  closeTime: string;
  summary: string;
  buyerNote: string;
  nextStep: string;
};

const PROFILE_HINT: Record<Market, { location: string; trade: string; radius: string; trust: string[] }> = {
  residential: {
    location: "San Diego, CA",
    trade: "Landscaping",
    radius: "25mi radius",
    trust: ["Verified buyers", "Updated frequently", "Ranked by fit"],
  },
  commercial: {
    location: "Austin, TX",
    trade: "Facilities Services",
    radius: "50mi radius",
    trust: ["Recurring work orders", "Fast response routing", "Ranked by fit"],
  },
  government: {
    location: "San Diego, CA",
    trade: "Janitorial (561720)",
    radius: "250mi radius",
    trust: ["Public sources monitored", "Deadline-aware ranking", "Ranked by fit"],
  },
};

const PREVIEW_DATA: Record<Market, PreviewMatch> = {
  residential: {
    title: "Backyard cleanup + hauling",
    location: "San Diego, CA",
    score: 96,
    badges: [
      { label: "Verified", tone: "verified" },
      { label: "New", tone: "new" },
    ],
    reasons: ["Within 8 miles", "High intent", "Same-day response"],
    valueRange: "$1,200–$2,800",
    margin: "High",
    closeTime: "1–3 days",
    summary:
      "Homeowner wants debris removal, trimming, and a full backyard reset. Photos included and scope is clear. Prefers an estimate today.",
    buyerNote: "They responded to the last two contractors within 30 minutes.",
    nextStep: "Send a same-day estimate and offer a next-morning slot.",
  },
  commercial: {
    title: "Retail plaza: monthly landscaping",
    location: "Austin, TX",
    score: 95,
    badges: [{ label: "New", tone: "new" }],
    reasons: ["Recurring revenue", "Fits crew size", "Fast close"],
    valueRange: "$2,400–$4,500/mo",
    margin: "High",
    closeTime: "3–10 days",
    summary:
      "Property manager wants a monthly maintenance plan plus seasonal cleanup. Multi-tenant plaza with consistent scope.",
    buyerNote: "They prefer vendors who can start within two weeks.",
    nextStep: "Send a monthly plan with two tier options and a start date.",
  },
  government: {
    title: "Janitorial services (base facility)",
    location: "Tampa, FL",
    score: 97,
    badges: [{ label: "Due soon", tone: "due" }],
    reasons: ["NAICS aligned", "Likely set-aside", "Strong fit"],
    valueRange: "$45k–$110k",
    margin: "Medium",
    closeTime: "10–21 days",
    summary:
      "Recurring janitorial requirements with a defined schedule and deliverables. Documentation requirements look standard for the scope.",
    buyerNote: "Deadline is tight; early questions can improve fit.",
    nextStep: "Pull requirements, confirm scope, and draft clarifying questions.",
  },
};

function toneClasses(tone: "new" | "verified" | "due") {
  if (tone === "verified") return "bg-emerald-50 text-emerald-800 border-emerald-200";
  if (tone === "due") return "bg-amber-50 text-amber-800 border-amber-200";
  return "bg-blue-50 text-blue-800 border-blue-200";
}

function LivePill() {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-3 py-1 text-[11px] font-semibold text-black/70">
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#5C74FF] opacity-40" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-[#5C74FF]" />
      </span>
      Live scan <span className="text-black/40">•</span> Updated 2m ago
    </div>
  );
}

function PreviewContextBar({ market }: { market: Market }) {
  const ctx = PROFILE_HINT[market];
  return (
    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="text-sm font-semibold text-black/70">
        Showing matches for:{" "}
        <span className="font-black text-black/85">
          {ctx.location} • {ctx.trade} • {ctx.radius}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {ctx.trust.map((t) => (
          <span
            key={t}
            className="rounded-full border border-black/10 bg-white px-3 py-1 text-[11px] font-semibold text-black/60"
          >
            {t}
          </span>
        ))}
        <span className="rounded-full border border-black/10 bg-white px-3 py-1 text-[11px] font-semibold text-black/55">
          Edit
        </span>
      </div>
    </div>
  );
}

function ScoreInfo({ text }: { text: string }) {
  return (
    <span
      className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-black/10 bg-white text-[11px] font-black text-black/60"
      title={text}
      aria-label={text}
    >
      i
    </span>
  );
}

function PreviewMatches({ market }: { market: Market }) {
  const m = PREVIEW_DATA[market];
  const scoreExplain = `Why ${m.score}: ${m.reasons.join(" • ")}`;
  const meta = `${m.valueRange} • ${m.margin} margin • Close: ${m.closeTime}`;

  return (
    <div className="relative rounded-2xl border border-black/10 bg-white p-4">
      <div className="flex items-center justify-between">
        <div className="text-xs font-semibold text-black/55">Top match</div>
        <LivePill />
      </div>

      <div className="pointer-events-none absolute inset-x-4 top-10 h-10 rounded-2xl bg-gradient-to-r from-transparent via-black/5 to-transparent opacity-30 animate-pulse" />

      <div className="mt-3">
        <div className="rounded-xl border border-black/10 bg-white p-3 shadow-[0_10px_30px_rgba(0,0,0,0.06)]">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold text-black">{m.title}</div>
              <div className="mt-0.5 text-xs text-black/55">{m.location}</div>
              <div className="mt-2 text-[11px] font-semibold text-black/60">{meta}</div>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <div className="rounded-full border border-black/10 bg-white px-2.5 py-1 text-xs font-black text-black/80">
                {m.score}
              </div>
              <ScoreInfo text={scoreExplain} />
            </div>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-2">
            {m.badges.map((b, bi) => (
              <span
                key={`${b.label}-${bi}`}
                className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${toneClasses(b.tone)}`}
              >
                {b.label}
              </span>
            ))}
            {m.reasons.slice(0, 2).map((r, ri) => (
              <span
                key={`${r}-${ri}`}
                className="rounded-full border border-black/10 bg-white px-2 py-0.5 text-[11px] font-semibold text-black/60"
              >
                {r}
              </span>
            ))}
            <span className="ml-auto inline-flex rounded-full border border-black/10 bg-white px-2 py-0.5 text-[11px] font-semibold text-black/55">
              Quick view
            </span>
          </div>

          <div className="mt-3 rounded-xl border border-black/10 bg-white p-3">
            <div className="text-[12px] font-semibold text-black/70">Quick peek</div>
            <div className="mt-2 text-[12px] text-black/70 leading-relaxed">{m.summary}</div>

            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <div className="rounded-lg border border-black/10 bg-[#FAFAF7] px-3 py-2">
                <div className="text-[11px] font-semibold text-black/55">Buyer note</div>
                <div className="mt-1 text-[12px] font-semibold text-black/70">{m.buyerNote}</div>
              </div>
              <div className="rounded-lg border border-black/10 bg-[#FAFAF7] px-3 py-2">
                <div className="text-[11px] font-semibold text-black/55">Recommended next step</div>
                <div className="mt-1 text-[12px] font-semibold text-black/70">{m.nextStep}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-2 text-[11px] text-black/50">Full details and links are available for active subscribers.</div>
    </div>
  );
}

function PreviewActivity({ market }: { market: Market }) {
  const stats =
    market === "government"
      ? [
          { k: "New today", v: "12" },
          { k: "Saved", v: "4" },
          { k: "Due soon", v: "3" },
        ]
      : market === "commercial"
      ? [
          { k: "New today", v: "18" },
          { k: "Saved", v: "6" },
          { k: "Emailed", v: "3" },
        ]
      : [
          { k: "New today", v: "21" },
          { k: "Saved", v: "7" },
          { k: "Verified", v: "9" },
        ];

  const bars =
    market === "government"
      ? [30, 55, 45, 70, 60, 80, 65]
      : market === "commercial"
      ? [35, 60, 50, 75, 68, 88, 72]
      : [40, 70, 55, 82, 74, 92, 78];

  const feed =
    market === "government"
      ? ["Sources scanned across public portals", "3 high-fit opportunities flagged", "Digest queued for 5:00pm"]
      : market === "commercial"
      ? ["New work orders detected", "2 buyers replied today", "Top match score: 95"]
      : ["Verified buyer lead added", "2 calls booked", "Top match score: 96"];

  const [animateBars, setAnimateBars] = useState(false);
  useEffect(() => {
    setAnimateBars(false);
    const t = setTimeout(() => setAnimateBars(true), 60);
    return () => clearTimeout(t);
  }, [market]);

  return (
    <div className="rounded-2xl border border-black/10 bg-white p-4">
      <div className="flex items-center justify-between">
        <div className="text-xs font-semibold text-black/55">Momentum</div>
        <div className="text-[11px] font-semibold text-black/45">Auto-ranked daily</div>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2">
        {stats.map((s) => (
          <div
            key={s.k}
            className="rounded-xl border border-black/10 bg-[#FAFAF7] px-3 py-2 transition hover:bg-white hover:shadow-[0_10px_30px_rgba(0,0,0,0.05)]"
          >
            <div className="text-lg font-black text-black">{s.v}</div>
            <div className="text-[11px] font-semibold text-black/55">{s.k}</div>
          </div>
        ))}
      </div>

      <div className="mt-3 rounded-xl border border-black/10 bg-[#FAFAF7] p-3">
        <div className="flex items-center justify-between">
          <div className="text-[11px] font-semibold text-black/55">Last 7 days</div>
          <div className="text-[11px] font-semibold text-black/40">Matches</div>
        </div>

        <div className="mt-2 flex items-end gap-1.5">
          {bars.map((h, i) => (
            <div key={i} className="w-full rounded-md bg-black/10" style={{ height: 44 }}>
              <div
                className="w-full rounded-md bg-[#5C74FF] transition-[height] duration-500 ease-out"
                style={{ height: `${animateBars ? h : 0}%` }}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="mt-3 space-y-2">
        {feed.map((t, i) => (
          <div
            key={i}
            className="flex items-center justify-between rounded-xl border border-black/10 bg-white px-3 py-2 transition hover:shadow-[0_10px_30px_rgba(0,0,0,0.05)]"
          >
            <div className="text-[12px] font-semibold text-black/70">{t}</div>
            <div className="text-[11px] font-semibold text-black/35">{i === 0 ? "2m" : i === 1 ? "12m" : "1h"}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- TESTIMONIALS ---------- */

type QuotePart = { t: string; strong?: boolean };
type Testimonial = {
  segment: "Commercial" | "Residential";
  quote: QuotePart[];
  stars: 5;
  name: string;
  role: string;
  location: string;
  avatarSrc: string;
  avatarAlt: string;
};

const TESTIMONIALS: Testimonial[] = [
  {
    segment: "Commercial",
    quote: [
      { t: "I sat on AMBIT for weeks because I thought setup would be complicated. " },
      { t: "Fully up and running in under 5 minutes.", strong: true },
      { t: " Now we get opportunities every morning instead of searching for hours." },
    ],
    stars: 5,
    name: "Sarah K.",
    role: "Owner, Janitorial Company",
    location: "Guam, USA",
    avatarSrc: "/landing/social/testimonials/paradise-cleaning-solutions.webp",
    avatarAlt: "Paradise Cleaning Solutions",
  },
  {
    segment: "Commercial",
    quote: [
      { t: "We’ve tested a lot of tools. " },
      { t: "Relevant opportunities and clear summaries saved our team hours.", strong: true },
      { t: " It’s the first one that actually scales with us." },
    ],
    stars: 5,
    name: "David Chen",
    role: "Operations Director, Equipment Rental",
    location: "Tennessee, USA",
    avatarSrc: "/landing/social/testimonials/tennessee-contractors-equipment.jpeg",
    avatarAlt: "Tennessee Contractors Equipment",
  },
  {
    segment: "Residential",
    quote: [
      { t: "What impressed me most was the accuracy. " },
      { t: "It sends work we can actually bid and win.", strong: true },
      { t: " It’s become part of our daily routine." },
    ],
    stars: 5,
    name: "Mark T.",
    role: "Owner, Plumbing Company",
    location: "California, USA",
    avatarSrc: "/landing/social/testimonials/euro-plumbing.jpeg",
    avatarAlt: "Euro Plumbing & Sewer LLC",
  },
];

function StarRow({ count }: { count: number }) {
  return (
    <div className="mt-5 flex items-center gap-1">
      {Array.from({ length: count }).map((_, i) => (
        <svg key={i} viewBox="0 0 20 20" className="h-4 w-4 text-amber-300" fill="currentColor" aria-hidden="true">
          <path d="M10 15.27 4.18 18.2l1.11-6.48L.58 7.3l6.5-.94L10 0l2.92 6.36 6.5.94-4.71 4.42 1.11 6.48z" />
        </svg>
      ))}
    </div>
  );
}

function TestimonialsSection({ market }: { market: Market }) {
  return (
    <section className={`${CONTAINER} pb-24`}>
      <div className="overflow-hidden rounded-[36px] border border-black/10 bg-[#0A0F1E] text-white shadow-[0_30px_120px_rgba(0,0,0,0.28)]">
        <div className="px-8 py-12 sm:px-12">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-white/80">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              Live customer feedback
            </div>

            <h2 className="mt-6 text-4xl font-black tracking-tight sm:text-5xl">Trusted proof from real contractors</h2>

            <p className="mt-4 text-base text-white/70 sm:text-lg">
              Skimmable reviews from teams using AMBIT to find better-fit opportunities faster.
            </p>

            <div className="mt-6 flex flex-wrap justify-center gap-2">
              <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-white/80">
                Trusted by 200+ contractors
              </span>
              <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-white/80">
                U.S. based businesses
              </span>
              <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-white/80">
                Matches emailed daily
              </span>
            </div>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {TESTIMONIALS.map((x) => (
              <div
                key={x.name}
                className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-[0_18px_60px_rgba(0,0,0,0.25)] backdrop-blur"
              >
                <div className="flex items-center justify-between">
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-white/80">
                    {x.segment}
                  </span>
                  <span className="text-xs font-semibold text-white/45">“”</span>
                </div>

                <div className="mt-5 text-base leading-relaxed text-white/85">
                  {x.quote.map((p, i) => (
                    <span key={i} className={p.strong ? "font-black text-white" : ""}>
                      {p.t}
                    </span>
                  ))}
                </div>

                <StarRow count={x.stars} />

                <div className="mt-6 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 overflow-hidden rounded-full bg-white shadow-sm ring-2 ring-white/10">
                      <img src={x.avatarSrc} alt={x.avatarAlt} className="h-full w-full object-contain p-1" loading="lazy" />
                    </div>

                    <div>
                      <div className="text-sm font-black text-white">{x.name}</div>
                      <div className="text-xs font-semibold text-white/60">{x.role}</div>
                    </div>
                  </div>

                  <div className="text-xs font-semibold text-white/45">{x.location}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 flex justify-center">
            <Link
              href="/testimonials"
              className="text-sm font-semibold text-white/70 hover:text-white underline underline-offset-4 decoration-white/20 hover:decoration-white/40"
            >
              See more →
            </Link>
          </div>
        </div>
      </div>

      {/* FINAL CTA (no extra links) */}
      <div className="mt-16 rounded-3xl border border-black/10 bg-white/85 backdrop-blur px-10 py-14 text-center shadow-[0_18px_55px_rgba(0,0,0,0.08)]">
        <div className="text-4xl font-black">Plug into AMBIT to keep growing your business</div>
        <div className="mt-4 text-lg text-black/70">
          Join the platform where who you are is just as important as what you do.
        </div>

        <div className="mt-10 flex items-center justify-center">
          <div className="relative inline-flex">
            <span
              aria-hidden
              className="pointer-events-none absolute -inset-8 -z-10 rounded-full bg-[radial-gradient(circle_at_center,rgba(79,70,229,0.35),transparent_70%)] blur-2xl"
            />
            <Link
              href={`/get-started?intent=${market}`}
              className="inline-flex items-center justify-center rounded-full bg-[#5C74FF] px-10 py-4 text-base font-semibold text-white shadow-[0_18px_40px_rgba(92,116,255,0.25)] transition hover:bg-[#465DFF]"
            >
              <ArrowBadge />
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- PAGE ---------- */

export default function HomePage() {
  const [market, setMarket] = useState<Market>("residential");

  useEffect(() => {
    const prevHtml = document.documentElement.style.backgroundColor;
    const prevBody = document.body.style.backgroundColor;

    document.documentElement.style.backgroundColor = "#DEDEDE";
    document.body.style.backgroundColor = "#DEDEDE";

    return () => {
      document.documentElement.style.backgroundColor = prevHtml;
      document.body.style.backgroundColor = prevBody;
    };
  }, []);

  const heroSubtitle = useMemo(() => marketSub(market), [market]);

  return (
    <div className="relative min-h-screen overflow-hidden text-black">
      {/* Landing background should sit BEHIND the site-wide grid */}
      <div className="pointer-events-none fixed inset-0 -z-[70]">
        <LandingBackground />
      </div>

      {/* HERO */}
      <section className={`${CONTAINER} pt-16 pb-16`}>
        <div className="rounded-[44px] bg-white/65 backdrop-blur-md border border-black/10 shadow-[0_30px_90px_rgba(0,0,0,0.10)] px-8 py-14 sm:px-14">
          <div className="text-center">
            <h1 className="text-5xl font-black tracking-tight sm:text-6xl sm:whitespace-nowrap">
              Stop hunting. Start receiving.
            </h1>

            <p className="mx-auto mt-5 max-w-2xl text-lg text-black/65">Matched opportunities, emailed daily.</p>

            <div className="mt-10 flex items-center justify-center">
              <div className="relative inline-flex">
                <span
                  aria-hidden
                  className="pointer-events-none absolute -inset-8 -z-10 rounded-full bg-[radial-gradient(circle_at_center,rgba(79,70,229,0.35),transparent_70%)] blur-2xl"
                />
                <Link
                  href={`/get-started?intent=${market}`}
                  className="inline-flex items-center justify-center rounded-full bg-[#5C74FF] px-10 py-4 text-base font-semibold text-white shadow-[0_18px_40px_rgba(92,116,255,0.25)] transition hover:bg-[#465DFF]"
                >
                  <ArrowBadge />
                  Sign Up
                </Link>
              </div>
            </div>

            <SignupSocialProof />

            {/* Preview strip (slight glass lift) */}
            <div className="mt-12 -mx-2 sm:-mx-6 lg:-mx-10 overflow-hidden rounded-3xl bg-white/60 backdrop-blur-xl ring-1 ring-white/60 shadow-[0_24px_80px_rgba(0,0,0,0.14)]">
              <div className="flex items-center justify-between border-b border-black/5 px-6 py-4">
                <div className="text-sm font-semibold text-black/80">AMBIT</div>
                <div className="text-xs text-black/45">Preview</div>
              </div>

              <div className="p-7 sm:p-10">
                <PreviewContextBar market={market} />

                <div className="mb-6 inline-flex rounded-full border border-black/10 bg-white p-1">
                  {MARKETS.map((m) => {
                    const active = m.key === market;
                    return (
                      <button
                        key={m.key}
                        type="button"
                        onClick={() => setMarket(m.key)}
                        className={[
                          "rounded-full px-5 py-2.5 text-sm font-semibold transition",
                          active ? "bg-black text-white" : "text-black/70 hover:text-black hover:bg-black/[0.04]",
                        ].join(" ")}
                      >
                        {m.label}
                      </button>
                    );
                  })}
                </div>

                <div className="grid gap-7 lg:grid-cols-2">
                  <div className="rounded-3xl border border-black/10 bg-[#FAFAF7] p-6">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-semibold">Match opportunities</div>
                      <div className="text-xs text-black/45">Live preview</div>
                    </div>
                    <div className="mt-4">
                      <PreviewMatches market={market} />
                    </div>
                  </div>

                  <div className="rounded-3xl border border-black/10 bg-[#FAFAF7] p-6">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-semibold">Activity &amp; momentum</div>
                      <div className="text-xs text-black/45">Live preview</div>
                    </div>
                    <div className="mt-4">
                      <PreviewActivity market={market} />
                    </div>
                  </div>
                </div>

                <div className="mt-6 text-sm text-black/60">{heroSubtitle}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST */}
      <section className={`${CONTAINER} pb-20`}>
        <div className="rounded-3xl border border-black/10 bg-white/75 backdrop-blur px-10 py-12 shadow-[0_18px_55px_rgba(0,0,0,0.08)]">
          <div className="grid gap-10 lg:grid-cols-2">
            <div>
              <h2 className="text-3xl font-black">Trusted by the most ambitious operators.</h2>
              <div className="mt-7 grid gap-6 sm:grid-cols-2">
                <div className="rounded-2xl border border-black/10 bg-white px-5 py-4">
                  <div className="text-4xl font-black text-[#34D399]">3</div>
                  <div className="mt-1 text-sm text-black/65">Markets covered</div>
                </div>
                <div className="rounded-2xl border border-black/10 bg-white px-5 py-4">
                  <div className="text-4xl font-black text-[#34D399]">Daily</div>
                  <div className="mt-1 text-sm text-black/65">Updated opportunities</div>
                </div>
              </div>
            </div>

            <div className="text-black/70">
              AMBIT is built for speed, clarity, and momentum—so you’re not guessing where to focus. See what’s
              relevant, understand it fast, and act with confidence.
            </div>
          </div>
        </div>
      </section>

      {/* FEATURE BLOCKS */}
      <section className={`${CONTAINER} pb-20`}>
        <h2 className="text-5xl font-black tracking-tight">
          Ambit makes finding jobs effortless.
          <br />
          Stop hunting, start receiving.
        </h2>

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl bg-[#E8E2D7] p-10 shadow-[0_14px_40px_rgba(0,0,0,0.06)]">
            <div className="text-2xl font-black">Your Expertise. Our Network.</div>
            <div className="mt-3 text-black/70">
              Stop searching and start selecting. Access curated positions that align your specific background with
              the sectors you actually care about.
            </div>
          </div>

          <div className="rounded-3xl bg-[#59C98B] p-10 shadow-[0_14px_40px_rgba(0,0,0,0.06)]">
            <div className="text-2xl font-black text-black">Move With Purpose.</div>
            <div className="mt-3 text-black/80">Strategically aligning your business with the jobs in your chosen industry.</div>
          </div>

          <div className="rounded-3xl bg-[#5C74FF] p-10 text-white shadow-[0_14px_40px_rgba(0,0,0,0.10)]">
            <div className="text-2xl font-black">A Command Center for Your Company.</div>
            <div className="mt-3 text-white/90">
              Use precision matching to find the right jobs and simple summaries to decide fast.
            </div>
          </div>

          <div className="rounded-3xl bg-[#E8E2D7] p-10 shadow-[0_14px_40px_rgba(0,0,0,0.06)]">
            <div className="text-2xl font-black">Visibility Without Guesswork.</div>
            <div className="mt-3 text-black/70">
              Built to prioritize transparency—so your status is clear at every stage.
            </div>
          </div>
        </div>
      </section>

      <TestimonialsSection market={market} />
    </div>
  );
}
