"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import SignupModal from "./components/SignupModal";

type Market = "residential" | "commercial" | "government";

const MARKETS: Array<{ key: Market; label: string }> = [
  { key: "residential", label: "Residential" },
  { key: "commercial", label: "Commercial" },
  { key: "government", label: "Government" },
];

function marketSub(m: Market) {
  if (m === "commercial") return "Work orders + service contracts ranked for your team.";
  if (m === "government") return "Public bid opportunities matched to your scope.";
  return "Verified homeowner requests matched to your service area.";
}

// ✅ Baby-blue page background (no dark navy)
const BG =
  "min-h-screen bg-[#EAF3FF] text-black [background-image:linear-gradient(135deg,rgba(0,0,0,0.05)_1px,transparent_1px),linear-gradient(45deg,rgba(0,0,0,0.05)_1px,transparent_1px)] [background-size:140px_140px]";

const CONTAINER = "mx-auto max-w-[1180px] px-6 lg:px-10";

function ArrowBadge() {
  return (
    <span className="mr-3 inline-flex h-9 w-9 items-center justify-center rounded-full border-2 border-white">
      <span className="text-lg font-black">→</span>
    </span>
  );
}

function LogoPill({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 rounded-full border border-black/10 bg-white px-4 py-2">
      <div className="h-7 w-7 rounded-full bg-black/10" />
      <div className="text-xs font-semibold tracking-widest text-black/55 uppercase">
        {label}
      </div>
    </div>
  );
}

