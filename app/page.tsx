import Link from "next/link";
import type { ReactNode } from "react";

const CONTAINER = "mx-auto max-w-[1240px] px-6 lg:px-10";

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
      : "border border-[#2A8F8B] text-[#2A8F8B] hover:bg-[#2A8F8B]/5";

  return (
    <Link
      href={href}
      className={`inline-flex items-center justify-center rounded-md px-6 py-3 text-base font-semibold transition ${styles}`}
    >
      {children}
    </Link>
  );
}

function SectionHeading({ children }: { children: ReactNode }) {
  return (
    <h2 className="mx-auto max-w-5xl text-center text-4xl font-black leading-tight tracking-tight text-[#31245C] sm:text-5xl lg:text-[58px]">
      {children}
    </h2>
  );
}

function OpportunityCard() {
  return (
    <div className="relative mx-auto w-full max-w-[360px]">
      <div className="absolute -left-6 top-10 h-10 w-10 rounded-full bg-[#43D1B8]" />
      <div className="absolute -right-8 bottom-10 h-44 w-44 rounded-full bg-[#43D1B8]" />

      <div className="relative rounded-[34px] border border-black/5 bg-[#F7F5F6] p-4 shadow-[0_18px_40px_rgba(49,36,92,0.10)]">
        <div className="rounded-[28px] bg-white p-5 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.05)]">
          <div className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#7A7590]">
            Opportunity
          </div>

          <div className="mt-3 text-[34px] font-black leading-none text-[#171717]">
            91
          </div>

          <div className="mt-1 text-sm font-medium text-[#2A8F8B]">
            Fit score
          </div>

          <div className="mt-5 space-y-3">
            <div className="rounded-xl bg-[#F6FBFA] px-4 py-3">
              <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#7A7590]">
                Buyer
              </div>
              <div className="mt-1 text-sm font-semibold text-[#1E1E1E]">
                Department of Veterans Affairs
              </div>
            </div>

            <div className="rounded-xl bg-[#F6FBFA] px-4 py-3">
              <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#7A7590]">
                Location
              </div>
              <div className="mt-1 text-sm font-semibold text-[#1E1E1E]">
                California
              </div>
            </div>

            <div className="rounded-xl bg-[#F6FBFA] px-4 py-3">
              <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#7A7590]">
                Category
              </div>
              <div className="mt-1 text-sm font-semibold text-[#1E1E1E]">
                Government · NAICS 561730
              </div>
            </div>
          </div>
        </div>
      </div>

      <p className="mt-4 text-center text-xs text-[#7A7590]">
        Example layout for display only.
      </p>
    </div>
  );
}

function BreakdownCard() {
  return (
    <div className="relative mx-auto w-full max-w-[360px]">
      <div className="absolute -left-8 bottom-10 h-44 w-44 rounded-full bg-[#43D1B8]" />

      <div className="relative rounded-[34px] border border-black/5 bg-[#F7F5F6] p-4 shadow-[0_18px_40px_rgba(49,36,92,0.10)]">
        <div className="rounded-[28px] bg-white p-5 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.05)]">
          <div className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#7A7590]">
            Breakdown
          </div>

          <div className="mt-4 space-y-3">
            <div>
              <div className="text-sm font-bold text-[#171717]">
                What matters
              </div>
              <div className="mt-2 h-2 rounded-full bg-[#E8E5EE]" />
              <div className="mt-2 h-2 w-4/5 rounded-full bg-[#E8E5EE]" />
            </div>

            <div className="rounded-xl bg-[#F6FBFA] px-4 py-3">
              <div className="flex items-center justify-between text-sm font-semibold text-[#1E1E1E]">
                <span>Due date</span>
                <span className="text-[#2A8F8B]">Apr 28</span>
              </div>
            </div>

            <div className="rounded-xl bg-[#F6FBFA] px-4 py-3">
              <div className="flex items-center justify-between text-sm font-semibold text-[#1E1E1E]">
                <span>Set-aside</span>
                <span>Small Business</span>
              </div>
            </div>

            <div className="rounded-xl bg-[#F6FBFA] px-4 py-3">
              <div className="text-sm font-semibold text-[#1E1E1E]">
                Scope summary
              </div>
              <div className="mt-2 h-2 rounded-full bg-[#E8E5EE]" />
              <div className="mt-2 h-2 w-11/12 rounded-full bg-[#E8E5EE]" />
              <div className="mt-2 h-2 w-3/4 rounded-full bg-[#E8E5EE]" />
            </div>
          </div>
        </div>
      </div>

      <p className="mt-4 text-center text-xs text-[#7A7590]">
        Example layout for display only.
      </p>
    </div>
  );
}

