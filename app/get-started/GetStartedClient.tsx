"use client";

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
const SEGMENTS: Array<{ key: SegmentKey; label: string; hint: string }> = [
  { key: "residential", label: "Residential", hint: "Homeowner work" },
  { key: "commercial", label: "Commercial", hint: "Businesses & facilities" },
  { key: "government", label: "Government", hint: "Federal, state & local" },
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
  const [naicsInput, setNaicsInput] = useState("");
  const [keywords, setKeywords] = useState("");

  const [plan, setPlan] = useState<PlanTier>("single");

  // ✅ Start empty so user picks market first
  const [segments, setSegments] = useState<Set<SegmentKey>>(() => new Set<SegmentKey>());

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

  // Enforce segment rules by plan
  useEffect(() => {
    if (plan !== "single") return;

    setSegments((prev) => {
      // if user hasn't picked yet, leave empty
      if (prev.size === 0) return prev;

      // single plan must have exactly one
      if (prev.size === 1) return prev;

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

  const marketSelected = segments.size > 0;

  // NAICS optional
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
        throw new Error("Select at least one market: Residential, Commercial, or Government.");
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
        // ✅ DO NOT send `sources` from the frontend (backend controls ingest sources)
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
  const planTitle = plan === "all" ? "All markets" : "Single market";
  const planDesc =
    plan === "all"
      ? "Track Government + Commercial + Residential."
      : "Track 1 lead type (choose ONE market).";

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-[#061033] via-[#040b24] to-[#020617] text-slate-100">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-blue-600/10 blur-3xl" />
        <div className="absolute -bottom-32 right-[-80px] h-[520px] w-[520px] rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.12),transparent_55%)]" />
      </div>

      <div className="relative mx-auto max-w-6xl px-6 py-12">
        {/* ✅ 7-DAY FREE TRIAL BANNER */}
        <div className="sticky top-3 z-20 mx-auto mb-8 max-w-4xl">
          <div className="rounded-2xl border border-blue-400/25 bg-blue-500/10 px-4 py-3 text-sm text-slate-100 shadow-lg backdrop-blur">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-2 py-1 text-xs font-semibold">
                  7-day free trial
                </span>
                <span className="text-sm font-semibold text-white">
                  Try AMBIT free for 7 days.
                </span>
              </div>
              <div className="text-xs text-slate-200">
                No credit card required • Cancel anytime • No spam
              </div>
            </div>
          </div>
        </div>

        {/* HERO */}
        <header className="mx-auto max-w-4xl text-center">
          <div className="mx-auto flex items-center justify-center gap-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-2 shadow-sm backdrop-blur">
              <AmbitMark size={34} />
            </div>
            <div className="text-left">
              <div className="text-sm font-semibold tracking-wide">AMBIT</div>
            </div>
          </div>

          <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
            Create your profile
          </h1>

          <p className="mx-auto mt-4 max-w-3xl text-base leading-relaxed text-slate-200">
            Create a quick profile, then view your first matches in your portal.
            <span className="text-white/85"> You can refine markets, keywords, and NAICS anytime.</span>
          </p>
        </header>

        {/* PLAN PICKER */}
        <section className="mx-auto mt-10 max-w-4xl rounded-[32px] border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur">
          <div className="text-xs font-semibold tracking-widest text-slate-300">PLAN</div>
          <div className="mt-2 text-2xl font-semibold text-white">Choose your coverage</div>
          <div className="mt-2 text-sm text-slate-200">
            <span className="font-semibold text-white">{planTitle}</span> — {planDesc}
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => setPlan("single")}
              className={[
                "rounded-2xl border px-4 py-4 text-left transition",
                plan === "single"
                  ? "border-blue-400/60 bg-blue-500/15 shadow-[0_0_0_1px_rgba(59,130,246,0.20)]"
                  : "border-white/10 bg-slate-950/25 hover:bg-slate-950/35",
              ].join(" ")}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="text-sm font-semibold text-white">Single market</div>
                <div className="whitespace-nowrap text-sm font-bold text-white tabular-nums">
                  $39.99/mo
                </div>
              </div>
              <div className="mt-1 text-xs text-slate-300">
                Choose ONE: Residential OR Commercial OR Government
              </div>
            </button>

            <button
              type="button"
              onClick={() => setPlan("all")}
              className={[
                "rounded-2xl border px-4 py-4 text-left transition",
                plan === "all"
                  ? "border-blue-400/60 bg-blue-500/15 shadow-[0_0_0_1px_rgba(59,130,246,0.20)]"
                  : "border-white/10 bg-slate-950/25 hover:bg-slate-950/35",
              ].join(" ")}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="text-sm font-semibold text-white">All markets</div>
                  <span className="whitespace-nowrap rounded-full border border-blue-400/30 bg-blue-500/20 px-2 py-1 text-[11px] font-semibold text-white/90">
                    Most popular
                  </span>
                </div>

                <div className="whitespace-nowrap text-sm font-bold text-white tabular-nums">
                  $59.99/mo
                </div>
              </div>

              <div className="mt-1 text-xs text-slate-300">
                Government + Commercial + Residential
              </div>
            </button>
          </div>

          <div className="mt-4 rounded-2xl border border-white/10 bg-slate-950/20 p-4 text-sm text-slate-200">
            Selected: <span className="font-semibold text-white">{planTitle}</span> •{" "}
            <span className="font-semibold text-white">{priceLabel}/month</span>
          </div>
        </section>

        {/* FORM */}
        <section className="mx-auto mt-10 max-w-4xl rounded-[32px] border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur text-left">
          <div className="grid gap-6">
            {/* ✅ MARKETS FIRST */}
            <div>
              <div className="mb-3 flex items-center justify-between">
                <div className="text-xs font-semibold tracking-widest text-slate-300">
                  START HERE • MARKET
                </div>

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
                  <div className="text-xs font-semibold text-white/60">Single plan: choose 1</div>
                )}
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {SEGMENTS.map((s) => {
                  const active = segments.has(s.key);

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
                          return toggleSet(prev, s.key);
                        });
                      }}
                      className={[
                        "rounded-2xl border px-4 py-3 text-left transition",
                        active
                          ? "border-blue-400/60 bg-blue-500/15 shadow-[0_0_0_1px_rgba(59,130,246,0.20)]"
                          : "border-white/10 bg-slate-950/25 hover:bg-slate-950/35",
                      ].join(" ")}
                    >
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-semibold text-white">{s.label}</div>
                        <div
                          className={[
                            "h-5 w-5 rounded-full border flex items-center justify-center text-xs",
                            active
                              ? "border-blue-400/70 bg-blue-500/25 text-white"
                              : "border-white/15 text-white/50",
                          ].join(" ")}
                        >
                          {active ? "✓" : ""}
                        </div>
                      </div>
                      <div className="mt-1 text-xs text-slate-300">{s.hint}</div>
                    </button>
                  );
                })}
              </div>

              <div className="mt-3 text-xs text-slate-300">
                {plan === "single"
                  ? "Choose ONE market to continue."
                  : "Choose one or more markets. You can change this later."}
              </div>

              {segmentsTouched && plan === "single" && segments.size !== 1 && segments.size > 0 ? (
                <div className="mt-2 text-xs text-red-200">
                  Single market plan requires exactly ONE market.
                </div>
              ) : null}

              {!marketSelected ? (
                <div className="mt-4 rounded-2xl border border-white/10 bg-slate-950/20 px-4 py-3 text-sm text-slate-200">
                  Select a market above to continue.
                </div>
              ) : null}
            </div>

            {marketSelected ? (
              <>
                <Divider />

                {/* ✅ STEP 1: BASIC INFO + TARGETING (in your requested order) */}
                <div>
                  <div className="mb-3 flex items-center justify-between">
                    <div className="text-xs font-semibold tracking-widest text-slate-300">
                      STEP 1 OF 2 • BASIC INFO
                    </div>
                    <div className="text-xs font-semibold text-white/60">~60 seconds</div>
                  </div>

                  <div className="grid items-start gap-4 md:grid-cols-2">
                    <Field label="Company name">
                      <input
                        className="w-full rounded-2xl border border-white/10 bg-slate-950/35 px-4 py-3 text-left text-sm text-white placeholder:text-slate-400 outline-none focus:border-blue-400/60 focus:ring-2 focus:ring-blue-500/20"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder="Your company name"
                        autoComplete="organization"
                      />
                    </Field>

                    <Field label="Email">
                      <input
                        type="email"
                        className="w-full rounded-2xl border border-white/10 bg-slate-950/35 px-4 py-3 text-left text-sm text-white placeholder:text-slate-400 outline-none focus:border-blue-400/60 focus:ring-2 focus:ring-blue-500/20"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@email.com"
                        autoComplete="email"
                      />
                    </Field>
                  </div>

                  <div className="mt-4">
                    <Field label="Service area">
                      <input
                        className="w-full rounded-2xl border border-white/10 bg-slate-950/35 px-4 py-3 text-left text-sm text-white placeholder:text-slate-400 outline-none focus:border-blue-400/60 focus:ring-2 focus:ring-blue-500/20"
                        value={serviceArea}
                        onChange={(e) => setServiceArea(e.target.value)}
                        placeholder="City, State or Nationwide"
                        autoComplete="address-level2"
                      />
                    </Field>
                  </div>

                  <div className="mt-4">
                    <Field label="Keywords (required)">
                      <input
                        className="w-full rounded-2xl border border-white/10 bg-slate-950/35 px-4 py-3 text-left text-sm text-white placeholder:text-slate-400 outline-none focus:border-blue-400/60 focus:ring-2 focus:ring-blue-500/20"
                        value={keywords}
                        onChange={(e) => setKeywords(e.target.value)}
                        placeholder="asphalt, striping, concrete"
                      />
                      <div className="mt-2 text-xs text-slate-300">
                        Think services + equipment + materials. Example: “dumpster rental, hauling, demolition”.
                      </div>
                    </Field>
                  </div>

                  <div className="mt-4">
                    <Field label="NAICS codes (optional)">
                      <input
                        className="w-full rounded-2xl border border-white/10 bg-slate-950/35 px-4 py-3 text-left text-sm text-white placeholder:text-slate-400 outline-none focus:border-blue-400/60 focus:ring-2 focus:ring-blue-500/20"
                        value={naicsInput}
                        onChange={(e) => setNaicsInput(e.target.value)}
                        onBlur={() => setNaicsTouched(true)}
                        placeholder="237310, 238220, 561730"
                        inputMode="text"
                      />

                      <div className="mt-2 text-xs text-slate-300">
                        NAICS improves accuracy, but you can start with keywords only.{" "}
                        {govSelected ? (
                          <span className="text-white/80 font-semibold">
                            (For Government matches, NAICS helps a lot.)
                          </span>
                        ) : null}
                      </div>

                      {naicsTouched && naicsParsed.hadInput && !naicsParsed.hasAny ? (
                        <div className="mt-2 text-xs text-amber-200">
                          We couldn’t parse any valid NAICS codes — we’ll rely on keywords. Use 2–6 digits separated by commas.
                        </div>
                      ) : null}

                      {naicsTouched && naicsParsed.hasInvalid ? (
                        <div className="mt-2 text-xs text-amber-200">
                          Some entries look invalid and will be ignored.
                        </div>
                      ) : null}
                    </Field>
                  </div>
                </div>

                <Divider />

                {/* ✅ STEP 2: FINISH */}
                <div>
                  <div className="mb-3 text-xs font-semibold tracking-widest text-slate-300">
                    STEP 2 OF 2 • FINISH
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-slate-950/20 px-4 py-3 text-sm text-slate-200">
                    <div className="font-semibold text-white">Next:</div>
                    We’ll generate your first matches in your portal. You can refine this profile anytime.
                  </div>

                  {err ? (
                    <div className="mt-4 rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                      {err}
                    </div>
                  ) : null}

                  <button
                    disabled={!canSubmit || loading}
                    onClick={createCustomer}
                    className="mt-5 inline-flex w-full items-center justify-center rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {loading ? "Creating profile…" : "Create profile → View matches"}
                  </button>

                  <div className="mt-3 text-center text-xs text-slate-300">
                    No credit card required • Cancel anytime • No spam
                  </div>
                </div>
              </>
            ) : null}
          </div>
        </section>

        {/* WHAT YOU GET */}
        <section className="mx-auto mt-12 max-w-5xl">
          <div className="text-center text-xs font-semibold tracking-widest text-slate-300">
            WHAT YOU GET
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <FeatureCard
              title="Know what’s worth chasing"
              body="A match score that helps you ignore the junk and move fast."
            />
            <FeatureCard
              title="Understand it in 60 seconds"
              body="Plain-English summaries so you can decide quickly."
            />
            <FeatureCard
              title="Wake up to new leads"
              body="We scan daily and send ranked matches. Quiet mode included."
            />
          </div>
        </section>
      </div>
    </div>
  );
}

function Divider() {
  return <div className="h-px w-full bg-white/10" />;
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="grid gap-2 text-left">
      <div className="text-xs font-semibold text-slate-200">{label}</div>
      {children}
    </label>
  );
}

function FeatureCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-lg backdrop-blur">
      <div className="text-sm font-semibold text-white">{title}</div>
      <div className="mt-2 text-sm text-slate-200">{body}</div>
    </div>
  );
}
