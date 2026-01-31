"use client";

// app/components/LandingEmailPreview.tsx
import Link from "next/link";

type PreviewMatch = {
  title: string;
  location: string;
  agency: string;
  naics: string;
  segment: "residential" | "commercial" | "government";
  posted: string;
  score: number;
  reasons: string[];
};

const SAMPLE: PreviewMatch[] = [
  {
    title: "LPF USFS Rincon Station — Emergency Hazardous Tree Removal",
    location: "Carpinteria, CA",
    agency: "U.S. Forest Service",
    naics: "561730",
    segment: "government",
    posted: "Jan 27",
    score: 99,
    reasons: ["NAICS exact match (561730) +65", "Location overlap +24", "Title overlap +10"],
  },
  {
    title: "Benicia Arsenal Post Cemetery Grounds Maintenance — S208",
    location: "Benicia, CA",
    agency: "Dept. of Veterans Affairs",
    naics: "561730",
    segment: "government",
    posted: "Jan 28",
    score: 89,
    reasons: ["NAICS match (561730) +65", "Location overlap +24"],
  },
  {
    title: "Flood Mitigation + Landscape Maintenance — Healing Center",
    location: "Davis, CA",
    agency: "Indian Health Service",
    naics: "561730",
    segment: "government",
    posted: "Jan 28",
    score: 89,
    reasons: ["NAICS match (561730) +65", "Nearby fit +18", "Scope keywords +12"],
  },
];

function segmentPill(segment: PreviewMatch["segment"]) {
  if (segment === "residential") return "border-emerald-200 bg-emerald-50 text-emerald-800";
  if (segment === "commercial") return "border-indigo-200 bg-indigo-50 text-indigo-800";
  return "border-sky-200 bg-sky-50 text-sky-800";
}

function SegmentLabel({ segment }: { segment: PreviewMatch["segment"] }) {
  const label =
    segment === "residential" ? "residential" : segment === "commercial" ? "commercial" : "government";
  return (
    <span
      className={[
        "inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold",
        segmentPill(segment),
      ].join(" ")}
    >
      {label}
    </span>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-black/10 bg-white px-3 py-1 text-[11px] font-semibold text-black/60">
      {children}
    </span>
  );
}

function ScorePill({ score }: { score: number }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-2.5 py-1 text-[11px] font-semibold text-black/70">
      <span className="inline-flex h-5 min-w-[28px] items-center justify-center rounded-full bg-[#1A4FA3] px-2 text-[11px] font-black text-white">
        {score}
      </span>
      match
    </span>
  );
}

function ReasonChip({ text }: { text: string }) {
  return (
    <span className="inline-flex items-center rounded-full border border-black/10 bg-white px-3 py-1 text-[11px] font-semibold text-black/60">
      {text}
    </span>
  );
}

function EmailMatchCard({ m }: { m: PreviewMatch }) {
  return (
    <div className="rounded-2xl border border-black/10 bg-white/90 shadow-[0_18px_55px_rgba(0,0,0,0.06)]">
      <div className="px-5 py-4">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="truncate text-sm font-black tracking-tight text-black">{m.title}</div>

            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Pill>{m.location}</Pill>
              <Pill>{m.agency}</Pill>
              <Pill>NAICS {m.naics}</Pill>
              <SegmentLabel segment={m.segment} />
            </div>

            <div className="mt-2 text-xs text-black/50">Posted {m.posted}</div>
          </div>

          <div className="shrink-0 flex items-center gap-2">
            <button
              type="button"
              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-black/10 bg-white text-black/50"
              aria-label="Save"
              title="Save"
            >
              ☆
            </button>
            <ScorePill score={m.score} />
            <button
              type="button"
              className="inline-flex items-center rounded-full border border-black/10 bg-white px-3 py-1 text-[11px] font-semibold text-black/70"
              title="Locked in preview"
            >
              Source
            </button>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {m.reasons.slice(0, 3).map((r) => (
            <ReasonChip key={r} text={r} />
          ))}
        </div>

        <div className="mt-3 rounded-xl border border-black/10 bg-white p-3">
          <div className="flex items-center justify-between">
            <div className="text-xs font-semibold text-black/55">Summary</div>
            <div className="text-xs font-semibold text-black/45">Hidden in preview</div>
          </div>
          <div className="mt-2 space-y-2">
            <div className="h-2.5 w-full rounded bg-black/[0.06]" />
            <div className="h-2.5 w-11/12 rounded bg-black/[0.06]" />
            <div className="h-2.5 w-8/12 rounded bg-black/[0.06]" />
          </div>
        </div>
      </div>
    </div>
  );
}