function WorkflowCard() {
  return (
    <div className="relative mx-auto w-full max-w-[360px]">
      <div className="absolute -right-8 top-12 h-44 w-44 rounded-full bg-[#43D1B8]" />

      <div className="relative rounded-[34px] border border-black/5 bg-[#F7F5F6] p-4 shadow-[0_18px_40px_rgba(49,36,92,0.10)]">
        <div className="rounded-[28px] bg-white p-5 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.05)]">
          <div className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#7A7590]">
            Workflow
          </div>

          <div className="mt-4 space-y-3">
            {[
              "Opportunity sourced",
              "Scope reviewed",
              "Requirements checked",
              "Next actions outlined",
            ].map((item, i) => (
              <div
                key={item}
                className="flex items-center gap-3 rounded-xl bg-[#F6FBFA] px-4 py-3"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#2A8F8B] text-xs font-bold text-white">
                  {i + 1}
                </div>
                <div className="text-sm font-semibold text-[#1E1E1E]">
                  {item}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <p className="mt-4 text-center text-xs text-[#7A7590]">
        Example layout for display only.
      </p>
    </div>
  );
}

function FeatureRow({
  title,
  body,
  buttonText,
  buttonHref,
  visual,
  reverse = false,
}: {
  title: string;
  body: string;
  buttonText: string;
  buttonHref: string;
  visual: ReactNode;
  reverse?: boolean;
}) {
  return (
    <section className={`${CONTAINER} py-12 sm:py-16 lg:py-20`}>
      <div
        className={`grid items-center gap-14 lg:gap-20 ${
          reverse ? "lg:grid-cols-[1fr_520px]" : "lg:grid-cols-[520px_1fr]"
        }`}
      >
        <div className={reverse ? "lg:order-2" : ""}>{visual}</div>

        <div className={reverse ? "lg:order-1" : ""}>
          <h3 className="max-w-[560px] text-4xl font-black leading-tight tracking-tight text-[#31245C] sm:text-5xl lg:text-[56px]">
            {title}
          </h3>

          <p className="mt-6 max-w-[560px] text-xl leading-9 text-[#6A6775]">
            {body}
          </p>

          <div className="mt-8">
            <Button href={buttonHref}>{buttonText}</Button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#E6F5F2] text-[#31245C]">
      <section className={`${CONTAINER} py-14 sm:py-20`}>
        <div className="grid items-center gap-14 lg:grid-cols-[1fr_520px] lg:gap-20">
          <div>
            <h1 className="max-w-[760px] text-5xl font-black leading-[1.02] tracking-tight text-[#2A8F8B] sm:text-6xl lg:text-[72px]">
              Government and commercial contracts, made easier to review.
            </h1>

            <p className="mt-6 max-w-[620px] text-xl leading-9 text-[#6A6775]">
              AMBIT finds relevant opportunities, breaks down what matters, and
              helps move the front-end bid process forward.
            </p>

            <div className="mt-8">
              <Button href="/get-started?intent=government&plan=managed_capture">
                Get started
              </Button>
            </div>
          </div>

          <OpportunityCard />
        </div>
      </section>

      <section className="py-8 sm:py-12">
        <div className={CONTAINER}>
          <SectionHeading>
            Clear opportunity reviews that help your team move faster.
          </SectionHeading>
        </div>
      </section>

      <FeatureRow
        title="Keep the right contract opportunities in one place."
        body="AMBIT organizes buyer details, location, category, and fit so your team can quickly decide what deserves attention."
        buttonText="View sample"
        buttonHref="#sample"
        visual={<BreakdownCard />}
      />

      <FeatureRow
        title="Review requirements and next steps faster."
        body="See the important parts first so owners, estimators, and operations teams spend less time digging and more time deciding."
        buttonText="Get started"
        buttonHref="/get-started?intent=government&plan=managed_capture"
        visual={<WorkflowCard />}
        reverse
      />

      <section
        id="sample"
        className={`${CONTAINER} pb-16 pt-4 sm:pb-24 sm:pt-8`}
      >
        <div className="rounded-[36px] bg-[#DDF3EF] px-8 py-10 sm:px-12 sm:py-12">
          <div className="max-w-4xl">
            <h3 className="text-3xl font-black leading-tight tracking-tight text-[#31245C] sm:text-4xl lg:text-[48px]">
              Front-end bid support without the clutter.
            </h3>
            <p className="mt-4 max-w-3xl text-lg leading-8 text-[#6A6775]">
              Relevant work, simpler breakdowns, and a clearer path from
              opportunity review to next action.
            </p>
          </div>

          <div className="mt-8">
            <Button href="/get-started?intent=government&plan=managed_capture">
              Start here
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}