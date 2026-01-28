"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type IntentKey = "residential" | "commercial" | "government";
type Trade = "gc" | "plumbing" | "landscaping";

type Metric = {
  title: string;
  value: string; // display string (fallback if no animate)
  delta?: string;
  note: string;
  color: "green" | "blue";
  path: string;
  area: string;
  // count-up
  animate?: {
    from: number;
    to: number;
    prefix?: string;
    suffix?: string;
    decimals?: number;
    format?: "comma" | "none";
  };
};

function formatNumber(n: number, format: "comma" | "none" = "comma") {
  if (format === "none") return String(n);
  return n.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

function useCountUp(opts?: Metric["animate"]) {
  const [val, setVal] = useState<number | null>(opts ? opts.from : null);

  useEffect(() => {
    if (!opts) return;

    const start = opts.from;
    const end = opts.to;
    const duration = 900;
    const startTime = performance.now();

    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - startTime) / duration);
      const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
      const next = start + (end - start) * eased;
      setVal(next);
      if (t < 1) raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [opts?.from, opts?.to, opts?.decimals, opts?.format, opts?.prefix, opts?.suffix]);

  if (!opts || val === null) return null;

  const decimals = opts.decimals ?? 0;
  const rounded = Number(val.toFixed(decimals));
  const body =
    opts.format === "none" ? String(rounded) : formatNumber(rounded, opts.format ?? "comma");

  return `${opts.prefix ?? ""}${body}${opts.suffix ?? ""}`;
}

/* -------------------- VISUALS (keep your current feel) -------------------- */

function Sparkline({
  path,
  area,
  tone,
  index,
}: {
  path: string;
  area: string;
  tone: "green" | "blue";
  index: number;
}) {
  const stroke = tone === "green" ? "stroke-emerald-300/90" : "stroke-sky-300/90";
  const glow =
    tone === "green"
      ? "drop-shadow-[0_0_14px_rgba(52,211,153,0.22)]"
      : "drop-shadow-[0_0_14px_rgba(125,211,252,0.20)]";

  return (
    <svg viewBox="0 0 160 48" className={`h-12 w-full ${glow}`} aria-hidden="true">
      <defs>
        <linearGradient id={`fill-${tone}-${index}`} x1="0" y1="0" x2="1" y2="0">
          <stop
            offset="0%"
            stopColor={tone === "green" ? "#34d399" : "#7dd3fc"}
            stopOpacity="0.18"
          />
          <stop
            offset="70%"
            stopColor={tone === "green" ? "#34d399" : "#7dd3fc"}
            stopOpacity="0.10"
          />
          <stop
            offset="100%"
            stopColor={tone === "green" ? "#34d399" : "#7dd3fc"}
            stopOpacity="0.06"
          />
        </linearGradient>

        <linearGradient id={`line-${tone}-${index}`} x1="0" y1="0" x2="1" y2="0">
          <stop
            offset="0%"
            stopColor={tone === "green" ? "#34d399" : "#7dd3fc"}
            stopOpacity="0.65"
          />
          <stop
            offset="100%"
            stopColor={tone === "green" ? "#a7f3d0" : "#bae6fd"}
            stopOpacity="1"
          />
        </linearGradient>
      </defs>

      <path d={area} fill={`url(#fill-${tone}-${index})`} className="animate-fadein" />

      <path
        d={path}
        fill="none"
        className={`${stroke} [stroke:url(#line-${tone}-${index})] stroke-[2.5] [stroke-linecap:round] [stroke-linejoin:round] animate-draw`}
        style={{ animationDelay: `${index * 45}ms` }}
      />
    </svg>
  );
}

