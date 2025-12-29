import Link from "next/link";
import type { ReactNode } from "react";

type Opportunity = {
  id?: number | string;
  title?: string;
  location?: string;
  naics?: string;
  createdAt?: string;
};

type FeaturedOpportunity = {
  title: string;
  agency: string;
  solicitationId: string;
  setAside: string;
  location: string;
  naics: string;
  postedDateISO: string;
  dueDateISO: string;
  estimatedValue: string;
  pop: string;
  summary4: string; // exactly 4 sentences
  deliverables: string[];
  submissionMethod: string;
};

const PRIMARY =
  "inline-flex items-center justify-center rounded-xl bg-[#1A4FA3] px-5 py-3 text-sm font-semibold text-white hover:bg-[#15428B]";
const SECONDARY =
  "inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10";

// ✅ Important: set NEXT_PUBLIC_API_BASE_URL on Vercel to your Render backend
// Fallback to Render so production never points at localhost.
const API_BASE = (
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_BASE ||
  "https://ambit-0dnp.onrender.com"
).replace(/\/$/, "");

async function getOpportunities(): Promise<Opportunity[]> {
  try {
    const res = await fetch(`${API_BASE}/engine/opportunities`, {
      // ✅ Reduce cold-start pain; still “fresh enough” for a preview feed
      next: { revalidate: 60 },
    });

    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function normalize(o: any): Opportunity {
  return {
    id: o?.id,
    title: typeof o?.title === "string" ? o.title.trim() : "",
    location: typeof o?.location === "string" ? o.location.trim() : "",
    naics: typeof o?.naics === "string" ? o.naics.trim() : "",
    createdAt: typeof o?.createdAt === "string" ? o.createdAt : undefined,
  };
}

function keyOf(o: Opportunity) {
  return `${(o.title || "").toLowerCase()}|${(o.location || "").toLowerCase()}|${(o.naics || "").toLowerCase()}`;
}

function dedupe(list: Opportunity[]) {
  const seen = new Set<string>();
  const out: Opportunity[] = [];
  for (const item of list) {
    const k = keyOf(item);
    if (!k || k === "||") continue;
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(item);
  }
  return out;
}

function shuffle<T>(arr: T[]) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function withinLast12Months(iso?: string) {
  if (!iso) return true;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return true;
  const now = Date.now();
  const yearMs = 365 * 24 * 60 * 60 * 1000;
  return now - d.getTime() <= yearMs;
}

function maskLocation(location?: string) {
  if (!location) return "Locked";
  const parts = location.split(",");
  const city = parts[0]?.trim() || "Locked";
  return `${city}, **`;
}

function maskNaics(naics?: string) {
  if (!naics) return "Locked";
  const s = String(naics).replace(/\D/g, "");
  if (s.length < 2) return "Locked";
  return `${s.slice(0, 2)}XXXX`;
}

function fmtDate(iso?: string) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

const FEATURED_UNLOCKED: FeaturedOpportunity = {
  title: "Parking Lot Resurfacing + Striping (Base Access)",
  agency: "U.S. Department of Defense (Example Preview)",
  solicitationId: "AMBIT-PREV-237310-0001",
  setAside: "Small Business (Preview Example)",
  location: "San Diego, CA",
  naics: "237310",
  postedDateISO: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
  dueDateISO: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString(),
  estimatedValue: "$65,000 – $95,000 (est.)",
  pop: "1–2 weeks after award (night work possible)",
  summary4:
    "Resurface an existing asphalt parking lot and restripe stalls to current layout requirements. Scope includes milling/patching, asphalt overlay, and re-striping with compliant paint and markings. Contractor must coordinate base access, safety controls, and work windows to minimize disruption. Deliverables include a simple work plan, schedule, and closeout photos with as-built striping notes.",
  deliverables: [
    "Work plan + schedule",
    "Traffic/safety plan (as required)",
    "Closeout photos + as-built notes",
    "Warranty info (if applicable)",
  ],
  submissionMethod: "Online portal submission (details shown after subscribe)",
};

const SAMPLE_PREVIEW: Opportunity[] = [
  { title: "HVAC Preventive Maintenance (Federal Facility)", location: "San Diego, CA", naics: "238220", createdAt: new Date().toISOString() },
  { title: "Electrical Panel Upgrade + Load Testing", location: "Oceanside, CA", naics: "238210", createdAt: new Date().toISOString() },
  { title: "Chain Link Fence Repair / Replacement", location: "Chula Vista, CA", naics: "238990", createdAt: new Date().toISOString() },
  { title: "Diesel Generator Rental + Fuel Service", location: "Norfolk, VA", naics: "532490", createdAt: new Date().toISOString() },
  { title: "Portable Restroom Rentals (Monthly)", location: "Phoenix, AZ", naics: "562991", createdAt: new Date().toISOString() },
  { title: "Concrete Sidewalk Replacement (ADA)", location: "Escondido, CA", naics: "238110", createdAt: new Date().toISOString() },
  { title: "Landscaping + Grounds Maintenance", location: "Honolulu, HI", naics: "561730", createdAt: new Date().toISOString() },
  { title: "Roof Leak Repair + Preventive Inspection", location: "Riverside, CA", naics: "238160", createdAt: new Date().toISOString() },
  { title: "Interior Painting (Office Refresh)", location: "Irvine, CA", naics: "238320", createdAt: new Date().toISOString() },
  { title: "Forklift Rental (10k–12k lbs) + Delivery", location: "Bremerton, WA", naics: "532490", createdAt: new Date().toISOString() },
  { title: "Janitorial Services (Nightly)", location: "Las Vegas, NV", naics: "561720", createdAt: new Date().toISOString() },
];

export default async function OpportunitiesPreviewPage() {
  const raw = await getOpportunities();
  const uniqueReal = dedupe(raw.map(normalize)).filter((o) => withinLast12Months(o.createdAt));
  const combined = shuffle(uniqueReal).concat(shuffle(SAMPLE_PREVIEW));

  // 1 unlocked featured + 10 locked
  const lockedList = dedupe(combined).slice(0, 10);

  return (
    <div className="space-y-10">
      <section className="rounded-3xl border border-white/10 bg-white/5 p-10">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="inline-flex items-center rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold text-white/80">
              PREVIEW
            </div>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white">
              Opportunities Preview
            </h1>
            <p className="mt-3 max-w-2xl text-sm text-white/70">
              We’ve unlocked one example so you can see exactly what you’ll get. Everything else
              stays locked until you subscribe.
            </p>

            <div className="mt-4 rounded-xl border border-amber-300/20 bg-amber-200/10 px-4 py-3 text-sm text-amber-50">
              <span className="font-semibold">Disclaimer:</span>{" "}
              Verify all details on the official source before bidding.
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/get-started" className={PRIMARY}>
              Unlock Full Access
            </Link>
            <Link href="/login" className={SECONDARY}>
              Log In
            </Link>
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <Pill label="Full details + attachments" />
          <Pill label="Deadlines + reminders" />
          <Pill label="Match score + next steps" />
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/5 p-10">
        <div className="mb-5 flex items-center justify-between">
          <div className="text-sm font-semibold text-white">Featured unlocked example</div>
          <div className="text-xs text-white/60">1 item unlocked • {lockedList.length} locked</div>
        </div>

        <UnlockedCard o={FEATURED_UNLOCKED} />
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/5 p-10">
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold text-white">Preview feed (locked)</div>
          <div className="text-xs text-white/60">Showing {lockedList.length} locked items</div>
        </div>

        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          {lockedList.map((o, idx) => (
            <LockedCard key={String(o.id ?? `${keyOf(o)}|${idx}`)} o={o} />
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-[#0B1430]/45 p-10">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-xs font-semibold text-white/70">READY</div>
            <h2 className="mt-2 text-2xl font-semibold text-white">
              Unlock the full feed + match scoring.
            </h2>
            <p className="mt-2 text-sm text-white/70">
              Get ranked opportunities, clear next steps, and a history dashboard.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/get-started" className={PRIMARY}>
              Get Started
            </Link>
            <Link href="/login" className={SECONDARY}>
              Log In
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function Pill({ label }: { label: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#0B1430]/40 px-5 py-4">
      <div className="text-xs font-semibold text-white/80">Included</div>
      <div className="mt-1 text-sm text-white/70">{label}</div>
    </div>
  );
}

function UnlockedCard({ o }: { o: FeaturedOpportunity }) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/12 bg-gradient-to-b from-white/8 to-white/5 p-8">
      <div className="absolute right-5 top-5">
        <div className="flex items-center gap-2 rounded-full border border-emerald-300/25 bg-emerald-200/10 px-3 py-1 text-xs font-semibold text-emerald-50 shadow-sm">
          <span aria-hidden="true">🔓</span>
          <span>Unlocked preview</span>
        </div>
      </div>

      <div className="text-xl font-semibold text-white">{o.title}</div>

      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs font-semibold text-white/80">
        <Chip>Agency: {o.agency}</Chip>
        <Chip>Solicitation: {o.solicitationId}</Chip>
        <Chip>Set-aside: {o.setAside}</Chip>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs font-semibold text-white/75">
        <Chip>Location: {o.location}</Chip>
        <Chip>NAICS: {o.naics}</Chip>
        <Chip>Posted: {fmtDate(o.postedDateISO)}</Chip>
        <Chip>Due: {fmtDate(o.dueDateISO)}</Chip>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-[#0B1430]/35 p-5 lg:col-span-2">
          <div className="text-xs font-semibold text-white/75">Summary</div>
          <p className="mt-2 text-sm leading-relaxed text-white/80">{o.summary4}</p>

          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            <div className="rounded-xl border border-white/10 bg-white/5 p-3">
              <div className="text-xs font-semibold text-white/75">Estimated value</div>
              <div className="mt-1 text-sm font-semibold text-white">{o.estimatedValue}</div>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/5 p-3">
              <div className="text-xs font-semibold text-white/75">Period of performance</div>
              <div className="mt-1 text-sm font-semibold text-white">{o.pop}</div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#0B1430]/35 p-5">
          <div className="text-xs font-semibold text-white/75">Deliverables</div>
          <ul className="mt-2 space-y-2 text-sm text-white/80">
            {o.deliverables.map((d) => (
              <li key={d} className="flex gap-2">
                <span className="mt-[2px] h-2 w-2 rounded-full bg-white/30" />
                <span>{d}</span>
              </li>
            ))}
          </ul>

          <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-3">
            <div className="text-xs font-semibold text-white/75">Submission</div>
            <div className="mt-1 text-sm font-semibold text-white">{o.submissionMethod}</div>
          </div>

          <div className="mt-4 flex flex-col gap-2">
            <Link href="/get-started" className={PRIMARY}>
              Unlock full details
            </Link>
            <Link href="/get-started" className={SECONDARY}>
              Get matched to your trade
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function LockedCard({ o }: { o: Opportunity }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0B1430]/40 p-6">
      <div className="absolute right-4 top-4">
        <div className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[11px] font-semibold text-white/75 shadow-sm">
          🔒 Locked
        </div>
      </div>

      <div className="text-base font-semibold text-white">{o.title || "Untitled opportunity"}</div>

      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs font-semibold text-white/75">
        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
          Location: {maskLocation(o.location)}
        </span>
        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
          NAICS: {maskNaics(o.naics)}
        </span>
        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
          Posted: Locked
        </span>
        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
          Due: Locked
        </span>
      </div>

      <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="flex items-center justify-between">
          <div className="text-xs font-semibold text-white/75">Locked details</div>
          <span className="rounded-full border border-white/15 bg-white/5 px-2.5 py-1 text-[11px] font-semibold text-white/75">
            Subscribe to unlock
          </span>
        </div>

        <div className="relative mt-3">
          <div className="space-y-2 opacity-70">
            <div className="h-3 w-full rounded bg-white/10" />
            <div className="h-3 w-11/12 rounded bg-white/10" />
            <div className="h-3 w-10/12 rounded bg-white/10" />
            <div className="h-3 w-8/12 rounded bg-white/10" />
          </div>

          <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-40 [mask-image:linear-gradient(to_bottom,transparent,black,transparent)]" />

          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="rounded-xl border border-white/10 bg-[#0B1430]/80 px-4 py-2 text-xs font-semibold text-white shadow-sm">
              Full summary + deadlines + attachments hidden
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <Link href="/get-started" className={PRIMARY}>
            Unlock this opportunity
          </Link>
          <Link href="/get-started" className={SECONDARY}>
            Get matched to your trade
          </Link>
        </div>
      </div>
    </div>
  );
}

function Chip({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
      {children}
    </span>
  );
}
