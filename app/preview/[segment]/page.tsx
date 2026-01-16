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
      sub: "This is a sample feed — one unlocked example shows the level of detail you’ll get. Start your free trial to unlock full matches and ongoing alerts.",
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
      sub: "This is a sample feed — one unlocked example shows the level of detail you’ll get. Start your free trial to unlock full matches and ongoing alerts.",
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
    sub: "This is a sample feed — one unlocked example shows the level of detail you’ll get. Start your free trial to unlock scoring, summaries, and ongoing alerts.",
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

const TRIAL_BANNER_TEXT =
  "7-day free trial - Try AMBIT free for 7 days - No credit card required - Cancel anytime - No spam";

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

  // default (lowest friction)
  const startSingleHref = "/get-started?plan=single";

  const t = TESTIMONIALS_BY_SEGMENT[segmentKey];

  return (
    <div className="mx-auto w-full max-w-7xl">
      {/* Trial banner */}
      <div className="mb-5 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[11px] font-semibold tracking-widest text-white/80">
              FREE TRIAL
            </span>
            <div className="text-xs font-semibold text-white/80">{TRIAL_BANNER_TEXT}</div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={startSingleHref}
              className="rounded-xl bg-[#1A4FA3] px-4 py-2 text-xs font-semibold text-white hover:bg-[#15428B]"
            >
              Start Free Trial
            </Link>
            <Link
              href="/pricing"
              className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold text-white/80 hover:bg-white/10 hover:text-white"
            >
              Pricing
            </Link>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="text-xs font-semibold tracking-widest text-white/50">
              {titleCase(segmentKey)}
            </div>

            <h1 className="mt-2 text-3xl font-bold leading-tight text-white md:text-4xl">
              {data.headline}
            </h1>

            <p className="mt-2 max-w-2xl text-sm text-white/70">{data.sub}</p>

            {/* Secondary banner line (tight + clean) */}
            <div className="mt-4 inline-flex flex-wrap items-center gap-2 text-xs text-white/70">
              <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1">
                7-day free trial
              </span>
              <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1">
                No credit card required
              </span>
              <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1">
                Cancel anytime
              </span>
              <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1">
                No spam
              </span>
            </div>
          </div>

          <div className="flex flex-col items-stretch gap-3 md:items-end">
            <div className="flex items-center gap-3">
              <Link
                href={startSingleHref}
                className="rounded-xl bg-[#1A4FA3] px-5 py-2 text-sm font-semibold text-white hover:bg-[#15428B]"
              >
                Start Free Trial
              </Link>
              <Link
                href="/pricing"
                className="rounded-xl border border-white/15 bg-white/5 px-5 py-2 text-sm font-semibold text-white/80 hover:bg-white/10 hover:text-white"
              >
                View Pricing
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ✅ Side-by-side (equal width) */}
      <div className="mt-8 grid gap-5 md:grid-cols-2">
        {/* Unlocked example */}
        <div className="relative rounded-2xl border border-white/10 bg-white/5 p-5">
          <div className="absolute right-4 top-4 text-lg">🔓</div>

          <div className="text-[11px] font-semibold tracking-widest text-white/55">
            UNLOCKED EXAMPLE
          </div>

          <div className="mt-2 text-lg font-bold text-white">{data.unlocked.title}</div>

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

        {/* Testimonial (same size as unlocked) */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <div className="text-[11px] font-semibold tracking-widest text-white/55">
            CUSTOMER TESTIMONIAL
          </div>

          <div className="mt-2 text-sm font-semibold text-white/85">
            Read the result, then unlock the matches.
          </div>

          <p className="mt-4 text-sm leading-relaxed text-white/80">“{t.quote}”</p>

          <div className="mt-4 text-xs text-white/60">
            <div className="font-semibold text-white/80">{t.name}</div>
            <div>
              {t.title} • {t.location}
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-2 sm:flex-row">
            <Link
              href={startSingleHref}
              className="flex-1 rounded-xl bg-[#1A4FA3] px-4 py-2 text-center text-sm font-semibold text-white hover:bg-[#15428B]"
            >
              Start Free Trial
            </Link>
            <Link
              href="/testimonials"
              className="flex-1 rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-center text-sm font-semibold text-white/80 hover:bg-white/10 hover:text-white"
            >
              Read More
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
