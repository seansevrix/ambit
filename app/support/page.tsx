import Link from "next/link";

export const metadata = {
  title: "Support | AMBIT",
  description:
    "Support, FAQs, and information about AMBIT and Sevrix Government Contracting.",
};

export default function SupportPage() {
  return (
    <main className="min-h-screen bg-[#050B1A] text-white">
      <div className="mx-auto w-full max-w-5xl px-6 py-14">
        <div className="mb-8">
          <h1 className="text-4xl font-semibold tracking-tight">Support</h1>
          <p className="mt-3 text-white/70">
            Need help, have a question, or want to understand how AMBIT works?
            You’re in the right place.
          </p>
        </div>

        <section className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-sm">
          <h2 className="text-xl font-semibold">What is AMBIT?</h2>
          <p className="mt-3 text-white/70 leading-relaxed">
            AMBIT helps contractors find and triage public-sector opportunities
            faster. We pull opportunities from public sources, score potential
            fit based on your profile, and present summaries and next-step
            guidance so you spend less time searching and more time bidding.
          </p>

          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-white/10 bg-black/20 p-4">
              <div className="text-sm font-semibold">Public sources</div>
              <div className="mt-2 text-sm text-white/70">
                We surface opportunities from public listings and feeds.
              </div>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/20 p-4">
              <div className="text-sm font-semibold">Match scoring</div>
              <div className="mt-2 text-sm text-white/70">
                Your keywords, location, and NAICS guide what appears.
              </div>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/20 p-4">
              <div className="text-sm font-semibold">Actionable summaries</div>
              <div className="mt-2 text-sm text-white/70">
                Fast context to decide bid/no-bid without the time sink.
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-xl font-semibold">Why you can trust AMBIT</h2>
            <ul className="mt-3 space-y-3 text-white/70 leading-relaxed">
              <li>
                <span className="text-white font-medium">Built by operators:</span>{" "}
                AMBIT is backed by Sevrix Government Contracting—people who live
                in procurement workflows daily.
              </li>
              <li>
                <span className="text-white font-medium">Your data stays yours:</span>{" "}
                We use your profile to provide the service; we don’t sell your
                private profile data as a “lead list.”
              </li>
              <li>
                <span className="text-white font-medium">Security-minded:</span>{" "}
                Sensitive billing is handled by Stripe. We minimize what we store
                and use industry-standard hosting and security practices.
              </li>
              <li>
                <span className="text-white font-medium">Transparent:</span>{" "}
                Always verify details in the official posting. We provide tools
                to move faster—not guarantees.
              </li>
            </ul>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-xl font-semibold">FAQ</h2>

            <div className="mt-4 space-y-4">
              <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                <div className="font-medium">Is AMBIT a government website?</div>
                <div className="mt-2 text-sm text-white/70">
                  No. AMBIT is a private software product and is not affiliated
                  with any government agency.
                </div>
              </div>

              <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                <div className="font-medium">Do you guarantee contract awards?</div>
                <div className="mt-2 text-sm text-white/70">
                  No. We help you discover and evaluate opportunities faster, but
                  award decisions and outcomes are outside our control.
                </div>
              </div>

              <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                <div className="font-medium">Why might I see a mismatch?</div>
                <div className="mt-2 text-sm text-white/70">
                  Opportunities can change quickly (amendments, dates, scope).
                  Always verify the official posting and documents.
                </div>
              </div>

              <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                <div className="font-medium">How do I get help?</div>
                <div className="mt-2 text-sm text-white/70">
                  Use our <Link className="underline" href="/contact">Contact</Link>{" "}
                  page or email support directly.
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-xl font-semibold">Helpful links</h2>
          <div className="mt-3 flex flex-wrap gap-3 text-sm">
            <Link className="rounded-full border border-white/10 bg-black/20 px-4 py-2 hover:bg-black/30" href="/privacy">
              Privacy
            </Link>
            <Link className="rounded-full border border-white/10 bg-black/20 px-4 py-2 hover:bg-black/30" href="/terms">
              Terms
            </Link>
            <Link className="rounded-full border border-white/10 bg-black/20 px-4 py-2 hover:bg-black/30" href="/contact">
              Contact
            </Link>
          </div>
          <p className="mt-4 text-xs text-white/50 leading-relaxed">
            Important: AMBIT aggregates and summarizes publicly available information.
            You are responsible for verifying all details and compliance requirements
            in the official solicitation posting and documents.
          </p>
        </section>
      </div>
    </main>
  );
}
