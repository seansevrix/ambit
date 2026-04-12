import Link from "next/link";
import Script from "next/script";

const TRADE_OPTIONS = [
  { value: "All", label: "All" },
  { value: "janitorial", label: "Janitorial" },
  { value: "landscaping", label: "Landscaping" },
  { value: "plumbing-hvac", label: "Plumbing & HVAC" },
  { value: "electrical", label: "Electrical" },
  { value: "security", label: "Security" },
  { value: "waste-management", label: "Waste Management" },
  { value: "roofing", label: "Roofing" },
  { value: "painting", label: "Painting" },
  { value: "logistics-supply-chain", label: "Logistics & Supply Chain" },
  { value: "office-admin", label: "Office Admin" },
  { value: "temporary-help", label: "Temporary Help" },
  { value: "office-supplies", label: "Office Supplies" },
  { value: "warehousing", label: "Warehousing" },
  { value: "nursing-home-health", label: "Nursing & Home Health" },
  { value: "medical-equipment-rental", label: "Medical Equipment Rental" },
  { value: "environmental-remediation", label: "Environmental Remediation" },
  { value: "concrete-paving", label: "Concrete & Paving" },
  { value: "fire-alarm-access-control", label: "Fire Alarm & Access Control" },
  { value: "fencing-gates", label: "Fencing & Gates" },
  { value: "restoration-mitigation", label: "Restoration & Mitigation" },
  { value: "pest-control", label: "Pest Control" },
] as const;

const TRADE_LABELS = Object.fromEntries(
  TRADE_OPTIONS.map((option) => [option.value, option.label])
) as Record<string, string>;

const STATE_OPTIONS = [
  { value: "All", label: "All States" },
  { value: "AL", label: "Alabama" },
  { value: "AK", label: "Alaska" },
  { value: "AZ", label: "Arizona" },
  { value: "AR", label: "Arkansas" },
  { value: "CA", label: "California" },
  { value: "CO", label: "Colorado" },
  { value: "CT", label: "Connecticut" },
  { value: "DE", label: "Delaware" },
  { value: "DC", label: "District of Columbia" },
  { value: "FL", label: "Florida" },
  { value: "GA", label: "Georgia" },
  { value: "HI", label: "Hawaii" },
  { value: "ID", label: "Idaho" },
  { value: "IL", label: "Illinois" },
  { value: "IN", label: "Indiana" },
  { value: "IA", label: "Iowa" },
  { value: "KS", label: "Kansas" },
  { value: "KY", label: "Kentucky" },
  { value: "LA", label: "Louisiana" },
  { value: "ME", label: "Maine" },
  { value: "MD", label: "Maryland" },
  { value: "MA", label: "Massachusetts" },
  { value: "MI", label: "Michigan" },
  { value: "MN", label: "Minnesota" },
  { value: "MS", label: "Mississippi" },
  { value: "MO", label: "Missouri" },
  { value: "MT", label: "Montana" },
  { value: "NE", label: "Nebraska" },
  { value: "NV", label: "Nevada" },
  { value: "NH", label: "New Hampshire" },
  { value: "NJ", label: "New Jersey" },
  { value: "NM", label: "New Mexico" },
  { value: "NY", label: "New York" },
  { value: "NC", label: "North Carolina" },
  { value: "ND", label: "North Dakota" },
  { value: "OH", label: "Ohio" },
  { value: "OK", label: "Oklahoma" },
  { value: "OR", label: "Oregon" },
  { value: "PA", label: "Pennsylvania" },
  { value: "RI", label: "Rhode Island" },
  { value: "SC", label: "South Carolina" },
  { value: "SD", label: "South Dakota" },
  { value: "TN", label: "Tennessee" },
  { value: "TX", label: "Texas" },
  { value: "UT", label: "Utah" },
  { value: "VT", label: "Vermont" },
  { value: "VA", label: "Virginia" },
  { value: "WA", label: "Washington" },
  { value: "WV", label: "West Virginia" },
  { value: "WI", label: "Wisconsin" },
  { value: "WY", label: "Wyoming" },
] as const;

type LiveOpportunity = {
  id: number | string;
  slug: string;
  title: string;
  buyer: string | null;
  location: string | null;
  state: string | null;
  category: string | null;
  dueDate: string | null;
  source: string;
  summaryShort: string | null;
  sourceUrl: string;
};

function getSingleValue(
  value: string | string[] | undefined,
  fallback = ""
): string {
  if (Array.isArray(value)) return value[0] ?? fallback;
  return value ?? fallback;
}

