// app/components/SiteBackground.tsx
export default function SiteBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0">
      {/* Base canvas */}
      <div className="absolute inset-0 bg-[#DEDEDE]" />

      {/* Hero depth wash */}
      <div className="absolute inset-0 bg-[radial-gradient(900px_600px_at_50%_0%,rgba(92,116,255,0.16),transparent_62%)]" />

      {/* Grid everywhere (VISIBLE) */}
      <div
        className="absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,0,0,0.22) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.22) 1px, transparent 1px)",
          backgroundSize: "140px 140px",
        }}
      />

      {/* Hero grid boost at the top (stronger near hero, fades out) */}
      <div
        className="absolute inset-0 opacity-[0.16]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,0,0,0.28) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.28) 1px, transparent 1px)",
          backgroundSize: "120px 120px",
          WebkitMaskImage: "linear-gradient(to bottom, black, transparent 65%)",
          maskImage: "linear-gradient(to bottom, black, transparent 65%)",
        }}
      />
    </div>
  );
}
