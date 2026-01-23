// app/preview/[segment]/page.tsx
import Link from "next/link";
import { notFound } from "next/navigation";

type Segment = "residential" | "commercial" | "government";

function titleCase(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function getPreviewData(segment: Segment) {
  if (segment === "residential") {
    return {
      headline: "Residential opportunities (preview)",
      sub:
        "This is a sample feed — one unlocked example shows the level of detail you’ll get. Start your free trial to unlock full matches and ongoing alerts.",
      unlocked: {
        title: "Kitchen remodel + tile install (Homeowner request)",
        location: "San Diego, CA",
        value: "$8,000–$15,000",
        posted: "Posted: Jan 7, 2026",
        due: "Due: Jan 14, 2026",
        summary:
          "Homeowner looking for demo + new tile flooring in kitchen and entry. Includes baseboards and minor subfloor leveling. Preference for licensed/insured crews. Estimate requested within 48 hours.",
      },
    };
  }

  if (segment === "commercial") {
    return {
      headline: "Commercial bid opportunities (preview)",
      sub:
        "This is a sample feed — one unlocked example shows the level of detail you’ll get. Start your free trial to unlock full matches and ongoing alerts.",
      unlocked: {
        title: "Apartment complex parking lot seal + striping",
        location: "Oceanside, CA",
        value: "$35,000–$65,000",
        posted: "Posted: Jan 6, 2026",
        due: "Due: Jan 16, 2026",
        summary:
          "Property management group requesting bids for sealcoat, crack-fill, and restriping across a multi-building complex. Night work allowed. Includes traffic control and staged phasing to keep access open.",
      },
    };
  }

  // government
  return {
    headline: "Government contract matches (preview)",
    sub:
      "This is a sample feed — one unlocked example shows the level of detail you’ll get. Start your free trial to unlock scoring, summaries, and ongoing alerts.",
    unlocked: {
      title: "HVAC preventative maintenance services",
      location: "Camp Pendleton, CA",
      value: "$120,000–$250,000 (est.)",
      posted: "Posted: Jan 5, 2026",
      due: "Due: Jan 20, 2026",
      summary:
        "Federal buyer seeking routine HVAC PM and minor corrective maintenance across multiple facilities. Includes scheduled visits, documentation, and response time requirements. Great fit for licensed mechanical contractors in the area.",
    },
  };
}

type Testimonial = {
  quote: string;
  name: string;
  title: string;
  location: string;
};

const TESTIMONIALS_BY_SEGMENT: Record<Segment, Testimonial> = {
  residential: {
    quote:
      "Before AMBIT, our residential 'hit list' was stagnant. Now, we’re adding over 30 new maintenance agreements every single month by hitting the right doors. We’ve successfully shifted from chasing one-off repairs to building a massive, predictable monthly income stream.",
    name: "Jeff Holloway",
    title: "Owner, Holloway Air & Heat",
    location: "Florida, USA",
  },
  commercial: {
    quote:
      "Our commercial portfolio was hit-or-miss until we started with AMBIT. By focusing on high-density business corridors, we’ve secured 12 new long-term commercial contracts in the last quarter alone. We’ve moved away from bidding on scraps and shifted toward high-margin, predictable monthly revenue that keeps our crews busy year-round.",
    name: "Khalil Johnson",
    title: "President, Johnson Commercial Solutions",
    location: "Georgia, USA",
  },
  government: {
    quote:
      "Breaking into the public sector always felt out of reach until we partnered with AMBIT. They helped us identify and win specific municipal service bids that we used to overlook. We’ve added three major government maintenance contracts this year, giving us a level of stability and monthly recurring income we never thought possible in the plumbing industry.",
    name: "Gustavo Hernandez",
    title: "Founder, Hernandez Plumbing & Infrastructure",
    location: "Texas, USA",
  },
};

// ✅ cleaner, tighter banner copy
const TRIAL_BANNER_TEXT =
  "7-day free trial • No credit card required • Cancel anytime • No spam";

type Stat = {
  label: string;
  value: string;
  sub: string;
  delta: string;
  trend?: "up" | "down";
};

type LiveBoard = {
  resultsFor: string;
  updatedText: string;
  datasetText: string;
  stats: Stat[];
};

const LIVE_BOARD_BY_SEGMENT: Record<Segment, LiveBoard> = {
  residential: {
    resultsFor: "Small-sized Pool Company (3–8 employees) in Oceanside, CA",
    updatedText: "Updated just now",
    datasetText: "Example dataset",
    stats: [
      {
        label: "Monthly Contract Revenue",
        value: "$6,250",
        sub: "vs. $1,920 prior month",
        delta: "+226%",
        trend: "up",
      },
      {
        label: "Opportunities Matched",
        value: "15",
        sub: "vs. 12 prior month",
        delta: "+25%",
        trend: "up",
      },
      {
        label: "Opportunities Submitted",
        value: "10",
        sub: "vs. 8 prior month",
        delta: "+20%",
        trend: "up",
      },

      {
        label: "Contracts Won",
        value: "3",
        sub: "vs. 1 prior month",
        delta: "+200%",
        trend: "up",
      },
      {
        label: "Pipeline Value",
        value: "$8,900",
        sub: "vs. $7,500 prior month",
        delta: "+19%",
        trend: "up",
      },
      {
        label: "Win Rate",
        value: "30%",
        sub: "vs. 25% prior year",
        delta: "+5 pts",
        trend: "up",
      },

      {
        label: "Service Capacity",
        value: "70%",
        sub: "vs. 65% prior month",
        delta: "+5%",
        trend: "up",
      },
      {
        label: "Avg Contract Value",
        value: "$1,850",
        sub: "vs. $1,690 prior month",
        delta: "+9%",
        trend: "up",
      },
      {
        label: "Cost per Win (effective)",
        value: "$120",
        sub: "vs. $135 prior month",
        delta: "-11%",
        trend: "down",
      },
    ],
  },

  commercial: {
    resultsFor:
      "Mid-sized Plumbing Business (10–25 employees) in Newport Beach, CA",
    updatedText: "Updated just now",
    datasetText: "Example dataset",
    stats: [
      {
        label: "Monthly Contract Revenue",
        value: "$41,500",
        sub: "vs. $32,600 prior month",
        delta: "+27%",
        trend: "up",
      },
      {
        label: "Opportunities Matched",
        value: "18",
        sub: "vs. 14 prior month",
        delta: "+29%",
        trend: "up",
      },
      {
        label: "Opportunities Submitted",
        value: "12",
        sub: "vs. 9 prior month",
        delta: "+33%",
        trend: "up",
      },

      {
        label: "Contracts Won",
        value: "2",
        sub: "vs. 1 prior month",
        delta: "+100%",
        trend: "up",
      },
      {
        label: "Pipeline Value",
        value: "$85,000",
        sub: "vs. $72,000 prior month",
        delta: "+18%",
        trend: "up",
      },
      {
        label: "Win Rate",
        value: "22%",
        sub: "vs. 18% prior quarter",
        delta: "+4 pts",
        trend: "up",
      },

      {
        label: "Service Capacity",
        value: "92%",
        sub: "vs. 88% prior month",
        delta: "+4%",
        trend: "up",
      },
      {
        label: "Avg Contract Value",
        value: "$1,850",
        sub: "vs. $1,460 prior month",
        delta: "+27%",
        trend: "up",
      },
      {
        label: "Cost per Win (effective)",
        value: "$245",
        sub: "vs. $280 prior month",
        delta: "-13%",
        trend: "down",
      },
    ],
  },

  government: {
    resultsFor: "Mid-sized Concrete Company (15–40 employees) in Fort Worth, TX",
    updatedText: "Updated just now",
    datasetText: "Example dataset",
    stats: [
      {
        label: "Monthly Contract Revenue",
        value: "$180,000",
        sub: "vs. $153,000 prior month",
        delta: "+18%",
        trend: "up",
      },
      {
        label: "Opportunities Matched",
        value: "8",
        sub: "vs. 5 prior month",
        delta: "+60%",
        trend: "up",
      },
      {
        label: "Opportunities Submitted",
        value: "5",
        sub: "vs. 3 prior month",
        delta: "+67%",
        trend: "up",
      },

      {
        label: "Contracts Won",
        value: "2",
        sub: "vs. 1 prior month",
        delta: "+100%",
        trend: "up",
      },
      {
        label: "Pipeline Value",
        value: "$1.0M",
        sub: "vs. $800k prior month",
        delta: "+25%",
        trend: "up",
      },
      {
        label: "Win Rate",
        value: "15%",
        sub: "vs. 11% prior year",
        delta: "+4 pts",
        trend: "up",
      },

      {
        label: "Service Capacity",
        value: "60%",
        sub: "vs. 55% prior month",
        delta: "+5%",
        trend: "up",
      },
      {
        label: "Avg Contract Value",
        value: "$900,000",
        sub: "vs. $700,000 prior month",
        delta: "+29%",
        trend: "up",
      },
      {
        label: "Cost per Win (effective)",
        value: "$239.98",
        sub: "vs. $298.00 prior month",
        delta: "-19%",
        trend: "down",
      },
    ],
  },
};

function Sparkline({ trend = "up" }: { trend?: "up" | "down" }) {
  const dUp = "M4 26 C 18 22, 22 22, 34 18 S 58 14, 76 10";
  const dDown = "M4 10 C 18 14, 22 14, 34 18 S 58 22, 76 26";
  const d = trend === "down" ? dDown : dUp;

  return (
    <svg viewBox="0 0 80 32" className="h-8 w-full" aria-hidden="true" focusable="false">
      <path
        d={d}
        fill="none"
        stroke="currentColor"
        strokeWidth="2.25"
        className="text-emerald-300/80"
        strokeLinecap="round"
      />
      <path
        d="M0 30 H80"
        stroke="currentColor"
        strokeWidth="1"
        className="text-white/10"
      />
    </svg>
  );
}

function LiveResultsBoard({ segment }: { segment: Segment }) {
  const b = LIVE_BOARD_BY_SEGMENT[segment];

  return (
    <section className="mt-8">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_10px_60px_rgba(0,0,0,0.35)]">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-semibold text-white">Proof, not promises.</h2>

              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[11px] font-semibold text-white/80">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/60" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                </span>
                Live preview
              </span>
            </div>

            <p className="mt-1 max-w-3xl text-sm text-white/60">
              Illustrative examples of what “matched opportunities + faster response” can do. Results vary by trade, area, and competitiveness.
            </p>

            <div className="mt-3 text-sm text-white/75">
              <span className="text-white/50">Results for:</span>{" "}
              <span className="font-semibold text-white">{b.resultsFor}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs text-white/55">
            <span>{b.updatedText}</span>
            <span className="text-white/25">•</span>
            <span>{b.datasetText}</span>
          </div>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {b.stats.map((s) => (
            <div
              key={s.label}
              className="rounded-2xl border border-white/10 bg-white/[0.04] p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="text-xs font-semibold text-white/60">{s.label}</div>
                <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] font-semibold text-emerald-200/90">
                  {s.delta}
                </span>
              </div>

              <div className="mt-2 text-2xl font-bold tracking-tight text-white">
                {s.value}
              </div>

              <div className="mt-1 text-xs text-white/45">{s.sub}</div>

              <div className="mt-4 text-emerald-200/80">
                <Sparkline trend={s.trend ?? "up"} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default async function PreviewSegmentPage({
  params,
}: {
  params: Promise<{ segment: string }>;
}) {
  const { segment } = await params;

  const seg = segment?.toLowerCase();
  const allowed: Segment[] = ["residential", "commercial", "government"];
  if (!allowed.includes(seg as Segment)) return notFound();

  const segmentKey = seg as Segment;
  const data = getPreviewData(segmentKey);

  const startSingleHref = "/get-started?plan=single";
  const t = TESTIMONIALS_BY_SEGMENT[segmentKey];

  return (
    <div className="min-h-screen bg-[#070B18] text-white">
      {/* Background glow + subtle grid (matches Pricing/Get Started) */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(900px_600px_at_20%_0%,rgba(26,79,163,0.25),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(800px_520px_at_80%_25%,rgba(52,211,153,0.16),transparent_55%)]" />
        <div className="absolute inset-0 opacity-[0.06] [background-image:linear-gradient(to_right,rgba(255,255,255,0.25)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.25)_1px,transparent_1px)] [background-size:72px_72px]" />
        <div className="absolute inset-0 bg-gradient-to-b from-white/[0.03] via-transparent to-transparent" />
      </div>

      <div className="mx-auto w-full max-w-7xl px-6 py-14 lg:px-10">
        {/* Back */}
        <Link href="/" className="text-sm text-white/70 hover:text-white">
          ← Back
        </Link>

        {/* Banner (info-only) */}
        <div className="mt-6 mb-5 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
          <div className="flex flex-col gap-2 md:flex-row md:items-center">
            <span className="inline-flex w-fit items-center rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[11px] font-semibold tracking-widest text-white/80">
              FREE TRIAL
            </span>
            <div className="text-xs font-semibold text-white/80 md:ml-2">
              {TRIAL_BANNER_TEXT}
            </div>
          </div>
        </div>

        {/* Hero */}
        <div className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-[0_10px_60px_rgba(0,0,0,0.25)]">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <div className="text-xs font-semibold tracking-widest text-white/50">
                {titleCase(segmentKey)}
              </div>
              <h1 className="mt-2 text-3xl font-bold leading-tight text-white md:text-4xl">
                {data.headline}
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-white/70">{data.sub}</p>
            </div>

            {/* ONE primary CTA */}
            <div className="flex flex-col items-stretch gap-2 md:items-end">
              <Link
                href={startSingleHref}
                className="rounded-xl bg-[#1A4FA3] px-5 py-2 text-sm font-semibold text-white hover:bg-[#15428B]"
              >
                Start Free Trial
              </Link>
              <div className="text-xs text-white/50">
                No credit card required • Cancel anytime
              </div>
            </div>
          </div>
        </div>

        {/* ✅ Live “Proof” board (for ALL segments) */}
        <LiveResultsBoard segment={segmentKey} />

        {/* ✅ Side-by-side */}
        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {/* Unlocked example */}
          <div className="relative rounded-2xl border border-white/10 bg-white/5 p-5 shadow-[0_10px_60px_rgba(0,0,0,0.20)]">
            <div className="absolute right-4 top-4 text-lg">🔓</div>

            <div className="text-[11px] font-semibold tracking-widest text-white/55">
              UNLOCKED EXAMPLE
            </div>
            <div className="mt-2 text-lg font-bold text-white">
              {data.unlocked.title}
            </div>

            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-white/80">
                {data.unlocked.location}
              </span>
              <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-white/80">
                Est. Value: {data.unlocked.value}
              </span>
              <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-white/70">
                {data.unlocked.posted}
              </span>
              <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-white/70">
                {data.unlocked.due}
              </span>
            </div>

            <p className="mt-4 text-sm leading-relaxed text-white/75">
              {data.unlocked.summary}
            </p>

            <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:items-center">
              <Link
                href={startSingleHref}
                className="rounded-xl bg-[#1A4FA3] px-4 py-2 text-sm font-semibold text-white hover:bg-[#15428B]"
              >
                Unlock matches
              </Link>
              <span className="text-xs text-white/50">
                Full details + scoring unlock after signup.
              </span>
            </div>
          </div>

          {/* Testimonial */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-[0_10px_60px_rgba(0,0,0,0.20)]">
            <div className="text-[11px] font-semibold tracking-widest text-white/55">
              CUSTOMER TESTIMONIAL
            </div>

            <div className="mt-2 text-sm font-semibold text-white/85">
              Proof it works — then unlock your matches.
            </div>

            <p className="mt-4 text-sm leading-relaxed text-white/80">
              “{t.quote}”
            </p>

            <div className="mt-4 text-xs text-white/60">
              <div className="font-semibold text-white/80">{t.name}</div>
              <div>
                {t.title} • {t.location}
              </div>
            </div>

            <div className="mt-5">
              <Link
                href="/testimonials"
                className="block rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-center text-sm font-semibold text-white/80 hover:bg-white/10 hover:text-white"
              >
                Read More
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
