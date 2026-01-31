"use client";

import Link from "next/link";

type Segment = "residential" | "commercial" | "government";

type DigestItem = {
  score: number;
  title: string;
  location: string;
  agency: string;
  naics: string;
  segment: Segment;
  posted: string;
  reasons: string[];
};

const DIGEST: DigestItem[] = [
  {
    score: 99,
    title: "Emergency hazardous tree removal — Rincon Station",
    location: "Carpinteria, CA",
    agency: "U.S. Forest Service",
    naics: "561730",
    segment: "government",
    posted: "Posted Jan 27",
    reasons: ["NAICS exact match", "Location overlap", "Title overlap"],
  },
  {
    score: 89,
    title: "Cemetery grounds maintenance — Benicia Arsenal (S208)",
    location: "Benicia, CA",
    agency: "Dept. of Veterans Affairs",
    naics: "561730",
    segment: "government",
    posted: "Posted Jan 28",
    reasons: ["NAICS match", "Nearby fit", "Scope keywords"],
  },
  {
    score: 89,
    title: "Landscape maintenance — Healing Center",
    location: "Davis, CA",
    agency: "Indian Health Service",
    naics: "561730",
    segment: "government",
    posted: "Posted Jan 28",
    reasons: ["NAICS match", "Nearby fit", "Scope keywords"],
  },
];

function SegPill({ s }: { s: Segment }) {
  const cls =
    s === "residential"
      ? "bg-emerald-50 text-emerald-800"
      : s === "commercial"
      ? "bg-indigo-50 text-indigo-800"
      : "bg-sky-50 text-sky-800";

  return (
    <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${cls}`}>
      {s}
    </span>
  );
}

function TinyChip({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-black/[0.03] px-2.5 py-1 text-[11px] font-semibold text-black/60">
      {children}
    </span>
  );
}

function ScoreBubble({ score }: { score: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#1A4FA3] text-xs font-black text-white shadow-[0_12px_28px_rgba(26,79,163,0.25)]">
        {score}
      </div>
      <div className="text-[11px] font-semibold text-black/55">match</div>
    </div>
  );
}

function DigestRow({ item }: { item: DigestItem }) {
  return (
    <div className="rounded-2xl bg-white/90 backdrop-blur-md shadow-[0_22px_60px_rgba(0,0,0,0.10)]">
      <div className="px-6 py-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="truncate text-[15px] font-black tracking-tight text-black">
              {item.title}
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-2">
              <TinyChip>{item.location}</TinyChip>
              <TinyChip>{item.agency}</TinyChip>
              <TinyChip>NAICS {item.naics}</TinyChip>
              <SegPill s={item.segment} />
            </div>

            <div className="mt-2 text-xs text-black/45">{item.posted}</div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white text-black/50 shadow-[0_16px_45px_rgba(0,0,0,0.12)]"
              title="Save"
              aria-label="Save"
            >
              ☆
            </button>

            <ScoreBubble score={item.score} />

            <button
              type="button"
              className="inline-flex items-center rounded-full bg-white px-3 py-2 text-[11px] font-semibold text-black/70 shadow-[0_16px_45px_rgba(0,0,0,0.12)]"
              title="Locked in preview"
            >
              Source
            </button>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {item.reasons.slice(0, 3).map((r) => (
            <span
              key={r}
              className="rounded-full bg-black/[0.04] px-3 py-1 text-[11px] font-semibold text-black/60"
            >
              {r}
            </span>
          ))}
        </div>

        {/* email-like hidden content */}
        <div className="mt-4 rounded-2xl bg-white p-4 shadow-[0_14px_40px_rgba(0,0,0,0.08)]">
          <div className="flex items-center justify-between">
            <div className="text-xs font-semibold text-black/55">Summary</div>
            <div className="text-xs font-semibold text-black/40">Hidden in preview</div>
          </div>

          <div className="mt-3 space-y-2">
            <div className="h-2.5 w-full rounded bg-black/[0.06]" />
            <div className="h-2.5 w-10/12 rounded bg-black/[0.06]" />
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
      {/* Top context line (floating, no panel) */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="text-sm text-black/60">
          Showing matches for:{" "}
          <span className="font-semibold text-black/80">San Diego, CA</span> •{" "}
          <span className="font-semibold text-black/80">Landscaping</span> •{" "}
          <span className="font-semibold text-black/80">25mi radius</span>
        </div>

        <div className="flex flex-wrap gap-2">
          <span className="rounded-full bg-white/90 px-3 py-1 text-[11px] font-semibold text-black/60 shadow-[0_16px_45px_rgba(0,0,0,0.10)]">
            Verified buyers
          </span>
          <span className="rounded-full bg-white/90 px-3 py-1 text-[11px] font-semibold text-black/60 shadow-[0_16px_45px_rgba(0,0,0,0.10)]">
            Updated frequently
          </span>
          <span className="rounded-full bg-white/90 px-3 py-1 text-[11px] font-semibold text-black/60 shadow-[0_16px_45px_rgba(0,0,0,0.10)]">
            Ranked by fit
          </span>
          <span className="rounded-full bg-white/90 px-3 py-1 text-[11px] font-semibold text-black/55 shadow-[0_16px_45px_rgba(0,0,0,0.10)]">
            Edit
          </span>
        </div>
      </div>

      {/* Two floating cards (no outer border / no huge background) */}
      <div className="mt-6 grid items-start gap-10 lg:grid-cols-[1.35fr_0.85fr]">
        {/* LEFT: Email digest */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <div className="text-sm font-semibold text-black/80">Sample digest</div>
            <div className="text-xs text-black/45">Preview</div>
          </div>

          <div className="grid gap-6">
            {DIGEST.map((item) => (
              <DigestRow key={item.title} item={item} />
            ))}
          </div>

          <div className="mt-5 flex items-center justify-between text-xs text-black/45">
            <div>Full details and links are available for active subscribers.</div>
            <Link href="/live-opportunities" className="font-semibold text-[#1A4FA3] hover:underline">
              View live leads →
            </Link>
          </div>
        </div>

        {/* RIGHT: What you get */}
        <aside className="rounded-[32px] bg-white/90 backdrop-blur-md p-8 shadow-[0_30px_90px_rgba(0,0,0,0.12)]">
          <div className="text-[11px] font-black tracking-[0.16em] text-black/50">WHAT YOU GET</div>

          <h3 className="mt-2 text-3xl font-black tracking-tight text-black">
            A winning plan, not just a lead.
          </h3>

          <p className="mt-3 text-sm text-black/60">
            AMBIT emails ranked opportunities daily. When one is worth pursuing, you connect with an AMBIT associate
            to build the strongest approach to win.
          </p>

          <div className="mt-7 space-y-5">
            <Step
              n="1"
              title="Matches delivered daily"
              body="We match your service area, keywords, and NAICS — then rank opportunities by fit."
            />
            <Step
              n="2"
              title="You pick your best shots"
              body="Scan the digest, choose what to pursue, and request support on the ones that matter."
            />
            <Step
              n="3"
              title="An associate builds your game plan"
              body="We help clarify requirements, submission steps, and a clean path to a competitive bid — fast."
            />
          </div>

          <div className="mt-7 rounded-2xl bg-white p-5 shadow-[0_18px_55px_rgba(0,0,0,0.08)]">
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
  );
}
