// app/components/LandingEmailPreview.tsx
type Market = "residential" | "commercial" | "government";

const CONTAINER = "mx-auto max-w-[1180px] px-6 lg:px-10";

function marketLabel(m: Market) {
  if (m === "government") return "Government";
  if (m === "commercial") return "Commercial";
  return "Residential";
}

function marketLine(m: Market) {
  if (m === "government") return "Bid opportunities matched to your NAICS + scope — ranked by fit.";
  if (m === "commercial") return "Work orders + service contracts ranked for your team — sent daily.";
  return "Buyer-intent requests matched to your service area — sent daily.";
}

function sampleTitle(m: Market) {
  if (m === "government") return "Emergency hazardous tree removal — Rincon Station";
  if (m === "commercial") return "Apartment complex sealcoat + striping — Oceanside";
  return "Junk removal — same-day haul (buyer request)";
}

function sampleMeta(m: Market) {
  if (m === "government")
    return {
      where: "Carpinteria, CA",
      buyer: "U.S. Forest Service",
      naics: "561730",
      posted: "Today",
      estValue: "$75k–$150k (est.)",
    };

  if (m === "commercial")
    return {
      where: "Oceanside, CA",
      buyer: "Property Management Co.",
      naics: "237310",
      posted: "Today",
      estValue: "$8k–$18k (est.)",
    };

  return {
    where: "San Diego, CA",
    buyer: "Homeowner (Verified)",
    naics: "—",
    posted: "Today",
    estValue: "$350–$900 (est.)",
  };
}

function scoreColor(score: number) {
  if (score >= 90) return "text-emerald-800 bg-emerald-50 border-emerald-200";
  if (score >= 75) return "text-indigo-800 bg-indigo-50 border-indigo-200";
  return "text-slate-800 bg-slate-50 border-slate-200";
}

function CheckIcon() {
  return (
    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-50 ring-1 ring-emerald-200">
      <svg width="14" height="14" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path
          d="M16.6 6.2 8.7 14.1 3.4 8.8"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-emerald-700"
        />
      </svg>
    </span>
  );
}

function StarIcon() {
  return (
    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#EAF3FF] ring-1 ring-[#1A4FA3]/20">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M12 17.3 6.8 20l1-5.7-4.2-4.1 5.8-.8L12 4l2.6 5.4 5.8.8-4.2 4.1 1 5.7L12 17.3Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
          className="text-[#1A4FA3]"
        />
      </svg>
    </span>
  );
}

