// app/get-started/page.tsx
import { Suspense, type ReactNode } from "react";
import Link from "next/link";
import GetStartedClient from "./GetStartedClient";

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

function BlueCheck() {
  return <span className="font-black text-[#1A4FA3]">✓</span>;
}

function LoadingFallback() {
  return (
    <div className="flex h-[360px] items-center justify-center">
      <div className="w-full max-w-xl rounded-3xl border border-black/10 bg-white/75 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.10)] backdrop-blur-md">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-black/5">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-black/20 border-t-black/60" />
          </div>

          <div className="min-w-0">
            <div className="text-base font-semibold text-black">
              Getting your setup ready…
            </div>
            <div className="mt-0.5 text-sm text-black/60">
              Loading your profile builder.
            </div>
          </div>
        </div>

        <div className="mt-5 h-2 w-full overflow-hidden rounded-full bg-black/10">
          <div className="h-full w-[55%] bg-black/30" />
        </div>

        <div className="mt-4 text-xs text-black/50">
          One moment — this usually takes a second.
        </div>
      </div>
    </div>
  );
}

function Step({ n, title, desc }: { n: number; title: string; desc: string }) {
  return (
    <div className="flex gap-3">
      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-black/5 text-[11px] font-black text-black/70">
        {n}
      </div>
      <div>
        <div className="font-semibold text-black/85">{title}</div>
        <div className="text-sm text-black/60">{desc}</div>
      </div>
    </div>
  );
}

