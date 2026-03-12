"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import LandingBackground from "./components/LandingBackground";
import CallRequestWidget from "./components/CallRequestWidget";

type Market = "residential" | "commercial" | "government";

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
    {
      src: "/landing/social/golden-state-landscapes.jpeg",
      alt: "Golden State Landscapes",
    },
    {
      src: "/landing/social/old-dominion-plumbing.jpeg",
      alt: "Old Dominion Plumbing Co.",
    },
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
              <img
                src={l.src}
                alt={l.alt}
                className="h-full w-full object-cover object-center"
                loading="lazy"
                decoding="async"
              />
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
        Trusted by <span className="font-semibold text-black/70">200+</span>{" "}
        local businesses
      </div>
    </div>
  );
}

/* ---------- ICONS (INLINE) ---------- */

function IconTarget() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
      <path
        d="M12 21a9 9 0 1 0-9-9 9 9 0 0 0 9 9Z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M12 16a4 4 0 1 0-4-4 4 4 0 0 0 4 4Z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M12 12h.01"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconInbox() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
      <path
        d="M4 13V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M4 13l4 6h8l4-6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M9 13a3 3 0 0 0 6 0"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconChecklist() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
      <path
        d="M9 6h11M9 12h11M9 18h11"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M4.5 6.5l1.2 1.2L8 5.4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4.5 12.5l1.2 1.2L8 11.4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4.5 18.5l1.2 1.2L8 17.4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ---------- HOW IT WORKS (CLEAN) ---------- */

