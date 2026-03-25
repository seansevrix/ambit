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
    <div className="flex h-[320px] items-center justify-center">
      <div className="w-full max-w-xl rounded-3xl border border-black/10 bg-white/92 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.10)]">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-black/5">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-black/20 border-t-black/60" />
          </div>

          <div className="min-w-0">
            <div className="text-base font-semibold text-black">
              Loading secure checkout...
            </div>
            <div className="mt-0.5 text-sm text-black/60">
              Building your signup lane.
            </div>
          </div>
        </div>

        <div className="mt-5 h-2 w-full overflow-hidden rounded-full bg-black/10">
          <div className="h-full w-[58%] bg-black/30" />
        </div>

        <div className="mt-4 text-xs text-black/50">
          One moment — this usually takes a second.
        </div>
      </div>
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
        "bg-[linear-gradient(135deg,rgba(26,79,163,0.42),rgba(99,167,255,0.24),rgba(26,79,163,0.10))]",
        "shadow-[0_28px_90px_rgba(26,79,163,0.16)]",
      ].join(" ")}
    >
      <div className="rounded-[28px] border border-white/70 bg-white/88">
        {children}
      </div>
    </div>
  );
}

function MetricPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-black/10 bg-white/84 px-4 py-3 shadow-sm">
      <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-black/45">
        {label}
      </div>
      <div className="mt-1 text-sm font-black text-black/88">{value}</div>
    </div>
  );
}

function Step({
  n,
  title,
  desc,
}: {
  n: number;
  title: string;
  desc: string;
}) {
  return (
    <div className="flex gap-3">
      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-black/5 text-[11px] font-black text-black/70">
        {n}
      </div>
      <div>
        <div className="font-semibold text-black/90">{title}</div>
        <div className="text-sm text-black/65">{desc}</div>
      </div>
    </div>
  );
}

