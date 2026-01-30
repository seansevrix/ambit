"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type ComponentType } from "react";
import { useParams, useSearchParams } from "next/navigation";

// If you have this component already, keep it.
// If not, you can remove this import + the modal block at the bottom.
import ProfileEditor from "./ProfileEditor";
const ProfileEditorAny = ProfileEditor as unknown as ComponentType<any>;

type Match = {
  id: number;
  title: string;
  location: string | null;
  naics: string | null;
  keywords: string | null;
  agency: string | null;
  url: string | null;
  postedDate: string | null;
  dueDate?: string | null;
  summary: string | null;
  score: number;
  reasons: string[];
  profileIncomplete: boolean;

  segment?: string | null;
  source?: string | null;

  nearby?: boolean | null;
  customerState?: string | null;
  oppState?: string | null;
};

type MatchesResponse = {
  customerId: number;
  matches: Match[];
  access?: {
    isActive: boolean;
    trialEndsAt: string | null;
  };
  segments?: string[];
};

const API_BASE =
  (
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_BASE ||
    "http://localhost:5001"
  ).replace(/\/$/, "");

function cx(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

function fmtDate(input?: string | null) {
  if (!input) return "";
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "2-digit",
    year: "numeric",
  }).format(d);
}

function clampScore(n: number) {
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(100, Math.round(n)));
}

type SortKey = "score_desc" | "posted_desc" | "due_asc" | "title_asc";

