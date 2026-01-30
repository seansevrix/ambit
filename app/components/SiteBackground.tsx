// app/components/SiteBackground.tsx
export default function SiteBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0">
      {/* Base canvas */}
      <div className="absolute inset-0" style={{ backgroundColor: "#DEDEDE" }} />

      {/* Soft depth wash */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(900px 600px at 50% 0%, rgba(92,116,255,0.18), transparent 62%)",
        }}
      />

      {/* Blueprint MINOR grid (should be visible now) */}
      <div
        className="absolute inset-0"
        style={{
          opacity: 0.22,
          mixBlendMode: "multiply",
          backgroundImage:
            "linear-gradient(rgba(26,79,163,0.45) 1px, transparent 1px), linear-gradient(90deg, rgba(26,79,163,0.45) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
          backgroundPosition: "center",
        }}
      />

      {/* Blueprint MAJOR grid */}
      <div
        className="absolute inset-0"
        style={{
          opacity: 0.18,
          mixBlendMode: "multiply",
          backgroundImage:
            "linear-gradient(rgba(26,79,163,0.65) 1px, transparent 1px), linear-gradient(90deg, rgba(26,79,163,0.65) 1px, transparent 1px)",
          backgroundSize: "140px 140px",
          backgroundPosition: "center",
        }}
      />

      {/* Dots at intersections (reads more “blueprint” on gray) */}
      <div
        className="absolute inset-0"
        style={{
          opacity: 0.14,
          mixBlendMode: "multiply",
          backgroundImage:
            "radial-gradient(rgba(26,79,163,0.60) 0.8px, transparent 0.9px)",
          backgroundSize: "28px 28px",
          backgroundPosition: "center",
        }}
      />

      {/* Very light vignette to help the grid read */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(1200px 700px at 50% 60%, rgba(0,0,0,0.06), transparent 60%)",
        }}
      />
    </div>
  );
}
