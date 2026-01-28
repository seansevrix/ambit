"use client";

import { useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

const BRAND = "#1A4FA3";
const API_BASE =
  (process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_BASE ||
    "http://localhost:5001")?.replace(/\/$/, "");

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

/** Keyword helpers */
function normalizeKeywords(list: string[]) {
  const cleaned = list
    .map((k) => k.trim())
    .filter(Boolean)
    .map((k) => k.replace(/\s+/g, " "))
    .slice(0, 16);

  const seen = new Set<string>();
  const out: string[] = [];
  for (const k of cleaned) {
    const key = k.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(k);
  }
  return out;
}
function splitKeywordText(text: string) {
  return normalizeKeywords(
    String(text || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
  );
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
  return uniqueValid;
}

function guessCompanyFromEmail(email: string) {
  const domain = (email.split("@")[1] || "").trim();
  const base = (domain.split(".")[0] || "").trim();
  const cleaned = base.replace(/[-_]/g, " ").replace(/\s+/g, " ").trim();
  if (!cleaned) return "New AMBIT Trial";
  return cleaned
    .split(" ")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

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

function BlueVerifiedCheck() {
  return (
    <span
      className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-sky-500 text-white shadow-sm"
      aria-label="Verified"
      title="Verified"
    >
      <svg viewBox="0 0 20 20" fill="currentColor" className="h-3 w-3">
        <path
          fillRule="evenodd"
          d="M16.704 5.29a1 1 0 01.006 1.414l-7.2 7.25a1 1 0 01-1.418.004L3.29 9.206a1 1 0 011.42-1.41l3.09 3.114 6.49-6.53a1 1 0 011.414-.006z"
          clipRule="evenodd"
        />
      </svg>
    </span>
  );
}

function MatchPill({ score }: { score: number }) {
  return (
    <div className="relative shrink-0">
      <div className="pointer-events-none absolute inset-0 -m-1 rounded-2xl bg-white/30 blur-md opacity-60" />
      <div className="pointer-events-none absolute inset-0 rounded-2xl ring-2 ring-white/40 animate-pulse" />

      <div className="relative rounded-2xl border border-white/30 bg-white px-3 py-2 text-center shadow-[0_10px_30px_rgba(255,255,255,0.18)] transition hover:shadow-[0_14px_40px_rgba(255,255,255,0.25)]">
        <div className="text-[11px] font-semibold text-slate-500">Match</div>
        <div className="text-xl font-extrabold tracking-tight text-slate-900">{score}</div>
      </div>
    </div>
  );
}

function MarketIcon({ market }: { market: string }) {
  const m = market.toLowerCase();
  // Only show icons for Commercial + Government
  if (m !== "commercial" && m !== "government") return null;

  return (
    <span className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-slate-50 px-1.5 py-1 text-slate-500">
      {m === "commercial" ? (
        // building
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor" aria-hidden="true">
          <path d="M4 22h16v-2H4v2zm2-4h12V2H6v16zm2-2V4h8v12H8zm1-9h2v2H9V7zm0 4h2v2H9v-2zm0 4h2v2H9v-2zm4-8h2v2h-2V7zm0 4h2v2h-2v-2zm0 4h2v2h-2v-2z" />
        </svg>
      ) : (
        // shield/seal
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor" aria-hidden="true">
          <path d="M12 2l8 4v6c0 5-3.4 9.4-8 10-4.6-.6-8-5-8-10V6l8-4zm0 3.2L6 7.7V12c0 3.9 2.5 7.4 6 8 3.5-.6 6-4.1 6-8V7.7l-6-2.5z" />
        </svg>
      )}
    </span>
  );
}

function LiveDot() {
  return (
    <span className="relative inline-flex h-2 w-2" aria-hidden="true">
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500/60" />
      <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
    </span>
  );
}

type LockedRow = { title: string; value: string };

function SampleCard({
  market,
  title,
  meta,
  naics,
  value,
  buyer,
  verified,
  score,
  accent,
  lockedRows,
}: {
  market: string;
  title: string;
  meta: string;
  naics: string;
  value: string;
  buyer: string;
  verified?: boolean;
  score: number;
  accent: "blue" | "indigo" | "green";
  lockedRows: LockedRow[];
}) {
  const badge =
    accent === "green"
      ? "bg-emerald-600/10 text-emerald-700 border-emerald-600/20"
      : accent === "indigo"
      ? "bg-indigo-600/10 text-indigo-700 border-indigo-600/20"
      : "bg-blue-600/10 text-blue-700 border-blue-600/20";

  return (
    <div className="rounded-2xl border border-white/20 bg-white/95 p-3 shadow-sm sm:p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className={cx("rounded-full border px-2 py-0.5 font-semibold", badge)}>
              {market}
            </span>

            <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 font-semibold text-slate-600">
              <LiveDot />
              LIVE
            </span>

            <MarketIcon market={market} />
          </div>

          <div className="mt-1 truncate text-sm font-semibold text-slate-900">{title}</div>
          <div className="mt-1 text-xs text-slate-600">{meta}</div>
        </div>

        <MatchPill score={score} />
      </div>

      <div className="mt-3 grid gap-2 text-xs text-slate-600 sm:grid-cols-3">
        <div className="min-w-0">
          <span className="text-slate-400">NAICS:</span> {naics}
        </div>
        <div className="min-w-0">
          <span className="text-slate-400">Est value:</span> {value}
        </div>
        <div className="min-w-0">
          <span className="text-slate-400">Buyer:</span>{" "}
          <span className="inline-flex items-center gap-1.5">
            {buyer}
            {verified ? <BlueVerifiedCheck /> : null}
          </span>
        </div>
      </div>

      {/* Blurred feed (unique per card) */}
      <div className="relative mt-3 overflow-hidden rounded-xl border border-slate-200 bg-slate-50 p-3">
        <div className="absolute inset-0 backdrop-blur-[6px]" />
        <div className="absolute inset-0 bg-white/35" />

        <div className="relative space-y-2 text-xs text-slate-700">
          {lockedRows.slice(0, 3).map((r) => (
            <div key={r.title} className="flex items-center justify-between">
              <div className="font-semibold">{r.title}</div>
              <div className="text-slate-500">{r.value}</div>
            </div>
          ))}
        </div>

        <div className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white/80 px-2 py-1 text-[11px] font-semibold text-slate-600">
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor" aria-hidden="true">
            <path d="M12 2a5 5 0 00-5 5v3H6a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2v-8a2 2 0 00-2-2h-1V7a5 5 0 00-5-5zm-3 8V7a3 3 0 016 0v3H9z" />
          </svg>
          Locked
        </div>

        <div className="relative mt-3 text-[11px] font-semibold text-slate-600">
          View more open opportunities in your area today.{" "}
          <span className="text-slate-900">Sign up to unlock.</span>
        </div>
      </div>
    </div>
  );
}

type IntentKey = "residential" | "commercial" | "government";

export default function ConciergeLeadCapture({ intent }: { intent?: IntentKey }) {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [area, setArea] = useState("");
  const [keywordText, setKeywordText] = useState("");
  const [naicsInput, setNaicsInput] = useState("");

  const keywordsList = useMemo(() => splitKeywordText(keywordText), [keywordText]);
  const naicsCodes = useMemo(() => parseNaicsList(naicsInput), [naicsInput]);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Always include all markets behind the scenes
  const segments = ["residential", "commercial", "government"];
  const segmentsCsv = segments.join(",");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const mail = email.trim().toLowerCase();
    const loc = area.trim();
    const kw = keywordsList.join(", ");

    if (!mail) return setError("Work Email is required.");
    if (!mail.includes("@")) return setError("Enter a valid email.");
    if (!loc) return setError("Service area is required.");
    if (!kw) return setError("Keywords are required. (Comma-separated is fine.)");

    // NAICS required
    if (!naicsCodes.length) {
      return setError("NAICS is required — essential for high-quality matching.");
    }

    const company = guessCompanyFromEmail(mail);

    try {
      setSubmitting(true);

      const payload: any = {
        name: company,
        companyName: company,
        email: mail,
        location: loc,
        serviceArea: loc,
        keywords: kw,
        naics: naicsCodes.join(","),
        naicsCodes,
        segments,
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
    } catch (err: any) {
      setError(err?.message || "Something went wrong. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  // Samples (make them feel “live” and UNIQUE)
  const samples = useMemo(() => {
    const residential = {
      market: "Residential",
      title: "Roof leak repair + shingle replacement",
      meta: "San Diego, CA • Due in 6 days",
      naics: "238160",
      value: "$1.8k–$6.5k",
      buyer: "Homeowner",
      verified: true,
      score: 86,
      accent: "blue" as const,
      lockedRows: [
        { title: "Drywall patch + texture", value: "$450" },
        { title: "Gutter clean + minor repair", value: "$320" },
        { title: "Fence section replacement", value: "$980" },
      ],
    };

    const commercial = {
      market: "Commercial",
      title: "HVAC preventative maintenance (12-month)",
      meta: "Carlsbad, CA • Due in 8 days",
      naics: "238220",
      value: "$18k–$55k",
      buyer: "Retail Plaza Management",
      verified: false,
      score: 89,
      accent: "indigo" as const,
      lockedRows: [
        { title: "Quarterly PM (8 RTUs)", value: "$9.6k" },
        { title: "Thermostat upgrade batch", value: "$3.1k" },
        { title: "After-hours service retainer", value: "$4.8k" },
      ],
    };

    const government = {
      market: "Government",
      title: "On-call hauling + disposal services",
      meta: "Vista, CA • Due in 10 days",
      naics: "562111",
      value: "$60k–$220k",
      buyer: "City Procurement",
      verified: false,
      score: 92,
      accent: "green" as const,
      lockedRows: [
        { title: "Debris haul (per load)", value: "$420" },
        { title: "Street sweep support (daily)", value: "$1.9k" },
        { title: "Emergency response (24h)", value: "$7.5k" },
      ],
    };

    // Put the selected intent first (feels responsive to the toggle)
    const pick =
      intent === "commercial" ? [commercial, residential, government]
      : intent === "government" ? [government, residential, commercial]
      : [residential, commercial, government];

    return pick;
  }, [intent]);

  return (
    <div className="w-full rounded-2xl border border-white/20 bg-white/10 p-4 shadow-[0_30px_120px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:rounded-[28px] sm:p-6">
      <div className="grid items-start gap-6 lg:grid-cols-2">
        {/* LEFT */}
        <div className="min-w-0">
          <div className="text-base font-semibold text-white sm:text-lg">Start your 7-day free trial</div>

          <form onSubmit={onSubmit} className="mt-4 space-y-4 sm:mt-5">
            {/* Email */}
            <div className="min-w-0">
              <div className="text-xs font-semibold text-white/80">Work Email</div>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Work Email"
                type="email"
                className="mt-2 w-full rounded-2xl border border-white/20 bg-white/90 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-white/40"
              />
            </div>

            {/* Service area */}
            <div className="min-w-0">
              <div className="text-xs font-semibold text-white/80">Service area</div>
              <input
                value={area}
                onChange={(e) => setArea(e.target.value)}
                placeholder="City or county"
                className="mt-2 w-full rounded-2xl border border-white/20 bg-white/90 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-white/40"
              />
            </div>

            {/* Keywords */}
            <div className="min-w-0">
              <div className="flex items-center justify-between">
                <div className="text-xs font-semibold text-white/80">Keywords</div>
                <div className="text-xs text-white/55">Required</div>
              </div>
              <input
                value={keywordText}
                onChange={(e) => setKeywordText(e.target.value)}
                placeholder="e.g., Roofing, HVAC, Paving"
                className="mt-2 w-full rounded-2xl border border-white/20 bg-white/90 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-white/40"
              />
            </div>

            {/* NAICS */}
            <div className="min-w-0">
              <div className="flex items-center justify-between">
                <div className="text-xs font-semibold text-white/80">NAICS codes</div>
                <div className="text-xs text-white/55">Required</div>
              </div>
              <input
                value={naicsInput}
                onChange={(e) => setNaicsInput(e.target.value)}
                placeholder="e.g., 238160"
                className="mt-2 w-full rounded-2xl border border-white/20 bg-white/90 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-white/40"
              />
              <div className="mt-2 text-[11px] text-white/55">Essential for high-quality matching.</div>
            </div>

            {/* CTA */}
            <div className="pt-1">
              <button
                type="submit"
                disabled={submitting}
                className={cx(
                  "w-full rounded-2xl px-5 py-3 text-sm font-semibold text-white shadow-[0_12px_40px_rgba(26,79,163,0.35)] transition",
                  submitting && "opacity-75"
                )}
                style={{ backgroundColor: BRAND }}
              >
                {submitting ? "Starting…" : "Start free trial"}
              </button>

              <div className="mt-3 text-center text-xs text-white/70">
                No credit card required. Cancel anytime.
              </div>

              {error && <div className="mt-3 text-sm text-red-200">{error}</div>}
            </div>
          </form>

          {/* ✅ Fill the “dead space” with clean, believable value (keeps left column balanced) */}
          <div className="mt-5 rounded-2xl border border-white/15 bg-white/5 p-4">
            <div className="text-xs font-semibold text-white/80">What you’ll get (daily)</div>
            <ul className="mt-3 grid gap-2 text-xs text-white/65">
              <li className="flex gap-2">
                <span className="mt-[2px] text-white/60">✓</span>
                Ranked matches based on your service area + NAICS + keywords
              </li>
              <li className="flex gap-2">
                <span className="mt-[2px] text-white/60">✓</span>
                Clear summaries so you can triage in minutes
              </li>
              <li className="flex gap-2">
                <span className="mt-[2px] text-white/60">✓</span>
                Buyer context + estimated value range when available
              </li>
            </ul>

            <div className="mt-3 text-[11px] text-white/55">
              Next: we generate your first matches and send your daily delivery.
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="min-w-0">
          <div className="flex items-center justify-between">
            <div className="text-base font-semibold text-white sm:text-lg">Sample matches</div>
            <div className="text-xs text-white/60">Examples only</div>
          </div>

          <div className="mt-4 space-y-4">
            {samples.map((s) => (
              <SampleCard
                key={`${s.market}-${s.title}`}
                market={s.market}
                title={s.title}
                meta={s.meta}
                naics={s.naics}
                value={s.value}
                buyer={s.buyer}
                verified={s.verified}
                score={s.score}
                accent={s.accent}
                lockedRows={s.lockedRows}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
