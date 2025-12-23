// app/demo-matches/page.tsx
import Link from "next/link";
import { SiteHeader, SiteFooter } from "../components/site-chrome";

const demoMatches = [
  {
    title: "Cybersecurity Support Services",
    meta: "Public Sector · NAICS 541512 · Remote/Hybrid",
    score: 93,
    due: "Due in 9 days",
    summary:
      "Provide managed security services (monitoring, incident response, and reporting). Emphasis on documentation, SLAs, and secure handling practices.",
    nextSteps: [
      "Confirm scope + deliverables (monitoring, IR, reporting)",
      "Check required certifications / compliance language",
      "Draft capability narrative + past performance examples",
    ],
  },
  {
    title: "Fleet Logistics & Distribution",
    meta: "Commercial · NAICS 488510 · Multi-site",
    score: 86,
    due: "Rolling intake",
    summary:
      "Recurring logistics support: scheduled pickups, warehousing, and delivery with performance reporting. Focus on reliability and KPI tracking.",
    nextSteps: [
      "Verify service area coverage + capacity",
      "Confirm reporting requirements (KPIs, tracking)",
      "Build pricing assumptions + margin target",
    ],
  },
  {
    title: "Systems Engineering & Integration",
    meta: "Defense · NAICS 541330 · On-site",
    score: 81,
    due: "Due in 14 days",
    summary:
      "Engineering support for system integration and documentation. Strong evaluation weight on technical approach, staffing plan, and timeline.",
    nextSteps: [
      "Identify key roles + staffing plan",
      "Outline technical approach and timeline",
      "Collect relevant past performance references",
    ],
  },
  {
    title: "Facilities Support Services",
    meta: "Public Sector · NAICS 561210 · Regional",
    score: 78,
    due: "Due in 6 days",
    summary:
      "Multi-service facilities support with scheduled tasks and compliance reporting. Priorities: response times, consistency, and documentation.",
    nextSteps: [
      "Confirm scope boundaries + response SLAs",
      "Build staffing coverage plan",
      "Prepare compliance & reporting approach",
    ],
  },
];

