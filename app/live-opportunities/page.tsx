import Link from "next/link";

export const dynamic = "force-dynamic"; // always render fresh (no caching)

type Opportunity = {
  id?: string;
  title?: string;
  location?: string;
  dueDate?: string;
  naics?: string;
  source?: string;
  segment?: string;
  url?: string;
  buyer?: string;
  value?: string;
};

const PRIMARY =
  "inline-flex items-center justify-center rounded-xl bg-[#1A4FA3] px-5 py-3 text-sm font-semibold text-white hover:bg-[#15428B]";
const SECONDARY =
  "inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10";

const DEMO: Opportunity[] = [
  {
    title: "Roof leak repair + shingle replacement",
    location: "San Diego, CA",
    dueDate: "Due in 6 days",
    naics: "238160",
    source: "Local",
    segment: "Residential",
    value: "$1.8k–$6.5k",
  },
  {
    title: "HVAC preventative maintenance (12-month)",
    location: "Carlsbad, CA",
    dueDate: "Due in 8 days",
    naics: "238220",
    source: "Facility RFP",
    segment: "Commercial",
    value: "$18k–$55k",
  },
  {
    title: "On-call hauling + disposal services",
    location: "Vista, CA",
    dueDate: "Due in 10 days",
    naics: "562111",
    source: "SAM.gov",
    segment: "Government",
    value: "$60k–$220k",
  },
  {
    title: "Electrical panel upgrade (commercial unit)",
    location: "Oceanside, CA",
    dueDate: "Due in 12 days",
    naics: "238210",
    source: "Bid request",
    segment: "Commercial",
    value: "$9k–$22k",
  },
  {
    title: "Janitorial services (multi-tenant office)",
    location: "San Marcos, CA",
    dueDate: "Due in 14 days",
    naics: "561720",
    source: "Property mgmt",
    segment: "Commercial",
    value: "$2.5k–$7k/mo",
  },
];

function badgeClasses(seg?: string) {
  const s = (seg || "").toLowerCase();
  if (s.includes("gov")) return "bg-emerald-600/10 text-emerald-200 border-emerald-500/20";
  if (s.includes("comm")) return "bg-indigo-600/10 text-indigo-200 border-indigo-500/20";
  return "bg-blue-600/10 text-blue-200 border-blue-500/20";
}

function safeListFromResponse(data: any): Opportunity[] {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.opportunities)) return data.opportunities;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.data)) return data.data;
  return [];
}

async function getOpportunities(): Promise<{ list: Opportunity[]; isDemo: boolean }> {
  const base =
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    process.env.BACKEND_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    "";

  if (!base) return { list: DEMO, isDemo: true };

  const url = `${base.replace(/\/$/, "")}/engine/opportunities`;

  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error(`status ${res.status}`);
    const data = await res.json();
    const list = safeListFromResponse(data);

    // Normalize a few common field names so cards don’t break
    const normalized = list.map((o: any) => ({
      id: o.id ?? o._id,
      title: o.title ?? o.name ?? o.opportunityTitle,
      location: o.location ?? o.place ?? o.city ?? o.state,
      dueDate: o.dueDate ?? o.due_date ?? o.responseDue ?? o.deadline,
      naics: o.naics ?? o.naicsCode ?? o.naics_code,
      source: o.source ?? o.portal ?? o.origin,
      segment: o.segment ?? o.market ?? o.category,
      url: o.url ?? o.link ?? o.opportunityUrl,
      buyer: o.buyer ?? o.agency ?? o.customer,
      value: o.value ?? o.estValue ?? o.estimatedValue,
    })) as Opportunity[];

    if (!normalized.length) return { list: DEMO, isDemo: true };

    // Show the newest-ish first if backend already returns sorted, great. If not, still fine.
    return { list: normalized.slice(0, 30), isDemo: false };
  } catch {
    return { list: DEMO, isDemo: true };
  }
}

export default async function LiveOpportunitiesPage() {
  const { list, isDemo } = await getOpportunities();

  return (
    <main className="min-h-[calc(100vh-64px)]">
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-[radial-gradient(1200px_600px_at_50%_-10%,rgba(110,168,255,0.35),transparent_60%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#08122B] via-[#070F22] to-[#060A16]" />

        <div className="relative mx-auto max-w-6xl px-6 py-14 sm:px-10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                Live Opportunities
              </h1>
              <p className="mt-2 text-sm text-white/70">
                Latest opportunities across residential, commercial, and government.
              </p>
              <div className="mt-2 text-xs text-white/60">
                Updated: {new Date().toLocaleString()}
                {isDemo ? " • Demo feed" : ""}
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href="/#preview" className={PRIMARY}>
                Send Me 3 Matches
              </Link>
              <Link href="/" className={SECONDARY}>
                Back to home
              </Link>
            </div>
          </div>

          <div className="mt-8 grid gap-4">
            {list.map((o, idx) => (
              <div
                key={o.id ?? `${o.title}-${idx}`}
                className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.03)] backdrop-blur"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span
                        className={`rounded-full border px-2 py-0.5 font-semibold ${badgeClasses(
                          o.segment
                        )}`}
                      >
                        {o.segment || "Opportunity"}
                      </span>
                      <span className="text-white/60">
                        {o.source ? `• ${o.source}` : ""}
                      </span>
                    </div>

                    <div className="mt-2 text-lg font-semibold text-white">
                      {o.title || "Untitled opportunity"}
                    </div>

                    <div className="mt-1 text-sm text-white/70">
                      {o.location ? o.location : "Location TBD"}
                      {o.dueDate ? ` • ${o.dueDate}` : ""}
                    </div>
                  </div>

                  <div className="shrink-0 rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-center">
                    <div className="text-[11px] font-semibold text-white/60">Est value</div>
                    <div className="mt-1 text-sm font-semibold text-white">
                      {o.value || "—"}
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid gap-2 text-xs text-white/70 sm:grid-cols-3">
                  <div>
                    <span className="text-white/45">NAICS:</span> {o.naics || "—"}
                  </div>
                  <div>
                    <span className="text-white/45">Buyer:</span> {o.buyer || "—"}
                  </div>
                  <div>
                    {o.url ? (
                      <a
                        className="text-white underline underline-offset-4"
                        href={o.url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        View details
                      </a>
                    ) : (
                      <span className="text-white/45">Link:</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {isDemo && (
            <div className="mt-6 text-xs text-white/55">
              This page is showing a demo feed right now. If you want it truly live, confirm your
              backend endpoint <span className="text-white/75">GET /engine/opportunities</span> is
              publicly reachable from Vercel.
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
