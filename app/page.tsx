"use client";

import Link from "next/link";
import LandingBackground from "./components/LandingBackground";
import LandingEmailPreview from "./components/LandingEmailPreview";
import CallRequestWidget from "./components/CallRequestWidget";

type Market = "residential" | "commercial" | "government";

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
    {
      src: "/landing/social/golden-state-landscapes.jpeg",
      alt: "Golden State Landscapes",
    },
    {
      src: "/landing/social/old-dominion-plumbing.jpeg",
      alt: "Old Dominion Plumbing Co.",
    },
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
                decoding="async"
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
        Trusted by <span className="font-semibold text-black/70">200+</span>{" "}
        local businesses
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
      {
        t: "Proposals for gov/commercial contracts always made me nervous, but the two Ambit associates I worked with for six weeks were incredible. ",
      },
      { t: "They took the stress out of it", strong: true },
      { t: " and were awesome to work with." },
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
      { t: "Shout out to Sean at Ambit. " },
      {
        t: "We spent hours on a project last year that actually won, largely thanks to his hard work.",
        strong: true,
      },
      { t: " He’s definitely someone who takes pride in his craft." },
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
      <div className="overflow-hidden rounded-[36px] border border-black/10 bg-[#0A0F1E] text-white shadow-[0_20px_70px_rgba(0,0,0,0.22)]">
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
              Skimmable reviews from teams using AMBIT to find better-fit
              opportunities faster.
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
                className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-[0_12px_40px_rgba(0,0,0,0.18)]"
              >
                <div className="flex items-center justify-between">
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-white/80">
                    {x.segment}
                  </span>
                  <span className="text-xs font-semibold text-white/45">“”</span>
                </div>

                <div className="mt-5 text-base leading-relaxed text-white/85">
                  {x.quote.map((p, i) => (
                    <span
                      key={i}
                      className={p.strong ? "font-black text-white" : ""}
                    >
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
                        decoding="async"
                      />
                    </div>

                    <div>
                      <div className="text-sm font-black text-white">
                        {x.name}
                      </div>
                      <div className="text-xs font-semibold text-white/60">
                        {x.role}
                      </div>
                    </div>
                  </div>

                  <div className="text-xs font-semibold text-white/45">
                    {x.location}
                  </div>
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

      {/* FINAL CTA */}
      <div className="mt-16 rounded-3xl border border-black/10 bg-white/92 px-10 py-12 text-center shadow-[0_14px_40px_rgba(0,0,0,0.07)]">
        <div className="text-4xl font-black">
          Plug into AMBIT to keep growing your business
        </div>
        <div className="mt-4 text-lg text-black/70">
          Join the platform where who you are is just as important as what you do.
        </div>

        <div className="mt-10 flex items-center justify-center">
          <div className="relative inline-flex">
            <span
              aria-hidden
              className="pointer-events-none absolute -inset-10 -z-10 rounded-full bg-[radial-gradient(circle_at_center,rgba(92,116,255,0.20),transparent_70%)]"
            />
            <Link
              href={`/get-started?intent=${market}`}
              className="inline-flex items-center justify-center rounded-full bg-[#5C74FF] px-10 py-4 text-base font-semibold text-white shadow-[0_18px_40px_rgba(92,116,255,0.22)] transition hover:bg-[#465DFF]"
            >
              <ArrowBadge />
              Choose plan
            </Link>
          </div>
        </div>

        <div className="mt-3 text-xs font-semibold text-black/60">
          Active subscription required • Matches + RFQ alerts + bid support
        </div>
      </div>
    </section>
  );
}

/* ---------- PAGE ---------- */

export default function HomePage() {
  const market: Market = "government";

  return (
    <div className="relative min-h-screen overflow-hidden text-black">
      <div className="pointer-events-none absolute inset-0 -z-[70]">
        <LandingBackground />
      </div>

      {/* Fixed widget (renders once, not inside the hero) */}
      <CallRequestWidget />

      {/* HERO */}
      <section className={`${CONTAINER} pt-14 pb-10`}>
        <div className="rounded-[44px] bg-white/92 border border-black/10 shadow-[0_18px_55px_rgba(0,0,0,0.08)] px-8 py-10 sm:px-12 sm:py-12">
          <div className="text-center">
            {/* Offer badge */}
            <div className="mx-auto inline-flex items-center justify-center gap-2 rounded-full border border-black/20 bg-[#F4FAFF] px-5 py-2.5 text-sm font-black tracking-tight text-black/85 shadow-[0_10px_30px_rgba(92,116,255,0.18)]">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-[0_0_0_4px_rgba(52,211,153,0.20)]" />
              Live Tracking
            </div>

            <h1 className="mt-5 text-5xl font-black tracking-tight sm:text-6xl">
              Stop hunting. Start receiving.
            </h1>

            <p className="mt-4 text-lg font-semibold tracking-tight text-black/70 sm:text-xl">
              We Search &amp; Send, You Bid &amp; Win.
            </p>

            <p className="mt-1 text-sm font-medium text-black/55 sm:text-base">
              For tradespeople. Built by tradespeople.
            </p>

            <div className="mt-8 flex items-center justify-center">
              <div className="relative inline-flex">
                <span
                  aria-hidden
                  className="pointer-events-none absolute -inset-10 -z-10 rounded-full bg-[radial-gradient(circle_at_center,rgba(92,116,255,0.20),transparent_70%)]"
                />
                <Link
                  href={`/get-started?intent=${market}`}
                  className="inline-flex items-center justify-center rounded-full bg-[#5C74FF] px-10 py-4 text-base font-semibold text-white shadow-[0_18px_40px_rgba(92,116,255,0.22)] transition hover:bg-[#465DFF]"
                >
                  <ArrowBadge />
                  Choose plan
                </Link>
              </div>
            </div>

            <SignupSocialProof />
          </div>
        </div>
      </section>

            {/* WHAT WE DO (CONVERSION READY) */}
      <section className={`${CONTAINER} pb-20`}>
        <div className="rounded-3xl border border-black/10 bg-white/92 px-10 py-12 shadow-[0_14px_40px_rgba(0,0,0,0.07)]">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            {/* LEFT: Clear promise + bullets */}
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-3 py-1 text-xs font-semibold text-black/70">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Built for contractors
              </div>

              <h2 className="mt-4 text-3xl font-black tracking-tight">
                What AMBIT does
              </h2>

              <p className="mt-3 text-base text-black/70">
                We find contract opportunities that fit your business and email you a
                ranked digest with the exact details you need to take action.
              </p>

              <div className="mt-5 flex flex-wrap gap-2">
                <span className="rounded-full border border-black/10 bg-white px-3 py-1 text-xs font-semibold text-black/70">
                  Government
                </span>
                <span className="rounded-full border border-black/10 bg-white px-3 py-1 text-xs font-semibold text-black/70">
                  Commercial
                </span>
                <span className="rounded-full border border-black/10 bg-white px-3 py-1 text-xs font-semibold text-black/70">
                  Residential
                </span>
              </div>

              <ul className="mt-6 space-y-3 text-sm text-black/70">
                <li className="flex gap-3">
                  <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 text-xs font-black">
                    ✓
                  </span>
                  <span>
                    <span className="font-semibold text-black/80">
                      Right-fit matches
                    </span>{" "}
                    — no giant lists, just opportunities aligned to your trade and
                    service area.
                  </span>
                </li>

                <li className="flex gap-3">
                  <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 text-xs font-black">
                    ✓
                  </span>
                  <span>
                    <span className="font-semibold text-black/80">
                      Clear deal details
                    </span>{" "}
                    — scope, buyer/agency, location, due date, and estimated value
                    when available.
                  </span>
                </li>

                <li className="flex gap-3">
                  <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 text-xs font-black">
                    ✓
                  </span>
                  <span>
                    <span className="font-semibold text-black/80">
                      Ranked by fit
                    </span>{" "}
                    — start with the best shot first, then work down.
                  </span>
                </li>
              </ul>

              <div className="mt-6 text-xs font-semibold text-black/55">
                Quick setup • Email-first • Built for speed
              </div>
            </div>

            {/* RIGHT: Simple “how it works” + stats */}
            <div className="rounded-3xl border border-black/10 bg-white p-8 shadow-[0_10px_28px_rgba(0,0,0,0.06)]">
              <div className="text-xs font-semibold text-black/60">
                How it works
              </div>

              <div className="mt-4 space-y-4">
                <div className="flex gap-3">
                  <div className="mt-0.5 inline-flex h-8 w-8 flex-none items-center justify-center rounded-full border border-black/10 bg-[#F4FAFF] text-sm font-black">
                    1
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-black/80">
                      Tell us what you do + where you work
                    </div>
                    <div className="text-sm text-black/60">
                      Trade, service area, and what you want to pursue.
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="mt-0.5 inline-flex h-8 w-8 flex-none items-center justify-center rounded-full border border-black/10 bg-[#F4FAFF] text-sm font-black">
                    2
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-black/80">
                      We search, filter, and score opportunities
                    </div>
                    <div className="text-sm text-black/60">
                      We cut noise and prioritize what fits.
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="mt-0.5 inline-flex h-8 w-8 flex-none items-center justify-center rounded-full border border-black/10 bg-[#F4FAFF] text-sm font-black">
                    3
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-black/80">
                      You get a daily digest you can act on
                    </div>
                    <div className="text-sm text-black/60">
                      See what’s relevant, understand it fast, then bid.
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-7 grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-black/10 bg-white px-4 py-4">
                  <div className="text-3xl font-black text-[#34D399]">3</div>
                  <div className="mt-1 text-xs font-semibold text-black/60">
                    Markets covered
                  </div>
                </div>

                <div className="rounded-2xl border border-black/10 bg-white px-4 py-4">
                  <div className="text-3xl font-black text-[#34D399]">Daily</div>
                  <div className="mt-1 text-xs font-semibold text-black/60">
                    Updated opportunities
                  </div>
                </div>

                <div className="rounded-2xl border border-black/10 bg-white px-4 py-4">
                  <div className="text-3xl font-black text-[#34D399]">Ranked</div>
                  <div className="mt-1 text-xs font-semibold text-black/60">
                    By fit
                  </div>
                </div>
              </div>

              <div className="mt-4 text-xs text-black/55">
                No clutter — just the opportunities worth your time.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TOP MATCH PREVIEW (MOVED BELOW "WHAT WE DO") */}
      <section className={`${CONTAINER} pb-16`}>
        <LandingEmailPreview market={market} />
      </section>

      {/* FEATURE BLOCKS */}
      <section className={`${CONTAINER} pb-20`}>
        <h2 className="text-5xl font-black tracking-tight">
          Ambit makes finding jobs effortless.
          <br />
          Stop hunting, start receiving.
        </h2>

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl bg-[#E8E2D7] p-10 shadow-[0_10px_28px_rgba(0,0,0,0.06)]">
            <div className="text-2xl font-black">Your Expertise. Our Network.</div>
            <div className="mt-3 text-black/70">
              Stop searching and start selecting. Access curated contracts that
              align your specific background with the sectors you actually care
              about.
            </div>
          </div>

          <div className="rounded-3xl bg-[#59C98B] p-10 shadow-[0_10px_28px_rgba(0,0,0,0.06)]">
            <div className="text-2xl font-black text-black">Move With Purpose.</div>
            <div className="mt-3 text-black/80">
              Strategically aligning your business with the projects in your chosen
              industry.
            </div>
          </div>

          <div className="rounded-3xl bg-[#5C74FF] p-10 text-white shadow-[0_10px_30px_rgba(0,0,0,0.10)]">
            <div className="text-2xl font-black">
              A Command Center for Your Company.
            </div>
            <div className="mt-3 text-white/90">
              Use precision matching to find the right jobs and simple summaries to
              decide fast.
            </div>
          </div>

          <div className="rounded-3xl bg-[#E8E2D7] p-10 shadow-[0_10px_28px_rgba(0,0,0,0.06)]">
            <div className="text-2xl font-black">Visibility Without Guesswork.</div>
            <div className="mt-3 text-black/70">
              Built to prioritize transparency—so your status is clear at every
              stage.
            </div>
          </div>
        </div>
      </section>

      <TestimonialsSection market={market} />
    </div>
  );
}
