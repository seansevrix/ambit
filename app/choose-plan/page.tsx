"use client";

import Link from "next/link";
import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

type Plan = "associate" | "executive";

const BACKEND_URL = (
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_BASE ||
  ""
).replace(/\/$/, "");

const PLAN_COPY: Record<
  Plan,
  { name: string; price: string; subtitle: string; bullets: string[] }
> = {
  associate: {
    name: "Associate",
    price: "$49.99/mo",
    subtitle: "Daily matched opportunities",
    bullets: [
      "Residential, Commercial, and Government matches",
      "Ranked opportunities delivered daily",
      "Fast setup for solo operators and small teams",
    ],
  },
  executive: {
    name: "Executive",
    price: "$299/mo",
    subtitle: "Includes AMBIT Prime support",
    bullets: [
      "Everything in Associate",
      "Prime support workflow for qualified opportunities",
      "Higher-touch coordination and bid support",
    ],
  },
};

function ChoosePlanInner() {
  const searchParams = useSearchParams();

  const qPlan = (searchParams.get("plan") || "").toLowerCase();
  const qEmail = searchParams.get("email") || "";

  const defaultPlan: Plan = qPlan === "executive" ? "executive" : "associate";

  const [selectedPlan, setSelectedPlan] = useState<Plan>(defaultPlan);
  const [email, setEmail] = useState(qEmail);
  const [loadingPlan, setLoadingPlan] = useState<Plan | null>(null);
  const [error, setError] = useState("");

  const cards: Plan[] = useMemo(() => ["associate", "executive"], []);

  async function startCheckout(plan: Plan) {
    setError("");

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setError("Please enter your email.");
      return;
    }

    if (!BACKEND_URL) {
      setError("Missing NEXT_PUBLIC_BACKEND_URL.");
      return;
    }

    try {
      setLoadingPlan(plan);

      const res = await fetch(`${BACKEND_URL}/engine/billing/create-checkout-session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: cleanEmail, plan }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data?.error || "Failed to start checkout.");
      }

      if (!data?.url) {
        throw new Error("Checkout URL missing from server response.");
      }

      window.location.href = data.url;
    } catch (e: any) {
      setError(e?.message || "Something went wrong.");
      setLoadingPlan(null);
    }
  }

  return (
    <main className="mx-auto max-w-[1060px] px-6 py-14 sm:py-20">
      <header className="max-w-2xl">
        <h1 className="text-3xl font-semibold tracking-tight text-black sm:text-4xl">
          Choose your AMBIT plan
        </h1>
        <p className="mt-3 text-black/70">Pick a plan and continue to secure checkout.</p>
      </header>

      <div className="mt-6 max-w-xl">
        <label className="mb-2 block text-sm font-medium text-black/80">Work email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@company.com"
          className="w-full rounded-xl border border-black/15 bg-white/80 px-4 py-3 text-sm outline-none placeholder:text-black/40 focus:border-black/30"
        />
      </div>

      <section className="mt-8 grid gap-4 md:grid-cols-2">
        {cards.map((plan) => {
          const c = PLAN_COPY[plan];
          const active = selectedPlan === plan;

          return (
            <article
              key={plan}
              className={[
                "rounded-2xl border bg-white/70 p-6 transition",
                active ? "border-black/30 shadow-sm" : "border-black/10",
              ].join(" ")}
            >
              <button
                type="button"
                onClick={() => setSelectedPlan(plan)}
                className="w-full text-left"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-black">{c.name}</h2>
                  {active ? (
                    <span className="rounded-full border border-black/20 px-2 py-0.5 text-xs font-medium text-black/70">
                      Selected
                    </span>
                  ) : null}
                </div>
                <p className="mt-2 text-lg font-semibold text-black">{c.price}</p>
                <p className="mt-1 text-sm text-black/65">{c.subtitle}</p>
              </button>

              <ul className="mt-4 space-y-2 text-sm text-black/75">
                {c.bullets.map((b) => (
                  <li key={b} className="flex gap-2">
                    <span>•</span>
                    <span>{b}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => startCheckout(plan)}
                disabled={!!loadingPlan}
                className="mt-6 inline-flex items-center justify-center rounded-md border border-black/20 px-4 py-2 text-sm font-semibold text-black transition hover:bg-black hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loadingPlan === plan ? "Redirecting..." : `Choose ${c.name}`}
              </button>
            </article>
          );
        })}
      </section>

      {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}

      <div className="mt-6 text-sm text-black/60">
        Already subscribed?{" "}
        <Link href="/login" className="font-medium text-black hover:underline">
          Log in
        </Link>
      </div>
    </main>
  );
}

function ChoosePlanFallback() {
  return (
    <main className="mx-auto max-w-[1060px] px-6 py-14 sm:py-20">
      <h1 className="text-3xl font-semibold tracking-tight text-black sm:text-4xl">
        Choose your AMBIT plan
      </h1>
      <p className="mt-3 text-black/70">Loading plans…</p>
    </main>
  );
}

export default function ChoosePlanPage() {
  return (
    <Suspense fallback={<ChoosePlanFallback />}>
      <ChoosePlanInner />
    </Suspense>
  );
}
