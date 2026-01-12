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

function LockedCard({ index }: { index: number }) {
  return (
    <div className="relative rounded-2xl border border-white/10 bg-white/5 p-5">
      <div className="absolute right-4 top-4 text-lg">🔒</div>
      <div className="text-sm font-semibold text-white/80">Locked opportunity #{index}</div>
      <div className="mt-2 text-xs text-white/55">
        Start your trial to unlock full details, scoring, and matches.
      </div>
      <div className="mt-4 h-2 w-2/3 rounded bg-white/10" />
      <div className="mt-2 h-2 w-1/2 rounded bg-white/10" />
      <div className="mt-2 h-2 w-3/4 rounded bg-white/10" />
    </div>
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

  // ✅ Default plan for this preview page = "single" (lowest friction)
  // (If you want segment-specific default, tell me and I’ll switch it.)
  const startSingleHref = "/get-started?plan=single";
  const startAllHref = "/get-started?plan=all";

  return (
    <div className="mx-auto w-full max-w-7xl">
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

            {/* ✅ NEW: quick pricing clarity */}
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-slate-950/20 p-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold text-white">Single market</div>
                  <div className="text-sm font-bold text-white tabular-nums">$39.99/mo</div>
                </div>
                <div className="mt-1 text-xs text-white/65">
                  Track 1 lead type (choose Residential OR Commercial OR Government).
                </div>
              </div>

              <div className="rounded-2xl border border-blue-400/25 bg-blue-500/10 p-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold text-white">All markets</div>
                  <div className="text-sm font-bold text-white tabular-nums">$59.99/mo</div>
                </div>
                <div className="mt-1 text-xs text-white/70">
                  Track all 3 lead types for maximum coverage.
                </div>
              </div>
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

            <Link
              href={startAllHref}
              className="text-xs font-semibold text-white/70 underline decoration-white/20 underline-offset-4 hover:text-white hover:decoration-white/50"
            >
              Want all 3 markets? Start $59.99 plan →
            </Link>
          </div>
        </div>
      </div>

      {/* Cards */}
      <div className="mt-8 grid gap-5 md:grid-cols-3">
        {/* Unlocked */}
        <div className="relative rounded-2xl border border-white/10 bg-white/5 p-5 md:col-span-2">
          <div className="absolute right-4 top-4 text-lg">🔓</div>

          <div className="text-xs font-semibold text-white/55">UNLOCKED EXAMPLE</div>
          <div className="mt-2 text-xl font-bold text-white">{data.unlocked.title}</div>

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

          <p className="mt-4 text-sm leading-relaxed text-white/75">{data.unlocked.summary}</p>

          <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
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

            <Link
              href={startAllHref}
              className="text-xs font-semibold text-white/70 underline decoration-white/20 underline-offset-4 hover:text-white hover:decoration-white/50"
            >
              Prefer full coverage? $59.99/mo →
            </Link>
          </div>
        </div>

        {/* Locked column */}
        <div className="grid gap-5">
          <LockedCard index={1} />
          <LockedCard index={2} />
          <LockedCard index={3} />
        </div>
      </div>
    </div>
  );
}
