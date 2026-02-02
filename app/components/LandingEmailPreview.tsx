// app/components/LandingEmailPreview.tsx
type Market = "residential" | "commercial" | "government";

const CONTAINER = "mx-auto max-w-[1180px] px-6 lg:px-10";

function sampleMeta(m: Market) {
  if (m === "government")
    return {
      posted: "Today",
      score: 99,
      segment: "Government",
      naics: "561730",
      title: "Emergency hazardous tree removal — Rincon Station",
      location: "Carpinteria, CA",
      buyer: "U.S. Forest Service",
      estValue: "$75k–$150k (est.)",
    };

  if (m === "commercial")
    return {
      posted: "Today",
      score: 92,
      segment: "Commercial",
      naics: "237310",
      title: "Apartment complex sealcoat + striping — Oceanside",
      location: "Oceanside, CA",
      buyer: "Property Management Co.",
      estValue: "$8k–$18k (est.)",
    };

  return {
    posted: "Today",
    score: 90,
    segment: "Residential",
    naics: "—",
    title: "Junk removal — same-day haul (buyer request)",
    location: "San Diego, CA",
    buyer: "Homeowner",
    estValue: "$350–$900 (est.)",
  };
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-black/10 bg-white/75 px-3 py-1 text-xs font-semibold text-black/70">
      {children}
    </span>
  );
}

export default function LandingEmailPreview({ market = "government" }: { market?: Market }) {
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
                "radial-gradient(900px 520px at 20% 18%, rgba(26,79,163,0.12), transparent 62%)," +
                "radial-gradient(900px 520px at 85% 20%, rgba(26,79,163,0.10), transparent 62%)",
              opacity: 0.9,
            }}
          />

          <div className="relative mx-auto max-w-[980px] px-6 py-10 sm:px-10 sm:py-12">
            {/* TOP: Headline + explanation (no “Sample digest”) */}
            <h2 className="text-2xl font-semibold tracking-tight text-black sm:text-3xl">
              Your top match, explained clearly.
            </h2>

            <p className="mt-3 max-w-[72ch] text-sm leading-relaxed text-black/70 sm:text-base">
              Bid opportunities matched to your NAICS + scope — ranked by fit. The goal is simple:{" "}
              <span className="font-semibold text-black/80">
                you see what to pursue, why it fits, and what to do next.
              </span>
            </p>

            {/* BELOW: The digest (clean + readable) */}
            <div className="mt-7 rounded-2xl border border-black/10 bg-white/85 p-6 shadow-[0_10px_30px_rgba(6,16,23,0.10)]">
              {/* Digest header */}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-xs font-semibold tracking-wide text-black/55">
                    AMBIT DAILY DIGEST
                  </div>
                  <div className="mt-1 text-xs text-black/45">
                    Delivered 7:00 AM • Ranked by fit
                  </div>
                </div>
                <div className="text-xs font-semibold text-black/45">{meta.posted}</div>
              </div>

              {/* Pills row */}
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">
                  Score {meta.score}
                </span>
                <Pill>{meta.segment}</Pill>
                <Pill>NAICS {meta.naics}</Pill>
              </div>

              {/* Opportunity title */}
              <div className="mt-4 text-base font-semibold leading-snug text-black sm:text-[17px]">
                {meta.title}
              </div>

              {/* Key details (exactly what you listed) */}
              <div className="mt-4 rounded-xl border border-black/10 bg-white/70 p-4 text-sm">
                <div className="grid grid-cols-[140px_1fr] gap-y-2">
                  <div className="text-black/45">Location</div>
                  <div className="font-semibold text-black/80">{meta.location}</div>

                  <div className="text-black/45">Buyer</div>
                  <div className="font-semibold text-black/80">{meta.buyer}</div>

                  <div className="text-black/45">Estimated value</div>
                  <div className="font-semibold text-black/80">{meta.estValue}</div>
                </div>
              </div>

              {/* Associate section (below digest, no “Why it matched”) */}
              <div className="mt-5 rounded-xl border border-[#1A4FA3]/20 bg-[#EAF3FF] p-4">
                <div className="text-xs font-semibold text-[#1A4FA3]">Ambit Associate included</div>

                <div className="mt-2 text-sm font-semibold text-black">
                  Get matches daily — plus 1:1 help to build your win plan.
                </div>

                <div className="mt-1 text-sm text-black/65">
                  An associate can walk you through next steps, outreach, and what to prioritize.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
