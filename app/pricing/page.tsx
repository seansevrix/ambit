// app/pricing/page.tsx
import Link from "next/link";

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

        <div className="mt-10 grid gap-5 lg:grid-cols-2">
          <Plan
            name="Single market"
            price="$39.99"
            desc="Track 1 lead type (choose one market)."
            bullets={[
              "Choose 1: Government OR Commercial OR Residential",
              "Daily ranked matches + short summary",
              "Email digest (quiet mode)",
              "Edit profile anytime (NAICS, keywords, location)",
            ]}
            cta="Start Free Trial — $39.99/mo"
            href="/get-started?plan=single"
          />

          <Plan
            name="All markets"
            price="$59.99"
            desc="Track all 3 lead types (best coverage)."
            bullets={[
              "Government + Commercial + Residential",
              "More match volume + more optionality",
              "Daily ranked matches + short summary",
              "Email digest (quiet mode)",
            ]}
            cta="Start Free Trial — $59.99/mo"
            href="/get-started?plan=all"
            featured
            badge="Best value"
          />
        </div>

        <div className="mt-10 rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-white/70">
          <span className="text-white/85 font-semibold">How checkout works:</span> Pricing sends you
          to Get Started so you can create a profile first (markets + NAICS + keywords). Then we
          generate your matches and you can start the free trial from your portal.
        </div>
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
        "rounded-2xl border bg-white/5 p-6",
        featured ? "border-blue-400/30 bg-blue-500/10" : "border-white/10",
      ].join(" ")}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold">{name}</p>
        {badge ? (
          <span className="rounded-full border border-blue-400/30 bg-blue-500/20 px-3 py-1 text-xs font-semibold text-white/85">
            {badge}
          </span>
        ) : null}
      </div>

      <p className="mt-2 text-4xl font-semibold">
        {price}
        <span className="text-sm font-medium text-white/60">/mo</span>
      </p>

      <p className="mt-2 text-sm text-white/70">{desc}</p>

      <ul className="mt-5 space-y-2 text-sm text-white/70">
        {bullets.map((b) => (
          <li key={b} className="flex gap-2">
            <span className="mt-[2px] inline-block h-4 w-4 rounded bg-white/10" />
            <span>{b}</span>
          </li>
        ))}
      </ul>

      <Link
        href={href}
        className="mt-6 block rounded-xl bg-white px-4 py-3 text-center text-sm font-semibold text-black hover:bg-white/90"
      >
        {cta}
      </Link>

      <p className="mt-3 text-xs text-white/60">No contracts. Cancel anytime.</p>
    </div>
  );
}
