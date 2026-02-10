import Link from "next/link";

export const dynamic = "force-dynamic";

type Segment = "Residential" | "Commercial" | "Government";

type Opportunity = {
  title: string;
  location: string;
  segment: Segment;
  source: string;
  value?: string;
  naics?: string;
  buyer?: string;
  scope?: string;
};

const PRIMARY =
  "inline-flex items-center justify-center rounded-xl bg-[#1A4FA3] px-5 py-3 text-sm font-semibold text-white hover:bg-[#15428B]";
const SECONDARY =
  "inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10";

const OPPORTUNITIES: Opportunity[] = [
  // GOVERNMENT (SAM/Federal)
  {
    segment: "Government",
    source: "SAM.gov",
    title: "Pavement Rehabilitation at Auto Plaza Drive",
    location: "Loma Linda, CA",
    value: "$450,000 – $1,000,000",
    naics: "237310",
    buyer: "CITY OF LOMA LINDA - PUBLIC WORKS",
  },
  {
    segment: "Government",
    source: "SAM.gov",
    title: "On-Call Geotechnical and Special Inspection Services",
    location: "Los Angeles County, CA",
    value: "$2,000,000+ (Multiple Awards)",
    naics: "541330",
    buyer: "LA COUNTY DEPT OF PUBLIC WORKS",
  },
  {
    segment: "Government",
    source: "SAM.gov",
    title: "Potable Water Storage Reservoir Cleaning & Repair",
    location: "Pittsburg, CA",
    value: "$150,000 – $300,000",
    naics: "237110",
    buyer: "CITY OF PITTSBURG - WATER DIVISION",
  },
  {
    segment: "Government",
    source: "SAM.gov",
    title: "CDBG ADA Curb Ramp Installation Project",
    location: "Contra Costa County, CA",
    value: "$500,000",
    naics: "238110",
    buyer: "DEPT OF HOUSING AND URBAN DEVELOPMENT (LOCAL CDBG OFFICE)",
  },
  {
    segment: "Government",
    source: "SAM.gov",
    title: "Airport Strategic Communications & Public Relations",
    location: "Palm Springs, CA",
    value: "Undisclosed (RFP)",
    naics: "541820",
    buyer: "PALM SPRINGS INTERNATIONAL AIRPORT (PSP)",
  },

  // COMMERCIAL
  {
    segment: "Commercial",
    source: "Commercial",
    title: "Facility Maintenance & HVAC Service Agreement",
    location: "Regional Medical Center, IL",
    value: "$85,000 / annually",
    buyer: "TRINITY HEALTHCARE SYSTEMS",
    scope: "Quarterly inspections and 24/7 emergency repair for rooftop units.",
  },
  {
    segment: "Commercial",
    source: "Commercial",
    title: "Janitorial & Post-Construction Cleanup",
    location: "New Mixed-Use Development, Austin, TX",
    value: "$45,000 (Initial Phase)",
    buyer: "GREYSTAR REAL ESTATE PARTNERS",
    scope: "Final interior cleaning for 40,000 sq. ft. retail/office space.",
  },
  {
    segment: "Commercial",
    source: "Commercial",
    title: "Quarterly Landscape & Lighting Assessment",
    location: "The Shoppes at Webb Gin, Snellville, GA",
    value: "$12,000 / quarter",
    buyer: "SITE CENTERS CORP",
    scope: "Irrigation management, seasonal planting, and LED exterior lighting audit.",
  },
  {
    segment: "Commercial",
    source: "Commercial",
    title: "On-Call Security & Access Control Maintenance",
    location: "Data Center Complex, Ashburn, VA",
    value: "$250,000 (3-year term)",
    buyer: "DIGITAL REALTY TRUST",
    scope: "Maintenance of biometric scanners, CCTV, and perimeter fencing.",
  },
  {
    segment: "Commercial",
    source: "Commercial",
    title: "Fleet Maintenance & Towing Services",
    location: "Logistics Distribution Hub, Memphis, TN",
    value: "$120,000 / annually",
    buyer: "FEDEX GROUND OPERATIONS",
    scope: "Preventive maintenance for 30 Class-8 tractors and on-call roadside assistance.",
  },

  // RESIDENTIAL
  {
    segment: "Residential",
    source: "Residential",
    title: "Backyard Renovation & Grading Project",
    location: "Private Residence, San Diego, CA",
    value: "$50,000",
    buyer: "PRIVATE HOMEOWNER",
    scope: "Correcting drainage issues, raising grade, and installing a 400 sq. ft. paver patio.",
  },
  {
    segment: "Residential",
    source: "Residential",
    title: "Kitchen & Master Suite Remodel",
    location: "Historic District, Charleston, SC",
    value: "$115,000",
    buyer: "PRIVATE HOMEOWNER",
    scope: "Full gut renovation of 1920s kitchen and addition of a walk-in wet room.",
  },
  {
    segment: "Residential",
    source: "Residential",
    title: "Multi-Unit Roof Replacement (HOA)",
    location: "Silver Lakes Community, Miramar, FL",
    value: "$320,000",
    buyer: "SILVER LAKES HOMEOWNERS ASSOCIATION",
    scope: "Full tear-off and replacement of asphalt shingles for 12 townhome units.",
  },
  {
    segment: "Residential",
    source: "Residential",
    title: "Custom Hardscape & Xeriscaping Design",
    location: "Desert Highlands, Scottsdale, AZ",
    value: "$25,000 – $35,000",
    buyer: "PRIVATE HOMEOWNER",
    scope: "Drought-tolerant plants, drip irrigation, and natural stone walkways.",
  },
  {
    segment: "Residential",
    source: "Residential",
    title: "Whole-Home Standby Generator Installation",
    location: "Woodlands Neighborhood, Houston, TX",
    value: "$15,000",
    buyer: "PRIVATE HOMEOWNER",
    scope: "Install 22kW Generac system, automatic transfer switch, and gas line extension.",
  },
];

