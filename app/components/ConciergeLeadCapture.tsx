"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type MarketKey = "residential" | "commercial" | "government";

const FORMSPREE_ENDPOINT = "https://formspree.io/f/xdaaaapj";
const BRAND = "#1A4FA3";

const MARKET_LABEL: Record<MarketKey, string> = {
  residential: "Residential",
  commercial: "Commercial",
  government: "Government",
};

const SUGGESTED_KEYWORDS = [
  "HVAC",
  "Landscaping",
  "Concrete",
  "Electrical",
  "Plumbing",
  "Demolition",
  "Trucking",
  "Janitorial",
  "Roofing",
];

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function normalizeKeywords(list: string[]) {
  const cleaned = list
    .map((k) => k.trim())
    .filter(Boolean)
    .map((k) => k.replace(/\s+/g, " "))
    .slice(0, 8);

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

export default function ConciergeLeadCapture() {
  const router = useRouter();

  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [area, setArea] = useState("");
  const [radius, setRadius] = useState("25"); // miles

  const [selectedMarkets, setSelectedMarkets] = useState<MarketKey[]>([
    "residential",
    "commercial",
    "government",
  ]);

  const [keywordInput, setKeywordInput] = useState("");
  const [keywords, setKeywords] = useState<string[]>([]);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const allSelected = selectedMarkets.length === 3;

  const marketsHuman = useMemo(
    () => selectedMarkets.map((m) => MARKET_LABEL[m]).join(", "),
    [selectedMarkets]
  );

  function toggleMarket(m: MarketKey) {
    setSelectedMarkets((prev) => {
      const set = new Set(prev);
      if (set.has(m)) set.delete(m);
      else set.add(m);

      const next = Array.from(set) as MarketKey[];
      if (next.length === 0) return ["residential", "commercial", "government"];
      next.sort((a, b) => a.localeCompare(b));
      return next;
    });
  }

  function setAllMarkets() {
    setSelectedMarkets(["residential", "commercial", "government"]);
  }

  function addKeyword(raw: string) {
    const next = normalizeKeywords([...keywords, raw]);
    setKeywords(next);
    setKeywordInput("");
  }

  function removeKeyword(k: string) {
    setKeywords((prev) => prev.filter((x) => x.toLowerCase() !== k.toLowerCase()));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    // super-light validation
    if (!company.trim()) return setError("Company name is required.");
    if (!email.trim()) return setError("Email is required.");
    if (!area.trim()) return setError("Service area is required.");

    try {
      setSubmitting(true);

      const fd = new FormData();
      fd.append("company", company.trim());
      fd.append("email", email.trim());
      fd.append("_replyto", email.trim()); // reply-to header (so you can reply directly)
      fd.append("service_area", area.trim());
      fd.append("radius_miles", String(radius || "").trim());
      fd.append("markets", marketsHuman);
      fd.append("keywords", keywords.join(", "));

      // honeypot spam trap
      fd.append("_gotcha", "");

      // Nice subject line in your inbox
      fd.append("_subject", `AMBIT lead: ${company.trim()} (${area.trim()})`);

      const res = await fetch(FORMSPREE_ENDPOINT, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: fd,
      });

      const json = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(json?.error || "Form submission failed");
      }

      router.push("/thanks");
    } catch (err: any) {
      setError(err?.message || "Something went wrong. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-10">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-sm backdrop-blur">
        <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
          {/* LEFT: Form */}
          <div className="space-y-4">
            <div>
              <div className="text-sm font-semibold text-white/90">
                Get 3 matches in your first 24 hours
              </div>
              <div className="mt-1 text-sm text-white/70">
                We’ll hand-pick 1 Residential, 1 Commercial, and 1 Government opportunity for you.
              </div>
            </div>

            <form onSubmit={onSubmit} className="space-y-3">
              {/* Company + Email */}
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
                  <div className="text-xs font-semibold text-white/70">Company name</div>
                  <input
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="Your company"
                    className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white placeholder:text-white/40 outline-none focus:border-white/20"
                  />
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
                  <div className="text-xs font-semibold text-white/70">Email</div>
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    type="email"
                    className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white placeholder:text-white/40 outline-none focus:border-white/20"
                  />
                </div>
              </div>

              {/* Service area + radius */}
              <div className="grid gap-3 sm:grid-cols-[1fr_140px]">
                <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
                  <div className="text-xs font-semibold text-white/70">Service area</div>
                  <input
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    placeholder="City or county (ex: San Diego, CA)"
                    className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white placeholder:text-white/40 outline-none focus:border-white/20"
                  />
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
                  <div className="text-xs font-semibold text-white/70">Radius</div>
                  <input
                    value={radius}
                    onChange={(e) => setRadius(e.target.value)}
                    placeholder="25"
                    inputMode="numeric"
                    className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white placeholder:text-white/40 outline-none focus:border-white/20"
                  />
                  <div className="mt-1 text-[11px] text-white/45">miles</div>
                </div>
              </div>

              {/* Markets */}
              <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-semibold text-white/70">Markets</div>

                  <button
                    type="button"
                    onClick={setAllMarkets}
                    className={cx(
                      "rounded-xl px-3 py-1 text-xs font-semibold",
                      allSelected
                        ? "bg-white/10 text-white/70"
                        : "bg-white/5 text-white hover:bg-white/10"
                    )}
                  >
                    All markets
                  </button>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  {(["residential", "commercial", "government"] as MarketKey[]).map((m) => {
                    const on = selectedMarkets.includes(m);
                    return (
                      <button
                        key={m}
                        type="button"
                        onClick={() => toggleMarket(m)}
                        className={cx(
                          "rounded-2xl border px-4 py-2 text-sm font-semibold transition",
                          on
                            ? "border-white/20 bg-white/10 text-white"
                            : "border-white/10 bg-black/20 text-white/70 hover:bg-white/5"
                        )}
                      >
                        {MARKET_LABEL[m]}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-3 text-xs text-white/50">
                  {allSelected ? "All markets selected." : `Selected: ${marketsHuman}`}
                </div>
              </div>

              {/* Keywords */}
              <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
                <div className="text-xs font-semibold text-white/70">Keywords (optional)</div>

                <div className="mt-3 flex flex-wrap gap-2">
                  {SUGGESTED_KEYWORDS.map((k) => {
                    const on = keywords.some((x) => x.toLowerCase() === k.toLowerCase());
                    return (
                      <button
                        key={k}
                        type="button"
                        onClick={() => (on ? removeKeyword(k) : addKeyword(k))}
                        className={cx(
                          "rounded-2xl border px-3 py-1.5 text-xs font-semibold transition",
                          on
                            ? "border-white/20 bg-white/10 text-white"
                            : "border-white/10 bg-black/20 text-white/60 hover:bg-white/5"
                        )}
                        aria-pressed={on}
                      >
                        {k}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-3 flex gap-2">
                  <input
                    value={keywordInput}
                    onChange={(e) => setKeywordInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        if (keywordInput.trim()) addKeyword(keywordInput);
                      }
                    }}
                    placeholder="Add a keyword (press Enter)"
                    className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white placeholder:text-white/40 outline-none focus:border-white/20"
                  />
                  <button
                    type="button"
                    onClick={() => keywordInput.trim() && addKeyword(keywordInput)}
                    className="rounded-xl px-4 py-2 text-sm font-semibold text-white"
                    style={{ backgroundColor: BRAND }}
                  >
                    Add
                  </button>
                </div>

                {keywords.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {keywords.map((k) => (
                      <button
                        key={k}
                        type="button"
                        onClick={() => removeKeyword(k)}
                        className="rounded-2xl border border-white/10 bg-black/20 px-3 py-1.5 text-xs font-semibold text-white/70 hover:bg-white/5"
                        title="Remove"
                      >
                        {k} <span className="text-white/40">×</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* CTA */}
              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className={cx(
                    "inline-flex items-center justify-center rounded-2xl px-5 py-3 text-sm font-semibold text-white shadow-sm",
                    submitting && "opacity-70"
                  )}
                  style={{ backgroundColor: BRAND }}
                >
                  {submitting ? "Sending…" : "Send me 3 matches"}
                </button>

                <div className="text-xs text-white/60">
                  No credit card required • 3 matches in 24 hours
                </div>
              </div>

              {error && <div className="text-sm text-red-200">{error}</div>}
            </form>
          </div>

          {/* RIGHT: Sample matches (static) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold text-white/90">Sample matches</div>
              <div className="text-xs text-white/50">Examples only</div>
            </div>

            {[
              {
                market: "Residential",
                source: "Local homeowner request",
                title: "Roof leak repair + shingle replacement",
                meta: "San Diego, CA • Due in 6 days",
                naics: "238160",
                value: "$1.8k–$6.5k",
                buyer: "Homeowner (verified)",
                score: 86,
              },
              {
                market: "Commercial",
                source: "Facility RFP",
                title: "HVAC preventative maintenance (12-month)",
                meta: "Carlsbad, CA • Due in 8 days",
                naics: "238220",
                value: "$18k–$55k",
                buyer: "Retail Plaza Management",
                score: 89,
              },
              {
                market: "Government",
                source: "SAM.gov",
                title: "On-call hauling + disposal services",
                meta: "Vista, CA • Due in 10 days",
                naics: "562111",
                value: "$60k–$220k",
                buyer: "City Procurement",
                score: 92,
              },
            ].map((m) => (
              <div
                key={m.title}
                className="rounded-2xl border border-white/10 bg-black/20 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-xs font-semibold text-white/60">
                      {m.market} • {m.source}
                    </div>
                    <div className="mt-1 text-sm font-semibold text-white">{m.title}</div>
                    <div className="mt-1 text-xs text-white/60">{m.meta}</div>
                  </div>

                  <div className="shrink-0 rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-center">
                    <div className="text-xs text-white/50">Match</div>
                    <div className="text-lg font-semibold text-white">{m.score}</div>
                  </div>
                </div>

                <div className="mt-3 grid gap-2 text-xs text-white/60 sm:grid-cols-3">
                  <div>
                    <span className="text-white/40">NAICS:</span> {m.naics}
                  </div>
                  <div>
                    <span className="text-white/40">Est value:</span> {m.value}
                  </div>
                  <div>
                    <span className="text-white/40">Buyer:</span> {m.buyer}
                  </div>
                </div>
              </div>
            ))}

            <div className="text-xs text-white/45">
              These are samples. Your first 3 real matches will be hand-picked and emailed.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