function StepCard({
  step,
  title,
  desc,
  bullets,
  icon,
  accent = "blue",
}: {
  step: string;
  title: string;
  desc: string;
  bullets: string[];
  icon: ReactNode;
  accent?: "blue" | "emerald" | "black";
}) {
  const dotMap: Record<string, string> = {
    blue: "bg-[#5C74FF]",
    emerald: "bg-emerald-500",
    black: "bg-black",
  };

  const ringMap: Record<string, string> = {
    blue: "ring-[#5C74FF]/12",
    emerald: "ring-emerald-500/12",
    black: "ring-black/10",
  };

  return (
    <div className="rounded-3xl border border-black/10 bg-white p-7 shadow-[0_14px_40px_rgba(0,0,0,0.06)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-black/55">
            <span className={`h-2 w-2 rounded-full ${dotMap[accent]}`} />
            <span>{step}</span>
          </div>

          <div className="mt-3 text-xl font-black tracking-tight">{title}</div>
          <div className="mt-1 text-sm font-medium text-black/65">{desc}</div>
        </div>

        <div
          className={[
            "shrink-0 rounded-2xl border border-black/10 bg-white p-3 text-black/80 ring-8",
            ringMap[accent],
          ].join(" ")}
          aria-hidden="true"
        >
          {icon}
        </div>
      </div>

      <div className="mt-5 space-y-2">
        {bullets.map((b) => (
          <div key={b} className="flex items-start gap-2 text-sm">
            <span className="mt-[7px] h-1.5 w-1.5 rounded-full bg-black/30" />
            <span className="text-black/70">{b}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function HowItWorksSection() {
  return (
    <section className={`${CONTAINER} pb-20`} id="how-it-works">
      <div className="relative overflow-hidden rounded-[36px] border border-black/10 bg-white/92 shadow-[0_18px_55px_rgba(0,0,0,0.08)]">
        {/* super subtle top glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-[radial-gradient(circle_at_top,rgba(92,116,255,0.14),transparent_60%)]"
        />

        <div className="relative px-8 py-12 sm:px-12">
          <div className="mx-auto max-w-3xl text-center">
            {/* BIG + BOLD so it's instantly obvious */}
            <h2 className="text-5xl font-black tracking-tight sm:text-6xl">
              How it works
            </h2>

            <p className="mt-4 text-base font-medium text-black/70 sm:text-lg">
              3 simple steps. Daily matches. Clear next actions.
            </p>
          </div>

          <div className="mt-12">
            <div className="grid gap-6 md:grid-cols-3">
              <StepCard
                step="Step 1"
                accent="blue"
                title="Tell us your trade"
                desc="Service area + keywords."
                bullets={["Trade + where you work", "What you want more of"]}
                icon={<IconTarget />}
              />

              <StepCard
                step="Step 2"
                accent="emerald"
                title="We find the work"
                desc="Scan, score, and filter."
                bullets={["Daily shortlist", "Only strong fits"]}
                icon={<IconInbox />}
              />

              <StepCard
                step="Step 3"
                accent="black"
                title="You bid faster"
                desc="Summary + next steps."
                bullets={["Plain-English breakdown", "Requirements + deadlines"]}
                icon={<IconChecklist />}
              />
            </div>

            <div className="mt-6 text-center text-xs font-semibold text-black/55">
              Set up in minutes • Matches emailed daily
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- LIVE MATCH PREVIEW (HOMEPAGE) ---------- */

type LivePreviewMatch = {
  id: number;
  title: string;
  location: string;
  buyer: string;
  naics: string;
  market: "government" | "commercial" | "residential";
  postedDate: string;
  dueDate: string;
  sourceUrl: string;
  noticeType: string;
  score: number;
  reasons: string[];
};

const LIVE_PREVIEW_MATCHES: LivePreviewMatch[] = [
  {
    id: 1,
    title:
      "Sacramento Valley National Cemetery Grounds Maintenance Services -- S208",
    location: "Dixon, CA",
    buyer:
      "VETERANS AFFAIRS, DEPARTMENT OF VETERANS AFFAIRS, DEPARTMENT OF NATIONAL CEMETERY ADMIN (36C786)",
    naics: "561730",
    market: "government",
    postedDate: "Feb 23, 2026",
    dueDate: "Feb 28, 2026",
    sourceUrl:
      "https://api.sam.gov/prod/opportunities/v1/noticedesc?noticeid=c48d91076e264ba2a12d453093244f1e",
    noticeType: "Solicitation",
    score: 89,
    reasons: ["NAICS exact match (561730) +65", "Location overlap: 2 hit(s) +24"],
  },
  {
    id: 2,
    title:
      "PRE-SOLICITATION NOTICE ONLY: Grounds maintenance services for the Los Angeles National Cemetery. -- S208",
    location: "Los Angeles, CA",
    buyer:
      "VETERANS AFFAIRS, DEPARTMENT OF VETERANS AFFAIRS, DEPARTMENT OF NATIONAL CEMETERY ADMIN (36C786)",
    naics: "561730",
    market: "government",
    postedDate: "Feb 22, 2026",
    dueDate: "May 14, 2027",
    sourceUrl:
      "https://api.sam.gov/prod/opportunities/v1/noticedesc?noticeid=cc3e2a176a0440fa9bbe13e145fee7dd",
    noticeType: "Presolicitation",
    score: 89,
    reasons: ["NAICS exact match (561730) +65", "Location overlap: 2 hit(s) +24"],
  },
  {
    id: 3,
    title:
      "SOURCES SOUGHT NOTICE ONLY: Grounds maintenance services for Riverside National Cemetery. -- S208",
    location: "Riverside, CA",
    buyer:
      "VETERANS AFFAIRS, DEPARTMENT OF VETERANS AFFAIRS, DEPARTMENT OF NATIONAL CEMETERY ADMIN (36C786)",
    naics: "561730",
    market: "government",
    postedDate: "Feb 22, 2026",
    dueDate: "Mar 01, 2026",
    sourceUrl:
      "https://api.sam.gov/prod/opportunities/v1/noticedesc?noticeid=128590201b9344fab0b2455e8d868244",
    noticeType: "Sources Sought",
    score: 89,
    reasons: ["NAICS exact match (561730) +65", "Location overlap: 2 hit(s) +24"],
  },
];

function MatchChip({
  children,
  tone = "default",
}: {
  children: ReactNode;
  tone?: "default" | "score" | "market";
}) {
  const toneClass =
    tone === "score"
      ? "bg-[#EDF2FF] border-[#C9D4FF] text-[#3E59E8]"
      : tone === "market"
      ? "bg-[#F3F5F9] border-[#DDE3EE] text-black/70"
      : "bg-[#EEF1F6] border-[#DDE3EE] text-black/70";

  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${toneClass}`}
    >
      {children}
    </span>
  );
}

function IconStarOutline() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden="true"
    >
      <path d="M12 3.8l2.53 5.12 5.65.82-4.09 3.99.97 5.63L12 16.68l-5.06 2.66.97-5.63L3.82 9.74l5.65-.82L12 3.8Z" />
    </svg>
  );
}

function LiveMatchCard({ item }: { item: LivePreviewMatch }) {
  return (
    <div className="rounded-3xl border border-black/10 bg-white/95 p-5 shadow-[0_10px_24px_rgba(0,0,0,0.04)]">
      <div className="flex items-start justify-between gap-4">
        <h3 className="min-w-0 text-[17px] font-black leading-snug tracking-tight text-black/90">
          {item.title}
        </h3>

        <div className="shrink-0 flex items-center gap-2">
          <button
            type="button"
            aria-label="Save"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white text-black/55"
          >
            <IconStarOutline />
          </button>

          <span className="inline-flex h-10 min-w-[46px] items-center justify-center rounded-full border border-[#C9D4FF] bg-[#EDF2FF] px-3 text-sm font-black text-[#3E59E8]">
            {item.score}
          </span>

          <a
            href={item.sourceUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-10 items-center justify-center rounded-full border border-black/10 bg-white px-4 text-sm font-semibold text-black/80 hover:bg-black/[0.02]"
          >
            Source
          </a>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <MatchChip>{item.location}</MatchChip>
        <MatchChip>{item.buyer}</MatchChip>
      </div>

      <div className="mt-2 flex flex-wrap gap-2">
        <MatchChip>NAICS {item.naics}</MatchChip>
        <MatchChip tone="market">{item.market}</MatchChip>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm font-medium text-black/55">
        <span>Posted {item.postedDate}</span>
        <span>Due {item.dueDate}</span>
      </div>

      <div className="mt-3 break-all text-sm font-medium text-black/70">
        {item.sourceUrl} | Notice Type: {item.noticeType}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {item.reasons.map((reason) => (
          <MatchChip key={reason}>{reason}</MatchChip>
        ))}
      </div>
    </div>
  );
}

function LiveMatchesPreviewSection() {
  return (
    <section className={`${CONTAINER} pb-16`}>
      <div className="mb-5">
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          Live-style preview
        </div>

        <div className="mt-2 text-3xl font-black tracking-tight">
          See exactly what your matches look like
        </div>

        <div className="mt-1 text-sm font-medium text-black/60">
          Same card style as the dashboard: score, source, dates, NAICS, and
          match reasons — simple and skimmable.
        </div>
      </div>

      <div className="rounded-[28px] border border-black/10 bg-white/90 p-4 shadow-[0_16px_40px_rgba(0,0,0,0.06)] sm:p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-3 py-1 text-xs font-semibold text-black/70">
            <span className="h-2 w-2 rounded-full bg-[#5C74FF]" />
            Sample daily matches
          </div>

          <div className="text-xs font-semibold text-black/50">
            Updated daily • Ranked by fit
          </div>
        </div>

        <div className="space-y-4">
          {LIVE_PREVIEW_MATCHES.map((m) => (
            <LiveMatchCard key={m.id} item={m} />
          ))}
        </div>

        <div className="mt-4 text-center text-xs font-semibold text-black/50">
          This preview mirrors the real match card layout customers see inside
          AMBIT.
        </div>
      </div>
    </section>
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
      {
        t: "Proposals for gov/commercial contracts always made me nervous, but the two Ambit associates I worked with for six weeks were incredible. ",
      },
      { t: "They took the stress out of it", strong: true },
      { t: " and were awesome to work with." },
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
      { t: "Shout out to Sean at Ambit. " },
      {
        t: "We spent hours on a project last year that actually won, largely thanks to his hard work.",
        strong: true,
      },
      { t: " He’s definitely someone who takes pride in his craft." },
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
        <svg
          key={i}
          viewBox="0 0 20 20"
          className="h-4 w-4 text-amber-300"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M10 15.27 4.18 18.2l1.11-6.48L.58 7.3l6.5-.94L10 0l2.92 6.36 6.5.94-4.71 4.42 1.11 6.48z" />
        </svg>
      ))}
    </div>
  );
}

function TestimonialsSection({ market }: { market: Market }) {
  return (
    <section className={`${CONTAINER} pb-24`}>
      <div className="overflow-hidden rounded-[36px] border border-black/10 bg-[#0A0F1E] text-white shadow-[0_20px_70px_rgba(0,0,0,0.22)]">
        <div className="px-8 py-12 sm:px-12">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-white/80">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              Live customer feedback
            </div>

            <h2 className="mt-6 text-4xl font-black tracking-tight sm:text-5xl">
              Trusted proof from real contractors
            </h2>

            <p className="mt-4 text-base text-white/70 sm:text-lg">
              Skimmable reviews from teams using AMBIT to find better-fit
              opportunities faster.
            </p>

            <div className="mt-6 flex flex-wrap justify-center gap-2">
              <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-white/80">
                Trusted by 200+ contractors
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
                className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-[0_12px_40px_rgba(0,0,0,0.18)]"
              >
                <div className="flex items-center justify-between">
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-white/80">
                    {x.segment}
                  </span>
                  <span className="text-xs font-semibold text-white/45">“”</span>
                </div>

                <div className="mt-5 text-base leading-relaxed text-white/85">
                  {x.quote.map((p, i) => (
                    <span
                      key={i}
                      className={p.strong ? "font-black text-white" : ""}
                    >
                      {p.t}
                    </span>
                  ))}
                </div>

                <StarRow count={x.stars} />

                <div className="mt-6 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 overflow-hidden rounded-full bg-white shadow-sm ring-2 ring-white/10">
                      <img
                        src={x.avatarSrc}
                        alt={x.avatarAlt}
                        className="h-full w-full object-contain p-1"
                        loading="lazy"
                        decoding="async"
                      />
                    </div>

                    <div>
                      <div className="text-sm font-black text-white">
                        {x.name}
                      </div>
                      <div className="text-xs font-semibold text-white/60">
                        {x.role}
                      </div>
                    </div>
                  </div>

                  <div className="text-xs font-semibold text-white/45">
                    {x.location}
                  </div>
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

      {/* FINAL CTA */}
      <div className="mt-16 rounded-3xl border border-black/10 bg-white/92 px-10 py-12 text-center shadow-[0_14px_40px_rgba(0,0,0,0.07)]">
        <div className="text-4xl font-black">
          Plug into AMBIT to keep growing your business
        </div>
        <div className="mt-4 text-lg text-black/70">
          Stop wasting hours hunting—spend that time bidding on the right work.
        </div>

        <div className="mt-10 flex items-center justify-center">
          <div className="relative inline-flex">
            <span
              aria-hidden
              className="pointer-events-none absolute -inset-10 -z-10 rounded-full bg-[radial-gradient(circle_at_center,rgba(92,116,255,0.20),transparent_70%)]"
            />
            <Link
              href={`/get-started?intent=${market}`}
              className="inline-flex items-center justify-center rounded-full bg-[#5C74FF] px-10 py-4 text-base font-semibold text-white shadow-[0_18px_40px_rgba(92,116,255,0.22)] transition hover:bg-[#465DFF]"
            >
              <ArrowBadge />
              Choose plan
            </Link>
          </div>
        </div>

        <div className="mt-3 text-xs font-semibold text-black/60">
          Active subscription required • Matches + RFQ alerts + bid support
        </div>
      </div>
    </section>
  );
}

/* ---------- PAGE ---------- */

export default function HomePage() {
  const market: Market = "government";

  return (
    <div className="relative min-h-screen overflow-hidden text-black">
      <div className="pointer-events-none absolute inset-0 -z-[70]">
        <LandingBackground />
      </div>

      <CallRequestWidget />

      {/* HERO */}
<section className={`${CONTAINER} pt-14 pb-10`}>
  <div className="rounded-[44px] bg-white/92 border border-black/10 shadow-[0_18px_55px_rgba(0,0,0,0.08)] px-8 py-10 sm:px-12 sm:py-12">
    <div className="text-center">
      <h1 className="text-5xl font-black tracking-tight sm:text-6xl">
        Stop hunting. Start receiving.
      </h1>

      {/* Wider, more breathable subcopy */}
      <div className="mx-auto mt-5 max-w-4xl">
        <p className="text-lg font-semibold leading-relaxed tracking-normal text-black/70 sm:text-xl">
          Matched Opportunities, Delivered Daily
        </p>

        <p className="mt-2 text-sm font-medium leading-relaxed tracking-[0.02em] text-black/55 sm:text-base">
          built for contractors who want more bids without the search
        </p>
      </div>

      <div className="mt-8 flex items-center justify-center">
        <div className="relative inline-flex">
          <span
            aria-hidden
            className="pointer-events-none absolute -inset-10 -z-10 rounded-full bg-[radial-gradient(circle_at_center,rgba(92,116,255,0.20),transparent_70%)]"
          />
          <Link
            href={`/get-started?intent=${market}`}
            className="inline-flex items-center justify-center rounded-full bg-[#5C74FF] px-10 py-4 text-base font-semibold text-white shadow-[0_18px_40px_rgba(92,116,255,0.22)] transition hover:bg-[#465DFF]"
          >
            <ArrowBadge />
            Choose plan
          </Link>
        </div>
      </div>

      <SignupSocialProof />
    </div>
  </div>
</section>

      {/* HOW IT WORKS */}
      <HowItWorksSection />

      {/* TOP MATCH PREVIEW */}
      <LiveMatchesPreviewSection />

      {/* FEATURE BLOCKS */}
      <section className={`${CONTAINER} pb-20`}>
        <h2 className="text-5xl font-black tracking-tight">
          Everything you need to move faster
          <br />
          (without adding headcount)
        </h2>

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl bg-[#E8E2D7] p-10 shadow-[0_10px_28px_rgba(0,0,0,0.06)]">
            <div className="text-2xl font-black">Precision matching</div>
            <div className="mt-3 text-black/70">
              We match by trade, location, scope, and keywords so you’re not
              chasing work you’ll never bid.
            </div>
          </div>

          <div className="rounded-3xl bg-[#59C98B] p-10 shadow-[0_10px_28px_rgba(0,0,0,0.06)]">
            <div className="text-2xl font-black text-black">Daily momentum</div>
            <div className="mt-3 text-black/80">
              Wake up to a shortlist. Pick your shots. Keep your calendar full.
            </div>
          </div>

          <div className="rounded-3xl bg-[#5C74FF] p-10 text-white shadow-[0_10px_30px_rgba(0,0,0,0.10)]">
            <div className="text-2xl font-black">Clarity + next steps</div>
            <div className="mt-3 text-white/90">
              Plain-English summaries, requirements, and “what to do next” so
              you don’t waste time decoding.
            </div>
          </div>

          <div className="rounded-3xl bg-[#E8E2D7] p-10 shadow-[0_10px_28px_rgba(0,0,0,0.06)]">
            <div className="text-2xl font-black">Support when it matters</div>
            <div className="mt-3 text-black/70">
              Need help? Upgrade for bid support and associate help so you can
              move with confidence.
            </div>
          </div>
        </div>
      </section>

      <TestimonialsSection market={market} />
    </div>
  );
}