export default function ScoutingReportClient(props: { customerId?: number }) {
  const params = useParams<{ customerId?: string }>();
  const sp = useSearchParams();

  const customerId =
    props.customerId ??
    (params?.customerId ? Number(params.customerId) : NaN);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [data, setData] = useState<MatchesResponse | null>(null);

  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("score_desc");
  const [starred, setStarred] = useState<Record<number, boolean>>({});
  const [starOnly, setStarOnly] = useState(false);

  const [showProfile, setShowProfile] = useState(false);

  async function fetchMatches(isRefresh = false) {
    if (!Number.isFinite(customerId)) {
      setErr("Missing customerId.");
      setLoading(false);
      return;
    }

    setErr(null);
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const url = `${API_BASE}/engine/matches/${customerId}?limit=200&grouped=0`;
      const res = await fetch(url, { credentials: "include" });
      const json = (await res.json().catch(() => null)) as MatchesResponse | null;

      if (!res.ok || !json) {
        throw new Error(
          (json as any)?.error || `Failed to load matches (${res.status})`
        );
      }

      setData(json);
    } catch (e: any) {
      setErr(e?.message || "Failed to load matches.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    fetchMatches(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customerId]);

  useEffect(() => {
    // Optional: open editor from a link like /matches/6?edit=1
    if (sp?.get("edit") === "1") setShowProfile(true);
  }, [sp]);

  const matches = data?.matches || [];

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = matches;

    if (q) {
      list = list.filter((m) => {
        const hay = [
          m.title,
          m.location,
          m.naics,
          m.agency,
          m.keywords,
          m.segment,
          m.source,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return hay.includes(q);
      });
    }

    if (starOnly) {
      list = list.filter((m) => starred[m.id]);
    }

    const withDate = (s?: string | null) => {
      if (!s) return NaN;
      const t = new Date(s).getTime();
      return Number.isNaN(t) ? NaN : t;
    };

    const sorted = [...list].sort((a, b) => {
      if (sort === "score_desc") return (b.score || 0) - (a.score || 0);

      if (sort === "posted_desc") {
        const tb = withDate(b.postedDate);
        const ta = withDate(a.postedDate);
        if (Number.isNaN(tb) && Number.isNaN(ta)) return 0;
        if (Number.isNaN(tb)) return -1;
        if (Number.isNaN(ta)) return 1;
        return tb - ta;
      }

      if (sort === "due_asc") {
        const ta = withDate(a.dueDate);
        const tb = withDate(b.dueDate);
        if (Number.isNaN(ta) && Number.isNaN(tb)) return 0;
        if (Number.isNaN(ta)) return 1;
        if (Number.isNaN(tb)) return -1;
        return ta - tb;
      }

      // title_asc
      return (a.title || "").localeCompare(b.title || "");
    });

    return sorted;
  }, [matches, query, sort, starOnly, starred]);

  const starCount = useMemo(
    () => Object.values(starred).filter(Boolean).length,
    [starred]
  );

  // --- Light theme styles (high contrast) ---
  const PAGE = "bg-[#EAF3FF] text-slate-900";
  const WRAP = "mx-auto max-w-6xl px-4 pb-16 pt-10";
  const H1 = "text-4xl font-extrabold tracking-tight text-slate-900";
  const SUB = "mt-2 text-sm text-slate-600";

  const BTN_PRIMARY =
    "inline-flex items-center justify-center rounded-2xl bg-[#1A4FA3] px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#15428B] transition disabled:opacity-60";
  const BTN_SOFT =
    "inline-flex items-center justify-center rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-900 ring-1 ring-slate-200 hover:bg-slate-50 transition disabled:opacity-60";
  const BTN_TINY =
    "inline-flex items-center justify-center rounded-full bg-white px-3 py-2 text-xs font-semibold text-slate-900 ring-1 ring-slate-200 hover:bg-slate-50 transition";

  const INPUT =
    "h-11 w-full rounded-2xl bg-white px-4 text-sm text-slate-900 placeholder:text-slate-400 ring-1 ring-slate-200 focus:outline-none focus:ring-2 focus:ring-[#1A4FA3]/25";
  const SELECT =
    "h-11 w-full rounded-2xl bg-white px-4 text-sm text-slate-900 ring-1 ring-slate-200 focus:outline-none focus:ring-2 focus:ring-[#1A4FA3]/25";

  const CARD =
    "rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/80 hover:shadow-md transition";
  const TITLE = "text-base font-semibold text-slate-900";
  const MUTED = "text-xs text-slate-600";
  const CHIP =
    "inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 ring-1 ring-slate-200";
  const SCORE =
    "inline-flex min-w-[44px] items-center justify-center rounded-full bg-[#1A4FA3]/10 px-3 py-1 text-xs font-extrabold text-[#1A4FA3] ring-1 ring-[#1A4FA3]/20";

  return (
    <main className={PAGE}>
      <div className={WRAP}>
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="text-xs font-semibold tracking-widest text-slate-500">
              AMBIT
            </div>
            <h1 className={H1}>Opportunity matches</h1>
            <p className={SUB}>
              Ranked opportunities tailored to your profile.
            </p>

            {err ? (
              <div className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200">
                {err}
              </div>
            ) : null}

            {data?.access && !data.access.isActive ? (
              <div className="mt-4 rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-900 ring-1 ring-amber-200">
                Your subscription isn’t active. You can still browse, but full
                details may be limited.
              </div>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center gap-2 md:justify-end">
            <button
              className={BTN_SOFT}
              onClick={() => setShowProfile(true)}
              type="button"
            >
              Edit profile
            </button>

            <button
              className={BTN_SOFT}
              onClick={() => fetchMatches(true)}
              type="button"
              disabled={refreshing}
              aria-busy={refreshing}
            >
              {refreshing ? "Refreshing…" : "Refresh"}
            </button>

            <Link className={BTN_PRIMARY} href="/">
              Back home
            </Link>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-3 md:grid-cols-3 md:items-end">
          <div className="md:col-span-2">
            <input
              className={INPUT}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by title, location, NAICS, agency, keywords…"
            />
            <div className="mt-1 text-xs text-slate-500">
              Filters update instantly.
            </div>
          </div>

          <div>
            <div className="mb-1 text-xs font-semibold text-slate-600">Sort</div>
            <select
              className={SELECT}
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
            >
              <option value="score_desc">Highest score</option>
              <option value="posted_desc">Newest posted</option>
              <option value="due_asc">Soonest due date</option>
              <option value="title_asc">Title (A → Z)</option>
            </select>

            <div className="mt-2 flex items-center justify-between">
              <div className="text-xs text-slate-600">Starred: {starCount}</div>
              <label className="flex items-center gap-2 text-xs text-slate-700">
                <input
                  type="checkbox"
                  checked={starOnly}
                  onChange={(e) => setStarOnly(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300"
                />
                Show starred only
              </label>
            </div>
          </div>
        </div>

        <div className="mt-10 flex items-center justify-between">
          <div className="text-sm font-semibold text-slate-800">Matches</div>
          <div className="text-xs text-slate-500">
            Showing {filtered.length} of {matches.length}
          </div>
        </div>

        <div className="mt-3 space-y-3">
          {loading ? (
            <div className="rounded-2xl bg-white px-4 py-4 text-sm text-slate-600 ring-1 ring-slate-200">
              Loading matches…
            </div>
          ) : null}

          {!loading && filtered.length === 0 ? (
            <div className="rounded-2xl bg-white px-4 py-4 text-sm text-slate-600 ring-1 ring-slate-200">
              No matches found. Try clearing your search or widening your
              service area.
            </div>
          ) : null}

          {filtered.map((m) => {
            const score = clampScore(m.score || 0);
            const isStarred = !!starred[m.id];

            return (
              <div key={m.id} className={cx(CARD, "px-4 py-4")}>
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className={TITLE}>{m.title || "Untitled"}</div>

                    <div className="mt-2 flex flex-wrap gap-2">
                      {m.location ? <span className={CHIP}>{m.location}</span> : null}
                      {m.agency ? <span className={CHIP}>{m.agency}</span> : null}
                      {m.naics ? <span className={CHIP}>NAICS {m.naics}</span> : null}
                      {m.segment ? <span className={CHIP}>{m.segment}</span> : null}
                    </div>

                    <div className="mt-2 flex flex-wrap gap-3">
                      {m.postedDate ? (
                        <div className={MUTED}>Posted {fmtDate(m.postedDate)}</div>
                      ) : null}
                      {m.dueDate ? (
                        <div className={MUTED}>Due {fmtDate(m.dueDate)}</div>
                      ) : null}
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    <button
                      type="button"
                      className={BTN_TINY}
                      onClick={() =>
                        setStarred((s) => ({ ...s, [m.id]: !s[m.id] }))
                      }
                      aria-label={isStarred ? "Unstar" : "Star"}
                      title={isStarred ? "Unstar" : "Star"}
                    >
                      {isStarred ? "★" : "☆"}
                    </button>

                    <span className={SCORE} title="Match score (0–100)">
                      {score}
                    </span>

                    {m.url ? (
                      <a
                        className={BTN_TINY}
                        href={m.url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Source
                      </a>
                    ) : (
                      <span className={cx(BTN_TINY, "opacity-60")}>Source</span>
                    )}
                  </div>
                </div>

                {m.summary ? (
                  <p className="mt-3 text-sm text-slate-700 line-clamp-3">
                    {m.summary}
                  </p>
                ) : null}

                {m.reasons?.length ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {m.reasons.slice(0, 4).map((r, idx) => (
                      <span key={idx} className={cx(CHIP, "bg-[#EAF3FF]")}>
                        {r}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>

      {/* Profile editor modal */}
      {showProfile ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => setShowProfile(false)}
          />
          <div className="relative w-full max-w-2xl rounded-3xl bg-white p-5 shadow-xl ring-1 ring-slate-200">
            <div className="mb-3 flex items-center justify-between">
              <div className="text-sm font-semibold text-slate-900">
                Edit profile
              </div>
              <button
                className={BTN_TINY}
                onClick={() => setShowProfile(false)}
                type="button"
              >
                Close
              </button>
            </div>

            {/* If your ProfileEditor props differ, adjust here. */}
            {/* @ts-ignore */}
           <ProfileEditorAny
  customerId={customerId}
  onClose={() => setShowProfile(false)}
  onSaved={() => {
    setShowProfile(false);
    fetchMatches(true);
  }}
/>

          </div>
        </div>
      ) : null}
    </main>
  );
}
