import Link from "next/link";

export const metadata = {
  title: "Terms | AMBIT",
  description: "AMBIT terms of service.",
};

export default function TermsPage() {
  const updated = "December 29, 2025";

  return (
    <main className="min-h-screen bg-[#050B1A] text-white">
      <div className="mx-auto w-full max-w-4xl px-6 py-14">
        <h1 className="text-4xl font-semibold tracking-tight">Terms of Service</h1>
        <p className="mt-3 text-white/70">Last updated: {updated}</p>

        <div className="mt-8 space-y-8 rounded-2xl border border-white/10 bg-white/5 p-6 leading-relaxed">
          <section>
            <p className="text-white/70">
              These Terms of Service (“Terms”) govern your access to and use of AMBIT
              (the “Service”). By accessing or using the Service, you agree to these Terms.
              If you do not agree, do not use the Service.
            </p>
            <p className="mt-3 text-white/70">
              AMBIT is a private software product and is not affiliated with any government
              agency. The Service may reference or summarize publicly available third-party
              postings and content.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">1. The Service</h2>
            <p className="mt-3 text-white/70">
              AMBIT helps users discover and evaluate opportunities. We do not guarantee
              accuracy, completeness, timeliness, eligibility, pricing, award decisions,
              or outcomes. You are responsible for verifying all details and requirements
              using the official posting and documents.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">2. Eligibility & Accounts</h2>
            <ul className="mt-3 list-disc space-y-2 pl-6 text-white/70">
              <li>You must provide accurate information and keep it updated.</li>
              <li>You are responsible for all activity under your account.</li>
              <li>You may not use the Service for unlawful or prohibited purposes.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold">3. Subscriptions, Billing, and Payments</h2>
            <p className="mt-3 text-white/70">
              Paid features require an active subscription. Payments are processed by Stripe.
              By subscribing, you authorize recurring charges according to your selected plan.
            </p>
            <ul className="mt-3 list-disc space-y-2 pl-6 text-white/70">
              <li>Subscription access is tied to subscription status (active/trialing, etc.).</li>
              <li>If payment fails or subscription is canceled, access may be restricted.</li>
              <li>Taxes may apply depending on jurisdiction.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold">4. Acceptable Use</h2>
            <ul className="mt-3 list-disc space-y-2 pl-6 text-white/70">
              <li>No reverse engineering, scraping our app, or circumventing paywalls.</li>
              <li>No interfering with Service operation, security, or other users.</li>
              <li>No use of the Service to violate laws, regulations, or third-party rights.</li>
              <li>No uploading malicious code or attempting unauthorized access.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold">5. Third-Party Content & Links</h2>
            <p className="mt-3 text-white/70">
              The Service may display or link to third-party content, including public postings.
              We do not control third-party content and are not responsible for it. Third-party
              terms and policies may apply.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">6. Intellectual Property</h2>
            <p className="mt-3 text-white/70">
              AMBIT and its software, design, and functionality are owned by us and protected
              by intellectual property laws. You receive a limited, non-exclusive, non-transferable
              right to use the Service for your internal business use, subject to these Terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">7. Disclaimers</h2>
            <p className="mt-3 text-white/70">
              THE SERVICE IS PROVIDED “AS IS” AND “AS AVAILABLE” WITHOUT WARRANTIES OF ANY KIND,
              EXPRESS OR IMPLIED, INCLUDING IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR
              A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. WE DO NOT WARRANT THAT THE SERVICE
              WILL BE UNINTERRUPTED, ERROR-FREE, OR THAT OPPORTUNITY DATA WILL BE ACCURATE OR
              UP TO DATE.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">8. Limitation of Liability</h2>
            <p className="mt-3 text-white/70">
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, AMBIT AND ITS AFFILIATES, OWNERS, OFFICERS,
              EMPLOYEES, AND AGENTS WILL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL,
              CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS, REVENUE, DATA, OR BUSINESS
              OPPORTUNITY, ARISING OUT OF OR RELATED TO YOUR USE OF THE SERVICE.
            </p>
            <p className="mt-3 text-white/70">
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, OUR TOTAL LIABILITY FOR ANY CLAIM ARISING OUT
              OF OR RELATED TO THE SERVICE WILL NOT EXCEED THE AMOUNT YOU PAID TO US FOR THE SERVICE
              IN THE 3 MONTHS BEFORE THE EVENT GIVING RISE TO THE CLAIM.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">9. Indemnification</h2>
            <p className="mt-3 text-white/70">
              You agree to defend, indemnify, and hold harmless AMBIT and its affiliates from and
              against any claims, liabilities, damages, losses, and expenses (including reasonable
              attorney fees) arising out of or related to your use of the Service, your violation of
              these Terms, or your violation of any rights of a third party.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">10. Termination</h2>
            <p className="mt-3 text-white/70">
              We may suspend or terminate access to the Service at any time for violations of these
              Terms, suspected abuse, or to protect the Service. You may stop using the Service at
              any time. Sections that by their nature should survive termination will survive.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">11. Changes</h2>
            <p className="mt-3 text-white/70">
              We may update these Terms from time to time. Continued use after changes means you
              accept the updated Terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">12. Governing Law</h2>
            <p className="mt-3 text-white/70">
              These Terms are governed by the laws of the State of California, without regard to
              conflict of law principles. Venue for any permitted court action will be in California
              courts located in or near San Diego County, unless otherwise required by law.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">13. Contact</h2>
            <p className="mt-3 text-white/70">
              For questions about these Terms, contact us via{" "}
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
          Review our{" "}
          <Link className="underline" href="/privacy">
            Privacy Policy
          </Link>
          .
        </div>
      </div>
    </main>
  );
}
