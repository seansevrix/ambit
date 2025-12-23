"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

type MatchItem = {
  id?: number;
  title?: string;
  location?: string;
  naics?: string;
  score?: number;

  agency?: string | null;
  url?: string | null;
  postedDate?: string | null; // ISO string
  summary?: string | null;
  reasons?: string[];
  profileIncomplete?: boolean;

  [key: string]: any;
};

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

export default function MatchesClient({ customerId }: { customerId: number }) {
  const baseUrl = useMemo(
    () => process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5001",
    []
  );

  const [loading, setLoading] = useState(true);
  const [needsSub, setNeedsSub] = useState(false);
  const [matches, setMatches] = useState<MatchItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const toggleExpanded = (key: string) => {
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    setNeedsSub(false);

    try {
      const res = await fetch(`${baseUrl}/engine/matches/${customerId}`, {
        cache: "no-store",
      });

      if (res.status === 402) {
        setNeedsSub(true);
        setMatches([]);
        return;
      }

      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(txt || `Matches failed: ${res.status}`);
      }

      const data = await res.json();
      setMatches(data?.matches ?? []);
    } catch (e: any) {
      setError(e?.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [baseUrl, customerId]);

  const startCheckout = useCallback(async () => {
    setError(null);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerId }),
      });

      const txt = await res.text();
      if (!res.ok) throw new Error(txt || `Checkout failed: ${res.status}`);

      const { url } = JSON.parse(txt);
      window.location.href = url;
    } catch (e: any) {
      setError(e?.message || "Checkout error");
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

  if (loading) {
    return (
      <div style={styles.shell}>
        <div style={styles.container}>
          <div style={styles.pageHeader}>
            <div>
              <div style={styles.kicker}>AMBIT</div>
              <h1 style={styles.h1}>Scouting Report</h1>
              <div style={styles.subtle}>Customer #{customerId}</div>
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
      <div style={styles.container}>
        <div style={styles.pageHeader}>
          <div>
            <div style={styles.kicker}>AMBIT</div>
            <h1 style={styles.h1}>Scouting Report</h1>
            <div style={styles.subtle}>Customer #{customerId}</div>
          </div>

          <div style={styles.headerActions}>
            <button onClick={load} style={styles.ghostBtn}>
              Refresh
            </button>
          </div>
        </div>

        {needsSub ? (
          <div style={styles.card}>
            <div style={styles.paywallRow}>
              <div>
                <div style={styles.sectionTitle}>Subscription Required</div>
                <div style={styles.body}>
                  This customer is inactive. Subscribe to unlock match results.
                </div>
              </div>

              <div style={styles.paywallBtns}>
                <button onClick={startCheckout} style={styles.primaryBtn}>
                  Subscribe
                </button>
                <button onClick={load} style={styles.ghostBtn}>
                  I already subscribed → Refresh
                </button>
              </div>
            </div>

            {error ? <div style={styles.errorText}>Error: {error}</div> : null}
          </div>
        ) : (
          <>
            {error ? (
              <div style={{ ...styles.card, borderColor: "rgba(220,38,38,.35)" }}>
                <div style={styles.errorText}>Error: {error}</div>
              </div>
            ) : null}

            {matches.length === 0 ? (
              <div style={styles.card}>
                <div style={styles.sectionTitle}>No matches yet</div>
                <div style={styles.body}>
                  Add more customer info (services, keywords, NAICS) and more opportunities.
                </div>
              </div>
            ) : (
              <div style={{ display: "grid", gap: 14 }}>
                {matches.map((m, idx) => {
                  const key = String(m.id ?? idx);
                  const posted = formatDate(m.postedDate);
                  const agency = safeStr(m.agency) || "Unknown agency";
                  const title = safeStr(m.title) || "Untitled opportunity";
                  const location = safeStr(m.location) || "Unknown location";
                  const naics = safeStr(m.naics);
                  const score = typeof m.score === "number" ? m.score : undefined;
                  const label = scoreLabel(score);
                  const reasons = Array.isArray(m.reasons) ? m.reasons : [];

                  const fullSummary = safeStr(m.summary);
                  const isExpanded = !!expanded[key];

                  // Show a “real” summary length by default; allow collapsing if very long.
                  const summaryToShow =
                    !fullSummary
                      ? null
                      : isExpanded
                        ? fullSummary
                        : fullSummary.length > 900
                          ? fullSummary.slice(0, 900) + "…"
                          : fullSummary;

                  const hasLongSummary = !!fullSummary && fullSummary.length > 900;

                  return (
                    <div key={key} style={styles.card}>
                      <div style={styles.reportTopRow}>
                        <div style={{ minWidth: 0 }}>
                          <div style={styles.titleRow}>
                            <div style={styles.title}>{title}</div>
                          </div>

                          <div style={styles.metaLine}>
                            <span style={styles.metaStrong}>{agency}</span>
                            <span style={styles.metaDot}>•</span>
                            <span>{location}</span>
                            {naics ? (
                              <>
                                <span style={styles.metaDot}>•</span>
                                <span>NAICS {naics}</span>
                              </>
                            ) : null}
                            {posted ? (
                              <>
                                <span style={styles.metaDot}>•</span>
                                <span>Posted {posted}</span>
                              </>
                            ) : null}
                          </div>
                        </div>

                        <div style={styles.scoreBox}>
                          <div style={styles.scoreKicker}>Match</div>
                          <div style={styles.scoreValue}>
                            {typeof score === "number" ? score : "?"}
                          </div>
                          <div style={styles.scoreLabel}>{label}</div>

                          {m.url ? (
                            <a
                              href={m.url}
                              target="_blank"
                              rel="noreferrer"
                              style={styles.linkBtn}
                            >
                              View Source →
                            </a>
                          ) : (
                            <div style={styles.noLink}>No source link</div>
                          )}
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
                              Profile incomplete — add services/keywords/NAICS for better matches.
                            </div>
                          ) : null}
                        </div>

                        <div style={styles.section}>
                          <div style={styles.sectionTitle}>Opportunity summary</div>
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
                              No summary yet. (Next step: auto-generate this from the posting.)
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

const styles: Record<string, React.CSSProperties> = {
  shell: {
    minHeight: "100vh",
    padding: "28px 16px",
    background: "#0b0f14",
    color: "rgba(255,255,255,0.92)",
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  },
  container: {
    maxWidth: 1050,
    margin: "0 auto",
  },
  pageHeader: {
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 14,
    marginBottom: 16,
  },
  kicker: {
    fontSize: 12,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    opacity: 0.7,
    marginBottom: 6,
  },
  h1: {
    margin: 0,
    fontSize: 30,
    fontWeight: 900,
    letterSpacing: -0.3,
  },
  subtle: {
    marginTop: 6,
    opacity: 0.7,
    fontSize: 13,
  },
  headerActions: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
  },
  card: {
    borderRadius: 16,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(255,255,255,0.04)",
    padding: 16,
    boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
  },
  loading: {
    fontWeight: 700,
    opacity: 0.9,
  },
  reportTopRow: {
    display: "grid",
    gridTemplateColumns: "1fr 220px",
    gap: 14,
    alignItems: "start",
  },
  titleRow: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 900,
    letterSpacing: -0.2,
    lineHeight: 1.25,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  metaLine: {
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
    alignItems: "center",
    fontSize: 13,
    opacity: 0.85,
    lineHeight: 1.4,
  },
  metaStrong: {
    fontWeight: 800,
    opacity: 0.95,
  },
  metaDot: {
    opacity: 0.55,
  },
  scoreBox: {
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(0,0,0,0.18)",
    padding: 14,
    textAlign: "center",
  },
  scoreKicker: {
    fontSize: 12,
    opacity: 0.7,
    fontWeight: 800,
    textTransform: "uppercase",
    letterSpacing: 1.0,
  },
  scoreValue: {
    fontSize: 40,
    fontWeight: 950,
    letterSpacing: -1,
    marginTop: 6,
    lineHeight: 1.0,
  },
  scoreLabel: {
    marginTop: 6,
    fontSize: 13,
    fontWeight: 800,
    opacity: 0.9,
  },
  linkBtn: {
    display: "inline-block",
    marginTop: 12,
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.12)",
    textDecoration: "none",
    fontWeight: 900,
    color: "rgba(255,255,255,0.92)",
    background: "rgba(255,255,255,0.06)",
  },
  noLink: {
    marginTop: 12,
    fontSize: 12,
    opacity: 0.6,
  },
  grid: {
    marginTop: 14,
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 14,
  },
  section: {
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.08)",
    background: "rgba(255,255,255,0.03)",
    padding: 14,
    minWidth: 0,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: 900,
    textTransform: "uppercase",
    letterSpacing: 1.0,
    opacity: 0.82,
    marginBottom: 10,
  },
  body: {
    fontSize: 14,
    lineHeight: 1.6,
    opacity: 0.92,
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
  },
  list: {
    margin: 0,
    paddingLeft: 18,
  },
  listItem: {
    marginBottom: 6,
    fontSize: 14,
    lineHeight: 1.55,
    opacity: 0.92,
  },
  callout: {
    marginTop: 12,
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(255,255,255,0.05)",
    fontWeight: 800,
    fontSize: 13,
    opacity: 0.9,
  },
  primaryBtn: {
    padding: "10px 14px",
    borderRadius: 12,
    border: "none",
    fontWeight: 900,
    cursor: "pointer",
    background: "rgba(255,255,255,0.92)",
    color: "#0b0f14",
  },
  ghostBtn: {
    padding: "10px 14px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.04)",
    fontWeight: 900,
    cursor: "pointer",
    color: "rgba(255,255,255,0.92)",
  },
  textBtn: {
    marginTop: 10,
    padding: 0,
    border: "none",
    background: "transparent",
    color: "rgba(255,255,255,0.9)",
    cursor: "pointer",
    fontWeight: 900,
    textDecoration: "underline",
  },
  errorText: {
    color: "rgba(248,113,113,0.95)",
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