export default function HomePage() {
  const [market, setMarket] = useState<Market>("residential");

  const [modalOpen, setModalOpen] = useState(false);
  const [modalKind, setModalKind] = useState<"company" | "individual">("company");

  // ✅ Force html/body background to baby blue (kills any leftover dark wrapper)
  useEffect(() => {
    const prevHtml = document.documentElement.style.backgroundColor;
    const prevBody = document.body.style.backgroundColor;

    document.documentElement.style.backgroundColor = "#EAF3FF";
    document.body.style.backgroundColor = "#EAF3FF";

    return () => {
      document.documentElement.style.backgroundColor = prevHtml;
      document.body.style.backgroundColor = prevBody;
    };
  }, []);

  useEffect(() => {
    function onOpen(e: any) {
      const kind = e?.detail?.kind === "individual" ? "individual" : "company";
      setModalKind(kind);
      setModalOpen(true);
    }
    window.addEventListener("ambit:open-signup", onOpen as any);
    return () => window.removeEventListener("ambit:open-signup", onOpen as any);
  }, []);

  const heroSubtitle = useMemo(() => marketSub(market), [market]);

  return (
    <div className={BG}>
      <SignupModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        kind={modalKind}
        market={market}
      />

      {/* HERO (more whitespace like Malakye) */}
      <section className={`${CONTAINER} pt-20 pb-16`}>
        <div className="text-center">
          {/* ✅ Single-line headline (no forced line break) */}
          <h1 className="text-5xl font-black tracking-tight sm:text-6xl sm:whitespace-nowrap">
            Stop hunting. Start receiving.
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-lg text-black/70">
            Tailored for business growth.
          </p>

          {/* ONE CTA */}
          <div className="mt-10 flex items-center justify-center">
            <button
              onClick={() => {
                setModalKind("company");
                setModalOpen(true);
              }}
              className="group inline-flex w-full max-w-sm items-center justify-center rounded-full bg-[#5C74FF] px-8 py-4 text-base font-semibold text-white shadow-[0_18px_40px_rgba(92,116,255,0.25)] hover:bg-[#465DFF] sm:w-auto"
            >
              <ArrowBadge />
              Sign Up
            </button>
          </div>

          {/* Preview strip */}
          <div className="mt-14 overflow-hidden rounded-3xl border border-black/10 bg-white shadow-[0_22px_70px_rgba(0,0,0,0.10)]">
            <div className="flex items-center justify-between border-b border-black/10 px-6 py-4">
              <div className="text-sm font-semibold text-black/80">AMBIT</div>
              <div className="text-xs text-black/50">Preview</div>
            </div>

            <div className="p-7 sm:p-10">
              <div className="mb-6 inline-flex rounded-full border border-black/10 bg-white p-1">
                {MARKETS.map((m) => {
                  const active = m.key === market;
                  return (
                    <button
                      key={m.key}
                      type="button"
                      onClick={() => setMarket(m.key)}
                      className={[
                        "rounded-full px-5 py-2.5 text-sm font-semibold transition",
                        active
                          ? "bg-black text-white"
                          : "text-black/70 hover:text-black hover:bg-black/[0.04]",
                      ].join(" ")}
                    >
                      {m.label}
                    </button>
                  );
                })}
              </div>

              <div className="grid gap-7 lg:grid-cols-2">
                {/* Left */}
                <div className="rounded-3xl border border-black/10 bg-[#FAFAF7] p-6">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-semibold">Match opportunities</div>
                    <div className="text-xs text-black/50">Screenshot</div>
                  </div>
                  <div className="mt-4 rounded-2xl border border-black/10 bg-white p-8 text-sm text-black/55">
                    Drop your screenshot here:
                    <div className="mt-2 font-mono text-xs text-black/50">
                      /public/landing/matches-{market}.png
                    </div>
                  </div>
                </div>

                {/* Right */}
                <div className="rounded-3xl border border-black/10 bg-[#FAFAF7] p-6">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-semibold">Activity & momentum</div>
                    <div className="text-xs text-black/50">Screenshot</div>
                  </div>
                  <div className="mt-4 rounded-2xl border border-black/10 bg-white p-8 text-sm text-black/55">
                    Drop your screenshot here:
                    <div className="mt-2 font-mono text-xs text-black/50">
                      /public/landing/dashboard-{market}.png
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 text-sm text-black/60">{heroSubtitle}</div>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST (light, no dark bands) */}
      <section className={`${CONTAINER} pb-20`}>
        <div className="rounded-3xl border border-black/10 bg-white/70 backdrop-blur px-8 py-10 shadow-[0_22px_70px_rgba(0,0,0,0.08)]">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
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
              AMBIT is built for speed, clarity, and momentum—so you’re not guessing where to focus.
              See what’s relevant, understand it fast, and act with confidence.
              <div className="mt-6 flex flex-wrap gap-3">
                <LogoPill label="Companies" />
                <LogoPill label="Teams" />
                <LogoPill label="Operators" />
                <LogoPill label="Agencies" />
              </div>
            </div>
          </div>
        </div>

        {/* extra “length” like Malakye */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          {["Partner", "Trusted", "Network", "Verified", "Secure", "Fast"].map((x) => (
            <div
              key={x}
              className="h-10 w-24 rounded-full border border-black/10 bg-white shadow-sm"
              title={x}
            />
          ))}
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
          <div className="rounded-3xl bg-[#E8E2D7] p-10">
            <div className="text-2xl font-black">Your Expertise. Our Network.</div>
            <div className="mt-3 text-black/70">
              Stop searching and start selecting. Access curated positions that align your specific
              background with the sectors you actually care about.
            </div>
          </div>

          <div className="rounded-3xl bg-[#59C98B] p-10">
            <div className="text-2xl font-black text-black">Move With Purpose.</div>
            <div className="mt-3 text-black/80">
              Strategically aligning your business with the jobs in your chosen industry.
            </div>
          </div>

          <div className="rounded-3xl bg-[#5C74FF] p-10 text-white lg:col-span-1">
            <div className="text-2xl font-black">A Command Center for Your Company.</div>
            <div className="mt-3 text-white/85">
              Leave nothing to chance. Use precision match making to find your jobs and leverage
              simple summaries to analyze the competitive landscape—giving you the direct line to
              the decision-makers that matter.
            </div>
          </div>

          <div className="rounded-3xl bg-[#E8E2D7] p-10">
            <div className="text-2xl font-black">Visibility Without Guesswork.</div>
            <div className="mt-3 text-black/70">
              You deserve a seat at the table, not a spot in a hole. We’ve engineered the Ambit
              platform to prioritize transparency, ensuring your expertise is recognized and your
              status is clear at every stage of the process.
            </div>
          </div>
        </div>

        {/* extra “copy band” to lengthen like Malakye */}
        <div className="mt-14 rounded-3xl border border-black/10 bg-white px-8 py-10 shadow-[0_18px_60px_rgba(0,0,0,0.08)]">
          <div className="grid gap-10 lg:grid-cols-2">
            <div>
              <div className="text-xs font-semibold tracking-widest text-black/50">THE DIFFERENCE</div>
              <div className="mt-3 text-3xl font-black">A clean signal — not a noisy feed.</div>
            </div>
            <div className="text-black/70">
              AMBIT is designed to reduce uncertainty. Clear summaries, clear fit, clear next steps —
              so you can move quickly without guessing.
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className={`${CONTAINER} pb-24`}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-5xl font-black tracking-tight">Check out what they’re sayin’</h2>
            <p className="mt-4 max-w-2xl text-lg text-black/70">
              Real teams using AMBIT to stay organized and move faster.
            </p>
          </div>
          <Link
            href="/testimonials"
            className="text-sm font-semibold text-black/70 hover:text-black underline underline-offset-4 decoration-black/20 hover:decoration-black/40"
          >
            See more →
          </Link>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {[
            {
              name: "Sarah K.",
              role: "Janitorial • Florida",
              quote: "Setup was simple. The organization alone saved us hours every week.",
            },
            {
              name: "Mark T.",
              role: "Plumbing • California",
              quote: "It’s clean. It’s fast. We know what to look at first.",
            },
            {
              name: "Tanya W.",
              role: "Home Services • Colorado",
              quote: "Feels like we finally have a system instead of chaos.",
            },
            {
              name: "David C.",
              role: "Ops • Nevada",
              quote: "We stopped wasting time digging. The summaries are the win.",
            },
            {
              name: "Ariana M.",
              role: "Facilities • Arizona",
              quote: "It filters noise and highlights what matters. That’s the whole game.",
            },
            {
              name: "Jordan S.",
              role: "HVAC • Texas",
              quote: "Match quality improved quickly once we tightened our keywords.",
            },
          ].map((x) => (
            <div
              key={x.name}
              className="rounded-3xl border border-black/10 bg-white p-7 shadow-[0_12px_40px_rgba(0,0,0,0.06)]"
            >
              <div className="h-44 rounded-2xl bg-black/5" />
              <div className="mt-5 text-lg font-black">{x.name}</div>
              <div className="mt-1 text-sm text-black/60">{x.role}</div>
              <div className="mt-4 text-sm text-black/70">“{x.quote}”</div>
            </div>
          ))}
        </div>

        {/* Final CTA (light, no dark band) */}
        <div className="mt-16 rounded-3xl border border-black/10 bg-white/80 backdrop-blur px-10 py-14 text-center shadow-[0_22px_70px_rgba(0,0,0,0.08)]">
          <div className="text-4xl font-black">Plug into AMBIT to keep growing your business</div>
          <div className="mt-4 text-lg text-black/70">
            Join the platform where who you are is just as important as what you do.
          </div>

          <button
            onClick={() => {
              setModalKind("company");
              setModalOpen(true);
            }}
            className="mt-10 inline-flex items-center justify-center rounded-full bg-[#5C74FF] px-10 py-4 text-base font-semibold text-white shadow-[0_18px_40px_rgba(92,116,255,0.25)] hover:bg-[#465DFF]"
          >
            <ArrowBadge />
            Sign Up
          </button>

          <div className="mt-12 flex flex-wrap items-center justify-center gap-10 text-sm font-semibold text-black/55">
            <Link href="/" className="hover:text-black">Home</Link>
            <Link href="/about" className="hover:text-black">About Us</Link>
            <Link href="/testimonials" className="hover:text-black">Testimonials</Link>
            <Link href="/privacy" className="hover:text-black">Privacy</Link>
            <Link href="/terms" className="hover:text-black">Terms</Link>
            <Link href="/login" className="hover:text-black">Log In</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
