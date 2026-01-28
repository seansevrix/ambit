"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
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
  const parts = String(raw || "")
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

function addNaicsToken(current: string, token: string) {
  const parsed = parseNaicsList(current);
  const t = sanitizeNaicsToken(token);
  if (!isValidNaicsToken(t)) return current;

  const set = new Set(parsed.valid);
  set.add(t);
  return Array.from(set).join(", ");
}

function removeNaicsToken(current: string, token: string) {
  const parsed = parseNaicsList(current);
  const t = sanitizeNaicsToken(token);
  const next = parsed.valid.filter((x) => x !== t);
  return next.join(", ");
}

/** Segments / Markets */
type SegmentKey = "residential" | "commercial" | "government";
const SEGMENTS: Array<{
  key: SegmentKey;
  label: string;
  hint: string;
  icon: string;
}> = [
  { key: "residential", label: "Residential", hint: "Homeowner work", icon: "🏠" },
  { key: "commercial", label: "Commercial", hint: "Businesses & facilities", icon: "🏢" },
  { key: "government", label: "Government", hint: "Federal, state & local", icon: "🏛️" },
];

// Plans
type PlanTier = "single" | "all";
const PRICE_SINGLE = 39.99;
const PRICE_ALL = 59.99;

// Trade for prefill + NAICS chips
type Trade = "GC" | "Plumbing" | "Landscaping";
const TRADE_OPTIONS: Trade[] = ["GC", "Plumbing", "Landscaping"];

const NAICS_SUGGESTIONS: Record<Trade, Array<{ code: string; label: string }>> = {
  GC: [
    { code: "236220", label: "Commercial building" },
    { code: "236115", label: "Residential new" },
    { code: "238990", label: "All other specialty" },
    { code: "237310", label: "Highway/street/bridge" },
  ],
  Plumbing: [
    { code: "238220", label: "Plumbing/HVAC" },
    { code: "561790", label: "Other services (alt)" },
    { code: "561210", label: "Facilities support" },
  ],
  Landscaping: [
    { code: "561730", label: "Landscaping" },
    { code: "561710", label: "Exterminating (adj.)" },
    { code: "238990", label: "Outdoor specialty (alt)" },
  ],
};

function normalizeTrade(raw: string | null): Trade | null {
  const v = String(raw || "").trim().toLowerCase();
  if (v === "gc" || v === "general" || v === "generalcontractor") return "GC";
  if (v === "plumbing" || v === "plumber") return "Plumbing";
  if (v === "landscaping" || v === "landscape") return "Landscaping";
  return null;
}

function normalizeMarket(raw: string | null): SegmentKey | null {
  const v = String(raw || "").trim().toLowerCase();
  if (v === "residential") return "residential";
  if (v === "commercial") return "commercial";
  if (v === "government" || v === "gov") return "government";
  return null;
}

