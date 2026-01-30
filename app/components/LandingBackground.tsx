// app/components/LandingBackground.tsx
export default function LandingBackground() {
  // Organic, large-scale topo/blueprint hybrid lines (VERY subtle)
  const topoSvg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900" viewBox="0 0 1600 900">
    <g fill="none" stroke="#0B2D5C" stroke-opacity="0.22" stroke-width="1.25">
      <!-- sweeping topo lines -->
      <path d="M-120 130 C 120 40, 420 210, 690 120 S 1180 190, 1720 70"/>
      <path d="M-120 210 C 160 120, 460 300, 740 200 S 1220 310, 1720 170"/>
      <path d="M-120 300 C 170 210, 520 390, 800 300 S 1260 430, 1720 260"/>
      <path d="M-120 395 C 170 305, 560 500, 860 395 S 1290 560, 1720 390"/>
      <path d="M-120 500 C 200 415, 610 600, 930 505 S 1330 690, 1720 540"/>
      <path d="M-120 620 C 230 520, 650 725, 980 635 S 1360 820, 1720 700"/>
      <path d="M-120 750 C 260 650, 670 830, 1030 760 S 1390 910, 1720 860"/>

      <!-- faint blueprint accents (corner marks + crosshair) -->
      <path d="M118 96 h52 M118 96 v52" />
      <path d="M1482 96 h-52 M1482 96 v52" />
      <path d="M118 804 h52 M118 804 v-52" />
      <path d="M1482 804 h-52 M1482 804 v-52" />

      <circle cx="800" cy="450" r="42" />
      <path d="M800 392 v116 M742 450 h116" />
      <circle cx="800" cy="450" r="6" />
    </g>
  </svg>`.trim();

  const topo = `url("data:image/svg+xml,${encodeURIComponent(topoSvg)}")`;

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Abstract Industry Pattern (Contextual Trust) — 2–3% opacity */}
      <div
        className="absolute inset-0 opacity-[0.028] mix-blend-multiply"
        style={{
          backgroundImage: topo,
          backgroundRepeat: "repeat",
          // large-scale so it feels "sweeping" and not like wallpaper
          backgroundSize: "1400px 820px",
          backgroundPosition: "center",
        }}
      />

      {/* Soft Radial Depth (no motion) */}
      <div className="absolute -top-32 left-1/2 h-[720px] w-[1100px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,rgba(79,70,229,0.20),transparent_65%)] blur-3xl" />

      {/* Secondary faint wash so the page doesn’t feel paper-thin */}
      <div className="absolute bottom-[-220px] left-1/2 h-[650px] w-[1200px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,rgba(26,79,163,0.14),transparent_70%)] blur-3xl" />
    </div>
  );
}
