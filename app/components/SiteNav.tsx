import Link from "next/link";

const PRIMARY_BTN =
  "rounded-xl bg-[#1A4FA3] px-4 py-2 text-sm font-semibold text-white hover:bg-[#15428B]";

const NAV_LINK =
  "text-sm font-semibold text-white/75 hover:text-white transition";

export default function SiteNav() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0B1430]/70 backdrop-blur">
      {/* 3-column layout keeps the middle perfectly centered */}
      <div className="mx-auto grid h-14 w-full max-w-7xl grid-cols-3 items-center px-6">
        {/* Left */}
        <div className="justify-self-start">
          <Link href="/" className="font-semibold tracking-tight text-white">
            AMBIT
          </Link>
        </div>

        {/* Center (desktop) */}
        <nav className="hidden justify-self-center items-center gap-8 md:flex">
          <Link href="/preview/residential" className={NAV_LINK}>
            Residential
          </Link>
          <Link href="/preview/commercial" className={NAV_LINK}>
            Commercial
          </Link>
          <Link href="/preview/government" className={NAV_LINK}>
            Government
          </Link>
        </nav>

        {/* Right */}
        <div className="justify-self-end flex items-center gap-3">
          <Link href="/login" className={PRIMARY_BTN}>
            Log In
          </Link>
          <Link href="/get-started" className={PRIMARY_BTN}>
            Get Started
          </Link>
        </div>
      </div>

      {/* Mobile segmented nav */}
      <nav className="mx-auto flex w-full max-w-7xl items-center justify-center gap-3 px-6 pb-3 md:hidden">
        <Link
          href="/preview/residential"
          className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold text-white/80 hover:bg-white/10 hover:text-white"
        >
          Residential
        </Link>
        <Link
          href="/preview/commercial"
          className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold text-white/80 hover:bg-white/10 hover:text-white"
        >
          Commercial
        </Link>
        <Link
          href="/preview/government"
          className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold text-white/80 hover:bg-white/10 hover:text-white"
        >
          Government
        </Link>
      </nav>
    </header>
  );
}
