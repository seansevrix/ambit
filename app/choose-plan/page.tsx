"use client";

import Link from "next/link";
import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

type PlanKey = "associate" | "executive";

const PROD_BACKEND = "https://ambit-0dnp.onrender.com";
const DEV_BACKEND = "http://localhost:5001";
const FALLBACK = process.env.NODE_ENV === "development" ? DEV_BACKEND : PROD_BACKEND;

const API_BASE = (
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_BASE ||
  FALLBACK
).replace(/\/$/, "");

function normalizePlan(planRaw: string | null): PlanKey {
  const p = String(planRaw || "").toLowerCase().trim();
  if (p === "executive" || p === "all" || p === "prime") return "executive";
  return "associate";
}

function BlueCheck() {
  return (
    <span
      className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#1A4FA3] text-[12px] font-black text-white"
      aria-hidden
    >
      ✓
    </span>
  );
}

function CheckLine({ text }: { text: string }) {
  return (
    <li className="flex items-start gap-3 text-[17px] leading-snug text-black/88">
      <BlueCheck />
      <span>{text}</span>
    </li>
  );
}

function CellCheck({ yes }: { yes: boolean }) {
  if (!yes) return <span className="text-black/35">—</span>;
  return (
    <span className="inline-flex items-center gap-2 text-[#1A4FA3] font-semibold">
      <BlueCheck />
      Included
    </span>
  );
}

