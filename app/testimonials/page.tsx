import Link from "next/link";
import AmbitMark from "../components/AmbitMark";

const PRIMARY =
  "inline-flex items-center justify-center rounded-xl bg-[#1A4FA3] px-5 py-3 text-sm font-semibold text-white hover:bg-[#15428B]";
const SECONDARY =
  "inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10";

const TESTIMONIALS = [
  {
    quote:
      "Before AMBIT, I spent two hours every morning digging through portals and PDFs. Now I open one email and see a ranked list of HVAC opportunities that actually fit. The match score cuts the noise so I can spend time bidding—not searching.",
    name: "James Miller",
    title: "Owner, Miller Mechanical Services",
    location: "Texas, USA",
  },
  {
    quote:
      "Government contracts used to feel like a different language. AMBIT’s plain-English summaries let me tell in under a minute if a project fits our crew. The next-steps checklist keeps us on track for pre-bid meetings and submission deadlines.",
    name: "Linda Chen",
    title: "Project Coordinator, Vertex Construction Group",
    location: "Virginia, USA",
  },
  {
    quote:
      "AMBIT helps us spot relevant electrical opportunities faster and stay focused on our service area. The matches are clean and actionable, which has improved our bid targeting and helped us grow our public-sector pipeline.",
    name: "Robert “Bo” Henderson",
    title: "Lead Estimator, Ironclad Electrical",
    location: "California, USA",
  },
];

export default function TestimonialsPage() {
  return (
    <div className="space-y-10">
      {/* Header */}
      <section className="rounded-3xl border border-white/10 bg-white/5 p-10">
        <div className="flex items-center gap-3">
          <AmbitMark size={44} />
          <div>
            <div className="text-sm font-semibold text-white">AMBIT</div>
            <div className="text-xs text-white/70">Customer testimonials</div>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="inline-flex items-center rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold text-white/80">
              TESTIMONIALS
            </div>

            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white">
              Built for contractors. Proven in the field.
            </h1>

            <p className="mt-2 max-w-2xl text-sm text-white/70">
              Short, clear feedback from businesses using AMBIT to find and act on government
              opportunities faster.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/get-started" className={PRIMARY}>
              Start now
            </Link>
            <Link href="/matches/1" className={SECONDARY}>
              View demo
            </Link>
          </div>
        </div>
      </section>

      {/* Cards */}
      <section className="rounded-3xl border border-white/10 bg-white/5 p-10">
        <div className="text-center">
          <div className="text-xs font-semibold tracking-widest text-white/70">
            TESTIMONIALS
          </div>
          <div className="mx-auto mt-2 h-[2px] w-16 rounded-full bg-white/30" />
          <p className="mx-auto mt-3 max-w-2xl text-sm text-white/70">
            No fluff. Just what contractors care about: relevance, clarity, and speed.
          </p>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <div
              key={t.name}
              className="relative rounded-2xl border border-white/10 bg-[#0B1430]/40 px-6 pb-6 pt-10"
            >
              <div className="absolute -top-7 left-1/2 -translate-x-1/2">
                <div className="grid h-14 w-14 place-items-center rounded-full border border-white/10 bg-[#1A4FA3] shadow-sm">
                  <QuoteMark />
                </div>
              </div>

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

      {/* CTA */}
      <section className="rounded-3xl border border-white/10 bg-[#0B1430]/45 p-10">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-xs font-semibold text-white/70">READY</div>
            <h2 className="mt-2 text-2xl font-semibold text-white">
              Get ranked leads for your trade.
            </h2>
            <p className="mt-2 text-sm text-white/70">
              Tell us your service area. AMBIT handles the scanning and scoring.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/get-started" className={PRIMARY}>
              Start now
            </Link>
            <Link href="/matches/1" className={SECONDARY}>
              View demo
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function QuoteMark() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M10.5 11.2c0 3.8-2.2 6.8-6 7.8l-.9-1.7c2.2-.9 3.3-2.2 3.7-3.9H4.1V11.2h6.4Zm9.4 0c0 3.8-2.2 6.8-6 7.8l-.9-1.7c2.2-.9 3.3-2.2 3.7-3.9h-3.2V11.2h6.4Z"
        fill="white"
      />
    </svg>
  );
}
