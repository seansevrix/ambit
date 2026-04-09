import Link from "next/link";

export const metadata = {
  title: "About Us | AMBIT",
  description:
    "Learn about the AMBIT Team and how we help contractors source opportunities, stay on top of compliance, and reduce the admin side of bidding.",
};

const GET_STARTED_HREF = "/get-started";
const PREVIEW_HREF = "/live-opportunities";

const WRAP = "mx-auto max-w-6xl px-6";
const PANEL =
  "rounded-[28px] border border-black/10 bg-white/80 shadow-[0_10px_30px_rgba(0,0,0,0.04)]";

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#EAF3FF] text-black">
      <section className="pt-16 pb-10">
        <div className={WRAP}>
          <div className="mx-auto max-w-4xl text-center">
            <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#6B7280]">
              About Us
            </div>

            <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl md:text-6xl">
              Built to feel like an
              <span className="block">extension of your team.</span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-[#5F6470] md:text-lg">
              AMBIT helps contractors find better-fit commercial and government
              opportunities and move faster when the right one shows up. Our
              team focuses on the front-end workload — sourcing, fit review,
              deadlines, compliance details, and proposal support — so your team
              can stay focused on the actual work.
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href={GET_STARTED_HREF}
                className="inline-flex rounded-2xl bg-[#31245C] px-6 py-3 text-sm font-semibold text-white transition hover:opacity-95"
              >
                Get Started
              </Link>
              <Link
                href={PREVIEW_HREF}
                className="inline-flex rounded-2xl border border-black/10 bg-white px-6 py-3 text-sm font-semibold text-[#31245C] transition hover:bg-black/[0.03]"
              >
                View Live Leads
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="pb-10">
        <div className={WRAP}>
          <div className="grid gap-4 md:grid-cols-3">
            <InfoCard
              title="Better-fit opportunities"
              text="We look for opportunities that make sense for your trade, service area, and scope — not just random listings."
            />
            <InfoCard
              title="Less admin burden"
              text="Our team helps reduce the paperwork, tracking, and front-end bid chaos that slows contractors down."
            />
            <InfoCard
              title="Clearer next steps"
              text="You get simple, usable information fast so you can decide whether to pursue, pass, or move forward."
            />
          </div>
        </div>
      </section>

      <section className="pb-10">
        <div className={WRAP}>
          <div className={`${PANEL} p-8 md:p-10`}>
            <div className="grid gap-10 md:grid-cols-[1.05fr_0.95fr] md:items-start">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#7A7590]">
                  The AMBIT Team
                </div>

                <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
                  We built AMBIT for contractors who need support, not more
                  noise.
                </h2>

                <p className="mt-5 text-sm leading-7 text-[#5F6470] md:text-base">
                  Most contractors do not have an opportunity problem. They have
                  a time and capacity problem. There is usually work out there —
                  but sorting through portals, reviewing requirements, tracking
                  deadlines, and organizing proposal inputs takes time.
                </p>

                <p className="mt-4 text-sm leading-7 text-[#5F6470] md:text-base">
                  That is where the AMBIT Team comes in. We are building AMBIT
                  to help contractors stay organized, see better-fit leads, and
                  offload more of the front-end bid process. The goal is simple:
                  help your team spend less time hunting and more time deciding,
                  preparing, and winning.
                </p>
              </div>

              <div className="grid gap-4">
                <TeamPoint
                  title="Our team finds the right leads"
                  text="We focus on relevant opportunities instead of sending a flood of low-fit noise."
                />
                <TeamPoint
                  title="Our team helps organize the bid"
                  text="We help surface key dates, compliance items, and scope details earlier."
                />
                <TeamPoint
                  title="Our team supports the front end"
                  text="We are built around reducing the admin side of bidding so your company can focus on execution."
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="pb-10">
        <div className={WRAP}>
          <div className="grid gap-6 md:grid-cols-2">
            <div className={`${PANEL} p-8`}>
              <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#7A7590]">
                What We Help With
              </div>
              <h3 className="mt-3 text-2xl font-semibold tracking-tight">
                Practical support for the front-end of bidding.
              </h3>

              <div className="mt-6 space-y-4">
                <Bullet line="Opportunity sourcing across commercial and government channels" />
                <Bullet line="Fit review based on trade, location, and service area" />
                <Bullet line="Deadline tracking and key requirement visibility" />
                <Bullet line="Proposal support and front-end admin coordination" />
              </div>
            </div>

            <div className={`${PANEL} p-8`}>
              <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#7A7590]">
                Why It Matters
              </div>
              <h3 className="mt-3 text-2xl font-semibold tracking-tight">
                Good opportunities get missed when teams are overloaded.
              </h3>

              <p className="mt-5 text-sm leading-7 text-[#5F6470] md:text-base">
                AMBIT is meant to help close that gap. We believe contractors
                should not have to spend hours inside scattered listings and
                bid documents just to figure out what is worth chasing.
              </p>

              <p className="mt-4 text-sm leading-7 text-[#5F6470] md:text-base">
                Our team is here to make the early part of the process cleaner,
                faster, and easier to manage.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="pb-16 pt-2">
        <div className={WRAP}>
          <div className={`${PANEL} flex flex-col gap-6 p-8 md:flex-row md:items-center md:justify-between md:p-10`}>
            <div className="max-w-2xl">
              <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#7A7590]">
                Work With The AMBIT Team
              </div>
              <h3 className="mt-3 text-2xl font-semibold tracking-tight md:text-3xl">
                Less hunting. Less admin. Better momentum.
              </h3>
              <p className="mt-3 text-sm leading-7 text-[#5F6470] md:text-base">
                If your team wants better visibility into live opportunities and
                a smoother front-end bid process, AMBIT was built for that.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href={GET_STARTED_HREF}
                className="inline-flex rounded-2xl bg-[#31245C] px-6 py-3 text-sm font-semibold text-white transition hover:opacity-95"
              >
                Get Started
              </Link>
              <Link
                href={PREVIEW_HREF}
                className="inline-flex rounded-2xl border border-black/10 bg-white px-6 py-3 text-sm font-semibold text-[#31245C] transition hover:bg-black/[0.03]"
              >
                View Live Leads
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function InfoCard({
  title,
  text,
}: {
  title: string;
  text: string;
}) {
  return (
    <div className={`${PANEL} p-6`}>
      <div className="text-lg font-semibold tracking-tight text-[#31245C]">
        {title}
      </div>
      <p className="mt-3 text-sm leading-7 text-[#5F6470]">{text}</p>
    </div>
  );
}

function TeamPoint({
  title,
  text,
}: {
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-[24px] border border-black/10 bg-[#F7FAFF] p-5">
      <div className="text-base font-semibold tracking-tight text-[#31245C]">
        {title}
      </div>
      <p className="mt-2 text-sm leading-7 text-[#5F6470]">{text}</p>
    </div>
  );
}

function Bullet({ line }: { line: string }) {
  return (
    <div className="flex gap-3">
      <div className="mt-[7px] h-2 w-2 rounded-full bg-[#31245C]" />
      <div className="text-sm leading-7 text-[#5F6470]">{line}</div>
    </div>
  );
}