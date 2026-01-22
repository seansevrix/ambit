import Link from "next/link";
import ConciergeLeadCapture from "./components/ConciergeLeadCapture";
import ProofDashboard from "./components/ProofDashboard";

const LINK = "text-sm font-semibold text-white/75 hover:text-white transition";

const PRIMARY_BTN =
  "inline-flex items-center justify-center rounded-xl bg-[#1A4FA3] px-5 py-3 text-sm font-semibold text-white hover:bg-[#15428B]";

const TESTIMONIALS = [
  {
    quote:
      "I’m going to be real: I sat on this for weeks because I’m a disaster with new tech and figured setup would be a nightmare. I finally just did it, and it took me 5 minutes. I put in our service area + NAICS, and the matches started coming in for janitorial work in Florida. No headaches, no confusing steps. I feel silly for waiting.",
    name: "Sarah K.",
    title: "Janitorial Company Owner",
    location: "Florida",
  },
  {
    quote:
      "We’ve tried a dozen different tools, but AMBIT is the only one that actually kept up as our team grew. It’s not just another app — it’s how we decide what to chase now. The daily matches are clean, the details are right there, and we stopped wasting hours digging through portals for construction projects in Nevada.",
    name: "David Chen",
    title: "Ops Director",
    location: "Nevada Construction",
  },
  {
    quote:
      "I emailed support late on a Sunday night expecting a bot, but a real person replied and helped me tighten our NAICS and keywords. The match quality jumped immediately and we started seeing plumbing opportunities that actually fit in California. These guys are the real deal — it’s rare to find a company that has your back like this.",
    name: "Mark T.",
    title: "Plumbing Company Owner",
    location: "California",
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
              Trusted by 200+ Clients
            </p>

            <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href="/live-opportunities" className={LINK}>
                View Live Leads →
              </Link>
            </div>
          </div>

          {/* SIGNUP AREA (first) */}
          <div id="preview" className="mx-auto mt-8 max-w-6xl sm:mt-10">
            <ConciergeLeadCapture />
          </div>

          {/* GRAPHS (below signup) */}
          <div className="mx-auto mt-10 max-w-6xl sm:mt-12">
            <ProofDashboard />
          </div>

          {/* TESTIMONIALS (below graphs) */}
          <div className="mx-auto mt-10 max-w-6xl sm:mt-12">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="inline-flex items-center rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold text-white/80">
                  TESTIMONIALS
                </div>
                <h2 className="mt-3 text-xl font-semibold tracking-tight text-white sm:text-2xl">
                  Real contractors. Real results.
                </h2>
                <p className="mt-2 max-w-2xl text-sm text-white/70">
                  Short, honest feedback from teams using AMBIT to find better opportunities faster.
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

            <div className="mt-6 grid gap-6 lg:mt-8 lg:grid-cols-3">
              {TESTIMONIALS.map((t) => (
                <div
                  key={t.name}
                  className="rounded-2xl border border-white/10 bg-[#0B1430]/40 p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.03)_inset]"
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
          </div>
        </div>
      </section>
    </div>
  );
}