function MicroTrustRow() {
  const items = [
    { k: "Setup time", v: "~60 seconds" },
    { k: "Delivery", v: "Daily matches" },
    { k: "Edit anytime", v: "keywords + NAICS" },
  ];

  return (
    <div className="mt-6 rounded-3xl border border-black/10 bg-white/70 px-5 py-4 shadow-[0_18px_55px_rgba(0,0,0,0.08)] backdrop-blur-md">
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

function PlanReferenceCard({
  name,
  price,
  subtitle,
  bullets,
  note,
  featured = false,
}: {
  name: string;
  price: string;
  subtitle: string;
  bullets: string[];
  note: string;
  featured?: boolean;
}) {
  return (
    <div
      className={[
        "rounded-3xl border bg-white/75 p-6 backdrop-blur-md",
        featured
          ? "border-[#1A4FA3]/35 shadow-[0_20px_55px_rgba(26,79,163,0.16)]"
          : "border-black/10 shadow-[0_16px_45px_rgba(0,0,0,0.10)]",
      ].join(" ")}
    >
      <div>
        <div className="text-4xl font-black tracking-tight">{name}</div>
        <div className="mt-2 text-3xl font-black">{price}</div>
        <div className="mt-1 text-sm text-black/60">{subtitle}</div>
      </div>

      <ul className="mt-5 space-y-2.5">
        {bullets.map((b) => (
          <li key={b} className="flex items-start gap-2 text-[15px] text-black/86">
            <span className="mt-[1px]">
              <BlueCheck />
            </span>
            <span>{b}</span>
          </li>
        ))}
      </ul>

      <p className="mt-5 text-sm text-black/62">{note}</p>
    </div>
  );
}

function GlowFrame({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={[
        className,
        "rounded-[30px] p-[1.5px]",
        "bg-[linear-gradient(135deg,rgba(26,79,163,0.46),rgba(99,167,255,0.28),rgba(26,79,163,0.10))]",
        "shadow-[0_28px_90px_rgba(26,79,163,0.20)]",
      ].join(" ")}
    >
      <div className="rounded-[28px] border border-white/65 bg-white/78 backdrop-blur-md">
        {children}
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <main className="min-h-screen text-black">
      {/* Base tone */}
      <div className="pointer-events-none fixed inset-0 -z-[90] bg-[#DEDEDE]" />

      {/* Blueprint grid */}
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

      <div className="mx-auto max-w-[1140px] px-6 py-12 lg:px-10">
        {/* Top row */}
        <div className="flex items-center justify-between">
          <Link href="/" className="text-sm font-semibold text-black/60 hover:text-black">
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
          <h1 className="text-4xl font-black tracking-tight sm:text-5xl">
            Start getting matched opportunities today
          </h1>

          <p className="mt-3 max-w-4xl text-black/65">
            Build your profile in{" "}
            <span className="font-semibold text-black/80">~60 seconds</span>.
            AMBIT sends ranked opportunities daily, and{" "}
            <span className="font-semibold text-black/80">Pro / Enterprise</span>{" "}
            adds a{" "}
            <span className="font-semibold text-black/80">1:1 contract analyst</span>{" "}
            with summaries + templates.
          </p>

          <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/65 px-3 py-1.5 text-xs font-semibold text-black/65 backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-[#1A4FA3]" />
            Only work email is required to start
          </div>
        </div>

        {/* Signup card */}
        <GlowFrame className="mt-10">
          <div className="flex items-center justify-between border-b border-black/10 px-6 py-5 sm:px-8">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-black/5 font-black">
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
              Secure checkout
            </span>
          </div>

          <div className="border-b border-black/10 px-6 py-3 sm:px-8">
            <div className="text-xs text-black/55">
              Choose a plan, add your basic profile, and continue to checkout.
            </div>
          </div>

          <div className="px-6 py-6 sm:px-8 sm:py-8">
            <Suspense fallback={<LoadingFallback />}>
              <GetStartedClient />
            </Suspense>
          </div>
        </GlowFrame>

        {/* What happens next */}
        <div className="mt-8 rounded-3xl border border-black/10 bg-white/70 p-6 shadow-[0_18px_55px_rgba(0,0,0,0.10)] backdrop-blur-md">
          <div className="text-lg font-black">What happens next</div>

          <div className="mt-4 space-y-4">
            <Step n={1} title="We build your profile" desc="Service area + keywords + NAICS → better match accuracy." />
            <Step n={2} title="Matches begin daily" desc="Ranked opportunities are delivered every morning." />
            <Step
              n={3}
              title="Move faster (optional)"
              desc="Pro/Enterprise adds summaries, templates, and 1:1 analyst help."
            />
          </div>

          <div className="mt-5 rounded-2xl border border-black/10 bg-white/70 p-4 text-sm text-black/60">
            <span className="font-semibold text-black/75">Privacy:</span> AMBIT uses your profile only to match and deliver opportunities. No spam.
          </div>

          <div className="mt-4 text-sm text-black/62">
            Already subscribed?{" "}
            <Link href="/login" className="font-semibold text-[#1A4FA3] hover:underline">
              Log in
            </Link>
          </div>
        </div>

        {/* Plan details (collapsed by default to reduce friction) */}
        <details className="mt-8 rounded-3xl border border-black/10 bg-white/70 p-6 shadow-[0_18px_55px_rgba(0,0,0,0.10)] backdrop-blur-md">
          <summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-3 [&::-webkit-details-marker]:hidden">
            <div>
              <h2 className="text-2xl font-black tracking-tight">Plan details + what’s included</h2>
              <div className="mt-1 text-sm text-black/55">
                Compare Starter, Pro, and Enterprise before checkout.
              </div>
            </div>

            <span className="rounded-full border border-[#1A4FA3]/25 bg-[#1A4FA3]/10 px-3 py-1 text-xs font-semibold text-[#1A4FA3]">
              Expand
            </span>
          </summary>

          <div className="mt-5 border-t border-black/10 pt-5">
            <div className="grid gap-5 lg:grid-cols-3">
              <PlanReferenceCard
                name="Starter"
                price="$49.99/mo"
                subtitle="Morning matches only"
                bullets={[
                  "Daily matched opportunities (morning email)",
                  "Ranked shortlist (best fits first)",
                  "Edit keywords + NAICS anytime",
                  "Cancel anytime",
                ]}
                note="Best for contractors who just want daily matches, clean and simple."
              />

              <PlanReferenceCard
                featured
                name="Pro"
                price="$129.99/mo"
                subtitle="1:1 analyst + summaries + templates"
                bullets={[
                  "Everything in Starter",
                  "Dedicated 1:1 contract analyst (light lane)",
                  "Skimmable summaries + next steps",
                  "Ready-to-send templates (LOI, emails, checklists)",
                  "Support lane for questions + guidance",
                ]}
                note="Best for contractors who want a human helping them move faster."
              />

              <PlanReferenceCard
                name="Enterprise"
                price="$1,499.99/mo"
                subtitle="Priority lane + execution support"
                bullets={[
                  "Everything in Pro",
                  "Priority triage + faster turnaround on active pursuits",
                  "Weekly pipeline review cadence",
                  "Same-day opportunity triage (priority queue)",
                  "Founder/leadership access",
                ]}
                note="Built for operators who want speed, accountability, and a true priority lane."
              />
            </div>

            <div className="mt-6">
              <h3 className="text-xl font-black">What you’ll need to bid confidently</h3>
              <p className="mt-2 text-sm text-black/62">
                AMBIT helps organize and guide the process — these are the core items most service companies should have ready:
              </p>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-black/10 bg-white/70 p-4">
                  <div className="font-bold text-black/85">Core business docs</div>
                  <ul className="mt-3 space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <BlueCheck /> <span>Active business license(s)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <BlueCheck /> <span>Certificate of Insurance (COI)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <BlueCheck /> <span>Service area + scope of work details</span>
                    </li>
                  </ul>
                </div>

                <div className="rounded-2xl border border-black/10 bg-white/70 p-4">
                  <div className="font-bold text-black/85">Bid readiness</div>
                  <ul className="mt-3 space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <BlueCheck /> <span>Basic pricing sheet (labor, materials, markup)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <BlueCheck /> <span>Staffing/timeline assumptions</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <BlueCheck /> <span>Past performance examples (if available)</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="mt-4 rounded-2xl border border-[#1A4FA3]/20 bg-[#1A4FA3]/8 p-4 text-sm text-black/75">
                Pro and Enterprise include a 1:1 analyst lane — ideal if you want help moving fast on the right opportunities.
              </div>
            </div>
          </div>
        </details>

        {/* Perfect for */}
        <div className="mt-8 rounded-3xl border border-black/10 bg-white/70 p-6 shadow-[0_18px_55px_rgba(0,0,0,0.10)] backdrop-blur-md">
          <div className="text-lg font-black">Perfect for</div>

          <div className="mt-4 flex flex-wrap gap-2">
            {[
              "Landscaping",
              "HVAC",
              "Plumbing",
              "Junk removal",
              "Concrete",
              "Janitorial",
              "Multi-crew operators",
              "Regional contractors",
            ].map((t) => (
              <span
                key={t}
                className="rounded-full border border-black/10 bg-white/70 px-3 py-1 text-xs font-semibold text-black/70 shadow-sm transition hover:-translate-y-[1px] hover:bg-white"
              >
                {t}
              </span>
            ))}
          </div>

          <div className="mt-4 text-sm text-black/55">
            You can update keywords/NAICS anytime to refine match quality.
          </div>

          <div className="mt-3 text-xs text-black/50">
            Popular keywords:{" "}
            <span className="font-semibold text-black/60">
              emergency, preventive maintenance, install, repair, demo, cleanup
            </span>
          </div>
        </div>

        <MicroTrustRow />
      </div>
    </main>
  );
}