export default function LandingEmailPreview({ market = "government" }: { market?: Market }) {
  const score = market === "government" ? 99 : market === "commercial" ? 92 : 90;
  const meta = sampleMeta(market);

  return (
    <section className="w-full py-10 sm:py-14">
      <div className={CONTAINER}>
        <div className="relative overflow-hidden rounded-[28px] border border-black/10 bg-white/55 shadow-[0_18px_60px_rgba(6,16,23,0.12)]">
          {/* Panel background grid (contained, subtle) */}
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              backgroundImage:
                "linear-gradient(to right, rgba(6,16,23,0.10) 1px, transparent 1px)," +
                "linear-gradient(to bottom, rgba(6,16,23,0.10) 1px, transparent 1px)",
              backgroundSize: "44px 44px",
              opacity: 0.10,
            }}
          />
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(900px 520px at 15% 15%, rgba(26,79,163,0.14), transparent 62%)," +
                "radial-gradient(900px 520px at 85% 20%, rgba(26,79,163,0.10), transparent 62%)",
              opacity: 0.9,
            }}
          />

          <div className="relative grid gap-10 p-7 sm:p-10 lg:grid-cols-[1.05fr_0.95fr]">
            {/* Left copy */}
            <div className="flex flex-col justify-center">
              <div className="inline-flex items-center gap-2 self-start rounded-full border border-black/10 bg-white/60 px-3 py-1 text-xs font-semibold text-black/70">
                <span className="h-1.5 w-1.5 rounded-full bg-[#1A4FA3]" />
                Sample digest
              </div>

              <h2 className="mt-4 text-2xl font-semibold tracking-tight sm:text-3xl">
                Your top match, explained clearly.
              </h2>

              <p className="mt-3 text-sm leading-relaxed text-black/70 sm:text-base">
                {marketLine(market)} The goal is simple:{" "}
                <span className="font-semibold text-black/80">you see what to pursue, why it fits, and what to do next.</span>
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-black/10 bg-white/60 px-3 py-1 text-xs font-semibold text-black/70">
                  {marketLabel(market)}
                </span>
                <span className="rounded-full border border-black/10 bg-white/60 px-3 py-1 text-xs font-semibold text-black/70">
                  Ranked by fit
                </span>
                <span className="rounded-full border border-black/10 bg-white/60 px-3 py-1 text-xs font-semibold text-black/70">
                  Delivered daily
                </span>
              </div>

              <p className="mt-5 text-sm text-black/70">
                Preview shows <span className="font-semibold text-black">1 high-fit match</span> — subscribers get full details + more matches each day.
              </p>
            </div>

            {/* Right “email” card */}
            <div className="relative">
              <div className="rounded-2xl border border-black/10 bg-white/80 p-5 shadow-[0_10px_30px_rgba(6,16,23,0.10)]">
                {/* Header */}
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-xs font-semibold text-black/60">AMBIT DAILY DIGEST</div>
                    <div className="mt-1 text-xs text-black/55">Delivered 7:00 AM • Ranked by fit</div>
                  </div>
                  <div className="text-xs font-semibold text-black/50">{meta.posted}</div>
                </div>

                {/* Score + segment */}
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${scoreColor(score)}`}>
                    Score {score}
                  </span>
                  <span className="inline-flex items-center rounded-full border border-black/10 bg-white/70 px-2.5 py-1 text-xs font-semibold text-black/65">
                    {marketLabel(market)}
                  </span>
                  <span className="inline-flex items-center rounded-full border border-black/10 bg-white/70 px-2.5 py-1 text-xs font-semibold text-black/65">
                    NAICS {meta.naics}
                  </span>
                </div>

                {/* Title */}
                <div className="mt-4 text-base font-semibold text-black leading-snug">
                  {sampleTitle(market)}
                </div>

                {/* Meta rows (clean + scannable) */}
                <div className="mt-3 grid gap-2 rounded-xl border border-black/10 bg-white/70 p-4 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-black/50">Location</span>
                    <span className="font-semibold text-black/80">{meta.where}</span>
                  </div>

                  {/* NOTE: "Agency:" line removed — replaced with Buyer (cleaner) */}
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-black/50">Buyer</span>
                    <span className="font-semibold text-black/80">{meta.buyer}</span>
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <span className="text-black/50">Estimated value</span>
                    <span className="font-semibold text-black/80">{meta.estValue}</span>
                  </div>
                </div>

                {/* Why it matched (no wall of text) */}
                <div className="mt-4 rounded-xl border border-black/10 bg-white/70 p-4">
                  <div className="text-xs font-semibold text-black/60">Why it matched</div>
                  <ul className="mt-2 space-y-1 text-sm text-black/70">
                    <li>• Service area overlap</li>
                    <li>• Keyword / scope fit</li>
                    <li>• Strong category alignment</li>
                  </ul>
                </div>

                {/* Ambit Associate callout (HIGH VISIBILITY) */}
                <div className="mt-4 rounded-2xl border border-[#1A4FA3]/20 bg-[#EAF3FF] p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="inline-flex items-center gap-2 rounded-full border border-[#1A4FA3]/20 bg-white/60 px-2.5 py-1 text-xs font-semibold text-[#1A4FA3]">
                        <StarIcon />
                        Ambit Associate included
                      </div>
                      <div className="mt-2 text-sm font-semibold text-black">
                        Want to win this? We’ll walk you through the plan.
                      </div>
                      <div className="mt-1 text-sm text-black/70">
                        After you get matches, an <span className="font-semibold text-black/80">Ambit associate</span> helps you with next steps,
                        outreach, and a simple “roadmap to win.”
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span className="rounded-full border border-black/10 bg-white/70 px-3 py-1 text-xs font-semibold text-black/70">
                      1:1 guidance
                    </span>
                    <span className="rounded-full border border-black/10 bg-white/70 px-3 py-1 text-xs font-semibold text-black/70">
                      Game plan + compliance tips
                    </span>
                    <span className="rounded-full border border-black/10 bg-white/70 px-3 py-1 text-xs font-semibold text-black/70">
                      Faster next steps
                    </span>
                  </div>

                  <div className="mt-3 text-xs font-semibold text-[#1A4FA3]">
                    Reply “ASSOCIATE” to get help on the plan.
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <div className="text-xs font-semibold text-black/50">Sample preview</div>
                  <div className="rounded-full border border-black/10 bg-white/70 px-3 py-1 text-xs font-semibold text-black/70">
                    Example
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Included section (clean + highlights associate) */}
          <div className="relative border-t border-black/10 bg-white/45 px-7 py-7 sm:px-10 sm:py-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-sm font-semibold text-black">Included</div>
                <div className="mt-1 text-sm text-black/65">
                  Everything you get — built to help you move fast and win.
                </div>
              </div>
              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">
                THE CONTRACTOR’S EDGE
              </span>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <div className="flex gap-3 rounded-2xl border border-black/10 bg-white/70 p-4">
                <CheckIcon />
                <div>
                  <div className="text-sm font-semibold text-black">Priority ranking</div>
                  <div className="mt-1 text-sm text-black/65">Top matches first — so you don’t waste time.</div>
                </div>
              </div>

              <div className="flex gap-3 rounded-2xl border border-black/10 bg-white/70 p-4">
                <CheckIcon />
                <div>
                  <div className="text-sm font-semibold text-black">Complete bid intelligence</div>
                  <div className="mt-1 text-sm text-black/65">Key details, due dates, and what matters.</div>
                </div>
              </div>

              {/* Highlight card */}
              <div className="flex gap-3 rounded-2xl border border-[#1A4FA3]/20 bg-[#EAF3FF] p-4">
                <StarIcon />
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="text-sm font-semibold text-black">Ambit associate support</div>
                    <span className="rounded-full border border-[#1A4FA3]/20 bg-white/70 px-2.5 py-0.5 text-xs font-semibold text-[#1A4FA3]">
                      Highlight
                    </span>
                  </div>
                  <div className="mt-1 text-sm text-black/70">
                    You’re not alone — an associate helps you build a simple plan and take the next steps.
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-5 text-center text-xs font-semibold text-black/55">
              Ranked jobs delivered daily. Human help when you want it.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
