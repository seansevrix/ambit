// app/get-started/page.tsx
import { Suspense, type ReactNode } from "react";
import Link from "next/link";
import GetStartedClient from "./GetStartedClient";

const TRUST_BADGES = [
  "Subscription required",
  "$49.99/mo - Associate",
  "$299/mo - Executive",
  "$899.99/mo - Enterprise",
];

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
    <div className="h-[360px] flex items-center justify-center">
      <div className="w-full max-w-xl rounded-3xl border border-black/10 bg-white/75 backdrop-blur-md p-6 shadow-[0_24px_80px_rgba(0,0,0,0.10)]">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-2xl bg-black/5 flex items-center justify-center">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-black/20 border-t-black/60" />
          </div>

          <div className="min-w-0">
            <div className="text-black text-base font-semibold">Getting your setup ready…</div>
            <div className="text-black/60 text-sm mt-0.5">Loading your profile builder.</div>
          </div>
        </div>

        <div className="mt-5 h-2 w-full rounded-full bg-black/10 overflow-hidden">
          <div className="h-full w-[55%] bg-black/30" />
        </div>

        <div className="mt-4 text-xs text-black/50">One moment — this usually takes a second.</div>
      </div>
    </div>
  );
}

function Step({ n, title, desc }: { n: number; title: string; desc: string }) {
  return (
    <div className="flex gap-3">
      <div className="mt-0.5 h-7 w-7 shrink-0 rounded-full bg-black/5 flex items-center justify-center text-[11px] font-black text-black/70">
        {n}
      </div>
      <div>
        <div className="font-semibold text-black/85">{title}</div>
        <div className="text-black/60 text-sm">{desc}</div>
      </div>
    </div>
  );
}