function ChoosePlanInner() {
  const searchParams = useSearchParams();

  const emailFromQuery = (searchParams.get("email") || "").trim();
  const planFromQuery = normalizePlan(searchParams.get("plan"));

  const [email, setEmail] = useState(emailFromQuery);
  const [selectedPlan, setSelectedPlan] = useState<PlanKey>(planFromQuery);
  const [loadingPlan, setLoadingPlan] = useState<PlanKey | null>(null);
  const [error, setError] = useState("");

  const planCards = useMemo(
    () => ({
      associate: {
        title: "Associate",
        price: "$49.99/mo",
        subtitle: "Daily matched opportunities",
        badge: "Best for getting started",
        cta: "Choose Associate",
        bullets: [
          "Residential, Commercial, and Government matches",
          "Ranked opportunities delivered daily",
          "AMBIT-built proposal",
          "Project breakdown and description",
          "Fast setup and simple dashboard access",
          "24/7 Associate Support",
        ],
        note: "Great fit for operators who want consistent opportunity flow and fast execution.",
      },
      executive: {
        title: "Executive",
        price: "$299/mo",
        subtitle: "Includes AMBIT Prime support",
        badge: "Most growth-focused",
        cta: "Choose Executive",
        bullets: [
          "Everything in Associate",
          "AMBIT Prime contracts lane — no wait times for commercial/government credentials",
          "Priority support path",
          "AMBIT-built proposal",
          "Higher-touch coordination for bid execution",
        ],
        note: "Built for teams targeting bigger contracts with faster support and tighter coordination.",
      },
    }),
    []
  );

  const compareRows: Array<{
    label: string;
    associate: boolean;
    executive: boolean;
  }> = [
    { label: "Residential + Commercial + Government matches", associate: true, executive: true },
    { label: "Ranked opportunities delivered daily", associate: true, executive: true },
    { label: "AMBIT-built proposal", associate: true, executive: true },
    { label: "Project breakdown and description", associate: true, executive: true },
    { label: "24/7 support access", associate: true, executive: true },
    {
      label: "AMBIT Prime contracts lane (commercial/government credentials)",
      associate: false,
      executive: true,
    },
    { label: "Priority support path", associate: false, executive: true },
    { label: "Higher-touch bid execution coordination", associate: false, executive: true },
  ];

  async function startCheckout(plan: PlanKey) {
    setError("");
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !cleanEmail.includes("@")) {
      setError("Please enter a valid work email to continue.");
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
        throw new Error(data?.error || "Unable to start secure checkout.");
      }

      if (!data?.url) {
        throw new Error("Checkout URL was not returned.");
      }

      window.location.href = data.url;
    } catch (e: any) {
      setError(e?.message || "Something went wrong. Please try again.");
      setLoadingPlan(null);
    }
  }

  return (
    <main className="mx-auto max-w-[1160px] px-6 py-14 text-black sm:py-20">
      {/* Header */}
      <header className="max-w-3xl">
        <h1 className="text-4xl font-black tracking-tight sm:text-5xl">Choose your AMBIT plan</h1>
        <p className="mt-3 text-lg text-black/72">
          Pick the support level your team needs. We’ll help you move from opportunity alerts to
          real bid-ready action.
        </p>
      </header>

      {/* Email */}
      <section className="mt-7 max-w-2xl">
        <label className="mb-2 block text-sm font-semibold text-black/75">Work email</label>
        <input
          type="email"
          inputMode="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@company.com"
          className="w-full rounded-xl border border-black/15 bg-white/85 px-4 py-3 text-base outline-none placeholder:text-black/40 focus:border-[#1A4FA3]/45"
        />
      </section>

      {/* Plan cards */}
      <section className="mt-8 grid gap-6 md:grid-cols-2">
        {/* Associate */}
        <article
          className={[
            "rounded-2xl border bg-white/85 p-6 transition",
            selectedPlan === "associate"
              ? "border-[#1A4FA3]/45 ring-2 ring-[#1A4FA3]/20"
              : "border-black/12",
          ].join(" ")}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-4xl font-black tracking-tight">{planCards.associate.title}</h2>
              <div className="mt-2 text-4xl font-black">{planCards.associate.price}</div>
              <p className="mt-1 text-base text-black/72">{planCards.associate.subtitle}</p>
            </div>

            <div className="flex flex-col items-end gap-2">
              <span className="rounded-full bg-[#1A4FA3]/10 px-3 py-1 text-xs font-bold text-[#1A4FA3]">
                {planCards.associate.badge}
              </span>
              {selectedPlan === "associate" ? (
                <span className="rounded-full border border-[#1A4FA3]/30 bg-[#1A4FA3]/5 px-3 py-1 text-xs font-semibold text-[#1A4FA3]">
                  Selected
                </span>
              ) : null}
            </div>
          </div>

          <ul className="mt-5 space-y-3">
            {planCards.associate.bullets.map((b) => (
              <CheckLine key={b} text={b} />
            ))}
          </ul>

          <p className="mt-5 rounded-lg border border-black/10 bg-black/[0.02] px-3 py-2 text-sm text-black/72">
            {planCards.associate.note}
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setSelectedPlan("associate")}
              className="rounded-md border border-black/20 px-4 py-2 text-sm font-semibold text-black hover:bg-black/5"
            >
              Select
            </button>
            <button
              type="button"
              onClick={() => startCheckout("associate")}
              disabled={!!loadingPlan}
              className="rounded-md bg-[#1A4FA3] px-4 py-2 text-sm font-semibold text-white hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loadingPlan === "associate" ? "Redirecting..." : planCards.associate.cta}
            </button>
          </div>
        </article>

        {/* Executive */}
        <article
          className={[
            "rounded-2xl border bg-white/90 p-6 shadow-[0_12px_40px_rgba(26,79,163,0.15)] transition",
            selectedPlan === "executive"
              ? "border-[#1A4FA3]/55 ring-2 ring-[#1A4FA3]/25"
              : "border-[#1A4FA3]/30",
          ].join(" ")}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-4xl font-black tracking-tight">{planCards.executive.title}</h2>
              <div className="mt-2 text-4xl font-black">{planCards.executive.price}</div>
              <p className="mt-1 text-base text-black/72">{planCards.executive.subtitle}</p>
            </div>

            <div className="flex flex-col items-end gap-2">
              <span className="rounded-full bg-[#1A4FA3] px-3 py-1 text-xs font-bold text-white">
                {planCards.executive.badge}
              </span>
              {selectedPlan === "executive" ? (
                <span className="rounded-full border border-[#1A4FA3]/30 bg-[#1A4FA3]/5 px-3 py-1 text-xs font-semibold text-[#1A4FA3]">
                  Selected
                </span>
              ) : null}
            </div>
          </div>

          <ul className="mt-5 space-y-3">
            {planCards.executive.bullets.map((b) => (
              <CheckLine key={b} text={b} />
            ))}
          </ul>

          <p className="mt-5 rounded-lg border border-[#1A4FA3]/20 bg-[#1A4FA3]/5 px-3 py-2 text-sm text-black/75">
            {planCards.executive.note}
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setSelectedPlan("executive")}
              className="rounded-md border border-black/20 px-4 py-2 text-sm font-semibold text-black hover:bg-black/5"
            >
              Select
            </button>
            <button
              type="button"
              onClick={() => startCheckout("executive")}
              disabled={!!loadingPlan}
              className="rounded-md bg-[#1A4FA3] px-4 py-2 text-sm font-semibold text-white hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loadingPlan === "executive" ? "Redirecting..." : planCards.executive.cta}
            </button>
          </div>
        </article>
      </section>

      {/* Clear requirements section */}
      <section className="mt-8 rounded-2xl border border-black/10 bg-white/80 p-6">
        <h3 className="text-2xl font-black tracking-tight">What you’ll need to bid confidently</h3>
        <p className="mt-2 text-black/72">
          We help organize and guide the process, but these are the key items most service
          companies should have ready for contract work:
        </p>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-black/10 bg-white/85 p-4">
            <div className="mb-2 text-sm font-bold text-black/70">Core business docs</div>
            <ul className="space-y-2">
              <CheckLine text="Active business license(s)" />
              <CheckLine text="Certificate of Insurance (COI)" />
              <CheckLine text="Service area + scope of work details" />
            </ul>
          </div>

          <div className="rounded-xl border border-black/10 bg-white/85 p-4">
            <div className="mb-2 text-sm font-bold text-black/70">Bid & pricing readiness</div>
            <ul className="space-y-2">
              <CheckLine text="Pricing sheet (labor, materials, markups)" />
              <CheckLine text="Project timeline + staffing assumptions" />
              <CheckLine text="Past project references/examples when available" />
            </ul>
          </div>
        </div>

        <p className="mt-4 text-sm text-black/65">
          Executive gives you the fastest AMBIT support lane for commercial/government credential
          workflows and tighter bid coordination.
        </p>
      </section>

      {/* Comparison */}
      <section className="mt-8 rounded-2xl border border-black/10 bg-white/80 p-6">
        <h3 className="text-xl font-black">Side-by-side comparison</h3>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-y-2 text-sm">
            <thead>
              <tr className="text-left text-black/65">
                <th className="px-3 py-2 font-semibold">Feature</th>
                <th className="px-3 py-2 font-semibold">Associate</th>
                <th className="px-3 py-2 font-semibold">Executive</th>
              </tr>
            </thead>
            <tbody>
              {compareRows.map((row) => (
                <tr key={row.label} className="rounded-lg border border-black/10 bg-white/90">
                  <td className="px-3 py-3 text-black/82">{row.label}</td>
                  <td className="px-3 py-3">
                    <CellCheck yes={row.associate} />
                  </td>
                  <td className="px-3 py-3">
                    <CellCheck yes={row.executive} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {error ? <p className="mt-5 text-sm font-semibold text-red-600">{error}</p> : null}

      <div className="mt-6 text-sm text-black/65">
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
    <main className="mx-auto max-w-[1160px] px-6 py-14 text-black sm:py-20">
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
