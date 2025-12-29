import Link from "next/link";

export default function SupportPage() {
  return (
    <main className="min-h-[calc(100vh-80px)] px-4 py-16">
      <div className="mx-auto w-full max-w-4xl">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur md:p-10">
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
            Support
          </h1>

          <p className="mt-3 text-white/70">
            AMBIT helps contractors find and prioritize public-sector
            opportunities faster — so you spend less time searching and more time
            bidding.
          </p>

          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <section className="rounded-2xl border border-white/10 bg-black/20 p-6">
              <h2 className="text-lg font-semibold">What AMBIT is</h2>
              <ul className="mt-3 space-y-2 text-sm text-white/70">
                <li>
                  • A matching engine that surfaces opportunities based on your
                  service area + keywords/NAICS.
                </li>
                <li>
                  • A dashboard that helps you quickly triage what’s worth your
                  time.
                </li>
                <li>
                  • Built for small businesses that don’t have time to live in
                  portals all day.
                </li>
              </ul>
            </section>

            <section className="rounded-2xl border border-white/10 bg-black/20 p-6">
              <h2 className="text-lg font-semibold">Trust + transparency</h2>
              <ul className="mt-3 space-y-2 text-sm text-white/70">
                <li>• We use public listings and third-party sources.</li>
                <li>
                  • We do not guarantee accuracy or completeness — always verify
                  details on the official posting.
                </li>
                <li>
                  • Payments are handled by Stripe. AMBIT does not store full
                  card numbers.
                </li>
              </ul>
            </section>
          </div>

          <section className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-6">
            <h2 className="text-lg font-semibold">Need help?</h2>
            <p className="mt-2 text-sm text-white/70">
              Email us and include your company name + what page you were on.
            </p>

            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <a
                href="mailto:sean.s@sevrixgov.com?subject=AMBIT%20Support%20Request"
                className="inline-flex w-fit items-center justify-center rounded-xl border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/15"
              >
                Email Support: sean.s@sevrixgov.com
              </a>

              <div className="text-xs text-white/50">
                Also review{" "}
                <Link className="underline hover:text-white" href="/privacy">
                  Privacy
                </Link>{" "}
                &{" "}
                <Link className="underline hover:text-white" href="/terms">
                  Terms
                </Link>
                .
              </div>
            </div>
          </section>

          <section className="mt-6 text-xs text-white/50">
            AMBIT is not affiliated with the U.S. Government. AMBIT provides
            informational tools only and is not legal advice.
          </section>
        </div>
      </div>
    </main>
  );
}