function MicroTrustRow() {
  const items = [
    { k: "Active subscription", v: "required" },
    { k: "Setup time", v: "~60 seconds" },
    { k: "Edit anytime", v: "keywords + NAICS" },
  ];

  return (
    <div className="mt-6 rounded-3xl border border-black/10 bg-white/70 backdrop-blur-md px-5 py-4 shadow-[0_18px_55px_rgba(0,0,0,0.08)]">
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
  badge,
  bullets,
  note,
  featured = false,
}: {
  name: string;
  price: string;
  subtitle: string;
  badge: string;
  bullets: string[];
  note: string;
  featured?: boolean;
}) {
  return (
    <div
      className={[
        "rounded-3xl border p-6 bg-white/75 backdrop-blur-md",
        featured
          ? "border-[#1A4FA3]/35 shadow-[0_20px_55px_rgba(26,79,163,0.16)]"
          : "border-black/10 shadow-[0_16px_45px_rgba(0,0,0,0.10)]",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-4xl font-black tracking-tight">{name}</div>
          <div className="mt-2 text-3xl font-black">{price}</div>
          <div className="mt-1 text-sm text-black/60">{subtitle}</div>
        </div>

        <span
          className={[
            "rounded-full px-3 py-1 text-[11px] font-bold border",
            featured
              ? "border-[#1A4FA3]/30 bg-[#1A4FA3]/10 text-[#1A4FA3]"
              : "border-black/15 bg-white text-black/65",
          ].join(" ")}
        >
          {badge}
        </span>
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

/** Subtle blue-highlight frame to make the signup card feel alive */
function GlowFrame({ children, className = "" }: { children: ReactNode; className?: string }) {
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

      {/* Blueprint grid (minor + major) */}
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
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight">
            Start getting matched opportunities today
          </h1>

          <p className="mt-3 max-w-3xl text-black/65">
            Create your profile in about 60 seconds. We’ll deliver ranked matches daily across{" "}
            <span className="font-semibold text-black/80">
              Residential • Commercial • Government
            </span>
            , with optional high-touch coordination for growth-focused teams.
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            {TRUST_BADGES.map((t) => (
              <span
                key={t}
                className="rounded-full border border-black/10 bg-white/60 px-3 py-1 text-xs font-semibold text-black/70 backdrop-blur"
              >
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* ENTERPRISE CALL-OUT */}
        <div className="mt-6 rounded-3xl border border-[#1A4FA3]/25 bg-[linear-gradient(135deg,rgba(26,79,163,0.10),rgba(99,167,255,0.06))] p-5 shadow-[0_18px_55px_rgba(26,79,163,0.14)]">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-xs font-bold uppercase tracking-wide text-[#1A4FA3]">
                Ambit Enterprise
              </div>
              <div className="mt-1 text-lg font-black text-black">
                $899.99/mo • 24/7 CEO/Founder access + dedicated enterprise sourcing desk
              </div>
              <div className="mt-1 text-sm text-black/68">
                Designed for serious operators who need executive-level support, priority triage, and tighter
                pursuit discipline.
              </div>
            </div>
            <Link
              href="/prime"
              className="inline-flex items-center justify-center rounded-full border border-[#1A4FA3]/30 bg-white/75 px-4 py-2 text-xs font-bold text-[#1A4FA3] hover:bg-white"
            >
              View Enterprise details
            </Link>
          </div>
        </div>

        {/* SIGNUP CARD */}
        <GlowFrame className="mt-10">
          <div className="flex items-center justify-between border-b border-black/10 px-6 py-5 sm:px-8">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-black/5 flex items-center justify-center font-black">
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
              Subscription required
            </span>
          </div>

          <div className="px-6 py-6 sm:px-8 sm:py-8">
            <Suspense fallback={<LoadingFallback />}>
              <GetStartedClient />
            </Suspense>
          </div>
        </GlowFrame>

        {/* PLAN REFERENCE ONLY */}
        <div className="mt-8 rounded-3xl border border-black/10 bg-white/70 backdrop-blur-md p-6 shadow-[0_18px_55px_rgba(0,0,0,0.10)]">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <h2 className="text-2xl font-black tracking-tight">Plan details (reference)</h2>
            <span className="rounded-full border border-[#1A4FA3]/25 bg-[#1A4FA3]/10 px-3 py-1 text-xs font-semibold text-[#1A4FA3]">
              Paid-first secure checkout flow
            </span>
          </div>

          <div className="mt-5 grid gap-5 lg:grid-cols-3">
            <PlanReferenceCard
              name="Associate"
              price="$49.99/mo"
              subtitle="Daily matched opportunities"
              badge="Best for getting started"
              bullets={[
                "Residential, Commercial, and Government matches",
                "Ranked opportunities delivered daily",
                "AMBIT-built proposal support",
                "Project breakdown and summary",
                "Fast setup and simple dashboard access",
                "24/7 support lane",
              ]}
              note="Great fit for operators who want consistent opportunity flow and fast execution."
            />

            <PlanReferenceCard
              name="Executive"
              price="$299/mo"
              subtitle="Higher-touch bid-readiness support"
              badge="Most growth-focused"
              bullets={[
                "Everything in Associate",
                "Priority support path",
                "Higher-touch bid coordination",
                "Faster commercial/government support workflows",
                "AMBIT Prime/priority lane access",
                "Enhanced response speed for active pursuits",
              ]}
              note="Built for teams targeting bigger contracts with tighter coordination."
            />

            <PlanReferenceCard
              featured
              name="Enterprise"
              price="$899.99/mo"
              subtitle="Executive-grade sourcing + founder access"
              badge="Highest-touch tier"
              bullets={[
                "Everything in Executive",
                "24/7 direct CEO/Founder access",
                "Dedicated enterprise sourcing desk (AI + analyst)",
                "Weekly executive pipeline review cadence",
                "Same-day opportunity triage SLA (priority queue)",
                "White-glove onboarding + escalation support",
              ]}
              note="Built for serious operators who need speed, accountability, and enterprise-level execution support."
            />
          </div>

          <div className="mt-6">
            <h3 className="text-xl font-black">What you’ll need to bid confidently</h3>
            <p className="mt-2 text-sm text-black/62">
              We help organize and guide the process, but these are the key items most service companies should have ready for contract work:
            </p>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-black/10 bg-white/70 p-4">
                <div className="font-bold text-black/85">Core business docs</div>
                <ul className="mt-3 space-y-2 text-sm">
                  <li className="flex items-start gap-2"><BlueCheck /> <span>Active business license(s)</span></li>
                  <li className="flex items-start gap-2"><BlueCheck /> <span>Certificate of Insurance (COI)</span></li>
                  <li className="flex items-start gap-2"><BlueCheck /> <span>Service area + scope of work details</span></li>
                </ul>
              </div>

              <div className="rounded-2xl border border-black/10 bg-white/70 p-4">
                <div className="font-bold text-black/85">Bid & pricing readiness</div>
                <ul className="mt-3 space-y-2 text-sm">
                  <li className="flex items-start gap-2"><BlueCheck /> <span>Pricing sheet (labor, materials, markups)</span></li>
                  <li className="flex items-start gap-2"><BlueCheck /> <span>Project timeline + staffing assumptions</span></li>
                  <li className="flex items-start gap-2"><BlueCheck /> <span>Past project references/examples when available</span></li>
                </ul>
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-[#1A4FA3]/20 bg-[#1A4FA3]/8 p-4 text-sm text-black/75">
              Enterprise includes AMBIT’s highest-priority execution lane, with 24/7 founder access and a dedicated sourcing desk.
            </div>
          </div>

          <div className="mt-6 overflow-x-auto">
            <h3 className="text-xl font-black mb-3">Side-by-side comparison</h3>
            <table className="w-full min-w-[980px] text-sm">
              <thead>
                <tr className="border-b border-black/10 text-left">
                  <th className="py-3 pr-4 font-semibold text-black/65">Feature</th>
                  <th className="py-3 px-4 font-semibold text-black/65">Associate</th>
                  <th className="py-3 px-4 font-semibold text-black/65">Executive</th>
                  <th className="py-3 px-4 font-semibold text-black/65">Enterprise</th>
                </tr>
              </thead>
              <tbody className="text-black/82">
                <tr className="border-b border-black/10">
                  <td className="py-3 pr-4">Residential + Commercial + Government matches</td>
                  <td className="py-3 px-4"><BlueCheck /> Included</td>
                  <td className="py-3 px-4"><BlueCheck /> Included</td>
                  <td className="py-3 px-4"><BlueCheck /> Included</td>
                </tr>

                <tr className="border-b border-black/10">
                  <td className="py-3 pr-4">Ranked opportunities delivered daily</td>
                  <td className="py-3 px-4"><BlueCheck /> Included</td>
                  <td className="py-3 px-4"><BlueCheck /> Included</td>
                  <td className="py-3 px-4"><BlueCheck /> Included</td>
                </tr>

                <tr className="border-b border-black/10">
                  <td className="py-3 pr-4">AMBIT-built proposal support</td>
                  <td className="py-3 px-4"><BlueCheck /> Included</td>
                  <td className="py-3 px-4"><BlueCheck /> Included</td>
                  <td className="py-3 px-4"><BlueCheck /> Included</td>
                </tr>

                <tr className="border-b border-black/10">
                  <td className="py-3 pr-4">Priority support path</td>
                  <td className="py-3 px-4 text-black/45">—</td>
                  <td className="py-3 px-4"><BlueCheck /> Included</td>
                  <td className="py-3 px-4"><BlueCheck /> Included</td>
                </tr>

                <tr className="border-b border-black/10">
                  <td className="py-3 pr-4">Higher-touch bid execution coordination</td>
                  <td className="py-3 px-4 text-black/45">—</td>
                  <td className="py-3 px-4"><BlueCheck /> Included</td>
                  <td className="py-3 px-4"><BlueCheck /> Included</td>
                </tr>

                <tr className="border-b border-black/10">
                  <td className="py-3 pr-4">No-wait commercial/government support workflow</td>
                  <td className="py-3 px-4 text-black/45">—</td>
                  <td className="py-3 px-4"><BlueCheck /> Included</td>
                  <td className="py-3 px-4"><BlueCheck /> Included</td>
                </tr>

                <tr className="border-b border-black/10">
                  <td className="py-3 pr-4">Dedicated enterprise sourcing desk (AI + analyst)</td>
                  <td className="py-3 px-4 text-black/45">—</td>
                  <td className="py-3 px-4 text-black/45">—</td>
                  <td className="py-3 px-4"><BlueCheck /> Included</td>
                </tr>

                <tr className="border-b border-black/10">
                  <td className="py-3 pr-4">24/7 direct CEO/Founder access</td>
                  <td className="py-3 px-4 text-black/45">—</td>
                  <td className="py-3 px-4 text-black/45">—</td>
                  <td className="py-3 px-4"><BlueCheck /> Included</td>
                </tr>

                <tr className="border-b border-black/10">
                  <td className="py-3 pr-4">Weekly executive pipeline review</td>
                  <td className="py-3 px-4 text-black/45">—</td>
                  <td className="py-3 px-4 text-black/45">—</td>
                  <td className="py-3 px-4"><BlueCheck /> Included</td>
                </tr>

                <tr>
                  <td className="py-3 pr-4">Same-day opportunity triage SLA (priority queue)</td>
                  <td className="py-3 px-4 text-black/45">—</td>
                  <td className="py-3 px-4 text-black/45">—</td>
                  <td className="py-3 px-4"><BlueCheck /> Included</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-4 text-sm text-black/62">
            Already subscribed?{" "}
            <Link href="/login" className="font-semibold text-[#1A4FA3] hover:underline">
              Log in
            </Link>
          </div>
        </div>

        {/* BELOW */}
        <div className="mt-8 space-y-4">
          <div className="rounded-3xl border border-black/10 bg-white/70 backdrop-blur-md p-6 shadow-[0_18px_55px_rgba(0,0,0,0.10)]">
            <div className="text-lg font-black">What happens next</div>

            <div className="mt-4 space-y-4">
              <Step
                n={1}
                title="We build your profile"
                desc="Service area + keywords + NAICS → improved match accuracy."
              />
              <Step
                n={2}
                title="Matches begin daily"
                desc="Ranked opportunities are delivered every morning."
              />
              <Step
                n={3}
                title="Execution lane activates"
                desc="Associate/Executive/Enterprise support cadence starts based on your selected plan."
              />
            </div>

            <div className="mt-5 rounded-2xl border border-black/10 bg-white/70 p-4 text-sm text-black/60">
              <span className="font-semibold text-black/75">Privacy:</span> AMBIT uses your profile only to match and deliver opportunities. No spam.
            </div>
          </div>

          <div className="rounded-3xl border border-black/10 bg-white/70 backdrop-blur-md p-6 shadow-[0_18px_55px_rgba(0,0,0,0.10)]">
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
        </div>

        <MicroTrustRow />
      </div>
    </main>
  );
}
