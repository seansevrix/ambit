"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type ComponentType } from "react";
import { useParams, useSearchParams } from "next/navigation";
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

const API_BASE = (
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_BASE ||
  (process.env.NODE_ENV === "development"
    ? "http://localhost:5001"
    : "https://ambit-0dnp.onrender.com")
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

function prettyErr(e: any) {
  if (e?.name === "AbortError") {
    return "Server is waking up — please retry in a few seconds.";
  }
  return e?.message || "Failed to load matches.";
}

function buildPursueHref(match: Match, customerId: number) {
  const subject = encodeURIComponent(`Let's Pursue: ${match.title || "Opportunity"}`);
  const body = encodeURIComponent(
    [
      "Hi Ambit team,",
      "",
      "I'd like to pursue this opportunity.",
      "",
      `Customer ID: ${customerId}`,
      `Opportunity: ${match.title || "N/A"}`,
      `Agency: ${match.agency || "N/A"}`,
      `Location: ${match.location || "N/A"}`,
      `NAICS: ${match.naics || "N/A"}`,
      `Source: ${match.url || "N/A"}`,
      "",
      "Please begin the pursuit and let me know next steps.",
    ].join("\n")
  );

  return `mailto:ambit@sevrixgov.com?subject=${subject}&body=${body}`;
}

function looksLikeRawNoticeSummary(summary?: string | null) {
  const s = String(summary || "").trim().toLowerCase();
  if (!s) return true;

  return (
    s.startsWith("http://") ||
    s.startsWith("https://") ||
    s.includes("api.sam.gov/prod/opportunities") ||
    s.includes("noticedesc?noticeid=")
  );
}

function buildReadableSummary(match: Match) {
  const raw = String(match.summary || "").trim();

  if (raw && !looksLikeRawNoticeSummary(raw)) {
    return raw;
  }

  const parts = [
    match.title ? `${match.title}.` : "This opportunity is currently active.",
    match.agency ? `Buyer: ${match.agency}.` : null,
    match.location ? `Location: ${match.location}.` : null,
    match.naics ? `NAICS: ${match.naics}.` : null,
    match.dueDate ? `Current due date: ${fmtDate(match.dueDate)}.` : null,
    "Review the official source for full scope, requirements, and submission instructions.",
  ].filter(Boolean);

  return parts.join(" ");
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
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});

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
        throw new Error((json as any)?.error || `Failed to load matches (${res.status})`);
      }

      setData(json);
    } catch (e: any) {
      setErr(prettyErr(e));
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

    const toTime = (s?: string | null) => {
      if (!s) return NaN;
      const t = new Date(s).getTime();
      return Number.isNaN(t) ? NaN : t;
    };

    return [...list].sort((a, b) => {
      if (sort === "score_desc") return (b.score || 0) - (a.score || 0);

      if (sort === "posted_desc") {
        const tb = toTime(b.postedDate);
        const ta = toTime(a.postedDate);
        if (Number.isNaN(tb) && Number.isNaN(ta)) return 0;
        if (Number.isNaN(tb)) return -1;
        if (Number.isNaN(ta)) return 1;
        return tb - ta;
      }

      if (sort === "due_asc") {
        const ta = toTime(a.dueDate);
        const tb = toTime(b.dueDate);
        if (Number.isNaN(ta) && Number.isNaN(tb)) return 0;
        if (Number.isNaN(ta)) return 1;
        if (Number.isNaN(tb)) return -1;
        return ta - tb;
      }

      return (a.title || "").localeCompare(b.title || "");
    });
  }, [matches, query, sort, starOnly, starred]);

  const starCount = useMemo(
    () => Object.values(starred).filter(Boolean).length,
    [starred]
  );

  return (
    <main className="min-h-screen bg-[#EAF3FF] text-slate-900">
      <div className="mx-auto max-w-6xl px-4 pb-16 pt-10">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Ambit
            </div>
            <h1 className="mt-2 text-4xl font-extrabold tracking-tight text-slate-900">
              Opportunity Matches
            </h1>
            <p className="mt-2 text-[15px] text-slate-600">
              Ranked opportunities tailored to your profile.
            </p>

            {err ? (
              <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {err}
              </div>
            ) : null}

            {data?.access && !data.access.isActive ? (
              <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                Your subscription isn’t active. You can still browse, but full
                details may be limited.
              </div>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center gap-2 md:justify-end">
            <button
              className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
              onClick={() => setShowProfile(true)}
              type="button"
            >
              Edit profile
            </button>

            <button
              className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-50 disabled:opacity-60"
              onClick={() => fetchMatches(true)}
              type="button"
              disabled={refreshing}
              aria-busy={refreshing}
            >
              {refreshing ? "Refreshing…" : "Refresh"}
            </button>

            <Link
              className="inline-flex items-center justify-center rounded-2xl bg-[#1A4FA3] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#15428B]"
              href="/"
            >
              Back home
            </Link>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-3 md:grid-cols-3 md:items-end">
          <div className="md:col-span-2">
            <input
              className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1A4FA3]/20"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by title, location, NAICS, agency, keywords..."
            />
            <div className="mt-2 text-xs text-slate-500">Filters update instantly.</div>
          </div>

          <div>
            <div className="mb-2 text-xs font-semibold text-slate-600">Sort</div>
            <select
              className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1A4FA3]/20"
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
            >
              <option value="score_desc">Highest score</option>
              <option value="posted_desc">Newest posted</option>
              <option value="due_asc">Soonest due date</option>
              <option value="title_asc">Title (A → Z)</option>
            </select>

            <div className="mt-3 flex items-center justify-between">
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
            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm text-slate-600">
              Loading matches…
            </div>
          ) : null}

          {!loading && filtered.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm text-slate-600">
              No matches found. Try clearing your search or widening your service area.
            </div>
          ) : null}

          {filtered.map((m) => {
            const score = clampScore(m.score || 0);
            const isStarred = !!starred[m.id];
            const isExpanded = !!expanded[m.id];
            const readableSummary = buildReadableSummary(m);
            const showToggle = readableSummary.length > 520;
            const visibleSummary =
              isExpanded || !showToggle
                ? readableSummary
                : `${readableSummary.slice(0, 520)}…`;

            return (
              <div
                key={m.id}
                className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="text-[28px] font-semibold tracking-tight text-slate-900">
                      {m.title || "Untitled"}
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {m.location ? (
                        <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700">
                          {m.location}
                        </span>
                      ) : null}

                      {m.agency ? (
                        <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700">
                          {m.agency}
                        </span>
                      ) : null}

                      {m.naics ? (
                        <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700">
                          NAICS {m.naics}
                        </span>
                      ) : null}

                      {m.segment ? (
                        <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700">
                          {m.segment}
                        </span>
                      ) : null}
                    </div>

                    <div className="mt-3 flex flex-wrap gap-3 text-sm text-slate-600">
                      {m.postedDate ? <div>Posted {fmtDate(m.postedDate)}</div> : null}
                      {m.dueDate ? <div>Due {fmtDate(m.dueDate)}</div> : null}
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    <button
                      type="button"
                      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
                      onClick={() =>
                        setStarred((s) => ({ ...s, [m.id]: !s[m.id] }))
                      }
                      aria-label={isStarred ? "Unstar" : "Star"}
                      title={isStarred ? "Unstar" : "Star"}
                    >
                      {isStarred ? "★" : "☆"}
                    </button>

                    <span
                      className="inline-flex min-w-[50px] items-center justify-center rounded-full bg-[#1A4FA3]/10 px-3 py-2 text-sm font-extrabold text-[#1A4FA3] ring-1 ring-[#1A4FA3]/15"
                      title="Match score"
                    >
                      {score}
                    </span>

                    {m.url ? (
                      <a
                        className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
                        href={m.url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Source
                      </a>
                    ) : (
                      <span className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-400">
                        Source
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-5 grid gap-4 lg:grid-cols-[1.45fr_0.85fr]">
                  <div className="rounded-[22px] border border-slate-200 bg-white p-5">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                      Opportunity Summary
                    </div>

                    <p className="mt-3 text-[15px] leading-7 text-slate-700">
                      {visibleSummary}
                    </p>

                    {showToggle ? (
                      <button
                        type="button"
                        onClick={() =>
                          setExpanded((prev) => ({
                            ...prev,
                            [m.id]: !prev[m.id],
                          }))
                        }
                        className="mt-3 text-sm font-semibold text-[#1A4FA3] underline underline-offset-4"
                      >
                        {isExpanded ? "Show less" : "Show more"}
                      </button>
                    ) : null}

                    {m.reasons?.length ? (
                      <div className="mt-6">
                        <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                          Why It Matched
                        </div>

                        <ul className="mt-3 list-disc space-y-2 pl-5 text-[14px] leading-6 text-slate-700">
                          {m.reasons.map((reason, idx) => (
                            <li key={idx}>{reason}</li>
                          ))}
                        </ul>
                      </div>
                    ) : null}

                    {m.profileIncomplete ? (
                      <div className="mt-5 rounded-2xl border border-blue-100 bg-[#F8FBFF] px-4 py-3 text-sm text-slate-700">
                        Profile incomplete — add services, keywords, and NAICS for
                        better matches.
                      </div>
                    ) : null}
                  </div>

                  <div className="rounded-[22px] border border-slate-200 bg-[#F8FBFF] p-5">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                      Next Step
                    </div>

                    <p className="mt-3 text-[15px] leading-7 text-slate-700">
                      If you want to move on this opportunity, Ambit can begin the
                      pursuit and help organize the front-end process.
                    </p>

                    <div className="mt-5 flex flex-col gap-2">
                      <a
                        href={buildPursueHref(m, customerId)}
                        className="inline-flex items-center justify-center rounded-2xl bg-[#1A4FA3] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#15428B]"
                      >
                        Let’s Pursue
                      </a>

                      {m.url ? (
                        <a
                          href={m.url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
                        >
                          View Source
                        </a>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {showProfile ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => setShowProfile(false)}
          />
          <div className="relative w-full max-w-2xl rounded-3xl bg-white p-5 shadow-xl ring-1 ring-slate-200">
            <div className="mb-3 flex items-center justify-between">
              <div className="text-sm font-semibold text-slate-900">Edit profile</div>
              <button
                className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-900 transition hover:bg-slate-50"
                onClick={() => setShowProfile(false)}
                type="button"
              >
                Close
              </button>
            </div>

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