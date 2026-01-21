import Link from "next/link";
import ConciergeLeadCapture from "./components/ConciergeLeadCapture";

const LINK = "text-sm font-semibold text-white/75 hover:text-white transition";

export default function HomePage() {
  return (
    <div className="space-y-8 overflow-x-hidden sm:space-y-12">
      {/* HERO + GLASS PANEL */}
      <section className="relative overflow-hidden rounded-2xl border border-white/10 sm:rounded-3xl">
        <div className="absolute inset-0 bg-[radial-gradient(1200px_600px_at_50%_-10%,rgba(110,168,255,0.35),transparent_60%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#08122B] via-[#070F22] to-[#060A16]" />

        <div className="relative px-4 py-10 sm:px-10 sm:py-14">
          <div className="mx-auto max-w-5xl text-center">
            <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-5xl">
              Get more local contracts.
            </h1>

            <p className="mt-3 text-sm text-white/70 sm:text-base">
              Qualified opportunities sent to you — not your competitors.
            </p>

            <p className="mt-3 text-xs text-white/65 sm:text-sm">
              <span className="font-semibold text-white/85">7-day free trial</span>
              <span className="mx-2 text-white/35">•</span>
              No credit card
              <span className="mx-2 text-white/35">•</span>
              Trusted by 200+ Clients
            </p>

            <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href="/live-opportunities" className={LINK}>
                View Live Leads →
              </Link>
            </div>
          </div>

          <div id="preview" className="mx-auto mt-8 max-w-6xl sm:mt-10">
            <ConciergeLeadCapture />
          </div>
        </div>
      </section>
    </div>
  );
}
