"use client";

import Link from "next/link";
import LandingBackground from "./components/LandingBackground";

type Market = "residential" | "commercial" | "government";

const market: Market = "government";
const CONTAINER = "mx-auto max-w-[1120px] px-6 lg:px-8";

const SERVICES = [
  {
    title: "Opportunity sourcing",
    body:
      "We identify government and commercial opportunities that fit your trade, geography, and service scope.",
  },
  {
    title: "Contract breakdowns",
    body:
      "We simplify the important parts of each opportunity so your team can quickly understand what the job is asking for.",
  },
  {
    title: "Front-end proposal support",
    body:
      "We help organize the early bid workload so owners, estimators, and operations teams are not buried in admin.",
  },
];

const PROCESS = [
  {
    step: "01",
    title: "We learn your scope",
    body:
      "Trade, territory, preferred work types, and the buyers or project profiles you want more of.",
  },
  {
    step: "02",
    title: "We source and screen",
    body:
      "AMBIT surfaces relevant opportunities and filters out weak-fit noise before it reaches your team.",
  },
  {
    step: "03",
    title: "We break down what matters",
    body:
      "Deadlines, buyer, location, scope, requirements, and next actions are presented in a format that is easy to review.",
  },
  {
    step: "04",
    title: "You decide how hands-on you want us",
    body:
      "Use Morning Matches for a lighter self-serve lane or Managed Capture for higher-touch support around active bids.",
  },
];

const SAMPLE = {
  eyebrow: "Sample opportunity breakdown",
  title: "Grounds maintenance services — national cemetery",
  buyer: "Department of Veterans Affairs",
  location: "California",
  type: "Government",
  code: "NAICS 561730",
  due: "Due date shown in client breakdown",
  summary:
    "A recurring exterior maintenance requirement with clear scope alignment for landscape and grounds contractors already performing commercial or public-sector work.",
  details: [
    "Service scope is easy to understand at a high level before deeper review.",
    "Buyer, location, category code, and timing are made visible immediately.",
    "AMBIT highlights whether the opportunity is worth pursuing before your team spends hours digging.",
  ],
};

const FIT = [
  "Contractors that want more government or commercial work",
  "Teams that can perform the work but lack front-end bid bandwidth",
  "Owners and estimators stretched thin by admin and opportunity hunting",
  "Companies that need structure before deciding to pursue an opportunity",
];

const NOT_FIT = [
  "Teams looking only for software with no service support",
  "Companies that do not want outside help on sourcing or bid organization",
  "Firms that already have a fully built internal capture team",
];

function SectionLabel({ children }: { children: string }) {
  return (
    <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-black/50">
      {children}
    </div>
  );
}

function SectionTitle({
  title,
  body,
}: {
  title: string;
  body?: string;
}) {
  return (
    <div className="max-w-3xl">
      <h2 className="text-3xl font-black tracking-tight text-black sm:text-4xl">
        {title}
      </h2>
      {body ? (
        <p className="mt-4 text-base leading-8 text-black/68 sm:text-lg">
          {body}
        </p>
      ) : null}
    </div>
  );
}

function BorderCard({
  title,
  body,
}: {
  title: string;
  body: string;
}) {
  return (
    <div className="border-t border-black/12 pt-5">
      <h3 className="text-lg font-black tracking-tight text-black">{title}</h3>
      <p className="mt-2 text-sm leading-7 text-black/68">{body}</p>
    </div>
  );
}

