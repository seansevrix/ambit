import Link from "next/link";

const PRIMARY_BTN =
  "shrink-0 whitespace-nowrap rounded-xl bg-[#1A4FA3] px-3 py-2 text-xs font-semibold text-white hover:bg-[#15428B] sm:px-4 sm:text-sm";

const GHOST_BTN =
  "shrink-0 whitespace-nowrap rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold text-white/80 hover:bg-white/10 hover:text-white sm:px-4 sm:text-sm";

const NAV_LINK = "text-sm font-semibold text-white/75 hover:text-white transition";

export default function SiteNav() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0B1430]/70 backdrop-blur">
      {/* Top row */}
      <div className="mx-auto flex h-14 w-full max-w-7xl items-center gap-3 px-3 sm:px-6">
        {/* Left */}
        <div className="shrink-0">
          <Link href="/" className="font-semibold tracking-tight text-white">
            AMBIT
          </Link>
        </div>

        {/* Center (desktop) */}
        <nav className="hidden flex-1 items-center justify-center gap-8 md:flex">
          <Link href="/preview/residential" className={NAV_LINK}>
            Residential
          </Link>
          <Link href="/preview/commercial" className={NAV_LINK}>
            Commercial
          </Link>
          <Link href="/preview/government" className={NAV_LINK}>
            Government
          </Link>
          <Link href="/pricing" className={NAV_LINK}>
            Pricing
          </Link>
        </nav>

        {/* Right */}
        <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-3">
          <Link href="/login" className={GHOST_BTN}>
            <span className="sm:hidden">Login</span>
            <span className="hidden sm:inline">Log In</span>
          </Link>

          <Link href="/#preview" className={PRIMARY_BTN}>
            <span className="sm:hidden">3 Matches</span>
            <span className="hidden sm:inline">Get 3 free matches</span>
          </Link>
        </div>
      </div>

      {/* Mobile segmented nav */}
      <nav className="mx-auto flex w-full max-w-7xl items-center gap-2 overflow-x-auto px-3 pb-3 md:hidden sm:px-6">
        <div className="flex w-max items-center gap-2 whitespace-nowrap">
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
          <Link
            href="/pricing"
            className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold text-white/80 hover:bg-white/10 hover:text-white"
          >
            Pricing
          </Link>
        </div>
      </nav>
    </header>
  );
}