function badgeClasses(seg: Segment) {
  if (seg === "Government") return "bg-emerald-600/10 text-emerald-200 border-emerald-500/20";
  if (seg === "Commercial") return "bg-indigo-600/10 text-indigo-200 border-indigo-500/20";
  return "bg-blue-600/10 text-blue-200 border-blue-500/20";
}

function interleave(opps: Opportunity[]) {
  const buckets: Record<Segment, Opportunity[]> = {
    Residential: [],
    Commercial: [],
    Government: [],
  };

  for (const o of opps) buckets[o.segment].push(o);

  const order: Segment[] = ["Residential", "Commercial", "Government"];
  const out: Opportunity[] = [];

  let added = true;
  while (added) {
    added = false;
    for (const seg of order) {
      const next = buckets[seg].shift();
      if (next) {
        out.push(next);
        added = true;
      }
    }
  }

  return out;
}

const SORTED = interleave(OPPORTUNITIES);

export default function LiveOpportunitiesPage() {
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
                A preview of current opportunities across Residential, Commercial, and Government.
              </p>
              <div className="mt-2 text-xs text-white/60">
                Updated: {new Date().toLocaleString()}
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
            {SORTED.map((o, idx) => (
              <div
                key={`${o.segment}-${o.title}-${idx}`}
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
                        {o.segment}
                      </span>
                      <span className="text-white/60">• {o.source}</span>
                    </div>

                    <div className="mt-2 text-lg font-semibold text-white">{o.title}</div>

                    <div className="mt-1 text-sm text-white/70">{o.location}</div>

                    {o.scope ? (
                      <div className="mt-2 text-sm text-white/65">{o.scope}</div>
                    ) : null}
                  </div>

                  <div className="shrink-0 rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-center">
                    <div className="text-[11px] font-semibold text-white/60">Est value</div>
                    <div className="mt-1 text-sm font-semibold text-white">{o.value || "—"}</div>
                  </div>
                </div>

                <div className="mt-4 grid gap-2 text-xs text-white/70 sm:grid-cols-3">
                  <div>
                    <span className="text-white/45">NAICS:</span> {o.naics || "—"}
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-white/45">Buyer:</span> {o.buyer || "—"}
                  </div>
                </div>

                <div className="mt-4 rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-xs text-white/70">
                  Full details are available for active subscribers.
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center text-xs text-white/60">
            Want these daily and fully unlocked?{" "}
            <Link href="/get-started" className="text-white underline underline-offset-4">
              Choose plan
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
