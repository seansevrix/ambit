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

function PilotPriceCard() {
  return (
    <div className="rounded-[32px] border border-black/5 bg-white p-5 shadow-[0_18px_40px_rgba(49,36,92,0.10)] sm:p-6">
      <div className="rounded-[24px] border border-[#2A8F8B]/10 bg-[#F8FCFB] p-6">
        <Eyebrow>New client pilot</Eyebrow>

        <div className="mt-4 text-3xl font-black leading-tight text-[#31245C] sm:text-[34px]">
          Start with a lower-risk first month.
        </div>

        <div className="mt-5 flex items-end gap-3">
          <span className="text-2xl font-bold text-[#8C879D] line-through">
            $1,499
          </span>
          <span className="text-5xl font-black tracking-tight text-[#A02727]">
            $499
          </span>
        </div>

        <p className="mt-3 text-base leading-7 text-[#6A6775]">
          One-time pilot for new clients. A simple way to test AMBIT before
          moving into full monthly support.
        </p>

        <div className="mt-5 rounded-[18px] border border-[#31245C]/8 bg-white px-4 py-4">
          <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#7A7590]">
            Included in the pilot
          </div>

          <div className="mt-3">
            <BulletList
              items={[
                "Contract sourcing aligned to your trade and service area",
                "Requirement and compliance review",
                "Deadline, amendment, and action tracking",
                "Front-end proposal organization and support",
              ]}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <main className="min-h-screen bg-[#EAF3FF] text-[#31245C]">
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
          <div className="grid items-start gap-10 lg:grid-cols-[1fr_500px] lg:gap-16">
            <div>
              <Eyebrow>Get started</Eyebrow>

              <h1 className="mt-4 max-w-[760px] text-5xl font-black leading-[1.02] tracking-tight text-[#31245C] sm:text-6xl lg:text-[70px]">
                We handle the front-end contract work so your team can stay
                focused on execution.
              </h1>

              <p className="mt-6 max-w-[680px] text-xl leading-9 text-[#6A6775]">
                AMBIT finds relevant opportunities, reviews requirements,
                tracks deadlines and compliance items, and helps build the
                proposal package so your team is not stuck buried in admin.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Button href="#checkout">Start secure signup</Button>
                <Button href="/login" variant="secondary">
                  Log in
                </Button>
              </div>

              <div className="mt-8 max-w-[690px] rounded-[22px] border border-[#31245C]/8 bg-white px-5 py-5 shadow-[0_16px_36px_rgba(49,36,92,0.06)]">
                <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#7A7590]">
                  What this means
                </div>
                <p className="mt-3 text-base leading-8 text-[#6A6775]">
                  We are built for teams that want help with the sourcing,
                  review, organization, and proposal prep work that usually
                  slows bids down. You focus on the job. We help carry the
                  paperwork load.
                </p>
              </div>
            </div>

            <PilotPriceCard />
          </div>
        </section>

        <section className="py-12 sm:py-16">
          <div className="grid gap-6 lg:grid-cols-3">
            <InfoCard
              title="We source"
              body="AMBIT monitors for relevant government and commercial work, filters for fit, and puts real opportunities in front of your team."
            />
            <InfoCard
              title="We manage the admin"
              body="We help handle requirement review, compliance items, deadlines, and amendment tracking so your team is not losing time in paperwork."
            />
            <InfoCard
              title="We support the proposal"
              body="If you want to pursue the opportunity, we help organize and build the front-end proposal package so your team is not starting from scratch."
            />
          </div>
        </section>

        <section
          id="checkout"
          className="rounded-[36px] bg-[#DFF3EE] px-6 py-8 shadow-[0_20px_40px_rgba(49,36,92,0.06)] sm:px-8 sm:py-10"
        >
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#31245C]/10 pb-6">
            <div>
              <Eyebrow>Checkout</Eyebrow>
              <h2 className="mt-3 text-3xl font-black leading-tight tracking-tight text-[#31245C] sm:text-4xl">
                Choose your lane and continue through secure checkout.
              </h2>
              <p className="mt-3 max-w-2xl text-base leading-8 text-[#6A6775]">
                Start with the option that fits your business best. New clients
                can use the pilot to test the process before moving into ongoing
                support.
              </p>
            </div>

            <div className="inline-flex items-center gap-2 rounded-full border border-[#2A8F8B]/15 bg-white px-3 py-1.5 text-xs font-semibold text-[#31245C] shadow-sm">
              <span className="text-[#2A8F8B]">
                <LockIcon />
              </span>
              Direct checkout
            </div>
          </div>

          <div className="mt-6 rounded-[24px] border border-[#31245C]/8 bg-white px-5 py-5">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <div className="text-sm font-semibold uppercase tracking-[0.14em] text-[#7A7590]">
                Pilot available
              </div>
              <div className="text-lg font-semibold text-[#8C879D] line-through">
                $1,499
              </div>
              <div className="text-3xl font-black tracking-tight text-[#A02727]">
                $499 first month
              </div>
            </div>

            <p className="mt-3 max-w-3xl text-base leading-8 text-[#6A6775]">
              The pilot is designed for businesses that want to see how AMBIT
              works with real opportunities, real admin support, and real
              proposal assistance before committing long term.
            </p>
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
              <Eyebrow>How it works</Eyebrow>
              <div className="mt-4">
                <BulletList
                  items={[
                    "We source opportunities that fit your trade and service area",
                    "If you want to pursue one, we help handle the front-end admin work",
                    "We organize the proposal package and keep the process moving",
                    "Your team reviews, approves, and submits",
                  ]}
                />
              </div>
            </div>

            <div className="rounded-[28px] bg-white p-7 shadow-[0_16px_36px_rgba(49,36,92,0.08)]">
              <Eyebrow>Why teams sign up</Eyebrow>
              <div className="mt-4">
                <BulletList
                  items={[
                    "Less time hunting for contracts",
                    "Less time buried in forms and requirement review",
                    "Less admin drag on operators and estimators",
                    "A cleaner path from opportunity to submission",
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