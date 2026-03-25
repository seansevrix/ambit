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

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden="true">
      <path
        d="M5 12h14"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M13 5l7 7-7 7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
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
        "bg-[linear-gradient(135deg,rgba(26,79,163,0.42),rgba(99,167,255,0.22),rgba(26,79,163,0.10))]",
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

function OfferCard({
  eyebrow,
  title,
  price,
  desc,
  bullets,
  featured = false,
}: {
  eyebrow: string;
  title: string;
  price: string;
  desc: string;
  bullets: string[];
  featured?: boolean;
}) {
  return (
    <div
      className={[
        "rounded-3xl border p-6",
        featured
          ? "border-[#1A4FA3]/25 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(232,240,252,0.92))] shadow-[0_24px_70px_rgba(26,79,163,0.16)]"
          : "border-black/10 bg-white/88 shadow-[0_16px_45px_rgba(0,0,0,0.08)]",
      ].join(" ")}
    >
      <div className="inline-flex rounded-full border border-black/10 bg-white/82 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-black/60">
        {eyebrow}
      </div>

      <div className="mt-4 text-3xl font-black tracking-tight text-black">{title}</div>
      <div className="mt-2 text-2xl font-black text-black">{price}</div>
      <p className="mt-3 text-sm leading-7 text-black/65">{desc}</p>

      <ul className="mt-5 space-y-2.5">
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

function TrustRow() {
  const items = [
    { k: "Main offer", v: "Managed Capture" },
    { k: "Alternative", v: "Morning Matches" },
    { k: "Checkout", v: "Direct Stripe flow" },
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
            High-touch bid support, built for real operators
          </div>

          <h1 className="mt-5 text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
            AMBIT becomes your outsourced capture desk.
          </h1>

          <p className="mt-4 max-w-4xl text-[17px] leading-8 text-black/72 sm:text-[18px]">
            <span className="font-semibold text-black/88">Managed Capture</span> is
            the main lane. AMBIT helps source work, pressure-test real fits,
            support proposal development, track amendments, and keep the front-end
            bid workload moving so your team can stay focused on execution instead
            of drowning in admin.
          </p>

          <div className="mt-6 grid max-w-4xl gap-3 sm:grid-cols-3">
            <MetricPill label="Main offer" value="Managed Capture" />
            <MetricPill label="Starting at" value="$1,499.99/mo" />
            <MetricPill label="Alternative" value="Morning Matches" />
          </div>
        </div>

        <div className="mt-10 grid gap-5 lg:grid-cols-[1.2fr_.8fr]">
          <OfferCard
            featured
            eyebrow="Flagship offer"
            title="Managed Capture"
            price="$1,499.99/mo"
            desc="For contractors who want a real partner helping manage the front-end bid motion — not just another list of leads."
            bullets={[
              "Active opportunity sourcing",
              "Fit review + bid / no-bid triage",
              "Proposal support + admin handling",
              "Amendment + deadline tracking",
              "Priority handling on active pursuits",
              "Weekly pipeline accountability",
            ]}
          />

          <OfferCard
            eyebrow="Cheap self-serve alternative"
            title="Morning Matches"
            price="$49.99/mo"
            desc="For companies that only want ranked opportunities delivered daily and prefer to handle capture and proposal work internally."
            bullets={[
              "Daily matched opportunities",
              "Ranked by fit",
              "Low-cost self-serve lane",
              "Cancel anytime",
            ]}
          />
        </div>

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
            title="What you’re actually buying"
            desc="Not software. Not just alerts. You’re buying speed, clarity, and a real lane around active pursuits."
            bullets={[
              "Capture judgment",
              "Proposal support",
              "Deadline visibility",
              "A more organized pipeline",
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
                <div className="text-2xl font-black tracking-tight">
                  Start your lane
                </div>
                <div className="mt-1 text-sm text-black/60">
                  Managed Capture and Morning Matches both go straight into secure
                  Stripe checkout.
                </div>
              </div>

              <span className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/80 px-3 py-1 text-[11px] font-semibold text-black/70 shadow-sm">
                <span className="text-black/70">
                  <LockIcon />
                </span>
                Direct checkout
              </span>
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
              title="Choose your lane"
              desc="Pick Managed Capture if you want AMBIT in the room, or Morning Matches if you only want daily opportunities sent over."
            />
            <Step
              n={2}
              title="Complete checkout securely"
              desc="Signup goes straight into Stripe. Once activated, your profile and targeting can be updated anytime."
            />
            <Step
              n={3}
              title="Start moving faster"
              desc="Managed Capture adds real support around active pursuits. Morning Matches keeps it simple and self-serve."
            />
          </div>

          <div className="mt-5 rounded-2xl border border-black/10 bg-white/80 p-4 text-sm text-black/62">
            <span className="font-semibold text-black/78">Privacy:</span> AMBIT
            uses your profile only to match and deliver opportunities. No spam.
          </div>

          <div className="mt-4 text-sm text-black/62">
            Already subscribed?{" "}
            <Link
              href="/login"
              className="font-semibold text-[#1A4FA3] hover:underline"
            >
              Log in
            </Link>
          </div>
        </div>

        <div className="mt-8 rounded-3xl border border-black/12 bg-white/85 p-6 shadow-[0_18px_55px_rgba(0,0,0,0.08)]">
          <div className="flex items-center gap-2 text-lg font-black">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-2xl bg-[#1A4FA3]/10 text-[#1A4FA3]">
              <ArrowIcon />
            </span>
            Best fit
          </div>

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
        </div>

        <TrustRow />
      </div>
    </main>
  );
}