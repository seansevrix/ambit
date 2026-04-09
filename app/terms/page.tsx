import Link from "next/link";
import type { ReactNode } from "react";

const TOC = [
  { id: "service", label: "The Service" },
  { id: "verification", label: "No guarantee + verification" },
  { id: "acceptable-use", label: "Acceptable use" },
  { id: "billing", label: "Billing, cancellation, refunds" },
  { id: "ip", label: "Intellectual property" },
  { id: "warranties", label: "Disclaimer of warranties" },
  { id: "liability", label: "Limitation of liability" },
  { id: "indemnity", label: "Indemnity" },
  { id: "contact", label: "Contact" },
];

const CONTAINER = "mx-auto max-w-[1240px] px-6 lg:px-10";

function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#7A7590]">
      {children}
    </div>
  );
}

function SectionCard({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      className="scroll-mt-28 rounded-[28px] bg-white p-7 shadow-[0_16px_36px_rgba(49,36,92,0.08)]"
    >
      <h2 className="text-2xl font-black tracking-tight text-[#31245C]">
        {title}
      </h2>
      <div className="mt-4 text-base leading-8 text-[#6A6775]">{children}</div>
    </section>
  );
}

function Bullet({ children }: { children: ReactNode }) {
  return (
    <li className="flex gap-3">
      <span className="mt-3 h-2.5 w-2.5 rounded-full bg-[#43D1B8]" />
      <span>{children}</span>
    </li>
  );
}

export default function TermsPage() {
  return (
    <main className="min-h-[calc(100vh-80px)] bg-[#E6F5F2] text-[#31245C]">
      <div className={`${CONTAINER} py-12 sm:py-16 lg:py-20`}>
        <div className="mx-auto max-w-[980px]">
          <div className="rounded-[32px] bg-white p-8 shadow-[0_18px_40px_rgba(49,36,92,0.08)] sm:p-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#2A8F8B]/15 bg-[#F6FBFA] px-3 py-1.5 text-xs font-semibold text-[#31245C]">
              <span className="inline-flex h-2 w-2 rounded-full bg-[#2A8F8B]" />
              Last updated: Dec 29, 2025
            </div>

            <div className="mt-6">
              <Eyebrow>Terms</Eyebrow>
              <h1 className="mt-3 text-4xl font-black tracking-tight text-[#31245C] sm:text-5xl">
                Terms of Service
              </h1>
              <p className="mt-4 max-w-[720px] text-base leading-8 text-[#6A6775]">
                These Terms govern your use of AMBIT. By accessing or using our
                website or services, you agree to these Terms.
              </p>
            </div>

            <div className="mt-8 rounded-[20px] bg-[#F6FBFA] px-5 py-4 text-sm leading-7 text-[#31245C]">
              AMBIT is an informational and support service. Always verify
              requirements, deadlines, and attachments in the official
              solicitation source before acting.
            </div>

            <div className="mt-8">
              <Eyebrow>On this page</Eyebrow>
              <div className="mt-4 flex flex-wrap gap-2">
                {TOC.map((item) => (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    className="rounded-full border border-[#2A8F8B]/15 bg-white px-4 py-2 text-sm font-semibold text-[#31245C] transition hover:bg-[#F6FBFA]"
                  >
                    {item.label}
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-8 grid gap-6">
            <SectionCard id="service" title="1) The Service">
              <p>
                AMBIT helps businesses discover, review, and prioritize
                public-sector and related opportunities using publicly available
                information and third-party sources. AMBIT may also provide
                support around sourcing, summaries, and front-end bid
                organization. AMBIT is not legal advice.
              </p>
            </SectionCard>

            <SectionCard
              id="verification"
              title="2) No guarantee + verification"
            >
              <p>
                We do not guarantee the accuracy, completeness, or timeliness of
                any listing, summary, match score, estimate, or recommendation.
                You are responsible for verifying requirements, deadlines,
                attachments, and submission rules on the official solicitation
                source before acting.
              </p>
            </SectionCard>

            <SectionCard id="acceptable-use" title="3) Acceptable use">
              <ul className="space-y-3">
                <Bullet>Do not bypass paywalls or access controls.</Bullet>
                <Bullet>
                  Do not scrape, reverse engineer, or disrupt the service.
                </Bullet>
                <Bullet>
                  Do not use the service for unlawful, abusive, or misleading
                  activity.
                </Bullet>
              </ul>
            </SectionCard>

            <SectionCard
              id="billing"
              title="4) Billing, cancellation, refunds"
            >
              <ul className="space-y-3">
                <Bullet>Subscriptions renew automatically until canceled.</Bullet>
                <Bullet>
                  You may cancel at any time, and access continues through the
                  paid billing period.
                </Bullet>
                <Bullet>
                  Unless required by law, payments are non-refundable,
                  especially for partial billing periods or work already
                  performed.
                </Bullet>
              </ul>
            </SectionCard>

            <SectionCard id="ip" title="5) Intellectual property">
              <p>
                The service, including its design, software, and original
                content, excluding third-party or public listings, is owned by
                AMBIT and/or its licensors. You receive a limited,
                non-exclusive, non-transferable license to use the service for
                your internal business purposes.
              </p>
            </SectionCard>

            <SectionCard id="warranties" title="6) Disclaimer of warranties">
              <p>
                THE SERVICE IS PROVIDED “AS IS” AND “AS AVAILABLE” WITHOUT
                WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING IMPLIED
                WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE,
                AND NON-INFRINGEMENT.
              </p>
            </SectionCard>

            <SectionCard id="liability" title="7) Limitation of liability">
              <p>
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, AMBIT WILL NOT BE LIABLE
                FOR INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE
                DAMAGES, OR FOR ANY LOSS OF PROFITS, REVENUE, DATA, OR BUSINESS
                OPPORTUNITIES.
              </p>
            </SectionCard>

            <SectionCard id="indemnity" title="8) Indemnity">
              <p>
                You agree to defend, indemnify, and hold AMBIT harmless from
                claims arising out of your use of the service, your content, or
                your violation of these Terms.
              </p>
            </SectionCard>

            <SectionCard id="contact" title="9) Contact">
              <p>
                Questions? Use{" "}
                <Link
                  className="font-semibold text-[#2A8F8B] hover:underline"
                  href="/support"
                >
                  Support
                </Link>{" "}
                or{" "}
                <Link
                  className="font-semibold text-[#2A8F8B] hover:underline"
                  href="/contact"
                >
                  Contact
                </Link>{" "}
                if available.
              </p>
            </SectionCard>

            <div className="rounded-[24px] bg-white px-6 py-5 text-sm leading-7 text-[#6A6775] shadow-[0_16px_36px_rgba(49,36,92,0.08)]">
              These terms are informational and not legal advice. For stronger
              protection, have legal counsel review them before a full public
              launch.
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}