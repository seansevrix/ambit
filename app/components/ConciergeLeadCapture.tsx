"use client";

import { useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

const FORMSPREE_ENDPOINT = "https://formspree.io/f/xdaaaapj";
const BRAND = "#1A4FA3";

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
    <div className="shrink-0 rounded-xl border border-black/10 bg-white px-2.5 py-2 text-center shadow-sm sm:px-3">
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

  const keywords = useMemo(() => splitKeywordText(keywordText), [keywordText]);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Always include all markets behind the scenes
  const marketsHuman = "Residential, Commercial, Government";

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!email.trim()) return setError("Work Email is required.");
    if (!area.trim()) return setError("Service area is required.");

    try {
      setSubmitting(true);

      const fd = new FormData();
      fd.append("email", email.trim());
      fd.append("_replyto", email.trim());
      fd.append("service_area", area.trim());
      fd.append("markets", marketsHuman);
      fd.append("keywords", keywords.join(", "));
      fd.append("_gotcha", "");

      // Keep subject clean & useful for you
      fd.append("_subject", `AMBIT lead: ${email.trim()} (${area.trim()})`);

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
    <div className="w-full rounded-2xl border border-white/20 bg-white/10 p-4 shadow-[0_30px_120px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:rounded-[28px] sm:p-6">
      <div className="grid gap-6 lg:grid-cols-2">
        {/* LEFT */}
        <div className="min-w-0">
          <div className="text-base font-semibold text-white sm:text-lg">
            Get 3 free matches in 24 hours
          </div>

          <div className="mt-2 text-xs text-white/70">
            No credit card • Unsubscribe anytime • We only email when we find matches
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

            {/* Keywords (optional) */}
            <div className="min-w-0">
              <div className="flex items-center justify-between">
                <div className="text-xs font-semibold text-white/80">Keywords</div>
                <div className="text-xs text-white/55">Optional</div>
              </div>
              <input
                value={keywordText}
                onChange={(e) => setKeywordText(e.target.value)}
                placeholder="What do you do? (ex: HVAC, plumbing, roofing)"
                className="mt-2 w-full rounded-2xl border border-white/20 bg-white/90 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-white/40"
              />
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
                {submitting ? "Sending…" : "Send me 3 matches"}
              </button>

              <div className="mt-2 text-center text-xs text-white/70">
                Free • 3 matches in 24 hours
              </div>

              <div className="mt-1 text-center text-[11px] leading-relaxed text-white/55">
                You’ll receive the best matches available across Residential, Commercial, and
                Government. Mix varies by region and availability.
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

          <div className="mt-3 text-xs text-white/65">
            Samples only. Your first 3 real matches are emailed within 24 hours.
          </div>
        </div>
      </div>
    </div>
  );
}
