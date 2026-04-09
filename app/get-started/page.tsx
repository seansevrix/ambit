import { Suspense, type ReactNode } from "react";
import Link from "next/link";
import GetStartedClient from "./GetStartedClient";

const CONTAINER = "mx-auto max-w-[1240px] px-6 lg:px-10";

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden="true">
      <path
        d="M7.5 10.2V8.6a4.5 4.5 0 0 1 9 0v1.6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M6.8 10.2h10.4c.9 0 1.6.7 1.6 1.6v7.6c0 .9-.7 1.6-1.6 1.6H6.8c-.9 0-1.6-.7-1.6-1.6v-7.6c0-.9.7-1.6 1.6-1.6Z"
        stroke="currentColor"
        strokeWidth="2"
      />
    </svg>
  );
}

function LoadingFallback() {
  return (
    <div className="rounded-[28px] border border-black/10 bg-white p-8 shadow-[0_18px_40px_rgba(49,36,92,0.08)]">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#2A8F8B]/10 text-[#2A8F8B]">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#2A8F8B]/20 border-t-[#2A8F8B]" />
        </div>

        <div>
          <div className="text-base font-bold text-[#31245C]">
            Loading secure checkout
          </div>
          <div className="text-sm text-[#6A6775]">
            One moment while we prepare your signup.
          </div>
        </div>
      </div>
    </div>
  );
}

function Button({
  href,
  children,
  variant = "primary",
}: {
  href: string;
  children: ReactNode;
  variant?: "primary" | "secondary";
}) {
  const styles =
    variant === "primary"
      ? "bg-[#2A8F8B] text-white hover:bg-[#247d7a]"
      : "border border-[#2A8F8B]/20 bg-white text-[#2A8F8B] hover:bg-[#2A8F8B]/5";

  return (
    <Link
      href={href}
      className={`inline-flex items-center justify-center rounded-md px-5 py-3 text-sm font-semibold transition ${styles}`}
    >
      {children}
    </Link>
  );
}

function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#7A7590]">
      {children}
    </div>
  );
}

function InfoCard({
  title,
  body,
}: {
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-[24px] bg-white p-6 shadow-[0_16px_36px_rgba(49,36,92,0.08)]">
      <div className="text-2xl font-black tracking-tight text-[#31245C]">
        {title}
      </div>
      <p className="mt-3 text-base leading-8 text-[#6A6775]">{body}</p>
    </div>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item} className="flex items-start gap-3">
          <span className="mt-2 h-2.5 w-2.5 rounded-full bg-[#43D1B8]" />
          <span className="text-base leading-7 text-[#6A6775]">{item}</span>
        </div>
      ))}
    </div>
  );
}

