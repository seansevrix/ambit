import Link from "next/link";

const PRIMARY =
  "inline-flex items-center justify-center rounded-xl bg-[#1A4FA3] px-6 py-3 text-sm font-semibold text-white hover:bg-[#15428B]";

const TESTIMONIALS = [
  {
    name: "Sarah K.",
    role: "Owner, Janitorial Company",
    location: "Florida, USA",
    quote:
      "I sat on AMBIT for weeks because I thought setup would be complicated. I finally tried it and was fully up and running in under 5 minutes. Now I get opportunities every morning instead of searching for hours.",
    initials: "SK",
  },
  {
    name: "David Chen",
    role: "Operations Director, Construction",
    location: "Nevada, USA",
    quote:
      "We’ve tested a lot of tools. AMBIT is the first one that actually scales with us. The opportunities are relevant, clearly summarized, and save our team a huge amount of time every week.",
    initials: "DC",
  },
  {
    name: "Mark T.",
    role: "Owner, Plumbing Company",
    location: "California, USA",
    quote:
      "What impressed me most was the accuracy. AMBIT doesn’t just send volume — it sends work we can actually bid and win. It’s become part of our daily routine.",
    initials: "MT",
  },
];

export default function TestimonialsPage() {
  return (
    <main className="bg-[#0B1430] text-white">
      <div className="mx-auto max-w-7xl px-6 py-20">
        {/* Header */}
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">
            Trusted by 200+ Contractors
          </h1>
          <p className="mt-4 text-white/70">
            Real feedback from residential, commercial, and government
            contractors using AMBIT to find better opportunities faster.
          </p>

          {/* Trust stats */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-6">
            <div className="rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm">
              ⭐⭐⭐⭐⭐ <span className="ml-2 text-white/80">200+ reviews</span>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm text-white/80">
              200+ active contractors
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm text-white/80">
              U.S. based businesses
            </div>
          </div>
        </div>

        {/* Testimonials */}
        <div className="mt-20 grid gap-6 md:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <div
              key={t.name}
              className="rounded-2xl border border-white/10 bg-white/5 p-6"
            >
              <p className="text-sm leading-relaxed text-white/85">
                “{t.quote}”
              </p>

              <div className="mt-6 flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1A4FA3] text-sm font-semibold">
                  {t.initials}
                </div>
                <div>
                  <div className="text-sm font-semibold">{t.name}</div>
                  <div className="text-xs text-white/60">
                    {t.role} — {t.location}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom trust + CTA */}
        <div className="mt-20 rounded-2xl border border-white/10 bg-white/5 p-10 text-center">
          <h2 className="text-2xl font-semibold">
            Built for contractors who value their time
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-white/70">
            AMBIT helps you spend less time searching and more time bidding on
            work that actually fits your business.
          </p>

          <div className="mt-8">
            <Link href="/get-started" className={PRIMARY}>
              Start Free Trial — No Credit Card
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
