"use client";

import React from "react";

type Market = "residential" | "commercial" | "government";

type DigestItem = {
  score: number;
  title: string;
  location: string;
  agency: string;
  naics: string;
  segment: Market;
  summary: string;
};

const GOVERNMENT_SAMPLE: DigestItem = {
  score: 99,
  title: "Emergency hazardous tree removal — Rincon Station",
  location: "Carpinteria, CA",
  agency: "U.S. Forest Service",
  naics: "561730",
  segment: "government",
  summary:
    "High-Probability Government Win. This is an exact NAICS and location match for your profile. Because this is an Emergency Requirement, the procurement cycle is accelerated with a shortened window for award. Use our custom game plan to navigate the U.S. Forest Service’s specific compliance standards and secure this contract before the deadline.",
};

function segLabel(seg: Market) {
  if (seg === "residential") return "Residential";
  if (seg === "commercial") return "Commercial";
  return "Government";
}

function segPillClass(seg: Market) {
  if (seg === "residential") return "bg-emerald-50 text-emerald-900 border-emerald-200";
  if (seg === "commercial") return "bg-indigo-50 text-indigo-900 border-indigo-200";
  return "bg-sky-50 text-sky-900 border-sky-200";
}

function scoreTone(score: number) {
  if (score >= 95) return "bg-emerald-50 border-emerald-200 text-emerald-900";
  if (score >= 90) return "bg-indigo-50 border-indigo-200 text-indigo-900";
  return "bg-sky-50 border-sky-200 text-sky-900";
}

const CONTAINER = "mx-auto max-w-[1180px] px-6 lg:px-10";

function IconTarget() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" opacity="0.9" />
      <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="2" opacity="0.9" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" />
    </svg>
  );
}

function IconFilter() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
      <path
        d="M4 6h16M7 12h10M10 18h4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.9"
      />
      <path
        d="M6 6l4 6v6h4v-6l4-6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
        opacity="0.35"
      />
    </svg>
  );
}

function IconWin() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
      <path
        d="M8 21h8M10 17h4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.9"
      />
      <path
        d="M7 4h10v5a5 5 0 0 1-10 0V4Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
        opacity="0.9"
      />
      <path
        d="M17 6h2a2 2 0 0 1 0 4h-2M7 6H5a2 2 0 0 0 0 4h2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.55"
      />
    </svg>
  );
}

function CheckRow({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-[2px] inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-600/15 text-emerald-700">
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden="true">
          <path
            d="M20 6L9 17l-5-5"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <div className="text-sm font-semibold text-black/80">{children}</div>
    </div>
  );
}

