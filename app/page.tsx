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

export default function HomePage() {
  const [market, setMarket] = useState<Market>("residential");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalKind, setModalKind] = useState<"company" | "individual">("company");

  // ✅ HARD FORCE: no dark background anywhere — html + body + a fixed baby-blue layer
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

  // Listen for nav "Sign Up" button (SiteNav dispatches this)
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
    <div className="relative min-h-screen text-black">
      {/* ✅ Full-bleed baby-blue base (covers EVERYTHING behind) */}
      <div className="pointer-events-none fixed inset-0 -z-50 bg-[#EAF3FF]" />

      {/* very subtle pattern (still light) */}
      <div className="pointer-events-none fixed inset-0 -z-40 opacity-[0.10] [background-image:linear-gradient(135deg,rgba(0,0,0,0.10)_1px,transparent_1px),linear-gradient(45deg,rgba(0,0,0,0.10)_1px,transparent_1px)] [background-size:180px_180px]" />

      {/* soft baby-blue glow (NOT dark) */}
      <div className="pointer-events-none fixed inset-0 -z-40 bg-[radial-gradient(900px_600px_at_50%_0%,rgba(92,116,255,0.16),transparent_62%)]" />

      <SignupModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        kind={modalKind}
        market={market}
      />

      {/* HERO (light panel like Malakye) */}
      <section className={`${CONTAINER} pt-16 pb-16`}>
        <div className="rounded-[44px] border border-black/10 bg-[#F7F5F2]/90 shadow-[0_24px_70px_rgba(0,0,0,0.10)] backdrop-blur px-8 py-14 sm:px-14">
          <div className="text-center">
            <h1 className="text-5xl font-black tracking-tight sm:text-6xl sm:whitespace-nowrap">
              Stop hunting. Start receiving.
            </h1>

            <p className="mx-auto mt-5 max-w-2xl text-lg text-black/65">
              Tailored for business growth.
            </p>

            <div className="mt-10 flex items-center justify-center">
              <button
                onClick={() => {
                  setModalKind("company");
                  setModalOpen(true);
                }}
                className="inline-flex items-center justify-center rounded-full bg-[#5C74FF] px-10 py-4 text-base font-semibold text-white shadow-[0_18px_40px_rgba(92,116,255,0.25)] hover:bg-[#465DFF] transition"
              >
                <ArrowBadge />
                Sign Up
              </button>
            </div>

            {/* Preview strip (still light) */}
            <div className="mt-12 overflow-hidden rounded-3xl border border-black/10 bg-white shadow-[0_18px_55px_rgba(0,0,0,0.10)]">
              <div className="flex items-center justify-between border-b border-black/10 px-6 py-4">
                <div className="text-sm font-semibold text-black/80">AMBIT</div>
                <div className="text-xs text-black/45">Preview</div>
              </div>

              <div className="p-7 sm:p-10">
                {/* market toggle */}
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
                  <div className="rounded-3xl border border-black/10 bg-[#FAFAF7] p-6">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-semibold">Match opportunities</div>
                      <div className="text-xs text-black/45">Screenshot</div>
                    </div>
                    <div className="mt-4 rounded-2xl border border-black/10 bg-white p-8 text-sm text-black/55">
                      Drop your screenshot here:
                      <div className="mt-2 font-mono text-xs text-black/45">
                        /public/landing/matches-{market}.png
                      </div>
                    </div>
                  </div>

                  <div className="rounded-3xl border border-black/10 bg-[#FAFAF7] p-6">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-semibold">Activity &amp; momentum</div>
                      <div className="text-xs text-black/45">Screenshot</div>
                    </div>
                    <div className="mt-4 rounded-2xl border border-black/10 bg-white p-8 text-sm text-black/55">
                      Drop your screenshot here:
                      <div className="mt-2 font-mono text-xs text-black/45">
                        /public/landing/dashboard-{market}.png
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 text-sm text-black/60">{heroSubtitle}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST (light — no dark bars) */}
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
              AMBIT is built for speed, clarity, and momentum—so you’re not guessing where to focus.
              See what’s relevant, understand it fast, and act with confidence.
            </div>
          </div>
        </div>
      </section>

      {/* FEATURE BLOCKS (no dark blocks) */}
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
              Stop searching and start selecting. Access curated positions that align your specific
              background with the sectors you actually care about.
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
              Leave nothing to chance. Use precision match making to find your jobs and leverage
              simple summaries to analyze the competitive landscape—giving you the direct line to
              the decision-makers that matter.
            </div>
          </div>

          <div className="rounded-3xl bg-[#E8E2D7] p-10 shadow-[0_14px_40px_rgba(0,0,0,0.06)]">
            <div className="text-2xl font-black">Visibility Without Guesswork.</div>
            <div className="mt-3 text-black/70">
              You deserve a seat at the table. We’ve engineered the Ambit platform to prioritize
              transparency—so your expertise is recognized and your status is clear at every stage
              of the process.
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS (light) */}
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
            { name: "Sarah K.", role: "Janitorial • Florida", quote: "Setup was simple. The organization alone saved us hours every week." },
            { name: "Mark T.", role: "Plumbing • California", quote: "It’s clean. It’s fast. We know what to look at first." },
            { name: "Tanya W.", role: "Home Services • Colorado", quote: "Feels like we finally have a system instead of chaos." },
          ].map((x) => (
            <div key={x.name} className="rounded-3xl border border-black/10 bg-white p-7 shadow-[0_12px_40px_rgba(0,0,0,0.06)]">
              <div className="h-44 rounded-2xl bg-black/5" />
              <div className="mt-5 text-lg font-black">{x.name}</div>
              <div className="mt-1 text-sm text-black/60">{x.role}</div>
              <div className="mt-4 text-sm text-black/70">“{x.quote}”</div>
            </div>
          ))}
        </div>

        {/* FINAL CTA (still light) */}
        <div className="mt-16 rounded-3xl border border-black/10 bg-white/85 backdrop-blur px-10 py-14 text-center shadow-[0_18px_55px_rgba(0,0,0,0.08)]">
          <div className="text-4xl font-black">Plug into AMBIT to keep growing your business</div>
          <div className="mt-4 text-lg text-black/70">
            Join the platform where who you are is just as important as what you do.
          </div>

          <button
            onClick={() => {
              setModalKind("company");
              setModalOpen(true);
            }}
            className="mt-10 inline-flex items-center justify-center rounded-full bg-[#5C74FF] px-10 py-4 text-base font-semibold text-white shadow-[0_18px_40px_rgba(92,116,255,0.25)] hover:bg-[#465DFF] transition"
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
