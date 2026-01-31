"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import LandingBackground from "./components/LandingBackground";
import LandingEmailPreview from "./components/LandingEmailPreview";

type Market = "residential" | "commercial" | "government";

function marketSub(m: Market) {
  if (m === "commercial") return "Ranked commercial opportunities delivered daily.";
  if (m === "government") return "Ranked bid opportunities delivered daily.";
  return "Ranked jobs delivered daily.";
}

const CONTAINER = "mx-auto max-w-[1180px] px-6 lg:px-10";

function ArrowBadge({ dark = false }: { dark?: boolean }) {
  return (
    <span
      className={[
        "mr-3 inline-flex h-9 w-9 items-center justify-center rounded-full border-2",
        dark ? "border-black" : "border-white",
      ].join(" ")}
    >
      <span className="text-lg font-black">→</span>
    </span>
  );
}

/**
 * Social proof logos:
 *   /public/landing/social/golden-state-landscapes.jpeg
 *   /public/landing/social/old-dominion-plumbing.jpeg
 *   /public/landing/social/power-mechanical.jpeg
 */
function SignupSocialProof() {
  const logos = [
    { src: "/landing/social/golden-state-landscapes.jpeg", alt: "Golden State Landscapes" },
    { src: "/landing/social/old-dominion-plumbing.jpeg", alt: "Old Dominion Plumbing Co." },
    { src: "/landing/social/power-mechanical.jpeg", alt: "Power Mechanical" },
  ];

  return (
    <div className="mt-5 flex flex-col items-center gap-2">
      <div className="flex items-center justify-center">
        <div className="flex -space-x-4">
          {logos.map((l) => (
            <div
              key={l.src}
              className="h-11 w-11 overflow-hidden rounded-full bg-white shadow-sm border border-black/10 ring-2 ring-black/5"
              title={l.alt}
              aria-label={l.alt}
            >
              <img
                src={l.src}
                alt={l.alt}
                className="h-full w-full object-cover object-center"
                loading="lazy"
              />
            </div>
          ))}

          <div
            className="h-11 w-11 rounded-full bg-white shadow-sm border border-black/10 ring-2 ring-black/5 flex items-center justify-center text-xs font-semibold text-black/70"
            aria-hidden="true"
            title="More users"
          >
            +200
          </div>
        </div>
      </div>

      <div className="text-xs text-black/55">
        Trusted by <span className="font-semibold text-black/70">200+</span> local businesses
      </div>
    </div>
  );
}

/* ---------- TESTIMONIALS ---------- */

type QuotePart = { t: string; strong?: boolean };
type Testimonial = {
  segment: "Commercial" | "Residential";
  quote: QuotePart[];
  stars: 5;
  name: string;
  role: string;
  location: string;
  avatarSrc: string;
  avatarAlt: string;
};

const TESTIMONIALS: Testimonial[] = [
  {
    segment: "Commercial",
    quote: [
      { t: "I sat on AMBIT for weeks because I thought setup would be complicated. " },
      { t: "Fully up and running in under 5 minutes.", strong: true },
      { t: " Now we get opportunities every morning instead of searching for hours." },
    ],
    stars: 5,
    name: "Sarah K.",
    role: "Owner, Janitorial Company",
    location: "Guam, USA",
    avatarSrc: "/landing/social/testimonials/paradise-cleaning-solutions.webp",
    avatarAlt: "Paradise Cleaning Solutions",
  },
  {
    segment: "Commercial",
    quote: [
      { t: "We’ve tested a lot of tools. " },
      { t: "Relevant opportunities and clear summaries saved our team hours.", strong: true },
      { t: " It’s the first one that actually scales with us." },
    ],
    stars: 5,
    name: "David Chen",
    role: "Operations Director, Equipment Rental",
    location: "Tennessee, USA",
    avatarSrc: "/landing/social/testimonials/tennessee-contractors-equipment.jpeg",
    avatarAlt: "Tennessee Contractors Equipment",
  },
  {
    segment: "Residential",
    quote: [
      { t: "What impressed me most was the accuracy. " },
      { t: "It sends work we can actually bid and win.", strong: true },
      { t: " It’s become part of our daily routine." },
    ],
    stars: 5,
    name: "Mark T.",
    role: "Owner, Plumbing Company",
    location: "California, USA",
    avatarSrc: "/landing/social/testimonials/euro-plumbing.jpeg",
    avatarAlt: "Euro Plumbing & Sewer LLC",
  },
];

