import Link from "next/link";
import ConciergeLeadCapture from "./components/ConciergeLeadCapture";

const LINK =
  "text-sm font-semibold text-white/75 hover:text-white transition";

const PRIMARY_BTN =
  "inline-flex items-center justify-center rounded-xl bg-[#1A4FA3] px-5 py-3 text-sm font-semibold text-white hover:bg-[#15428B]";

const TESTIMONIALS = [
  {
    quote:
      "I used to bounce between referrals, Facebook groups, and random lead sites. Now AMBIT sends a clean list of jobs in my service area across residential and commercial — with the details I need to decide fast.",
    name: "James Miller",
    title: "Owner, Miller Mechanical Services",
    location: "Texas, USA",
  },
  {
    quote:
      "The biggest win is clarity. AMBIT summarizes the work in plain English and ranks it. Whether it’s a home remodel, a facility job, or a public bid — I know what’s worth chasing.",
    name: "Linda Chen",
    title: "Project Coordinator, Vertex Construction Group",
    location: "Virginia, USA",
  },
  {
    quote:
      "We stay focused on our trade and our territory. AMBIT filters out the noise and surfaces real opportunities — with matching that actually makes sense.",
    name: "Robert “Bo” Henderson",
    title: "Lead Estimator, Ironclad Electrical",
    location: "California, USA",
  },
];

export default function HomePage() {
  return (
    <div className="space-y-8 overflow-x-hidden sm:space-y-12">
      {/* HERO + GLASS PANEL */}
      <section className="relative overflow-hidden rounded-2xl border border-white/10 sm:rounded-3xl">
        <div className="absolute inset-0 bg-[radial-gradient(1200px_600px_at_50%_-10%,rgba(110,168,255,0.35),transparent_60%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#08122B] via-[#070F22] to-[#060A16]" />

        <div className="relative px-4 py-10 sm:px-10 sm:py-14">
          <div className="mx-auto max-w-5xl text-center">
            <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-5xl">
              Get more local contracts.
            </h1>

            <p className="mt-3 text-sm text-white/70 sm:text-base">
              Qualified opportunities sent to you — not your competitors.
            </p>

            <p className="mt-3 text-xs text-white/65 sm:text-sm">
              <span className="font-semibold text-white/85">7-day free trial</span>
              <span className="mx-2 text-white/35">•</span>
              No credit card
              <span className="mx-2 text-white/35">•</span>
              Unsubscribe anytime
            </p>

            <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <a href="#preview" className={PRIMARY_BTN}>
                Start free trial
              </a>

              <Link href="/live-opportunities" className={LINK}>
                View Live Leads →
              </Link>
            </div>
          </div>

          <div id="preview" className="mx-auto mt-8 max-w-6xl sm:mt-10">
            <ConciergeLeadCapture />
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="rounded-2xl border border-white/10 bg-white/5 p-6 sm:rounded-3xl sm:p-10">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="inline-flex items-center rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold text-white/80">
              TESTIMONIALS
            </div>

            <h2 className="mt-3 text-xl font-semibold tracking-tight text-white sm:text-2xl">
              Built for contractors. Proven in the field.
            </h2>

            <p className="mt-2 max-w-2xl text-sm text-white/70">
              Real feedback from businesses using AMBIT to find and act on residential, commercial,
              and government opportunities faster.
            </p>
          </div>

          <div className="flex">
            <Link
              href="/testimonials"
              className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white/80 hover:bg-white/10 hover:text-white"
            >
              See all testimonials
            </Link>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:mt-10 lg:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <div
              key={t.name}
              className="rounded-2xl border border-white/10 bg-[#0B1430]/40 p-6"
            >
              <p className="text-sm leading-relaxed text-white/75">
                <span className="text-white/40">“</span>
                {t.quote}
                <span className="text-white/40">”</span>
              </p>

              <div className="mt-5 h-px w-full bg-white/10" />

              <div className="mt-4">
                <div className="text-sm font-semibold text-white">{t.name}</div>
                <div className="mt-1 text-xs text-white/65">{t.title}</div>
                <div className="mt-2 inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold text-white/75">
                  {t.location}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
