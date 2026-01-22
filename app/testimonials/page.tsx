import Link from "next/link";

type Segment = "Residential" | "Commercial" | "Government";

type Testimonial = {
  name: string;
  role: string;
  location: string;
  quote: string;
  initials: string;
  segment?: Segment;
  stars?: 1 | 2 | 3 | 4 | 5;
  featured?: boolean;
};

const PRIMARY =
  "inline-flex items-center justify-center rounded-xl bg-[#1A4FA3] px-6 py-3 text-sm font-semibold text-white hover:bg-[#15428B] transition";

const SECONDARY =
  "inline-flex items-center justify-center rounded-xl border border-white/12 bg-white/5 px-6 py-3 text-sm font-semibold text-white/90 hover:bg-white/10 transition";

const CARD =
  "rounded-2xl border border-white/10 bg-white/5 shadow-[0_0_0_1px_rgba(255,255,255,0.03)]";

const PILL =
  "inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/85";

const LOGOS = {
  g2: "/logos/g2.png",
  partners: [
    { name: "EMCOR", src: "/logos/emcor.png" },
    { name: "Dynegy", src: "/logos/dynegy.png" },
    { name: "Premier Pool Service", src: "/logos/premierpoolservice.png" },
    { name: "Sevrix", src: "/logos/sevrix.png" },
  ],
};

const TRUST = {
  rating: "4.5/5",
  reviewCountLabel: "200+ reviews",
  contractorCountLabel: "Trusted by 200+ contractors",
};

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
    featured: true,
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
    featured: true,
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
    featured: true,
  },

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
      "AMBIT helped me spot projects I would’ve missed. It’s part of my morning routine now.",
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
  {
    name: "Chris B.",
    role: "Owner, Concrete",
    location: "Arizona, USA",
    quote: "Simple setup. Better matches. Less noise. Exactly what we needed.",
    initials: "CB",
    segment: "Residential",
    stars: 4,
  },
];

function Stars({ value }: { value: number }) {
  const full = Math.max(0, Math.min(5, Math.round(value)));
  const stars = Array.from({ length: 5 }, (_, i) => (i < full ? "★" : "☆"));
  return (
    <span className="tracking-[0.12em] text-[#FFD36A]/90">
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

function Img({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className: string;
}) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} className={className} />;
}

