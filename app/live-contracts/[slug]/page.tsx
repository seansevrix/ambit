import Link from "next/link";
import { notFound } from "next/navigation";
import ShareOpportunityButton from "./ShareOpportunityButton";

type LiveOpportunity = {
  id: number | string;
  slug: string;
  title: string;
  buyer: string | null;
  location: string | null;
  state: string | null;
  category: string | null;
  status: string | null;
  noticeType: string | null;
  naics: string | null;
  postedDate: string | null;
  dueDate: string | null;
  summaryShort: string | null;
  summaryLong: string | null;
  source: string;
  sourceUrl: string;
};

const TRADE_LABELS: Record<string, string> = {
  janitorial: "Janitorial",
  landscaping: "Landscaping",
  "plumbing-hvac": "Plumbing & HVAC",
  electrical: "Electrical",
  security: "Security",
  "waste-management": "Waste Management",
  roofing: "Roofing",
  painting: "Painting",
  "logistics-supply-chain": "Logistics & Supply Chain",
  "office-admin": "Office Admin",
  "temporary-help": "Temporary Help",
  "office-supplies": "Office Supplies",
  warehousing: "Warehousing",
  "nursing-home-health": "Nursing & Home Health",
  "medical-equipment-rental": "Medical Equipment Rental",
  "environmental-remediation": "Environmental Remediation",
  "concrete-paving": "Concrete & Paving",
  "fire-alarm-access-control": "Fire Alarm & Access Control",
  "fencing-gates": "Fencing & Gates",
  "restoration-mitigation": "Restoration & Mitigation",
  "pest-control": "Pest Control",
};

function getBackendBaseUrl() {
  return (
    process.env.BACKEND_URL ||
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    "https://ambit-0dnp.onrender.com"
  );
}

async function fetchLiveContract(slug: string): Promise<LiveOpportunity | null> {
  const backendBase = getBackendBaseUrl();
  const url = new URL(
    `/engine/live-contracts/${encodeURIComponent(slug)}`,
    backendBase
  );

  try {
    const res = await fetch(url.toString(), {
      method: "GET",
      cache: "no-store",
      next: { revalidate: 0 },
    });

    if (res.status === 404) {
      return null;
    }

    if (!res.ok) {
      return null;
    }

    return (await res.json()) as LiveOpportunity;
  } catch {
    return null;
  }
}

