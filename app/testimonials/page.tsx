"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type Segment = "Residential" | "Commercial" | "Government";

type Testimonial = {
  name: string;
  role: string;
  location: string;
  quote: string; // full quote
  hook: string; // bolded sentence fragment for skimmability
  initials: string;
  segment?: Segment;
  stars?: 4 | 5;
  featured?: boolean;
};

const PRIMARY =
  "inline-flex items-center justify-center rounded-xl bg-[#1A4FA3] px-6 py-3 text-sm font-semibold text-white hover:bg-[#15428B] transition w-full sm:w-auto";

const SECONDARY =
  "inline-flex items-center justify-center rounded-xl border border-white/12 bg-white/5 px-6 py-3 text-sm font-semibold text-white/90 hover:bg-white/10 transition w-full sm:w-auto";

const CARD =
  "rounded-2xl border border-white/10 bg-white/5 shadow-[0_0_0_1px_rgba(255,255,255,0.03)]";

const PILL =
  "inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 sm:px-4 py-2 text-xs sm:text-sm text-white/85 w-full sm:w-auto justify-center sm:justify-start";

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
    hook: "Fully up and running in under 5 minutes.",
    quote:
      "I sat on AMBIT for weeks because I thought setup would be complicated. Fully up and running in under 5 minutes. Now I get opportunities every morning instead of searching for hours.",
    initials: "SK",
    segment: "Commercial",
    stars: 5,
    featured: true,
  },
  {
    name: "David Chen",
    role: "Operations Director, Construction",
    location: "Nevada, USA",
    hook: "Relevant opportunities + clear summaries saved our team hours.",
    quote:
      "We’ve tested a lot of tools. Relevant opportunities + clear summaries saved our team hours. It’s the first one that actually scales with us.",
    initials: "DC",
    segment: "Commercial",
    stars: 5,
    featured: true,
  },
  {
    name: "Mark T.",
    role: "Owner, Plumbing Company",
    location: "California, USA",
    hook: "It sends work we can actually bid and win.",
    quote:
      "What impressed me most was the accuracy. It sends work we can actually bid and win. It’s become part of our daily routine.",
    initials: "MT",
    segment: "Residential",
    stars: 5,
    featured: true,
  },

  // More reviews
  {
    name: "Erin J.",
    role: "Estimator, HVAC",
    location: "Texas, USA",
    hook: "We can tell fast if it’s worth pursuing.",
    quote:
      "The summaries are the difference. We can tell fast if it’s worth pursuing instead of digging through PDFs.",
    initials: "EJ",
    segment: "Commercial",
    stars: 5,
  },
  {
    name: "Nina S.",
    role: "Office Manager, Electrical",
    location: "Georgia, USA",
    hook: "This keeps our pipeline moving.",
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
    hook: "Clear match reasoning keeps our team aligned.",
    quote: "Clean layout and clear match reasoning keeps our team aligned fast.",
    initials: "TP",
    segment: "Government",
    stars: 5,
  },
  {
    name: "James M.",
    role: "Owner, Mechanical",
    location: "Texas, USA",
    hook: "Less searching. More bidding.",
    quote: "Less searching. More bidding. AMBIT saves me time every week.",
    initials: "JM",
    segment: "Government",
    stars: 5,
  },
  {
    name: "Luis R.",
    role: "Owner, Landscaping",
    location: "Hawaii, USA",
    hook: "It’s part of my morning routine now.",
    quote:
      "AMBIT helped me spot projects I would’ve missed. It’s part of my morning routine now.",
    initials: "LR",
    segment: "Residential",
    stars: 4,
  },
  {
    name: "Chris B.",
    role: "Owner, Concrete",
    location: "Arizona, USA",
    hook: "Simple setup. Better matches.",
    quote: "Simple setup. Better matches. Less noise. Exactly what we needed.",
    initials: "CB",
    segment: "Residential",
    stars: 4,
  },
];

