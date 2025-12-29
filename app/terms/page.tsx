import Link from "next/link";

export default function TermsPage() {
  return (
    <main className="min-h-[calc(100vh-80px)] px-4 py-16">
      <div className="mx-auto w-full max-w-4xl">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur md:p-10">
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
            Terms of Service
          </h1>
          <p className="mt-2 text-sm text-white/50">Last updated: Dec 29, 2025</p>

          <p className="mt-6 text-white/70">
            These Terms govern your use of AMBIT. By accessing or using the
            Service, you agree to these Terms.
          </p>

          <section className="mt-8 rounded-2xl border border-white/10 bg-black/20 p-6">
            <h2 className="text-lg font-semibold">1) The Service</h2>
            <p className="mt-3 text-sm text-white/70">
              AMBIT helps businesses discover and prioritize public-sector
              opportunities using publicly available information and third-party
              sources. AMBIT is an informational tool and is not legal advice.
            </p>
          </section>

          <section className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-6">
            <h2 className="text-lg font-semibold">2) No guarantee + verification</h2>
            <p className="mt-3 text-sm text-white/70">
              We do not guarantee accuracy, completeness, or timeliness of any
              listing, summary, match score, or estimate. You are responsible for
              verifying requirements, deadlines, and attachments on the official
              solicitation source before acting.
            </p>
          </section>

          <section className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-6">
            <h2 className="text-lg font-semibold">3) Acceptable use</h2>
            <ul className="mt-3 space-y-2 text-sm text-white/70">
              <li>• Don’t bypass paywalls or access controls.</li>
              <li>• Don’t scrape, reverse engineer, or disrupt the Service.</li>
              <li>• Don’t use the Service for unlawful or abusive activity.</li>
            </ul>
          </section>

          <section className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-6">
            <h2 className="text-lg font-semibold">4) Billing, cancellation, refunds</h2>
            <ul className="mt-3 space-y-2 text-sm text-white/70">
              <li>• Subscriptions renew automatically until canceled.</li>
              <li>• You can cancel anytime; access continues through the paid period.</li>
              <li>
                • Unless required by law, payments are non-refundable (especially
                for partial periods).
              </li>
            </ul>
          </section>

          <section className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-6">
            <h2 className="text-lg font-semibold">5) Intellectual property</h2>
            <p className="mt-3 text-sm text-white/70">
              The Service, including its design, software, and content (excluding
              third-party/public listings), is owned by AMBIT and/or its licensors.
              You receive a limited, non-exclusive, non-transferable license to use
              the Service for your internal business purposes.
            </p>
          </section>

          <section className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-6">
            <h2 className="text-lg font-semibold">6) Disclaimer of warranties</h2>
            <p className="mt-3 text-sm text-white/70">
              THE SERVICE IS PROVIDED “AS IS” AND “AS AVAILABLE” WITHOUT WARRANTIES
              OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING IMPLIED WARRANTIES OF
              MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND
              NON-INFRINGEMENT.
            </p>
          </section>

          <section className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-6">
            <h2 className="text-lg font-semibold">7) Limitation of liability</h2>
            <p className="mt-3 text-sm text-white/70">
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, AMBIT WILL NOT BE LIABLE FOR
              INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES,
              OR ANY LOSS OF PROFITS, REVENUE, DATA, OR BUSINESS OPPORTUNITIES.
            </p>
          </section>

          <section className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-6">
            <h2 className="text-lg font-semibold">8) Indemnity</h2>
            <p className="mt-3 text-sm text-white/70">
              You agree to defend, indemnify, and hold AMBIT harmless from claims
              arising out of your use of the Service, your content, or your
              violation of these Terms.
            </p>
          </section>

          <section className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-6">
            <h2 className="text-lg font-semibold">9) Contact</h2>
            <p className="mt-3 text-sm text-white/70">
              Questions? Use{" "}
              <Link className="underline hover:text-white" href="/contact">
                Contact
              </Link>{" "}
              or{" "}
              <Link className="underline hover:text-white" href="/support">
                Support
              </Link>
              .
            </p>
          </section>

          <p className="mt-8 text-xs text-white/50">
            These terms are a starting point and not legal advice. For stronger
            protection, have counsel review before a full public launch.
          </p>
        </div>
      </div>
    </main>
  );
}
