// app/support/page.tsx
import Link from "next/link";

export const metadata = {
  title: "Support | AMBIT",
  description:
    "Learn what AMBIT is, how we handle trust and transparency, and how to contact a Sevrix associate for help.",
};

export default function SupportPage() {
  return (
    <main className="min-h-[calc(100vh-120px)] px-4 py-10">
      <div className="mx-auto w-full max-w-4xl">
        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-8 shadow-2xl backdrop-blur">
          <h1 className="text-3xl font-semibold tracking-tight text-white">
            Support
          </h1>
          <p className="mt-2 text-sm text-white/70">
            AMBIT helps contractors find and prioritize public-sector
            opportunities faster — so you spend less time searching and more
            time bidding.
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
              <h2 className="text-sm font-semibold text-white">What AMBIT is</h2>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-white/70">
                <li>
                  A matching engine that surfaces opportunities based on your
                  service area + keywords/NAICS.
                </li>
                <li>
                  A dashboard that helps you quickly triage what’s worth your
                  time.
                </li>
                <li>
                  Built for small businesses that don’t have time to live in
                  portals all day.
                </li>
              </ul>
            </section>

            <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
              <h2 className="text-sm font-semibold text-white">
                Trust + transparency
              </h2>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-white/70">
                <li>We use public listings and third-party sources.</li>
                <li>
                  We do not guarantee accuracy or completeness — always verify
                  details on the official posting.
                </li>
                <li>
                  Payments are handled by Stripe. AMBIT does not store full card
                  numbers.
                </li>
              </ul>
            </section>
          </div>

          <section className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-sm font-semibold text-white">Need help?</h2>
                <p className="mt-2 text-sm text-white/70">
                  Please see our{" "}
                  <Link
                    href="/contact"
                    className="text-white underline decoration-white/30 underline-offset-4 hover:decoration-white/60"
                  >
                    Contact
                  </Link>{" "}
                  page to connect with a Sevrix associate.
                </p>
                <p className="mt-2 text-xs text-white/50">
                  Tip: Include your company name + what page you were on + what
                  you expected to happen.
                </p>
              </div>

              <Link
                href="/contact"
                className="inline-flex h-11 items-center justify-center rounded-xl bg-white px-5 text-sm font-medium text-black"
              >
                Go to Contact
              </Link>
            </div>

            <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-white/50">
                AMBIT is not affiliated with the U.S. Government. AMBIT provides
                informational tools only and is not legal advice.
              </p>

              <p className="text-xs text-white/50">
                Review{" "}
                <Link
                  href="/privacy"
                  className="text-white/70 underline decoration-white/20 underline-offset-4 hover:decoration-white/50"
                >
                  Privacy
                </Link>{" "}
                &{" "}
                <Link
                  href="/terms"
                  className="text-white/70 underline decoration-white/20 underline-offset-4 hover:decoration-white/50"
                >
                  Terms
                </Link>
                .
              </p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
