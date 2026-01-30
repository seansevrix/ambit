// app/components/LandingBackground.tsx
export default function LandingBackground() {
  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="1400" height="900" viewBox="0 0 1400 900">
    <g fill="none" stroke="#0B2D5C" stroke-opacity="0.22" stroke-width="1.2">
      <path d="M-80 140 C 180 40, 420 220, 700 130 S 1140 210, 1480 90"/>
      <path d="M-60 210 C 220 120, 420 270, 720 200 S 1140 300, 1500 170"/>
      <path d="M-40 290 C 210 180, 460 360, 760 290 S 1160 410, 1520 260"/>
      <path d="M-30 380 C 200 280, 500 470, 820 390 S 1200 540, 1540 370"/>
      <path d="M-40 480 C 220 380, 560 560, 880 480 S 1240 660, 1520 520"/>
      <path d="M-60 590 C 240 490, 600 680, 940 600 S 1280 780, 1500 680"/>
      <path d="M-80 710 C 260 620, 620 790, 980 720 S 1300 880, 1460 820"/>
    </g>
  </svg>`.trim();

  const topo = `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Topo / blueprint pattern (super subtle) */}
      <div
        className="absolute inset-0 opacity-[0.035] mix-blend-multiply"
        style={{
          backgroundImage: topo,
          backgroundRepeat: "repeat",
          backgroundSize: "1100px 700px",
          backgroundPosition: "center",
        }}
      />

      {/* Soft radial depth (no motion) */}
      <div className="absolute -top-32 left-1/2 h-[720px] w-[1100px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,rgba(79,70,229,0.20),transparent_65%)] blur-3xl" />

      {/* Secondary faint wash so the page doesn’t feel “paper-thin” */}
      <div className="absolute bottom-[-220px] left-1/2 h-[650px] w-[1200px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,rgba(26,79,163,0.14),transparent_70%)] blur-3xl" />
    </div>
  );
}
