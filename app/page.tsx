import Link from "next/link";

const PRIMARY =
  "inline-flex items-center justify-center rounded-xl bg-[#1A4FA3] px-5 py-3 text-sm font-semibold text-white hover:bg-[#15428B]";
const SECONDARY =
  "inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10";

const TESTIMONIALS = [
  {
    quote:
      "Before AMBIT, I spent two hours every morning digging through portals and PDFs. Now I open one email and see a ranked list of HVAC opportunities that actually fit.",
    name: "James Miller",
    title: "Owner, Miller Mechanical Services",
    location: "Texas, USA",
  },
  {
    quote:
      "Government contracts used to feel like a different language. AMBIT’s plain-English summaries let me tell in under a minute if a project fits our crew.",
    name: "Linda Chen",
    title: "Project Coordinator, Vertex Construction Group",
    location: "Virginia, USA",
  },
  {
    quote:
      "AMBIT helps us spot relevant electrical opportunities faster and stay focused on our service area. The matches are clean and actionable.",
    name: "Robert “Bo” Henderson",
    title: "Lead Estimator, Ironclad Electrical",
    location: "California, USA",
  },
];

export default function HomePage() {
  return (
    <div className="space-y-12">
      {/* HERO */}
      <section className="rounded-3xl border border-white/10 bg-white/5 p-10 shadow-[0_0_0_1px_rgba(255,255,255,0.04)]">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <h1 className="text-5xl font-semibold tracking-tight leading-[1.05]">
              Government contracts matched to your business.
            </h1>

            <p className="mt-4 max-w-xl text-white/70">
              Tell AMBIT what you do and where you work. We find live opportunities, score matches,
              and deliver a clear scouting report — so you don’t miss good bids.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link href="/get-started" className={PRIMARY}>
                Get Started
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
            <InfoCard
              title="1) Sign up"
              body="Add your company info, services, and service area."
            />
            <InfoCard title="2) Subscribe" body="Unlock match scoring, summaries, and digests." />
            <InfoCard title="3) Get matches" body="View match history anytime from your login." />
          </div>
        </div>
      </section>

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
              Real feedback from businesses using AMBIT to find and act on government opportunities
              faster.
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

function InfoCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#0B1430]/40 p-5 hover:bg-[#0B1430]/55 transition">
      <div className="text-sm font-semibold text-white">{title}</div>
      <div className="mt-1 text-sm text-white/70">{body}</div>
    </div>
  );
}
