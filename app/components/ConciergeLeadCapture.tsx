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

function MatchPill({ score }: { score: number }) {
  return (
    <div className="relative shrink-0">
      {/* subtle “live” pulse ring */}
      <div className="pointer-events-none absolute inset-0 -m-1 rounded-2xl bg-white/30 blur-md opacity-60" />
      <div className="pointer-events-none absolute inset-0 rounded-2xl ring-2 ring-white/40 animate-pulse" />

      <div className="relative rounded-2xl border border-white/30 bg-white px-3 py-2 text-center shadow-[0_10px_30px_rgba(255,255,255,0.18)] hover:shadow-[0_14px_40px_rgba(255,255,255,0.25)] transition">
        <div className="text-[11px] font-semibold text-slate-500">Match</div>
        <div className="text-xl font-extrabold tracking-tight text-slate-900">
          {score}
        </div>
      </div>
    </div>
  );
}

function SampleCard({
  market,
  source,
  title,
  meta,
  naics,
  value,
  buyer,
  score,
  accent,
}: {
  market: string;
  source: string;
  title: string;
  meta: string;
  naics: string;
  value: string;
  buyer: string;
  score: number;
  accent: "blue" | "indigo" | "green";
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
            <span className="text-slate-500">• {source}</span>
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
          <span className="text-slate-400">Buyer:</span> {buyer}
        </div>
      </div>
    </div>
  );
}

export default function ConciergeLeadCapture() {
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

    // ✅ NAICS REQUIRED
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

  return (
    <div className="w-full rounded-2xl border border-white/20 bg-white/10 p-4 shadow-[0_30px_120px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:rounded-[28px] sm:p-6">
      <div className="grid gap-6 lg:grid-cols-2">
        {/* LEFT */}
        <div className="min-w-0">
          <div className="text-base font-semibold text-white sm:text-lg">
            Start your 7-day free trial
          </div>

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
                placeholder="Think services + equipment + materials (ex: asphalt, striping, concrete)"
                className="mt-2 w-full rounded-2xl border border-white/20 bg-white/90 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-white/40"
              />
            </div>

            {/* NAICS (required) */}
            <div className="min-w-0">
              <div className="flex items-center justify-between">
                <div className="text-xs font-semibold text-white/80">NAICS codes</div>
                <div className="text-xs text-white/55">Required</div>
              </div>
              <input
                value={naicsInput}
                onChange={(e) => setNaicsInput(e.target.value)}
                placeholder="237310, 238220, 561730"
                className="mt-2 w-full rounded-2xl border border-white/20 bg-white/90 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-white/40"
              />
              <div className="mt-2 text-[11px] text-white/55">
                Essential for high-quality matching.
              </div>
            </div>

            {/* CTA */}
            <div className="pt-1">
              <button
                type="submit"
                disabled={submitting}
                className={cx(
                  "w-full rounded-2xl px-5 py-3 text-sm font-semibold text-white shadow-[0_12px_40px_rgba(26,79,163,0.35)]",
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
        </div>

        {/* RIGHT */}
        <div className="min-w-0">
          <div className="flex items-center justify-between">
            <div className="text-base font-semibold text-white sm:text-lg">Sample matches</div>
            <div className="text-xs text-white/60">Examples only</div>
          </div>

          <div className="mt-4 space-y-4">
            <SampleCard
              market="Residential"
              source="Local homeowner request"
              title="Roof leak repair + shingle replacement"
              meta="San Diego, CA • Due in 6 days"
              naics="238160"
              value="$1.8k–$6.5k"
              buyer="Homeowner (verified)"
              score={86}
              accent="blue"
            />

            <SampleCard
              market="Commercial"
              source="Facility RFP"
              title="HVAC preventative maintenance (12-month)"
              meta="Carlsbad, CA • Due in 8 days"
              naics="238220"
              value="$18k–$55k"
              buyer="Retail Plaza Management"
              score={89}
              accent="indigo"
            />

            <SampleCard
              market="Government"
              source="SAM.gov"
              title="On-call hauling + disposal services"
              meta="Vista, CA • Due in 10 days"
              naics="562111"
              value="$60k–$220k"
              buyer="City Procurement"
              score={92}
              accent="green"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
