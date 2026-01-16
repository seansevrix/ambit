"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type MarketKey = "residential" | "commercial" | "government";

const FORMSPREE_ENDPOINT = "https://formspree.io/f/xdaaaapj";
const BRAND = "#1A4FA3";

// Locked: always all 3 markets
const LOCKED_MARKETS: MarketKey[] = ["residential", "commercial", "government"];

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function normalizeKeywords(list: string[]) {
  const cleaned = list
    .map((k) => k.trim())
    .filter(Boolean)
    .map((k) => k.replace(/\s+/g, " "))
    .slice(0, 12);

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

function MatchPill({ score }: { score: number }) {
  return (
    <div className="shrink-0 rounded-xl border border-black/10 bg-white px-3 py-2 text-center shadow-sm">
      <div className="text-[11px] font-semibold text-slate-500">Match</div>
      <div className="text-lg font-bold text-slate-900">{score}</div>
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
    <div className="rounded-2xl border border-white/20 bg-white/95 p-4 shadow-sm">
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
        <div>
          <span className="text-slate-400">NAICS:</span> {naics}
        </div>
        <div>
          <span className="text-slate-400">Est value:</span> {value}
        </div>
        <div>
          <span className="text-slate-400">Buyer:</span> {buyer}
        </div>
      </div>
    </div>
  );
}

export default function ConciergeLeadCapture() {
  const router = useRouter();

  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [area, setArea] = useState("");

  const [keywordText, setKeywordText] = useState("");
  const keywords = useMemo(() => splitKeywordText(keywordText), [keywordText]);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // locked markets string for submission
  const marketsHuman = "Residential, Commercial, Government";

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!company.trim()) return setError("Company is required.");
    if (!email.trim()) return setError("Work Email is required.");
    if (!area.trim()) return setError("Service area is required.");

    try {
      setSubmitting(true);

      const fd = new FormData();
      fd.append("company", company.trim());
      fd.append("email", email.trim());
      fd.append("_replyto", email.trim());
      fd.append("service_area", area.trim());
      fd.append("markets", marketsHuman);
      fd.append("keywords", keywords.join(", "));
      fd.append("_gotcha", "");
      fd.append("_subject", `AMBIT lead: ${company.trim()} (${area.trim()})`);

      const res = await fetch(FORMSPREE_ENDPOINT, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: fd,
      });

      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.error || "Form submission failed");

      router.push("/thanks");
    } catch (err: any) {
      setError(err?.message || "Something went wrong. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="rounded-[28px] border border-white/20 bg-white/10 p-6 shadow-[0_30px_120px_rgba(0,0,0,0.35)] backdrop-blur-xl">
      <div className="grid gap-6 lg:grid-cols-2">
        {/* LEFT */}
        <div>
          <div className="text-lg font-semibold text-white">Get 3 matches in 24 hours</div>

          <form onSubmit={onSubmit} className="mt-5 space-y-4">
            {/* Company + Email */}
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <div className="text-xs font-semibold text-white/80">Company</div>
                <input
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="Your Company Name"
                  className="mt-2 w-full rounded-2xl border border-white/20 bg-white/90 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-white/40"
                />
              </div>

              <div>
                <div className="text-xs font-semibold text-white/80">Email</div>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Work Email"
                  type="email"
                  className="mt-2 w-full rounded-2xl border border-white/20 bg-white/90 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-white/40"
                />
              </div>
            </div>

            {/* Service area */}
            <div>
              <div className="text-xs font-semibold text-white/80">Service area</div>
              <input
                value={area}
                onChange={(e) => setArea(e.target.value)}
                placeholder="City or county"
                className="mt-2 w-full rounded-2xl border border-white/20 bg-white/90 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-white/40"
              />
            </div>

            {/* Keywords */}
            <div>
              <div className="text-xs font-semibold text-white/80">Keywords</div>
              <input
                value={keywordText}
                onChange={(e) => setKeywordText(e.target.value)}
                placeholder="What do you do? (ex: HVAC, plumbing, roofing)"
                className="mt-2 w-full rounded-2xl border border-white/20 bg-white/90 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-white/40"
              />
            </div>

            {/* Markets (locked display, not editable) */}
            <div className="pt-1">
              <div className="text-xs font-semibold text-white/80">Markets</div>
              <div className="mt-3 flex flex-wrap gap-2">
                {LOCKED_MARKETS.map((m) => (
                  <span
                    key={m}
                    className="rounded-2xl border border-white/25 bg-white/10 px-4 py-2 text-sm font-semibold text-white"
                    title="Included"
                  >
                    {m === "residential" ? "Residential" : m === "commercial" ? "Commercial" : "Government"}
                  </span>
                ))}
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
                {submitting ? "Sending…" : "Send Me 3 Matches"}
              </button>

              <div className="mt-2 text-center text-xs text-white/70">
                3 matches in 24 hours • Free
              </div>

              {error && <div className="mt-3 text-sm text-red-200">{error}</div>}
            </div>
          </form>
        </div>

        {/* RIGHT */}
        <div>
          <div className="flex items-center justify-between">
            <div className="text-lg font-semibold text-white">Sample matches</div>
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

          <div className="mt-3 text-xs text-white/65">
            Samples only. Your first 3 real matches are hand-picked and emailed.
          </div>
        </div>
      </div>
    </div>
  );
}
