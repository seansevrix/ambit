import Link from "next/link";

export default function PrivacyPage() {
  return (
    <main className="min-h-[calc(100vh-80px)] px-4 py-16">
      <div className="mx-auto w-full max-w-4xl">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur md:p-10">
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
            Privacy Policy
          </h1>
          <p className="mt-2 text-sm text-white/50">Last updated: Dec 29, 2025</p>

          <p className="mt-6 text-white/70">
            This Privacy Policy explains how AMBIT collects, uses, and shares
            information when you use our website and services (the “Service”).
          </p>

          <section className="mt-8 rounded-2xl border border-white/10 bg-black/20 p-6">
            <h2 className="text-lg font-semibold">1) Information we collect</h2>
            <ul className="mt-3 space-y-2 text-sm text-white/70">
              <li>
                • <span className="text-white/80">Account/profile info</span>:
                company name, email, service area, keywords, NAICS and related
                fields you submit.
              </li>
              <li>
                • <span className="text-white/80">Usage data</span>: basic logs
                and analytics (e.g., pages viewed, feature usage, performance).
              </li>
              <li>
                • <span className="text-white/80">Billing info</span>: handled by
                our payment processor (e.g., Stripe). AMBIT does not store full
                card numbers.
              </li>
            </ul>
          </section>

          <section className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-6">
            <h2 className="text-lg font-semibold">2) How we use information</h2>
            <ul className="mt-3 space-y-2 text-sm text-white/70">
              <li>• Provide and improve the Service (matching, dashboards).</li>
              <li>• Operate billing, subscriptions, and fraud prevention.</li>
              <li>• Respond to support and customer requests.</li>
              <li>• Communicate product updates and important notices.</li>
            </ul>
          </section>

          <section className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-6">
            <h2 className="text-lg font-semibold">3) How we share information</h2>
            <p className="mt-3 text-sm text-white/70">
              We do not sell your personal information. We may share information
              with vendors who help us operate the Service (hosting, analytics,
              email delivery, payment processing), and with legal authorities if
              required by law.
            </p>
          </section>

          <section className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-6">
            <h2 className="text-lg font-semibold">4) Data retention</h2>
            <p className="mt-3 text-sm text-white/70">
              We retain information as long as needed to provide the Service and
              comply with legal, tax, and accounting obligations. You may request
              deletion of your account by contacting us (some records may be
              retained where legally required).
            </p>
          </section>

          <section className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-6">
            <h2 className="text-lg font-semibold">5) Security</h2>
            <p className="mt-3 text-sm text-white/70">
              We use reasonable administrative, technical, and physical safeguards
              designed to protect information. No method of transmission or storage
              is 100% secure.
            </p>
          </section>

          <section className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-6">
            <h2 className="text-lg font-semibold">6) Contact</h2>
            <p className="mt-3 text-sm text-white/70">
              Privacy questions? Visit{" "}
              <Link className="underline hover:text-white" href="/support">
                Support
              </Link>{" "}
              or email{" "}
              <a className="underline hover:text-white" href="mailto:sean.s@sevrixgov.com">
                sean.s@sevrixgov.com
              </a>
              .
            </p>
          </section>

          <p className="mt-8 text-xs text-white/50">
            This policy is informational and not legal advice.
          </p>
        </div>
      </div>
    </main>
  );
}
