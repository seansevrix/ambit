// app/prime/page.tsx
import Link from "next/link";

const INCLUDED = [
  "Opportunity review + fit check",
  "Prime coordination for qualified bids",
  "Bid submission support + status updates",
  "One active opportunity at a time (quality-first workflow)",
];

const BEST_FIT = [
  "HVAC, Plumbing, Electrical, Landscaping, Janitorial",
  "Teams ready to perform if awarded",
  "Companies that want faster execution on qualified opportunities",
];

const STEPS = [
  {
    title: "Apply for Ambit Prime",
    body: "Tell us your trade, service area, and project type.",
  },
  {
    title: "We review fit + targets",
    body: "We qualify opportunities and align on what to pursue.",
  },
  {
    title: "Prime support begins",
    body: "We coordinate submission and keep you updated through bid status.",
  },
];

export default function PrimePage() {
  return (
    <main className="mx-auto max-w-[980px] px-6 py-16 sm:py-20">
      <header className="max-w-2xl">
        <h1 className="text-4xl font-semibold tracking-tight text-black sm:text-5xl">
          Ambit Prime
        </h1>
        <p className="mt-4 text-lg text-black/70">
          AMBIT can prime qualified opportunities for your company.
        </p>
      </header>

      {/* Primary card */}
      <section className="mt-8 rounded-3xl border border-black/10 bg-white/75 p-7 backdrop-blur-sm sm:p-8">
        <p className="text-base text-black/75">
          Pricing: <span className="font-semibold text-black">$299/month</span>
        </p>
        <p className="mt-2 text-base text-black/70">
          If you want us to prime for your team, apply and we’ll review fit.
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Link
            href="/get-started?plan=prime"
            className="inline-flex items-center justify-center rounded-md border border-black/20 px-4 py-2 text-sm font-semibold text-black transition hover:bg-black hover:text-white"
          >
            Apply for Ambit Prime
          </Link>

          <span className="text-xs text-black/55">Limited onboarding spots each month.</span>
        </div>
      </section>

      {/* Included */}
      <section className="mt-8 rounded-2xl border border-black/10 bg-white/60 p-6">
        <h2 className="text-lg font-semibold text-black">What’s included for $299/mo</h2>
        <ul className="mt-4 grid gap-2 text-sm text-black/75">
          {INCLUDED.map((item) => (
            <li key={item} className="flex items-start gap-2">
              <span className="mt-[2px] text-black/70">•</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Fit + steps */}
      <section className="mt-6 grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-black/10 bg-white/60 p-6">
          <h3 className="text-base font-semibold text-black">Best fit for</h3>
          <ul className="mt-3 grid gap-2 text-sm text-black/75">
            {BEST_FIT.map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span className="mt-[2px] text-black/70">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-black/10 bg-white/60 p-6">
          <h3 className="text-base font-semibold text-black">How it works</h3>
          <ol className="mt-3 grid gap-3 text-sm text-black/75">
            {STEPS.map((step, i) => (
              <li key={step.title} className="flex gap-3">
                <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-black/20 text-xs font-semibold text-black">
                  {i + 1}
                </span>
                <div>
                  <div className="font-medium text-black">{step.title}</div>
                  <div className="text-black/70">{step.body}</div>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <p className="mt-6 text-xs text-black/55">
        Note: Government awards are never guaranteed. Ambit Prime is a support service and not a guarantee of contract award.
      </p>
    </main>
  );
}
