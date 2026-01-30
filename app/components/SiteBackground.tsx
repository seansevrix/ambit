// app/components/SiteBackground.tsx
export default function SiteBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0">
      {/* Base canvas */}
      <div className="absolute inset-0 bg-[#DEDEDE]" />

      {/* Soft hero depth */}
      <div className="absolute inset-0 bg-[radial-gradient(900px_600px_at_50%_0%,rgba(92,116,255,0.18),transparent_62%)]" />

      {/* Blueprint MINOR grid (this is the one you should NOTICE) */}
      <div
        className="absolute inset-0 opacity-[0.18]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(26,79,163,0.28) 1px, transparent 1px), linear-gradient(90deg, rgba(26,79,163,0.28) 1px, transparent 1px)",
          backgroundSize: "26px 26px",
          backgroundPosition: "center",
        }}
      />

      {/* Blueprint MAJOR grid */}
      <div
        className="absolute inset-0 opacity-[0.14]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(26,79,163,0.36) 1px, transparent 1px), linear-gradient(90deg, rgba(26,79,163,0.36) 1px, transparent 1px)",
          backgroundSize: "130px 130px",
          backgroundPosition: "center",
        }}
      />

      {/* Slight vignette so lines read better */}
      <div className="absolute inset-0 bg-[radial-gradient(1200px_700px_at_50%_60%,rgba(0,0,0,0.06),transparent_60%)]" />

      {/* Hero fade (stronger at top, calmer lower page) */}
      <div className="absolute inset-0 [mask-image:linear-gradient(to_bottom,black,transparent_70%)]" />
    </div>
  );
}
