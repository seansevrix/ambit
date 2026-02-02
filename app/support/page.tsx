// app/support/page.tsx
import Link from "next/link";
import type { ReactNode } from "react";

export const metadata = {
  title: "Support | AMBIT",
  description:
    "Learn what AMBIT is, how we handle trust and transparency, and how to contact an AMBIT associate for help.",
};

function Card({
  title,
  children,
  tone = "default",
}: {
  title: string;
  children: ReactNode;
  tone?: "default" | "highlight";
}) {
  const cls =
    tone === "highlight"
      ? "rounded-3xl border border-[#63A7FF]/30 bg-[#EAF3FF] p-6 shadow-[0_18px_60px_rgba(0,0,0,0.06)]"
      : "rounded-3xl border border-black/10 bg-white p-6 shadow-[0_18px_60px_rgba(0,0,0,0.07)]";

  return (
    <section className={cls}>
      <h2 className="text-lg font-black tracking-tight text-black">{title}</h2>
      <div className="mt-3 text-sm leading-relaxed text-black/70">{children}</div>
    </section>
  );
}

export default function SupportPage() {
  return (
    <main className="min-h-[calc(100vh-80px)] px-4 py-14 sm:py-16">
      <div className="mx-auto w-full max-w-5xl">
        {/* Header */}
        <div className="rounded-[32px] border border-black/10 bg-white p-7 shadow-[0_24px_80px_rgba(0,0,0,0.08)] md:p-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-3 py-1.5 text-xs font-semibold text-black/60">
            <span className="inline-flex h-2 w-2 rounded-full bg-[#1A4FA3]" />
            Support
          </div>

          <h1 className="mt-4 text-3xl font-black tracking-tight text-black md:text-5xl">
            How can we help?
          </h1>

          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-black/70 md:text-base">
            AMBIT helps contractors find and prioritize opportunities faster — so
            you spend less time searching and more time bidding.
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href="/contact"
              className="inline-flex h-11 items-center justify-center rounded-2xl bg-[#1A4FA3] px-6 text-sm font-semibold text-white hover:bg-[#15428B]"
            >
              Contact support
            </Link>

            <a
              href="mailto:ambit@sevrixgov.com"
              className="inline-flex h-11 items-center justify-center rounded-2xl border border-black/10 bg-white px-6 text-sm font-semibold text-black/70 hover:bg-black/[0.03]"
            >
              Email ambit@sevrixgov.com
            </a>

            <div className="text-xs text-black/50">
              Typical response: within 1 business day.
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <Card title="What AMBIT is">
            <ul className="mt-1 space-y-2">
              <li className="flex gap-2">
                <span className="mt-[7px] h-1.5 w-1.5 rounded-full bg-black/30" />
                <span>
                  A matching engine that surfaces opportunities based on your
                  service area + keywords/NAICS.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="mt-[7px] h-1.5 w-1.5 rounded-full bg-black/30" />
                <span>A dashboard to quickly triage what’s worth your time.</span>
              </li>
              <li className="flex gap-2">
                <span className="mt-[7px] h-1.5 w-1.5 rounded-full bg-black/30" />
                <span>Built for small businesses that can’t live in portals all day.</span>
              </li>
            </ul>
          </Card>

          <Card title="Trust + transparency">
            <ul className="mt-1 space-y-2">
              <li className="flex gap-2">
                <span className="mt-[7px] h-1.5 w-1.5 rounded-full bg-black/30" />
                <span>We use public listings and trusted third-party sources.</span>
              </li>
              <li className="flex gap-2">
                <span className="mt-[7px] h-1.5 w-1.5 rounded-full bg-black/30" />
                <span>
                  We don’t guarantee accuracy or completeness — always verify details
                  on the official posting.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="mt-[7px] h-1.5 w-1.5 rounded-full bg-black/30" />
                <span>
                  Payments are handled by Stripe. AMBIT does not store full card
                  numbers.
                </span>
              </li>
            </ul>
          </Card>

          <Card title="Quick troubleshooting" tone="highlight">
            <ul className="mt-1 space-y-2">
              <li className="flex gap-2">
                <span className="mt-[7px] h-1.5 w-1.5 rounded-full bg-[#1A4FA3]" />
                <span>
                  <b>Not seeing good matches?</b> Update service area + keywords + NAICS.
                  More detail → better matching.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="mt-[7px] h-1.5 w-1.5 rounded-full bg-[#1A4FA3]" />
                <span>
                  <b>Emails missing?</b> Check spam/promotions and whitelist{" "}
                  <span className="font-semibold">ambit@sevrixgov.com</span>.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="mt-[7px] h-1.5 w-1.5 rounded-full bg-[#1A4FA3]" />
                <span>
                  <b>Billing help?</b> Use Contact and select “Billing / subscription.”
                </span>
              </li>
            </ul>
          </Card>

          <Card title="Need help fast?">
            <div className="text-sm text-black/70">
              When you reach out, include:
            </div>
            <ul className="mt-3 space-y-2">
              <li className="flex gap-2">
                <span className="mt-[7px] h-1.5 w-1.5 rounded-full bg-black/30" />
                <span>Your company name</span>
              </li>
              <li className="flex gap-2">
                <span className="mt-[7px] h-1.5 w-1.5 rounded-full bg-black/30" />
                <span>The page you were on</span>
              </li>
              <li className="flex gap-2">
                <span className="mt-[7px] h-1.5 w-1.5 rounded-full bg-black/30" />
                <span>What you expected to happen vs what happened</span>
              </li>
            </ul>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/contact"
                className="inline-flex h-11 flex-1 items-center justify-center rounded-2xl bg-[#1A4FA3] px-6 text-sm font-semibold text-white hover:bg-[#15428B]"
              >
                Go to Contact
              </Link>

              <Link
                href="/privacy"
                className="inline-flex h-11 flex-1 items-center justify-center rounded-2xl border border-black/10 bg-white px-6 text-sm font-semibold text-black/70 hover:bg-black/[0.03]"
              >
                Privacy
              </Link>

              <Link
                href="/terms"
                className="inline-flex h-11 flex-1 items-center justify-center rounded-2xl border border-black/10 bg-white px-6 text-sm font-semibold text-black/70 hover:bg-black/[0.03]"
              >
                Terms
              </Link>
            </div>
          </Card>
        </div>

        {/* Footer note */}
        <div className="mt-8 rounded-3xl border border-black/10 bg-white px-6 py-5 text-xs leading-relaxed text-black/55 shadow-[0_18px_60px_rgba(0,0,0,0.06)]">
          AMBIT is not affiliated with the U.S. Government. AMBIT provides
          informational tools only and is not legal advice.
        </div>
      </div>
    </main>
  );
}
