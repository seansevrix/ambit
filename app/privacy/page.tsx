import Link from "next/link";
import type { ReactNode } from "react";

const TOC = [
  { id: "collect", label: "Information we collect" },
  { id: "use", label: "How we use information" },
  { id: "share", label: "How we share information" },
  { id: "retention", label: "Data retention" },
  { id: "security", label: "Security" },
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

export default function PrivacyPage() {
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
              <Eyebrow>Privacy</Eyebrow>
              <h1 className="mt-3 text-4xl font-black tracking-tight text-[#31245C] sm:text-5xl">
                Privacy Policy
              </h1>
              <p className="mt-4 max-w-[720px] text-base leading-8 text-[#6A6775]">
                This Privacy Policy explains how AMBIT collects, uses, and
                shares information when you use our website and services.
              </p>
            </div>

            <div className="mt-8 rounded-[20px] bg-[#F6FBFA] px-5 py-4 text-sm leading-7 text-[#31245C]">
              We do not sell your personal information. We use your profile and
              account details to operate the service, match opportunities, and
              deliver results.
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
            <SectionCard id="collect" title="1) Information we collect">
              <ul className="space-y-3">
                <Bullet>
                  <span className="font-semibold text-[#31245C]">
                    Account and profile information:
                  </span>{" "}
                  company name, email, service area, keywords, NAICS, and other
                  related fields you submit.
                </Bullet>
                <Bullet>
                  <span className="font-semibold text-[#31245C]">
                    Usage data:
                  </span>{" "}
                  basic logs and analytics, such as pages viewed, feature usage,
                  and performance information.
                </Bullet>
                <Bullet>
                  <span className="font-semibold text-[#31245C]">
                    Billing information:
                  </span>{" "}
                  handled by our payment processor, such as Stripe. AMBIT does
                  not store full card numbers.
                </Bullet>
              </ul>
            </SectionCard>

            <SectionCard id="use" title="2) How we use information">
              <ul className="space-y-3">
                <Bullet>
                  Provide and improve the service, including matching,
                  dashboards, and account functionality.
                </Bullet>
                <Bullet>
                  Operate billing, subscriptions, and fraud prevention.
                </Bullet>
                <Bullet>Respond to support and customer requests.</Bullet>
                <Bullet>
                  Send important service notices, account updates, and product
                  communications.
                </Bullet>
              </ul>
            </SectionCard>

            <SectionCard id="share" title="3) How we share information">
              <p>
                We do not sell your personal information. We may share
                information with vendors who help us operate the service, such
                as hosting, analytics, email delivery, and payment processing.
                We may also share information when required by law or legal
                process.
              </p>
            </SectionCard>

            <SectionCard id="retention" title="4) Data retention">
              <p>
                We retain information for as long as needed to provide the
                service and comply with legal, tax, and accounting obligations.
                You may request deletion of your account by contacting us,
                although some records may be retained where legally required.
              </p>
            </SectionCard>

            <SectionCard id="security" title="5) Security">
              <p>
                We use reasonable administrative, technical, and physical
                safeguards designed to protect information. No method of
                transmission or storage is 100% secure, so we cannot guarantee
                absolute security.
              </p>
            </SectionCard>

            <SectionCard id="contact" title="6) Contact">
              <p>
                Privacy questions? Visit{" "}
                <Link
                  href="/support"
                  className="font-semibold text-[#2A8F8B] hover:underline"
                >
                  Support
                </Link>{" "}
                or email{" "}
                <a
                  href="mailto:ambit@sevrixgov.com"
                  className="font-semibold text-[#2A8F8B] hover:underline"
                >
                  ambit@sevrixgov.com
                </a>
                .
              </p>
            </SectionCard>

            <div className="rounded-[24px] bg-white px-6 py-5 text-sm leading-7 text-[#6A6775] shadow-[0_16px_36px_rgba(49,36,92,0.08)]">
              This policy is informational and not legal advice.
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}