"use client";

import { useEffect, useMemo, useState } from "react";

export default function LoadingOverlay({
  serviceArea,
  naics,
  keywords,
  title = "Looking for your best matches",
}: {
  serviceArea?: string;
  naics?: string;
  keywords?: string;
  title?: string;
}) {
  const steps = useMemo(() => {
    const parts: string[] = [];
    parts.push(`Locking in your service area${serviceArea ? `: ${serviceArea}` : ""}…`);
    parts.push(`Indexing NAICS${naics ? `: ${naics}` : ""}…`);
    parts.push(`Scanning new opportunities…`);
    parts.push(`Scoring matches${keywords ? ` for “${keywords}”` : ""}…`);
    parts.push(`Ranking your top leads…`);
    parts.push(`Building your dashboard…`);
    return parts;
  }, [serviceArea, naics, keywords]);

  const [i, setI] = useState(0);

  useEffect(() => {
    const t = setInterval(() => {
      setI((cur) => (cur < steps.length - 1 ? cur + 1 : cur));
    }, 1200);
    return () => clearInterval(t);
  }, [steps.length]);

  // never show 100% until we actually finish
  const pct = Math.min(15 + i * (75 / Math.max(1, steps.length - 1)), 90);

  return (
    <div className="fixed inset-0 z-[100] bg-[#050B16]/80 backdrop-blur-sm flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#0B1325]/90 p-6 shadow-2xl">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-2xl bg-emerald-400/15 flex items-center justify-center">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/35 border-t-white" />
          </div>

          <div className="min-w-0">
            <div className="text-white text-base font-semibold">{title}</div>
            <div className="text-white/70 text-sm mt-0.5">{steps[i]}</div>
          </div>
        </div>

        <div className="mt-5 h-2 w-full rounded-full bg-white/10 overflow-hidden">
          <div
            className="h-full bg-emerald-400/80 transition-all duration-700"
            style={{ width: `${pct}%` }}
          />
        </div>

        <div className="mt-4 text-xs text-white/60">
          Don’t close this tab — we’re loading your dashboard.
        </div>
      </div>
    </div>
  );
}
