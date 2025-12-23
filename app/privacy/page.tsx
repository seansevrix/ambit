import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <section className="rounded-3xl border border-white/10 bg-white/5 p-10">
        <h1 className="text-3xl font-semibold tracking-tight text-white">Privacy Policy</h1>
        <p className="mt-2 text-sm text-white/65">Last updated: Dec 22, 2025</p>
        <p className="mt-4 text-sm text-white/70">
          This Privacy Policy explains how AMBIT collects, uses, and shares information when you use
          our website and services (the “Service”).
        </p>
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/5 p-10">
        <div className="space-y-6 text-sm leading-relaxed text-white/75">
          <div>
            <h2 className="text-base font-semibold text-white">1) Information we collect</h2>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>
                <span className="font-semibold text-white">Account info:</span> company name, email,
                service area, NAICS, keywords, and similar profile details you submit.
              </li>
              <li>
                <span className="font-semibold text-white">Usage data:</span> basic analytics such
                as pages viewed, feature usage, and performance logs.
              </li>
              <li>
                <span className="font-semibold text-white">Payment info:</span> processed by our
                payment provider (e.g., Stripe). We do not store full card details.
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-base font-semibold text-white">2) How we use information</h2>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>Provide and improve the Service (matching, scoring, summaries, dashboards).</li>
              <li>Send product emails such as digests, alerts, and account notices.</li>
              <li>Billing, subscriptions, and fraud prevention.</li>
              <li>Support and customer service.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-base font-semibold text-white">3) How we share information</h2>
            <p className="mt-2">
              We do not sell your personal information. We may share information with service
              providers (hosting, analytics, email delivery, payment processing) to run the Service,
              and with legal authorities if required by law.
            </p>
          </div>

          <div>
            <h2 className="text-base font-semibold text-white">4) Your choices</h2>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>You can cancel your subscription anytime.</li>
              <li>
                You can request deletion of your account by contacting support (subject to legal
                and billing record requirements).
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-base font-semibold text-white">5) Contact</h2>
            <p className="mt-2">
              Privacy questions? Visit{" "}
              <Link className="underline" href="/support">
                Support
              </Link>{" "}
              or email your support address.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
