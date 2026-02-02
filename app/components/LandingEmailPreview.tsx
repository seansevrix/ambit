// app/components/LandingEmailPreview.tsx
import type { ReactNode } from "react";

type Market = "residential" | "commercial" | "government";

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

function Pill({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-black/10 bg-white px-3 py-1 text-xs font-semibold text-black/70">
      {children}
    </span>
  );
}

function CheckIcon() {
  return (
    <span className="mt-0.5 inline-flex h-7 w-7 items-center justify-center rounded-full bg-emerald-50 ring-1 ring-emerald-200">
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
    <span className="mt-0.5 inline-flex h-7 w-7 items-center justify-center rounded-full bg-white ring-1 ring-[#1A4FA3]/20">
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
          : "border-black/10 bg-white",
      ].join(" ")}
    >
      {highlight ? <StarIcon /> : <CheckIcon />}
      <div>
        <div className="text-sm font-semibold text-black">{title}</div>
        <div className="mt-1 text-sm text-black/65">{desc}</div>
      </div>
    </div>
  );
}

export default function LandingEmailPreview({
  market = "government",
}: {
  market?: Market;
}) {
  const meta = sampleMeta(market);

  return (
    <div className="relative overflow-hidden rounded-[36px] border border-black/10 bg-white/90 shadow-[0_18px_60px_rgba(6,16,23,0.10)]">
      {/* subtle depth */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(900px 520px at 18% 18%, rgba(26,79,163,0.10), transparent 62%)," +
            "radial-gradient(900px 520px at 85% 20%, rgba(26,79,163,0.08), transparent 62%)",
        }}
      />

      {/* HEADER */}
      <div className="relative px-7 py-10 sm:px-12 sm:py-12 text-center">
        <h2 className="text-3xl font-black tracking-tight text-black sm:text-4xl">
          Your top match, explained clearly.
        </h2>

        <p className="mt-4 max-w-[72ch] mx-auto text-sm leading-relaxed text-black/70 sm:text-base">
          Bid opportunities matched to your NAICS + scope — ranked by fit.
        </p>

        <p className="mt-2 max-w-[72ch] mx-auto text-sm leading-relaxed text-black/70 sm:text-base">
          <span className="font-semibold text-black/80">
            The goal is simple: you see what to pursue, why it fits, and what to do next.
          </span>
        </p>

        {/* DIGEST CARD */}
        <div className="mt-8 mx-auto max-w-[920px] rounded-3xl border border-black/10 bg-white p-6 shadow-[0_10px_30px_rgba(6,16,23,0.08)] sm:p-7 text-left">
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

          <div className="mt-4 flex flex-wrap gap-2">
            <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">
              Score {meta.score}
            </span>
            <Pill>{meta.segment}</Pill>
            <Pill>NAICS {meta.naics}</Pill>
          </div>

          <div className="mt-4 text-base font-semibold leading-snug text-black sm:text-[17px]">
            {meta.title}
          </div>

          <div className="mt-4 rounded-2xl border border-black/10 bg-white p-4 text-sm">
            <div className="grid grid-cols-[140px_1fr] gap-y-2">
              <div className="text-black/45">Location</div>
              <div className="font-semibold text-black/80">{meta.location}</div>

              <div className="text-black/45">Buyer</div>
              <div className="font-semibold text-black/80">{meta.buyer}</div>

              <div className="text-black/45">Estimated value</div>
              <div className="font-semibold text-black/80">{meta.estValue}</div>
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-[#1A4FA3]/20 bg-[#EAF3FF] p-4">
            <div className="text-xs font-semibold text-[#1A4FA3]">
              Ambit Associate included
            </div>
            <div className="mt-2 text-sm font-semibold text-black">
              Get matches daily — plus 1:1 help to build your win plan.
            </div>
            <div className="mt-1 text-sm text-black/65">
              An associate can walk you through next steps, outreach, and what to prioritize.
            </div>
          </div>
        </div>
      </div>

      {/* INCLUDED */}
      <div className="relative border-t border-black/10 bg-white/70 px-7 py-8 sm:px-12">
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

        <div className="mt-5 grid gap-3 md:grid-cols-3">
          <Feature title="Priority ranking" desc="Top matches first — so you don’t waste time." />
          <Feature title="Clear deal details" desc="Location, buyer, and estimated value at a glance." />
          <Feature
            title="Ambit associate support"
            desc="1:1 help to build the plan and walk you through next steps."
            highlight
          />
        </div>
      </div>
    </div>
  );
}
