"use client";

import Link from "next/link";
import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

type PlanKey = "associate" | "executive";

const API_BASE = (
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_BASE ||
  ""
).replace(/\/$/, "");

const PLANS: Record<
  PlanKey,
  {
    name: string;
    price: string;
    subtitle: string;
    audience: string;
    cta: string;
    featured?: boolean;
    bullets: string[];
    valueLine: string;
  }
> = {
  associate: {
    name: "Associate",
    price: "$49.99/mo",
    subtitle: "Daily matched opportunities",
    audience: "Best for solo operators and small teams",
    cta: "Choose Associate",
    bullets: [
      "Residential, Commercial, and Government matches",
      "Ranked opportunities delivered daily",
      "Service area + keyword alignment",
      "Fast setup and simple dashboard access",
    ],
    valueLine: "Great for steady lead flow at the lowest monthly cost.",
  },
  executive: {
    name: "Executive",
    price: "$299/mo",
    subtitle: "Includes AMBIT Prime support",
    audience: "Best for teams serious about bigger bids",
    cta: "Choose Executive",
    featured: true,
    bullets: [
      "Everything in Associate",
      "AMBIT Prime workflow for qualified opportunities",
      "Priority support path and faster hands-on help",
      "Higher-touch coordination for bid execution",
    ],
    valueLine: "Built for companies that want deeper support, not just lead delivery.",
  },
};

function Check({ strong = false }: { strong?: boolean }) {
  return (
    <span
      className={[
        "inline-flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-bold",
        strong ? "bg-[#1A4FA3] text-white" : "bg-black/10 text-black/70",
      ].join(" ")}
      aria-hidden
    >
      ✓
    </span>
  );
}

