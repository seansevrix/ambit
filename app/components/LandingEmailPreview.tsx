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

function scorePill(score: number) {
  if (score >= 90) return "border-emerald-200 bg-emerald-50 text-emerald-800";
  if (score >= 75) return "border-indigo-200 bg-indigo-50 text-indigo-800";
  return "border-slate-200 bg-slate-50 text-slate-800";
}

function Check() {
  return (
    <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-emerald-50 ring-1 ring-emerald-200">
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

function Feature({
  title,
  desc,
  highlight,
}: {
  title: string;
  desc: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={[
        "flex gap-3 rounded-2xl border p-4",
        highlight
          ? "border-[#1A4FA3]/20 bg-[#EAF3FF]"
          : "border-black/10 bg-white/70",
      ].join(" ")}
    >
      {highlight ? (
        <span className="mt-0.5 inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/70 ring-1 ring-[#1A4FA3]/20">
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
      ) : (
        <Check />
      )}

      <div>
        <div className="text-sm font-semibold text-black">{title}</div>
        <div className="mt-1 text-sm text-black/65">{desc}</div>
      </div>
    </div>
  );
}

export default function LandingEmailPreview({ market = "government" }: { market?: Market }) {
  const score = market === "government" ? 99 : market === "commercial" ? 92 : 90;
  const meta = sampleMeta(market);

  return (
    <section className="w-full py-10 sm:py-14">
      <div className={CONTAINER}>
        <div className="relative overflow-hidden rounded-[28px] border border-black/10 bg-white/55 shadow-[0_18px_60px_rgba(6,16,23,0.12)]">
          {/* Subtle contained background */}
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
                "radial-gradient(900px 520px at 15% 15%, rgba(26,79,163,0.12), transparent 62%)," +
                "radial-gradient(900px 520px at 85% 20%, rgba(26,79,163,0.10), transparent 62%)",
              opacity: 0.9,
            }}
          />

          <div className="relative grid gap-10 p-7 sm:p-10 lg:grid-cols-[1.05fr_0.95fr]">
            {/* Left copy */}
            <div className="flex flex-col justify-center">
              <div className="inline-flex items-center gap-2 self-start rounded-full border border-black/10 bg-white/70 px-3 py-1 text-xs font-semibold text-black/70">
                <span className="h-1.5 w-1.5 rounded-full bg-[#1A4FA3]" />
                Sample digest
              </div>

              <h2 className="mt-4 text-2xl font-semibold tracking-tight sm:text-3xl">
                Your top match, explained clearly.
              </h2>

              <p className="mt-3 text-sm leading-relaxed text-black/70 sm:text-base">
                {marketLine(market)} The goal is simple:{" "}
                <span className="font-semibold text-black/80">
                  you see what to pursue, why it fits, and what to do next.
                </span>
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-black/10 bg-white/70 px-3 py-1 text-xs font-semibold text-black/70">
                  {marketLabel(market)}
                </span>
                <span className="rounded-full border border-black/10 bg-white/70 px-3 py-1 text-xs font-semibold text-black/70">
                  Ranked by fit
                </span>
                <span className="rounded-full border border-black/10 bg-white/70 px-3 py-1 text-xs font-semibold text-black/70">
                  Delivered daily
                </span>
              </div>

              <p className="mt-5 text-sm text-black/70">
                Preview shows <span className="font-semibold text-black">1 high-fit match</span> — subscribers get full details + more matches each day.
              </p>
            </div>

            {/* Right “email” card — keep it looking like an email */}
            <div className="relative">
              <div className="rounded-2xl border border-black/10 bg-white/85 p-5 shadow-[0_10px_30px_rgba(6,16,23,0.10)]">
                {/* Header */}
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-xs font-semibold tracking-wide text-black/55">AMBIT DAILY DIGEST</div>
                    <div className="mt-1 text-xs text-black/45">Delivered 7:00 AM • Ranked by fit</div>
                  </div>
                  <div className="text-xs font-semibold text-black/45">{meta.posted}</div>
                </div>

                {/* Pills */}
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${scorePill(score)}`}>
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
                <div className="mt-4 text-[15px] font-semibold leading-snug text-black sm:text-base">
                  {sampleTitle(market)}
                </div>

                {/* Key rows (scannable) */}
                <div className="mt-3 grid gap-2 rounded-xl border border-black/10 bg-white/70 p-4 text-sm">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-black/45">Location</span>
                    <span className="font-semibold text-black/80">{meta.where}</span>
                  </div>

                  {/* Agency line removed; "Buyer" is cleaner */}
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-black/45">Buyer</span>
                    <span className="font-semibold text-black/80">{meta.buyer}</span>
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <span className="text-black/45">Estimated value</span>
                    <span className="font-semibold text-black/80">{meta.estValue}</span>
                  </div>
                </div>

                {/* Why it matched — compact */}
                <div className="mt-4 rounded-xl border border-black/10 bg-white/70 p-4">
                  <div className="text-xs font-semibold text-black/55">Why it matched</div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <span className="rounded-full border border-black/10 bg-white/70 px-3 py-1 text-xs font-semibold text-black/65">
                      Service area overlap
                    </span>
                    <span className="rounded-full border border-black/10 bg-white/70 px-3 py-1 text-xs font-semibold text-black/65">
                      Keyword / scope fit
                    </span>
                    <span className="rounded-full border border-black/10 bg-white/70 px-3 py-1 text-xs font-semibold text-black/65">
                      Category alignment
                    </span>
                  </div>
                </div>

                {/* Ambit Associate — keep it SMALL but unmistakable */}
                <div className="mt-4 rounded-xl border border-[#1A4FA3]/20 bg-[#EAF3FF] p-3">
                  <div className="text-xs font-semibold text-[#1A4FA3]">Ambit Associate included</div>
                  <div className="mt-1 text-sm font-semibold text-black">
                    Get matches daily — plus 1:1 help to build your win plan.
                  </div>
                  <div className="mt-1 text-sm text-black/65">
                    An associate can walk you through next steps, outreach, and what to prioritize.
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <div className="text-xs font-semibold text-black/45">Sample preview</div>
                  <div className="rounded-full border border-black/10 bg-white/70 px-3 py-1 text-xs font-semibold text-black/65">
                    Example
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* “What you get” — clean + scannable + associate highlighted */}
          <div className="relative border-t border-black/10 bg-white/45 px-7 py-7 sm:px-10 sm:py-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-sm font-semibold text-black">Included</div>
                <div className="mt-1 text-sm text-black/65">Everything you get — built to help you move fast and win.</div>
              </div>
              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">
                THE CONTRACTOR’S EDGE
              </span>
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-3">
              <Feature
                title="Priority ranking"
                desc="Top matches first — so you don’t waste time."
              />
              <Feature
                title="Clear deal details"
                desc="Location, buyer, estimated value, and why it matched."
              />
              <Feature
                title="Ambit associate support"
                desc="1:1 help to build the plan and walk you through next steps."
                highlight
              />
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
