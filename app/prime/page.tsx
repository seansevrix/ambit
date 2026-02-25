// app/prime/page.tsx
import Link from "next/link";

const INCLUDED = [
  "24/7 direct access to AMBIT’s CEO/Founder for strategy, escalation, and execution decisions.",
  "Dedicated enterprise sourcing desk (AI + human analysts) aligned to your trade, NAICS, and footprint.",
  "Priority opportunity intelligence across Residential, Commercial, and Government channels.",
  "Executive-grade pursue/pass memos with risk, fit, timeline, and margin potential.",
  "Bid strategy support: submission planning, sequencing, and decision velocity.",
  "Weekly executive pipeline review with action priorities for your operations team.",
  "Priority response SLA with same-day triage for active opportunities.",
  "White-glove onboarding and workflow alignment with your internal team.",
];

const BEST_FIT = [
  "Multi-crew contractors and multi-location operators",
  "Teams pursuing higher contract volume with tighter bid discipline",
  "Firms needing faster go/no-go decisions and stronger pipeline quality",
  "Leaders who want direct executive support, not ticket-based support",
];

const DIFFERENTIATORS = [
  {
    title: "Executive Access",
    text: "You get direct founder-level support when speed and clarity matter most.",
  },
  {
    title: "Decision-Ready Intelligence",
    text: "Your team receives qualified opportunities with context, not just raw links.",
  },
  {
    title: "Faster Pursuit Cycles",
    text: "Reduce time spent on low-fit bids and concentrate effort on winnable work.",
  },
  {
    title: "Enterprise Workflow",
    text: "Built for organizations that need consistency, accountability, and throughput.",
  },
];

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      className="mt-0.5 h-4 w-4 flex-none"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M4.5 10.5 8 14l7.5-8"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Step({
  number,
  title,
  text,
}: {
  number: string;
  title: string;
  text: string;
}) {
  return (
    <li className="flex gap-3">
      <span className="mt-0.5 inline-flex h-6 w-6 flex-none items-center justify-center rounded-full border border-black/20 text-xs font-semibold">
        {number}
      </span>
      <div>
        <p className="font-semibold text-black">{title}</p>
        <p className="text-[15px] leading-6 text-black/70">{text}</p>
      </div>
    </li>
  );
}

