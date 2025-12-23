import Link from "next/link";

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <section className="rounded-3xl border border-white/10 bg-white/5 p-10">
        <h1 className="text-3xl font-semibold tracking-tight text-white">Terms of Service</h1>
        <p className="mt-2 text-sm text-white/65">Last updated: Dec 22, 2025</p>
        <p className="mt-4 text-sm text-white/70">
          These Terms govern your use of AMBIT. By accessing or using the Service, you agree to
          these Terms.
        </p>
        <p className="mt-3 text-xs text-white/55">
          MVP-friendly terms (not legal advice).
        </p>
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/5 p-10">
        <div className="space-y-6 text-sm leading-relaxed text-white/75">
          <div>
            <h2 className="text-base font-semibold text-white">1) What AMBIT does</h2>
            <p className="mt-2">
              AMBIT helps businesses discover and prioritize public-sector opportunities by
              collecting listings, generating summaries, and providing match/scoring signals.
            </p>
          </div>

          <div>
            <h2 className="text-base font-semibold text-white">2) No guarantee + verify sources</h2>
            <p className="mt-2">
              AMBIT is an informational tool. We do not guarantee accuracy or completeness. You are
              responsible for verifying requirements, deadlines, and attachments on the official
              solicitation source.
            </p>
          </div>

          <div>
            <h2 className="text-base font-semibold text-white">3) Billing and cancellation</h2>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>Subscriptions renew automatically until cancelled.</li>
              <li>You can cancel anytime; access typically continues until period end.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-base font-semibold text-white">4) Acceptable use</h2>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>Don’t bypass paywalls or access controls.</li>
              <li>Don’t abuse, reverse engineer, or disrupt the Service.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-base font-semibold text-white">5) Limitation of liability</h2>
            <p className="mt-2">
              To the maximum extent permitted by law, AMBIT is not liable for indirect or
              consequential damages or loss of business opportunities.
            </p>
          </div>

          <div>
            <h2 className="text-base font-semibold text-white">6) Contact</h2>
            <p className="mt-2">
              Questions? Use{" "}
              <Link className="underline" href="/contact">
                Contact
              </Link>{" "}
              or{" "}
              <Link className="underline" href="/support">
                Support
              </Link>
              .
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