export default function Page() {
  return (
    <main className="min-h-screen bg-[#E6F5F2] text-[#31245C]">
      <div className={`${CONTAINER} py-12 sm:py-16 lg:py-20`}>
        <div className="flex items-center justify-between gap-4">
          <Link
            href="/"
            className="text-sm font-semibold text-[#6A6775] transition hover:text-[#31245C]"
          >
            ← Back
          </Link>

          <div className="inline-flex items-center gap-2 rounded-full border border-[#2A8F8B]/15 bg-white px-3 py-1.5 text-xs font-semibold text-[#31245C] shadow-sm">
            <span className="text-[#2A8F8B]">
              <LockIcon />
            </span>
            Secure signup
          </div>
        </div>

        <section className="pt-10 sm:pt-14">
          <div className="grid items-start gap-12 lg:grid-cols-[1fr_520px] lg:gap-20">
            <div>
              <Eyebrow>Get started</Eyebrow>

              <h1 className="mt-4 max-w-[780px] text-5xl font-black leading-[1.02] tracking-tight text-[#2A8F8B] sm:text-6xl lg:text-[72px]">
                We handle the admin load so you can focus on the job.
              </h1>

              <p className="mt-6 max-w-[640px] text-xl leading-9 text-[#6A6775]">
                AMBIT helps contractors source opportunities, break down what
                matters, organize proposal work, track deadlines, and keep the
                front-end bid process moving.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Button href="#checkout">Start here</Button>
                <Button href="/login" variant="secondary">
                  Log in
                </Button>
              </div>
            </div>

            <div className="rounded-[34px] border border-black/5 bg-[#F7F5F6] p-4 shadow-[0_18px_40px_rgba(49,36,92,0.10)]">
              <div className="rounded-[28px] bg-white p-6 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.05)]">
                <Eyebrow>What we handle</Eyebrow>

                <div className="mt-4 text-3xl font-black leading-tight text-[#31245C]">
                  Less admin on your desk.
                </div>

                <div className="mt-5">
                  <BulletList
                    items={[
                      "Contract sourcing and initial fit review",
                      "Requirement breakdowns and next-step clarity",
                      "Proposal organization and front-end admin support",
                      "Deadline and amendment tracking",
                      "A cleaner path from review to submission",
                    ]}
                  />
                </div>

                <div className="mt-6 rounded-[18px] bg-[#F6FBFA] px-4 py-4">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#7A7590]">
                    Bottom line
                  </div>
                  <div className="mt-2 text-sm font-semibold text-[#31245C]">
                    Your team stays focused on execution. AMBIT helps carry the
                    front-end bid workload.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-12 sm:py-16">
          <div className="grid gap-6 lg:grid-cols-3">
            <InfoCard
              title="We source"
              body="AMBIT finds relevant government and commercial opportunities so your team spends less time hunting and more time reviewing the right work."
            />
            <InfoCard
              title="We organize"
              body="We simplify requirements, structure the early response process, and make it easier to understand what the opportunity is asking for."
            />
            <InfoCard
              title="We support"
              body="We help keep proposal admin, amendments, deadlines, and front-end bid tasks moving so your team is not buried in paperwork."
            />
          </div>
        </section>

        <section
          id="checkout"
          className="rounded-[36px] bg-[#DDF3EF] px-6 py-8 shadow-[0_20px_40px_rgba(49,36,92,0.06)] sm:px-8 sm:py-10"
        >
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#31245C]/10 pb-6">
            <div>
              <Eyebrow>Checkout</Eyebrow>
              <h2 className="mt-3 text-3xl font-black leading-tight tracking-tight text-[#31245C] sm:text-4xl">
                Choose your lane and start secure signup.
              </h2>
              <p className="mt-3 max-w-2xl text-base leading-8 text-[#6A6775]">
                Pick the option that fits your business and continue through
                direct checkout below.
              </p>
            </div>

            <div className="inline-flex items-center gap-2 rounded-full border border-[#2A8F8B]/15 bg-white px-3 py-1.5 text-xs font-semibold text-[#31245C] shadow-sm">
              <span className="text-[#2A8F8B]">
                <LockIcon />
              </span>
              Direct checkout
            </div>
          </div>

          <div className="pt-8">
            <Suspense fallback={<LoadingFallback />}>
              <GetStartedClient />
            </Suspense>
          </div>
        </section>

        <section className="py-12 sm:py-16">
          <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
            <div className="rounded-[28px] bg-white p-7 shadow-[0_16px_36px_rgba(49,36,92,0.08)]">
              <Eyebrow>What happens next</Eyebrow>
              <div className="mt-4">
                <BulletList
                  items={[
                    "Choose your lane and complete checkout",
                    "Set your business details and targeting",
                    "Start receiving opportunities with more structure and less admin drag",
                  ]}
                />
              </div>
            </div>

            <div className="rounded-[28px] bg-white p-7 shadow-[0_16px_36px_rgba(49,36,92,0.08)]">
              <Eyebrow>Why teams sign up</Eyebrow>
              <div className="mt-4">
                <BulletList
                  items={[
                    "Less time chasing contracts",
                    "Less confusion around requirements",
                    "Less front-end bid admin on internal staff",
                  ]}
                />
              </div>

              <div className="mt-6 text-sm font-semibold text-[#31245C]">
                Already subscribed?{" "}
                <Link href="/login" className="text-[#2A8F8B] hover:underline">
                  Log in
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}