"use client";

import Link from "next/link";
import type { ReactNode } from "react";

const CONTAINER = "mx-auto max-w-[1180px] px-6 lg:px-8";
const market = "government";

const services = [
  {
    title: "Find",
    body: "We source relevant government and commercial opportunities.",
  },
  {
    title: "Break down",
    body: "We simplify the contract so your team can review it quickly.",
  },
  {
    title: "Support",
    body: "We help with front-end proposal and bid admin work.",
  },
];

const steps = [
  "Tell us what you do",
  "We source and screen",
  "You review the right opportunities",
];

function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-black/40">
      {children}
    </div>
  );
}

function MetaBlock({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="border-t border-black/10 pt-4 first:border-t-0 first:pt-0">
      <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-black/40">
        {label}
      </div>
      <div className="mt-1 text-sm font-semibold text-black/85">{value}</div>
    </div>
  );
}

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#f7f5ef] text-black">
      <section className={`${CONTAINER} py-10 sm:py-14`}>
        <div className="grid items-start gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-[28px] border border-black/10 bg-white px-7 py-8 shadow-[0_8px_30px_rgba(0,0,0,0.04)] sm:px-10 sm:py-10">
            <Eyebrow>AMBIT</Eyebrow>

            <h1 className="mt-4 max-w-4xl text-5xl font-black leading-[0.94] tracking-tight sm:text-6xl lg:text-[72px]">
              Government and commercial contract support for contractors.
            </h1>

            <p className="mt-5 max-w-2xl text-lg leading-8 text-black/65">
              AMBIT finds relevant opportunities, breaks down what matters, and
              helps move the front-end bid process forward.
            </p>

            <div className="mt-8 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
              <Link
                href={`/get-started?intent=${market}&plan=managed_capture`}
                className="inline-flex items-center justify-center rounded-full bg-black px-6 py-3 text-sm font-semibold text-white transition hover:bg-black/85"
              >
                Get Started
              </Link>

              <a
                href="#sample"
                className="text-sm font-semibold text-black/75 underline decoration-black/20 underline-offset-4 transition hover:text-black hover:decoration-black/45"
              >
                View Sample
              </a>
            </div>
          </div>

          <div className="rounded-[28px] border border-black/10 bg-[#fcfbf8] p-7 shadow-[0_8px_30px_rgba(0,0,0,0.03)] sm:p-8">
            <Eyebrow>What we do</Eyebrow>

            <div className="mt-5 space-y-5">
              {services.map((item) => (
                <div
                  key={item.title}
                  className="border-t border-black/10 pt-4 first:border-t-0 first:pt-0"
                >
                  <div className="text-[28px] font-black tracking-tight">
                    {item.title}
                  </div>
                  <p className="mt-1 text-base leading-7 text-black/62">
                    {item.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className={`${CONTAINER} pb-10 sm:pb-14`}>
        <div className="grid gap-4 md:grid-cols-3">
          {steps.map((step, i) => (
            <div
              key={step}
              className="rounded-[22px] border border-black/10 bg-white px-6 py-5 shadow-[0_8px_24px_rgba(0,0,0,0.03)]"
            >
              <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-black/35">
                0{i + 1}
              </div>
              <div className="mt-3 text-2xl font-black leading-tight tracking-tight">
                {step}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="sample" className={`${CONTAINER} pb-12 sm:pb-16`}>
        <div className="rounded-[28px] border border-black/10 bg-white shadow-[0_10px_34px_rgba(0,0,0,0.04)]">
          <div className="border-b border-black/10 px-7 py-4 sm:px-8">
            <Eyebrow>Sample opportunity</Eyebrow>
          </div>

          <div className="grid gap-8 px-7 py-7 lg:grid-cols-[1.15fr_0.85fr] sm:px-8 sm:py-8">
            <div>
              <h2 className="text-4xl font-black leading-tight tracking-tight sm:text-5xl">
                Grounds maintenance services
              </h2>

              <p className="mt-4 max-w-2xl text-lg leading-8 text-black/64">
                Clear scope, clear buyer, clear location, and a simple review
                format your team can understand fast.
              </p>
            </div>

            <div className="rounded-[22px] border border-black/10 bg-[#faf8f3] p-6">
              <div className="space-y-4">
                <MetaBlock
                  label="Buyer"
                  value="Department of Veterans Affairs"
                />
                <MetaBlock label="Location" value="California" />
                <MetaBlock
                  label="Category"
                  value="Government · NAICS 561730"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={`${CONTAINER} pb-16 sm:pb-20`}>
        <div className="flex flex-col items-start justify-between gap-5 rounded-[28px] border border-black/10 bg-[#111111] px-7 py-7 text-white shadow-[0_12px_34px_rgba(0,0,0,0.12)] sm:flex-row sm:items-center sm:px-8">
          <div>
            <Eyebrow>Next step</Eyebrow>
            <h2 className="mt-3 text-3xl font-black leading-tight tracking-tight text-white sm:text-4xl">
              Clear work. Simple review. Better bid flow.
            </h2>
          </div>

          <Link
            href={`/get-started?intent=${market}&plan=managed_capture`}
            className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-black transition hover:bg-white/90"
          >
            Start Here
          </Link>
        </div>
      </section>
    </main>
  );
}