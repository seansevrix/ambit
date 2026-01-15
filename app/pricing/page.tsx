// app/pricing/page.tsx
import Link from "next/link";

const TRUST_BADGES = [
  "7-day free trial",
  "Secure checkout (Stripe)",
  "Cancel anytime",
  "No spam",
];

const FAQ = [
  {
    q: "Do I get charged during the free trial?",
    a: "No. Your trial starts after you create a profile. If a payment method is required, you won’t be charged until the trial ends. You can cancel anytime before that.",
  },
  {
    q: "What happens after I click Get Started?",
    a: "You’ll create a quick profile (markets + NAICS + keywords + location). Then AMBIT generates your matches in your portal and you can start your free trial.",
  },
  {
    q: "When do I receive matches?",
    a: "AMBIT sends ranked opportunities on a daily email digest. You can adjust your settings anytime (quiet mode included).",
  },
  {
    q: "Can I change my NAICS/keywords later?",
    a: "Yes — you can edit your profile anytime and your future matches will update accordingly.",
  },
  {
    q: "Can I cancel easily?",
    a: "Yes. You can cancel anytime from your portal — no contracts and no hassle.",
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[#070B18] text-white">
      <div className="mx-auto max-w-[1200px] px-6 py-14 lg:px-10">
        <Link href="/" className="text-sm text-white/70 hover:text-white">
          ← Back
        </Link>

        <h1 className="mt-6 text-4xl font-semibold tracking-tight">Pricing</h1>
        <p className="mt-3 max-w-2xl text-white/70">
          AMBIT scans opportunities daily, ranks them by fit, and sends you the top matches.
          <span className="text-white/85"> Cancel anytime.</span>
        </p>

        {/* Trust bar */}
        <div className="mt-5 flex flex-wrap gap-2">
          {TRUST_BADGES.map((t) => (
            <span
              key={t}
              className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/80"
            >
              {t}
            </span>
          ))}
        </div>

        <div className="mt-10 grid gap-5 lg:grid-cols-2">
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
          />
        </div>

        {/* How it works */}
        <div className="mt-10 rounded-2xl border border-white/10 bg-white/5 p-6">
          <div className="text-sm font-semibold text-white">How it works</div>
          <ol className="mt-3 space-y-2 text-sm text-white/70">
            <li className="flex gap-2">
              <span className="text-white/50">1.</span>
              Create your profile (markets + NAICS + keywords + location)
            </li>
            <li className="flex gap-2">
              <span className="text-white/50">2.</span>
              Review your first matches in your portal
            </li>
            <li className="flex gap-2">
              <span className="text-white/50">3.</span>
              Start your free trial — cancel anytime
            </li>
          </ol>
          <p className="mt-3 text-xs text-white/55">
            Payments (if required) are handled securely by Stripe. We don’t sell your data.
          </p>
        </div>

        {/* FAQ */}
        <div className="mt-10">
          <h2 className="text-lg font-semibold">FAQ</h2>
          <div className="mt-4 space-y-3">
            {FAQ.map((item) => (
              <details
                key={item.q}
                className="group rounded-2xl border border-white/10 bg-white/5 p-5"
              >
                <summary className="cursor-pointer list-none text-sm font-semibold text-white/90">
                  <div className="flex items-center justify-between gap-4">
                    <span>{item.q}</span>
                    <span className="text-white/60 group-open:rotate-45 transition-transform">
                      +
                    </span>
                  </div>
                </summary>
                <p className="mt-3 text-sm text-white/70">{item.a}</p>
              </details>
            ))}
          </div>
        </div>

        <p className="mt-10 text-xs text-white/45">
          Tip: If you want the most opportunities, start with All markets. You can always switch
          plans later.
        </p>
      </div>
    </div>
  );
}

function CheckIcon() {
  return (
    <span className="mt-[2px] inline-flex h-5 w-5 items-center justify-center rounded-full bg-white/10 text-[12px] text-white/90">
      ✓
    </span>
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
}: {
  name: string;
  price: string;
  desc: string;
  bullets: string[];
  cta: string;
  href: string;
  featured?: boolean;
  badge?: string;
}) {
  return (
    <div
      className={[
        "relative rounded-2xl border p-6",
        featured
          ? "border-blue-400/40 bg-blue-500/10 shadow-[0_0_0_1px_rgba(96,165,250,0.25)]"
          : "border-white/10 bg-white/5",
      ].join(" ")}
    >
      {featured ? (
        <div className="pointer-events-none absolute -inset-px rounded-2xl bg-gradient-to-b from-blue-500/10 to-transparent" />
      ) : null}

      <div className="relative flex items-center justify-between gap-3">
        <p className="text-sm font-semibold">{name}</p>
        {badge ? (
          <span className="rounded-full border border-blue-400/30 bg-blue-500/20 px-3 py-1 text-xs font-semibold text-white/90">
            {badge}
          </span>
        ) : null}
      </div>

      <p className="relative mt-2 text-4xl font-semibold">
        {price}
        <span className="text-sm font-medium text-white/60">/mo</span>
      </p>

      <p className="relative mt-2 text-sm text-white/70">{desc}</p>

      <ul className="relative mt-5 space-y-2 text-sm text-white/70">
        {bullets.map((b) => (
          <li key={b} className="flex gap-2">
            <CheckIcon />
            <span>{b}</span>
          </li>
        ))}
      </ul>

      <Link
        href={href}
        className={[
          "relative mt-6 block rounded-xl px-4 py-3 text-center text-sm font-semibold transition",
          featured
            ? "bg-white text-black hover:bg-white/90"
            : "bg-white text-black hover:bg-white/90",
        ].join(" ")}
      >
        {cta}
      </Link>

      <p className="relative mt-3 text-xs text-white/60">No contracts. Cancel anytime.</p>
    </div>
  );
}
