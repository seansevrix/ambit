import Link from "next/link";
import Image from "next/image";

type Segment = "Residential" | "Commercial" | "Government";

type Testimonial = {
  name: string;
  role: string;
  location: string;
  quote: string;
  initials: string;
  segment?: Segment;
  stars?: 1 | 2 | 3 | 4 | 5;
  highlight?: boolean;
};

const PRIMARY =
  "inline-flex items-center justify-center rounded-xl bg-[#1A4FA3] px-6 py-3 text-sm font-semibold text-white hover:bg-[#15428B] transition";

const CARD =
  "rounded-2xl border border-white/10 bg-white/5 shadow-[0_0_0_1px_rgba(255,255,255,0.03)]";

const PILL =
  "inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/85";

const SUBTLE = "text-white/70";

const TESTIMONIALS: Testimonial[] = [
  {
    name: "Sarah K.",
    role: "Owner, Janitorial Company",
    location: "Florida, USA",
    quote:
      "I sat on AMBIT for weeks because I thought setup would be complicated. I finally tried it and was fully up and running in under 5 minutes. Now I get opportunities every morning instead of searching for hours.",
    initials: "SK",
    segment: "Commercial",
    stars: 5,
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
    stars: 5,
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
    stars: 5,
    highlight: true,
  },

  // Dense tiles (short, scannable)
  {
    name: "Erin J.",
    role: "Estimator, HVAC",
    location: "Texas, USA",
    quote:
      "The summaries are the difference. We can tell fast if it’s worth pursuing instead of digging through PDFs.",
    initials: "EJ",
    segment: "Commercial",
    stars: 5,
  },
  {
    name: "Luis R.",
    role: "Owner, Landscaping",
    location: "Hawaii, USA",
    quote:
      "AMBIT helped me spot projects I would’ve missed. It’s become part of my morning routine.",
    initials: "LR",
    segment: "Residential",
    stars: 4,
  },
  {
    name: "Nina S.",
    role: "Office Manager, Electrical",
    location: "Georgia, USA",
    quote:
      "We don’t have time to hunt opportunities every day. This keeps our pipeline moving.",
    initials: "NS",
    segment: "Commercial",
    stars: 5,
  },
  {
    name: "Chris B.",
    role: "Owner, Concrete",
    location: "Arizona, USA",
    quote: "Simple setup. Better matches. Less noise. Exactly what we needed.",
    initials: "CB",
    segment: "Residential",
    stars: 4,
  },
  {
    name: "Tanya P.",
    role: "Project Coordinator, Facilities",
    location: "Washington, USA",
    quote:
      "Clean layout and clear match reasoning. It keeps our team aligned fast.",
    initials: "TP",
    segment: "Government",
    stars: 5,
  },
  {
    name: "James M.",
    role: "Owner, Mechanical",
    location: "Texas, USA",
    quote: "Less searching. More bidding. AMBIT saves me time every week.",
    initials: "JM",
    segment: "Government",
    stars: 5,
  },
];

const PARTNER_LOGOS = [
  { name: "EMCOR", src: "/logos/emcor.svg" },
  { name: "Dynegy", src: "/logos/dynegy.svg" },
  { name: "Premier Pool Service", src: "/logos/premierpoolservice.svg" },
  { name: "Sevrix", src: "/logos/sevrix.svg" },
];

function Stars({ value }: { value: number }) {
  const full = Math.max(0, Math.min(5, Math.round(value)));
  const stars = Array.from({ length: 5 }, (_, i) => (i < full ? "★" : "☆"));
  return (
    <span
      className="tracking-[0.12em] text-[#FFD36A]"
      aria-label={`${full} out of 5 stars`}
    >
      {stars.join("")}
    </span>
  );
}

function Avatar({ initials }: { initials: string }) {
  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1A4FA3] text-sm font-semibold text-white">
      {initials}
    </div>
  );
}

function SegmentChip({ segment }: { segment?: Segment }) {
  if (!segment) return null;
  return (
    <span className="inline-flex items-center rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-white/70">
      {segment}
    </span>
  );
}

function QuoteCard({ t }: { t: Testimonial }) {
  return (
    <div className={`${CARD} p-6`}>
      <div className="flex items-start justify-between gap-3">
        <SegmentChip segment={t.segment} />
        <span className="text-white/25 text-lg leading-none">“</span>
      </div>

      <p className="mt-3 text-sm leading-relaxed text-white/85">“{t.quote}”</p>

      <div className="mt-5 flex items-center justify-between">
        <Stars value={t.stars ?? 5} />
        <span className="text-xs text-white/45">{t.location}</span>
      </div>

      <div className="mt-6 flex items-center gap-4">
        <Avatar initials={t.initials} />
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold">{t.name}</div>
          <div className="truncate text-xs text-white/60">{t.role}</div>
        </div>
      </div>
    </div>
  );
}