function ValueCard({
  title,
  desc,
  bullets,
}: {
  title: string;
  desc: string;
  bullets: string[];
}) {
  return (
    <div className="rounded-3xl border border-black/10 bg-white/88 p-6 shadow-[0_16px_45px_rgba(0,0,0,0.08)]">
      <div className="text-lg font-black tracking-tight text-black">{title}</div>
      <p className="mt-2 text-sm leading-7 text-black/65">{desc}</p>

      <ul className="mt-4 space-y-2.5">
        {bullets.map((b) => (
          <li key={b} className="flex items-start gap-2 text-sm text-black/82">
            <span className="mt-[1px]">
              <BlueCheck />
            </span>
            <span>{b}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function MicroTrustRow() {
  const items = [
    { k: "Primary offer", v: "Managed Capture" },
    { k: "Alternative", v: "Morning Matches" },
    { k: "Checkout", v: "Secure Stripe flow" },
  ];

  return (
    <div className="mt-6 rounded-3xl border border-black/12 bg-white/85 px-5 py-4 shadow-[0_18px_55px_rgba(0,0,0,0.08)]">
      <div className="grid gap-3 sm:grid-cols-3">
        {items.map((x) => (
          <div key={x.k} className="flex items-center gap-3">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-2xl bg-black/5">
              <span className="h-2 w-2 rounded-full bg-[#1A4FA3]" />
            </span>
            <div className="leading-tight">
              <div className="text-xs font-semibold text-black/55">{x.k}</div>
              <div className="text-sm font-black text-black/85">{x.v}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <main className="min-h-screen text-black">
      <div className="pointer-events-none fixed inset-0 -z-[90] bg-[#DEDEDE]" />

      <div className="pointer-events-none fixed inset-0 -z-[85]">
        <div className="absolute inset-0 opacity-[0.11] [background-image:linear-gradient(to_right,rgba(0,0,0,0.14)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.14)_1px,transparent_1px)] [background-size:72px_72px]" />
        <div className="absolute inset-0 opacity-[0.06] [background-image:linear-gradient(to_right,rgba(0,0,0,0.20)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.20)_1px,transparent_1px)] [background-size:360px_360px]" />
      </div>

      <div className="pointer-events-none fixed inset-0 -z-[80]">
        <div className="absolute inset-0 bg-[radial-gradient(900px_520px_at_50%_0%,rgba(92,116,255,0.14),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(700px_420px_at_85%_20%,rgba(52,211,153,0.08),transparent_55%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-white/[0.16] via-transparent to-transparent" />
      </div>

      <div className="mx-auto max-w-[1140px] px-6 pb-14 pt-20 lg:px-10 lg:pt-24">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="text-sm font-semibold text-black/60 transition hover:text-black"
          >
            ← Back
          </Link>

          <span className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/80 px-3 py-1 text-[11px] font-semibold text-black/70 shadow-sm">
            <span className="text-black/70">
              <LockIcon />
            </span>
            Secure signup
          </span>
        </div>

        <div className="mt-8 max-w-5xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#1A4FA3]/16 bg-white/85 px-3 py-1.5 text-xs font-semibold text-black/72 shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-[#1A4FA3]" />
            Managed Capture is the main lane
          </div>

          <h1 className="mt-5 text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
            AMBIT becomes your outsourced capture desk.
          </h1>

          <p className="mt-4 max-w-4xl text-[17px] leading-8 text-black/72 sm:text-[18px]">
            This is not just another lead feed.{" "}
            <span className="font-semibold text-black/88">
              Managed Capture
            </span>{" "}
            is the high-touch lane where AMBIT helps source work, pressure-test
            fits, organize active pursuits, support proposal development, track
            amendments, and keep the front-end bid workload moving so your team can
            stay focused on execution.
          </p>

          <div className="mt-6 grid max-w-4xl gap-3 sm:grid-cols-3">
            <MetricPill label="Main offer" value="Managed Capture" />
            <MetricPill label="Starting at" value="$1,500/mo" />
            <MetricPill label="Cheap alternative" value="Morning Matches" />
          </div>
        </div>

        <GlowFrame className="mt-10">
          <div className="grid gap-0 lg:grid-cols-[1.15fr_.85fr]">
            <div className="border-b border-black/10 px-6 py-6 sm:px-8 lg:border-b-0 lg:border-r">
              <div className="inline-flex rounded-full border border-[#1A4FA3]/20 bg-[#1A4FA3]/8 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-[#1A4FA3]">
                Flagship offer
              </div>

              <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">
                Managed Capture
              </h2>

              <div className="mt-2 text-2xl font-black text-black">
                Starting at $1,500/mo
              </div>

              <p className="mt-4 max-w-2xl text-[15px] leading-7 text-black/68">
                For contractors who want real help managing the front-end bid
                motion, not just opportunities dumped in their inbox.
              </p>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {[
                  "Active opportunity sourcing",
                  "Fit review + bid / no-bid triage",
                  "Proposal support + admin handling",
                  "Amendment + deadline tracking",
                  "Weekly pipeline accountability",
                  "Priority handling on active pursuits",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-start gap-2 rounded-2xl border border-black/10 bg-white/78 px-4 py-3 text-sm text-black/82"
                  >
                    <span className="mt-[1px]">
                      <BlueCheck />
                    </span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              <div className="mt-5 rounded-2xl border border-black/10 bg-white/82 p-4 text-sm leading-7 text-black/65">
                Best for companies actively bidding and needing a real partner in
                the room. Large or unusually complex full-build proposals can still
                be scoped separately.
              </div>
            </div>

            <div className="px-6 py-6 sm:px-8">
              <div className="rounded-3xl border border-black/10 bg-white/92 p-5 shadow-[0_18px_45px_rgba(0,0,0,0.08)]">
                <div className="text-sm font-black uppercase tracking-[0.12em] text-black/45">
                  High-touch lane
                </div>

                <div className="mt-2 text-2xl font-black tracking-tight">
                  Want AMBIT handling the front-end workload?
                </div>

                <p className="mt-3 text-sm leading-7 text-black/65">
                  Request Managed Capture and we’ll shape the lane around your
                  company, service area, trade scope, and bid volume.
                </p>

                <a
                  href="mailto:ambit@sevrixgov.com?subject=AMBIT%20Managed%20Capture%20Request&body=Hi%20AMBIT%20team%2C%0A%0AI%E2%80%99m%20interested%20in%20Managed%20Capture.%20Here%E2%80%99s%20my%20info%3A%0A-%20Company%3A%0A-%20Email%3A%0A-%20Service%20area%3A%0A-%20Trade%2Fscope%3A%0A-%20Typical%20bid%20volume%3A%0A%0AThanks."
                  className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-[#1A4FA3] px-5 py-3 text-sm font-semibold text-white shadow-[0_16px_40px_rgba(26,79,163,0.22)] transition hover:brightness-110"
                >
                  Request Managed Capture
                </a>

                <div className="mt-4 rounded-2xl border border-[#1A4FA3]/16 bg-[#1A4FA3]/6 p-4 text-sm text-black/68">
                  Managed Capture is what AMBIT is built to do.
                </div>

                <div className="mt-4 text-xs text-black/52">
                  Need something lighter? Morning Matches is still available below.
                </div>
              </div>
            </div>
          </div>
        </GlowFrame>

        <div className="mt-8 grid gap-5 lg:grid-cols-3">
          <ValueCard
            title="What we take off your desk"
            desc="Managed Capture is strongest when your team is spending too much time hunting opportunities, sorting requirements, and chasing admin."
            bullets={[
              "Opportunity hunting",
              "Initial qualification",
              "Amendment watching",
              "Bid organization",
            ]}
          />

          <ValueCard
            title="What you’re really buying"
            desc="Not software. Not just a feed. You’re buying speed, clarity, and pressure relief around active pursuits."
            bullets={[
              "Capture judgment",
              "Proposal support",
              "Deadline visibility",
              "A real operating rhythm",
            ]}
          />

          <ValueCard
            title="Who gets the most value"
            desc="Best for service companies, operators, and regional contractors who want to bid more without hiring a full internal team yet."
            bullets={[
              "Owners stretched thin",
              "Estimators buried in admin",
              "Teams without proposal bandwidth",
              "Companies serious about growth",
            ]}
          />
        </div>

        <GlowFrame className="mt-8">
          <div className="border-b border-black/10 px-6 py-5 sm:px-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-xl font-black tracking-tight">
                  Morning Matches
                </div>
                <div className="mt-1 text-sm text-black/60">
                  Cheap self-serve alternative for companies that only want ranked
                  opportunities delivered.
                </div>
              </div>

              <div className="rounded-full border border-black/10 bg-white/82 px-3 py-1 text-xs font-semibold text-black/68 shadow-sm">
                $49.99/mo
              </div>
            </div>
          </div>

          <div className="border-b border-black/10 px-6 py-4 sm:px-8">
            <div className="grid gap-3 md:grid-cols-2">
              {[
                "Daily matched opportunities",
                "Ranked shortlist (best fits first)",
                "Edit keywords + NAICS anytime",
                "Low-cost, self-serve lane",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-start gap-2 text-sm text-black/78"
                >
                  <span className="mt-[1px]">
                    <BlueCheck />
                  </span>
                  <span>{item}</span>
                </div>
              ))}
            </div>

            <div className="mt-4 rounded-2xl border border-black/10 bg-white/80 p-4 text-sm leading-7 text-black/62">
              Good fit if you only want daily opportunities sent over and your team
              handles capture, proposal work, and follow-through internally.
            </div>
          </div>

          <div className="px-6 py-6 sm:px-8 sm:py-8">
            <Suspense fallback={<LoadingFallback />}>
              <GetStartedClient />
            </Suspense>
          </div>
        </GlowFrame>

        <div className="mt-8 rounded-3xl border border-black/12 bg-white/85 p-6 shadow-[0_18px_55px_rgba(0,0,0,0.08)]">
          <div className="text-lg font-black">What happens next</div>

          <div className="mt-4 space-y-4">
            <Step
              n={1}
              title="You choose your lane"
              desc="Request Managed Capture for high-touch support, or start with Morning Matches if you only want daily opportunities."
            />
            <Step
              n={2}
              title="We sharpen the targeting"
              desc="Service area, trade scope, keywords, and NAICS improve fit quality and reduce noise."
            />
            <Step
              n={3}
              title="You move faster on the right work"
              desc="Managed Capture adds real front-end bid support. Morning Matches keeps it simple and self-serve."
            />
          </div>

          <div className="mt-5 rounded-2xl border border-black/10 bg-white/80 p-4 text-sm text-black/62">
            <span className="font-semibold text-black/78">Privacy:</span> AMBIT
            uses your profile only to match and deliver opportunities. No spam.
          </div>

          <div className="mt-4 text-sm text-black/62">
            Already subscribed?{" "}
            <Link href="/login" className="font-semibold text-[#1A4FA3] hover:underline">
              Log in
            </Link>
          </div>
        </div>

        <div className="mt-8 rounded-3xl border border-black/12 bg-white/85 p-6 shadow-[0_18px_55px_rgba(0,0,0,0.08)]">
          <div className="text-lg font-black">What you need to bid confidently</div>

          <p className="mt-2 text-sm text-black/62">
            Managed Capture helps organize the motion, but the strongest clients are
            already reasonably bid-ready.
          </p>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-black/10 bg-white/80 p-4">
              <div className="font-bold text-black/85">Core business docs</div>
              <ul className="mt-3 space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <BlueCheck /> <span>Active business license(s)</span>
                </li>
                <li className="flex items-start gap-2">
                  <BlueCheck /> <span>Certificate of Insurance (COI)</span>
                </li>
                <li className="flex items-start gap-2">
                  <BlueCheck /> <span>Service area + scope details</span>
                </li>
              </ul>
            </div>

            <div className="rounded-2xl border border-black/10 bg-white/80 p-4">
              <div className="font-bold text-black/85">Bid readiness</div>
              <ul className="mt-3 space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <BlueCheck />{" "}
                  <span>Basic pricing sheet (labor, materials, markup)</span>
                </li>
                <li className="flex items-start gap-2">
                  <BlueCheck /> <span>Staffing / timeline assumptions</span>
                </li>
                <li className="flex items-start gap-2">
                  <BlueCheck /> <span>Past performance examples, if available</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-[#1A4FA3]/20 bg-[#1A4FA3]/8 p-4 text-sm leading-7 text-black/75">
            The value in Managed Capture is not just more opportunities. It is having
            a real lane around sourcing, qualification, proposal support, and bid
            admin so the right pursuits actually move.
          </div>
        </div>

        <div className="mt-8 rounded-3xl border border-black/12 bg-white/85 p-6 shadow-[0_18px_55px_rgba(0,0,0,0.08)]">
          <div className="text-lg font-black">Best fit</div>

          <div className="mt-4 flex flex-wrap gap-2">
            {[
              "Landscaping",
              "HVAC",
              "Plumbing",
              "Electrical",
              "Concrete",
              "Janitorial",
              "Regional contractors",
              "Multi-crew operators",
            ].map((t) => (
              <span
                key={t}
                className="rounded-full border border-black/10 bg-white/80 px-3 py-1 text-xs font-semibold text-black/72 shadow-sm transition hover:-translate-y-[1px] hover:bg-white"
              >
                {t}
              </span>
            ))}
          </div>

          <div className="mt-4 text-sm text-black/58">
            Best for teams that want more than alerts and need actual help driving
            the front-end bid process.
          </div>

          <div className="mt-3 text-xs text-black/52">
            Common keywords:{" "}
            <span className="font-semibold text-black/62">
              emergency, preventive maintenance, install, repair, demo, cleanup
            </span>
          </div>
        </div>

        <MicroTrustRow />
      </div>
    </main>
  );
}