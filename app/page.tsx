"use client";

import { useEffect, useMemo, useState } from "react";
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

const BG =
  "min-h-screen bg-[#F7F5F2] text-black [background-image:linear-gradient(135deg,rgba(0,0,0,0.06)_1px,transparent_1px),linear-gradient(45deg,rgba(0,0,0,0.06)_1px,transparent_1px)] [background-size:140px_140px]";

const CONTAINER = "mx-auto max-w-[1180px] px-6 lg:px-10";

function ArrowBadge({ dark }: { dark?: boolean }) {
  return (
    <span
      className={[
        "mr-3 inline-flex h-9 w-9 items-center justify-center rounded-full border-2",
        dark ? "border-white" : "border-black",
      ].join(" ")}
    >
      <span className="text-lg font-black">→</span>
    </span>
  );
}

export default function HomePage() {
  const [market, setMarket] = useState<Market>("residential");

  const [modalOpen, setModalOpen] = useState(false);
  const [modalKind, setModalKind] = useState<"company" | "individual">("company");

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

      {/* HERO (Malakye-style: centered, huge type, ONE CTA) */}
      <section className={`${CONTAINER} pt-14 pb-10`}>
        <div className="text-center">
          <h1 className="text-5xl font-black tracking-tight sm:text-6xl">
            Stop hunting.
            <br />
            Start receiving.
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-lg text-black/70">
            Tailored for business growth.
          </p>

          <div className="mt-8 flex items-center justify-center">
            <button
              onClick={() => {
                setModalKind("company");
                setModalOpen(true);
              }}
              className="group inline-flex w-full max-w-sm items-center justify-center rounded-full bg-[#5C74FF] px-7 py-4 text-base font-semibold text-white shadow-[0_18px_40px_rgba(92,116,255,0.25)] hover:bg-[#465DFF] sm:w-auto"
            >
              <span className="mr-3 inline-flex h-9 w-9 items-center justify-center rounded-full border-2 border-white">
                <span className="text-lg font-black">→</span>
              </span>
              Sign Up
            </button>
          </div>

          {/* Embedded preview strip */}
          <div className="mt-10 overflow-hidden rounded-3xl border border-black/10 bg-white shadow-[0_22px_70px_rgba(0,0,0,0.10)]">
            <div className="flex items-center justify-between border-b border-black/10 px-5 py-3">
              <div className="text-sm font-semibold text-black/80">AMBIT</div>
              <div className="text-xs text-black/50">Preview</div>
            </div>

            <div className="p-6">
              <div className="mb-4 inline-flex rounded-full border border-black/10 bg-white p-1">
                {MARKETS.map((m) => {
                  const active = m.key === market;
                  return (
                    <button
                      key={m.key}
                      type="button"
                      onClick={() => setMarket(m.key)}
                      className={[
                        "rounded-full px-4 py-2 text-sm font-semibold transition",
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

              <div className="grid gap-6 lg:grid-cols-2">
                {/* Left: matches screenshot placeholder */}
                <div className="rounded-3xl border border-black/10 bg-[#FAFAF7] p-5">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-semibold">Match opportunities</div>
                    <div className="text-xs text-black/50">Screenshot</div>
                  </div>
                  <div className="mt-3 rounded-2xl border border-black/10 bg-white p-6 text-sm text-black/55">
                    Drop a screenshot here:
                    <div className="mt-2 font-mono text-xs text-black/50">
                      /public/landing/matches-{market}.png
                    </div>
                  </div>
                </div>

                {/* Right: dashboard screenshot placeholder */}
                <div className="rounded-3xl border border-black/10 bg-[#FAFAF7] p-5">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-semibold">Activity & momentum</div>
                    <div className="text-xs text-black/50">Screenshot</div>
                  </div>
                  <div className="mt-3 rounded-2xl border border-black/10 bg-white p-6 text-sm text-black/55">
                    Drop a screenshot here:
                    <div className="mt-2 font-mono text-xs text-black/50">
                      /public/landing/dashboard-{market}.png
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 text-sm text-black/60">{heroSubtitle}</div>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST (kept, but no +301077 section, no trade row) */}
      <section className={`${CONTAINER} pb-14`}>
        <div className="rounded-3xl bg-[#2E2E2E] px-8 py-10 text-white shadow-[0_30px_90px_rgba(0,0,0,0.18)]">
          <div className="grid gap-8 lg:grid-cols-2">
            <div>
              <h2 className="text-3xl font-black">
                Trusted by the most ambitious operators.
              </h2>

              <div className="mt-6 grid gap-6 sm:grid-cols-2">
                <div>
                  <div className="text-4xl font-black text-[#34D399]">3</div>
                  <div className="mt-1 text-sm text-white/80">Markets covered</div>
                </div>
                <div>
                  <div className="text-4xl font-black text-[#34D399]">Daily</div>
                  <div className="mt-1 text-sm text-white/80">Updated opportunities</div>
                </div>
              </div>
            </div>

            <div className="text-white/70">
              AMBIT is built for speed, clarity, and momentum—so you’re not guessing where to focus.
              See what’s relevant, understand it fast, and act with confidence.
            </div>
          </div>
        </div>
      </section>

      {/* FEATURE BLOCKS (kept) */}
      <section className={`${CONTAINER} pb-14`}>
        <h2 className="text-5xl font-black tracking-tight">
          Ambit makes finding jobs effortless.
          <br />
          Stop hunting, start receiving.
        </h2>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl bg-[#E8E2D7] p-8">
            <div className="text-2xl font-black">Your Expertise. Our Network.</div>
            <div className="mt-3 text-black/70">
              Stop searching and start selecting. Access curated positions that align your specific
              background with the sectors you actually care about.
            </div>
          </div>

          <div className="rounded-3xl bg-[#59C98B] p-8">
            <div className="text-2xl font-black text-black">Move With Purpose.</div>
            <div className="mt-3 text-black/80">
              Strategically aligning your business with the jobs in your chosen industry.
            </div>
          </div>

          <div className="rounded-3xl bg-[#5C74FF] p-8 text-white lg:col-span-1">
            <div className="text-2xl font-black">A Command Center for Your Company.</div>
            <div className="mt-3 text-white/85">
              Leave nothing to chance. Use precision match making to find your jobs and leverage
              simple summaries to analyze the competitive landscape—giving you the direct line to
              the decision-makers that matter.
            </div>
          </div>

          <div className="rounded-3xl bg-[#E8E2D7] p-8">
            <div className="text-2xl font-black">Visibility Without Guesswork.</div>
            <div className="mt-3 text-black/70">
              You deserve a seat at the table, not a spot in a hole. We’ve engineered the Ambit
              platform to prioritize transparency, ensuring your expertise is recognized and your
              status is clear at every stage of the process.
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS (kept) */}
      <section className={`${CONTAINER} pb-20`}>
        <h2 className="text-5xl font-black tracking-tight">Check out what they’re sayin’</h2>

        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {[
            { name: "Sarah K.", role: "Janitorial • Florida" },
            { name: "Mark T.", role: "Plumbing • California" },
            { name: "Tanya W.", role: "Home Services • Colorado" },
          ].map((x) => (
            <div key={x.name} className="rounded-3xl border border-black/10 bg-white p-6">
              <div className="h-44 rounded-2xl bg-black/5" />
              <div className="mt-4 text-lg font-black">{x.name}</div>
              <div className="mt-1 text-sm text-black/60">{x.role}</div>
            </div>
          ))}
        </div>

        {/* Final CTA band (kept, but removed +301077 row + removed pricing section earlier) */}
        <div className="mt-16 rounded-3xl bg-[#2E2E2E] px-8 py-12 text-center text-white shadow-[0_30px_90px_rgba(0,0,0,0.18)]">
          <div className="text-4xl font-black">
            Plug into AMBIT to keep growing your business
          </div>
          <div className="mt-3 text-white/70">
            Join the platform where who you are is just as important as what you do.
          </div>

          <button
            onClick={() => {
              setModalKind("company");
              setModalOpen(true);
            }}
            className="mt-8 inline-flex items-center justify-center rounded-full bg-[#5C74FF] px-8 py-4 text-base font-semibold text-white shadow-[0_18px_40px_rgba(92,116,255,0.25)] hover:bg-[#465DFF]"
          >
            <ArrowBadge dark />
            Sign Up
          </button>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-8 text-sm font-semibold text-white/70">
            <span>Networking</span>
            <span>Jobs</span>
            <span>Companies</span>
            <span>About Us</span>
            <span>Log In</span>
            <span>Sign Up</span>
          </div>
        </div>
      </section>
    </div>
  );
}
