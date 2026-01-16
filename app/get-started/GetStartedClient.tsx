"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AmbitMark from "../components/AmbitMark";

const API_BASE =
  (process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_BASE ||
    "http://localhost:5001")?.replace(/\/$/, "");

async function postJson(url: string, body: any) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({}));
  return { res, json };
}

/** NAICS helpers */
function sanitizeNaicsToken(input: string) {
  return input.replace(/[^\d]/g, "").slice(0, 6);
}
function isValidNaicsToken(input: string) {
  return /^\d{2,6}$/.test(input);
}
function parseNaicsList(raw: string) {
  const parts = raw
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);

  const cleaned = parts.map(sanitizeNaicsToken).filter(Boolean);
  const valid = cleaned.filter(isValidNaicsToken);

  const seen = new Set<string>();
  const uniqueValid: string[] = [];
  for (const v of valid) {
    if (!seen.has(v)) {
      seen.add(v);
      uniqueValid.push(v);
    }
  }

  return {
    valid: uniqueValid,
    hasAny: uniqueValid.length > 0,
    hasInvalid:
      parts.length > 0 &&
      cleaned.some((t) => t.length > 0 && !isValidNaicsToken(t)),
    hadInput: parts.length > 0,
  };
}

/** Segments / Markets */
type SegmentKey = "residential" | "commercial" | "government";
const SEGMENTS: Array<{ key: SegmentKey; label: string; hint: string; icon: string }> =
  [
    { key: "residential", label: "Residential", hint: "Homeowner work", icon: "🏠" },
    { key: "commercial", label: "Commercial", hint: "Businesses & facilities", icon: "🏢" },
    { key: "government", label: "Government", hint: "Federal, state & local", icon: "🏛️" },
  ];

function toggleSet<T extends string>(set: Set<T>, value: T) {
  const next = new Set(set);
  if (next.has(value)) next.delete(value);
  else next.add(value);
  return next;
}

// Plans
type PlanTier = "single" | "all";
const PRICE_SINGLE = 39.99;
const PRICE_ALL = 59.99;