export default function DemoMatchesPage() {
  return (
    <div className="min-h-screen bg-[#070B18] text-white">
      <SiteHeader />

      <main className="mx-auto max-w-[1700px] px-6 pb-10 pt-10 lg:px-12">
        {/* Top intro */}
        <div className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/80">
              <span className="h-2 w-2 rounded-full bg-[#4F7DFF]" />
              Demo Matches (Preview)
            </div>

            <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
              See what customers get every day
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-white/70 sm:text-base">
              This is a live-style preview of Ambit’s experience: high-fit opportunities, a clear match
              score, a short summary, and simple next steps—no clutter.
            </p>

            <div className="mt-5 flex flex-wrap gap-3 text-xs text-white/60">
              <Pill>Industry-agnostic</Pill>
              <Pill>Commercial & public sector</Pill>
              <Pill>Match score + summary</Pill>
              <Pill>Simple pipeline actions</Pill>
            </div>
          </div>

          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <Link
              href="/pricing"
              className="rounded-xl bg-white px-5 py-3 text-center text-sm font-semibold text-black hover:bg-white/90"
            >
              Start for $39.99/mo
            </Link>
            <Link
              href="/signup"
              className="rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-center text-sm font-semibold text-white hover:bg-white/10"
            >
              Create account
            </Link>
          </div>
        </div>

        {/* Layout */}
        <div className="mt-8 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
          {/* Left: Match list */}
          <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold">Today’s Matches</p>
                <p className="mt-1 text-xs text-white/60">
                  Example results shown for a demo customer profile
                </p>
              </div>
              <div className="rounded-xl border border-white/10 bg-[#070B18] px-3 py-2 text-xs text-white/70">
                4 matches
              </div>
            </div>

            <div className="mt-4 space-y-3">
              {demoMatches.map((m) => (
                <MatchCard key={m.title} match={m} />
              ))}
            </div>
          </section>

          {/* Right: Simple “How it works” + CTA */}
          <aside className="space-y-6">
            <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <p className="text-sm font-semibold">How customers use Ambit</p>
              <p className="mt-2 text-sm text-white/70">
                Keep it simple. Every day is the same quick flow:
              </p>

              <div className="mt-4 space-y-3">
                <Step
                  title="1) Review the top matches"
                  body="Ambit ranks opportunities by fit so you don’t waste time."
                />
                <Step
                  title="2) Save what you want to pursue"
                  body="One click to add to your pipeline."
                />
                <Step
                  title="3) Follow the next steps"
                  body="A short summary + actions keeps your team moving."
                />
              </div>
            </section>

            <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <p className="text-sm font-semibold">Simple pricing</p>
              <p className="mt-2 text-sm text-white/70">
                One plan. <span className="text-white/85 font-semibold">$39.99/month</span>. Cancel anytime.
              </p>

              <div className="mt-4 flex flex-col gap-3">
                <Link
                  href="/pricing"
                  className="rounded-xl bg-white px-5 py-3 text-center text-sm font-semibold text-black hover:bg-white/90"
                >
                  Start for $39.99/mo
                </Link>
                <Link
                  href="/signup"
                  className="rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-center text-sm font-semibold text-white hover:bg-white/10"
                >
                  Create account
                </Link>
              </div>

              <p className="mt-3 text-xs text-white/60">
                This demo page is a preview. Your real dashboard will show your actual matches.
              </p>
            </section>
          </aside>
        </div>

        {/* Bottom CTA */}
        <section className="mt-10 rounded-2xl border border-white/10 bg-white/5 p-8">
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div>
              <h2 className="text-xl font-semibold tracking-tight">
                Ready to start receiving better matches?
              </h2>
              <p className="mt-2 text-sm text-white/70">
                Get the simple daily workflow your customers will actually use.
              </p>
            </div>
            <Link
              href="/pricing"
              className="rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black hover:bg-white/90"
            >
              Start for $39.99/mo
            </Link>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}

/* ---------- Components ---------- */

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
      {children}
    </span>
  );
}

function MatchCard({ match }: { match: (typeof demoMatches)[number] }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#070B18]/40 p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold">{match.title}</p>
          <p className="mt-1 text-xs text-white/60">{match.meta}</p>
          <p className="mt-2 text-xs text-white/70">{match.summary}</p>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-2">
          <div className="rounded-xl border border-white/10 bg-[#070B18] px-3 py-2 text-xs font-semibold">
            Score {match.score}
          </div>
          <div className="text-[11px] text-white/60">{match.due}</div>
        </div>
      </div>

      <div className="mt-3 h-1.5 rounded-full bg-white/10">
        <div
          className="h-1.5 rounded-full bg-[#4F7DFF]"
          style={{ width: `${Math.min(100, Math.max(0, match.score))}%` }}
        />
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <div className="rounded-xl border border-white/10 bg-white/5 p-3">
          <p className="text-xs font-semibold text-white/85">Next steps</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-white/70">
            {match.nextSteps.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/5 p-3">
          <p className="text-xs font-semibold text-white/85">Pipeline actions</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              type="button"
              className="rounded-lg bg-white px-3 py-2 text-xs font-semibold text-black hover:bg-white/90"
            >
              Save to pipeline
            </button>
            <button
              type="button"
              className="rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold text-white hover:bg-white/10"
            >
              Mark as “Review”
            </button>
            <button
              type="button"
              className="rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold text-white hover:bg-white/10"
            >
              View details
            </button>
          </div>
          <p className="mt-2 text-[11px] text-white/60">
            (Buttons are demo-only here.)
          </p>
        </div>
      </div>
    </div>
  );
}

function Step({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-[#070B18]/40 p-4">
      <p className="text-sm font-semibold">{title}</p>
      <p className="mt-1 text-sm text-white/65">{body}</p>
    </div>
  );
}
