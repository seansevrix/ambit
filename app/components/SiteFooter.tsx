import Link from "next/link";

const WRAP = "mx-auto max-w-[1240px] px-6 lg:px-10";
const TITLE =
  "text-[11px] font-semibold uppercase tracking-[0.16em] text-[#7A7590]";
const LINK =
  "text-sm font-semibold text-[#6A6775] transition hover:text-[#31245C]";

export default function SiteFooter() {
  return (
    <footer className="border-t border-[#31245C]/10 bg-[#F3F1F4]">
      <div className={`${WRAP} py-14`}>
        <div className="grid gap-12 md:grid-cols-[1.4fr_0.8fr_0.8fr]">
          <div>
            <div className="text-lg font-black tracking-tight text-[#31245C]">
              AMBIT
            </div>
            <p className="mt-4 max-w-sm text-sm leading-7 text-[#6A6775]">
              AMBIT helps contractors find relevant opportunities, review them
              faster, and move the front-end bid process forward.
            </p>
          </div>

          <div>
            <div className={TITLE}>Company</div>
            <div className="mt-4 grid gap-3">
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

          <div>
            <div className={TITLE}>Access</div>
            <div className="mt-4 grid gap-3">
              <Link href="/login" className={LINK}>
                Log in
              </Link>
              <Link href="/get-started" className={LINK}>
                Get started
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-[#31245C]/10 pt-6 text-xs text-[#7A7590] sm:flex-row sm:items-center sm:justify-between">
          <div>© {new Date().getFullYear()} AMBIT. All rights reserved.</div>
          <div>Results vary by trade, service area, and response time.</div>
        </div>
      </div>
    </footer>
  );
}