function MetricCard({ m, index, tradeKey }: { m: Metric; index: number; tradeKey: string }) {
  // tradeKey included in key to guarantee re-run on toggle even if values match
  const counted = useCountUp(m.animate);

  return (
    <div
      key={`${tradeKey}-${m.title}`}
      className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.03)] transition hover:border-white/15 hover:bg-white/7"
      style={{ animationDelay: `${index * 55}ms` }}
    >
      <div className="pointer-events-none absolute -left-24 -top-24 h-48 w-48 rounded-full bg-white/8 blur-3xl opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <div className="pointer-events-none absolute -right-24 -bottom-24 h-48 w-48 rounded-full bg-white/6 blur-3xl opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-white/80">{m.title}</p>

          <div className="mt-2 flex items-baseline gap-2">
            <p className="text-3xl font-semibold tracking-tight text-white">
              {counted ?? m.value}
            </p>

            {m.delta ? (
              <span className="rounded-full bg-emerald-400/10 px-2 py-1 text-xs font-semibold text-emerald-200 ring-1 ring-emerald-300/20">
                {m.delta}
              </span>
            ) : null}
          </div>

          <p className="mt-1 text-xs text-white/55">{m.note}</p>
        </div>

        <div className="mt-1 flex items-center gap-2">
          <span className="relative inline-flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-300/40" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-300/70" />
          </span>
        </div>
      </div>

      <div className="mt-4">
        <Sparkline path={m.path} area={m.area} tone={m.color} index={index} />
      </div>
    </div>
  );
}

function WindowDots() {
  return (
    <div className="flex items-center gap-2">
      <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
      <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
      <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
    </div>
  );
}

/* -------------------- TOGGLE UI -------------------- */

const TRADE_TABS: Array<{ key: Trade; label: string; icon: string }> = [
  { key: "gc", label: "GC", icon: "🛠️" },
  { key: "plumbing", label: "Plumbing", icon: "🚰" },
  { key: "landscaping", label: "Landscaping", icon: "🌿" },
];

function TradeToggle({ trade, setTrade }: { trade: Trade; setTrade: (t: Trade) => void }) {
  return (
    <div className="inline-flex rounded-2xl border border-white/10 bg-white/5 p-1">
      {TRADE_TABS.map((t) => {
        const active = trade === t.key;
        return (
          <button
            key={t.key}
            type="button"
            onClick={() => setTrade(t.key)}
            className={[
              "inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition",
              active ? "bg-white text-slate-900 shadow-sm" : "text-white/70 hover:text-white",
            ].join(" ")}
            aria-pressed={active}
          >
            <span className="text-base">{t.icon}</span>
            {t.label}
          </button>
        );
      })}
    </div>
  );
}

/* -------------------- DATA: intent + trade -> believable numbers -------------------- */
/**
 * Rule of thumb:
 * - Residential: more matched volume, smaller $/win, faster response.
 * - Commercial: balanced.
 * - Government: fewer matches, larger pipeline, longer response, higher avg value.
 *
 * Trade tweaks:
 * - GC: higher avg value, moderate volume
 * - Plumbing: higher volume in residential, strong response times
 * - Landscaping: highest volume but smaller avg value
 */
