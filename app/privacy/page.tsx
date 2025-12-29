import Link from "next/link";

export const metadata = {
  title: "Privacy | AMBIT",
  description: "AMBIT privacy policy.",
};

export default function PrivacyPage() {
  const updated = "December 29, 2025";

  return (
    <main className="min-h-screen bg-[#050B1A] text-white">
      <div className="mx-auto w-full max-w-4xl px-6 py-14">
        <h1 className="text-4xl font-semibold tracking-tight">Privacy Policy</h1>
        <p className="mt-3 text-white/70">Last updated: {updated}</p>

        <div className="mt-8 space-y-8 rounded-2xl border border-white/10 bg-white/5 p-6 leading-relaxed">
          <section>
            <p className="text-white/70">
              This Privacy Policy explains how AMBIT (“AMBIT”, “we”, “us”, “our”)
              collects, uses, discloses, and protects information when you use our
              website and services (the “Service”).
            </p>
            <p className="mt-3 text-white/70">
              AMBIT is a private software product and is not affiliated with any
              government entity. Our Service may reference or summarize publicly
              available information from third-party sources.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">Information We Collect</h2>
            <ul className="mt-3 list-disc space-y-2 pl-6 text-white/70">
              <li>
                <span className="text-white/80 font-medium">Account/Profile Data:</span>{" "}
                company name, email address, service area/location, keywords, NAICS,
                and other information you submit.
              </li>
              <li>
                <span className="text-white/80 font-medium">Usage Data:</span>{" "}
                interactions with the Service (pages viewed, clicks, feature usage),
                approximate location derived from IP, and diagnostic logs.
              </li>
              <li>
                <span className="text-white/80 font-medium">Device/Technical Data:</span>{" "}
                browser type, device identifiers, and similar telemetry.
              </li>
              <li>
                <span className="text-white/80 font-medium">Payments:</span>{" "}
                billing and payment processing is handled by{" "}
                <span className="text-white/80 font-medium">Stripe</span>. We do not
                store full card numbers. We may store Stripe customer/subscription IDs
                and status to manage access.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold">How We Use Information</h2>
            <ul className="mt-3 list-disc space-y-2 pl-6 text-white/70">
              <li>Provide, operate, and improve the Service.</li>
              <li>Create and manage accounts, subscriptions, and access controls.</li>
              <li>Personalize matches and results based on your profile.</li>
              <li>Communicate with you about support, service updates, and security.</li>
              <li>Prevent fraud, abuse, and unauthorized access.</li>
              <li>Comply with legal obligations and enforce our Terms.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold">How We Share Information</h2>
            <p className="mt-3 text-white/70">
              We may share information with:
            </p>
            <ul className="mt-3 list-disc space-y-2 pl-6 text-white/70">
              <li>
                <span className="text-white/80 font-medium">Service Providers</span>{" "}
                that help run the Service (hosting, databases, analytics, logs, and
                payment processing like Stripe).
              </li>
              <li>
                <span className="text-white/80 font-medium">Legal/Compliance</span>{" "}
                when required by law, subpoena, or to protect rights, safety, and
                security.
              </li>
              <li>
                <span className="text-white/80 font-medium">Business Transfers</span>{" "}
                if we undergo a merger, acquisition, financing, or sale of assets.
              </li>
            </ul>
            <p className="mt-3 text-white/70">
              We do not sell your profile data as a marketing lead list.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">Data Retention</h2>
            <p className="mt-3 text-white/70">
              We retain information for as long as needed to provide the Service,
              comply with obligations, resolve disputes, and enforce agreements. You
              may request deletion (subject to legal and operational requirements).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">Security</h2>
            <p className="mt-3 text-white/70">
              We use reasonable administrative, technical, and organizational measures
              to protect data. However, no system is 100% secure; you use the Service
              at your own risk.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">Your Choices</h2>
            <ul className="mt-3 list-disc space-y-2 pl-6 text-white/70">
              <li>You can update your profile details in the Service.</li>
              <li>
                You can request access, correction, or deletion by contacting us.
              </li>
              <li>
                You can manage cookies/trackers via browser controls (where applicable).
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold">Children’s Privacy</h2>
            <p className="mt-3 text-white/70">
              The Service is not intended for children under 13, and we do not knowingly
              collect personal information from children.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">Third-Party Links & Sources</h2>
            <p className="mt-3 text-white/70">
              The Service may link to or summarize third-party sites and public postings.
              We are not responsible for third-party privacy practices or content. Always
              review the official posting and its terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">Changes to this Policy</h2>
            <p className="mt-3 text-white/70">
              We may update this Privacy Policy from time to time. Continued use of the
              Service after changes means you accept the updated policy.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">Contact</h2>
            <p className="mt-3 text-white/70">
              Questions? Contact us via{" "}
              <Link className="underline" href="/contact">
                Contact
              </Link>
              .
            </p>
            <p className="mt-2 text-xs text-white/50">
              Emails are handled by AMBIT’s parent company, Sevrix Government Contracting.
            </p>
          </section>
        </div>

        <div className="mt-8 text-sm text-white/60">
          Also review our{" "}
          <Link className="underline" href="/terms">
            Terms
          </Link>
          .
        </div>
      </div>
    </main>
  );
}