function QuoteCard({
  t,
  variant = "default",
}: {
  t: Testimonial;
  variant?: "default" | "featured";
}) {
  const wrap =
    variant === "featured"
      ? `${CARD} p-7 border-white/14 bg-white/[0.07] shadow-[0_30px_90px_rgba(0,0,0,0.35)]`
      : `${CARD} p-6`;

  return (
    <div className={wrap}>
      <div className="flex items-start justify-between gap-3">
        <SegmentChip segment={t.segment} />
        <span className="text-white/15 text-xl leading-none">“</span>
      </div>

      <p className="mt-3 text-sm leading-relaxed text-white/88">“{t.quote}”</p>

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

function G2Badge() {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-white/12 bg-white/5 px-4 py-3 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
        <Img src={LOGOS.g2} alt="G2" className="h-7 w-7 rounded-sm" />
      </div>

      <div className="leading-tight">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-white">G2</span>
          <span className="text-xs text-white/50">•</span>
          <span className="text-sm text-white/80">{TRUST.rating}</span>
        </div>
        <div className="text-xs text-white/65">{TRUST.reviewCountLabel}</div>
      </div>
    </div>
  );
}

function PartnerStrip() {
  return (
    <div className="mt-7">
      <div className="text-center text-[11px] text-white/45">
        Partnered with contractors working alongside:
      </div>

      <div className="mx-auto mt-4 flex max-w-4xl flex-wrap items-center justify-center gap-x-10 gap-y-5">
        {LOGOS.partners.map((b) => (
          <div key={b.name} className="flex items-center">
            <Img
              src={b.src}
              alt={b.name}
              className="h-6 w-auto opacity-80 grayscale hover:opacity-95 hover:grayscale-0 transition"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function CTAInline() {
  return (
    <div className="mt-10 flex flex-col items-center justify-center gap-3 text-center">
      <div className="text-sm text-white/70">
        Ready to see your matches? Start your trial — no credit card.
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link href="/get-started" className={PRIMARY}>
          Start Free Trial — No Credit Card
        </Link>
        <Link href="/pricing" className={SECONDARY}>
          View Pricing
        </Link>
      </div>
    </div>
  );
}

export default function TestimonialsPage() {
  const featured = TESTIMONIALS.filter((t) => t.featured);
  const rest = TESTIMONIALS.filter((t) => !t.featured);

  return (
    <main className="bg-[#0B1430] text-white">
      <div className="mx-auto max-w-7xl px-6 py-16 md:py-20">
        {/* Hero */}
        <div className="mx-auto max-w-5xl text-center">
          <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">
            Trusted proof from real contractors
          </h1>
          <p className="mt-4 text-white/70">
            Clear, honest reviews from contractors using AMBIT to find better-fit
            opportunities faster.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-4">
            {/* Proof row */}
            <div className="flex flex-wrap items-center justify-center gap-3">
              <G2Badge />
              <div className={PILL}>{TRUST.contractorCountLabel}</div>
              <div className={PILL}>U.S. based businesses</div>
            </div>

            {/* Single concise rating line (no redundancy) */}
            <div className="flex flex-wrap items-center justify-center gap-3 text-sm text-white/70">
              <Stars value={5} />
              <span>
                Average rating:{" "}
                <span className="font-semibold text-white/90">{TRUST.rating}</span>
              </span>
              <span className="text-white/40">•</span>
              <span>{TRUST.reviewCountLabel} (G2)</span>
            </div>

            <PartnerStrip />
          </div>
        </div>

        {/* Featured row */}
        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {featured.map((t, idx) => (
            <div key={t.name} className="lg:col-span-1">
              <QuoteCard t={t} variant={idx === 1 ? "featured" : "default"} />
            </div>
          ))}
        </div>

        {/* Strong CTA right after the best proof */}
        <CTAInline />

        {/* Dense proof grid */}
        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          <div className="space-y-6">
            {rest[0] && <QuoteCard t={rest[0]} />}
            {rest[1] && <QuoteCard t={rest[1]} />}
            {rest[2] && <QuoteCard t={rest[2]} />}
          </div>

          <div className="space-y-6">
            {rest[3] && <QuoteCard t={rest[3]} />}
            {rest[4] && <QuoteCard t={rest[4]} />}
            {rest[5] && <QuoteCard t={rest[5]} />}
          </div>

          <div className="space-y-6">
            <div className={`${CARD} p-6`}>
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold">Spotlight Reviews</div>
                <span className="text-xs text-white/50">High-signal feedback</span>
              </div>
              <p className="mt-2 text-sm text-white/70">
                Themes we hear most: less searching, clearer summaries, and better-fit
                opportunities.
              </p>
              <div className="mt-4 grid gap-2 text-sm text-white/75">
                <div className="flex items-center justify-between">
                  <span>Less searching</span>
                  <span className="text-white/45">Common</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Clear summaries</span>
                  <span className="text-white/45">Common</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Better-fit leads</span>
                  <span className="text-white/45">Common</span>
                </div>
              </div>
            </div>

            <div className={`${CARD} p-8 text-center`}>
              <h2 className="text-xl font-semibold">
                Built for contractors who value their time
              </h2>
              <p className="mx-auto mt-3 max-w-sm text-sm text-white/70">
                Spend less time searching and more time bidding on work that fits
                your business.
              </p>
              <div className="mt-6 flex flex-col items-center justify-center gap-3">
                <Link href="/get-started" className={PRIMARY}>
                  Start Free Trial — No Credit Card
                </Link>
                <Link href="/pricing" className={SECONDARY}>
                  View Pricing
                </Link>
              </div>
            </div>

            <div className="text-center text-xs text-white/40">
              Ratings and review counts shown above reflect your current G2 totals.
            </div>
          </div>
        </div>

        <div className="h-6" />
      </div>
    </main>
  );
}