function buildMetrics(intent: IntentKey, trade: Trade): Metric[] {
  const base = intent === "residential"
    ? {
        revenueFrom: 2400,
        revenueTo: 2980,
        matchedFrom: 22,
        matchedTo: 31,
        submittedFrom: 5,
        submittedTo: 7,
        wonFrom: 1,
        wonTo: 2,
        pipelineFrom: 12.4,
        pipelineTo: 15.8,
        winRateFrom: 10,
        winRateTo: 13,
        ttrFrom: 2.9,
        ttrTo: 2.4,
        avgFrom: 980,
        avgTo: 1120,
        cpwFrom: 280,
        cpwTo: 250,
      }
    : intent === "government"
    ? {
        revenueFrom: 3100,
        revenueTo: 3720,
        matchedFrom: 10,
        matchedTo: 14,
        submittedFrom: 3,
        submittedTo: 4,
        wonFrom: 0,
        wonTo: 1,
        pipelineFrom: 26.0,
        pipelineTo: 31.5,
        winRateFrom: 7,
        winRateTo: 9,
        ttrFrom: 6.2,
        ttrTo: 5.6,
        avgFrom: 4200,
        avgTo: 5100,
        cpwFrom: 380,
        cpwTo: 360,
      }
    : {
        revenueFrom: 2900,
        revenueTo: 3420,
        matchedFrom: 14,
        matchedTo: 19,
        submittedFrom: 4,
        submittedTo: 6,
        wonFrom: 1,
        wonTo: 2,
        pipelineFrom: 15.2,
        pipelineTo: 18.6,
        winRateFrom: 12,
        winRateTo: 16,
        ttrFrom: 4.9,
        ttrTo: 4.2,
        avgFrom: 1265,
        avgTo: 1380,
        cpwFrom: 330,
        cpwTo: 310,
      };

  const tradeMult =
    trade === "gc"
      ? { matched: 0.92, avg: 1.25, revenue: 1.12, pipeline: 1.18, ttr: 1.05 }
      : trade === "plumbing"
      ? { matched: 1.18, avg: 0.95, revenue: 1.02, pipeline: 0.98, ttr: 0.90 }
      : { matched: 1.25, avg: 0.82, revenue: 0.92, pipeline: 0.90, ttr: 0.95 };

  const rFrom = base.revenueFrom * tradeMult.revenue;
  const rTo = base.revenueTo * tradeMult.revenue;

  const mFrom = Math.round(base.matchedFrom * tradeMult.matched);
  const mTo = Math.round(base.matchedTo * tradeMult.matched);

  const avgFrom = base.avgFrom * tradeMult.avg;
  const avgTo = base.avgTo * tradeMult.avg;

  const pFrom = base.pipelineFrom * tradeMult.pipeline;
  const pTo = base.pipelineTo * tradeMult.pipeline;

  const ttrFrom = base.ttrFrom * tradeMult.ttr;
  const ttrTo = base.ttrTo * tradeMult.ttr;

  const labelIntent =
    intent === "residential" ? "Residential" : intent === "commercial" ? "Commercial" : "Government";
  const labelTrade =
    trade === "gc" ? "GC" : trade === "plumbing" ? "Plumbing" : "Landscaping";

  // keep your original spark paths/areas for consistency
  const paths = {
    a: "M4 28 C18 26, 28 24, 40 22 C52 20, 64 18, 76 18 C88 18, 96 16, 112 14 C128 12, 144 10, 156 10",
    aArea:
      "M4 28 C18 26, 28 24, 40 22 C52 20, 64 18, 76 18 C88 18, 96 16, 112 14 C128 12, 144 10, 156 10 L156 44 L4 44 Z",
    b: "M4 30 C18 30, 28 28, 40 26 C52 24, 64 22, 76 22 C88 22, 102 20, 116 18 C130 16, 142 14, 156 14",
    bArea:
      "M4 30 C18 30, 28 28, 40 26 C52 24, 64 22, 76 22 C88 22, 102 20, 116 18 C130 16, 142 14, 156 14 L156 44 L4 44 Z",
    c: "M4 32 C16 30, 30 28, 44 26 C58 24, 70 22, 84 22 C98 22, 110 20, 124 18 C138 16, 146 14, 156 12",
    cArea:
      "M4 32 C16 30, 30 28, 44 26 C58 24, 70 22, 84 22 C98 22, 110 20, 124 18 C138 16, 146 14, 156 12 L156 44 L4 44 Z",
    d: "M4 34 C20 34, 32 33, 44 32 C58 30, 72 28, 86 26 C100 24, 122 20, 156 16",
    dArea:
      "M4 34 C20 34, 32 33, 44 32 C58 30, 72 28, 86 26 C100 24, 122 20, 156 16 L156 44 L4 44 Z",
  };

  return [
    {
      title: "Monthly Contract Revenue",
      value: `$${formatNumber(Math.round(rTo))}`,
      delta: "+18%",
      note: `for ${labelIntent} · ${labelTrade} (illustrative)`,
      color: "green",
      path: paths.a,
      area: paths.aArea,
      animate: { from: rFrom, to: rTo, prefix: "$", decimals: 0, format: "comma" },
    },
    {
      title: "Opportunities Matched",
      value: String(mTo),
      delta: intent === "government" ? "+28%" : "+36%",
      note: `vs. ${mFrom} prior month`,
      color: "green",
      path: paths.b,
      area: paths.bArea,
      animate: { from: mFrom, to: mTo, decimals: 0, format: "none" },
    },
    {
      title: "Opportunities Submitted",
      value: String(base.submittedTo),
      delta: "+50%",
      note: `vs. ${base.submittedFrom} prior month`,
      color: "green",
      path: paths.c,
      area: paths.cArea,
      animate: { from: base.submittedFrom, to: base.submittedTo, decimals: 0, format: "none" },
    },
    {
      title: "Contracts Won",
      value: String(base.wonTo),
      delta: base.wonFrom === 0 ? "↑" : "+100%",
      note: `vs. ${base.wonFrom} prior month`,
      color: "green",
      path: paths.d,
      area: paths.dArea,
      animate: { from: base.wonFrom, to: base.wonTo, decimals: 0, format: "none" },
    },
    {
      title: "Pipeline Value",
      value: `$${pTo.toFixed(1)}k`,
      delta: "+22%",
      note: `vs. $${pFrom.toFixed(1)}k prior month`,
      color: "green",
      path: "M4 34 C18 33, 30 32, 44 30 C58 28, 74 26, 92 24 C110 22, 132 18, 156 16",
      area:
        "M4 34 C18 33, 30 32, 44 30 C58 28, 74 26, 92 24 C110 22, 132 18, 156 16 L156 44 L4 44 Z",
      animate: { from: pFrom, to: pTo, suffix: "k", decimals: 1, format: "none", prefix: "$" },
    },
    {
      title: "Win Rate",
      value: `${base.winRateTo}%`,
      delta: intent === "government" ? "+2 pts" : "+4 pts",
      note: `vs. ${base.winRateFrom}% prior month`,
      color: "green",
      path: "M4 34 C20 34, 38 33, 56 30 C74 27, 94 24, 116 22 C138 20, 148 18, 156 18",
      area:
        "M4 34 C20 34, 38 33, 56 30 C74 27, 94 24, 116 22 C138 20, 148 18, 156 18 L156 44 L4 44 Z",
      animate: { from: base.winRateFrom, to: base.winRateTo, suffix: "%", decimals: 0, format: "none" },
    },
    {
      title: "Time to Respond",
      value: `${ttrTo.toFixed(1)} hrs`,
      delta: intent === "government" ? "-10%" : "-14%",
      note: `vs. ${ttrFrom.toFixed(1)} hrs prior month`,
      color: "blue",
      path: "M4 34 C18 34, 30 34, 44 33 C58 32, 72 30, 90 28 C108 26, 130 22, 156 18",
      area:
        "M4 34 C18 34, 30 34, 44 33 C58 32, 72 30, 90 28 C108 26, 130 22, 156 18 L156 44 L4 44 Z",
      animate: { from: ttrFrom, to: ttrTo, suffix: " hrs", decimals: 1, format: "none" },
    },
    {
      title: "Avg Contract Value",
      value: `$${formatNumber(Math.round(avgTo))}`,
      delta: "+9%",
      note: `vs. $${formatNumber(Math.round(avgFrom))} prior month`,
      color: "blue",
      path: "M4 34 C20 33, 34 32, 48 30 C62 28, 76 26, 92 24 C108 22, 128 18, 156 16",
      area:
        "M4 34 C20 33, 34 32, 48 30 C62 28, 76 26, 92 24 C108 22, 128 18, 156 16 L156 44 L4 44 Z",
      animate: { from: avgFrom, to: avgTo, prefix: "$", decimals: 0, format: "comma" },
    },
    {
      title: "Cost per Win (effective)",
      value: `$${formatNumber(base.cpwTo)}`,
      delta: "-6%",
      note: `vs. $${formatNumber(base.cpwFrom)} prior month`,
      color: "blue",
      path: "M4 30 C18 30, 30 29, 44 28 C58 26, 72 24, 88 24 C104 24, 126 22, 156 18",
      area:
        "M4 30 C18 30, 30 29, 44 28 C58 26, 72 24, 88 24 C104 24, 126 22, 156 18 L156 44 L4 44 Z",
      animate: { from: base.cpwFrom, to: base.cpwTo, prefix: "$", decimals: 0, format: "comma" },
    },
  ];
}

