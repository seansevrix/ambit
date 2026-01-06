// app/about/page.tsx
import Link from "next/link";

export const metadata = {
  title: "About | AMBIT",
  description:
    "AMBIT helps businesses find the right government contracts faster with clear matches and simple scouting reports.",
};

const PREVIEW_HREF = "/opportunities";
const GET_STARTED_HREF = "/get-started";

export default function AboutPage() {
  return (
    <main className="min-h-screen text-white bg-gradient-to-b from-[#061633] via-[#071a3a] to-[#061633]">
      {/* HERO (Prismatic-style center headline) */}
      <section className="px-6 pt-14 pb-10">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-3xl text-center">
            <div className="text-xs tracking-widest text-blue-300/90">
              ABOUT AMBIT
            </div>

            <h1 className="mt-4 text-4xl md:text-6xl font-semibold tracking-tight">
              Your Bridge to Federal, State, and Local Opportunities.
            </h1>

            <p className="mt-5 text-base md:text-lg text-white/70">
              Tell AMBIT what your business does and where you work. We find live opportunities,
              score matches, and deliver a clear scouting report — so you don’t miss good bids.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href={GET_STARTED_HREF}
                className="rounded-xl bg-[#1A4FA3] px-6 py-3 text-sm font-semibold text-white hover:bg-[#15428B] transition"
              >
                Get Started
              </Link>

              <Link
                href={PREVIEW_HREF}
                className="rounded-xl border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-white/90 hover:bg-white/10 transition"
              >
                Preview opportunities
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* “WHAT DRIVES US” split section (Prismatic-style) */}
      <section className="px-6 py-12">
        <div className="mx-auto max-w-6xl grid gap-10 md:grid-cols-2 items-center">
          <div>
            <div className="text-xs tracking-widest text-blue-300/90">
              WHAT DRIVES US
            </div>

            <h2 className="mt-4 text-3xl md:text-4xl font-semibold tracking-tight">
              Contract hunting shouldn’t be a full-time job.
            </h2>

            <p className="mt-4 text-white/70 leading-relaxed">
              Businesses don’t have time to live inside portals, PDFs, and endless listings.
              AMBIT is built to reduce noise and surface the opportunities that actually fit —
              with match scoring, key details up front, and clear summaries you can act on.
            </p>

            <div className="mt-6 space-y-3">
              <Feature line="Live opportunities pulled regularly so you don’t miss postings" />
              <Feature line="Match scoring based on your profile (NAICS, location, keywords)" />
              <Feature line="Short, scannable summaries for fast bid decisions" />
            </div>
          </div>

          {/* Right-side “product preview” card */}
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.03)]">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold">Scouting Report Preview</div>
              <div className="text-xs text-white/60">Sample</div>
            </div>

            <div className="mt-5 space-y-3">
              <MiniCard title="NAICS" value="237310 • Highway, Street, and Bridge" />
              <MiniCard title="Location" value="San Diego, CA" />
              <MiniCard title="Why it matches" value="Local + relevant NAICS + keywords align" />

              <div className="rounded-2xl border border-white/10 bg-[#071a3a]/50 p-4">
                <div className="text-xs text-white/60">Summary</div>
                <div className="mt-2 text-sm text-white/80 leading-relaxed">
                  Clear scope and schedule with standard compliance. Strong fit for businesses
                  that want to move fast and avoid wasted time on bad opportunities.
                </div>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-2xl font-semibold text-blue-300">Signal</div>
                <div className="mt-1 text-sm text-white/70">
                  Better-fit opportunities first
                </div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-2xl font-semibold text-blue-300">Speed</div>
                <div className="mt-1 text-sm text-white/70">
                  Decide in minutes, not hours
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats row (Prismatic-style, but truthful) */}
      <section className="px-6 py-10">
        <div className="mx-auto max-w-6xl grid gap-6 md:grid-cols-3">
          <Stat
            big="Live"
            small="opportunities"
            desc="Fresh postings surfaced on a schedule so you can stay ahead."
          />
          <Stat
            big="Smart"
            small="match scoring"
            desc="Based on what you do, where you work, and what you want."
          />
          <Stat
            big="Clear"
            small="summaries"
            desc="Scannable details so you can bid, partner, or pass quickly."
          />
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 pb-16 pt-6">
        <div className="mx-auto max-w-6xl rounded-3xl border border-white/10 bg-white/5 p-8 md:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <h3 className="text-2xl font-semibold tracking-tight">
              Ready to see matches for your business?
            </h3>
            <p className="mt-2 text-white/70">
              Create your profile and start scouting in minutes.
            </p>
          </div>

          <div className="flex gap-3">
            <Link
              href={GET_STARTED_HREF}
              className="rounded-xl bg-[#1A4FA3] px-6 py-3 text-sm font-semibold text-white hover:bg-[#15428B] transition"
            >
              Get Started
            </Link>
            <Link
              href={PREVIEW_HREF}
              className="rounded-xl border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-white/90 hover:bg-white/10 transition"
            >
              Preview
            </Link>
          </div>
        </div>

        <div className="mx-auto max-w-6xl px-2 pt-8 text-sm text-white/60">
          Questions? Email{" "}
          <a className="underline hover:text-white" href="mailto:ambit@sevrixgov.com">
            ambit@sevrixgov.com
          </a>
        </div>
      </section>
    </main>
  );
}

function Feature({ line }: { line: string }) {
  return (
    <div className="flex gap-3 text-white/80">
      <span className="mt-0.5 text-blue-300">✓</span>
      <span>{line}</span>
    </div>
  );
}

function MiniCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="text-xs text-white/60">{title}</div>
      <div className="mt-1 text-sm text-white/85">{value}</div>
    </div>
  );
}

function Stat({
  big,
  small,
  desc,
}: {
  big: string;
  small: string;
  desc: string;
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-7">
      <div className="text-5xl font-semibold tracking-tight text-blue-300">
        {big}
      </div>
      <div className="mt-2 text-xl text-white/90">{small}</div>
      <div className="mt-2 text-sm text-white/65">{desc}</div>
    </div>
  );
}
