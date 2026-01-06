"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

type Match = {
  id: number;
  title: string;
  location: string;
  naics: string | null;
  keywords: string | null;
  agency: string | null;
  url: string | null;
  postedDate: string | null;
  summary: string | null;
  score: number;
  reasons: string[];
  profileIncomplete: boolean;
};

type MatchesResponse = {
  customerId: number;
  matches: Match[];
};

const API_BASE =
  (process.env.NEXT_PUBLIC_BACKEND_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_BASE ||
    "http://localhost:5001")?.replace(/\/$/, "");

const CHECKOUT_PATH = "/engine/billing/create-checkout-session";

export default function ScoutingReportClient({ customerId }: { customerId: number }) {
  const searchParams = useSearchParams();

  const [data, setData] = useState<MatchesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [needsSub, setNeedsSub] = useState(false);
  const [errMsg, setErrMsg] = useState<string>("");

  const [query, setQuery] = useState("");

  const featured = useMemo(() => data?.matches?.[0] ?? null, [data]);
  const others = useMemo(() => (data?.matches?.length ? data.matches.slice(1) : []), [data]);

  const filteredOthers = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return others;

    return others.filter((m) => {
      const hay = [
        m.title,
        m.agency,
        m.location,
        m.naics,
        m.keywords,
        m.summary,
        ...(m.reasons || []),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return hay.includes(q);
    });
  }, [others, query]);

  async function load() {
    setLoading(true);
    setErrMsg("");
    setNeedsSub(false);

    try {
      const res = await fetch(`${API_BASE}/engine/matches/${customerId}`, {
        credentials: "include",
        cache: "no-store",
      });

      const body = (await res.json().catch(() => ({}))) as any;

      if (res.status === 402) {
        setNeedsSub(true);
        setErrMsg(body?.message || "Subscription required");
        setData(null);
        return;
      }

      if (!res.ok) throw new Error(body?.message || `Request failed (${res.status})`);
      setData(body as MatchesResponse);
    } catch (e: any) {
      setErrMsg(e?.message || "Failed to load matches");
      setData(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!Number.isFinite(customerId) || customerId <= 0) {
      setLoading(false);
      setErrMsg("Invalid customer.");
      return;
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customerId]);

  // If Stripe redirects back with common params, auto-refresh once.
  useEffect(() => {
    const success =
      searchParams?.get("success") ||
      searchParams?.get("checkout") ||
      searchParams?.get("session_id");
    if (success) {
      const t = setTimeout(() => load(), 900);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  async function startCheckout() {
    try {
      setErrMsg("");

      const res = await fetch(`${API_BASE}${CHECKOUT_PATH}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ customerId }),
      });

      const body = (await res.json().catch(() => ({}))) as any;

      if (!res.ok) throw new Error(body?.message || `Billing failed (${res.status})`);
      if (!body?.url) throw new Error("No checkout URL returned");

      window.location.href = body.url;
    } catch (e: any) {
      setErrMsg(e?.message || "Checkout failed");
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-b from-[#061033] via-[#040b24] to-[#020617] text-slate-100">
      {/* subtle glows */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-blue-600/10 blur-3xl" />
        <div className="absolute -bottom-32 right-[-80px] h-[520px] w-[520px] rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.10),transparent_60%)]" />
      </div>

      <div className="relative mx-auto w-full max-w-6xl px-6 py-10">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <div className="text-xs font-semibold tracking-wide text-white/70">AMBIT</div>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight text-white">
              Your opportunity matches
            </h1>
            <div className="mt-1 text-sm text-white/70">
              Ranked leads based on your service area, NAICS, and keywords.
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={load}
              className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white/85 hover:bg-white/10"
            >
              Refresh
            </button>

            <Link
              href="/cancel"
              className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white/85 hover:bg-white/10"
            >
              Manage billing
            </Link>

            <Link
              href="/"
              className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-500"
            >
              Back home
            </Link>
          </div>
        </div>

        {/* Search + count */}
        <div className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-white/80">
              {loading ? (
                <span className="font-semibold text-white">Loading matches…</span>
              ) : needsSub ? (
                <span className="text-amber-200">Subscription required to view matches.</span>
              ) : data ? (
                <span>
                  Showing{" "}
                  <span className="font-semibold text-white">
                    {1 + filteredOthers.length}
                  </span>{" "}
                  match{1 + filteredOthers.length === 1 ? "" : "es"}
                </span>
              ) : (
                <span className="text-red-200">{errMsg || "Couldn’t load matches"}</span>
              )}
            </div>

            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search matches…"
              className="w-full sm:w-[360px] rounded-2xl border border-white/10 bg-slate-950/35 px-4 py-2.5 text-sm text-white placeholder:text-white/35 outline-none focus:border-blue-400/60 focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
        </div>

        {/* States */}
        {loading ? (
          <div className="mt-6 rounded-[32px] border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur">
            <div className="text-sm text-white/75">Loading matches…</div>
          </div>
        ) : needsSub ? (
          <div className="mt-6 rounded-[32px] border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur">
            <div className="text-xs font-semibold tracking-widest text-white/70">SUBSCRIPTION</div>
            <div className="mt-2 text-3xl font-semibold text-white">Unlock your matches</div>
            <div className="mt-2 max-w-2xl text-sm text-white/75">
              Subscribe to activate and unlock ranked opportunities, summaries, and next steps.
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <PaywallPill title="Match score" body="Ranked leads that fit." />
              <PaywallPill title="Plain-English summary" body="Fast BID/NO-BID." />
              <PaywallPill title="Daily digest" body="No dashboard babysitting." />
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="text-sm font-semibold text-white">AMBIT Pro</div>
                <div className="mt-1 text-sm text-white/70">
                  <span className="font-semibold text-white tabular-nums">$39.99</span> / month — cancel anytime
                </div>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row">
                <button
                  onClick={startCheckout}
                  className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-500"
                >
                  Subscribe $39.99/mo
                </button>
                <button
                  onClick={load}
                  className="rounded-2xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white/85 hover:bg-white/10"
                >
                  I already paid — refresh
                </button>
              </div>
            </div>

            {errMsg ? (
              <div className="mt-4 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-100">
                {errMsg}
              </div>
            ) : null}
          </div>
        ) : !data ? (
          <div className="mt-6 rounded-[32px] border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur">
            <div className="text-sm font-semibold text-white">Couldn’t load matches</div>
            <div className="mt-1 text-sm text-white/70">{errMsg || "Unknown error"}</div>
            <button
              onClick={load}
              className="mt-4 rounded-2xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white/85 hover:bg-white/10"
            >
              Refresh
            </button>
          </div>
        ) : !data.matches.length ? (
          <div className="mt-6 rounded-[32px] border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur">
            <div className="text-sm font-semibold text-white">No matches yet</div>
            <div className="mt-1 text-sm text-white/70">
              Expand keywords/NAICS/service area, or wait for new opportunities.
            </div>
            <button
              onClick={load}
              className="mt-4 rounded-2xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white/85 hover:bg-white/10"
            >
              Refresh
            </button>
          </div>
        ) : (
          <>
            {/* Profile incomplete banner */}
            {featured?.profileIncomplete ? (
              <div className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                <div className="text-sm font-semibold text-white">Profile incomplete</div>
                <div className="mt-1 text-sm text-white/75">
                  Add NAICS + keywords + service area to improve match quality.
                </div>
                <div className="mt-3">
                  <Link
                    href="/get-started"
                    className="inline-flex items-center justify-center rounded-2xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500"
                  >
                    Update profile
                  </Link>
                </div>
              </div>
            ) : null}

            {/* Featured */}
            {featured ? (
              <div className="mt-6 rounded-[32px] border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  {/* Left */}
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-semibold tracking-widest text-white/70">
                      TOP MATCH
                    </div>

                    <div className="mt-2 text-2xl font-semibold text-white">
                      {featured.title}
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2 text-xs">
                      <Pill>{featured.agency || "Unknown agency"}</Pill>
                      <Pill>{featured.location || "—"}</Pill>
                      <Pill>NAICS {featured.naics || "—"}</Pill>
                      <Pill>Posted {formatDate(featured.postedDate)}</Pill>
                    </div>

                    <div className="mt-5">
                      <div className="text-xs font-semibold tracking-widest text-white/70">
                        SUMMARY
                      </div>
                      <div className="mt-2 text-sm leading-relaxed text-white/80">
                        {buildSummary(featured)}
                      </div>
                    </div>
                  </div>

                  {/* Right (shrink-0 prevents layout blowouts) */}
                  <div className="w-full lg:w-[260px] shrink-0">
                    <div className="rounded-3xl border border-white/10 bg-slate-950/25 p-5 text-center">
                      <div className="text-xs font-semibold tracking-widest text-white/70">
                        MATCH
                      </div>
                      <div className="mt-2 text-5xl font-semibold text-white tabular-nums">
                        {clampScore(featured.score)}
                      </div>
                      <div className="mt-1 text-xs text-white/60">
                        {fitLabel(featured.score)}
                      </div>

                      <div className="mt-5">
                        {featured.url ? (
                          <a href={featured.url} target="_blank" rel="noreferrer">
                            <button className="w-full rounded-2xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-500">
                              View source
                            </button>
                          </a>
                        ) : (
                          <button
                            disabled
                            className="w-full cursor-not-allowed rounded-2xl bg-white/10 px-4 py-2.5 text-sm font-semibold text-white/50"
                          >
                            View source
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Drivers + Next steps */}
                <div className="mt-6 grid gap-4 lg:grid-cols-2">
                  <div className="rounded-3xl border border-white/10 bg-slate-950/20 p-5">
                    <div className="text-sm font-semibold text-white">Match drivers</div>
                    <ul className="mt-3 space-y-2 text-sm text-white/75">
                      {(featured.reasons || []).slice(0, 8).map((r, i) => (
                        <li key={i} className="flex gap-2">
                          <span className="mt-2 inline-block h-2 w-2 shrink-0 rounded-full bg-blue-400" />
                          <span className="min-w-0">{cleanReason(r)}</span>
                        </li>
                      ))}
                      {!featured.reasons?.length ? (
                        <li className="text-white/60">No driver details available.</li>
                      ) : null}
                    </ul>

                    {featured.keywords ? (
                      <div className="mt-4">
                        <div className="text-xs font-semibold tracking-widest text-white/70">
                          KEYWORDS
                        </div>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {featured.keywords
                            .split(",")
                            .map((k) => k.trim())
                            .filter(Boolean)
                            .slice(0, 14)
                            .map((k) => (
                              <span
                                key={k}
                                className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-white/80"
                              >
                                {k}
                              </span>
                            ))}
                        </div>
                      </div>
                    ) : null}
                  </div>

                  <div className="rounded-3xl border border-white/10 bg-slate-950/20 p-5">
                    <div className="text-sm font-semibold text-white">Next actions</div>
                    <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-white/75">
                      <li>Open the source and confirm scope + submission requirements.</li>
                      <li>Check constraints (access, hours, safety, inspections, closeout).</li>
                      <li>Build a quick price plan (labor, materials, equipment, duration, margin).</li>
                      <li>Send clarifying questions early if anything is unclear.</li>
                    </ol>
                  </div>
                </div>
              </div>
            ) : null}

            {/* More matches (THIS IS THE JANK FIX) */}
            <div className="mt-6 rounded-[32px] border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-sm font-semibold text-white">More matches</div>

                <div className="text-xs text-white/60">
                  Tip: use search to filter by location, NAICS, agency, or keywords.
                </div>
              </div>

              <div className="mt-4 grid gap-3">
                {filteredOthers.slice(0, 12).map((m) => (
                  <div
                    key={m.id}
                    className="w-full rounded-3xl border border-white/10 bg-slate-950/20 p-4"
                  >
                    {/* Row: left content + right action */}
                    <div className="flex w-full items-start justify-between gap-4">
                      {/* Left: min-w-0 is CRITICAL to prevent overflow */}
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-semibold text-white">
                          {m.title}
                        </div>

                        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-white/60">
                          <span className="truncate">{m.agency || "Unknown agency"}</span>
                          <span className="opacity-40">•</span>
                          <span className="truncate">{m.location || "—"}</span>
                          <span className="opacity-40">•</span>
                          <span>NAICS {m.naics || "—"}</span>
                          <span className="opacity-40">•</span>
                          <span>Posted {formatDate(m.postedDate)}</span>
                        </div>
                      </div>

                      {/* Right: shrink-0 prevents right side collapse */}
                      <div className="shrink-0 flex items-center gap-2">
                        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-white tabular-nums">
                          {clampScore(m.score)}
                        </span>

                        {m.url ? (
                          <a href={m.url} target="_blank" rel="noreferrer">
                            <button className="rounded-2xl border border-white/15 bg-white/5 px-3 py-2 text-sm font-semibold text-white/85 hover:bg-white/10">
                              Source
                            </button>
                          </a>
                        ) : (
                          <button
                            disabled
                            className="cursor-not-allowed rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-white/40"
                          >
                            Source
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Optional 1-line preview summary */}
                    {m.summary ? (
                      <div className="mt-2 line-clamp-2 text-sm text-white/70">
                        {m.summary}
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>

              {errMsg ? (
                <div className="mt-4 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-100">
                  {errMsg}
                </div>
              ) : null}
            </div>
          </>
        )}
      </div>
    </main>
  );
}

/* small ui helpers */
function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 font-semibold text-white/80">
      {children}
    </span>
  );
}

function PaywallPill({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-slate-950/20 p-4">
      <div className="text-sm font-semibold text-white">{title}</div>
      <div className="mt-1 text-sm text-white/70">{body}</div>
    </div>
  );
}

/* helpers */
function clampScore(x: number) {
  const n = Number(x);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(100, Math.round(n)));
}

function formatDate(iso: string | null) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

function fitLabel(score: number) {
  const s = clampScore(score);
  return s >= 90 ? "Elite fit" : s >= 75 ? "Strong fit" : s >= 60 ? "Decent fit" : "Weak fit";
}

function cleanReason(r: string) {
  return String(r || "")
    .replace("Title/Services overlap", "Title fit")
    .replace("Title overlap", "Title fit")
    .replace("Keyword overlap", "Keyword fit")
    .replace("Location overlap", "Location fit")
    .replace("NAICS exact match", "NAICS match");
}

function buildSummary(m: Match) {
  const base = (m.summary || "").trim();
  if (base) return base;

  const agency = m.agency || "the issuing organization";
  const loc = m.location || "the target area";
  const naics = m.naics ? `NAICS ${m.naics}` : "the listed NAICS";

  return `${m.title} is posted by ${agency} for work in ${loc} under ${naics}. Verify scope boundaries, schedule/access constraints, required submittals, and inspection/acceptance language before pricing.`;
}
