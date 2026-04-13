"use client";

import Link from "next/link";

type Segment = "Commercial" | "Government";

type Testimonial = {
  name: string;
  role: string;
  location: string;
  quote: string;
  hook: string;
  initials: string;
  segment?: Segment;
  stars?: 4 | 5;
};

const CONTAINER = "mx-auto max-w-[1240px] px-6 lg:px-10";

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
  },
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
    quote:
      "Clean layout and clear match reasoning keeps our team aligned fast.",
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
];

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#7A7590]">
      {children}
    </div>
  );
}

function Button({
  href,
  children,
  variant = "primary",
}: {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary";
}) {
  const styles =
    variant === "primary"
      ? "bg-[#2A8F8B] text-white hover:bg-[#247d7a]"
      : "border border-[#2A8F8B]/20 bg-white text-[#2A8F8B] hover:bg-[#2A8F8B]/5";

  return (
    <Link
      href={href}
      className={`inline-flex items-center justify-center rounded-md px-5 py-3 text-sm font-semibold transition ${styles}`}
    >
      {children}
    </Link>
  );
}

function Stars({ value }: { value: number }) {
  const full = Math.max(0, Math.min(5, Math.round(value)));
  const stars = Array.from({ length: 5 }, (_, i) => (i < full ? "★" : "☆"));
  return (
    <span className="tracking-[0.12em] text-[#2A8F8B]">{stars.join("")}</span>
  );
}

function Avatar({ initials }: { initials: string }) {
  return (
    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#2A8F8B] text-sm font-semibold text-white">
      {initials}
    </div>
  );
}

function SegmentChip({ segment }: { segment?: Segment }) {
  if (!segment) return null;

  return (
    <span className="inline-flex items-center rounded-full border border-[#2A8F8B]/15 bg-[#F6FBFA] px-3 py-1 text-xs font-semibold text-[#31245C]">
      {segment}
    </span>
  );
}

function BoldHookQuote({ hook, quote }: { hook: string; quote: string }) {
  const parts = quote.split(hook);

  if (parts.length < 2) {
    return <span>{quote}</span>;
  }

  return (
    <span>
      {parts[0]}
      <strong className="text-[#31245C]">{hook}</strong>
      {parts.slice(1).join(hook)}
    </span>
  );
}

function QuoteCard({ t }: { t: Testimonial }) {
  return (
    <div className="rounded-[28px] bg-white p-7 shadow-[0_16px_36px_rgba(49,36,92,0.08)] ring-1 ring-[#2A8F8B]/10">
      <div className="flex items-start justify-between gap-4">
        <SegmentChip segment={t.segment} />
        <div className="text-3xl leading-none text-[#2A8F8B]/30">“</div>
      </div>

      <p className="mt-4 text-base leading-8 text-[#6A6775]">
        <BoldHookQuote hook={t.hook} quote={t.quote} />
      </p>

      <div className="mt-5 flex items-center justify-between gap-4">
        <Stars value={t.stars ?? 5} />
        <span className="text-xs font-medium text-[#7A7590]">{t.location}</span>
      </div>

      <div className="mt-6 flex items-center gap-4">
        <Avatar initials={t.initials} />
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold text-[#31245C]">
            {t.name}
          </div>
          <div className="truncate text-xs text-[#7A7590]">{t.role}</div>
        </div>
      </div>
    </div>
  );
}

export default function TestimonialsPage() {
  return (
    <main className="min-h-screen bg-[#E6F5F2] text-[#31245C]">
      <div className={`${CONTAINER} py-12 sm:py-16 lg:py-20`}>
        <div className="mx-auto max-w-[980px] text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#2A8F8B]/15 bg-white px-3 py-1.5 text-xs font-semibold text-[#31245C] shadow-sm">
            <span className="inline-flex h-2 w-2 rounded-full bg-[#2A8F8B]" />
            Customer feedback
          </div>

          <div className="mt-6">
            <Eyebrow>Testimonials</Eyebrow>
            <h1 className="mt-3 text-4xl font-black tracking-tight text-[#31245C] sm:text-5xl">
              Real feedback from contractors using AMBIT
            </h1>
            <p className="mx-auto mt-4 max-w-[760px] text-base leading-8 text-[#6A6775]">
              Feedback from commercial and government-focused contractors using
              AMBIT to find better-fit opportunities, review them faster, and
              reduce the admin load that slows bidding down.
            </p>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <div className="rounded-full border border-[#2A8F8B]/15 bg-white px-4 py-2 text-sm font-semibold text-[#31245C] shadow-sm">
              4.5/5 average rating
            </div>
            <div className="rounded-full border border-[#2A8F8B]/15 bg-white px-4 py-2 text-sm font-semibold text-[#31245C] shadow-sm">
              65+ reviews
            </div>
            <div className="rounded-full border border-[#2A8F8B]/15 bg-white px-4 py-2 text-sm font-semibold text-[#31245C] shadow-sm">
              Trusted by 65+ contractors
            </div>
          </div>
        </div>

        <section className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <QuoteCard key={t.name} t={t} />
          ))}
        </section>

        <section className="mt-12 rounded-[32px] bg-[#DDF3EF] px-8 py-10 shadow-[0_16px_36px_rgba(49,36,92,0.06)] sm:px-10">
          <div className="mx-auto max-w-[860px] text-center">
            <Eyebrow>Our Goal</Eyebrow>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-[#31245C] sm:text-4xl">
              Our goal is simple.
            </h2>
            <p className="mx-auto mt-4 max-w-[760px] text-base leading-8 text-[#6A6775]">
              At AMBIT, our goal is to help good companies pursue more work
              without getting buried in the front-end bid process. We want
              contractors to spend less time hunting, sorting, and digging
              through scattered notices and more time deciding which
              opportunities are actually worth pursuing.
            </p>
            <p className="mx-auto mt-4 max-w-[760px] text-base leading-8 text-[#6A6775]">
              That means clearer opportunities, faster summaries, less noise,
              and a simpler path from finding work to taking action. We built
              AMBIT to reduce the admin burden that slows bidding down and help
              teams stay focused on execution.
            </p>
          </div>
        </section>

        <section className="mt-12 rounded-[32px] bg-[#DDF3EF] px-8 py-10 text-center shadow-[0_16px_36px_rgba(49,36,92,0.06)] sm:px-10">
          <h2 className="text-3xl font-black tracking-tight text-[#31245C] sm:text-4xl">
            Want help carrying the front-end bid workload?
          </h2>
          <p className="mx-auto mt-4 max-w-[720px] text-base leading-8 text-[#6A6775]">
            AMBIT helps contractors source opportunities, handle paperwork,
            track deadlines, and keep the proposal process moving.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button href="/get-started">Get started</Button>
            <Button href="/login" variant="secondary">
              Log in
            </Button>
          </div>
        </section>
      </div>
    </main>
  );
}