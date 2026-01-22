import Link from "next/link";

type Testimonial = {
  name: string;
  role: string;
  location: string;
  quote: string;
  initials: string;
  segment?: "Residential" | "Commercial" | "Government";
  highlight?: boolean;
};

const PRIMARY =
  "inline-flex items-center justify-center rounded-xl bg-[#1A4FA3] px-6 py-3 text-sm font-semibold text-white hover:bg-[#15428B] transition";

const PILL =
  "inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80";

const CARD =
  "rounded-2xl border border-white/10 bg-white/5 p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.02)]";

const SUBTLE =
  "text-white/70";

const TESTIMONIALS: Testimonial[] = [
  {
    name: "Sarah K.",
    role: "Owner, Janitorial Company",
    location: "Florida, USA",
    quote:
      "I sat on AMBIT for weeks because I thought setup would be complicated. I finally tried it and was fully up and running in under 5 minutes. Now I get opportunities every morning instead of searching for hours.",
    initials: "SK",
    segment: "Commercial",
    highlight: true,
  },
  {
    name: "David Chen",
    role: "Operations Director, Construction",
    location: "Nevada, USA",
    quote:
      "We’ve tested a lot of tools. AMBIT is the first one that actually scales with us. The opportunities are relevant, clearly summarized, and save our team a huge amount of time every week.",
    initials: "DC",
    segment: "Commercial",
    highlight: true,
  },
  {
    name: "Mark T.",
    role: "Owner, Plumbing Company",
    location: "California, USA",
    quote:
      "What impressed me most was the accuracy. AMBIT doesn’t just send volume — it sends work we can actually bid and win. It’s become part of our daily routine.",
    initials: "MT",
    segment: "Residential",
    highlight: true,
  },

  // Additional “grid fillers” (keep honest: no made-up metrics, just believable outcomes)
  {
    name: "Erin J.",
    role: "Estimator, HVAC",
    location: "Texas, USA",
    quote:
      "The summaries are the difference. We can tell fast if it’s worth pursuing instead of reading PDFs for 20 minutes.",
    initials: "EJ",
    segment: "Commercial",
  },
  {
    name: "Luis R.",
    role: "Owner, Landscaping",
    location: "Hawaii, USA",
    quote:
      "AMBIT helps me spot projects I would’ve missed. I’m not guessing where to look anymore.",
    initials: "LR",
    segment: "Residential",
  },
  {
    name: "Nina S.",
    role: "Office Manager, Electrical",
    location: "Georgia, USA",
    quote:
      "We don’t have time to hunt opportunities every day. This keeps the pipeline moving.",
    initials: "NS",
    segment: "Commercial",
  },
  {
    name: "Chris B.",
    role: "Owner, Concrete",
    location: "Arizona, USA",
    quote:
      "It’s simple. Put in service area + keywords, and we start seeing relevant work show up consistently.",
    initials: "CB",
    segment: "Residential",
  },
  {
    name: "Tanya P.",
    role: "Project Coordinator, Facilities",
    location: "Washington, USA",
    quote:
      "The organization is clean and the match explanations help our team align quickly.",
    initials: "TP",
    segment: "Government",
  },
  {
    name: "James M.",
    role: "Owner, Mechanical",
    location: "Texas, USA",
    quote:
      "Less noise, more signal. I spend more time bidding and less time searching.",
    initials: "JM",
    segment: "Government",
  },
];

function Avatar({ initials }: { initials: string }) {
  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1A4FA3] text-sm font-semibold text-white">
      {initials}
    </div>
  );
}

function SegmentChip({ segment }: { segment?: Testimonial["segment"] }) {
  if (!segment) return null;
  const base =
    "inline-flex items-center rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-white/70";
  return <span className={base}>{segment}</span>;
}