export default function GetStartedClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [serviceArea, setServiceArea] = useState("");
  const [keywords, setKeywords] = useState("");
  const [naicsInput, setNaicsInput] = useState("");

  const [plan, setPlan] = useState<PlanTier>("single");

  // Default selected; single-plan effect will reduce to 1 automatically
  const [segments, setSegments] = useState<Set<SegmentKey>>(
    () => new Set<SegmentKey>(["residential", "commercial", "government"])
  );

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const [naicsTouched, setNaicsTouched] = useState(false);
  const [segmentsTouched, setSegmentsTouched] = useState(false);

  // Load plan from query/localStorage once
  useEffect(() => {
    const qp = String(searchParams?.get("plan") || "").toLowerCase();
    let next: PlanTier | null = null;

    if (qp === "all") next = "all";
    if (qp === "single") next = "single";

    if (!next) {
      try {
        const saved = localStorage.getItem("ambit_plan");
        if (saved === "all" || saved === "single") next = saved;
      } catch {}
    }

    setPlan(next || "single");
  }, [searchParams]);

  // Persist plan selection
  useEffect(() => {
    try {
      localStorage.setItem("ambit_plan", plan);
    } catch {}
  }, [plan]);

  // ✅ When plan is "all", auto-select all markets
  useEffect(() => {
    if (plan !== "all") return;
    setSegments(new Set<SegmentKey>(["residential", "commercial", "government"]));
    setSegmentsTouched(true);
  }, [plan]);

  // Enforce segment rules by plan
  useEffect(() => {
    if (plan !== "single") return;

    setSegments((prev) => {
      if (prev.size <= 1) return prev;

      const order: SegmentKey[] = ["government", "commercial", "residential"];
      const keep =
        order.find((k) => prev.has(k)) || Array.from(prev)[0] || "government";
      return new Set<SegmentKey>([keep]);
    });
  }, [plan]);

  const naicsParsed = useMemo(() => parseNaicsList(naicsInput), [naicsInput]);
  const naicsCsv = useMemo(() => naicsParsed.valid.join(","), [naicsParsed.valid]);

  const segmentsList = useMemo(() => Array.from(segments), [segments]);
  const segmentsCsv = useMemo(() => segmentsList.join(","), [segmentsList]);

  const govSelected = useMemo(() => segments.has("government"), [segments]);

  // Submit readiness (NAICS optional)
  const canSubmit = useMemo(() => {
    const baseOk =
      companyName.trim().length >= 2 &&
      email.trim().includes("@") &&
      serviceArea.trim().length >= 2 &&
      keywords.trim().length >= 2 &&
      segments.size > 0;

    if (!baseOk) return false;
    if (plan === "single") return segments.size === 1;
    return true;
  }, [companyName, email, serviceArea, keywords, segments.size, plan]);

  async function createCustomer() {
    setErr("");
    setLoading(true);

    try {
      const company = companyName.trim();
      const mail = email.trim().toLowerCase();
      const loc = serviceArea.trim();
      const kw = keywords.trim();

      if (segments.size === 0) {
        setSegmentsTouched(true);
        throw new Error("Select at least one market.");
      }

      if (plan === "single" && segments.size !== 1) {
        setSegmentsTouched(true);
        throw new Error("Single market plan requires choosing exactly ONE market.");
      }

      try {
        localStorage.setItem("ambit_plan", plan);
        localStorage.setItem("ambit_email", mail);
      } catch {}

      const payload: any = {
        name: company,
        companyName: company,
        email: mail,
        location: loc,
        serviceArea: loc,
        naics: naicsCsv,
        naicsCodes: naicsParsed.valid,
        keywords: kw,
        segments: segmentsList,
        segmentCsv: segmentsCsv,
      };

      const { res, json } = await postJson(`${API_BASE}/engine/customers`, payload);

      if (!res.ok) {
        const msg = String(json?.message || json?.error || `Signup failed (${res.status})`);
        throw new Error(msg);
      }

      const id = Number(json?.id) || Number(json?.customer?.id);
      if (!id || !Number.isFinite(id)) {
        throw new Error("Customer created, but no customer id returned.");
      }

      router.push(`/matches/${id}`);
      router.refresh();
    } catch (e: any) {
      setErr(e?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  }

  const priceLabel = plan === "all" ? `$${PRICE_ALL.toFixed(2)}` : `$${PRICE_SINGLE.toFixed(2)}`;

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-[#061033] via-[#040b24] to-[#020617] text-slate-100">
      {/* soft background glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-blue-600/10 blur-3xl" />
        <div className="absolute -bottom-32 right-[-80px] h-[520px] w-[520px] rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.12),transparent_55%)]" />
      </div>

      <div className="relative mx-auto max-w-6xl px-6 py-14">
        {/* centered card like the screenshot */}
        <div className="mx-auto w-full max-w-xl rounded-[32px] border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur">
          {/* header */}
          <div className="flex flex-col items-center text-center">
            <div className="mb-3 rounded-2xl border border-white/10 bg-white/5 p-2 shadow-sm">
              <AmbitMark size={36} />
            </div>
            <div className="text-sm font-semibold tracking-wide text-white/90">AMBIT</div>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">
              Let’s get started
            </h1>

            <div className="mt-3 inline-flex flex-wrap items-center justify-center gap-2 text-xs text-slate-200">
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 font-semibold text-white/90">
                7-day free trial
              </span>
              <span>No credit card required</span>
              <span className="opacity-60">•</span>
              <span>Cancel anytime</span>
              <span className="opacity-60">•</span>
              <span>No spam</span>
            </div>
          </div>

          {/* plan toggle (clean, compact) */}
          <div className="mt-7">
            <div className="mb-2 text-xs font-semibold text-slate-200">Plan</div>
            <div className="grid gap-2 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setPlan("single")}
                className={[
                  "rounded-2xl border px-4 py-3 text-left transition",
                  plan === "single"
                    ? "border-blue-400/60 bg-blue-500/15"
                    : "border-white/10 bg-slate-950/25 hover:bg-slate-950/35",
                ].join(" ")}
              >
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold text-white">Single market</div>
                  <div className="text-xs font-semibold text-white/80">$39.99/mo</div>
                </div>
                <div className="mt-1 text-xs text-slate-300">Choose 1 market</div>
              </button>

              <button
                type="button"
                onClick={() => setPlan("all")}
                className={[
                  "rounded-2xl border px-4 py-3 text-left transition",
                  plan === "all"
                    ? "border-blue-400/60 bg-blue-500/15"
                    : "border-white/10 bg-slate-950/25 hover:bg-slate-950/35",
                ].join(" ")}
              >
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold text-white">All markets</div>
                  <div className="text-xs font-semibold text-white/80">$59.99/mo</div>
                </div>
                <div className="mt-1 text-xs text-slate-300">Residential + Commercial + Government</div>
              </button>
            </div>

            <div className="mt-2 text-xs text-slate-300">
              Selected: <span className="font-semibold text-white">{plan === "all" ? "All markets" : "Single market"}</span>{" "}
              <span className="opacity-60">•</span>{" "}
              <span className="font-semibold text-white">{priceLabel}/month</span>
            </div>
          </div>

          {/* Market selection (simple, not gated) */}
          <div className="mt-7">
            <div className="mb-2 flex items-center justify-between">
              <div className="text-xs font-semibold text-slate-200">Market</div>
              {plan === "all" ? (
                <button
                  type="button"
                  onClick={() => {
                    setSegmentsTouched(true);
                    setSegments(new Set<SegmentKey>(["residential", "commercial", "government"]));
                  }}
                  className="text-xs font-semibold text-white/70 underline decoration-white/20 underline-offset-4 hover:text-white hover:decoration-white/50"
                >
                  Select all
                </button>
              ) : (
                <div className="text-xs font-semibold text-white/60">Choose 1</div>
              )}
            </div>

            <div className="grid gap-2 sm:grid-cols-3">
              {SEGMENTS.map((s) => {
                const active = segments.has(s.key);
                const disabled = plan === "all"; // all plan implies all 3

                return (
                  <button
                    key={s.key}
                    type="button"
                    onClick={() => {
                      setSegmentsTouched(true);
                      setSegments((prev) => {
                        if (plan === "single") {
                          if (prev.size === 1 && prev.has(s.key)) return prev;
                          return new Set<SegmentKey>([s.key]);
                        }
                        if (plan === "all") return new Set<SegmentKey>(["residential", "commercial", "government"]);
                        return toggleSet(prev, s.key);
                      });
                    }}
                    className={[
                      "rounded-2xl border px-3 py-3 text-left transition",
                      active
                        ? "border-blue-400/60 bg-blue-500/15"
                        : "border-white/10 bg-slate-950/25 hover:bg-slate-950/35",
                      disabled ? "opacity-95" : "",
                    ].join(" ")}
                    aria-disabled={disabled}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="text-[18px]">{s.icon}</div>
                        <div className="mt-1 text-sm font-semibold text-white">{s.label}</div>
                        <div className="mt-0.5 text-xs text-slate-300">{s.hint}</div>
                      </div>

                      <div
                        className={[
                          "mt-1 h-5 w-5 rounded-full border flex items-center justify-center text-xs",
                          active
                            ? "border-blue-400/70 bg-blue-500/25 text-white"
                            : "border-white/15 text-white/50",
                        ].join(" ")}
                      >
                        {active ? "✓" : ""}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {segmentsTouched && plan === "single" && segments.size !== 1 ? (
              <div className="mt-2 text-xs text-red-200">
                Single market plan requires exactly ONE market.
              </div>
            ) : null}
          </div>

          {/* Form */}
          <form
            className="mt-7 grid gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              if (!loading && canSubmit) createCustomer();
            }}
          >
            <div className="text-[11px] font-semibold tracking-widest text-white/55">
              STEP 1 OF 2 • BASIC INFO
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <Field label="Company name">
                <input
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/35 px-4 py-3 text-sm text-white placeholder:text-slate-400 outline-none focus:border-blue-400/60 focus:ring-2 focus:ring-blue-500/20"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Your company name"
                  autoComplete="organization"
                />
              </Field>

              <Field label="Email">
                <input
                  type="email"
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/35 px-4 py-3 text-sm text-white placeholder:text-slate-400 outline-none focus:border-blue-400/60 focus:ring-2 focus:ring-blue-500/20"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@email.com"
                  autoComplete="email"
                />
                {/* ✅ removed the “We only use this…” line */}
              </Field>
            </div>

            <Field label="Service area">
              <input
                className="w-full rounded-2xl border border-white/10 bg-slate-950/35 px-4 py-3 text-sm text-white placeholder:text-slate-400 outline-none focus:border-blue-400/60 focus:ring-2 focus:ring-blue-500/20"
                value={serviceArea}
                onChange={(e) => setServiceArea(e.target.value)}
                placeholder="City, State or Nationwide"
                autoComplete="address-level2"
              />
            </Field>

            <Field label="Keywords (required)">
              <input
                className="w-full rounded-2xl border border-white/10 bg-slate-950/35 px-4 py-3 text-sm text-white placeholder:text-slate-400 outline-none focus:border-blue-400/60 focus:ring-2 focus:ring-blue-500/20"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                placeholder="asphalt, striping, concrete"
              />
              <div className="mt-2 text-xs text-slate-300">
                Think services + equipment + materials.
              </div>
            </Field>

            <Field label="NAICS codes (optional)">
              <input
                className="w-full rounded-2xl border border-white/10 bg-slate-950/35 px-4 py-3 text-sm text-white placeholder:text-slate-400 outline-none focus:border-blue-400/60 focus:ring-2 focus:ring-blue-500/20"
                value={naicsInput}
                onChange={(e) => setNaicsInput(e.target.value)}
                onBlur={() => setNaicsTouched(true)}
                placeholder="237310, 238220, 561730"
                inputMode="text"
              />

              <div className="mt-2 text-xs text-slate-300">
                NAICS improves accuracy, but keywords are enough to start.
                {govSelected ? (
                  <span className="text-white/80 font-semibold"> (For Government, NAICS helps a lot.)</span>
                ) : null}
              </div>

              {naicsTouched && naicsParsed.hadInput && !naicsParsed.hasAny ? (
                <div className="mt-2 text-xs text-amber-200">
                  We couldn’t parse any valid NAICS codes — we’ll rely on keywords.
                </div>
              ) : null}

              {naicsTouched && naicsParsed.hasInvalid ? (
                <div className="mt-2 text-xs text-amber-200">
                  Some entries look invalid and will be ignored.
                </div>
              ) : null}
            </Field>

            <div className="pt-1 text-[11px] font-semibold tracking-widest text-white/55">
              STEP 2 OF 2 • FINISH
            </div>

            {err ? (
              <div className="rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {err}
              </div>
            ) : null}

            <div className="text-xs text-slate-300">
              By continuing, you agree to our{" "}
              <Link href="/terms" className="font-semibold text-white/85 underline decoration-white/25 underline-offset-4 hover:text-white">
                Terms
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="font-semibold text-white/85 underline decoration-white/25 underline-offset-4 hover:text-white">
                Privacy Policy
              </Link>
              .
            </div>

            <button
              type="submit"
              disabled={!canSubmit || loading}
              className="mt-1 inline-flex w-full items-center justify-center rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Creating…" : "Continue"}
            </button>

            <div className="text-center text-xs text-slate-300">
              No credit card required • Cancel anytime • No spam
            </div>

            <div className="pt-2 text-center text-sm text-white/70">
              Already have an account?{" "}
              <Link href="/login" className="font-semibold text-white underline decoration-white/25 underline-offset-4 hover:decoration-white/50">
                Sign in
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="grid gap-2 text-left">
      <div className="text-xs font-semibold text-slate-200">{label}</div>
      {children}
    </label>
  );
}
