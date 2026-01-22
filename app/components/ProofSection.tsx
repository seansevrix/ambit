import Image from "next/image";

function Sparkline({ points }: { points: number[] }) {
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = Math.max(1, max - min);

  const w = 150;
  const h = 40;
  const pad = 2;

  const toXY = (v: number, i: number) => {
    const x = (i / (points.length - 1)) * (w - pad * 2) + pad;
    const y = h - ((v - min) / range) * (h - pad * 2) - pad;
    return [x, y];
  };

  const d = points
    .map((v, i) => {
      const [x, y] = toXY(v, i);
      return `${i === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="opacity-95">
      <defs>
        <linearGradient id="spark" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="currentColor" stopOpacity="0.55" />
          <stop offset="1" stopColor="currentColor" stopOpacity="1" />
        </linearGradient>
      </defs>
      <path d={d} fill="none" stroke="url(#spark)" strokeWidth="2.6" strokeLinecap="round" />
    </svg>
  );
}

function Tile({
  label,
  value,
  note,
  points,
}: {
  label: string;
  value: string;
  note: string;
  points: number[];
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.03)_inset]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-sm font-semibold text-white/80">{label}</div>
          <div className="mt-2 text-2xl font-semibold tracking-tight text-white">{value}</div>
          <div className="mt-2 text-sm text-white/60">{note}</div>
        </div>

        <div className="mt-1 text-emerald-300">
          <Sparkline points={points} />
        </div>
      </div>
    </div>
  );
}

export default function ProofSection() {
  return (
    <div className="mx-auto mt-10 max-w-6xl sm:mt-12">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <div className="inline-flex items-center rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold text-white/80">
          PROOF <span className="mx-2 text-white/35">•</span> Examples only
        </div>

        <h2 className="mt-3 text-xl font-semibold tracking-tight text-white sm:text-2xl">
          Proof, not promises.
        </h2>

        <p className="mt-2 max-w-2xl text-sm text-white/70">
          Illustrative examples of what “matched opportunities + faster response” can do. Results vary by trade,
          service area, and bid volume.
        </p>
      </div>

      {/* Content */}
      <div className="grid gap-6 lg:grid-cols-5">
        {/* Left: 3 tiles */}
        <div className="grid gap-4 lg:col-span-2">
          <Tile
            label="Monthly contract revenue (example)"
            value="$2k → $9k / mo"
            note="Often improves as teams expand into commercial + government."
            points={[2000, 2400, 3200, 5200, 5800, 9000]}
          />
          <Tile
            label="Opportunities matched (example)"
            value="12 → 45 / month"
            note="More fits once NAICS + keywords are dialed."
            points={[12, 14, 18, 25, 33, 45]}
          />
          <Tile
            label="Time spent searching (example)"
            value="10 hrs/wk → 2 hrs/wk"
            note="Less portal-hopping. More quoting."
            points={[10, 9, 8, 6, 4, 2]}
          />
        </div>

        {/* Right: big combined graph image */}
        <div className="lg:col-span-3">
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-[0_0_0_1px_rgba(255,255,255,0.03)_inset]">
            <div className="flex items-center justify-between px-5 py-4">
              <div className="text-sm font-semibold text-white/80">Performance snapshot (illustrative)</div>
              <div className="text-xs text-white/50">Examples only</div>
            </div>

            <div className="border-t border-white/10 p-4">
              <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl border border-white/10 bg-[#0B1430]/30">
                <Image
                  src="/proof/ambit-dashboard.png"
                  alt="AMBIT example dashboard with illustrative sparklines"
                  fill
                  sizes="(max-width: 1024px) 100vw, 60vw"
                  className="object-contain"
                />
              </div>
            </div>
          </div>

          <p className="mt-3 text-xs text-white/50">
            Example results (illustrative). Results vary by trade, response time, service area, and bid volume.
          </p>
        </div>
      </div>
    </div>
  );
}