function StarRow({ count }: { count: number }) {
  return (
    <div className="mt-5 flex items-center gap-1">
      {Array.from({ length: count }).map((_, i) => (
        <svg
          key={i}
          viewBox="0 0 20 20"
          className="h-4 w-4 text-amber-300"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M10 15.27 4.18 18.2l1.11-6.48L.58 7.3l6.5-.94L10 0l2.92 6.36 6.5.94-4.71 4.42 1.11 6.48z" />
        </svg>
      ))}
    </div>
  );
}

function TestimonialsSection({ market }: { market: Market }) {
  return (
    <section className={`${CONTAINER} pb-24`}>
      <div className="overflow-hidden rounded-[36px] border border-black/10 bg-[#0A0F1E] text-white shadow-[0_30px_120px_rgba(0,0,0,0.28)]">
        <div className="px-8 py-12 sm:px-12">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-white/80">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              Live customer feedback
            </div>

            <h2 className="mt-6 text-4xl font-black tracking-tight sm:text-5xl">
              Trusted proof from real contractors
            </h2>

            <p className="mt-4 text-base text-white/70 sm:text-lg">
              Skimmable reviews from teams using AMBIT to find better-fit opportunities faster.
            </p>

            <div className="mt-6 flex flex-wrap justify-center gap-2">
              <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-white/80">
                Trusted by 200+ contractors
              </span>
              <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-white/80">
                U.S. based businesses
              </span>
              <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-white/80">
                Matches emailed daily
              </span>
            </div>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {TESTIMONIALS.map((x) => (
              <div
                key={x.name}
                className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-[0_18px_60px_rgba(0,0,0,0.25)] backdrop-blur"
              >
                <div className="flex items-center justify-between">
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-white/80">
                    {x.segment}
                  </span>
                  <span className="text-xs font-semibold text-white/45">“”</span>
                </div>

                <div className="mt-5 text-base leading-relaxed text-white/85">
                  {x.quote.map((p, i) => (
                    <span key={i} className={p.strong ? "font-black text-white" : ""}>
                      {p.t}
                    </span>
                  ))}
                </div>

                <StarRow count={x.stars} />

                <div className="mt-6 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 overflow-hidden rounded-full bg-white shadow-sm ring-2 ring-white/10">
                      <img
                        src={x.avatarSrc}
                        alt={x.avatarAlt}
                        className="h-full w-full object-contain p-1"
                        loading="lazy"
                      />
                    </div>

                    <div>
                      <div className="text-sm font-black text-white">{x.name}</div>
                      <div className="text-xs font-semibold text-white/60">{x.role}</div>
                    </div>
                  </div>

                  <div className="text-xs font-semibold text-white/45">{x.location}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 flex justify-center">
            <Link
              href="/testimonials"
              className="text-sm font-semibold text-white/70 hover:text-white underline underline-offset-4 decoration-white/20 hover:decoration-white/40"
            >
              See more →
            </Link>
          </div>
        </div>
      </div>

      {/* FINAL CTA (no extra links) */}
      <div className="mt-16 rounded-3xl border border-black/10 bg-white/85 backdrop-blur px-10 py-14 text-center shadow-[0_18px_55px_rgba(0,0,0,0.08)]">
        <div className="text-4xl font-black">Plug into AMBIT to keep growing your business</div>
        <div className="mt-4 text-lg text-black/70">
          Join the platform where who you are is just as important as what you do.
        </div>

        <div className="mt-10 flex items-center justify-center">
          <div className="relative inline-flex">
            <span
              aria-hidden
              className="pointer-events-none absolute -inset-8 -z-10 rounded-full bg-[radial-gradient(circle_at_center,rgba(79,70,229,0.35),transparent_70%)] blur-2xl"
            />
            <Link
              href={`/get-started?intent=${market}`}
              className="inline-flex items-center justify-center rounded-full bg-[#5C74FF] px-10 py-4 text-base font-semibold text-white shadow-[0_18px_40px_rgba(92,116,255,0.25)] transition hover:bg-[#465DFF]"
            >
              <ArrowBadge />
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- PAGE ---------- */

export default function HomePage() {
  const [market] = useState<Market>("residential");
  const heroSubtitle = useMemo(() => marketSub(market), [market]);

  return (
    <div className="relative min-h-screen overflow-hidden text-black">
      <div className="pointer-events-none fixed inset-0 -z-[70]">
        <LandingBackground />
      </div>

      {/* HERO */}
      <section className={`${CONTAINER} pt-16 pb-16`}>
        <div className="rounded-[44px] bg-white/65 backdrop-blur-md border border-black/10 shadow-[0_30px_90px_rgba(0,0,0,0.10)] px-8 py-14 sm:px-14">
          <div className="text-center">
            <h1 className="text-5xl font-black tracking-tight sm:text-6xl sm:whitespace-nowrap">
              Stop hunting. Start receiving.
            </h1>

            <p className="mx-auto mt-5 max-w-2xl text-lg text-black/65">
              Matched opportunities, emailed daily.
            </p>

            <div className="mt-10 flex items-center justify-center">
              <div className="relative inline-flex">
                <span
                  aria-hidden
                  className="pointer-events-none absolute -inset-8 -z-10 rounded-full bg-[radial-gradient(circle_at_center,rgba(79,70,229,0.35),transparent_70%)] blur-2xl"
                />
                <Link
                  href={`/get-started?intent=${market}`}
                  className="inline-flex items-center justify-center rounded-full bg-[#5C74FF] px-10 py-4 text-base font-semibold text-white shadow-[0_18px_40px_rgba(92,116,255,0.25)] transition hover:bg-[#465DFF]"
                >
                  <ArrowBadge />
                  Sign Up
                </Link>
              </div>
            </div>

            <SignupSocialProof />

            {/* ✅ FLOATING WIDE PREVIEW (no boxed border) */}
            <div className="mt-12 -mx-6 lg:-mx-10 px-6 lg:px-10">
  <LandingEmailPreview />
  <div className="mt-6 text-sm text-black/60">{heroSubtitle}</div>
</div>

          </div>
        </div>
      </section>

      {/* TRUST */}
      <section className={`${CONTAINER} pb-20`}>
        <div className="rounded-3xl border border-black/10 bg-white/75 backdrop-blur px-10 py-12 shadow-[0_18px_55px_rgba(0,0,0,0.08)]">
          <div className="grid gap-10 lg:grid-cols-2">
            <div>
              <h2 className="text-3xl font-black">Trusted by the most ambitious operators.</h2>
              <div className="mt-7 grid gap-6 sm:grid-cols-2">
                <div className="rounded-2xl border border-black/10 bg-white px-5 py-4">
                  <div className="text-4xl font-black text-[#34D399]">3</div>
                  <div className="mt-1 text-sm text-black/65">Markets covered</div>
                </div>
                <div className="rounded-2xl border border-black/10 bg-white px-5 py-4">
                  <div className="text-4xl font-black text-[#34D399]">Daily</div>
                  <div className="mt-1 text-sm text-black/65">Updated opportunities</div>
                </div>
              </div>
            </div>

            <div className="text-black/70">
              AMBIT is built for speed, clarity, and momentum—so you’re not guessing where to focus. See what’s relevant,
              understand it fast, and act with confidence.
            </div>
          </div>
        </div>
      </section>

      {/* FEATURE BLOCKS */}
      <section className={`${CONTAINER} pb-20`}>
        <h2 className="text-5xl font-black tracking-tight">
          Ambit makes finding jobs effortless.
          <br />
          Stop hunting, start receiving.
        </h2>

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl bg-[#E8E2D7] p-10 shadow-[0_14px_40px_rgba(0,0,0,0.06)]">
            <div className="text-2xl font-black">Your Expertise. Our Network.</div>
            <div className="mt-3 text-black/70">
              Stop searching and start selecting. Access curated positions that align your specific background with the
              sectors you actually care about.
            </div>
          </div>

          <div className="rounded-3xl bg-[#59C98B] p-10 shadow-[0_14px_40px_rgba(0,0,0,0.06)]">
            <div className="text-2xl font-black text-black">Move With Purpose.</div>
            <div className="mt-3 text-black/80">
              Strategically aligning your business with the jobs in your chosen industry.
            </div>
          </div>

          <div className="rounded-3xl bg-[#5C74FF] p-10 text-white shadow-[0_14px_40px_rgba(0,0,0,0.10)]">
            <div className="text-2xl font-black">A Command Center for Your Company.</div>
            <div className="mt-3 text-white/90">
              Use precision matching to find the right jobs and simple summaries to decide fast.
            </div>
          </div>

          <div className="rounded-3xl bg-[#E8E2D7] p-10 shadow-[0_14px_40px_rgba(0,0,0,0.06)]">
            <div className="text-2xl font-black">Visibility Without Guesswork.</div>
            <div className="mt-3 text-black/70">
              Built to prioritize transparency—so your status is clear at every stage.
            </div>
          </div>
        </div>
      </section>

      <TestimonialsSection market={market} />
    </div>
  );
}