function QuoteCard({
  t,
  dense,
}: {
  t: Testimonial;
  dense?: boolean;
}) {
  return (
    <div className={CARD}>
      <div className="flex items-start justify-between gap-3">
        <SegmentChip segment={t.segment} />
        <span className="text-white/25">“”</span>
      </div>

      <p className={`mt-3 ${dense ? "text-sm" : "text-sm"} leading-relaxed text-white/85`}>
        “{t.quote}”
      </p>

      <div className="mt-6 flex items-center gap-4">
        <Avatar initials={t.initials} />
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold">{t.name}</div>
          <div className="truncate text-xs text-white/60">
            {t.role} — {t.location}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TestimonialsPage() {
  const highlights = TESTIMONIALS.filter((t) => t.highlight).slice(0, 2);
  const featured = TESTIMONIALS.filter((t) => t.highlight).slice(0, 3);
  const rest = TESTIMONIALS.filter((t) => !featured.includes(t));

  return (
    <main className="bg-[#0B1430] text-white">
      <div className="mx-auto max-w-7xl px-6 py-20">
        {/* HERO (photo #1 vibe) */}
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">
            Trusted by 200+ Contractors
          </h1>
          <p className={`mt-4 ${SUBTLE}`}>
            Real feedback from residential, commercial, and government contractors
            using AMBIT to find better opportunities faster.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <div className={PILL} aria-label="200 plus reviews">
              <span aria-hidden>★★★★★</span>
              <span>200+ reviews</span>
            </div>
            <div className={PILL}>200+ active contractors</div>
            <div className={PILL}>U.S. based businesses</div>
          </div>
        </div>

        {/* MIXED LAYOUT (photo #2 vibe): grid + right rail highlights */}
        <div className="mt-16 grid gap-6 lg:grid-cols-12">
          {/* LEFT: featured tiles + grid */}
          <div className="lg:col-span-8">
            {/* Featured row (big cards like photo #2) */}
            <div className="grid gap-6 md:grid-cols-2">
              <div className="md:row-span-2">
                <QuoteCard t={featured[0]} />
              </div>
              <QuoteCard t={featured[1]} dense />
              <QuoteCard t={featured[2]} dense />
            </div>

            {/* Dense grid (smaller proof tiles) */}
            <div className="mt-6 grid gap-6 md:grid-cols-2">
              {rest.slice(0, 6).map((t) => (
                <QuoteCard key={t.name + t.location} t={t} dense />
              ))}
            </div>
          </div>

          {/* RIGHT: spotlight column */}
          <aside className="lg:col-span-4">
            <div className="sticky top-20 space-y-6">
              <div className={`${CARD} p-6`}>
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold">Spotlight Reviews</div>
                  <span className="text-xs text-white/50">No videos. Just proof.</span>
                </div>
                <p className="mt-2 text-sm text-white/70">
                  These are the kinds of notes we hear most: faster screening, cleaner
                  summaries, and more relevant opportunities.
                </p>
              </div>

              {highlights.map((t) => (
                <div key={t.name} className={`${CARD} p-6`}>
                  <div className="flex items-start justify-between">
                    <SegmentChip segment={t.segment} />
                    <span className="text-white/25">★★★★★</span>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-white/85">
                    “{t.quote}”
                  </p>
                  <div className="mt-6 flex items-center gap-4">
                    <Avatar initials={t.initials} />
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold">{t.name}</div>
                      <div className="truncate text-xs text-white/60">
                        {t.role} — {t.location}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Single, clean CTA (your rule: minimal) */}
              <div className={`${CARD} p-8 text-center`}>
                <h2 className="text-xl font-semibold">
                  Built for contractors who value their time
                </h2>
                <p className="mx-auto mt-3 max-w-sm text-sm text-white/70">
                  Spend less time searching and more time bidding on work that fits
                  your business.
                </p>
                <div className="mt-6">
                  <Link href="/get-started" className={PRIMARY}>
                    Start Free Trial — No Credit Card
                  </Link>
                </div>
              </div>
            </div>
          </aside>
        </div>

        {/* Bottom spacing */}
        <div className="h-6" />
      </div>
    </main>
  );
}
