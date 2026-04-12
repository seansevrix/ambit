"use client";

import type { CSSProperties } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import ProfileEditor from "./ProfileEditor";

type MatchItem = {
  id?: number;
  title?: string;
  location?: string;
  naics?: string;
  score?: number;

  agency?: string | null;
  url?: string | null;
  postedDate?: string | null;
  summary?: string | null;
  reasons?: string[];
  profileIncomplete?: boolean;

  [key: string]: any;
};

const PROD_BACKEND = "https://ambit-0dnp.onrender.com";
const DEV_BACKEND = "http://localhost:5001";
const FALLBACK =
  process.env.NODE_ENV === "development" ? DEV_BACKEND : PROD_BACKEND;

const API_BASE = (
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_BASE ||
  FALLBACK
).replace(/\/$/, "");

const REQUEST_TIMEOUT_MS = 15000;

function abortableFetch(
  url: string,
  init: RequestInit = {},
  ms = REQUEST_TIMEOUT_MS
) {
  const ac = new AbortController();
  const t = setTimeout(() => ac.abort(), ms);
  return fetch(url, { ...init, signal: ac.signal }).finally(() =>
    clearTimeout(t)
  );
}

function formatDate(iso?: string | null) {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function safeStr(v: any) {
  const s = String(v ?? "").trim();
  return s.length ? s : null;
}

function scoreLabel(score?: number) {
  const s = typeof score === "number" ? score : -1;
  if (s >= 90) return "Elite Fit";
  if (s >= 75) return "Strong Fit";
  if (s >= 60) return "Solid Fit";
  if (s >= 40) return "Possible";
  return "Low";
}

function prettyErr(e: any) {
  if (e?.name === "AbortError") {
    return "Server is waking up — please retry in a few seconds.";
  }
  return e?.message || "Unknown error";
}

function buildPursueHref(args: {
  customerId: number;
  title: string;
  agency: string;
  location: string;
  naics?: string | null;
  url?: string | null;
}) {
  const subject = encodeURIComponent(`Let's Pursue: ${args.title}`);
  const body = encodeURIComponent(
    [
      "Hi Ambit team,",
      "",
      "I'd like to pursue this opportunity.",
      "",
      `Customer ID: ${args.customerId}`,
      `Opportunity: ${args.title}`,
      `Agency: ${args.agency}`,
      `Location: ${args.location}`,
      `NAICS: ${args.naics || "N/A"}`,
      `Source: ${args.url || "N/A"}`,
      "",
      "Please reach out with next steps.",
    ].join("\n")
  );

  return `mailto:ambit@sevrixgov.com?subject=${subject}&body=${body}`;
}

export default function MatchesClient({ customerId }: { customerId: number }) {
  const baseUrl = useMemo(() => API_BASE, []);

  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [needsSub, setNeedsSub] = useState(false);
  const [matches, setMatches] = useState<MatchItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [showProfile, setShowProfile] = useState(false);

  useEffect(() => setMounted(true), []);

  const toggleExpanded = (key: string) => {
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    setNeedsSub(false);

    try {
      const res = await abortableFetch(
        `${baseUrl}/engine/matches/${customerId}`,
        {
          method: "GET",
          cache: "no-store",
          credentials: "include",
        },
        REQUEST_TIMEOUT_MS
      );

      if (res.status === 402) {
        setNeedsSub(true);
        setMatches([]);
        return;
      }

      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(txt || `Matches failed: ${res.status}`);
      }

      const data = await res.json().catch(() => ({}));
      setMatches(Array.isArray(data?.matches) ? data.matches : []);
    } catch (e: any) {
      setError(prettyErr(e));
    } finally {
      setLoading(false);
    }
  }, [baseUrl, customerId]);

  const startCheckout = useCallback(async () => {
    setError(null);

    try {
      const res = await abortableFetch(
        "/api/stripe/checkout",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ customerId }),
        },
        REQUEST_TIMEOUT_MS
      );

      const txt = await res.text().catch(() => "");
      if (!res.ok) {
        throw new Error(txt || `Checkout failed: ${res.status}`);
      }

      const { url } = JSON.parse(txt || "{}");
      if (!url) {
        throw new Error("Missing checkout URL.");
      }

      window.location.href = url;
    } catch (e: any) {
      setError(prettyErr(e));
    }
  }, [customerId]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    if (sp.get("checkout") !== "success") return;

    window.history.replaceState({}, "", window.location.pathname);

    let attempts = 0;
    const timer = setInterval(async () => {
      attempts += 1;
      await load();
      if (attempts >= 10) clearInterval(timer);
    }, 2000);

    return () => clearInterval(timer);
  }, [load]);

  useEffect(() => {
    if (!showProfile) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [showProfile]);

  useEffect(() => {
    const cls = "ambit-hide-nav";
    try {
      if (showProfile) document.body.classList.add(cls);
      else document.body.classList.remove(cls);
    } catch {
      // ignore
    }

    return () => {
      try {
        document.body.classList.remove(cls);
      } catch {
        // ignore
      }
    };
  }, [showProfile]);

  useEffect(() => {
    if (!showProfile) return;

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setShowProfile(false);
    }

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showProfile]);

  const profileModal =
    mounted && showProfile
      ? createPortal(
          <div style={styles.profileOverlay} role="dialog" aria-modal="true">
            <div
              style={styles.profileBackdrop}
              onClick={() => setShowProfile(false)}
            />

            <div
              style={styles.profilePanelWrap}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={styles.profileTopRow}>
                <div style={styles.profileTitle}>Edit profile</div>
                <button
                  onClick={() => setShowProfile(false)}
                  style={styles.profileCloseBtn}
                >
                  Close
                </button>
              </div>

              <div style={styles.profileScroll}>
                <ProfileEditor
                  customerId={customerId}
                  onSaved={() => {
                    void load();
                  }}
                />
              </div>
            </div>
          </div>,
          document.body
        )
      : null;

  if (loading) {
    return (
      <div style={styles.shell}>
        <div style={styles.container}>
          <div style={styles.pageHeader}>
            <div>
              <div style={styles.kicker}>AMBIT</div>
              <h1 style={styles.h1}>Opportunity Matches</h1>
              <div style={styles.subtle}>
                Ranked opportunities tailored to your profile.
              </div>
            </div>
          </div>

          <div style={styles.card}>
            <div style={styles.loading}>Loading matches…</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.shell}>
      {profileModal}

      <div style={styles.container}>
        <div style={styles.pageHeader}>
          <div>
            <div style={styles.kicker}>AMBIT</div>
            <h1 style={styles.h1}>Opportunity Matches</h1>
            <div style={styles.subtle}>
              Ranked opportunities tailored to your profile.
            </div>
          </div>

          <div style={styles.headerActions}>
            <button
              onClick={() => setShowProfile(true)}
              style={styles.secondaryBtn}
            >
              Edit profile
            </button>
            <button onClick={load} style={styles.secondaryBtn}>
              Refresh
            </button>
          </div>
        </div>

        {needsSub ? (
          <div style={styles.card}>
            <div style={styles.paywallRow}>
              <div>
                <div style={styles.sectionTitle}>Subscription required</div>
                <div style={styles.body}>
                  This customer is inactive. Subscribe to unlock match results.
                </div>
              </div>

              <div style={styles.paywallBtns}>
                <button onClick={startCheckout} style={styles.primaryBtn}>
                  Subscribe
                </button>
                <button onClick={load} style={styles.secondaryBtn}>
                  I already subscribed
                </button>
              </div>
            </div>

            {error ? <div style={styles.errorText}>Error: {error}</div> : null}
          </div>
        ) : (
          <>
            {error ? (
              <div
                style={{
                  ...styles.card,
                  border: "1px solid rgba(220,38,38,0.18)",
                  background: "rgba(255,255,255,0.92)",
                }}
              >
                <div style={styles.errorText}>Error: {error}</div>
              </div>
            ) : null}

            {matches.length === 0 ? (
              <div style={styles.card}>
                <div style={styles.sectionTitle}>No matches yet</div>
                <div style={styles.body}>
                  Add more customer info like services, keywords, and NAICS to
                  improve match quality.
                </div>
              </div>
            ) : (
              <div style={styles.matchesWrap}>
                {matches.map((m, idx) => {
                  const key = String(m.id ?? idx);
                  const posted = formatDate(m.postedDate);
                  const agency = safeStr(m.agency) || "Unknown agency";
                  const title = safeStr(m.title) || "Untitled opportunity";
                  const location = safeStr(m.location) || "Unknown location";
                  const naics = safeStr(m.naics);
                  const score =
                    typeof m.score === "number" ? m.score : undefined;
                  const label = scoreLabel(score);
                  const reasons = Array.isArray(m.reasons) ? m.reasons : [];
                  const fullSummary = safeStr(m.summary);
                  const isExpanded = !!expanded[key];

                  const summaryToShow = !fullSummary
                    ? null
                    : isExpanded
                    ? fullSummary
                    : fullSummary.length > 900
                    ? `${fullSummary.slice(0, 900)}…`
                    : fullSummary;

                  const hasLongSummary =
                    !!fullSummary && fullSummary.length > 900;

                  const pursueHref = buildPursueHref({
                    customerId,
                    title,
                    agency,
                    location,
                    naics,
                    url: m.url,
                  });

                  return (
                    <div key={key} style={styles.card}>
                      <div style={styles.reportTopRow}>
                        <div style={{ minWidth: 0 }}>
                          <div style={styles.titleRow}>
                            <div style={styles.title}>{title}</div>
                          </div>

                          <div style={styles.metaRow}>
                            <span style={styles.metaChip}>{location}</span>
                            <span style={styles.metaChip}>{agency}</span>
                            {naics ? (
                              <span style={styles.metaChip}>NAICS {naics}</span>
                            ) : null}
                            {posted ? (
                              <span style={styles.metaChip}>
                                Posted {posted}
                              </span>
                            ) : null}
                          </div>
                        </div>

                        <div style={styles.scoreBox}>
                          <div style={styles.scoreKicker}>Match score</div>
                          <div style={styles.scoreValue}>
                            {typeof score === "number" ? score : "?"}
                          </div>
                          <div style={styles.scoreLabel}>{label}</div>

                          <div style={styles.scoreActions}>
                            {m.url ? (
                              <a
                                href={m.url}
                                target="_blank"
                                rel="noreferrer"
                                style={styles.linkBtn}
                              >
                                View Source
                              </a>
                            ) : (
                              <div style={styles.noLink}>No source link</div>
                            )}

                            <a href={pursueHref} style={styles.pursueBtn}>
                              Let’s Pursue
                            </a>
                          </div>
                        </div>
                      </div>

                      <div style={styles.grid}>
                        <div style={styles.section}>
                          <div style={styles.sectionTitle}>Why it matched</div>

                          {reasons.length ? (
                            <ul style={styles.list}>
                              {reasons.map((r, i2) => (
                                <li key={i2} style={styles.listItem}>
                                  {r}
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <div style={styles.body}>No reasons returned.</div>
                          )}

                          {m.profileIncomplete ? (
                            <div style={styles.callout}>
                              Profile incomplete — add services, keywords, and
                              NAICS for better matches.
                            </div>
                          ) : null}
                        </div>

                        <div style={styles.section}>
                          <div style={styles.sectionTitle}>
                            Opportunity summary
                          </div>

                          {summaryToShow ? (
                            <>
                              <div style={styles.body}>{summaryToShow}</div>

                              {hasLongSummary ? (
                                <button
                                  onClick={() => toggleExpanded(key)}
                                  style={styles.textBtn}
                                >
                                  {isExpanded ? "Show less" : "Show more"}
                                </button>
                              ) : null}
                            </>
                          ) : (
                            <div style={styles.body}>
                              No summary yet. The source is still available for
                              review.
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

const styles: Record<string, CSSProperties> = {
  shell: {
    minHeight: "100vh",
    padding: "32px 16px 48px",
    background: "#EAF3FF",
    color: "#0F172A",
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  },
  container: {
    maxWidth: 1180,
    margin: "0 auto",
  },
  pageHeader: {
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 16,
    flexWrap: "wrap",
    marginBottom: 18,
  },
  kicker: {
    fontSize: 12,
    letterSpacing: 1.4,
    textTransform: "uppercase",
    color: "rgba(25, 55, 109, 0.70)",
    marginBottom: 8,
    fontWeight: 800,
  },
  h1: {
    margin: 0,
    fontSize: 32,
    fontWeight: 900,
    letterSpacing: -0.6,
    color: "#0F172A",
  },
  subtle: {
    marginTop: 8,
    color: "rgba(15, 23, 42, 0.62)",
    fontSize: 15,
    lineHeight: 1.5,
  },
  headerActions: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
  },
  matchesWrap: {
    display: "grid",
    gap: 14,
  },
  card: {
    borderRadius: 24,
    border: "1px solid rgba(15, 23, 42, 0.08)",
    background: "rgba(255,255,255,0.96)",
    padding: 18,
    boxShadow: "0 10px 30px rgba(15,23,42,0.06)",
  },
  loading: {
    fontWeight: 700,
    color: "rgba(15, 23, 42, 0.80)",
  },

  profileOverlay: {
    position: "fixed",
    inset: 0,
    zIndex: 2147483647,
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
    padding: "92px 14px 18px",
  },
  profileBackdrop: {
    position: "fixed",
    inset: 0,
    background: "rgba(15, 23, 42, 0.28)",
    backdropFilter: "blur(4px)",
  },
  profilePanelWrap: {
    position: "relative",
    width: "100%",
    maxWidth: 980,
    borderRadius: 22,
    overflow: "hidden",
    boxShadow: "0 30px 90px rgba(15,23,42,0.25)",
    background: "rgba(255,255,255,0.98)",
  },
  profileTopRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    padding: "14px 16px",
    background: "rgba(255,255,255,0.98)",
    borderBottom: "1px solid rgba(15,23,42,0.08)",
  },
  profileTitle: {
    fontWeight: 900,
    color: "#0F172A",
  },
  profileCloseBtn: {
    padding: "9px 13px",
    borderRadius: 999,
    border: "1px solid rgba(15,23,42,0.10)",
    background: "white",
    fontWeight: 800,
    cursor: "pointer",
    color: "#0F172A",
  },
  profileScroll: {
    padding: 14,
    maxHeight: "calc(100vh - 140px)",
    overflowY: "auto",
  },

  reportTopRow: {
    display: "grid",
    gridTemplateColumns: "1fr 220px",
    gap: 16,
    alignItems: "start",
  },
  titleRow: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 900,
    letterSpacing: -0.25,
    lineHeight: 1.3,
    color: "#0F172A",
  },
  metaRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
    alignItems: "center",
  },
  metaChip: {
    display: "inline-flex",
    alignItems: "center",
    borderRadius: 999,
    border: "1px solid rgba(15,23,42,0.08)",
    background: "#F5F8FF",
    padding: "7px 12px",
    fontSize: 12,
    fontWeight: 700,
    color: "rgba(15,23,42,0.72)",
    lineHeight: 1.2,
  },
  scoreBox: {
    borderRadius: 20,
    border: "1px solid rgba(15,23,42,0.08)",
    background: "#F8FBFF",
    padding: 14,
    textAlign: "center",
  },
  scoreKicker: {
    fontSize: 11,
    color: "rgba(15,23,42,0.48)",
    fontWeight: 800,
    textTransform: "uppercase",
    letterSpacing: 1.1,
  },
  scoreValue: {
    fontSize: 36,
    fontWeight: 950,
    letterSpacing: -1,
    marginTop: 6,
    lineHeight: 1,
    color: "#1D4ED8",
  },
  scoreLabel: {
    marginTop: 6,
    fontSize: 13,
    fontWeight: 800,
    color: "rgba(15,23,42,0.75)",
  },
  scoreActions: {
    marginTop: 14,
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  linkBtn: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "11px 12px",
    borderRadius: 14,
    border: "1px solid rgba(15,23,42,0.10)",
    textDecoration: "none",
    fontWeight: 800,
    color: "#0F172A",
    background: "white",
  },
  pursueBtn: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "11px 12px",
    borderRadius: 14,
    border: "none",
    textDecoration: "none",
    fontWeight: 800,
    color: "white",
    background: "#1D4ED8",
  },
  noLink: {
    padding: "11px 12px",
    borderRadius: 14,
    background: "rgba(15,23,42,0.04)",
    fontSize: 12,
    color: "rgba(15,23,42,0.48)",
    fontWeight: 700,
  },
  grid: {
    marginTop: 16,
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 14,
  },
  section: {
    borderRadius: 18,
    border: "1px solid rgba(15,23,42,0.08)",
    background: "white",
    padding: 16,
    minWidth: 0,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 900,
    textTransform: "uppercase",
    letterSpacing: 1.1,
    color: "rgba(15,23,42,0.52)",
    marginBottom: 10,
  },
  body: {
    fontSize: 14,
    lineHeight: 1.65,
    color: "rgba(15,23,42,0.82)",
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
  },
  list: {
    margin: 0,
    paddingLeft: 18,
  },
  listItem: {
    marginBottom: 7,
    fontSize: 14,
    lineHeight: 1.55,
    color: "rgba(15,23,42,0.82)",
  },
  callout: {
    marginTop: 12,
    padding: "11px 13px",
    borderRadius: 14,
    border: "1px solid rgba(29,78,216,0.10)",
    background: "#F4F8FF",
    fontWeight: 700,
    fontSize: 13,
    color: "rgba(15,23,42,0.76)",
  },
  primaryBtn: {
    padding: "11px 15px",
    borderRadius: 14,
    border: "none",
    fontWeight: 800,
    cursor: "pointer",
    background: "#1D4ED8",
    color: "white",
  },
  secondaryBtn: {
    padding: "11px 15px",
    borderRadius: 14,
    border: "1px solid rgba(15,23,42,0.10)",
    background: "white",
    fontWeight: 800,
    cursor: "pointer",
    color: "#0F172A",
  },
  textBtn: {
    marginTop: 10,
    padding: 0,
    border: "none",
    background: "transparent",
    color: "#1D4ED8",
    cursor: "pointer",
    fontWeight: 800,
    textDecoration: "underline",
  },
  errorText: {
    color: "#B91C1C",
    fontWeight: 800,
    fontSize: 14,
  },
  paywallRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: 16,
    flexWrap: "wrap",
    alignItems: "center",
  },
  paywallBtns: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
  },
};