function formatDate(date: string | null) {
  if (!date) return "TBD";
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
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

function getDeadlineText(date: string | null) {
  const daysLeft = getDaysLeft(date);

  if (daysLeft === null) return "Deadline TBD";
  if (daysLeft <= 0) return "Closing soon";
  return `${daysLeft} day${daysLeft === 1 ? "" : "s"} left`;
}

function getTradeLabel(category: string | null) {
  if (!category) return "Opportunity";
  return TRADE_LABELS[category] || category;
}

function getBackendBaseUrl() {
  return (
    process.env.BACKEND_URL ||
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    "https://ambit-0dnp.onrender.com"
  );
}

async function fetchLiveContracts(params: {
  trade: string;
  state: string;
  keyword: string;
}) {
  const backendBase = getBackendBaseUrl();
  const url = new URL("/engine/live-contracts", backendBase);

  if (params.trade && params.trade !== "All") {
    url.searchParams.set("trade", params.trade);
  }

  if (params.state && params.state !== "All") {
    url.searchParams.set("state", params.state);
  }

  if (params.keyword.trim()) {
    url.searchParams.set("keyword", params.keyword.trim());
  }

  try {
    const res = await fetch(url.toString(), {
      method: "GET",
      cache: "no-store",
      next: { revalidate: 0 },
    });

    if (!res.ok) {
      return [];
    }

    const data = await res.json();

    if (Array.isArray(data)) return data as LiveOpportunity[];
    if (Array.isArray(data?.opportunities)) {
      return data.opportunities as LiveOpportunity[];
    }

    return [];
  } catch {
    return [];
  }
}

type SearchParamsShape = Promise<Record<string, string | string[] | undefined>>;

export default async function LiveContractsPage({
  searchParams,
}: {
  searchParams?: SearchParamsShape;
}) {
  const resolvedSearchParams = (await searchParams) ?? {};

  const selectedTrade = getSingleValue(resolvedSearchParams.trade, "All");
  const selectedState = getSingleValue(resolvedSearchParams.state, "All");
  const keyword = getSingleValue(resolvedSearchParams.keyword, "").trim();

  const opportunities = await fetchLiveContracts({
    trade: selectedTrade,
    state: selectedState,
    keyword,
  });

  return (
    <main className="min-h-screen bg-[#EAF3FF] text-black">
      <Script id="live-contract-share" strategy="afterInteractive">{`
        document.addEventListener("click", async function (event) {
          const target = event.target;
          if (!(target instanceof HTMLElement)) return;

          const button = target.closest("[data-live-share]");
          if (!(button instanceof HTMLButtonElement)) return;

          const shareUrl = button.getAttribute("data-share-url");
          const defaultLabel = button.getAttribute("data-default-label") || "Share";
          if (!shareUrl) return;

          try {
            if (navigator.share) {
              await navigator.share({ url: shareUrl });
              return;
            }

            await navigator.clipboard.writeText(shareUrl);
            button.textContent = "Ambit link copied";
            window.setTimeout(() => {
              button.textContent = defaultLabel;
            }, 2000);
          } catch {
            button.textContent = defaultLabel;
          }
        });
      `}</Script>

      <section className="mx-auto max-w-[1240px] px-6 py-12 lg:px-10">
        <div className="mb-8">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#4E6FAE]">
            Live Contracts
          </p>

          <h1 className="max-w-4xl text-4xl font-semibold tracking-tight sm:text-5xl">
            Browse live contract opportunities.
          </h1>

          <p className="mt-4 max-w-3xl text-[15px] leading-7 text-black/70">
            If you’re interested in pursuing an opportunity, contact{" "}
            <a
              href="mailto:ambit@sevrixgov.com"
              className="font-medium text-black underline underline-offset-4"
            >
              ambit@sevrixgov.com
            </a>{" "}
            to have an Ambit team member begin your pursuit.
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <a
              href="mailto:ambit@sevrixgov.com?subject=Ambit%20Live%20Contract%20Pursuit"
              className="inline-flex items-center justify-center rounded-2xl bg-black px-5 py-3 text-sm font-medium text-white"
            >
              Contact Ambit
            </a>

            <Link
              href="/get-started"
              className="inline-flex items-center justify-center rounded-2xl border border-black/10 bg-white px-5 py-3 text-sm font-medium transition hover:bg-black/[0.03]"
            >
              Get Started
            </Link>
          </div>
        </div>

        <form
          method="get"
          className="mb-8 grid gap-3 rounded-[28px] border border-black/10 bg-white/75 p-4 shadow-sm md:grid-cols-4"
        >
          <div>
            <label htmlFor="trade" className="mb-2 block text-sm font-medium">
              Trade
            </label>
            <select
              id="trade"
              name="trade"
              defaultValue={selectedTrade}
              className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none"
            >
              {TRADE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="state" className="mb-2 block text-sm font-medium">
              State
            </label>
            <select
              id="state"
              name="state"
              defaultValue={selectedState}
              className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none"
            >
              {STATE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="keyword" className="mb-2 block text-sm font-medium">
              Keyword
            </label>
            <input
              id="keyword"
              name="keyword"
              defaultValue={keyword}
              placeholder="HVAC, janitorial, irrigation..."
              className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none"
            />
          </div>

          <div className="flex items-end gap-2">
            <button
              type="submit"
              className="inline-flex w-full items-center justify-center rounded-2xl bg-black px-4 py-3 text-sm font-medium text-white"
            >
              Apply Filters
            </button>

            <Link
              href="/live-contracts"
              className="inline-flex items-center justify-center rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm font-medium transition hover:bg-black/[0.03]"
            >
              Reset
            </Link>
          </div>
        </form>

        <div className="mb-5 flex items-center justify-between">
          <p className="text-sm text-black/60">
            Showing {opportunities.length} opportunit
            {opportunities.length === 1 ? "y" : "ies"}
          </p>
        </div>

        <div className="grid gap-4">
          {opportunities.map((opp) => {
            const tradeLabel = getTradeLabel(opp.category);
            const locationText = opp.location || opp.state || "Location TBD";
            const summary =
              opp.summaryShort || "Active public opportunity available inside Ambit.";
            const shareUrl = `https://ambitco.app/live-contracts/${opp.slug}`;

            return (
              <article
                key={opp.id}
                className="rounded-[28px] border border-black/10 bg-white p-6 shadow-sm"
              >
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                  <div className="max-w-3xl">
                    <div className="mb-3 flex flex-wrap gap-2">
                      <span className="rounded-full border border-black/10 px-3 py-1 text-xs font-medium">
                        {tradeLabel}
                      </span>
                      <span className="rounded-full border border-black/10 px-3 py-1 text-xs font-medium">
                        {locationText}
                      </span>
                      <span className="rounded-full border border-black/10 px-3 py-1 text-xs font-medium">
                        {opp.source === "sam.gov" ? "SAM.gov" : opp.source}
                      </span>
                    </div>

                    <h2 className="text-2xl font-semibold tracking-tight">
                      {opp.title}
                    </h2>

                    <p className="mt-2 text-sm font-medium text-black/65">
                      Buyer: {opp.buyer || "Public Agency"}
                    </p>

                    <p className="mt-3 text-[15px] leading-7 text-black/70">
                      {summary}
                    </p>
                  </div>

                  <div className="w-full max-w-xs rounded-[24px] border border-black/10 bg-[#F8FBFF] p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-black/45">
                      Deadline
                    </p>
                    <p className="mt-1 text-lg font-semibold">
                      {formatDate(opp.dueDate)}
                    </p>
                    <p className="mt-1 text-sm text-black/60">
                      {getDeadlineText(opp.dueDate)}
                    </p>

                    <div className="mt-4 flex flex-col gap-2">
                      <Link
                        href={`/live-contracts/${opp.slug}`}
                        className="inline-flex items-center justify-center rounded-2xl bg-black px-4 py-3 text-sm font-medium text-white"
                      >
                        View in Ambit
                      </Link>

                      <button
                        type="button"
                        data-live-share="1"
                        data-share-url={shareUrl}
                        data-default-label="Share"
                        className="inline-flex items-center justify-center rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm font-medium transition hover:bg-black/[0.03]"
                      >
                        Share
                      </button>

                      <a
                        href={opp.sourceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center justify-center rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm font-medium transition hover:bg-black/[0.03]"
                      >
                        View Official Source
                      </a>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {opportunities.length === 0 ? (
          <div className="mt-8 rounded-[28px] border border-dashed border-black/10 bg-white/60 p-8 text-center">
            <p className="text-lg font-medium">No matches found.</p>
            <p className="mt-2 text-sm text-black/60">
              Try a different trade, state, or keyword.
            </p>
          </div>
        ) : null}
      </section>
    </main>
  );
}