function Step({ n, title, body }: { n: string; title: string; body: string }) {
  return (
    <div className="flex gap-3">
      <div className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-full bg-[#1A4FA3] text-xs font-black text-white">
        {n}
      </div>
      <div>
        <div className="text-sm font-semibold text-black">{title}</div>
        <div className="mt-1 text-sm text-black/65">{body}</div>
      </div>
    </div>
  );
}

export default function LandingEmailPreview() {
  return (
    <div className="w-full">
      {/* Floating panel shell (NO border) */}
      <div className="rounded-[36px] bg-white/55 backdrop-blur-xl shadow-[0_30px_90px_rgba(0,0,0,0.12)]">
        <div className="px-8 pt-7 pb-8">
          {/* Context row */}
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="text-sm text-black/60">
              Showing matches for:{" "}
              <span className="font-semibold text-black/80">San Diego, CA</span> •{" "}
              <span className="font-semibold text-black/80">Landscaping</span> •{" "}
              <span className="font-semibold text-black/80">25mi radius</span>
            </div>

            <div className="flex flex-wrap gap-2">
              <Pill>Verified buyers</Pill>
              <Pill>Updated frequently</Pill>
              <Pill>Ranked by fit</Pill>
              <Pill>Edit</Pill>
            </div>
          </div>

          {/* Two columns */}
          <div className="mt-6 grid items-start gap-6 lg:grid-cols-[1.35fr_0.85fr]">
            {/* LEFT: Just the cards (no stretching background) */}
            <div>
              <div className="mb-3 flex items-center justify-between">
                <div className="text-sm font-semibold text-black/80">Matches</div>
                <div className="text-xs text-black/45">Sample digest</div>
              </div>

              <div className="grid gap-4">
                {SAMPLE.map((m) => (
                  <EmailMatchCard key={m.title} m={m} />
                ))}
              </div>

              <div className="mt-4 flex items-center justify-between text-xs text-black/45">
                <div>Full details and links are available for active subscribers.</div>
                <Link href="/live-opportunities" className="font-semibold text-[#1A4FA3] hover:underline">
                  View live leads →
                </Link>
              </div>
            </div>

            {/* RIGHT: What you get (single clean card) */}
            <aside className="rounded-2xl bg-white/85 p-6 shadow-[0_18px_55px_rgba(0,0,0,0.06)]">
              <div className="text-[11px] font-black tracking-[0.16em] text-black/50">WHAT YOU GET</div>

              <h3 className="mt-2 text-2xl font-black tracking-tight text-black">
                More than a lead — a winning plan.
              </h3>

              <p className="mt-2 text-sm text-black/60">
                AMBIT delivers ranked opportunities to your inbox. When one is worth pursuing, you
                connect with an AMBIT associate to build the best approach to win.
              </p>

              <div className="mt-6 space-y-4">
                <Step
                  n="1"
                  title="Matches delivered daily"
                  body="We match your service area, keywords, and NAICS — then rank opportunities by fit."
                />
                <Step
                  n="2"
                  title="You choose what to pursue"
                  body="Scan the digest, pick your best shots, and request support on the ones that matter."
                />
                <Step
                  n="3"
                  title="An associate builds your game plan"
                  body="We help clarify requirements, submission steps, and a clean path to a competitive bid — fast."
                />
              </div>

              <div className="mt-6 rounded-2xl border border-black/10 bg-white p-4">
                <div className="text-sm font-semibold text-black">Included</div>
                <ul className="mt-3 space-y-2 text-sm text-black/70">
                  <li className="flex gap-2">
                    <span className="mt-1 h-2 w-2 rounded-full bg-[#1A4FA3]" />
                    Ranked matches + match reasons
                  </li>
                  <li className="flex gap-2">
                    <span className="mt-1 h-2 w-2 rounded-full bg-[#1A4FA3]" />
                    Deadlines + key details
                  </li>
                  <li className="flex gap-2">
                    <span className="mt-1 h-2 w-2 rounded-full bg-[#1A4FA3]" />
                    Clear next steps with support
                  </li>
                </ul>
              </div>

              <div className="mt-5 text-xs text-black/45">
                Start free. Add a card when you’re ready to unlock full details.
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}
