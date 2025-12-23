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
          One simple plan for contractors and service providers pursuing commercial & public sector work.
          <span className="text-white/85"> Cancel anytime.</span>
        </p>

        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          <div className="lg:col-start-2">
            <Plan
              name="Ambit"
              price="$39.99"
              desc="Everything you need to find better opportunities and move faster."
              bullets={[
                "Daily contract matches",
                "Match score + short summary",
                "Save & organize your pipeline (MVP)",
                "Email digest delivery",
              ]}
              cta="Start subscription — $39.99/mo"
              href="#"
              featured
            />
          </div>
        </div>

        <div className="mt-10 rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-white/70">
          Note: This page is priced correctly at <span className="text-white/85 font-semibold">$39.99/month</span>.
          Next, we’ll connect the button to Stripe checkout so it becomes live.
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
}: {
  name: string;
  price: string;
  desc: string;
  bullets: string[];
  cta: string;
  href: string;
  featured?: boolean;
}) {
  return (
    <div
      className={[
        "rounded-2xl border bg-white/5 p-6",
        featured ? "border-white/30" : "border-white/10",
      ].join(" ")}
    >
      <p className="text-sm font-semibold">{name}</p>
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

      <a
        href={href}
        className="mt-6 block rounded-xl bg-white px-4 py-3 text-center text-sm font-semibold text-black hover:bg-white/90"
      >
        {cta}
      </a>

      <p className="mt-3 text-xs text-white/60">
        No contracts. Cancel anytime.
      </p>
    </div>
  );
}
