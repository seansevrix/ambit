import Link from "next/link";

const PRIMARY_BTN =
  "rounded-xl bg-[#1A4FA3] px-4 py-2 text-sm font-semibold text-white hover:bg-[#15428B]";

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

        {/* Center */}
        <nav className="hidden justify-self-center items-center gap-8 text-sm font-semibold text-white/75 md:flex">
          <Link href="/get-started" className="hover:text-white">
            Get Started
          </Link>
          <Link href="/opportunities" className="hover:text-white">
            Preview
          </Link>
          <Link href="/login" className="hover:text-white">
            Log In
          </Link>
        </nav>

        {/* Right */}
        <div className="justify-self-end">
          <Link href="/get-started" className={PRIMARY_BTN}>
            Get Started
          </Link>
        </div>
      </div>

      {/* Mobile nav */}
      <nav className="mx-auto flex w-full max-w-7xl items-center justify-center gap-6 px-6 pb-3 text-sm font-semibold text-white/75 md:hidden">
        <Link href="/get-started" className="hover:text-white">
          Get Started
        </Link>
        <Link href="/opportunities" className="hover:text-white">
          Preview
        </Link>
        <Link href="/login" className="hover:text-white">
          Log In
        </Link>
      </nav>
    </header>
  );
}
