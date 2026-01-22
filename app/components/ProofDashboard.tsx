"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Metric = {
  title: string;
  value: string; // display string
  delta?: string;
  note: string;
  color: "green" | "blue";
  path: string;
  area: string;
  // for count-up (optional). If omitted, we won't animate value.
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
  // keep commas but no currency formatting here
  return n.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

function useCountUp(opts?: Metric["animate"]) {
  const [val, setVal] = useState<number | null>(opts ? opts.from : null);

  useEffect(() => {
    if (!opts) return;

    const start = opts.from;
    const end = opts.to;
    const duration = 900; // ms
    const startTime = performance.now();

    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - startTime) / duration);
      // easeOutCubic
      const eased = 1 - Math.pow(1 - t, 3);
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

const METRICS: Metric[] = [
  {
    title: "Monthly Contract Revenue",
    value: "$8,842",
    delta: "+450%",
    note: "vs. $1,636 prior month",
    color: "green",
    path: "M4 28 C18 26, 28 24, 40 22 C52 20, 64 18, 76 18 C88 18, 96 16, 112 14 C128 12, 144 10, 156 10",
    area:
      "M4 28 C18 26, 28 24, 40 22 C52 20, 64 18, 76 18 C88 18, 96 16, 112 14 C128 12, 144 10, 156 10 L156 44 L4 44 Z",
    animate: { from: 1636, to: 8842, prefix: "$", decimals: 0, format: "comma" },
  },
  {
    title: "Opportunities Matched",
    value: "47",
    delta: "+275%",
    note: "vs. 12 prior month",
    color: "green",
    path: "M4 30 C18 30, 28 28, 40 26 C52 24, 64 22, 76 22 C88 22, 102 20, 116 18 C130 16, 142 14, 156 14",
    area:
      "M4 30 C18 30, 28 28, 40 26 C52 24, 64 22, 76 22 C88 22, 102 20, 116 18 C130 16, 142 14, 156 14 L156 44 L4 44 Z",
    animate: { from: 12, to: 47, decimals: 0, format: "none" },
  },
  {
    title: "Opportunities Submitted",
    value: "14",
    delta: "+336%",
    note: "vs. 3 prior month",
    color: "green",
    path: "M4 32 C16 30, 30 28, 44 26 C58 24, 70 22, 84 22 C98 22, 110 20, 124 18 C138 16, 146 14, 156 12",
    area:
      "M4 32 C16 30, 30 28, 44 26 C58 24, 70 22, 84 22 C98 22, 110 20, 124 18 C138 16, 146 14, 156 12 L156 44 L4 44 Z",
    animate: { from: 3, to: 14, decimals: 0, format: "none" },
  },
  {
    title: "Contracts Won",
    value: "4",
    delta: "+300%",
    note: "vs. 1 prior month",
    color: "green",
    path: "M4 34 C20 34, 32 33, 44 32 C58 30, 72 28, 86 26 C100 24, 122 20, 156 16",
    area:
      "M4 34 C20 34, 32 33, 44 32 C58 30, 72 28, 86 26 C100 24, 122 20, 156 16 L156 44 L4 44 Z",
    animate: { from: 1, to: 4, decimals: 0, format: "none" },
  },
  {
    title: "Pipeline Value",
    value: "$40.7k",
    note: "vs. $12,636 prior month",
    color: "green",
    path: "M4 34 C18 33, 30 32, 44 30 C58 28, 74 26, 92 24 C110 22, 132 18, 156 16",
    area:
      "M4 34 C18 33, 30 32, 44 30 C58 28, 74 26, 92 24 C110 22, 132 18, 156 16 L156 44 L4 44 Z",
    animate: { from: 12.6, to: 40.7, suffix: "k", decimals: 1, format: "none", prefix: "$" },
  },
  {
    title: "Win Rate",
    value: "28%",
    note: "vs. 3% prior month",
    color: "green",
    path: "M4 34 C20 34, 38 33, 56 30 C74 27, 94 24, 116 22 C138 20, 148 18, 156 18",
    area:
      "M4 34 C20 34, 38 33, 56 30 C74 27, 94 24, 116 22 C138 20, 148 18, 156 18 L156 44 L4 44 Z",
    animate: { from: 3, to: 28, suffix: "%", decimals: 0, format: "none" },
  },
  {
    title: "Time to Respond",
    value: "2 hours",
    delta: "+89%",
    note: "vs. 1.95 prior month",
    color: "blue",
    path: "M4 34 C18 34, 30 34, 44 33 C58 32, 72 30, 90 28 C108 26, 130 22, 156 18",
    area:
      "M4 34 C18 34, 30 34, 44 33 C58 32, 72 30, 90 28 C108 26, 130 22, 156 18 L156 44 L4 44 Z",
    animate: { from: 1.95, to: 2.0, suffix: " hrs", decimals: 2, format: "none" },
  },
  {
    title: "Avg Contract Value",
    value: "$2,145",
    note: "vs. $1,220 prior month",
    color: "blue",
    path: "M4 34 C20 33, 34 32, 48 30 C62 28, 76 26, 92 24 C108 22, 128 18, 156 16",
    area:
      "M4 34 C20 33, 34 32, 48 30 C62 28, 76 26, 92 24 C108 22, 128 18, 156 16 L156 44 L4 44 Z",
    animate: { from: 1220, to: 2145, prefix: "$", decimals: 0, format: "comma" },
  },
  {
    title: "Cost per Win (effective)",
    value: "$245",
    delta: "+28%",
    note: "vs. $225 prior month",
    color: "blue",
    path: "M4 30 C18 30, 30 29, 44 28 C58 26, 72 24, 88 24 C104 24, 126 22, 156 18",
    area:
      "M4 30 C18 30, 30 29, 44 28 C58 26, 72 24, 88 24 C104 24, 126 22, 156 18 L156 44 L4 44 Z",
    animate: { from: 225, to: 245, prefix: "$", decimals: 0, format: "comma" },
  },
];

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
          <stop offset="0%" stopColor={tone === "green" ? "#34d399" : "#7dd3fc"} stopOpacity="0.65" />
          <stop offset="100%" stopColor={tone === "green" ? "#a7f3d0" : "#bae6fd"} stopOpacity="1" />
        </linearGradient>
      </defs>

      {/* area */}
      <path d={area} fill={`url(#fill-${tone}-${index})`} className="animate-fadein" />

      {/* line */}
      <path
        d={path}
        fill="none"
        className={`${stroke} [stroke:url(#line-${tone}-${index})] stroke-[2.5] [stroke-linecap:round] [stroke-linejoin:round] animate-draw`}
        style={{ animationDelay: `${index * 45}ms` }}
      />
    </svg>
  );
}

