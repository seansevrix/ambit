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

const API_BASE = (
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_BASE ||
  "http://localhost:5001"
).replace(/\/$/, "");

const CHECKOUT_PATH = "/engine/billing/create-checkout-session";

export default function ScoutingReportClient({ customerId }: { customerId: number }) {
  const searchParams = useSearchParams();

  const [data, setData] = useState<MatchesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [needsSub, setNeedsSub] = useState(false);
  const [errMsg, setErrMsg] = useState<string>("");
  const [q, setQ] = useState("");

  const matches = useMemo(() => data?.matches || [], [data]);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return matches;

    return matches.filter((m) => {
      const haystack = [
        m.title,
        m.location,
        m.naics || "",
        m.agency || "",
        m.keywords || "",
        m.summary || "",
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(query);
    });
  }, [matches, q]);

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
      setErrMsg("Invalid customer");
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
    // ✅ This prevents any tiny horizontal overflow from escaping the container
    <div className="mx-auto w-full max-w-6xl px-6 py-10 overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <div className="text-xs font-semibold tracking-wide text-white/60">AMBIT</div>
          <h1 className="mt-1 text-2xl font-semibold text-white">
            Opportunity matches
          </h1>
          <div className="mt-1 text-sm text-white/60">
            Enter your company portal to view your opportunity matches.
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={load}
            className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white/85 hover:bg-white/10 hover:text-white"
          >
            Refresh
          </button>
          <button
            onClick={() => (window.location.href = "/")}
            className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500"
          >
            Back home
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="mt-5">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by location, NAICS, agency, or keywords…"
          className="w-full rounded-2xl border border-white/10 bg-slate-950/35 px-4 py-3 text-sm text-white placeholder:text-white/35 outline-none focus:border-blue-400/60 focus:ring-2 focus:ring-blue-500/20"
        />
        <div className="mt-2 text-xs text-white/50">
          Tip: use search to filter by location, NAICS, agency, or keywords.
        </div>
      </div>

      {/* States */}
      {loading ? (
        <Panel>
          <div className="text-sm text-white/70">Loading matches…</div>
        </Panel>
      ) : needsSub ? (
        <Panel>
          <div className="text-xs font-semibold text-white/60">SUBSCRIPTION</div>
          <div className="mt-2 text-2xl font-semibold text-white">Unlock your matches</div>
          <div className="mt-2 max-w-2xl text-sm text-white/70">
            This account is inactive. Subscribe to activate and unlock ranked opportunities,
            summaries, and next steps.
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
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

            <div className="flex gap-2">
              <button
                onClick={startCheckout}
                className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-500"
              >
                Subscribe $39.99/mo
              </button>
              <button
                onClick={load}
                className="rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white/85 hover:bg-white/10 hover:text-white"
              >
                I already paid — refresh
              </button>
            </div>
          </div>

          {errMsg ? (
            <div className="mt-4 rounded-xl border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
              {errMsg}
            </div>
          ) : null}
        </Panel>
      ) : !data ? (
        <Panel>
          <div className="text-sm font-semibold text-white">Couldn’t load matches</div>
          <div className="mt-1 text-sm text-white/70">{errMsg || "Unknown error"}</div>
          <button
            onClick={load}
            className="mt-4 rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white/85 hover:bg-white/10 hover:text-white"
          >
            Refresh
          </button>
        </Panel>
      ) : !filtered.length ? (
        <Panel>
          <div className="text-sm font-semibold text-white">No matches found</div>
          <div className="mt-1 text-sm text-white/70">
            Try clearing search or expanding NAICS/keywords/location.
          </div>
          <button
            onClick={() => setQ("")}
            className="mt-4 rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white/85 hover:bg-white/10 hover:text-white"
          >
            Clear search
          </button>
        </Panel>
      ) : (
        <div className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur overflow-hidden">
          {/* ✅ overflow-hidden keeps rounded border clean */}
          <div className="flex items-center justify-between gap-4">
            <div className="text-sm font-semibold text-white">More matches</div>
            <div className="text-xs text-white/50 tabular-nums">
              Showing {Math.min(filtered.length, 50)} of {filtered.length}
            </div>
          </div>

          <div className="mt-4 grid gap-3">
            {filtered.slice(0, 50).map((m) => (
              <div
                key={m.id}
                // ✅ overflow-hidden clips any long text inside the rounded card
                className="rounded-2xl border border-white/10 bg-slate-950/20 p-4 overflow-hidden"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    {/* ✅ break-words prevents long unbroken strings from forcing horizontal overflow */}
                    <div
                      className="text-sm font-semibold text-white leading-snug break-words"
                      title={m.title}
                    >
                      {m.title}
                    </div>

                    <div className="mt-1 text-xs text-white/60 break-words">
                      <span className="uppercase tracking-wide">
                        {m.agency || "Unknown agency"}
                      </span>
                      <span className="mx-2 opacity-40">•</span>
                      <span>{m.location}</span>
                      <span className="mx-2 opacity-40">•</span>
                      <span>NAICS {m.naics || "—"}</span>
                      <span className="mx-2 opacity-40">•</span>
                      <span>Posted {formatDate(m.postedDate)}</span>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold text-white tabular-nums">
                      {clampScore(m.score)}
                    </span>

                    {m.url ? (
                      <a href={m.url} target="_blank" rel="noreferrer">
                        <button className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold text-white/85 hover:bg-white/10 hover:text-white">
                          Source
                        </button>
                      </a>
                    ) : (
                      <button
                        disabled
                        className="cursor-not-allowed rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-white/30"
                      >
                        Source
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {errMsg ? (
            <div className="mt-4 rounded-xl border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
              {errMsg}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}

/* UI helpers */
function Panel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur overflow-hidden">
      {children}
    </div>
  );
}

function PaywallPill({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/20 p-4 overflow-hidden">
      <div className="text-sm font-semibold text-white">{title}</div>
      <div className="mt-1 text-sm text-white/70 break-words">{body}</div>
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
