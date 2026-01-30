// app/components/SiteBackground.tsx
export default function SiteBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-50">
      {/* Base canvas */}
      <div className="absolute inset-0 bg-[#DEDEDE]" />

      {/* Soft depth at top (keeps hero from feeling flat) */}
      <div className="absolute inset-0 bg-[radial-gradient(900px_600px_at_50%_0%,rgba(92,116,255,0.12),transparent_62%)]" />

      {/* Faint grid everywhere (very subtle) */}
      <div className="absolute inset-0 opacity-[0.035] [background-image:linear-gradient(rgba(0,0,0,0.16)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.16)_1px,transparent_1px)] [background-size:160px_160px]" />

      {/* “Hero Grid” boost near the top, fades down */}
      <div className="absolute inset-0 opacity-[0.055] [background-image:linear-gradient(rgba(0,0,0,0.22)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.22)_1px,transparent_1px)] [background-size:140px_140px] [mask-image:linear-gradient(to_bottom,black,transparent_65%)]" />
    </div>
  );
}