function HeroSection() {
  return (
    <section className={`${CONTAINER} pt-10 sm:pt-14`}>
      <div className="border-y border-black/12 bg-white/92">
        <div className="grid gap-12 px-0 py-10 lg:grid-cols-[1.35fr_0.85fr] lg:py-14">
          <div className="px-0">
            <SectionLabel>AMBIT</SectionLabel>

            <h1 className="mt-4 max-w-4xl text-5xl font-black leading-[0.96] tracking-tight text-black sm:text-6xl lg:text-7xl">
              Contract sourcing and proposal support for contractors.
            </h1>

            <p className="mt-6 max-w-3xl text-lg leading-8 text-black/72 sm:text-xl">
              AMBIT helps contractors pursue government and commercial work by
              identifying relevant opportunities, simplifying what each one is
              asking for, and supporting the front-end bid workload.
            </p>

            <p className="mt-5 max-w-3xl text-base leading-8 text-black/62">
              This is not just a feed of leads. It is a more structured way to
              review opportunities, make faster bid decisions, and reduce the
              administrative drag that slows pursuit down.
            </p>

            <div className="mt-8 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
              <Link
                href={`/get-started?intent=${market}&plan=managed_capture`}
                className="inline-flex items-center justify-center rounded-none bg-black px-6 py-3 text-sm font-semibold text-white transition hover:bg-black/85"
              >
                Get Started
              </Link>

              <a
                href="#sample"
                className="text-sm font-semibold text-black underline decoration-black/20 underline-offset-4 hover:decoration-black/50"
              >
                View sample breakdown
              </a>
            </div>
          </div>

          <aside className="border-t border-black/12 pt-6 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
            <SectionLabel>At a glance</SectionLabel>

            <div className="mt-5 space-y-5">
              <div className="border-t border-black/12 pt-4">
                <div className="text-sm font-bold uppercase tracking-[0.14em] text-black/45">
                  Core service
                </div>
                <div className="mt-2 text-base font-semibold text-black/88">
                  Opportunity sourcing, contract breakdowns, and front-end
                  proposal support
                </div>
              </div>

              <div className="border-t border-black/12 pt-4">
                <div className="text-sm font-bold uppercase tracking-[0.14em] text-black/45">
                  Best for
                </div>
                <div className="mt-2 text-base font-semibold text-black/88">
                  Owners, estimators, and operations teams that need more bid
                  capacity without adding headcount
                </div>
              </div>

              <div className="border-t border-black/12 pt-4">
                <div className="text-sm font-bold uppercase tracking-[0.14em] text-black/45">
                  Engagement options
                </div>
                <div className="mt-2 text-base font-semibold text-black/88">
                  Morning Matches or Managed Capture
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}

function WhatWeDoSection() {
  return (
    <section className={`${CONTAINER} py-16 sm:py-20`}>
      <SectionLabel>What we do</SectionLabel>
      <div className="mt-4">
        <SectionTitle
          title="A simpler way to understand what AMBIT actually does."
          body="The goal is straightforward: bring relevant work into view, reduce time wasted on weak-fit opportunities, and help your team move through early bid decisions with more structure."
        />
      </div>

      <div className="mt-10 grid gap-8 md:grid-cols-3">
        {SERVICES.map((item) => (
          <BorderCard key={item.title} title={item.title} body={item.body} />
        ))}
      </div>
    </section>
  );
}

function ProcessSection() {
  return (
    <section className={`${CONTAINER} py-16 sm:py-20`}>
      <div className="border-y border-black/12 bg-white/90">
        <div className="px-0 py-10 sm:py-12">
          <SectionLabel>How it works</SectionLabel>

          <div className="mt-4">
            <SectionTitle
              title="Built to be clear before it tries to sell."
              body="The process is meant to be understandable immediately. A contractor should be able to land on the page and know exactly where AMBIT fits."
            />
          </div>

          <div className="mt-10 divide-y divide-black/12">
            {PROCESS.map((item) => (
              <div
                key={item.step}
                className="grid gap-4 py-6 sm:grid-cols-[80px_1fr_1.2fr] sm:gap-8"
              >
                <div className="text-sm font-black tracking-[0.18em] text-black/40">
                  {item.step}
                </div>
                <div className="text-lg font-black tracking-tight text-black">
                  {item.title}
                </div>
                <div className="text-sm leading-7 text-black/68">
                  {item.body}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function SampleSection() {
  return (
    <section className={`${CONTAINER} py-16 sm:py-20`} id="sample">
      <SectionLabel>{SAMPLE.eyebrow}</SectionLabel>

      <div className="mt-4 grid gap-10 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <SectionTitle
            title="What a client should be able to review in minutes."
            body="Instead of a dashboard-style feed, this presents a contract more like a briefing: what it is, who the buyer is, where it is located, and why it may deserve attention."
          />
        </div>

        <div className="border-t border-black/12 pt-4 text-sm leading-7 text-black/62 lg:border-t-0 lg:pt-0">
          The point is not to overwhelm. The point is to make the first review
          faster and cleaner.
        </div>
      </div>

      <div className="mt-10 border border-black/12 bg-white/95">
        <div className="border-b border-black/12 px-6 py-4">
          <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-black/45">
            Opportunity snapshot
          </div>
        </div>

        <div className="grid gap-8 px-6 py-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <h3 className="text-2xl font-black tracking-tight text-black sm:text-3xl">
              {SAMPLE.title}
            </h3>

            <p className="mt-4 text-base leading-8 text-black/70">
              {SAMPLE.summary}
            </p>

            <div className="mt-6 space-y-3">
              {SAMPLE.details.map((item) => (
                <div
                  key={item}
                  className="border-t border-black/12 pt-3 text-sm leading-7 text-black/68"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-black/12 pt-4 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
            <div className="space-y-5">
              <div className="border-t border-black/12 pt-4 first:border-t-0 first:pt-0">
                <div className="text-xs font-bold uppercase tracking-[0.14em] text-black/45">
                  Buyer
                </div>
                <div className="mt-1 text-sm font-semibold text-black/88">
                  {SAMPLE.buyer}
                </div>
              </div>

              <div className="border-t border-black/12 pt-4">
                <div className="text-xs font-bold uppercase tracking-[0.14em] text-black/45">
                  Location
                </div>
                <div className="mt-1 text-sm font-semibold text-black/88">
                  {SAMPLE.location}
                </div>
              </div>

              <div className="border-t border-black/12 pt-4">
                <div className="text-xs font-bold uppercase tracking-[0.14em] text-black/45">
                  Category
                </div>
                <div className="mt-1 text-sm font-semibold text-black/88">
                  {SAMPLE.type} · {SAMPLE.code}
                </div>
              </div>

              <div className="border-t border-black/12 pt-4">
                <div className="text-xs font-bold uppercase tracking-[0.14em] text-black/45">
                  Timing
                </div>
                <div className="mt-1 text-sm font-semibold text-black/88">
                  {SAMPLE.due}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ServiceLanesSection() {
  return (
    <section className={`${CONTAINER} py-16 sm:py-20`}>
      <SectionLabel>Service options</SectionLabel>
      <div className="mt-4">
        <SectionTitle
          title="Two ways to work with AMBIT."
          body="Keep the offers simple. One lighter lane. One hands-on lane. No clutter."
        />
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <div className="border-t border-black/12 pt-5">
          <div className="text-2xl font-black tracking-tight text-black">
            Morning Matches
          </div>
          <p className="mt-3 text-sm leading-7 text-black/68">
            A lighter self-serve option for contractors that want ranked daily
            opportunities without as much hands-on support.
          </p>

          <div className="mt-5 space-y-3">
            {[
              "Daily matched opportunities",
              "Simple visibility into buyer, location, and fit",
              "Useful for teams that mainly want a cleaner sourcing stream",
            ].map((item) => (
              <div
                key={item}
                className="border-t border-black/12 pt-3 text-sm leading-7 text-black/68"
              >
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-black/12 pt-5">
          <div className="text-2xl font-black tracking-tight text-black">
            Managed Capture
          </div>
          <p className="mt-3 text-sm leading-7 text-black/68">
            The higher-touch lane for companies that want help not only finding
            work, but also organizing the early proposal and pursuit process.
          </p>

          <div className="mt-5 space-y-3">
            {[
              "Opportunity sourcing and qualification support",
              "Requirement breakdowns and next-step clarity",
              "More structure around active bid decisions and front-end admin",
            ].map((item) => (
              <div
                key={item}
                className="border-t border-black/12 pt-3 text-sm leading-7 text-black/68"
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function FitSection() {
  return (
    <section className={`${CONTAINER} py-16 sm:py-20`}>
      <div className="grid gap-10 lg:grid-cols-2">
        <div>
          <SectionLabel>Who it is for</SectionLabel>
          <div className="mt-4">
            <SectionTitle title="Best fit" />
          </div>

          <div className="mt-8 space-y-3">
            {FIT.map((item) => (
              <div
                key={item}
                className="border-t border-black/12 pt-3 text-sm leading-7 text-black/68"
              >
                {item}
              </div>
            ))}
          </div>
        </div>

        <div>
          <SectionLabel>Who it is not for</SectionLabel>
          <div className="mt-4">
            <SectionTitle title="Probably not the right fit" />
          </div>

          <div className="mt-8 space-y-3">
            {NOT_FIT.map((item) => (
              <div
                key={item}
                className="border-t border-black/12 pt-3 text-sm leading-7 text-black/68"
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function ClosingSection() {
  return (
    <section className={`${CONTAINER} py-16 sm:py-20`}>
      <div className="border-y border-black/12 bg-white/92">
        <div className="grid gap-8 px-0 py-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <div>
            <SectionLabel>Next step</SectionLabel>
            <h2 className="mt-4 text-3xl font-black tracking-tight text-black sm:text-4xl">
              Make the homepage explain the business in one pass.
            </h2>
            <p className="mt-4 max-w-3xl text-base leading-8 text-black/68">
              The page should feel more like a serious firm than a software
              product. Cleaner hierarchy, fewer pushes, and clearer language
              will help a contractor understand the offer faster.
            </p>
          </div>

          <div className="flex flex-col items-start gap-3 lg:items-end">
            <Link
              href={`/get-started?intent=${market}&plan=managed_capture`}
              className="inline-flex items-center justify-center rounded-none bg-black px-6 py-3 text-sm font-semibold text-white transition hover:bg-black/85"
            >
              Start here
            </Link>

            <div className="text-xs font-semibold uppercase tracking-[0.14em] text-black/45">
              Government and commercial contract support
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f6f7f4] text-black">
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-70">
        <LandingBackground />
      </div>

      <HeroSection />
      <WhatWeDoSection />
      <ProcessSection />
      <SampleSection />
      <ServiceLanesSection />
      <FitSection />
      <ClosingSection />
    </div>
  );
}