"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import AmbitMark from "../components/AmbitMark";

const API_BASE =
  (process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_BASE ||
    "http://localhost:5001")?.replace(/\/$/, "");

async function postJson(url: string, body: any) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({}));
  return { res, json };
}

type Opportunity = {
  title?: string;
  location?: string;
  naics?: string;
  keywords?: string | null;
  summary?: string | null;
  createdAt?: string;
};

async function getOpportunities(signal?: AbortSignal): Promise<Opportunity[]> {
  try {
    const res = await fetch(`${API_BASE}/engine/opportunities`, {
      cache: "no-store",
      signal,
    });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function norm(s?: string) {
  return (s || "").toLowerCase().trim();
}

function parseServiceArea(input: string) {
  const parts = input.split(",");
  const city = (parts[0] || "").trim();
  const state = (parts[1] || "").trim();
  return { city, state };
}

function splitKeywords(input: string) {
  return input
    .split(",")
    .map((k) => k.trim())
    .filter(Boolean)
    .slice(0, 12);
}

function withinLast12Months(iso?: string) {
  if (!iso) return true;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return true;
  const now = Date.now();
  const yearMs = 365 * 24 * 60 * 60 * 1000;
  return now - d.getTime() <= yearMs;
}

function sanitizeNaics(input: string) {
  // digits only, max 6
  return input.replace(/[^\d]/g, "").slice(0, 6);
}

function isValidNaics(input: string) {
  // allow 2–6 digits (prefix matching is useful), but recommend full 6
  return /^\d{2,6}$/.test(input);
}

export default function GetStartedPage() {
  const router = useRouter();

  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [serviceArea, setServiceArea] = useState("");
  const [naics, setNaics] = useState("");
  const [keywords, setKeywords] = useState("");

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const [naicsTouched, setNaicsTouched] = useState(false);

  const [matchCount, setMatchCount] = useState<number | null>(null);
  const [matchCountLoading, setMatchCountLoading] = useState(false);

  const naicsClean = useMemo(() => sanitizeNaics(naics), [naics]);
  const naicsValid = useMemo(() => isValidNaics(naicsClean), [naicsClean]);

  // ✅ Keywords required ONLY on this page
  // ✅ NAICS required (because matching is NAICS-heavy)
  const canSubmit = useMemo(() => {
    return (
      companyName.trim().length >= 2 &&
      email.trim().includes("@") &&
      serviceArea.trim().length >= 2 &&
      keywords.trim().length >= 2 &&
      naicsValid
    );
  }, [companyName, email, serviceArea, keywords, naicsValid]);

  // live match count preview (requires service area + keywords + NAICS)
  useEffect(() => {
    const loc = serviceArea.trim();
    const kw = keywords.trim();
    const nx = naicsClean.trim();

    if (loc.length < 2 || kw.length < 2 || !isValidNaics(nx)) {
      setMatchCount(null);
      return;
    }

    setMatchCountLoading(true);
    const controller = new AbortController();

    const timer = setTimeout(async () => {
      const list = await getOpportunities(controller.signal);

      const { city, state } = parseServiceArea(loc);
      const cityN = norm(city);
      const stateN = norm(state);

      const kwList = splitKeywords(kw).map((k) => norm(k));
      const naicsN = norm(nx);

      const count = list
        .filter((o) => withinLast12Months(o.createdAt))
        .filter((o) => {
          const oLoc = norm(o.location);
          const oTitle = norm(o.title);
          const oNaics = norm(o.naics);
          const oKw = norm(o.keywords || "");
          const oSummary = norm(o.summary || "");

          const locationMatch =
            (!!cityN && oLoc.includes(cityN)) ||
            (!!stateN && oLoc.includes(stateN));

          // prefix match so "2373" can still find "237310"
          const naicsMatch = !!naicsN && !!oNaics && oNaics.startsWith(naicsN);

          const keywordMatch =
            kwList.length > 0 &&
            kwList.some(
              (k) =>
                k &&
                (oTitle.includes(k) ||
                  oLoc.includes(k) ||
                  oKw.includes(k) ||
                  oSummary.includes(k))
            );

          // Preview logic: must match location AND (NAICS OR keywords)
          return locationMatch && (naicsMatch || keywordMatch);
        }).length;

      setMatchCount(count);
      setMatchCountLoading(false);
    }, 350);

    return () => {
      clearTimeout(timer);
      controller.abort();
      setMatchCountLoading(false);
    };
  }, [serviceArea, keywords, naicsClean]);

  async function createCustomer() {
    setErr("");
    setLoading(true);

    try {
      const company = companyName.trim();
      const mail = email.trim();
      const loc = serviceArea.trim();
      const nx = naicsClean.trim();
      const kw = keywords.trim();

      if (!isValidNaics(nx)) {
        setNaicsTouched(true);
        throw new Error("Please enter a valid NAICS code (2–6 digits, usually 6).");
      }

      // ✅ IMPORTANT: deployed backend expects `name`. Send both for compatibility.
      const payload: any = {
        name: company,
        companyName: company,
        email: mail,
        location: loc,
        serviceArea: loc,
        naics: nx, // REQUIRED
        keywords: kw,
      };

      const { res, json } = await postJson(`${API_BASE}/engine/customers`, payload);

      if (!res.ok) {
        const msg = String(
          json?.message || json?.error || `Signup failed (${res.status})`
        );
        throw new Error(msg);
      }

      const id = Number(json?.id) || Number(json?.customer?.id);
      if (!id || !Number.isFinite(id)) {
        throw new Error("Customer created, but no customer id returned.");
      }

      router.push(`/matches/${id}`);
      router.refresh();
    } catch (e: any) {
      setErr(e?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-[#061033] via-[#040b24] to-[#020617] text-slate-100">
      {/* subtle glows like your homepage */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-blue-600/10 blur-3xl" />
        <div className="absolute -bottom-32 right-[-80px] h-[520px] w-[520px] rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.12),transparent_55%)]" />
      </div>

      <div className="relative mx-auto max-w-6xl px-6 py-12">
        {/* HERO */}
        <header className="mx-auto max-w-4xl text-center">
          <div className="mx-auto flex items-center justify-center gap-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-2 shadow-sm backdrop-blur">
              <AmbitMark size={34} />
            </div>
            <div className="text-left">
              <div className="text-sm font-semibold tracking-wide">AMBIT</div>
              <div className="text-xs text-slate-300">
                Ranked government leads for contractors
              </div>
            </div>
          </div>

          <h1 className="mt-7 text-4xl font-semibold tracking-tight sm:text-5xl">
            Create your profile
          </h1>

          <div className="mt-5 flex flex-wrap justify-center gap-2 text-xs font-semibold text-slate-200">
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 backdrop-blur">
              Built for contractors
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 backdrop-blur">
              Save hours weekly
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 backdrop-blur">
              Cancel anytime
            </span>
          </div>

          <p className="mx-auto mt-6 max-w-3xl text-base leading-relaxed text-slate-200">
            <span className="font-semibold text-white">Invest in Scale, Not Search.</span>{" "}
            For just <span className="font-semibold text-white">$1.33/day</span>, AMBIT automates the
            search process, reclaiming{" "}
            <span className="font-semibold text-white">15–20 hours</span> of your week. In an industry
            where one contract can generate millions, AMBIT doesn’t just pay for itself—it powers your
            growth.
          </p>
        </header>

        {/* FORM */}
        <section className="mx-auto mt-10 max-w-4xl rounded-[32px] border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur">
          <div className="grid gap-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Company name">
                <input
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/35 px-4 py-3 text-sm text-white placeholder:text-slate-400 outline-none focus:border-blue-400/60 focus:ring-2 focus:ring-blue-500/20"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Sevrix LLC"
                />
              </Field>

              <Field label="Email">
                <input
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/35 px-4 py-3 text-sm text-white placeholder:text-slate-400 outline-none focus:border-blue-400/60 focus:ring-2 focus:ring-blue-500/20"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                />
              </Field>
            </div>

            <Field label="Service area">
              <input
                className="w-full rounded-2xl border border-white/10 bg-slate-950/35 px-4 py-3 text-sm text-white placeholder:text-slate-400 outline-none focus:border-blue-400/60 focus:ring-2 focus:ring-blue-500/20"
                value={serviceArea}
                onChange={(e) => setServiceArea(e.target.value)}
                placeholder="San Diego, CA"
              />
            </Field>

            {/* ✅ NAICS first */}
            <Field label="NAICS (required)">
              <input
                className="w-full rounded-2xl border border-white/10 bg-slate-950/35 px-4 py-3 text-sm text-white placeholder:text-slate-400 outline-none focus:border-blue-400/60 focus:ring-2 focus:ring-blue-500/20"
                value={naicsClean}
                onChange={(e) => setNaics(e.target.value)}
                onBlur={() => setNaicsTouched(true)}
                placeholder="237310"
                inputMode="numeric"
                pattern="\d*"
              />
              <div className="text-xs text-slate-300">
                6 digits is best. Example: <span className="font-semibold text-white">237310</span>.
                (Your match engine relies heavily on NAICS.)
              </div>

              {naicsTouched && !naicsValid ? (
                <div className="text-xs text-red-200">
                  Enter a valid NAICS code (2–6 digits; usually 6).
                </div>
              ) : null}
            </Field>

            {/* ✅ Keywords moved BELOW NAICS */}
            <Field label="Keywords (required)">
              <input
                className="w-full rounded-2xl border border-white/10 bg-slate-950/35 px-4 py-3 text-sm text-white placeholder:text-slate-400 outline-none focus:border-blue-400/60 focus:ring-2 focus:ring-blue-500/20"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                placeholder="asphalt, striping, concrete"
              />
              <div className="text-xs text-slate-300">
                Use commas. Example: “HVAC, ductwork, rooftop unit”
              </div>
            </Field>

            {/* ✅ new info section below the fill-in area */}
            <div className="rounded-2xl border border-white/10 bg-slate-950/25 px-4 py-3 text-sm text-slate-200">
              <div className="font-semibold text-white">Enhance Match Accuracy</div>
              <div className="mt-1 text-xs text-slate-300">
                NAICS codes are vital for tailoring your experience and ensuring optimal match results.
                Need help? Find your code at{" "}
                <a
                  href="https://www.naics.com"
                  target="_blank"
                  rel="noreferrer"
                  className="font-semibold text-white underline decoration-white/30 underline-offset-4 hover:decoration-white/70"
                >
                  naics.com
                </a>
                .
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-950/25 px-4 py-3 text-sm text-slate-200">
              {matchCountLoading ? (
                <span className="font-semibold text-white">Checking your area…</span>
              ) : matchCount === null ? (
                <span>
                  Add your service area, NAICS, and keywords to see how many matches we’ve seen in the
                  last 12 months.
                </span>
              ) : (
                <span>
                  In the last 12 months, we’ve seen{" "}
                  <span className="font-semibold text-white">{matchCount}</span> opportunities matching
                  your area/trade.
                </span>
              )}
            </div>

            {err ? (
              <div className="rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {err}
              </div>
            ) : null}

            <button
              disabled={!canSubmit || loading}
              onClick={createCustomer}
              className="inline-flex items-center justify-center rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Creating…" : "Show My Matches"}
            </button>

            <div className="text-center text-xs text-slate-300">
              No long-term contracts. Pause or cancel in one click.
            </div>
          </div>
        </section>

        {/* WHAT YOU GET + PRICE */}
        <section className="mx-auto mt-12 max-w-5xl">
          <div className="text-center text-xs font-semibold tracking-widest text-slate-300">
            WHAT YOU GET
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <FeatureCard
              title="Know what’s worth bidding"
              body="A match score that helps you ignore the junk and move fast."
            />
            <FeatureCard
              title="Understand it in 60 seconds"
              body="Plain-English summaries so you can decide quickly."
            />
            <FeatureCard
              title="Wake up to new leads"
              body="Stop manual searching. We scan while you sleep."
            />
          </div>

          <div className="mt-6 rounded-[32px] border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="text-sm font-semibold text-white">Price</div>
                <div className="mt-1 text-xs text-slate-300">Cancel anytime.</div>
              </div>

              <div className="flex items-end justify-center gap-2 sm:justify-end">
                <div className="text-5xl font-semibold text-white tabular-nums">$39.99</div>
                <div className="pb-2 text-sm text-slate-300">/ month</div>
              </div>
            </div>

            <div className="mt-5 rounded-2xl border border-white/10 bg-slate-950/20 p-4 text-sm text-slate-200">
              Tip: You can refine NAICS/keywords anytime to tighten matches.
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="grid gap-2">
      <div className="text-xs font-semibold text-slate-200">{label}</div>
      {children}
    </label>
  );
}

function FeatureCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-lg backdrop-blur">
      <div className="text-sm font-semibold text-white">{title}</div>
      <div className="mt-2 text-sm text-slate-200">{body}</div>
    </div>
  );
}
