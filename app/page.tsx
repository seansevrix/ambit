"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import SignupModal from "./components/SignupModal";

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
 * Put your 3 logo images in:
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
              <img
                src={l.src}
                alt={l.alt}
                className="h-full w-full object-cover object-center"
                loading="lazy"
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

const PROFILE_HINT: Record<
  Market,
  { location: string; trade: string; radius: string; trust: string[] }
> = {
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

// Only 1 preview match per market (what you asked for)
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
      Live scan
      <span className="text-black/40">•</span>
      Updated 2m ago
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
                className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${toneClasses(
                  b.tone
                )}`}
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
                <div className="text-[11px] font-semibold text-black/55">
                  Recommended next step
                </div>
                <div className="mt-1 text-[12px] font-semibold text-black/70">{m.nextStep}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-2 text-[11px] text-black/50">
        Full details and links are available for active subscribers.
      </div>
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
      ? [
          "Sources scanned across public portals",
          "3 high-fit opportunities flagged",
          "Digest queued for 5:00pm",
        ]
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
            <div className="text-[11px] font-semibold text-black/35">
              {i === 0 ? "2m" : i === 1 ? "12m" : "1h"}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function HomePage() {
  const [market, setMarket] = useState<Market>("residential");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalKind, setModalKind] = useState<"company" | "individual">("company");

  // Matte background everywhere (html + body)
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

  // Listen for nav "Sign Up" button (SiteNav dispatches this)
  useEffect(() => {
    function onOpen(e: any) {
      const kind = e?.detail?.kind === "individual" ? "individual" : "company";
      setModalKind(kind);
      setModalOpen(true);
    }
    window.addEventListener("ambit:open-signup", onOpen as any);
    return () => window.removeEventListener("ambit:open-signup", onOpen as any);
  }, []);

  const heroSubtitle = useMemo(() => marketSub(market), [market]);

  return (
    <div className="relative min-h-screen text-black">
      <div className="pointer-events-none fixed inset-0 -z-50 bg-[#DEDEDE]" />
      <div className="pointer-events-none fixed inset-0 -z-40 opacity-[0.08] [background-image:linear-gradient(135deg,rgba(0,0,0,0.10)_1px,transparent_1px),linear-gradient(45deg,rgba(0,0,0,0.10)_1px,transparent_1px)] [background-size:180px_180px]" />
      <div className="pointer-events-none fixed inset-0 -z-40 bg-[radial-gradient(900px_600px_at_50%_0%,rgba(92,116,255,0.10),transparent_62%)]" />

      <SignupModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        kind={modalKind}
        market={market}
      />

      <section className={`${CONTAINER} pt-16 pb-16`}>
        <div className="rounded-[44px] bg-[#DEDEDE] px-8 py-14 sm:px-14">
          <div className="text-center">
            <h1 className="text-5xl font-black tracking-tight sm:text-6xl sm:whitespace-nowrap">
              Stop hunting. Start receiving.
            </h1>

            <p className="mx-auto mt-5 max-w-2xl text-lg text-black/65">
              Tailored for business growth.
            </p>

            <div className="mt-10 flex items-center justify-center">
              <button
                onClick={() => {
                  setModalKind("company");
                  setModalOpen(true);
                }}
                className="inline-flex items-center justify-center rounded-full bg-[#5C74FF] px-10 py-4 text-base font-semibold text-white shadow-[0_18px_40px_rgba(92,116,255,0.25)] hover:bg-[#465DFF] transition"
              >
                <ArrowBadge />
                Sign Up
              </button>
            </div>

            <SignupSocialProof />

            <div className="mt-12 -mx-2 sm:-mx-6 lg:-mx-10 overflow-hidden rounded-3xl bg-white shadow-[0_24px_80px_rgba(0,0,0,0.14)]">
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
                          active
                            ? "bg-black text-white"
                            : "text-black/70 hover:text-black hover:bg-black/[0.04]",
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
              AMBIT is built for speed, clarity, and momentum—so you’re not guessing where to focus.
              See what’s relevant, understand it fast, and act with confidence.
            </div>
          </div>
        </div>
      </section>

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
              Stop searching and start selecting. Access curated positions that align your specific
              background with the sectors you actually care about.
            </div>
          </div>

          <div className="rounded-3xl bg-[#59C98B] p-10 shadow-[0_14px_40px_rgba(0,0,0,0.06)]">
            <div className="text-2xl font-black text-black">Move With Purpose.</div>
            <div className="mt-3 text-black/80">
              Strategically aligning your business with the jobs in your chosen industry.
            </div>
          </div>

          <div className="rounded-3xl bg-[#5C74FF] p-10 text-white shadow-[0_14px_40px_rgba(0,0,0,0.10)]">
            <div className="text-2xl font-black">A Command Center for Your Company.</div>
            <div className="mt-3 text-white/90">
              Leave nothing to chance. Use precision match making to find your jobs and leverage
              simple summaries to analyze the competitive landscape—giving you the direct line to
              the decision-makers that matter.
            </div>
          </div>

          <div className="rounded-3xl bg-[#E8E2D7] p-10 shadow-[0_14px_40px_rgba(0,0,0,0.06)]">
            <div className="text-2xl font-black">Visibility Without Guesswork.</div>
            <div className="mt-3 text-black/70">
              You deserve a seat at the table. We’ve engineered the Ambit platform to prioritize
              transparency—so your expertise is recognized and your status is clear at every stage
              of the process.
            </div>
          </div>
        </div>
      </section>

      <section className={`${CONTAINER} pb-24`}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-5xl font-black tracking-tight">Check out what they’re sayin’</h2>
            <p className="mt-4 max-w-2xl text-lg text-black/70">
              Real teams using AMBIT to stay organized and move faster.
            </p>
          </div>
          <Link
            href="/testimonials"
            className="text-sm font-semibold text-black/70 hover:text-black underline underline-offset-4 decoration-black/20 hover:decoration-black/40"
          >
            See more →
          </Link>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {[
            {
              name: "Sarah K.",
              role: "Janitorial • Florida",
              quote: "Setup was simple. The organization alone saved us hours every week.",
            },
            {
              name: "Mark T.",
              role: "Plumbing • California",
              quote: "It’s clean. It’s fast. We know what to look at first.",
            },
            {
              name: "Tanya W.",
              role: "Home Services • Colorado",
              quote: "Feels like we finally have a system instead of chaos.",
            },
          ].map((x) => (
            <div
              key={x.name}
              className="rounded-3xl border border-black/10 bg-white p-7 shadow-[0_12px_40px_rgba(0,0,0,0.06)]"
            >
              <div className="h-44 rounded-2xl bg-black/5" />
              <div className="mt-5 text-lg font-black">{x.name}</div>
              <div className="mt-1 text-sm text-black/60">{x.role}</div>
              <div className="mt-4 text-sm text-black/70">“{x.quote}”</div>
            </div>
          ))}
        </div>

        <div className="mt-16 rounded-3xl border border-black/10 bg-white/85 backdrop-blur px-10 py-14 text-center shadow-[0_18px_55px_rgba(0,0,0,0.08)]">
          <div className="text-4xl font-black">Plug into AMBIT to keep growing your business</div>
          <div className="mt-4 text-lg text-black/70">
            Join the platform where who you are is just as important as what you do.
          </div>

          <button
            onClick={() => {
              setModalKind("company");
              setModalOpen(true);
            }}
            className="mt-10 inline-flex items-center justify-center rounded-full bg-[#5C74FF] px-10 py-4 text-base font-semibold text-white shadow-[0_18px_40px_rgba(92,116,255,0.25)] hover:bg-[#465DFF] transition"
          >
            <ArrowBadge />
            Sign Up
          </button>

          <div className="mt-12 flex flex-wrap items-center justify-center gap-10 text-sm font-semibold text-black/55">
            <Link href="/" className="hover:text-black">
              Home
            </Link>
            <Link href="/about" className="hover:text-black">
              About Us
            </Link>
            <Link href="/testimonials" className="hover:text-black">
              Testimonials
            </Link>
            <Link href="/privacy" className="hover:text-black">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-black">
              Terms
            </Link>
            <Link href="/login" className="hover:text-black">
              Log In
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
