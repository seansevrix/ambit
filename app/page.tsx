import Link from "next/link";
import ConciergeLeadCapture from "./components/ConciergeLeadCapture";

const PRIMARY =
  "inline-flex items-center justify-center rounded-xl bg-[#1A4FA3] px-5 py-3 text-sm font-semibold text-white hover:bg-[#15428B]";
const SECONDARY =
  "inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10";

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

function TrialBanner() {
  return (
    <section className="rounded-3xl border border-[#6EA8FF] bg-white/5 p-4 shadow-[0_0_0_1px_rgba(110,168,255,0.35)]">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <div className="inline-flex w-fit items-center rounded-full border border-[#6EA8FF] bg-[#1A4FA3]/25 px-3 py-1 text-xs font-bold text-white">
            7 Day Free Trial
          </div>
          <div className="text-sm font-bold text-white">Start free today. Cancel anytime.</div>
          <div className="text-xs text-white/70">No credit card required</div>
        </div>

        <Link href="/get-started" className={PRIMARY}>
          Start Free Trial
        </Link>
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <div className="space-y-12">
      {/* TRIAL BANNER (non-blocking) */}
      <TrialBanner />

      {/* HERO */}
      <section className="rounded-3xl border border-white/10 bg-white/5 p-10 shadow-[0_0_0_1px_rgba(255,255,255,0.04)]">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <div className="inline-flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold text-white/80">
                Residential
              </span>
              <span className="inline-flex items-center rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold text-white/80">
                Commercial
              </span>
              <span className="inline-flex items-center rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold text-white/80">
                Government
              </span>
            </div>

            <h1 className="mt-4 text-5xl font-semibold tracking-tight leading-[1.05]">
              Work opportunities matched to your business.
            </h1>

            <p className="mt-4 max-w-xl text-white/70">
              Tell AMBIT what you do and where you work. We find relevant jobs across residential,
              commercial, and government sources, score the fit, and deliver a clear scouting report
              — so you spend less time searching and more time winning work.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link href="/get-started" className={PRIMARY}>
                Start Free Trial
              </Link>
              <Link href="/opportunities" className={SECONDARY}>
                Preview
              </Link>
            </div>

            <div className="mt-6 text-sm text-white/70">
              Already a customer?{" "}
              <Link className="text-white underline underline-offset-4" href="/login">
                Log in
              </Link>
            </div>
          </div>

          <div className="grid gap-4">
            <InfoCard title="1) Build your profile" body="Add your company info, trades, and service area." />
            <InfoCard
              title="2) Choose your markets"
              body="Residential, commercial, government — pick one or run all three."
            />
            <InfoCard
              title="3) Get matched work"
              body="See ranked opportunities, quick summaries, and your match history anytime."
            />
          </div>
        </div>
      </section>

      {/* CONCIERGE LEAD CAPTURE (Formspree) */}
      <ConciergeLeadCapture />

      {/* TESTIMONIALS */}
      <section className="rounded-3xl border border-white/10 bg-white/5 p-10">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="inline-flex items-center rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold text-white/80">
              TESTIMONIALS
            </div>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white">
              Built for contractors. Proven in the field.
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-white/70">
              Real feedback from businesses using AMBIT to find and act on residential, commercial,
              and government opportunities faster.
            </p>
          </div>

          <div className="flex gap-3">
            <Link href="/testimonials" className={SECONDARY}>
              See all testimonials
            </Link>
          </div>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <div key={t.name} className="rounded-2xl border border-white/10 bg-[#0B1430]/40 p-6">
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

function InfoCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#0B1430]/40 p-5 hover:bg-[#0B1430]/55 transition">
      <div className="text-sm font-semibold text-white">{title}</div>
      <div className="mt-1 text-sm text-white/70">{body}</div>
    </div>
  );
}
