"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import ProfileEditor from "./ProfileEditor";

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

type ProfileResponse = {
  ok: boolean;
  customer?: {
    id: number;
    email?: string | null;
    name?: string | null;
    location?: string | null;
    naics?: string | null;
    keywords?: string | null;
    services?: string | null;
  };
  error?: string;
};

const API_BASE = (
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_BASE ||
  "http://localhost:5001"
).replace(/\/$/, "");

const CHECKOUT_PATH = "/engine/billing/create-checkout-session";

type SortKey = "score" | "newest" | "closest";

const PAGE_SIZE = 10;

export default function ScoutingReportClient({ customerId }: { customerId: number }) {
  const searchParams = useSearchParams();

  const [data, setData] = useState<MatchesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [needsSub, setNeedsSub] = useState(false);
  const [errMsg, setErrMsg] = useState<string>("");

  const [q, setQ] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("score");

  // Pagination / Load more
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  // Starred (localStorage)
  const [starred, setStarred] = useState<Set<number>>(new Set());
  const [starredOnly, setStarredOnly] = useState(false);

  // Used only for "Closest location" sorting
  const [customerLoc, setCustomerLoc] = useState<{ city?: string; state?: string } | null>(
    null
  );

  const storageKey = useMemo(() => `ambit_starred_matches_${customerId}`, [customerId]);

  const matches = useMemo(() => data?.matches || [], [data]);

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

  // Load matches
  useEffect(() => {
    if (!Number.isFinite(customerId) || customerId <= 0) {
      setLoading(false);
      setErrMsg("Invalid customer");
      return;
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customerId]);

  // Load starred from localStorage (per customer)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) {
        setStarred(new Set());
        return;
      }
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) {
        const s = new Set<number>();
        for (const n of arr) {
          const id = Number(n);
          if (Number.isFinite(id)) s.add(id);
        }
        setStarred(s);
      } else {
        setStarred(new Set());
      }
    } catch {
      setStarred(new Set());
    }
  }, [storageKey]);

  function persistStarred(next: Set<number>) {
    try {
      localStorage.setItem(storageKey, JSON.stringify(Array.from(next)));
    } catch {
      // ignore
    }
  }

  function toggleStar(matchId: number) {
    setStarred((prev) => {
      const next = new Set(prev);
      if (next.has(matchId)) next.delete(matchId);
      else next.add(matchId);
      persistStarred(next);
      return next;
    });
  }

  // ✅ Fetch customer profile for "Closest location" sorting using SELF-SERVE endpoint
  useEffect(() => {
    let cancelled = false;

    async function loadCustomerProfile() {
      try {
        const savedEmail = localStorage.getItem("ambit_email");
        if (!savedEmail) return; // only works after user has loaded/saved their profile once

        const url = `${API_BASE}/engine/customers/${customerId}/profile?email=${encodeURIComponent(
          savedEmail
        )}`;

        const res = await fetch(url, {
          credentials: "include",
          cache: "no-store",
        });

        const body = (await res.json().catch(() => ({}))) as ProfileResponse;
        if (!res.ok || !body?.ok || !body.customer) return;

        const loc = (body.customer.location || "").trim();
        if (!loc) return;

        const parsed = parseCityState(loc);
        if (!cancelled) setCustomerLoc(parsed);
      } catch {
        // ignore
      }
    }

    loadCustomerProfile();
    return () => {
      cancelled = true;
    };
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

  const sorted = useMemo(() => {
    const list = [...filtered];

    if (sortKey === "score") {
      list.sort((a, b) => clampScore(b.score) - clampScore(a.score));
      return list;
    }

    if (sortKey === "newest") {
      list.sort((a, b) => toTime(b.postedDate) - toTime(a.postedDate));
      return list;
    }

    // Closest location (best-effort): city+state -> state -> everything else
    const city = norm(customerLoc?.city);
    const state = norm(customerLoc?.state);

    list.sort((a, b) => {
      const ra = locationRank(a.location, city, state);
      const rb = locationRank(b.location, city, state);
      if (ra !== rb) return ra - rb;
      return clampScore(b.score) - clampScore(a.score);
    });

    return list;
  }, [filtered, sortKey, customerLoc]);

  // Apply "Starred only" filter AFTER sorting/searching
  const finalList = useMemo(() => {
    if (!starredOnly) return sorted;
    return sorted.filter((m) => starred.has(m.id));
  }, [sorted, starredOnly, starred]);

  // Reset pagination when list inputs change
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [q, sortKey, starredOnly, data?.matches?.length]);

  const visible = useMemo(() => finalList.slice(0, visibleCount), [finalList, visibleCount]);
  const canLoadMore = visibleCount < finalList.length;

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-10 overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <div className="text-xs font-semibold tracking-wide text-white/60">AMBIT</div>
          <h1 className="mt-1 text-2xl font-semibold text-white">Opportunity matches</h1>
          <div className="mt-1 text-sm text-white/60">
            Your company portal — ranked opportunities tailored to your profile.
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {/* ✅ NEW: Profile editor */}
          <ProfileEditor
            customerId={customerId}
            onSaved={() => {
              // simplest: refresh the page so matches re-run
              window.location.reload();
            }}
          />

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

      {/* Search + Sort + Starred */}
      <div className="mt-5 grid gap-3 md:grid-cols-3 md:items-end">
        <div className="md:col-span-2">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by location, NAICS, agency, or keywords…"
            className="w-full rounded-2xl border border-white/10 bg-slate-950/35 px-4 py-3 text-sm text-white placeholder:text-white/35 outline-none focus:border-blue-400/60 focus:ring-2 focus:ring-blue-500/20"
          />
          <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-white/50">
            <span>Tip: search filters live (no page reload).</span>
            <span className="tabular-nums">
              Starred: <span className="font-semibold text-white/80">{starred.size}</span>
            </span>
          </div>
        </div>

        <div className="grid gap-3">
          <div>
            <label className="block text-xs font-semibold text-white/60">Sort</label>
            <select
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value as SortKey)}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/35 px-4 py-3 text-sm text-white outline-none focus:border-blue-400/60 focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="score">Highest score</option>
              <option value="newest">Newest posted</option>
              <option value="closest">Closest location</option>
            </select>

            {sortKey === "closest" && !customerLoc?.state ? (
              <div className="mt-2 text-xs text-white/45">
                Closest is best-effort (needs saved service area — use Edit profile).
              </div>
            ) : null}
          </div>

          <label className="flex items-center gap-2 text-sm text-white/70">
            <input
              type="checkbox"
              checked={starredOnly}
              onChange={(e) => setStarredOnly(e.target.checked)}
              className="h-4 w-4 rounded border-white/20 bg-black/30"
            />
            Show starred only
          </label>
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
      ) : !finalList.length ? (
        <Panel>
          <div className="text-sm font-semibold text-white">
            {starredOnly ? "No starred matches yet" : "No matches found"}
          </div>
          <div className="mt-1 text-sm text-white/70">
            {starredOnly
              ? "Star opportunities to save them here."
              : "Try clearing search or expanding NAICS/keywords/location (use Edit profile)."}
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={() => setQ("")}
              className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white/85 hover:bg-white/10 hover:text-white"
            >
              Clear search
            </button>
            {starredOnly ? (
              <button
                onClick={() => setStarredOnly(false)}
                className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500"
              >
                Show all matches
              </button>
            ) : null}
          </div>
        </Panel>
      ) : (
        <div className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur overflow-hidden">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm font-semibold text-white">
              {starredOnly ? "Starred matches" : "Matches"}
            </div>

            <div className="text-xs text-white/50 tabular-nums">
              Showing <span className="font-semibold text-white/80">{visible.length}</span> of{" "}
              <span className="font-semibold text-white/80">{finalList.length}</span>
            </div>
          </div>

          <div className="mt-4 grid gap-3">
            {visible.map((m) => {
              const isStarred = starred.has(m.id);

              return (
                <div
                  key={m.id}
                  className="rounded-2xl border border-white/10 bg-slate-950/20 p-4 overflow-hidden"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div
                        className="text-sm font-semibold text-white leading-snug break-words"
                        title={m.title}
                      >
                        {m.title}
                      </div>

                      <div className="mt-1 text-xs text-white/60 break-words">
                        <span className="uppercase tracking-wide">{m.agency || "Unknown agency"}</span>
                        <span className="mx-2 opacity-40">•</span>
                        <span>{m.location}</span>
                        <span className="mx-2 opacity-40">•</span>
                        <span>NAICS {m.naics || "—"}</span>
                        <span className="mx-2 opacity-40">•</span>
                        <span>Posted {formatDate(m.postedDate)}</span>
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                      {/* Star */}
                      <button
                        onClick={() => toggleStar(m.id)}
                        className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold text-white/85 hover:bg-white/10 hover:text-white"
                        aria-label={isStarred ? "Unstar" : "Star"}
                        title={isStarred ? "Unstar" : "Star"}
                      >
                        {isStarred ? "★" : "☆"}
                      </button>

                      {/* Score */}
                      <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold text-white tabular-nums">
                        {clampScore(m.score)}
                      </span>

                      {/* Source */}
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

                  {/* Optional summary */}
                  {m.summary ? (
                    <div className="mt-3 text-sm text-white/70 break-words">{m.summary}</div>
                  ) : null}
                </div>
              );
            })}
          </div>

          {/* Load more */}
          <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-xs text-white/50">
              {canLoadMore ? "Load more to see additional matches." : "You’re all caught up."}
            </div>

            <div className="flex gap-2">
              {canLoadMore ? (
                <button
                  onClick={() => setVisibleCount((n) => Math.min(finalList.length, n + PAGE_SIZE))}
                  className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-500"
                >
                  Load more
                </button>
              ) : null}

              {visibleCount > PAGE_SIZE ? (
                <button
                  onClick={() => setVisibleCount(PAGE_SIZE)}
                  className="rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white/85 hover:bg-white/10 hover:text-white"
                >
                  Back to top
                </button>
              ) : null}
            </div>
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

function toTime(iso: string | null) {
  if (!iso) return 0;
  const t = new Date(iso).getTime();
  return Number.isFinite(t) ? t : 0;
}

function norm(s?: string | null) {
  return String(s || "").trim().toLowerCase();
}

function parseCityState(input: string) {
  const raw = String(input || "").trim();
  if (!raw) return {};
  const parts = raw.split(",").map((p) => p.trim()).filter(Boolean);
  if (parts.length >= 2) return { city: parts[0], state: parts[1] };

  const tokens = raw.split(/\s+/).filter(Boolean);
  if (tokens.length >= 2) {
    const maybeState = tokens[tokens.length - 1];
    const city = tokens.slice(0, -1).join(" ");
    return { city, state: maybeState };
  }
  return { city: raw };
}

function locationRank(matchLocation: string, cityN: string, stateN: string) {
  if (!cityN && !stateN) return 2;
  const loc = norm(matchLocation);
  const hasState = !!stateN && loc.includes(stateN);
  const hasCity = !!cityN && loc.includes(cityN);
  if (hasCity && hasState) return 0;
  if (hasState) return 1;
  return 2;
}