export default function GetStartedClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [serviceArea, setServiceArea] = useState("");
  const [keywords, setKeywords] = useState("");
  const [naicsInput, setNaicsInput] = useState("");

  const [plan, setPlan] = useState<PlanTier>("single");

  // Trade state (for NAICS chips + optional prefill)
  const [trade, setTrade] = useState<Trade>("GC");

  // default: all selected; single-plan effect will reduce to 1
  const [segments, setSegments] = useState<Set<SegmentKey>>(
    () => new Set<SegmentKey>(["residential", "commercial", "government"])
  );

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const [naicsTouched, setNaicsTouched] = useState(false);
  const [segmentsTouched, setSegmentsTouched] = useState(false);

  // Prefill only once (don’t clobber user typing)
  const didPrefillRef = useRef(false);

  // Load plan once (query param > localStorage > default)
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

  // Prefill from query params: trade, area, keywords, market (optional)
  useEffect(() => {
    if (didPrefillRef.current) return;
    if (!searchParams) return;

    const qpTrade = normalizeTrade(searchParams.get("trade"));
    const qpArea = String(searchParams.get("area") || "").trim();
    const qpKeywords = String(searchParams.get("keywords") || "").trim();
    const qpMarket = normalizeMarket(searchParams.get("market"));

    if (qpTrade) setTrade(qpTrade);

    if (qpArea && !serviceArea.trim()) setServiceArea(qpArea);
    if (qpKeywords && !keywords.trim()) setKeywords(qpKeywords);

    // Optional: if market is provided, set single plan + that segment
    if (qpMarket) {
      setPlan("single");
      setSegments(new Set<SegmentKey>([qpMarket]));
    }

    // Mark prefill as done if any of these existed
    if (qpTrade || qpArea || qpKeywords || qpMarket) {
      didPrefillRef.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // Persist plan selection
  useEffect(() => {
    try {
      localStorage.setItem("ambit_plan", plan);
    } catch {}
  }, [plan]);

  // When plan is "all", force all segments selected
  useEffect(() => {
    if (plan !== "all") return;
    setSegments(new Set<SegmentKey>(["residential", "commercial", "government"]));
  }, [plan]);

  // When plan is "single", force exactly one segment
  useEffect(() => {
    if (plan !== "single") return;
    setSegments((prev) => {
      if (prev.size === 1) return prev;
      const keep: SegmentKey =
        (prev.has("government") && "government") ||
        (prev.has("commercial") && "commercial") ||
        (prev.has("residential") && "residential") ||
        "government";
      return new Set<SegmentKey>([keep]);
    });
  }, [plan]);

  const naicsParsed = useMemo(() => parseNaicsList(naicsInput), [naicsInput]);
  const naicsCsv = useMemo(() => naicsParsed.valid.join(","), [naicsParsed.valid]);

  const segmentsList = useMemo(() => Array.from(segments), [segments]);
  const segmentsCsv = useMemo(() => segmentsList.join(","), [segmentsList]);

  const govSelected = useMemo(() => segments.has("government"), [segments]);

  const priceLabel = plan === "all" ? `$${PRICE_ALL.toFixed(2)}` : `$${PRICE_SINGLE.toFixed(2)}`;

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
        // optional metadata (safe to send even if backend ignores)
        trade,
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

  const activeNaicsSet = useMemo(() => new Set(naicsParsed.valid), [naicsParsed.valid]);

  return (
    <section className="mx-auto w-full max-w-3xl">
      {/* Top header (simple) */}
      <div className="mb-6 flex items-start justify-between gap-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-2">
              <AmbitMark size={34} />
            </div>
            <div>
              <div className="text-sm font-semibold text-white/90">AMBIT</div>
              <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-white/60">
                <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1">
                  7-day free trial
                </span>
                <span>No credit card</span>
                <span className="opacity-50">•</span>
                <span>Cancel anytime</span>
              </div>
            </div>
          </div>

          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white">
            Create your profile
          </h1>
          <p className="mt-2 text-sm text-white/65">
            We’ll send matched opportunities daily based on your service area + keywords.
          </p>
        </div>

        <Link href="/" className="text-sm text-white/65 hover:text-white">
          ← Back
        </Link>
      </div>

      {/* Main card */}
      <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-[0_20px_80px_rgba(0,0,0,0.35)] backdrop-blur sm:p-8">
        {/* Trade (new, fast win) */}
        <div className="mb-6">
          <div className="mb-2 flex items-center justify-between">
            <div className="text-xs font-semibold text-white/75">Trade</div>
            <div className="text-xs text-white/55">Used for smarter defaults</div>
          </div>

          <div className="inline-flex rounded-2xl border border-white/10 bg-slate-950/25 p-1">
            {TRADE_OPTIONS.map((t) => {
              const active = trade === t;
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTrade(t)}
                  className={[
                    "rounded-xl px-3 py-2 text-sm font-semibold transition",
                    active
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-white/75 hover:text-white",
                  ].join(" ")}
                  aria-pressed={active}
                >
                  {t}
                </button>
              );
            })}
          </div>
        </div>

        {/* Plan */}
        <div>
          <div className="mb-2 text-xs font-semibold text-white/75">Plan</div>
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
              <div className="mt-1 text-xs text-white/60">Choose 1 market</div>
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
            <span className="opacity-50">•</span>{" "}
            <span className="font-semibold text-white">{priceLabel}/month</span>
          </div>
        </div>

        <div className="my-6 h-px w-full bg-white/10" />

        {/* Market */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <div className="text-xs font-semibold text-white/75">Market</div>
            {plan === "single" ? (
              <div className="text-xs text-white/55">Choose 1</div>
            ) : (
              <div className="text-xs text-white/55">Included</div>
            )}
          </div>

          <div className="grid gap-2 sm:grid-cols-3">
            {SEGMENTS.map((s) => {
              const active = segments.has(s.key);
              const locked = plan === "all";

              return (
                <button
                  key={s.key}
                  type="button"
                  onClick={() => {
                    setSegmentsTouched(true);
                    setSegments((prev) => {
                      if (plan === "all") {
                        return new Set<SegmentKey>(["residential", "commercial", "government"]);
                      }
                      // single
                      if (prev.size === 1 && prev.has(s.key)) return prev;
                      return new Set<SegmentKey>([s.key]);
                    });
                  }}
                  className={[
                    "rounded-2xl border px-3 py-3 text-left transition",
                    active
                      ? "border-blue-400/60 bg-blue-500/15"
                      : "border-white/10 bg-slate-950/25 hover:bg-slate-950/35",
                    locked ? "cursor-default" : "",
                  ].join(" ")}
                  aria-disabled={locked}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-[18px]">{s.icon}</div>
                      <div className="mt-1 text-sm font-semibold text-white">{s.label}</div>
                      <div className="mt-0.5 text-xs text-white/60">{s.hint}</div>
                    </div>

                    <div
                      className={[
                        "mt-1 flex h-5 w-5 items-center justify-center rounded-full border text-[11px]",
                        active
                          ? "border-blue-400/70 bg-blue-500/25 text-white"
                          : "border-white/15 text-white/40",
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

        <div className="my-6 h-px w-full bg-white/10" />

        {/* Form */}
        <form
          className="grid gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (!loading && canSubmit) createCustomer();
          }}
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Company name">
              <input
                className="w-full rounded-2xl border border-white/10 bg-slate-950/35 px-4 py-3 text-sm text-white placeholder:text-white/35 outline-none focus:border-blue-400/60 focus:ring-2 focus:ring-blue-500/20"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Your company name"
                autoComplete="organization"
              />
            </Field>

            <Field label="Email">
              <input
                type="email"
                className="w-full rounded-2xl border border-white/10 bg-slate-950/35 px-4 py-3 text-sm text-white placeholder:text-white/35 outline-none focus:border-blue-400/60 focus:ring-2 focus:ring-blue-500/20"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                autoComplete="email"
              />
            </Field>
          </div>

          <Field label="Service area">
            <input
              className="w-full rounded-2xl border border-white/10 bg-slate-950/35 px-4 py-3 text-sm text-white placeholder:text-white/35 outline-none focus:border-blue-400/60 focus:ring-2 focus:ring-blue-500/20"
              value={serviceArea}
              onChange={(e) => setServiceArea(e.target.value)}
              placeholder="City, State or Nationwide"
              autoComplete="address-level2"
            />
          </Field>

          <Field label="Keywords (required)">
            <input
              className="w-full rounded-2xl border border-white/10 bg-slate-950/35 px-4 py-3 text-sm text-white placeholder:text-white/35 outline-none focus:border-blue-400/60 focus:ring-2 focus:ring-blue-500/20"
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
              className="w-full rounded-2xl border border-white/10 bg-slate-950/35 px-4 py-3 text-sm text-white placeholder:text-white/35 outline-none focus:border-blue-400/60 focus:ring-2 focus:ring-blue-500/20"
              value={naicsInput}
              onChange={(e) => setNaicsInput(e.target.value)}
              onBlur={() => setNaicsTouched(true)}
              placeholder="237310, 238220, 561730"
              inputMode="text"
            />

            {/* Trade-based chips */}
            <div className="mt-3">
              <div className="flex items-center justify-between">
                <div className="text-xs font-semibold text-white/70">Suggested for {trade}</div>
                <div className="text-xs text-white/45">Tap to add</div>
              </div>

              <div className="mt-2 flex flex-wrap gap-2">
                {NAICS_SUGGESTIONS[trade].map((s) => {
                  const active = activeNaicsSet.has(sanitizeNaicsToken(s.code));
                  return (
                    <button
                      key={s.code}
                      type="button"
                      onClick={() => {
                        setNaicsTouched(true);
                        setNaicsInput((cur) =>
                          active ? removeNaicsToken(cur, s.code) : addNaicsToken(cur, s.code)
                        );
                      }}
                      className={[
                        "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition",
                        active
                          ? "border-blue-400/60 bg-blue-500/20 text-white"
                          : "border-white/10 bg-slate-950/25 text-white/75 hover:text-white hover:bg-slate-950/35",
                      ].join(" ")}
                      aria-pressed={active}
                    >
                      <span className="font-mono">{s.code}</span>
                      <span className="text-white/55">•</span>
                      <span className="text-white/70">{s.label}</span>
                      {active ? <span className="ml-1 text-white">✓</span> : null}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-3 text-xs text-white/55">
              NAICS improves accuracy, but keywords are enough to start.
              {govSelected ? (
                <span className="font-semibold text-white/75"> (For Government, NAICS helps a lot.)</span>
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

          {err ? (
            <div className="rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {err}
            </div>
          ) : null}

          <div className="text-xs text-white/55">
            By continuing, you agree to our{" "}
            <Link
              href="/terms"
              className="font-semibold text-white/75 underline underline-offset-4 decoration-white/20 hover:decoration-white/50"
            >
              Terms
            </Link>{" "}
            and{" "}
            <Link
              href="/privacy"
              className="font-semibold text-white/75 underline underline-offset-4 decoration-white/20 hover:decoration-white/50"
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

          <div className="pt-1 text-center text-sm text-white/70">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-semibold text-white underline underline-offset-4 decoration-white/20 hover:decoration-white/50"
            >
              Sign in
            </Link>
          </div>
        </form>
      </div>
    </section>
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
