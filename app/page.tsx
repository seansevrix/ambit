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
            Sourced contract
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
            Compliance + deadlines
          </div>

          <div className="mt-4 space-y-3">
            <div>
              <div className="text-sm font-bold text-[#171717]">
                Requirements reviewed
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
                Compliance notes
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
            Proposal workflow
          </div>

          <div className="mt-4 space-y-3">
            {[
              "Opportunity sent to your team",
              "Requirements and compliance reviewed",
              "Proposal package built",
              "Ready for final submission",
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
            <h1 className="max-w-[820px] text-5xl font-black leading-[1.02] tracking-tight text-[#2A8F8B] sm:text-6xl lg:text-[72px]">
              We handle the admin side of bidding so you can focus on the job.
            </h1>

            <p className="mt-6 max-w-[680px] text-xl leading-9 text-[#6A6775]">
              AMBIT sources relevant contracts, sends them to your team, handles
              compliance review, tracks deadlines and amendments, and builds the
              proposal package so you are not stuck dealing with paperwork.
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
            We find the contract, handle the paperwork, and keep the bid moving.
          </SectionHeading>
        </div>
      </section>

      <FeatureRow
        title="We source the right contracts and send them to you."
        body="AMBIT monitors for relevant government and commercial opportunities, reviews the fit, and puts the right jobs in front of your team so you do not have to spend hours hunting for work."
        buttonText="Get started"
        buttonHref="/get-started?intent=government&plan=managed_capture"
        visual={<BreakdownCard />}
      />

      <FeatureRow
        title="We handle compliance, deadlines, and proposal building."
        body="If you want to pursue the job, AMBIT helps carry the admin load by reviewing requirements, organizing the front-end paperwork, tracking due dates and amendments, and building the proposal package."
        buttonText="View sample"
        buttonHref="#sample"
        visual={<WorkflowCard />}
        reverse
      />

      <FeatureRow
        title="Your team stays focused on the work itself."
        body="Instead of getting buried in forms, requirement review, and bid admin, your team can stay focused on operations while AMBIT keeps the pursuit organized from sourcing to submission-ready paperwork."
        buttonText="Start here"
        buttonHref="/get-started?intent=government&plan=managed_capture"
        visual={<OpportunityCard />}
      />

      <section
        id="sample"
        className={`${CONTAINER} pb-16 pt-4 sm:pb-24 sm:pt-8`}
      >
        <div className="rounded-[36px] bg-[#DDF3EF] px-8 py-10 sm:px-12 sm:py-12">
          <div className="max-w-4xl">
            <h3 className="text-3xl font-black leading-tight tracking-tight text-[#31245C] sm:text-4xl lg:text-[48px]">
              Less paperwork. Less chasing. Less admin on your back.
            </h3>
            <p className="mt-4 max-w-3xl text-lg leading-8 text-[#6A6775]">
              We source the contract, break it down, handle the compliance and
              deadline side, build the proposal, and leave your team with a
              cleaner path to final submission.
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