export default function LandingEmailPreview({ market = "government" }: { market?: Market }) {
  // For now, the sample digest is the Government example you specified.
  // (If you want the market toggle later, we can add separate summaries per segment.)
  const item = GOVERNMENT_SAMPLE;

  // Blueprint grid (visible but subtle)
  const gridStyle: React.CSSProperties = {
    backgroundImage:
      "linear-gradient(to right, rgba(2,6,23,0.18) 1px, transparent 1px), linear-gradient(to bottom, rgba(2,6,23,0.18) 1px, transparent 1px)",
    backgroundSize: "56px 56px",
  };

  const maskStyle: React.CSSProperties = {
    WebkitMaskImage: "radial-gradient(ellipse at center, black 42%, transparent 78%)",
    maskImage: "radial-gradient(ellipse at center, black 42%, transparent 78%)",
  };

  return (
    <section className="relative py-10 lg:py-14">
      {/* Background layers */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 opacity-[0.12]" style={gridStyle} />
        <div className="absolute inset-0" style={maskStyle}>
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(circle at top, rgba(26,79,163,0.14), transparent 58%)",
            }}
          />
        </div>
      </div>

      <div className={CONTAINER}>
        {/* Header */}
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <div className="text-sm font-semibold tracking-tight text-black/80">Sample digest</div>
            <div className="mt-1 text-2xl font-semibold tracking-tight text-black">
              Your top match, explained clearly.
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2">
            <span className="rounded-full border border-black/10 bg-white/60 px-3 py-1 text-xs font-semibold text-black/70">
              Example
            </span>
            <span className="rounded-full border border-black/10 bg-white/60 px-3 py-1 text-xs font-semibold text-black/70">
              {segLabel(market)}
            </span>
          </div>
        </div>

        {/* Digest Card */}
        <div className="rounded-[28px] border border-black/10 bg-white/55 p-5 shadow-[0_18px_45px_rgba(2,6,23,0.12)] backdrop-blur-sm lg:p-6">
          {/* Digest header */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-2xl border border-black/10 bg-white/70 grid place-items-center">
                <span className="text-[11px] font-black tracking-[0.18em] text-[#1A4FA3]">A</span>
              </div>
              <div className="leading-tight">
                <div className="text-sm font-semibold text-black">AMBIT Daily Digest</div>
                <div className="text-xs font-medium text-black/60">
                  Delivered 7:00 AM • Ranked by fit
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="rounded-full border border-black/10 bg-white/60 px-3 py-1 text-xs font-semibold text-black/70">
                Today
              </span>
            </div>
          </div>

          {/* Match */}
          <div className="mt-4 rounded-2xl border border-black/10 bg-white/70 p-4 lg:p-5">
            <div className="flex items-start gap-4">
              {/* Score */}
              <div
                className={[
                  "shrink-0 rounded-2xl border px-3 py-2 text-center",
                  scoreTone(item.score),
                ].join(" ")}
              >
                <div className="text-[10px] font-extrabold tracking-[0.18em] opacity-80">SCORE</div>
                <div className="mt-1 text-2xl font-black leading-none">{item.score}</div>
                <div className="mt-1 text-[11px] font-semibold opacity-80">Excellent</div>
              </div>

              {/* Content */}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={[
                      "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold",
                      segPillClass(item.segment),
                    ].join(" ")}
                  >
                    {segLabel(item.segment)}
                  </span>

                  <span className="text-xs font-semibold text-black/55">
                    NAICS {item.naics}
                  </span>
                </div>

                <div className="mt-2 text-base font-semibold tracking-tight text-black">
                  {item.title}
                </div>

                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-black/70">
                  <span className="font-semibold">{item.location}</span>
                  <span className="text-black/35">•</span>
                  <span>
                    <span className="font-semibold">Agency:</span> {item.agency}
                  </span>
                </div>

                {/* Clean summary (your exact copy) */}
                <div className="mt-4 rounded-2xl border border-black/10 bg-white/80 p-4">
                  <div className="text-[11px] font-black tracking-[0.18em] text-black/60">
                    SUMMARY
                  </div>
                  <div className="mt-2 text-sm font-semibold leading-relaxed text-black/80">
                    {item.summary}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Support Team block (green) */}
          <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4">
            <div className="text-sm font-extrabold text-emerald-900">Your Support Team :</div>
            <div className="mt-2 text-sm font-semibold leading-relaxed text-emerald-900/90">
              You’ve been matched with a dedicated Ambit Associate. We are ready to help you win this.
              Email{" "}
              <span className="underline underline-offset-2">ambit@sevrixgov.com</span>{" "}
              now to receive your proposal framework and start building a winning submission.
            </div>
          </div>
        </div>

        {/* What You Get (icons, not numbers) */}
        <div className="mt-8">
          <div className="mb-4 text-lg font-semibold tracking-tight text-black">What You Get</div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-3xl border border-black/10 bg-white/55 p-5 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-emerald-200 bg-emerald-50 text-emerald-800">
                  <IconTarget />
                </span>
                <div className="text-sm font-semibold text-black">
                  Only see the leads you can actually win.
                </div>
              </div>
              <div className="mt-3 text-sm font-medium text-black/70 leading-relaxed">
                We match your service area and keywords to the highest-ranking daily opportunities. No fluff, just fit.
              </div>
            </div>

            <div className="rounded-3xl border border-black/10 bg-white/55 p-5 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-indigo-200 bg-indigo-50 text-indigo-800">
                  <IconFilter />
                </span>
                <div className="text-sm font-semibold text-black">
                  Focus 100% on high-value contracts.
                </div>
              </div>
              <div className="mt-3 text-sm font-medium text-black/70 leading-relaxed">
                Quickly identify "best shot" contracts and request support on the ones that move the needle for your business.
              </div>
            </div>

            <div className="rounded-3xl border border-black/10 bg-white/55 p-5 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-sky-200 bg-sky-50 text-sky-900">
                  <IconWin />
                </span>
                <div className="text-sm font-semibold text-black">
                  Ambit Associate to close the deal.
                </div>
              </div>
              <div className="mt-3 text-sm font-medium text-black/70 leading-relaxed">
                Partner with an AMBIT associate to build a clean, competitive roadmap that simplifies the path to a "Yes."
              </div>
            </div>
          </div>
        </div>

        {/* Included (Checklist of Power) */}
        <div className="mt-8 rounded-[28px] border border-black/10 bg-white/55 p-6 shadow-[0_14px_34px_rgba(2,6,23,0.10)] backdrop-blur-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-lg font-semibold tracking-tight text-black">Included</div>
              <div className="mt-1 text-sm font-medium text-black/65">
                A checklist of everything you get — built to help you move fast.
              </div>
            </div>

            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-extrabold text-emerald-900">
              VALUE PACK
            </span>
          </div>

          <div className="mt-5 grid gap-3">
            <CheckRow>
              <span className="text-black">Priority Ranking</span>{" "}
              <span className="text-black/60 font-semibold">(Saves 5+ hours/week)</span>
            </CheckRow>

            <CheckRow>
              <span className="text-black">Complete Bid Intelligence</span>
            </CheckRow>

            <CheckRow>
              <span className="text-black">The "Roadmap to Win"</span>{" "}
              <span className="text-black/60 font-semibold">for every lead</span>
            </CheckRow>
          </div>
        </div>
      </div>
    </section>
  );
}
