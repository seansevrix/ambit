// app/components/SiteBackground.tsx
export default function SiteBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0">
      {/* Base canvas */}
      <div className="absolute inset-0 bg-[#DEDEDE]" />

      {/* Soft hero depth (keeps the top from feeling flat) */}
      <div className="absolute inset-0 bg-[radial-gradient(900px_600px_at_50%_0%,rgba(92,116,255,0.14),transparent_62%)]" />

      {/* Blueprint grid: major lines (very subtle) */}
      <div
        className="absolute inset-0 opacity-[0.055]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(26,79,163,0.35) 1px, transparent 1px), linear-gradient(90deg, rgba(26,79,163,0.35) 1px, transparent 1px)",
          backgroundSize: "160px 160px",
        }}
      />

      {/* Blueprint grid: minor lines (even lighter) */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(26,79,163,0.22) 1px, transparent 1px), linear-gradient(90deg, rgba(26,79,163,0.22) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      {/* Top fade so it anchors hero but doesn't clutter the full page */}
      <div
        className="absolute inset-0"
        style={{
          WebkitMaskImage: "linear-gradient(to bottom, black, transparent 70%)",
          maskImage: "linear-gradient(to bottom, black, transparent 70%)",
        }}
      />
    </div>
  );
}