export default function PrimePage() {
  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-[980px] px-6 pb-20 pt-14 md:pt-20">
        {/* Hero */}
        <section>
          <p className="mb-3 inline-flex items-center rounded-full border border-black/15 bg-white/80 px-3 py-1 text-xs font-semibold tracking-wide text-black/75">
            MOST ADVANCED PLAN
          </p>

          <h1 className="text-4xl font-bold tracking-tight text-black md:text-6xl">
            Ambit Enterprise
          </h1>

          <p className="mt-4 max-w-3xl text-lg leading-8 text-black/70">
            Enterprise-grade contract sourcing and execution support for companies
            that need consistent pipeline, faster decisions, and direct executive
            access.
          </p>
        </section>

        {/* Pricing + CTA */}
        <section className="mt-8 rounded-3xl border border-black/10 bg-white/85 p-7 shadow-[0_10px_30px_rgba(0,0,0,0.06)] md:p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-wide text-black/55">
                Enterprise Pricing
              </p>
              <p className="mt-1 text-4xl font-bold tracking-tight text-black md:text-5xl">
                $1499.99
                <span className="text-base font-medium text-black/60"> / month</span>
              </p>
              <p className="mt-3 max-w-2xl text-[15px] leading-6 text-black/70">
                Built for organizations that treat pipeline as an operating system.
                This is AMBIT’s highest-touch plan with 24/7 founder access and
                priority execution support.
              </p>
            </div>

            <div className="flex w-full flex-col gap-3 md:w-auto md:items-end">
              <Link
                href="/get-started?plan=enterprise"
                className="inline-flex items-center justify-center rounded-xl border border-black px-5 py-3 text-sm font-semibold text-black transition hover:bg-black hover:text-white"
              >
                Apply for Ambit Enterprise
              </Link>
              <p className="text-xs text-black/55">Limited enterprise onboarding slots each month.</p>
            </div>
          </div>
        </section>

        {/* What's Included */}
        <section className="mt-6 rounded-3xl border border-black/10 bg-white/85 p-7 shadow-[0_8px_24px_rgba(0,0,0,0.05)] md:p-8">
          <h2 className="text-3xl font-bold tracking-tight text-black">
            What’s included for $1499.99/mo
          </h2>

          <ul className="mt-5 grid gap-4 md:grid-cols-2">
            {INCLUDED.map((item) => (
              <li key={item} className="flex gap-3 text-[15px] leading-6 text-black/78">
                <CheckIcon />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Two-column: Best fit + How it works */}
        <section className="mt-6 grid gap-6 md:grid-cols-2">
          <article className="rounded-3xl border border-black/10 bg-white/85 p-7 shadow-[0_8px_24px_rgba(0,0,0,0.05)]">
            <h3 className="text-2xl font-bold tracking-tight text-black">Best fit for</h3>
            <ul className="mt-5 space-y-3">
              {BEST_FIT.map((item) => (
                <li key={item} className="flex gap-3 text-[15px] leading-6 text-black/78">
                  <CheckIcon />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </article>

          <article className="rounded-3xl border border-black/10 bg-white/85 p-7 shadow-[0_8px_24px_rgba(0,0,0,0.05)]">
            <h3 className="text-2xl font-bold tracking-tight text-black">How it works</h3>
            <ol className="mt-5 space-y-5">
              <Step
                number="1"
                title="Enterprise intake"
                text="We map your service lines, ideal contract profile, geographies, and revenue goals."
              />
              <Step
                number="2"
                title="Precision sourcing + vetting"
                text="Your enterprise desk continuously scans and qualifies opportunities to your fit criteria."
              />
              <Step
                number="3"
                title="Executive alignment"
                text="You receive clear pursue/pass recommendations with strategy support from leadership."
              />
              <Step
                number="4"
                title="Execution support"
                text="We support the pursuit workflow and keep your team moving with priority response."
              />
            </ol>
          </article>
        </section>

        {/* Why Enterprise is different */}
        <section className="mt-6 rounded-3xl border border-black/10 bg-white/85 p-7 shadow-[0_8px_24px_rgba(0,0,0,0.05)] md:p-8">
          <h3 className="text-2xl font-bold tracking-tight text-black">
            Why Enterprise is different
          </h3>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {DIFFERENTIATORS.map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-black/10 bg-white/80 p-5"
              >
                <p className="text-base font-semibold text-black">{item.title}</p>
                <p className="mt-2 text-[15px] leading-6 text-black/70">{item.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Final CTA */}
        <section className="mt-6 rounded-3xl border border-black/10 bg-white/85 p-7 text-center shadow-[0_8px_24px_rgba(0,0,0,0.05)] md:p-8">
          <h4 className="text-2xl font-bold tracking-tight text-black md:text-3xl">
            Install an enterprise pipeline system, not guesswork.
          </h4>
          <p className="mx-auto mt-3 max-w-2xl text-[15px] leading-6 text-black/70">
            Ambit Enterprise is designed for teams that want predictable opportunity flow,
            faster bid decisions, and direct executive support.
          </p>
          <div className="mt-6">
            <Link
              href="/get-started?plan=enterprise"
              className="inline-flex items-center justify-center rounded-xl border border-black px-6 py-3 text-sm font-semibold text-black transition hover:bg-black hover:text-white"
            >
              Apply for Ambit Enterprise
            </Link>
          </div>
          <p className="mt-5 text-xs text-black/50">
            Note: Contract awards are never guaranteed; Ambit Enterprise provides sourcing and pursuit support.
          </p>
        </section>
      </div>
    </main>
  );
}
