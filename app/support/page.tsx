import Link from "next/link";

export const metadata = {
  title: "Support | AMBIT",
  description: "Support, trust, and product information for AMBIT.",
};

export default function SupportPage() {
  return (
    <main className="min-h-[calc(100vh-120px)] px-4 py-14">
      <div className="mx-auto max-w-5xl">
        <section className="rounded-[28px] border border-white/10 bg-white/5 p-8 shadow-xl backdrop-blur">
          <h1 className="text-3xl font-semibold text-white">Support</h1>
          <p className="mt-2 max-w-2xl text-sm text-white/70">
            AMBIT helps contractors find and prioritize public-sector opportunities faster — so you
            spend less time searching and more time bidding.
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {/* What AMBIT is */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <h2 className="text-base font-semibold text-white">What AMBIT is</h2>
              <ul className="mt-3 space-y-2 text-sm text-white/70">
                <li>• A matching engine that surfaces opportunities based on your service area + keywords/NAICS.</li>
                <li>• A dashboard that helps you quickly triage what’s worth your time.</li>
                <li>• Built for small businesses that don’t have time to live in portals all day.</li>
              </ul>
            </div>

            {/* Trust */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <h2 className="text-base font-semibold text-white">Trust + transparency</h2>
              <ul className="mt-3 space-y-2 text-sm text-white/70">
                <li>• We use public listings and third-party sources.</li>
                <li>• We do not guarantee accuracy or completeness — always verify details on the official posting.</li>
                <li>• Payments are handled by Stripe. AMBIT does not store full card numbers.</li>
              </ul>
            </div>
          </div>

          {/* Need help */}
          <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-base font-semibold text-white">Need help?</h2>
                <p className="mt-2 text-sm text-white/70">
                  For questions, billing, or support, please visit our{" "}
                  <Link
                    href="/contact"
                    className="text-white underline underline-offset-4 hover:text-white/90"
                  >
                    Contact page
                  </Link>{" "}
                  to connect with a Sevrix associate.
                </p>
                <p className="mt-2 text-xs text-white/40">
                  Tip: Include your company name + what page you were on.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center rounded-xl bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/15"
                >
                  Go to Contact
                </Link>
                <Link
                  href="/privacy"
                  className="text-xs text-white/50 underline underline-offset-4 hover:text-white/80"
                >
                  Privacy
                </Link>
                <span className="text-xs text-white/30">•</span>
                <Link
                  href="/terms"
                  className="text-xs text-white/50 underline underline-offset-4 hover:text-white/80"
                >
                  Terms
                </Link>
              </div>
            </div>
          </div>

          <p className="mt-6 text-xs text-white/35">
            AMBIT is not affiliated with the U.S. Government. AMBIT provides informational tools only and is not legal advice.
          </p>
        </section>
      </div>
    </main>
  );
}
