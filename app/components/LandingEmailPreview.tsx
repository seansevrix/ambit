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

const DIGEST_ONE: DigestItem = {
  score: 99,
  title: "Emergency hazardous tree removal — Rincon Station",
  location: "Carpinteria, CA",
  agency: "U.S. Forest Service",
  naics: "561730",
  segment: "government",
  posted: "Posted Jan 27",
  reasons: ["NAICS exact match", "Location overlap", "Title overlap"],
};

function SegPill({ s }: { s: Segment }) {
  const cls =
    s === "residential"
      ? "bg-emerald-50 text-emerald-800"
      : s === "commercial"
      ? "bg-indigo-50 text-indigo-800"
      : "bg-sky-50 text-sky-800";

  return <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${cls}`}>{s}</span>;
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-black/[0.04] px-3 py-1 text-[11px] font-semibold text-black/60">
      {children}
    </span>
  );
}

function MetaPill({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-white/90 px-3 py-1 text-[11px] font-semibold text-black/60 shadow-[0_16px_45px_rgba(0,0,0,0.10)]">
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
    <div className="rounded-3xl bg-white/90 backdrop-blur-md shadow-[0_30px_90px_rgba(0,0,0,0.12)]">
      <div className="px-7 py-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="truncate text-[16px] font-black tracking-tight text-black">
              {item.title}
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Chip>{item.location}</Chip>
              <Chip>{item.agency}</Chip>
              <Chip>NAICS {item.naics}</Chip>
              <SegPill s={item.segment} />
            </div>

            <div className="mt-2 text-xs text-black/45">{item.posted}</div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-black/50 shadow-[0_16px_45px_rgba(0,0,0,0.12)]"
              title="Save"
              aria-label="Save"
            >
              ☆
            </button>

            <div className="rounded-full bg-white px-3 py-2 shadow-[0_16px_45px_rgba(0,0,0,0.12)]">
              <ScoreBubble score={item.score} />
            </div>

            <button
              type="button"
              className="inline-flex items-center rounded-full bg-white px-4 py-2 text-[11px] font-semibold text-black/70 shadow-[0_16px_45px_rgba(0,0,0,0.12)]"
              title="Locked in preview"
            >
              Source
            </button>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {item.reasons.slice(0, 3).map((r) => (
            <Chip key={r}>{r}</Chip>
          ))}
        </div>

        <div className="mt-5 rounded-2xl bg-white p-5 shadow-[0_18px_55px_rgba(0,0,0,0.08)]">
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
      {/* Context line */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="text-sm text-black/60">
          Showing matches for:{" "}
          <span className="font-semibold text-black/80">San Diego, CA</span> •{" "}
          <span className="font-semibold text-black/80">Landscaping</span> •{" "}
          <span className="font-semibold text-black/80">25mi radius</span>
        </div>

        <div className="flex flex-wrap gap-2">
          <MetaPill>Verified buyers</MetaPill>
          <MetaPill>Updated frequently</MetaPill>
          <MetaPill>Ranked by fit</MetaPill>
          <MetaPill>Edit</MetaPill>
        </div>
      </div>

      {/* Digest (single card) */}
      <div className="mt-6">
        <div className="mb-3 flex items-center justify-between">
          <div className="text-sm font-semibold text-black/80">Sample digest</div>
          <div className="text-xs text-black/45">Preview</div>
        </div>

        <DigestRow item={DIGEST_ONE} />

        {/* ✅ New digest summary line */}
        <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between text-sm text-black/60">
          <div>
            Daily emails include the top matches first — with fit score, key details, and “why it matched.”
          </div>
          <Link href="/live-opportunities" className="shrink-0 font-semibold text-[#1A4FA3] hover:underline">
            View live leads →
          </Link>
        </div>
      </div>

      {/* What you get (below) */}
      <div className="mt-10">
        <div className="rounded-[34px] bg-white/90 backdrop-blur-md p-9 shadow-[0_30px_90px_rgba(0,0,0,0.12)]">
          <div className="mx-auto max-w-[920px] text-center">
            <div className="text-[11px] font-black tracking-[0.16em] text-black/50">WHAT YOU GET</div>

            <h3 className="mt-3 text-4xl font-black tracking-tight text-black">
              A winning plan, not just a lead.
            </h3>

            <p className="mx-auto mt-4 max-w-2xl text-sm text-black/60">
              AMBIT emails ranked opportunities daily. When one is worth pursuing, you connect with an AMBIT associate
              to build the strongest approach to win.
            </p>
          </div>

          <div className="mx-auto mt-10 grid max-w-[980px] gap-6 md:grid-cols-3">
            <div className="rounded-3xl bg-white p-7 shadow-[0_18px_55px_rgba(0,0,0,0.08)]">
              <Step
                n="1"
                title="Matches delivered daily"
                body="We match your service area, keywords, and NAICS — then rank opportunities by fit."
              />
            </div>

            <div className="rounded-3xl bg-white p-7 shadow-[0_18px_55px_rgba(0,0,0,0.08)]">
              <Step
                n="2"
                title="You pick your best shots"
                body="Scan the digest, choose what to pursue, and request support on the ones that matter."
              />
            </div>

            <div className="rounded-3xl bg-white p-7 shadow-[0_18px_55px_rgba(0,0,0,0.08)]">
              <Step
                n="3"
                title="An associate builds your game plan"
                body="We help clarify requirements, submission steps, and a clean path to a competitive bid — fast."
              />
            </div>
          </div>

          <div className="mx-auto mt-8 max-w-[980px] rounded-3xl bg-white p-7 shadow-[0_18px_55px_rgba(0,0,0,0.08)]">
            <div className="text-sm font-semibold text-black">Included</div>
            <div className="mt-4 grid gap-3 sm:grid-cols-3 text-sm text-black/70">
              <div className="flex items-start gap-2">
                <span className="mt-2 h-2 w-2 rounded-full bg-[#1A4FA3]" />
                Ranked matches + match reasons
              </div>
              <div className="flex items-start gap-2">
                <span className="mt-2 h-2 w-2 rounded-full bg-[#1A4FA3]" />
                Deadlines + key details
              </div>
              <div className="flex items-start gap-2">
                <span className="mt-2 h-2 w-2 rounded-full bg-[#1A4FA3]" />
                Clear next steps with support
              </div>
            </div>

            <div className="mt-6 text-center text-xs text-black/45">
              Start free. Add a card when you’re ready to unlock full details.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