/* -------------------- COMPONENT -------------------- */

export default function ProofDashboard({ intent = "commercial" }: { intent?: IntentKey }) {
  const [trade, setTrade] = useState<Trade>("gc");

  const updatedText = useMemo(() => "Updated just now", []);

  const metrics = useMemo(() => buildMetrics(intent, trade), [intent, trade]);

  const headline = useMemo(() => {
    const i =
      intent === "residential" ? "Residential" : intent === "government" ? "Government" : "Commercial";
    const t = trade === "gc" ? "GC" : trade === "plumbing" ? "Plumbing" : "Landscaping";
    return `Results for: ${i} · ${t} contractor (illustrative).`;
  }, [intent, trade]);

  return (
    <section className="relative">
      <style>{`
        @keyframes draw {
          from { stroke-dashoffset: 220; opacity: 0.2; }
          to { stroke-dashoffset: 0; opacity: 1; }
        }
        .animate-draw {
          stroke-dasharray: 220;
          stroke-dashoffset: 220;
          animation: draw 900ms ease-out forwards;
        }
        @keyframes fadein {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadein { animation: fadein 520ms ease-out both; }
        @keyframes cardIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .card-in { animation: cardIn 520ms ease-out both; }
      `}</style>

      <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-[#0B1430]/35 p-6 shadow-[0_20px_80px_rgba(0,0,0,0.35)] backdrop-blur">
        {/* subtle grid + noise */}
        <div className="pointer-events-none absolute inset-0 opacity-[0.22]">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:40px_40px]" />
          <div className="absolute inset-0 bg-[radial-gradient(700px_300px_at_50%_0%,rgba(110,168,255,0.18),transparent_60%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(600px_260px_at_85%_20%,rgba(52,211,153,0.10),transparent_55%)]" />
          <div className="absolute inset-0 [background-image:url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22120%22 height=%22120%22 viewBox=%220 0 120 120%22%3E%3Cfilter id=%22n%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.8%22 numOctaves=%222%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22120%22 height=%22120%22 filter=%22url(%23n)%22 opacity=%220.28%22/%3E%3C/svg%3E')] opacity-[0.25]" />
        </div>

        {/* header */}
        <div className="relative flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div className="flex items-start gap-3">
            <div className="mt-1 hidden md:block">
              <WindowDots />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-xl font-semibold text-white">Proof, not promises.</h3>
                <span className="rounded-full border border-white/15 bg-white/5 px-2.5 py-1 text-[11px] font-semibold text-white/70">
                  Live preview
                </span>
              </div>

              <p className="mt-1 max-w-3xl text-sm text-white/65">
                Illustrative examples of what “matched opportunities + faster response” can do.
                Results vary by trade, service area, and bid volume.
              </p>

              <p className="mt-2 text-sm font-semibold text-white/80">{headline}</p>
            </div>
          </div>

          <div className="relative mt-1 flex flex-col items-start gap-2 md:mt-0 md:items-end">
            <div className="flex items-center gap-3">
              <span className="text-xs text-white/55">{updatedText}</span>
              <span className="h-1 w-1 rounded-full bg-white/25" />
              <span className="text-xs text-white/55">Example dataset</span>
            </div>

            {/* ✅ Trade toggle */}
            <TradeToggle trade={trade} setTrade={setTrade} />
          </div>
        </div>

        {/* cards */}
        <div className="relative mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {metrics.map((m, idx) => (
            <div
              key={`${intent}-${trade}-${m.title}`}
              className="card-in"
              style={{ animationDelay: `${idx * 55}ms` }}
            >
              <MetricCard m={m} index={idx} tradeKey={`${intent}-${trade}`} />
            </div>
          ))}
        </div>

        <div className="relative mt-6 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-5 md:flex-row">
          <p className="text-xs text-white/50">
            Example results (illustrative). Results vary by trade, response time, service area, and
            bid volume.
          </p>

          <Link
            href={`/get-started?intent=${intent}&trade=${trade}`}
            className="inline-flex items-center justify-center rounded-xl bg-[#1A4FA3] px-5 py-3 text-sm font-semibold text-white hover:bg-[#15428B]"
          >
            See results for your trade →
          </Link>
        </div>
      </div>
    </section>
  );
}
