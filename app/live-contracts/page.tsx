// app/live-contracts/page.tsx
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

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
  },
];

const TRADE_OPTIONS = [
  "All",
  "HVAC",
  "Plumbing",
  "Construction",
  "Landscaping",
  "Fire Alarm",
];

const STATE_OPTIONS = ["All", "CA", "TX", "FL", "NY", "NJ"];

function formatDate(dateString: string) {
  return new Date(`${dateString}T12:00:00`).toLocaleDateString("en-US", {
    month: "short",
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

export default function LiveContractsPage() {
  const [selectedTrade, setSelectedTrade] = useState("All");
  const [selectedState, setSelectedState] = useState("All");
  const [keyword, setKeyword] = useState("");

  const filtered = useMemo(() => {
    const q = keyword.trim().toLowerCase();

    return opportunities.filter((opp) => {
      const matchesTrade =
        selectedTrade === "All" || opp.trade === selectedTrade;

      const matchesState =
        selectedState === "All" || opp.state === selectedState;

      const matchesKeyword =
        q.length === 0 ||
        opp.title.toLowerCase().includes(q) ||
        opp.buyer.toLowerCase().includes(q) ||
        opp.city.toLowerCase().includes(q) ||
        opp.state.toLowerCase().includes(q) ||
        opp.trade.toLowerCase().includes(q) ||
        opp.summary.toLowerCase().includes(q);

      return matchesTrade && matchesState && matchesKeyword;
    });
  }, [selectedTrade, selectedState, keyword]);

  return (
    <main className="min-h-screen bg-[#EAF3FF] text-black">
      <section className="mx-auto max-w-[1240px] px-6 py-12 lg:px-10">
        <div className="mb-8">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#4E6FAE]">
            Live Contracts
          </p>

          <h1 className="max-w-4xl text-4xl font-semibold tracking-tight sm:text-5xl">
            Browse live contract opportunities.
          </h1>

          <p className="mt-4 max-w-3xl text-[15px] leading-7 text-black/70">
            A public view of active opportunities inside Ambit. Filter by
            trade, state, or keyword and open the official source directly from
            each card.
          </p>
        </div>

        <div className="mb-8 grid gap-3 rounded-[28px] border border-black/10 bg-white/75 p-4 shadow-sm md:grid-cols-3">
          <div>
            <label className="mb-2 block text-sm font-medium">Trade</label>
            <select
              value={selectedTrade}
              onChange={(e) => setSelectedTrade(e.target.value)}
              className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none"
            >
              {TRADE_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">State</label>
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none"
            >
              {STATE_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Keyword</label>
            <input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="HVAC, sidewalk, irrigation..."
              className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none"
            />
          </div>
        </div>

        <div className="mb-5 flex items-center justify-between">
          <p className="text-sm text-black/60">
            Showing {filtered.length} opportunit
            {filtered.length === 1 ? "y" : "ies"}
          </p>
        </div>

        <div className="grid gap-4">
          {filtered.map((opp) => {
            const daysLeft = getDaysLeft(opp.dueDate);

            return (
              <article
                key={opp.id}
                className="rounded-[28px] border border-black/10 bg-white p-6 shadow-sm"
              >
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                  <div className="max-w-3xl">
                    <div className="mb-3 flex flex-wrap gap-2">
                      <span className="rounded-full border border-black/10 px-3 py-1 text-xs font-medium">
                        {opp.trade}
                      </span>
                      <span className="rounded-full border border-black/10 px-3 py-1 text-xs font-medium">
                        {opp.city}, {opp.state}
                      </span>
                      <span className="rounded-full border border-black/10 px-3 py-1 text-xs font-medium">
                        {opp.source}
                      </span>
                    </div>

                    <h2 className="text-2xl font-semibold tracking-tight">
                      {opp.title}
                    </h2>

                    <p className="mt-2 text-sm font-medium text-black/65">
                      Buyer: {opp.buyer}
                    </p>

                    <p className="mt-3 text-[15px] leading-7 text-black/70">
                      {opp.summary}
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
                      {daysLeft > 0
                        ? `${daysLeft} day${daysLeft === 1 ? "" : "s"} left`
                        : "Closing soon"}
                    </p>

                    <div className="mt-4 flex flex-col gap-2">
                      <a
                        href={opp.officialUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center justify-center rounded-2xl bg-black px-4 py-3 text-sm font-medium text-white"
                      >
                        View Official Source
                      </a>

                      <Link
                        href={`/get-started?opportunity=${encodeURIComponent(
                          opp.title
                        )}`}
                        className="inline-flex items-center justify-center rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm font-medium"
                      >
                        Start With Ambit
                      </Link>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {filtered.length === 0 ? (
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