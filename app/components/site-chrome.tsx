// app/_components/site-chrome.tsx
import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#070B18]/80 backdrop-blur">
      <div className="mx-auto flex max-w-[1700px] items-center justify-between px-6 py-4 lg:px-12">
        <Link href="/" className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-white/10 ring-1 ring-white/15">
            <Mark />
          </div>
          <span className="text-lg font-semibold tracking-tight">Ambit</span>
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          <Link href="/pricing" className="text-sm text-white/80 hover:text-white">
            Pricing
          </Link>
          <Link href="/demo-matches" className="text-sm text-white/80 hover:text-white">
            Winning Opportunities
          </Link>
          <Link href="/login" className="text-sm text-white/80 hover:text-white">
            Log In
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/signup"
            className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-white/90"
          >
            Get Started
          </Link>
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-white/10 pt-8 text-sm text-white/60">
      <div className="mx-auto flex max-w-[1700px] flex-col justify-between gap-4 px-6 pb-10 md:flex-row lg:px-12">
        <div>© {new Date().getFullYear()} Ambit</div>
        <div className="flex gap-5">
          <Link href="/support" className="hover:text-white">
            Support
          </Link>
          <Link href="/contact" className="hover:text-white">
            Contact
          </Link>
        </div>
      </div>
    </footer>
  );
}

function Mark() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 2l7 4v6c0 5-3 9-7 10-4-1-7-5-7-10V6l7-4z"
        stroke="white"
        strokeOpacity="0.8"
        strokeWidth="1.6"
      />
      <path
        d="M8 12l2.2 2.2L16 8.6"
        stroke="#4F7DFF"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