function formatDate(date: string | null) {
  if (!date) return "TBD";
  return new Date(date).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function getDaysLeft(date: string | null) {
  if (!date) return null;

  const now = new Date();
  const due = new Date(date);
  due.setHours(23, 59, 59, 999);

  const diff = due.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function getTradeLabel(category: string | null) {
  if (!category) return "Opportunity";
  return TRADE_LABELS[category] || category;
}

function getLocationLabel(opportunity: LiveOpportunity) {
  if (opportunity.location) return opportunity.location;
  if (opportunity.state) return opportunity.state;
  return "Location TBD";
}

function buildFitNote(opportunity: LiveOpportunity) {
  const trade = getTradeLabel(opportunity.category);
  const location = getLocationLabel(opportunity);

  const parts = [
    `This opportunity fits the ${trade.toLowerCase()} lane`,
    location !== "Location TBD" ? `in ${location}` : null,
    opportunity.buyer ? `for ${opportunity.buyer}` : null,
    opportunity.naics ? `under NAICS ${opportunity.naics}` : null,
  ].filter(Boolean);

  return `${parts.join(" ")}. Public opportunity details are available now, and Ambit can help organize the front-end pursuit/admin side if you decide to move on it.`;
}

export default async function LiveContractDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const opportunity = await fetchLiveContract(slug);

  if (!opportunity) {
    notFound();
  }

  const daysLeft = getDaysLeft(opportunity.dueDate);
  const tradeLabel = getTradeLabel(opportunity.category);
  const locationLabel = getLocationLabel(opportunity);
  const overview =
    opportunity.summaryLong ||
    opportunity.summaryShort ||
    "Public opportunity details are available through the official source.";
  const fitNote = buildFitNote(opportunity);

  return (
    <main className="min-h-screen bg-[#EAF3FF] text-black">
      <section className="mx-auto max-w-[1100px] px-6 py-12 lg:px-10">
        <div className="mb-6">
          <Link
            href="/live-contracts"
            className="text-sm font-medium text-black/65 transition hover:text-black"
          >
            ← Back to Live Contracts
          </Link>
        </div>

        <div className="rounded-[32px] border border-black/10 bg-white p-7 shadow-sm sm:p-10">
          <div className="mb-5 flex flex-wrap gap-2">
            <span className="rounded-full border border-black/10 px-3 py-1 text-xs font-medium">
              {tradeLabel}
            </span>
            <span className="rounded-full border border-black/10 px-3 py-1 text-xs font-medium">
              {locationLabel}
            </span>
            <span className="rounded-full border border-black/10 px-3 py-1 text-xs font-medium">
              {opportunity.source === "sam.gov" ? "SAM.gov" : opportunity.source}
            </span>
          </div>

          <h1 className="max-w-4xl text-3xl font-semibold tracking-tight sm:text-5xl">
            {opportunity.title}
          </h1>

          <p className="mt-4 text-[15px] leading-7 text-black/70">
            {opportunity.summaryShort || overview}
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <div className="rounded-[24px] border border-black/10 bg-[#F8FBFF] p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-black/45">
                Buyer
              </p>
              <p className="mt-2 text-base font-semibold">
                {opportunity.buyer || "Public Agency"}
              </p>
            </div>

            <div className="rounded-[24px] border border-black/10 bg-[#F8FBFF] p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-black/45">
                Location
              </p>
              <p className="mt-2 text-base font-semibold">{locationLabel}</p>
            </div>

            <div className="rounded-[24px] border border-black/10 bg-[#F8FBFF] p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-black/45">
                Deadline
              </p>
              <p className="mt-2 text-base font-semibold">
                {formatDate(opportunity.dueDate)}
              </p>
              <p className="mt-1 text-sm text-black/60">
                {daysLeft === null
                  ? "Deadline TBD"
                  : daysLeft > 0
                  ? `${daysLeft} day${daysLeft === 1 ? "" : "s"} left`
                  : "Closing soon"}
              </p>
            </div>
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-[1.4fr_0.9fr]">
            <div className="rounded-[24px] border border-black/10 bg-white p-6">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#4E6FAE]">
                Opportunity Overview
              </p>
              <p className="mt-3 text-[15px] leading-7 text-black/70">
                {overview}
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {opportunity.noticeType ? (
                  <div className="rounded-2xl border border-black/10 bg-[#F8FBFF] p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-black/45">
                      Notice Type
                    </p>
                    <p className="mt-2 text-sm font-medium text-black">
                      {opportunity.noticeType}
                    </p>
                  </div>
                ) : null}

                {opportunity.naics ? (
                  <div className="rounded-2xl border border-black/10 bg-[#F8FBFF] p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-black/45">
                      NAICS
                    </p>
                    <p className="mt-2 text-sm font-medium text-black">
                      {opportunity.naics}
                    </p>
                  </div>
                ) : null}

                {opportunity.postedDate ? (
                  <div className="rounded-2xl border border-black/10 bg-[#F8FBFF] p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-black/45">
                      Posted
                    </p>
                    <p className="mt-2 text-sm font-medium text-black">
                      {formatDate(opportunity.postedDate)}
                    </p>
                  </div>
                ) : null}

                {opportunity.status ? (
                  <div className="rounded-2xl border border-black/10 bg-[#F8FBFF] p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-black/45">
                      Status
                    </p>
                    <p className="mt-2 text-sm font-medium text-black">
                      {opportunity.status}
                    </p>
                  </div>
                ) : null}
              </div>

              <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#4E6FAE]">
                Why It Fits
              </p>
              <p className="mt-3 text-[15px] leading-7 text-black/70">
                {fitNote}
              </p>
            </div>

            <div className="rounded-[24px] border border-black/10 bg-[#F8FBFF] p-6">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-black/45">
                Next Step
              </p>
              <p className="mt-3 text-[15px] leading-7 text-black/70">
                If you want help pursuing this opportunity, start with Ambit
                first. You can also copy this Ambit page link and share it
                directly with your team.
              </p>

              <div className="mt-5 flex flex-col gap-3">
                <Link
                  href={`/get-started?opportunity=${encodeURIComponent(
                    opportunity.title
                  )}`}
                  className="inline-flex items-center justify-center rounded-2xl bg-black px-4 py-3 text-sm font-medium text-white"
                >
                  Start With Ambit
                </Link>

                <ShareOpportunityButton slug={opportunity.slug} />

                <a
                  href={opportunity.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm font-medium transition hover:bg-black/[0.03]"
                >
                  View Official Source
                </a>
              </div>

              <p className="mt-3 text-xs leading-6 text-black/50">
                Full solicitation details are available through the official
                source link above.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}