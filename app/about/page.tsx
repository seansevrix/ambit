import Link from "next/link";

export const metadata = {
  title: "About Us | AMBIT",
  description:
    "Learn about the AMBIT Team and how we help contractors reduce the admin side of bidding.",
};

const GET_STARTED_HREF = "/get-started";

const WRAP = "mx-auto max-w-6xl px-6";
const PANEL =
  "rounded-[28px] border border-black/10 bg-white/80 shadow-[0_10px_30px_rgba(0,0,0,0.04)]";

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#EAF3FF] text-black">
      <section className="pt-16 pb-10">
        <div className={WRAP}>
          <div className="mx-auto max-w-4xl text-center">
            <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#7A7590]">
              About Us
            </div>

            <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl md:text-6xl">
              Built by a team that understands
              <span className="block">how messy bidding can get.</span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-[#5F6470] md:text-lg">
              AMBIT was built to make the front-end of bidding feel lighter.
              Our team helps contractors find better-fit opportunities, stay on
              top of deadlines, and reduce the admin load that usually slows
              everything down.
            </p>
          </div>
        </div>
      </section>

      <section className="pb-10">
        <div className={WRAP}>
          <div className={`${PANEL} p-8 md:p-10`}>
            <div className="mx-auto max-w-4xl">
              <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#7A7590]">
                The AMBIT Team
              </div>

              <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
                We built AMBIT to feel more like support and less like software.
              </h2>

              <p className="mt-5 text-sm leading-7 text-[#5F6470] md:text-base">
                Most contractors are not short on skill. They are short on time.
                Good opportunities get buried, deadlines creep up, compliance
                gets overlooked, and the paperwork side of bidding starts eating
                up hours that should be spent running the business.
              </p>

              <p className="mt-4 text-sm leading-7 text-[#5F6470] md:text-base">
                That is why the AMBIT Team exists. We are building a better way
                for contractors to stay organized, see stronger-fit
                opportunities, and move faster when something worth pursuing
                shows up.
              </p>

              <p className="mt-4 text-sm leading-7 text-[#5F6470] md:text-base">
                The goal is simple: help your team spend less time hunting,
                sorting, and chasing paperwork — and more time deciding,
                preparing, and executing.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="pb-10">
        <div className={WRAP}>
          <div className="grid gap-6 md:grid-cols-2">
            <div className={`${PANEL} p-8`}>
              <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#7A7590]">
                What Our Team Helps With
              </div>

              <h3 className="mt-3 text-2xl font-semibold tracking-tight">
                We help reduce the front-end bid chaos.
              </h3>

              <div className="mt-6 space-y-4">
                <Bullet line="Opportunity sourcing across commercial and government channels" />
                <Bullet line="Fit review based on your trade, location, and service area" />
                <Bullet line="Deadline visibility and requirement organization" />
                <Bullet line="Proposal support and front-end admin coordination" />
              </div>
            </div>

            <div className={`${PANEL} p-8`}>
              <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#7A7590]">
                Why We Built It
              </div>

              <h3 className="mt-3 text-2xl font-semibold tracking-tight">
                Because too many good companies miss work they should be chasing.
              </h3>

              <p className="mt-5 text-sm leading-7 text-[#5F6470] md:text-base">
                We believe most businesses do not have an opportunity problem.
                They have a bandwidth problem. There is usually work out there —
                but finding it, reviewing it, and staying organized takes real
                time.
              </p>

              <p className="mt-4 text-sm leading-7 text-[#5F6470] md:text-base">
                AMBIT is our way of helping solve that. Our team is focused on
                making the early part of the bid process cleaner, faster, and
                easier to manage.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="pb-10">
        <div className={WRAP}>
          <div className={`${PANEL} p-8 md:p-10`}>
            <div className="mx-auto max-w-4xl">
              <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#7A7590]">
                How We Think
              </div>

              <h3 className="mt-3 text-2xl font-semibold tracking-tight md:text-3xl">
                AMBIT is built around one simple idea:
              </h3>

              <p className="mt-5 text-lg leading-8 text-[#31245C] md:text-xl">
                contractors should be focused on the job — not buried in portals,
                listings, and admin work.
              </p>

              <p className="mt-5 text-sm leading-7 text-[#5F6470] md:text-base">
                That is the standard the AMBIT Team is building toward. More
                clarity. Less noise. Better support on the front end.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="pb-16 pt-2">
        <div className={WRAP}>
          <div className={`${PANEL} flex flex-col gap-6 p-8 md:p-10`}>
            <div className="max-w-2xl">
              <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#7A7590]">
                Work With The AMBIT Team
              </div>

              <h3 className="mt-3 text-2xl font-semibold tracking-tight md:text-3xl">
                A simpler way to stay in front of better-fit opportunities.
              </h3>

              <p className="mt-3 text-sm leading-7 text-[#5F6470] md:text-base">
                If your team wants stronger visibility, less front-end admin,
                and better momentum in the bidding process, AMBIT was built for
                that.
              </p>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <Link
                href={GET_STARTED_HREF}
                className="inline-flex w-fit rounded-2xl bg-[#31245C] px-6 py-3 text-sm font-semibold text-white transition hover:opacity-95"
              >
                Get Started
              </Link>

              <a
                href="mailto:ambit@sevrixgov.com"
                className="text-sm font-medium text-[#5F6470] underline underline-offset-4 hover:text-[#31245C]"
              >
                ambit@sevrixgov.com
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
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