function ChoosePlanInner() {
  const searchParams = useSearchParams();

  const qEmail = (searchParams.get("email") || "").trim();
  const qPlan = (searchParams.get("plan") || "").toLowerCase();

  const initialPlan: PlanKey = qPlan === "executive" ? "executive" : "associate";

  const [email, setEmail] = useState(qEmail);
  const [selectedPlan, setSelectedPlan] = useState<PlanKey>(initialPlan);
  const [loadingPlan, setLoadingPlan] = useState<PlanKey | null>(null);
  const [error, setError] = useState("");

  const planOrder = useMemo<PlanKey[]>(() => ["associate", "executive"], []);

  async function startCheckout(plan: PlanKey) {
    setError("");

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setError("Please enter your work email.");
      return;
    }

    if (!API_BASE) {
      setError("Missing NEXT_PUBLIC_BACKEND_URL.");
      return;
    }

    try {
      setLoadingPlan(plan);

      const res = await fetch(`${API_BASE}/engine/billing/create-checkout-session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: cleanEmail, plan }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data?.error || "Unable to start checkout.");
      }

      if (!data?.url) {
        throw new Error("Missing checkout URL.");
      }

      window.location.href = data.url;
    } catch (e: any) {
      setError(e?.message || "Something went wrong.");
      setLoadingPlan(null);
    }
  }

  const compareRows = [
    {
      label: "Daily ranked opportunities",
      associate: true,
      executive: true,
    },
    {
      label: "Residential + Commercial + Government coverage",
      associate: true,
      executive: true,
    },
    {
      label: "AMBIT Prime support workflow",
      associate: false,
      executive: true,
    },
    {
      label: "Priority support path",
      associate: false,
      executive: true,
    },
  ];

  return (
    <main className="mx-auto max-w-[1120px] px-6 py-14 sm:py-20 text-black">
      <header className="max-w-2xl">
        <h1 className="text-4xl font-black tracking-tight sm:text-5xl">Choose your AMBIT plan</h1>
        <p className="mt-3 text-lg text-black/70">
          Pick the level of support your team needs, then continue to secure checkout.
        </p>
      </header>

      <section className="mt-7 max-w-2xl">
        <label className="mb-2 block text-sm font-semibold text-black/75">Work email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@company.com"
          className="w-full rounded-xl border border-black/15 bg-white/80 px-4 py-3 text-base outline-none placeholder:text-black/40 focus:border-[#1A4FA3]/40"
        />
      </section>

      <section className="mt-8 grid gap-5 md:grid-cols-2">
        {planOrder.map((planKey) => {
          const plan = PLANS[planKey];
          const active = selectedPlan === planKey;
          const isLoading = loadingPlan === planKey;

          return (
            <article
              key={planKey}
              className={[
                "rounded-2xl border bg-white/80 p-6 transition",
                plan.featured
                  ? "border-[#1A4FA3]/40 shadow-[0_10px_40px_rgba(26,79,163,0.14)]"
                  : "border-black/12",
                active ? "ring-2 ring-[#1A4FA3]/25" : "",
              ].join(" ")}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-3xl font-black">{plan.name}</div>
                  <div className="mt-2 text-4xl font-black tracking-tight">{plan.price}</div>
                  <div className="mt-1 text-base text-black/70">{plan.subtitle}</div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  {plan.featured ? (
                    <span className="rounded-full bg-[#1A4FA3] px-3 py-1 text-xs font-bold text-white">
                      MOST POWERFUL
                    </span>
                  ) : null}
                  {active ? (
                    <span className="rounded-full border border-black/20 px-3 py-1 text-xs font-semibold text-black/70">
                      Selected
                    </span>
                  ) : null}
                </div>
              </div>

              <p className="mt-3 text-sm font-medium text-black/65">{plan.audience}</p>

              <ul className="mt-5 space-y-3">
                {plan.bullets.map((b) => (
                  <li key={b} className="flex items-start gap-3 text-[17px] leading-snug text-black/85">
                    <Check strong={plan.featured} />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>

              <p className="mt-5 rounded-lg bg-black/[0.03] px-3 py-2 text-sm text-black/75">{plan.valueLine}</p>

              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedPlan(planKey)}
                  className="rounded-md border border-black/20 px-4 py-2 text-sm font-semibold text-black hover:bg-black/5"
                >
                  Select
                </button>

                <button
                  type="button"
                  onClick={() => startCheckout(planKey)}
                  disabled={!!loadingPlan}
                  className={[
                    "rounded-md px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60",
                    plan.featured ? "bg-[#1A4FA3] hover:brightness-110" : "bg-black hover:bg-black/90",
                  ].join(" ")}
                >
                  {isLoading ? "Redirecting..." : plan.cta}
                </button>
              </div>
            </article>
          );
        })}
      </section>

      <section className="mt-8 rounded-2xl border border-black/10 bg-white/70 p-5">
        <h2 className="text-lg font-bold">Plan comparison</h2>
        <div className="mt-4 space-y-3">
          {compareRows.map((row) => (
            <div
              key={row.label}
              className="grid grid-cols-[1fr_120px_120px] items-center gap-2 rounded-lg border border-black/8 bg-white/70 px-3 py-2 text-sm"
            >
              <div className="text-black/80">{row.label}</div>
              <div className="text-center">{row.associate ? "✓" : "—"}</div>
              <div className="text-center font-semibold text-[#1A4FA3]">{row.executive ? "✓" : "—"}</div>
            </div>
          ))}
        </div>
      </section>

      {error ? <p className="mt-4 text-sm font-medium text-red-600">{error}</p> : null}

      <div className="mt-6 text-sm text-black/60">
        Already subscribed?{" "}
        <Link href="/login" className="font-semibold text-black hover:underline">
          Log in
        </Link>
      </div>
    </main>
  );
}

function Fallback() {
  return (
    <main className="mx-auto max-w-[1120px] px-6 py-14 sm:py-20 text-black">
      <h1 className="text-4xl font-black tracking-tight sm:text-5xl">Choose your AMBIT plan</h1>
      <p className="mt-3 text-lg text-black/70">Loading plans...</p>
    </main>
  );
}

export default function ChoosePlanPage() {
  return (
    <Suspense fallback={<Fallback />}>
      <ChoosePlanInner />
    </Suspense>
  );
}
