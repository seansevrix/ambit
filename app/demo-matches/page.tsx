// app/demo-matches/page.tsx
import { SiteHeader, SiteFooter } from "../components/site-chrome";

const steps = [
  {
    number: "1",
    title: "Review your top matches",
    body: "Ambit filters the noise and shows you only the best-fit opportunities for your business.",
  },
  {
    number: "2",
    title: "Get a quick summary + score",
    body: "In seconds, you know what the contract is and whether it’s worth pursuing—no digging.",
  },
  {
    number: "3",
    title: "Decide and move forward",
    body: "Save it, share it with your team, and move to bid with a simple, repeatable workflow.",
  },
];

const demoMatches = [
  {
    title: "Cybersecurity Support Services",
    meta: "Public Sector · NAICS 541512 · Remote/Hybrid",
    score: 93,
    summary:
      "Managed security services with reporting, SLAs, and documentation requirements. Strong fit for teams with compliance-ready processes.",
  },
  {
    title: "Fleet Logistics & Distribution",
    meta: "Commercial · NAICS 488510 · Multi-site",
    score: 86,
    summary:
      "Recurring logistics support with scheduled pickups, delivery tracking, and KPI reporting. Prioritizes reliability and execution.",
  },
  {
    title: "Systems Engineering & Integration",
    meta: "Defense · NAICS 541330 · On-site",
    score: 81,
    summary:
      "Engineering support focused on technical approach, staffing, and timeline. Good match for teams with strong past performance.",
  },
];

const testimonials = [
  {
    quote:
      "Ambit finally made contract hunting feel simple. We open one page, see the best opportunities, and move on with our day.",
    name: "Owner",
    title: "Service Provider",
  },
  {
    quote:
      "The match score + short summary is exactly what we needed. It’s clear, fast, and makes go/no-go decisions easy.",
    name: "Operations Lead",
    title: "Prime Contractor",
  },
  {
    quote:
      "This is the first tool that feels built for real businesses. No clutter—just the opportunities that matter and what to do next.",
    name: "Founder",
    title: "Contractor",
  },
];

export default function DemoMatchesPage() {
  return (
    <div className="min-h-screen bg-[#070B18] text-white">
      <SiteHeader />

      <main className="mx-auto max-w-[1700px] px-6 pb-10 pt-10 lg:px-12">
        {/* HERO (simple) */}
        <div className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/80">
              <span className="h-2 w-2 rounded-full bg-[#4F7DFF]" />
              Demo Matches (Preview)
            </div>

            <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
              A simple daily workflow for finding better contracts
            </h1>

            <p className="mt-2 max-w-2xl text-sm text-white/70 sm:text-base">
              This demo shows what customers see: a clean process, clear matches, and quick decisions.
              Built for any contractor or service provider pursuing commercial & public sector work.
            </p>
          </div>
        </div>

        {/* 1) HOW CUSTOMERS UTILIZE AMBIT (first) */}
        <section className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold">How customers utilize Ambit</h2>
              <p className="mt-1 text-sm text-white/70">
                Three steps. Same simple routine every day.
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {steps.map((s) => (
              <StepCard key={s.number} {...s} />
            ))}
          </div>
        </section>

        {/* 2) EXAMPLE CONTRACT MATCHES (second, simplified) */}
        <section className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold">Example contract matches</h2>
              <p className="mt-1 text-sm text-white/70">
                Title, category, score, and a short summary.
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-[#070B18] px-3 py-2 text-xs text-white/70">
              {demoMatches.length} matches
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {demoMatches.map((m) => (
              <MatchCard key={m.title} {...m} />
            ))}
          </div>
        </section>

        {/* 3) TESTIMONIALS (bottom, sell Ambit) */}
        <section className="mt-10">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Customers don’t want complexity. They want results.
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-white/70 sm:text-base">
            Ambit stays clean and easy—so anyone can use it—without losing the serious, professional feel.
          </p>

          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            {testimonials.map((t) => (
              <div
                key={t.quote}
                className="rounded-2xl border border-white/10 bg-white/5 p-6"
              >
                <p className="text-sm text-white/85">“{t.quote}”</p>
                <div className="mt-4 text-xs text-white/60">
                  <span className="font-semibold text-white/80">{t.name}</span>
                  <span className="mx-2">·</span>
                  <span>{t.title}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}

/* ---------- UI Components ---------- */

function StepCard({
  number,
  title,
  body,
}: {
  number: string;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#070B18]/40 p-5">
      <div className="mb-3 inline-flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-xs font-semibold text-white/80">
        {number}
      </div>
      <p className="text-sm font-semibold">{title}</p>
      <p className="mt-2 text-sm text-white/65">{body}</p>
    </div>
  );
}

function MatchCard({
  title,
  meta,
  score,
  summary,
}: {
  title: string;
  meta: string;
  score: number;
  summary: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#070B18]/40 p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold">{title}</p>
          <p className="mt-1 text-xs text-white/60">{meta}</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-[#070B18] px-3 py-2 text-xs font-semibold">
          Score {score}
        </div>
      </div>

      <p className="mt-3 text-sm text-white/70">{summary}</p>

      <div className="mt-4 h-1.5 rounded-full bg-white/10">
        <div
          className="h-1.5 rounded-full bg-[#4F7DFF]"
          style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
        />
      </div>
    </div>
  );
}
