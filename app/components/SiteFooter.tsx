import Link from "next/link";

const YEAR = 2025;

export default function SiteFooter() {
  return (
    <footer className="mt-12 pb-10">
      <div className="mx-auto w-full max-w-7xl px-6">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            {/* Left */}
            <div>
              <div className="text-sm font-semibold text-white">AMBIT</div>
              <div className="mt-2 text-xs text-white/55">
                © {YEAR} AMBIT. All rights reserved.
              </div>
            </div>

            {/* Right */}
            <div className="flex flex-wrap items-center gap-3">
              <FooterLink href="/support">Support</FooterLink>
              <FooterLink href="/contact">Contact</FooterLink>
              <FooterLink href="/privacy">Privacy</FooterLink>
              <FooterLink href="/terms">Terms</FooterLink>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold text-white/80 hover:bg-white/10 hover:text-white"
    >
      {children}
    </Link>
  );
}
