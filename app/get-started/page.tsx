"use client";

import { useEffect, useMemo, useState } from "react";
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

export default function GetStartedClient() {
  const router = useRouter();

  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [location, setLocation] = useState("");
  const [naics, setNaics] = useState("");
  const [keywords, setKeywords] = useState("");

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const [matchCount, setMatchCount] = useState<number | null>(null);
  const [matchCountLoading, setMatchCountLoading] = useState(false);

  const canSubmit = useMemo(() => {
    return (
      companyName.trim().length >= 2 &&
      email.trim().includes("@") &&
      location.trim().length >= 2 &&
      keywords.trim().length >= 2 // ✅ Keywords required ONLY on this page
    );
  }, [companyName, email, location, keywords]);

  useEffect(() => {
    const loc = location.trim();
    const kw = keywords.trim();
    const nx = naics.trim();

    if (loc.length < 2 || kw.length < 2) {
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

          const locationMatch =
            (!!cityN && oLoc.includes(cityN)) ||
            (!!stateN && oLoc.includes(stateN));

          const naicsMatch = !!naicsN && !!oNaics && oNaics.startsWith(naicsN);

          const keywordMatch =
            kwList.length > 0 &&
            kwList.some((k) => k && (oTitle.includes(k) || oLoc.includes(k)));

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
  }, [location, naics, keywords]);

  async function createCustomer() {
    setErr("");
    setLoading(true);

    try {
      const company = companyName.trim();
      const mail = email.trim();
      const loc = location.trim();
      const nx = naics.trim();
      const kw = keywords.trim();

      // ✅ IMPORTANT FIX:
      // Always send `name` because the deployed backend is returning "name is required".
      // Also send `companyName` for compatibility with newer code.
      const payload: any = {
        name: company,                // ✅ REQUIRED BY CURRENT DEPLOY
        companyName: company,         // keep for compatibility
        email: mail,
        location: loc,
        serviceArea: loc,             // extra compatibility
        naics: nx || null,
        keywords: kw,                 // ✅ required on this page
      };

      const { res, json } = await postJson(`${API_BASE}/engine/customers`, payload);

      if (!res.ok) {
        const msg = String(json?.message || json?.error || `Signup failed (${res.status})`);
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
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
        <div className="rounded-3xl border border-slate-900/10 bg-white p-8 shadow-sm">
          <div className="flex items-center gap-3">
            <AmbitMark size={44} />
            <div>
              <div className="text-sm font-semibold text-slate-900">AMBIT</div>
              <div className="text-xs text-slate-600">
                Ranked government leads for contractors
              </div>
            </div>
          </div>

          <h1 className="mt-6 text-3xl font-semibold tracking-tight text-slate-900">
            Create your profile
          </h1>

          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-600">
            <span className="rounded-full border border-slate-900/10 bg-slate-50 px-3 py-1">
              Built for contractors
            </span>
            <span className="rounded-full border border-slate-900/10 bg-slate-50 px-3 py-1">
              Save hours weekly
            </span>
            <span className="rounded-full border border-slate-900/10 bg-slate-50 px-3 py-1">
              Cancel anytime
            </span>
          </div>

          <p className="mt-4 max-w-md text-sm text-slate-700">
            Tell us your trade and service area—AMBIT finds opportunities, ranks them, and gives you
            clear next steps so you can spend time bidding, not searching.
          </p>

          <div className="mt-6 grid gap-4">
            <Field label="Company name">
              <input
                className="w-full rounded-xl border border-slate-900/15 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-900"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Sevrix LLC"
              />
            </Field>

            <Field label="Email">
              <input
                className="w-full rounded-xl border border-slate-900/15 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-900"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
              />
            </Field>

            <Field label="Service area">
              <input
                className="w-full rounded-xl border border-slate-900/15 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-900"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="San Diego, CA"
              />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="NAICS (optional)">
                <input
                  className="w-full rounded-xl border border-slate-900/15 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-900"
                  value={naics}
                  onChange={(e) => setNaics(e.target.value)}
                  placeholder="237310"
                />
              </Field>

              <Field label="Keywords">
                <input
                  className="w-full rounded-xl border border-slate-900/15 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-900"
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  placeholder="asphalt, striping, concrete"
                />
                <div className="text-xs text-slate-500">
                  Use commas. Example: “HVAC, ductwork, rooftop unit”
                </div>
              </Field>
            </div>

            <div className="rounded-xl border border-slate-900/10 bg-slate-50 px-4 py-3 text-sm text-slate-700">
              {matchCountLoading ? (
                <span className="font-semibold">Checking your area…</span>
              ) : matchCount === null ? (
                <span>
                  Add your service area and keywords to see how many matches we’ve seen in the last
                  12 months.
                </span>
              ) : (
                <span>
                  In the last 12 months, we’ve seen{" "}
                  <span className="font-semibold text-slate-900">{matchCount}</span> opportunities
                  matching your area/trade.
                </span>
              )}
            </div>

            {err ? (
              <div className="rounded-xl border border-red-600/20 bg-red-50 px-3 py-2 text-sm text-red-700">
                {err}
              </div>
            ) : null}

            <button
              disabled={!canSubmit || loading}
              onClick={createCustomer}
              className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-black disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Creating…" : "Show My Matches"}
            </button>

            <div className="text-xs text-slate-600">
              No long-term contracts. Pause or cancel in one click.
            </div>

            <div className="text-xs text-slate-600">
              By continuing, you’ll be taken to your matches page. If your subscription is inactive,
              you’ll see the subscribe screen.
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-900/10 bg-white p-8 shadow-sm">
          <div className="text-xs font-semibold text-slate-600">WHAT YOU GET</div>

          <div className="mt-4 grid gap-3">
            <Outcome
              title="Know what’s worth bidding"
              body="A match score that helps you ignore the junk and move fast."
            />
            <Outcome
              title="Understand it in 60 seconds"
              body="Plain-English summaries so you can decide quickly."
            />
            <Outcome
              title="Wake up to new leads"
              body="Stop manual searching. We scan while you sleep."
            />
          </div>

          <div className="mt-6 rounded-3xl border border-slate-900/10 bg-slate-50 p-6">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold text-slate-900">Price</div>
              <div className="rounded-full border border-slate-900/10 bg-white px-3 py-1 text-[11px] font-semibold text-slate-700">
                One win can cover years of AMBIT.
              </div>
            </div>

            <div className="mt-3 flex items-end gap-2">
              <div className="text-4xl font-semibold text-slate-900 tabular-nums">$39.99</div>
              <div className="pb-1 text-sm text-slate-600">/ month</div>
            </div>

            <div className="mt-2 text-xs text-slate-600">Cancel anytime.</div>

            <div className="mt-5 rounded-2xl border border-slate-900/10 bg-white p-4">
              <div className="text-xs font-semibold text-slate-700">Why it’s worth it</div>
              <div className="mt-2 text-sm text-slate-700">
                If AMBIT saves you even{" "}
                <span className="font-semibold text-slate-900">1–2 hours/week</span> of searching,
                it pays for itself.
              </div>
            </div>
          </div>

          <div className="mt-6 text-xs text-slate-600">
            Tip: You can refine NAICS/keywords anytime to tighten matches.
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="grid gap-2">
      <div className="text-xs font-semibold text-slate-700">{label}</div>
      {children}
    </label>
  );
}

function Outcome({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-slate-900/10 bg-white p-4">
      <div className="text-sm font-semibold text-slate-900">{title}</div>
      <div className="mt-1 text-sm text-slate-700">{body}</div>
    </div>
  );
}
