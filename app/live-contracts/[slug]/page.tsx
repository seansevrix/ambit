import Link from "next/link";
import { notFound } from "next/navigation";

type Opportunity = {
  id: string;
  slug: string;
  title: string;
  buyer: string;
  city: string;
  state: string;
  trade: string;
  dueDate: string;
  source: string;
  summary: string;
  officialUrl: string;
  fitNote: string;
};

const opportunities: Opportunity[] = [
  {
    id: "1",
    slug: "houston-isd-hvac-makeup-air-units",
    title: "Hattie Mae White Admin Building HVAC Makeup Air Units Replacement",
    buyer: "Houston ISD",
    city: "Houston",
    state: "TX",
    trade: "HVAC",
    dueDate: "2026-04-28",
    source: "Public RFP",
    summary:
      "Replacement of makeup air units, test and balance, and BAS controls work for the administration building.",
    officialUrl:
      "https://media.governmentnavigator.com/media/bid/1774884212_26-03-09.pdf",
    fitNote:
      "This opportunity aligns well with commercial HVAC equipment and controls work in the Houston market.",
  },
  {
    id: "2",
    slug: "murrieta-citywide-sidewalk-replacement-2026",
    title: "Citywide Sidewalk Replacement Program 2026",
    buyer: "City of Murrieta",
    city: "Murrieta",
    state: "CA",
    trade: "Construction",
    dueDate: "2026-04-30",
    source: "PlanetBids",
    summary:
      "Citywide sidewalk replacement and related concrete improvements under MSD Project No. 26-003 / CIP No. 13064.",
    officialUrl:
      "https://vendors.planetbids.com/portal/17992/bo/bo-detail/140670",
    fitNote:
      "This is a strong fit for local California concrete and public works contractors handling sidewalk and related improvements.",
  },
  {
    id: "3",
    slug: "plano-median-renovation-15th-street",
    title: "Median Renovation – 15th Street",
    buyer: "City of Plano",
    city: "Plano",
    state: "TX",
    trade: "Landscaping",
    dueDate: "2026-04-29",
    source: "IonWave",
    summary:
      "Median renovation work including tree removal, boring, irrigation improvements, controllers, and new trees.",
    officialUrl:
      "https://planotx.ionwave.net/PublicDetail.aspx?bidID=2222&SourceType=1",
    fitNote:
      "This opportunity fits exterior site improvement and landscape-related contractors operating in the DFW market.",
  },
];

function formatDate(dateString: string) {
  return new Date(`${dateString}T12:00:00`).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function getDaysLeft(dateString: string) {
  const now = new Date();
  const due = new Date(`${dateString}T23:59:59`);
  const diff = due.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export default async function LiveContractDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const opportunity = opportunities.find((item) => item.slug === slug);

  if (!opportunity) {
    notFound();
  }

  const daysLeft = getDaysLeft(opportunity.dueDate);

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
              {opportunity.trade}
            </span>
            <span className="rounded-full border border-black/10 px-3 py-1 text-xs font-medium">
              {opportunity.city}, {opportunity.state}
            </span>
            <span className="rounded-full border border-black/10 px-3 py-1 text-xs font-medium">
              {opportunity.source}
            </span>
          </div>

          <h1 className="max-w-4xl text-3xl font-semibold tracking-tight sm:text-5xl">
            {opportunity.title}
          </h1>

          <p className="mt-4 text-[15px] leading-7 text-black/70">
            {opportunity.summary}
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <div className="rounded-[24px] border border-black/10 bg-[#F8FBFF] p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-black/45">
                Buyer
              </p>
              <p className="mt-2 text-base font-semibold">{opportunity.buyer}</p>
            </div>

            <div className="rounded-[24px] border border-black/10 bg-[#F8FBFF] p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-black/45">
                Location
              </p>
              <p className="mt-2 text-base font-semibold">
                {opportunity.city}, {opportunity.state}
              </p>
            </div>

            <div className="rounded-[24px] border border-black/10 bg-[#F8FBFF] p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-black/45">
                Deadline
              </p>
              <p className="mt-2 text-base font-semibold">
                {formatDate(opportunity.dueDate)}
              </p>
              <p className="mt-1 text-sm text-black/60">
                {daysLeft > 0
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
                {opportunity.summary}
              </p>

              <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#4E6FAE]">
                Why It Fits
              </p>
              <p className="mt-3 text-[15px] leading-7 text-black/70">
                {opportunity.fitNote}
              </p>
            </div>

            <div className="rounded-[24px] border border-black/10 bg-[#F8FBFF] p-6">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-black/45">
                Next Step
              </p>
              <p className="mt-3 text-[15px] leading-7 text-black/70">
                Review the official source, then start with Ambit if you want
                help handling the front-end admin and proposal build.
              </p>

              <div className="mt-5 flex flex-col gap-3">
                <a
                  href={opportunity.officialUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center rounded-2xl bg-black px-4 py-3 text-sm font-medium text-white"
                >
                  View Official Source
                </a>

                <Link
                  href={`/get-started?opportunity=${encodeURIComponent(
                    opportunity.title
                  )}`}
                  className="inline-flex items-center justify-center rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm font-medium"
                >
                  Start With Ambit
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}