// app/preview/[segment]/page.tsx
import Link from "next/link";
import { notFound } from "next/navigation";

type Segment = "residential" | "commercial" | "government";

function titleCase(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

type UnlockedExample = {
  title: string;
  location: string;
  value: string;
  source: string;
  buyerType: string;
  responseWindow: string;
  requirements: string[];
  summary: string;
  whyMatch: string[];
  unlockIncludes: string[];
};

function getPreviewData(segment: Segment): {
  headline: string;
  sub: string;
  unlocked: UnlockedExample;
} {
  if (segment === "residential") {
    return {
      headline: "Residential opportunities (preview)",
      sub:
        "This is a sample feed. Below is one unlocked example showing the level of detail you’ll receive after signup — plus daily ranked delivery.",
      unlocked: {
        title: "Kitchen remodel + tile install (Homeowner request)",
        location: "San Diego, CA",
        value: "$8,000–$15,000",
        source: "Local residential intake",
        buyerType: "Homeowner",
        responseWindow: "Response requested within 48 hours",
        requirements: ["Licensed / insured preferred", "Demo + install", "Light subfloor leveling"],
        summary:
          "Homeowner looking for demo + new tile flooring in kitchen and entry. Includes baseboards and minor subfloor leveling. Preference for licensed/insured crews.",
        whyMatch: [
          "Matches: tile / flooring + light remodel",
          "Location: San Diego area",
          "Value range fits small crews",
        ],
        unlockIncludes: [
          "Full scope + photos (if provided)",
          "Customer contact + preferred callback window",
          "Materials/finish notes + site constraints",
          "Fit score + quick “why it matches” summary",
        ],
      },
    };
  }

  if (segment === "commercial") {
    return {
      headline: "Commercial bid opportunities (preview)",
      sub:
        "This is a sample feed. Below is one unlocked example showing the level of detail you’ll receive after signup — plus daily ranked delivery.",
      unlocked: {
        title: "Apartment complex parking lot seal + striping",
        location: "Oceanside, CA",
        value: "$35,000–$65,000",
        source: "Commercial property manager outreach",
        buyerType: "Property management",
        responseWindow: "Site walk preferred (optional)",
        requirements: ["Night work allowed", "Traffic control", "Phased access plan"],
        summary:
          "Property management group requesting bids for sealcoat, crack-fill, and restriping across a multi-building complex. Night work allowed. Includes traffic control and staged phasing to keep access open.",
        whyMatch: [
          "Matches: sealcoat / striping scope",
          "Commercial buyer (repeat work potential)",
          "Clear constraints → faster quoting",
        ],
        unlockIncludes: [
          "Scope breakdown + site notes",
          "Decision-maker contact + bid preferences",
          "Bid structure guidance (what they care about)",
          "Fit score + summary + next-step checklist",
        ],
      },
    };
  }

  // government
  return {
    headline: "Government contract matches (preview)",
    sub:
      "This is a sample feed. Below is one unlocked example showing the level of detail you’ll receive after signup — including scoring, summaries, and daily ranked delivery.",
    unlocked: {
      title: "HVAC preventative maintenance services",
      location: "Camp Pendleton, CA",
      value: "$120,000–$250,000 (est.)",
      source: "SAM.gov / federal portal",
      buyerType: "Federal buyer",
      responseWindow: "Recurring service (multi-visit)",
      requirements: ["Documentation required", "Response time requirements", "Licensed mechanical contractors"],
      summary:
        "Federal buyer seeking routine HVAC PM and minor corrective maintenance across multiple facilities. Includes scheduled visits, documentation, and response time requirements.",
      whyMatch: [
        "Matches: HVAC PM + corrective maintenance",
        "High-value recurring work",
        "Clear compliance requirements up front",
      ],
      unlockIncludes: [
        "Full solicitation details + attachments",
        "Submission method + POCs + deadlines",
        "Compliance checklist (insurance, reps/certs, invoicing)",
        "Fit score + short summary + next actions",
      ],
    },
  };
}

type Testimonial = {
  quote: string;
  name: string;
  title: string;
  location: string;
  highlight?: string;
};

const TESTIMONIALS_BY_SEGMENT: Record<Segment, Testimonial> = {
  residential: {
    highlight: "Shifted from one-off jobs to predictable monthly work.",
    quote:
      "Before AMBIT, our residential list was stagnant. Now we’re consistently adding new maintenance agreements by focusing on the right opportunities first — and spending less time searching.",
    name: "Jeff Holloway",
    title: "Owner, Holloway Air & Heat",
    location: "Florida, USA",
  },
  commercial: {
    highlight: "More long-term contracts, less chasing random small bids.",
    quote:
      "Our commercial work was hit-or-miss until AMBIT helped us focus on better-fit opportunities. The biggest change is consistency — we’re bidding faster, with clearer scope, and keeping crews busy.",
    name: "Khalil Johnson",
    title: "President, Johnson Commercial Solutions",
    location: "Georgia, USA",
  },
  government: {
    highlight: "Better visibility into public-sector bids we used to miss.",
    quote:
      "Government work always felt out of reach until we had a simple way to spot the right opportunities and act quickly. AMBIT made it easier to stay on top of what matters and skip the noise.",
    name: "Gustavo Hernandez",
    title: "Founder, Hernandez Plumbing & Infrastructure",
    location: "Texas, USA",
  },
};

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
      { label: "Monthly Contract Revenue", value: "$6,250", sub: "vs. $1,920 prior month", delta: "+226%", trend: "up" },
      { label: "Opportunities Matched", value: "15", sub: "vs. 12 prior month", delta: "+25%", trend: "up" },
      { label: "Opportunities Submitted", value: "10", sub: "vs. 8 prior month", delta: "+20%", trend: "up" },
      { label: "Contracts Won", value: "3", sub: "vs. 1 prior month", delta: "+200%", trend: "up" },
      { label: "Pipeline Value", value: "$8,900", sub: "vs. $7,500 prior month", delta: "+19%", trend: "up" },
      { label: "Win Rate", value: "30%", sub: "vs. 25% prior year", delta: "+5 pts", trend: "up" },
      { label: "Service Capacity", value: "70%", sub: "vs. 65% prior month", delta: "+5%", trend: "up" },
      { label: "Avg Contract Value", value: "$1,850", sub: "vs. $1,690 prior month", delta: "+9%", trend: "up" },
      { label: "Cost per Win (effective)", value: "$120", sub: "vs. $135 prior month", delta: "-11%", trend: "down" },
    ],
  },
  commercial: {
    resultsFor: "Mid-sized Plumbing Business (10–25 employees) in Newport Beach, CA",
    updatedText: "Updated just now",
    datasetText: "Example dataset",
    stats: [
      { label: "Monthly Contract Revenue", value: "$41,500", sub: "vs. $32,600 prior month", delta: "+27%", trend: "up" },
      { label: "Opportunities Matched", value: "18", sub: "vs. 14 prior month", delta: "+29%", trend: "up" },
      { label: "Opportunities Submitted", value: "12", sub: "vs. 9 prior month", delta: "+33%", trend: "up" },
      { label: "Contracts Won", value: "2", sub: "vs. 1 prior month", delta: "+100%", trend: "up" },
      { label: "Pipeline Value", value: "$85,000", sub: "vs. $72,000 prior month", delta: "+18%", trend: "up" },
      { label: "Win Rate", value: "22%", sub: "vs. 18% prior quarter", delta: "+4 pts", trend: "up" },
      { label: "Service Capacity", value: "92%", sub: "vs. 88% prior month", delta: "+4%", trend: "up" },
      { label: "Avg Contract Value", value: "$1,850", sub: "vs. $1,460 prior month", delta: "+27%", trend: "up" },
      { label: "Cost per Win (effective)", value: "$245", sub: "vs. $280 prior month", delta: "-13%", trend: "down" },
    ],
  },
  government: {
    resultsFor: "Mid-sized Concrete Company (15–40 employees) in Fort Worth, TX",
    updatedText: "Updated just now",
    datasetText: "Example dataset",
    stats: [
      { label: "Monthly Contract Revenue", value: "$180,000", sub: "vs. $153,000 prior month", delta: "+18%", trend: "up" },
      { label: "Opportunities Matched", value: "8", sub: "vs. 5 prior month", delta: "+60%", trend: "up" },
      { label: "Opportunities Submitted", value: "5", sub: "vs. 3 prior month", delta: "+67%", trend: "up" },
      { label: "Contracts Won", value: "2", sub: "vs. 1 prior month", delta: "+100%", trend: "up" },
      { label: "Pipeline Value", value: "$1.0M", sub: "vs. $800k prior month", delta: "+25%", trend: "up" },
      { label: "Win Rate", value: "15%", sub: "vs. 11% prior year", delta: "+4 pts", trend: "up" },
      { label: "Service Capacity", value: "60%", sub: "vs. 55% prior month", delta: "+5%", trend: "up" },
      { label: "Avg Contract Value", value: "$900,000", sub: "vs. $700,000 prior month", delta: "+29%", trend: "up" },
      { label: "Cost per Win (effective)", value: "$239.98", sub: "vs. $298.00 prior month", delta: "-19%", trend: "down" },
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
      <path d="M0 30 H80" stroke="currentColor" strokeWidth="1" className="text-white/10" />
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
            <div key={s.label} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="text-xs font-semibold text-white/60">{s.label}</div>
                <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] font-semibold text-emerald-200/90">
                  {s.delta}
                </span>
              </div>

              <div className="mt-2 text-2xl font-bold tracking-tight text-white">{s.value}</div>
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

function DotList({ items }: { items: string[] }) {
  const unique = Array.from(new Set(items));
  return (
    <ul className="mt-2 space-y-2 text-sm text-white/75">
      {unique.map((item) => (
        <li key={item} className="flex gap-2">
          <span className="mt-[6px] h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-300/70" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
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
      {/* Background glow + subtle grid */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(900px_600px_at_20%_0%,rgba(26,79,163,0.25),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(800px_520px_at_80%_25%,rgba(52,211,153,0.16),transparent_55%)]" />
        <div className="absolute inset-0 opacity-[0.06] [background-image:linear-gradient(to_right,rgba(255,255,255,0.25)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.25)_1px,transparent_1px)] [background-size:72px_72px]" />
        <div className="absolute inset-0 bg-gradient-to-b from-white/[0.03] via-transparent to-transparent" />
      </div>

      <div className="mx-auto w-full max-w-7xl px-6 py-14 lg:px-10">
        <Link href="/" className="text-sm text-white/70 hover:text-white">
          ← Back
        </Link>

        {/* Trial banner */}
        <div className="mt-6 mb-5 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
          <div className="flex flex-col gap-2 md:flex-row md:items-center">
            <span className="inline-flex w-fit items-center rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[11px] font-semibold tracking-widest text-white/80">
              FREE TRIAL
            </span>
            <div className="text-xs font-semibold text-white/80 md:ml-2">{TRIAL_BANNER_TEXT}</div>
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

            {/* One clean CTA */}
            <div className="flex flex-col items-stretch gap-2 md:items-end">
              <Link
                href={startSingleHref}
                className="rounded-xl bg-[#1A4FA3] px-5 py-2 text-sm font-semibold text-white hover:bg-[#15428B]"
              >
                Start Free Trial
              </Link>
              <div className="text-xs text-white/50">No credit card required • ~2 minutes</div>
            </div>
          </div>
        </div>

        {/* Live proof board */}
        <LiveResultsBoard segment={segmentKey} />

        {/* Example + Testimonial */}
        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {/* Unlocked example */}
          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-5 shadow-[0_10px_60px_rgba(0,0,0,0.20)]">
            {/* premium glow */}
            <div className="pointer-events-none absolute -inset-px rounded-2xl bg-[radial-gradient(520px_300px_at_25%_0%,rgba(26,79,163,0.18),transparent_60%)]" />
            <div className="pointer-events-none absolute -inset-px rounded-2xl bg-[radial-gradient(520px_300px_at_75%_0%,rgba(52,211,153,0.14),transparent_60%)]" />
            <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-white/[0.06] via-transparent to-transparent" />

            <div className="relative flex items-center justify-between gap-3">
              <div className="text-[11px] font-semibold tracking-widest text-white/55">
                UNLOCKED EXAMPLE
              </div>
              <span className="inline-flex items-center rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-[11px] font-semibold text-emerald-100/90">
                Detail preview
              </span>
            </div>

            <div className="relative mt-2 text-lg font-bold text-white">{data.unlocked.title}</div>

            {/* chips (NO posted/due) */}
            <div className="relative mt-3 flex flex-wrap gap-2 text-xs">
              <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-white/80">
                {data.unlocked.location}
              </span>
              <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-white/80">
                Est. Value: {data.unlocked.value}
              </span>
              <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-white/70">
                Source: {data.unlocked.source}
              </span>
              <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-white/70">
                Buyer: {data.unlocked.buyerType}
              </span>
            </div>

            <p className="relative mt-4 text-sm leading-relaxed text-white/75">
              {data.unlocked.summary}
            </p>

            {/* requirements */}
            <div className="relative mt-4 rounded-xl border border-white/10 bg-white/[0.04] p-4">
              <div className="text-xs font-semibold text-white/70">Key requirements</div>
              <DotList items={[data.unlocked.responseWindow, ...data.unlocked.requirements]} />
            </div>

            {/* why match + unlock includes */}
            <div className="relative mt-4 grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
                <div className="text-xs font-semibold text-white/70">Why it matches</div>
                <DotList items={data.unlocked.whyMatch} />
              </div>
              <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
                <div className="text-xs font-semibold text-white/70">Unlock includes</div>
                <DotList items={data.unlocked.unlockIncludes} />
              </div>
            </div>

            <div className="relative mt-5 flex flex-col gap-2 sm:flex-row sm:items-center">
              <Link
                href={startSingleHref}
                className="rounded-xl bg-[#1A4FA3] px-4 py-2 text-center text-sm font-semibold text-white hover:bg-[#15428B]"
              >
                Unlock matches
              </Link>
              <span className="text-xs text-white/50">
                No credit card required • Cancel anytime
              </span>
            </div>

            <div className="relative mt-3 text-xs text-white/45">
              Full details, scoring, and ongoing ranked delivery unlock after signup.
            </div>
          </div>

          {/* Testimonial */}
          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-5 shadow-[0_10px_60px_rgba(0,0,0,0.20)]">
            <div className="pointer-events-none absolute -inset-px rounded-2xl bg-[radial-gradient(520px_300px_at_70%_0%,rgba(26,79,163,0.16),transparent_60%)]" />
            <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-white/[0.06] via-transparent to-transparent" />

            <div className="relative flex items-center justify-between gap-3">
              <div className="text-[11px] font-semibold tracking-widest text-white/55">
                CUSTOMER STORY
              </div>
              <span className="inline-flex items-center rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[11px] font-semibold text-white/75">
                Results vary
              </span>
            </div>

            <div className="relative mt-2 text-sm font-semibold text-white/85">
              {t.highlight ?? "Proof it works — then unlock your matches."}
            </div>

            <p className="relative mt-4 text-sm leading-relaxed text-white/80">
              “{t.quote}”
            </p>

            <div className="relative mt-4 flex items-center justify-between gap-3">
              <div className="text-xs text-white/60">
                <div className="font-semibold text-white/80">{t.name}</div>
                <div>
                  {t.title} • {t.location}
                </div>
              </div>

              <Link
                href="/testimonials"
                className="text-xs font-semibold text-white/70 hover:text-white transition"
              >
                Read more →
              </Link>
            </div>

            <div className="relative mt-5 rounded-xl border border-white/10 bg-white/[0.04] p-4">
              <div className="text-xs font-semibold text-white/70">What you get</div>
              <div className="mt-2 text-sm text-white/75">
                Daily ranked matches, quick summaries, and quiet mode to reduce noise — based on your service area, NAICS, and keywords.
              </div>
            </div>

            <div className="relative mt-5">
              <Link
                href={startSingleHref}
                className="block rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-center text-sm font-semibold text-white/80 hover:bg-white/10 hover:text-white"
              >
                Start Free Trial
              </Link>
              <div className="mt-2 text-center text-xs text-white/45">
                No credit card required • Cancel anytime
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
