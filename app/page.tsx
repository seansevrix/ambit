"use client";

import Link from "next/link";
import LandingBackground from "./components/LandingBackground";

const CONTAINER = "mx-auto max-w-[1120px] px-6 lg:px-8";
const market = "government";

const services = [
  {
    title: "Find",
    body: "We source relevant government and commercial opportunities.",
  },
  {
    title: "Break down",
    body: "We simplify the contract so your team can review it fast.",
  },
  {
    title: "Support",
    body: "We help with the front-end proposal and bid admin process.",
  },
];

const steps = [
  "Tell us what you do",
  "We source and screen",
  "You review the right opportunities",
];

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-black/45">
      {children}
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f5f5f2] text-black">
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-70">
        <LandingBackground />
      </div>

      <main>
        <section className={`${CONTAINER} pt-12 pb-20`}>
          <div className="border-y border-black/10 bg-white/92">
            <div className="grid gap-10 px-0 py-12 lg:grid-cols-[1.25fr_0.75fr] lg:py-16">
              <div>
                <Label>AMBIT</Label>

                <h1 className="mt-4 max-w-4xl text-5xl font-black leading-[0.95] tracking-tight sm:text-6xl lg:text-7xl">
                  Government and commercial contract support for contractors.
                </h1>

                <p className="mt-6 max-w-2xl text-lg leading-8 text-black/68">
                  AMBIT finds relevant opportunities, breaks down what matters,
                  and helps move the front-end bid process forward.
                </p>

                <div className="mt-8 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
                  <Link
                    href={`/get-started?intent=${market}&plan=managed_capture`}
                    className="inline-flex items-center justify-center bg-black px-6 py-3 text-sm font-semibold text-white transition hover:bg-black/85"
                  >
                    Get Started
                  </Link>

                  <a
                    href="#sample"
                    className="text-sm font-semibold text-black underline decoration-black/20 underline-offset-4 hover:decoration-black/50"
                  >
                    View Sample
                  </a>
                </div>
              </div>

              <div className="border-t border-black/10 pt-6 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
                <Label>What we do</Label>

                <div className="mt-5 space-y-5">
                  {services.map((item) => (
                    <div key={item.title} className="border-t border-black/10 pt-4 first:border-t-0 first:pt-0">
                      <div className="text-lg font-black tracking-tight">
                        {item.title}
                      </div>
                      <p className="mt-1 text-sm leading-7 text-black/65">
                        {item.body}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className={`${CONTAINER} pb-20`}>
          <div className="grid gap-8 md:grid-cols-3">
            {steps.map((step, i) => (
              <div key={step} className="border-t border-black/10 pt-4">
                <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-black/40">
                  0{i + 1}
                </div>
                <div className="mt-3 text-xl font-black tracking-tight">
                  {step}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section id="sample" className={`${CONTAINER} pb-20`}>
          <div className="border border-black/10 bg-white/95">
            <div className="border-b border-black/10 px-6 py-4">
              <Label>Sample opportunity</Label>
            </div>

            <div className="grid gap-8 px-6 py-6 lg:grid-cols-[1.15fr_0.85fr]">
              <div>
                <h2 className="text-3xl font-black tracking-tight sm:text-4xl">
                  Grounds maintenance services
                </h2>

                <p className="mt-4 max-w-2xl text-base leading-8 text-black/68">
                  A simple example of how AMBIT presents a contract: clear
                  scope, clear buyer, clear location, and clear next review.
                </p>
              </div>

              <div className="border-t border-black/10 pt-4 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
                <div className="space-y-4 text-sm">
                  <div className="border-t border-black/10 pt-3 first:border-t-0 first:pt-0">
                    <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-black/45">
                      Buyer
                    </div>
                    <div className="mt-1 font-semibold text-black/85">
                      Department of Veterans Affairs
                    </div>
                  </div>

                  <div className="border-t border-black/10 pt-3">
                    <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-black/45">
                      Location
                    </div>
                    <div className="mt-1 font-semibold text-black/85">
                      California
                    </div>
                  </div>

                  <div className="border-t border-black/10 pt-3">
                    <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-black/45">
                      Category
                    </div>
                    <div className="mt-1 font-semibold text-black/85">
                      Government · NAICS 561730
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className={`${CONTAINER} pb-24`}>
          <div className="border-y border-black/10 bg-white/92">
            <div className="flex flex-col items-start justify-between gap-6 px-0 py-10 sm:flex-row sm:items-end">
              <div>
                <Label>Next step</Label>
                <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">
                  Clear work. Simple review. Better bid flow.
                </h2>
              </div>

              <Link
                href={`/get-started?intent=${market}&plan=managed_capture`}
                className="inline-flex items-center justify-center bg-black px-6 py-3 text-sm font-semibold text-white transition hover:bg-black/85"
              >
                Start Here
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}