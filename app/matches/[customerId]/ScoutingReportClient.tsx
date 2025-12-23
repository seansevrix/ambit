"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

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
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_BASE ||
  "http://localhost:5001";

const CHECKOUT_PATH = "/engine/billing/create-checkout-session";

export default function ScoutingReportClient({ customerId }: { customerId: number }) {
  const searchParams = useSearchParams();

  const [data, setData] = useState<MatchesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [needsSub, setNeedsSub] = useState(false);
  const [errMsg, setErrMsg] = useState<string>("");

  const featured = useMemo(() => data?.matches?.[0] ?? null, [data]);
  const others = useMemo(
    () => (data?.matches?.length ? data.matches.slice(1) : []),
    [data]
  );

  async function load() {
    setLoading(true);
    setErrMsg("");
    setNeedsSub(false);

    try {
      const res = await fetch(`${API_BASE}/engine/matches/${customerId}`, {
        credentials: "include",
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
      setErrMsg("Invalid customerId");
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
    <div className="mx-auto max-w-5xl px-6 py-10">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="text-xs font-semibold tracking-wide text-slate-600">AMBIT</div>
          <h1 className="mt-1 text-2xl font-semibold text-slate-900">Scouting Report</h1>
          <div className="mt-1 text-sm text-slate-600">Customer #{customerId}</div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={load}
            className="rounded-xl border border-slate-900/15 bg-white px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50"
          >
            Refresh
          </button>
          <button
            onClick={() => (window.location.href = "/")}
            className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-black"
          >
            Back home
          </button>
        </div>
      </div>

      {/* States */}
      {loading ? (
        <div className="mt-6 rounded-2xl border border-slate-900/10 bg-white p-6 shadow-sm">
          <div className="text-sm text-slate-700">Loading matches…</div>
        </div>
      ) : needsSub ? (
        <div className="mt-6 rounded-2xl border border-slate-900/10 bg-white p-8 shadow-sm">
          <div className="text-xs font-semibold text-slate-600">SUBSCRIPTION</div>
          <div className="mt-2 text-2xl font-semibold text-slate-900">
            Unlock your matches
          </div>
          <div className="mt-2 max-w-2xl text-sm text-slate-700">
            This customer is inactive. Subscribe to activate and unlock ranked opportunities,
            summaries, and next steps.
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <PaywallPill title="Match score" body="Ranked leads that fit." />
            <PaywallPill title="Plain-English summary" body="Fast BID/NO-BID." />
            <PaywallPill title="Daily digest" body="No dashboard babysitting." />
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-sm font-semibold text-slate-900">AMBIT Pro</div>
              <div className="mt-1 text-sm text-slate-600">
                <span className="font-semibold text-slate-900 tabular-nums">$39.99</span> / month — cancel anytime
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={startCheckout}
                className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-black"
              >
                Subscribe $39.99/mo
              </button>
              <button
                onClick={load}
                className="rounded-xl border border-slate-900/15 bg-white px-5 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-50"
              >
                I already paid — refresh
              </button>
            </div>
          </div>

          {errMsg ? (
            <div className="mt-4 rounded-xl border border-red-600/20 bg-red-50 px-3 py-2 text-sm text-red-700">
              {errMsg}
            </div>
          ) : null}
        </div>
      ) : !data ? (
        <div className="mt-6 rounded-2xl border border-slate-900/10 bg-white p-6 shadow-sm">
          <div className="text-sm font-semibold text-slate-900">Couldn’t load matches</div>
          <div className="mt-1 text-sm text-slate-700">{errMsg || "Unknown error"}</div>
          <button
            onClick={load}
            className="mt-4 rounded-xl border border-slate-900/15 bg-white px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50"
          >
            Refresh
          </button>
        </div>
      ) : !data.matches.length ? (
        <div className="mt-6 rounded-2xl border border-slate-900/10 bg-white p-6 shadow-sm">
          <div className="text-sm font-semibold text-slate-900">No matches yet</div>
          <div className="mt-1 text-sm text-slate-700">
            Add opportunities, or expand keywords/NAICS/location.
          </div>
          <button
            onClick={load}
            className="mt-4 rounded-xl border border-slate-900/15 bg-white px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50"
          >
            Refresh
          </button>
        </div>
      ) : (
        <>
          {/* Profile incomplete banner */}
          {featured?.profileIncomplete ? (
            <div className="mt-6 rounded-2xl border border-slate-900/10 bg-slate-50 p-4">
              <div className="text-sm font-semibold text-slate-900">Profile incomplete</div>
              <div className="mt-1 text-sm text-slate-700">
                Add NAICS + keywords + service area to improve match quality.
              </div>
            </div>
          ) : null}

          {/* Featured */}
          {featured ? (
            <div className="mt-6 rounded-2xl border border-slate-900/10 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-slate-600">TOP MATCH</div>
                  <div className="mt-2 text-xl font-semibold text-slate-900">{featured.title}</div>

                  <div className="mt-3 flex flex-wrap gap-2 text-xs">
                    <Pill>{featured.agency || "Unknown agency"}</Pill>
                    <Pill>{featured.location}</Pill>
                    <Pill>NAICS {featured.naics || "—"}</Pill>
                    <Pill>Posted {formatDate(featured.postedDate)}</Pill>
                  </div>

                  <div className="mt-4">
                    <div className="text-xs font-semibold text-slate-600">SUMMARY</div>
                    <div className="mt-2 text-sm leading-relaxed text-slate-800">
                      {buildSummary(featured)}
                    </div>
                  </div>
                </div>

                <div className="w-full sm:w-[220px]">
                  <div className="rounded-2xl border border-slate-900/10 bg-slate-50 p-4 text-center">
                    <div className="text-xs font-semibold text-slate-600">MATCH</div>
                    <div className="mt-2 text-4xl font-semibold text-slate-900 tabular-nums">
                      {clampScore(featured.score)}
                    </div>
                    <div className="mt-1 text-xs text-slate-600">{fitLabel(featured.score)}</div>

                    <div className="mt-4">
                      {featured.url ? (
                        <a href={featured.url} target="_blank" rel="noreferrer">
                          <button className="w-full rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-black">
                            View source
                          </button>
                        </a>
                      ) : (
                        <button
                          disabled
                          className="w-full cursor-not-allowed rounded-xl bg-slate-900/30 px-4 py-2.5 text-sm font-semibold text-white"
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
                <div className="rounded-2xl border border-slate-900/10 bg-white p-5">
                  <div className="text-sm font-semibold text-slate-900">Match drivers</div>
                  <ul className="mt-3 space-y-2 text-sm text-slate-700">
                    {(featured.reasons || []).slice(0, 8).map((r, i) => (
                      <li key={i} className="flex gap-2">
                        <span className="mt-2 inline-block h-2 w-2 rounded-full bg-slate-900" />
                        <span>{cleanReason(r)}</span>
                      </li>
                    ))}
                    {!featured.reasons?.length ? (
                      <li className="text-slate-600">No driver details available.</li>
                    ) : null}
                  </ul>

                  {featured.keywords ? (
                    <div className="mt-4">
                      <div className="text-xs font-semibold text-slate-600">Keywords</div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {featured.keywords
                          .split(",")
                          .map((k) => k.trim())
                          .filter(Boolean)
                          .slice(0, 14)
                          .map((k) => (
                            <span
                              key={k}
                              className="rounded-full border border-slate-900/15 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700"
                            >
                              {k}
                            </span>
                          ))}
                      </div>
                    </div>
                  ) : null}
                </div>

                <div className="rounded-2xl border border-slate-900/10 bg-white p-5">
                  <div className="text-sm font-semibold text-slate-900">Next actions</div>
                  <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-slate-700">
                    <li>Open the source and confirm scope + submission requirements.</li>
                    <li>Check constraints (access, hours, safety, inspections, closeout).</li>
                    <li>Build a quick price plan (labor, materials, equipment, duration, margin).</li>
                    <li>Send clarifying questions early if anything is unclear.</li>
                  </ol>
                </div>
              </div>
            </div>
          ) : null}

          {/* More matches */}
          {others.length ? (
            <div className="mt-6 rounded-2xl border border-slate-900/10 bg-white p-6 shadow-sm">
              <div className="text-sm font-semibold text-slate-900">More matches</div>
              <div className="mt-4 grid gap-3">
                {others.slice(0, 12).map((m) => (
                  <div
                    key={m.id}
                    className="flex flex-col gap-3 rounded-2xl border border-slate-900/10 bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold text-slate-900">{m.title}</div>
                      <div className="mt-1 flex flex-wrap gap-2 text-xs text-slate-600">
                        <span>{m.agency || "Unknown agency"}</span>
                        <span className="opacity-40">•</span>
                        <span>{m.location}</span>
                        <span className="opacity-40">•</span>
                        <span>NAICS {m.naics || "—"}</span>
                        <span className="opacity-40">•</span>
                        <span>Posted {formatDate(m.postedDate)}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="rounded-full border border-slate-900/15 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-900 tabular-nums">
                        {clampScore(m.score)}
                      </span>

                      {m.url ? (
                        <a href={m.url} target="_blank" rel="noreferrer">
                          <button className="rounded-xl border border-slate-900/15 bg-white px-3 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50">
                            Source
                          </button>
                        </a>
                      ) : (
                        <button
                          disabled
                          className="cursor-not-allowed rounded-xl border border-slate-900/10 bg-white px-3 py-2 text-sm font-semibold text-slate-400"
                        >
                          Source
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {errMsg ? (
                <div className="mt-4 rounded-xl border border-red-600/20 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {errMsg}
                </div>
              ) : null}
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}

/* small ui helpers */
function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-slate-900/15 bg-slate-50 px-3 py-1 font-semibold text-slate-700">
      {children}
    </span>
  );
}

function PaywallPill({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-xl border border-slate-900/10 bg-white p-4">
      <div className="text-sm font-semibold text-slate-900">{title}</div>
      <div className="mt-1 text-sm text-slate-700">{body}</div>
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