function LogoRow() {
  return (
    <div className="mt-8 flex flex-wrap items-center justify-center gap-6">
      <span className="text-xs text-white/50">
        Partnered with contractors working alongside:
      </span>

      <div className="flex flex-wrap items-center justify-center gap-6">
        {PARTNER_LOGOS.map((b) => (
          <div
            key={b.name}
            className="flex items-center rounded-xl border border-white/10 bg-white/5 px-4 py-2"
            title={b.name}
          >
            <Image
              src={b.src}
              alt={b.name}
              width={120}
              height={28}
              className="h-[18px] w-auto opacity-90"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function TestimonialsPage() {
  const featured = TESTIMONIALS.filter((t) => t.highlight).slice(0, 3);
  const rest = TESTIMONIALS.filter((t) => !t.highlight);
  const spotlights = TESTIMONIALS.filter((t) => t.highlight).slice(0, 2);

  return (
    <main className="bg-[#0B1430] text-white">
      <div className="mx-auto max-w-7xl px-6 py-20">
        {/* HERO (photo #2 vibe + honest numbers) */}
        <div className="mx-auto max-w-5xl text-center">
          <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">
            Trusted proof from real contractors
          </h1>
          <p className={`mt-4 ${SUBTLE}`}>
            Clear, honest reviews from contractors using AMBIT to find better-fit
            opportunities faster.
          </p>

          {/* Badges row (G2 + rating + reviews) */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <div className={`${PILL} shadow-[0_20px_60px_rgba(0,0,0,0.35)]`}>
              <Image
                src="/logos/g2.svg"
                alt="G2"
                width={22}
                height={22}
                className="opacity-95"
              />
              <span className="font-semibold">G2</span>
              <span className="text-white/70">4.5/5</span>
              <span className="text-white/40">•</span>
              <span className="text-white/70">200+ reviews</span>
            </div>

            <div className={PILL}>Trusted by 200+ contractors</div>
            <div className={PILL}>U.S. based businesses</div>
          </div>

          {/* Star ribbon (photo #2) */}
          <div className="mt-6 flex items-center justify-center gap-3 text-sm text-white/70">
            <Stars value={5} />
            <span>
              Average rating: <span className="text-white/85 font-semibold">4.5/5</span>
            </span>
          </div>

          {/* Partner logos */}
          <LogoRow />
        </div>

        {/* LAYOUT (photo #2 structure): proof grid + right rail spotlights */}
        <div className="mt-16 grid gap-6 lg:grid-cols-12">
          {/* LEFT: featured + dense grid */}
          <div className="lg:col-span-8">
            {/* Featured area: one tall + two stacked (photo #2 vibe) */}
            <div className="grid gap-6 md:grid-cols-2">
              <div className="md:row-span-2">
                <QuoteCard t={featured[0]} />
              </div>
              <QuoteCard t={featured[1]} />
              <QuoteCard t={featured[2]} />
            </div>

            {/* Dense grid */}
            <div className="mt-6 grid gap-6 md:grid-cols-2">
              {rest.slice(0, 6).map((t) => (
                <QuoteCard key={t.name + t.location} t={t} />
              ))}
            </div>
          </div>

          {/* RIGHT: spotlight rail */}
          <aside className="lg:col-span-4">
            <div className="sticky top-20 space-y-6">
              <div className={`${CARD} p-6`}>
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold">Spotlight Reviews</div>
                  <span className="text-xs text-white/50">High-signal feedback</span>
                </div>
                <p className="mt-2 text-sm text-white/70">
                  The themes we hear most: less searching, clearer summaries, and
                  better-fit opportunities.
                </p>
              </div>

              {spotlights.map((t) => (
                <div key={t.name} className={`${CARD} p-6`}>
                  <div className="flex items-start justify-between">
                    <SegmentChip segment={t.segment} />
                    <Stars value={t.stars ?? 5} />
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

              {/* Minimal CTA (your rule: clean + single) */}
              <div className={`${CARD} p-8 text-center`}>
                <h2 className="text-xl font-semibold">
                  Built for contractors who value their time
                </h2>
                <p className="mx-auto mt-3 max-w-sm text-sm text-white/70">
                  Spend less time searching and more time bidding on work that fits your business.
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

        <div className="h-6" />
      </div>
    </main>
  );
}