function Stars({ value }: { value: number }) {
  const full = Math.max(0, Math.min(5, Math.round(value)));
  const stars = Array.from({ length: 5 }, (_, i) => (i < full ? "★" : "☆"));
  return <span className="tracking-[0.12em] text-[#FFD36A]/90">{stars.join("")}</span>;
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

function BoldHookQuote({ hook, quote }: { hook: string; quote: string }) {
  const parts = quote.split(hook);
  if (parts.length < 2) return <span className="text-white/88">{quote}</span>;
  return (
    <span className="text-white/88">
      {parts[0]}
      <strong className="text-white">{hook}</strong>
      {parts.slice(1).join(hook)}
    </span>
  );
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

      <p className="mt-3 text-sm leading-relaxed">
        <BoldHookQuote hook={t.hook} quote={t.quote} />
      </p>

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
    <div className="flex w-full sm:w-auto items-center gap-3 rounded-2xl border border-white/12 bg-white/5 px-4 py-3 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-white/10">
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

      <div className="mx-auto mt-4 flex max-w-4xl flex-wrap items-center justify-center gap-x-8 sm:gap-x-10 gap-y-5">
        {LOGOS.partners.map((b) => (
          <div key={b.name} className="flex items-center">
            <Img
              src={b.src}
              alt={b.name}
              className="h-6 sm:h-7 w-auto opacity-85 grayscale hover:opacity-100 hover:grayscale-0 transition"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function Carousel({ items }: { items: Testimonial[] }) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold text-white/90">More reviews</div>
        <div className="text-xs text-white/50">Scroll →</div>
      </div>

      {/* Mobile-friendly horizontal scroll (prevents page overflow on iPhone) */}
      <div className="mt-3 -mx-2 flex gap-4 overflow-x-auto px-2 pb-2 [-webkit-overflow-scrolling:touch]">
        {items.map((t) => (
          <div key={t.name} className="w-[280px] sm:w-[340px] flex-shrink-0">
            <QuoteCard t={t} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function TestimonialsPage() {
  const [showMore, setShowMore] = useState(false);

  const featured = useMemo(
    () => TESTIMONIALS.filter((t) => t.featured && t.stars === 5).slice(0, 3),
    []
  );

  const rest = useMemo(() => {
    const nonFeatured = TESTIMONIALS.filter((t) => !t.featured);
    const fives = nonFeatured.filter((t) => t.stars === 5);
    const fours = nonFeatured.filter((t) => t.stars === 4);
    return [...fives, ...fours];
  }, []);

  const visibleCarousel = showMore ? rest : rest.slice(0, 6);

  return (
    // Key iPhone fix: "break out" of any parent max-width wrapper
    <main className="relative left-1/2 w-screen -translate-x-1/2 overflow-x-hidden min-h-[100dvh] text-white">
      {/* Background glow + subtle grid (full-screen, even if parent is constrained) */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[#070B18]" />
        <div className="absolute inset-0 bg-[radial-gradient(900px_600px_at_20%_0%,rgba(26,79,163,0.25),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(800px_520px_at_80%_25%,rgba(52,211,153,0.16),transparent_55%)]" />
        <div className="absolute inset-0 opacity-[0.06] [background-image:linear-gradient(to_right,rgba(255,255,255,0.25)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.25)_1px,transparent_1px)] [background-size:72px_72px]" />
        <div className="absolute inset-0 bg-gradient-to-b from-white/[0.03] via-transparent to-transparent" />
      </div>

      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 py-12 sm:py-16 md:py-20">
        {/* Hero */}
        <div className="mx-auto max-w-5xl text-center">
          <div className="mx-auto flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[11px] font-semibold text-white/80">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            Live customer feedback
          </div>

          <h1 className="mt-4 text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight">
            Trusted proof from real contractors
          </h1>
          <p className="mt-4 text-sm sm:text-base text-white/70">
            Skimmable reviews from contractors using AMBIT to find better-fit opportunities faster.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-4">
            <div className="flex w-full flex-col sm:flex-row flex-wrap items-center justify-center gap-3">
              <G2Badge />
              <div className={PILL}>{TRUST.contractorCountLabel}</div>
              <div className={PILL}>U.S. based businesses</div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-sm text-white/70 leading-relaxed">
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

        {/* Featured Three */}
        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {featured.map((t, idx) => (
            <div key={t.name} className="lg:col-span-1">
              <QuoteCard t={t} variant={idx === 1 ? "featured" : "default"} />
            </div>
          ))}
        </div>

        {/* CTA right after strongest proof */}
        <div className="mt-10 flex flex-col items-center justify-center gap-3 text-center">
          <div className="text-sm text-white/70">
            Ready to see your matches? Choose a plan and get started today.
          </div>
          <div className="flex w-full sm:w-auto flex-col sm:flex-row flex-wrap items-center justify-center gap-3">
            <Link href="/get-started" className={PRIMARY}>
              Choose plan — Subscription required
            </Link>
          </div>
        </div>

        {/* Carousel only (Spotlight removed) */}
        <div className="mt-10">
          <Carousel items={visibleCarousel} />

         
          

          <div className="mt-4 text-center text-xs text-white/45">
            Star ratings shown reflect individual reviewers.
          </div>
        </div>

        <div className="h-6" />
      </div>
    </main>
  );
}
