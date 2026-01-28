import Link from "next/link";

const WRAP = "mx-auto max-w-[1200px] px-6 lg:px-10";
const TITLE = "text-xs font-semibold text-white/70";
const LINK = "text-sm font-semibold text-white/55 hover:text-white transition";

export default function SiteFooter() {
  return (
    <footer className="border-t border-white/10 bg-[#070B18]">
      <div className={`${WRAP} py-12`}>
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <div className="text-sm font-semibold text-white/90">AMBIT</div>
            <p className="mt-3 max-w-xs text-sm text-white/55">
              We find, rank, and deliver high-intent opportunities so you can stop chasing leads
              and start winning contracts.
            </p>
          </div>

          {/* Solutions */}
          <div>
            <div className={TITLE}>Solutions</div>
            <div className="mt-4 grid gap-2">
              <Link href="/preview/residential" className={LINK}>
                Residential
              </Link>
              <Link href="/preview/commercial" className={LINK}>
                Commercial
              </Link>
              <Link href="/preview/government" className={LINK}>
                Government
              </Link>
            </div>
          </div>

          {/* Company */}
          <div>
            <div className={TITLE}>Company</div>
            <div className="mt-4 grid gap-2">
              <Link href="/testimonials" className={LINK}>
                Reviews
              </Link>
              <Link href="/privacy" className={LINK}>
                Privacy
              </Link>
              <Link href="/terms" className={LINK}>
                Terms
              </Link>
            </div>
          </div>

          {/* Support */}
          <div>
            <div className={TITLE}>Support</div>
            <div className="mt-4 grid gap-2">
              <Link href="/login" className={LINK}>
                Log in
              </Link>
              <Link href="/get-started" className={LINK}>
                Get started
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 text-xs text-white/45 sm:flex-row">
          <div>© {new Date().getFullYear()} AMBIT. All rights reserved.</div>
          <div className="text-white/40">Results vary by trade, service area, and response time.</div>
        </div>
      </div>
    </footer>
  );
}