function MetricCard({ m, index }: { m: Metric; index: number }) {
  const counted = useCountUp(m.animate);

  return (
    <div
      className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.03)] transition hover:border-white/15 hover:bg-white/7"
      style={{ animationDelay: `${index * 55}ms` }}
    >
      {/* subtle sheen */}
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

        {/* “live” dot */}
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

export default function ProofDashboard() {
  const updatedText = useMemo(() => {
    // lightweight “live” feel; don’t overdo it
    return "Updated just now";
  }, []);

  return (
    <section className="relative">
      {/* Styles for path draw + subtle fade */}
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
        {/* subtle grid + noise to avoid “pasted image” feel */}
        <div className="pointer-events-none absolute inset-0 opacity-[0.22]">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:40px_40px]" />
          <div className="absolute inset-0 bg-[radial-gradient(700px_300px_at_50%_0%,rgba(110,168,255,0.18),transparent_60%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(600px_260px_at_85%_20%,rgba(52,211,153,0.10),transparent_55%)]" />
          <div className="absolute inset-0 [background-image:url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22120%22 height=%22120%22 viewBox=%220 0 120 120%22%3E%3Cfilter id=%22n%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.8%22 numOctaves=%222%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22120%22 height=%22120%22 filter=%22url(%23n)%22 opacity=%220.28%22/%3E%3C/svg%3E')] opacity-[0.25]" />
        </div>

        {/* “App chrome” header */}
        <div className="relative flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
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

              <p className="mt-2 text-sm font-semibold text-white/80">
                Results for: Mid-sized Electrical Contractor (5–10 employees) in Dallas, TX.
              </p>
            </div>
          </div>

          <div className="relative mt-1 flex items-center gap-3 md:mt-0">
            <span className="text-xs text-white/55">{updatedText}</span>
            <span className="h-1 w-1 rounded-full bg-white/25" />
            <span className="text-xs text-white/55">Example dataset</span>
          </div>
        </div>

        {/* Cards */}
        <div className="relative mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {METRICS.map((m, idx) => (
            <div key={m.title} className="card-in" style={{ animationDelay: `${idx * 55}ms` }}>
              <MetricCard m={m} index={idx} />
            </div>
          ))}
        </div>

        <div className="relative mt-6 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-5 md:flex-row">
          <p className="text-xs text-white/50">
            Example results (illustrative). Results vary by trade, response time, service area, and bid volume.
          </p>

          <Link
            href="/get-started"
            className="inline-flex items-center justify-center rounded-xl bg-[#1A4FA3] px-5 py-3 text-sm font-semibold text-white hover:bg-[#15428B]"
          >
            See results for your trade →
          </Link>
        </div>
      </div>
    </section>
  );
}
