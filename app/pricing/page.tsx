// app/pricing/page.tsx
import Link from "next/link";

const TRUST_BADGES = [
  "7-day free trial",
  "No credit card required",
  "Secure checkout (Stripe)",
  "Cancel anytime",
  "No spam",
];

const FAQ = [
  {
    q: "Do I get charged during the free trial?",
    a: "No. Your trial starts after you create a profile. You won’t be charged until the trial ends. Cancel anytime before that.",
  },
  {
    q: "What happens after I click Get Started?",
    a: "You’ll create a quick profile (markets + NAICS + keywords + location). Then AMBIT generates your matches in your portal and starts your trial.",
  },
  {
    q: "When do I receive matches?",
    a: "AMBIT sends ranked opportunities daily. Quiet mode reduces noise when there aren’t new matches.",
  },
  {
    q: "Can I change my NAICS/keywords later?",
    a: "Yes — edit your profile anytime and your future matches update automatically.",
  },
  {
    q: "Can I cancel easily?",
    a: "Yes. Cancel anytime from your portal — no contracts, no hassle.",
  },
];

type MiniStat = {
  label: string;
  value: string;
  meta: string;
  delta: string;
};

const LIVE_MINI_STATS: MiniStat[] = [
  { label: "First matches", value: "< 24 hrs", meta: "typical after profile", delta: "live" },
  { label: "Daily digest", value: "Ranked", meta: "fit + short summary", delta: "+signal" },
  { label: "Noise control", value: "Quiet mode", meta: "only when it matters", delta: "on" },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[#070B18] text-white">
      {/* Background glow + subtle grid */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(900px_600px_at_20%_0%,rgba(26,79,163,0.25),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(800px_520px_at_80%_25%,rgba(52,211,153,0.16),transparent_55%)]" />
        <div className="absolute inset-0 opacity-[0.06] [background-image:linear-gradient(to_right,rgba(255,255,255,0.25)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.25)_1px,transparent_1px)] [background-size:72px_72px]" />
        <div className="absolute inset-0 bg-gradient-to-b from-white/[0.03] via-transparent to-transparent" />
      </div>

      <div className="mx-auto max-w-[1200px] px-6 py-14 lg:px-10">
        <Link href="/" className="text-sm text-white/70 hover:text-white">
          ← Back
        </Link>

        {/* Header */}
        <div className="mt-6 flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <h1 className="text-4xl font-semibold tracking-tight">Pricing</h1>

            {/* Live pill */}
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[11px] font-semibold text-white/80">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>
              Live signals
            </span>
          </div>

          <p className="max-w-2xl text-white/70">
            Pick a plan and start receiving matched opportunities daily.
            <span className="text-white/85"> Cancel anytime.</span>
          </p>

          {/* Trust bar */}
          <div className="flex flex-wrap gap-2">
            {TRUST_BADGES.map((t) => (
              <span
                key={t}
                className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/80"
              >
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* Proof strip */}
        <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-5 shadow-[0_10px_60px_rgba(0,0,0,0.35)]">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="text-sm font-semibold text-white">Proof-style delivery, every day.</div>
              <div className="mt-1 text-sm text-white/65">
                Your profile decides what you see. AMBIT ranks by fit, summarizes fast, and keeps noise low.
              </div>
            </div>
            <div className="flex items-center gap-3 text-xs text-white/55">
              <span>Updated just now</span>
              <span className="text-white/25">•</span>
              <span>Example signals</span>
            </div>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-3">
            {LIVE_MINI_STATS.map((s) => (
              <div
                key={s.label}
                className="rounded-2xl border border-white/10 bg-white/[0.04] p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="text-xs font-semibold text-white/60">{s.label}</div>
                  <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] font-semibold text-emerald-200/90">
                    {s.delta}
                  </span>
                </div>
                <div className="mt-2 text-2xl font-bold tracking-tight text-white">{s.value}</div>
                <div className="mt-1 text-xs text-white/45">{s.meta}</div>

                <div className="mt-4 text-emerald-200/80">
                  <Sparkline />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Plans */}
        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          <Plan
            name="Single market"
            price="$39.99"
            desc="Choose one market and get daily ranked matches."
            bullets={[
              "Pick 1: Government OR Commercial OR Residential",
              "Daily ranked matches + short summary",
              "Email digest (quiet mode)",
              "Edit profile anytime (NAICS, keywords, location)",
            ]}
            cta="Create profile → Start free trial"
            href="/get-started?plan=single"
            kicker="Best for: testing AMBIT fast"
          />

          <Plan
            name="All markets"
            price="$59.99"
            desc="Best coverage across all markets for more match volume."
            bullets={[
              "Government + Commercial + Residential",
              "More matches across more sources",
              "Daily ranked matches + short summary",
              "Email digest (quiet mode)",
              "Edit profile anytime (NAICS, keywords, location)",
            ]}
            cta="Create profile → Start free trial"
            href="/get-started?plan=all"
            featured
            badge="Most popular"
            kicker="Best for: contractors who want volume"
          />
        </div>

        {/* How it works (timeline) */}
        <div className="mt-10 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_10px_60px_rgba(0,0,0,0.25)]">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold text-white">How it works</div>
            <span className="text-xs text-white/55">3 steps • ~2 minutes</span>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <Step n="1" title="Create your profile" desc="Markets + NAICS + keywords + service area." />
            <Step n="2" title="Review your first matches" desc="See ranked opportunities in your portal." />
            <Step n="3" title="Start your free trial" desc="Daily delivery. Cancel anytime." accent />
          </div>

          <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-xs text-white/60">
            Payments (if required) are handled securely by Stripe. We don’t sell your data.
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-10">
          <div className="flex items-end justify-between gap-4">
            <h2 className="text-lg font-semibold">FAQ</h2>
            <div className="text-xs text-white/55">Still unsure? Start Single — switch later.</div>
          </div>

          <div className="mt-4 space-y-3">
            {FAQ.map((item, idx) => (
              <details
                key={item.q}
                open={idx === 0}
                className="group rounded-2xl border border-white/10 bg-white/5 p-5"
              >
                <summary className="cursor-pointer list-none text-sm font-semibold text-white/90">
                  <div className="flex items-center justify-between gap-4">
                    <span>{item.q}</span>
                    <span className="text-white/60 transition-transform group-open:rotate-45">+</span>
                  </div>
                </summary>
                <p className="mt-3 text-sm text-white/70">{item.a}</p>
              </details>
            ))}
          </div>
        </div>

        <p className="mt-10 text-xs text-white/45">
          Tip: If you want the most opportunities, start with All markets. You can always switch plans later.
        </p>
      </div>
    </div>
  );
}

function Sparkline() {
  return (
    <svg viewBox="0 0 80 32" className="h-8 w-full" aria-hidden="true" focusable="false">
      <path
        d="M4 26 C 18 22, 22 22, 34 18 S 58 14, 76 10"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.25"
        className="text-emerald-300/80"
        strokeLinecap="round"
      />
      <path d="M0 30 H80" stroke="currentColor" strokeWidth="1" className="text-white/10" />
    </svg>
  );
}

function CheckIcon({ featured }: { featured?: boolean }) {
  return (
    <span
      className={[
        "mt-[2px] inline-flex h-5 w-5 items-center justify-center rounded-full text-[12px] font-semibold",
        featured
          ? "bg-emerald-400/15 text-emerald-200 ring-1 ring-emerald-400/20"
          : "bg-white/10 text-white/90",
      ].join(" ")}
    >
      ✓
    </span>
  );
}

function Step({
  n,
  title,
  desc,
  accent,
}: {
  n: string;
  title: string;
  desc: string;
  accent?: boolean;
}) {
  return (
    <div
      className={[
        "rounded-2xl border bg-white/[0.04] p-5",
        accent
          ? "border-emerald-400/20 shadow-[0_0_0_1px_rgba(52,211,153,0.18)]"
          : "border-white/10",
      ].join(" ")}
    >
      <div className="flex items-start gap-3">
        <div
          className={[
            "flex h-8 w-8 items-center justify-center rounded-xl text-sm font-bold",
            accent
              ? "bg-emerald-400/15 text-emerald-200 ring-1 ring-emerald-400/20"
              : "bg-white/10 text-white/80",
          ].join(" ")}
        >
          {n}
        </div>
        <div>
          <div className="text-sm font-semibold text-white">{title}</div>
          <div className="mt-1 text-sm text-white/65">{desc}</div>
        </div>
      </div>

      <div className="mt-4 text-emerald-200/80">
        <svg viewBox="0 0 80 32" className="h-8 w-full" aria-hidden="true" focusable="false">
          <path
            d={
              accent
                ? "M4 26 C 18 18, 26 18, 34 16 S 56 10, 76 6"
                : "M4 22 C 18 22, 26 20, 34 18 S 56 16, 76 14"
            }
            fill="none"
            stroke="currentColor"
            strokeWidth="2.25"
            className={accent ? "text-emerald-300/80" : "text-white/25"}
            strokeLinecap="round"
          />
          <path d="M0 30 H80" stroke="currentColor" strokeWidth="1" className="text-white/10" />
        </svg>
      </div>
    </div>
  );
}

function Plan({
  name,
  price,
  desc,
  bullets,
  cta,
  href,
  featured,
  badge,
  kicker,
}: {
  name: string;
  price: string;
  desc: string;
  bullets: string[];
  cta: string;
  href: string;
  featured?: boolean;
  badge?: string;
  kicker?: string;
}) {
  return (
    <div
      className={[
        "relative overflow-hidden rounded-3xl border p-6 shadow-[0_10px_60px_rgba(0,0,0,0.25)]",
        featured
          ? "border-emerald-400/25 bg-white/[0.06] shadow-[0_0_0_1px_rgba(52,211,153,0.18)]"
          : "border-white/10 bg-white/5",
      ].join(" ")}
    >
      {/* Background glows */}
      {featured ? (
        <>
          <div className="pointer-events-none absolute -inset-px rounded-3xl bg-[radial-gradient(450px_260px_at_70%_0%,rgba(52,211,153,0.20),transparent_60%)]" />
          <div className="pointer-events-none absolute -inset-px rounded-3xl bg-[radial-gradient(520px_300px_at_20%_10%,rgba(26,79,163,0.20),transparent_60%)]" />
        </>
      ) : (
        <>
          {/* UPDATED: match the All markets “premium” vibe */}
          <div className="pointer-events-none absolute -inset-px rounded-3xl bg-[radial-gradient(520px_300px_at_70%_0%,rgba(52,211,153,0.18),transparent_60%)]" />
          <div className="pointer-events-none absolute -inset-px rounded-3xl bg-[radial-gradient(520px_300px_at_20%_10%,rgba(26,79,163,0.18),transparent_60%)]" />
        </>
      )}

      {/* Subtle inner sheen (both cards) */}
      <div className="pointer-events-none absolute inset-0 rounded-3xl bg-gradient-to-br from-white/[0.06] via-transparent to-transparent" />

      <div className="relative flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-white/90">{name}</p>
        {badge ? (
          <span className="rounded-full border border-emerald-400/25 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-100">
            {badge}
          </span>
        ) : null}
      </div>

      {kicker ? <div className="relative mt-2 text-xs text-white/55">{kicker}</div> : null}

      <p className="relative mt-4 text-4xl font-semibold tracking-tight">
        {price}
        <span className="text-sm font-medium text-white/60">/mo</span>
      </p>

      <p className="relative mt-2 text-sm text-white/70">{desc}</p>

      <ul className="relative mt-5 space-y-2 text-sm text-white/70">
        {bullets.map((b) => (
          <li key={b} className="flex gap-2">
            <CheckIcon featured={featured} />
            <span>{b}</span>
          </li>
        ))}
      </ul>

      <Link
        href={href}
        className="relative mt-6 block rounded-xl bg-white px-4 py-3 text-center text-sm font-semibold text-black transition hover:bg-white/90"
      >
        {cta}
      </Link>

      <div className="relative mt-3 flex items-center justify-between text-xs text-white/55">
        <span>No contracts. Cancel anytime.</span>
        <span className="inline-flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400/70" />
          Live-ready
        </span>
      </div>
    </div>
  );
}
