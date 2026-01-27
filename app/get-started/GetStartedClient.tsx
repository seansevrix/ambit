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

  const priceLabel =
    plan === "all"
      ? `$${PRICE_ALL.toFixed(2)}`
      : `$${PRICE_SINGLE.toFixed(2)}`;

  return (
    <div className="min-h-screen bg-[#070B18] text-white">
      {/* Background glow + subtle grid */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(900px_600px_at_20%_0%,rgba(26,79,163,0.25),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(800px_520px_at_80%_25%,rgba(52,211,153,0.16),transparent_55%)]" />
        <div className="absolute inset-0 opacity-[0.06] [background-image:linear-gradient(to_right,rgba(255,255,255,0.25)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.25)_1px,transparent_1px)] [background-size:72px_72px]" />
        <div className="absolute inset-0 bg-gradient-to-b from-white/[0.03] via-transparent to-transparent" />
      </div>

      <div className="mx-auto max-w-[1200px] px-6 py-10 lg:px-10">
        {/* Top bar */}
        <div className="flex items-center justify-between">
          <Link href="/" className="text-sm text-white/70 hover:text-white">
            ← Back
          </Link>

          <div className="hidden sm:flex items-center gap-2 text-xs text-white/60">
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
              7-day free trial
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
              No credit card required
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
              Cancel anytime
            </span>
          </div>
        </div>

        {/* Grid: form + right rail */}
        <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          {/* LEFT: main card */}
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-[0_10px_60px_rgba(0,0,0,0.35)] backdrop-blur">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(900px_420px_at_30%_0%,rgba(110,168,255,0.22),transparent_60%)]" />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#08122B]/60 via-[#070F22]/55 to-[#060A16]/65" />

            <div className="relative p-6 sm:p-8">
              {/* Header */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 rounded-2xl border border-white/10 bg-white/5 p-2">
                    <AmbitMark size={34} />
                  </div>
                  <div>
                    <div className="text-xs font-semibold tracking-wide text-white/80">
                      AMBIT
                    </div>
                    <h1 className="mt-1 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                      Get started
                    </h1>
                    <p className="mt-1 text-sm text-white/65">
                      Create your profile once. AMBIT delivers matched opportunities daily.
                    </p>
                  </div>
                </div>

                <span className="hidden sm:inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[11px] font-semibold text-white/80">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/60" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                  </span>
                  Live setup
                </span>
              </div>

              {/* Plan */}
              <div className="mt-6">
                <div className="mb-2 text-xs font-semibold text-white/75">Plan</div>
                <div className="grid gap-2 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => setPlan("single")}
                    className={[
                      "rounded-2xl border px-4 py-3 text-left transition",
                      plan === "single"
                        ? "border-blue-400/60 bg-blue-500/15"
                        : "border-white/10 bg-black/20 hover:bg-black/30",
                    ].join(" ")}
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-semibold text-white">Single market</div>
                      <div className="text-xs font-semibold text-white/80">
                        ${PRICE_SINGLE.toFixed(2)}/mo
                      </div>
                    </div>
                    <div className="mt-1 text-xs text-white/60">Choose 1 market</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPlan("all")}
                    className={[
                      "rounded-2xl border px-4 py-3 text-left transition",
                      plan === "all"
                        ? "border-blue-400/60 bg-blue-500/15"
                        : "border-white/10 bg-black/20 hover:bg-black/30",
                    ].join(" ")}
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-semibold text-white">All markets</div>
                      <div className="text-xs font-semibold text-white/80">
                        ${PRICE_ALL.toFixed(2)}/mo
                      </div>
                    </div>
                    <div className="mt-1 text-xs text-white/60">
                      Residential + Commercial + Government
                    </div>
                  </button>
                </div>

                <div className="mt-2 text-xs text-white/60">
                  Selected:{" "}
                  <span className="font-semibold text-white">
                    {plan === "all" ? "All markets" : "Single market"}
                  </span>{" "}
                  <span className="mx-2 text-white/30">•</span>
                  <span className="font-semibold text-white">{priceLabel}/month</span>
                </div>
              </div>

              {/* Markets */}
              <div className="mt-6">
                <div className="mb-2 flex items-center justify-between">
                  <div className="text-xs font-semibold text-white/75">Market</div>
                  {plan === "all" ? (
                    <button
                      type="button"
                      onClick={() => {
                        setSegmentsTouched(true);
                        setSegments(
                          new Set<SegmentKey>(["residential", "commercial", "government"])
                        );
                      }}
                      className="text-xs font-semibold text-white/65 underline decoration-white/20 underline-offset-4 hover:text-white"
                    >
                      Select all
                    </button>
                  ) : (
                    <div className="text-xs font-semibold text-white/55">Choose 1</div>
                  )}
                </div>

                <div className="grid gap-2 sm:grid-cols-3">
                  {SEGMENTS.map((s) => {
                    const active = segments.has(s.key);
                    const disabled = plan === "all";

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
                            if (plan === "all")
                              return new Set<SegmentKey>([
                                "residential",
                                "commercial",
                                "government",
                              ]);
                            return toggleSet(prev, s.key);
                          });
                        }}
                        className={[
                          "rounded-2xl border px-3 py-3 text-left transition",
                          active
                            ? "border-blue-400/60 bg-blue-500/15"
                            : "border-white/10 bg-black/20 hover:bg-black/30",
                          disabled ? "opacity-95" : "",
                        ].join(" ")}
                        aria-disabled={disabled}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="text-[18px]">{s.icon}</div>
                            <div className="mt-1 text-sm font-semibold text-white">
                              {s.label}
                            </div>
                            <div className="mt-0.5 text-xs text-white/60">{s.hint}</div>
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
                className="mt-6 grid gap-4"
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
                      className="w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white placeholder:text-white/35 outline-none focus:border-blue-400/60 focus:ring-2 focus:ring-blue-500/20"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="Your company name"
                      autoComplete="organization"
                    />
                  </Field>

                  <Field label="Email">
                    <input
                      type="email"
                      className="w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white placeholder:text-white/35 outline-none focus:border-blue-400/60 focus:ring-2 focus:ring-blue-500/20"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@email.com"
                      autoComplete="email"
                    />
                  </Field>
                </div>

                <Field label="Service area">
                  <input
                    className="w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white placeholder:text-white/35 outline-none focus:border-blue-400/60 focus:ring-2 focus:ring-blue-500/20"
                    value={serviceArea}
                    onChange={(e) => setServiceArea(e.target.value)}
                    placeholder="City, State or Nationwide"
                    autoComplete="address-level2"
                  />
                </Field>

                <Field label="Keywords (required)">
                  <input
                    className="w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white placeholder:text-white/35 outline-none focus:border-blue-400/60 focus:ring-2 focus:ring-blue-500/20"
                    value={keywords}
                    onChange={(e) => setKeywords(e.target.value)}
                    placeholder="asphalt, striping, concrete"
                  />
                  <div className="mt-2 text-xs text-white/55">
                    Think services + equipment + materials.
                  </div>
                </Field>

                <Field label="NAICS codes (optional)">
                  <input
                    className="w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white placeholder:text-white/35 outline-none focus:border-blue-400/60 focus:ring-2 focus:ring-blue-500/20"
                    value={naicsInput}
                    onChange={(e) => setNaicsInput(e.target.value)}
                    onBlur={() => setNaicsTouched(true)}
                    placeholder="237310, 238220, 561730"
                    inputMode="text"
                  />

                  <div className="mt-2 text-xs text-white/55">
                    NAICS improves accuracy, but keywords are enough to start.
                    {govSelected ? (
                      <span className="font-semibold text-white/80">
                        {" "}
                        (For Government, NAICS helps a lot.)
                      </span>
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

                <div className="text-xs text-white/60">
                  By continuing, you agree to our{" "}
                  <Link
                    href="/terms"
                    className="font-semibold text-white/85 underline decoration-white/25 underline-offset-4 hover:text-white"
                  >
                    Terms
                  </Link>{" "}
                  and{" "}
                  <Link
                    href="/privacy"
                    className="font-semibold text-white/85 underline decoration-white/25 underline-offset-4 hover:text-white"
                  >
                    Privacy Policy
                  </Link>
                  .
                </div>

                <button
                  type="submit"
                  disabled={!canSubmit || loading}
                  className="mt-1 inline-flex w-full items-center justify-center rounded-2xl bg-[#1A4FA3] px-5 py-3 text-sm font-semibold text-white hover:bg-[#15428B] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? "Creating…" : "Continue"}
                </button>

                <div className="text-center text-xs text-white/55">
                  No credit card required • Cancel anytime • No spam
                </div>

                <div className="pt-2 text-center text-sm text-white/70">
                  Already have an account?{" "}
                  <Link
                    href="/login"
                    className="font-semibold text-white underline decoration-white/25 underline-offset-4 hover:decoration-white/50"
                  >
                    Sign in
                  </Link>
                </div>
              </form>
            </div>
          </div>

          {/* RIGHT: info rail */}
          <aside className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-[0_10px_60px_rgba(0,0,0,0.25)] backdrop-blur">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(700px_360px_at_70%_0%,rgba(52,211,153,0.10),transparent_60%)]" />
            <div className="relative">
              <h3 className="text-sm font-semibold text-white/90">
                What you’ll see inside
              </h3>
              <p className="mt-2 text-sm text-white/65">
                Your matched opportunities, ranked and summarized—so you can respond faster.
              </p>

              <div className="mt-4 grid gap-3">
                <InfoCard title="Daily matches" desc="Fresh local leads delivered every morning." />
                <InfoCard title="Clear summaries" desc="Know why it matches before you click." />
                <InfoCard title="Better fit" desc="Less noise. More bid-ready work." />
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <div className="text-xs font-semibold text-white/75">Tip</div>
                  <div className="mt-1 text-sm text-white/65">
                    If you’re not seeing enough matches, tighten your service area + keywords.
                  </div>
                </div>
              </div>

              <div className="mt-5 border-t border-white/10 pt-4 text-xs text-white/55">
                Need to tweak your profile later? You can update keywords and NAICS anytime.
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="grid gap-2 text-left">
      <div className="text-xs font-semibold text-white/75">{label}</div>
      {children}
    </label>
  );
}

function InfoCard({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <div className="text-sm font-semibold text-white/85">{title}</div>
      <div className="mt-1 text-sm text-white/65">{desc}</div>
    </div>
  );
}
