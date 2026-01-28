"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import AmbitMark from "./AmbitMark";

const WRAP = "mx-auto max-w-[1200px] px-6 lg:px-10";
const LINK = "text-sm font-semibold text-white/70 hover:text-white transition";
const CTA =
  "inline-flex items-center justify-center rounded-xl bg-emerald-400 px-4 py-2 text-sm font-semibold text-[#061017] shadow-[0_10px_30px_rgba(0,0,0,0.25)] hover:brightness-110 transition";

export default function SiteNav() {
  const pathname = usePathname();
  const isLanding = pathname === "/";

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#070B18]/70 backdrop-blur">
      <div className={`${WRAP} flex h-16 items-center justify-between`}>
        <Link href="/" className="inline-flex items-center gap-2">
          <span className="rounded-xl border border-white/10 bg-white/5 p-2">
            <AmbitMark size={22} />
          </span>
          <span className="text-sm font-semibold text-white/90">AMBIT</span>
        </Link>

        {isLanding ? (
          // ✅ Landing: remove header links, keep login small, CTA dominant
          <nav className="flex items-center gap-4">
            <Link href="/login" className={LINK}>
              Log in
            </Link>
            <Link href="/get-started" className={CTA}>
              See My Matches — It’s Free
            </Link>
          </nav>
        ) : (
          // Other pages: keep a simple, non-distracting nav
          <nav className="flex items-center gap-4">
            <Link href="/live-opportunities" className={LINK}>
              Live Leads
            </Link>
            <Link href="/testimonials" className={LINK}>
              Reviews
            </Link>
            <Link href="/login" className={LINK}>
              Log in
            </Link>
            <Link href="/get-started" className={CTA}>
              Get started
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}
