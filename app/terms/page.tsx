import Link from "next/link";

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

function SectionCard({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      className="rounded-3xl border border-black/10 bg-white p-6 shadow-[0_18px_60px_rgba(0,0,0,0.08)] md:p-7 scroll-mt-28"
    >
      <div className="flex items-start gap-3">
        <div className="mt-1 h-5 w-1.5 rounded-full bg-[#1A4FA3]" />
        <div className="min-w-0">
          <h2 className="text-lg font-black tracking-tight text-black md:text-xl">
            {title}
          </h2>
          <div className="mt-3 text-sm leading-relaxed text-black/70">
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}

export default function TermsPage() {
  return (
    <main className="min-h-[calc(100vh-80px)] px-4 py-14 sm:py-16">
      <div className="mx-auto w-full max-w-6xl">
        <div className="grid gap-10 lg:grid-cols-[260px_1fr] lg:gap-12">
          {/* TOC */}
          <aside className="hidden lg:block">
            <div className="sticky top-24 rounded-3xl border border-black/10 bg-white p-5 shadow-[0_18px_60px_rgba(0,0,0,0.06)]">
              <div className="text-xs font-black tracking-[0.16em] text-black/45">
                ON THIS PAGE
              </div>
              <nav className="mt-4 grid gap-2">
                {TOC.map((t) => (
                  <a
                    key={t.id}
                    href={`#${t.id}`}
                    className="rounded-xl px-3 py-2 text-sm font-semibold text-black/70 hover:bg-black/[0.03] hover:text-black"
                  >
                    {t.label}
                  </a>
                ))}
              </nav>

              <div className="mt-6 rounded-2xl border border-[#63A7FF]/30 bg-[#EAF3FF] px-4 py-3 text-xs font-semibold leading-relaxed text-[#0B2A55]">
                AMBIT is an informational tool — always verify details in the
                official solicitation source.
              </div>
            </div>
          </aside>

          {/* Content */}
          <div className="min-w-0">
            {/* Header Card */}
            <div className="rounded-[32px] border border-black/10 bg-white p-7 shadow-[0_24px_80px_rgba(0,0,0,0.08)] md:p-10">
              <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-3 py-1.5 text-xs font-semibold text-black/60">
                <span className="inline-flex h-2 w-2 rounded-full bg-[#1A4FA3]" />
                Last updated: Dec 29, 2025
              </div>

              <h1 className="mt-4 text-3xl font-black tracking-tight text-black md:text-5xl">
                Terms of Service
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-black/70 md:text-base">
                These Terms govern your use of AMBIT. By accessing or using the
                Service, you agree to these Terms.
              </p>
            </div>

            <div className="mt-8 grid gap-6">
              <SectionCard id="service" title="1) The Service">
                AMBIT helps businesses discover and prioritize public-sector
                opportunities using publicly available information and third-party
                sources. AMBIT is an informational tool and is not legal advice.
              </SectionCard>

              <SectionCard
                id="verification"
                title="2) No guarantee + verification"
              >
                We do not guarantee accuracy, completeness, or timeliness of any
                listing, summary, match score, or estimate. You are responsible
                for verifying requirements, deadlines, and attachments on the
                official solicitation source before acting.
              </SectionCard>

              <SectionCard id="acceptable-use" title="3) Acceptable use">
                <ul className="mt-1 space-y-2">
                  <li className="flex gap-2">
                    <span className="mt-[7px] h-1.5 w-1.5 rounded-full bg-black/30" />
                    <span>Don’t bypass paywalls or access controls.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="mt-[7px] h-1.5 w-1.5 rounded-full bg-black/30" />
                    <span>Don’t scrape, reverse engineer, or disrupt the Service.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="mt-[7px] h-1.5 w-1.5 rounded-full bg-black/30" />
                    <span>Don’t use the Service for unlawful or abusive activity.</span>
                  </li>
                </ul>
              </SectionCard>

              <SectionCard
                id="billing"
                title="4) Billing, cancellation, refunds"
              >
                <ul className="mt-1 space-y-2">
                  <li className="flex gap-2">
                    <span className="mt-[7px] h-1.5 w-1.5 rounded-full bg-black/30" />
                    <span>Subscriptions renew automatically until canceled.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="mt-[7px] h-1.5 w-1.5 rounded-full bg-black/30" />
                    <span>
                      You can cancel anytime; access continues through the paid
                      period.
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="mt-[7px] h-1.5 w-1.5 rounded-full bg-black/30" />
                    <span>
                      Unless required by law, payments are non-refundable
                      (especially for partial periods).
                    </span>
                  </li>
                </ul>
              </SectionCard>

              <SectionCard id="ip" title="5) Intellectual property">
                The Service, including its design, software, and content (excluding
                third-party/public listings), is owned by AMBIT and/or its licensors.
                You receive a limited, non-exclusive, non-transferable license to
                use the Service for your internal business purposes.
              </SectionCard>

              <SectionCard id="warranties" title="6) Disclaimer of warranties">
                THE SERVICE IS PROVIDED “AS IS” AND “AS AVAILABLE” WITHOUT
                WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING IMPLIED
                WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE,
                AND NON-INFRINGEMENT.
              </SectionCard>

              <SectionCard id="liability" title="7) Limitation of liability">
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, AMBIT WILL NOT BE LIABLE
                FOR INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE
                DAMAGES, OR ANY LOSS OF PROFITS, REVENUE, DATA, OR BUSINESS
                OPPORTUNITIES.
              </SectionCard>

              <SectionCard id="indemnity" title="8) Indemnity">
                You agree to defend, indemnify, and hold AMBIT harmless from
                claims arising out of your use of the Service, your content, or
                your violation of these Terms.
              </SectionCard>

              <SectionCard id="contact" title="9) Contact">
                Questions? Use{" "}
                <Link className="font-semibold text-[#1A4FA3] hover:underline" href="/support">
                  Support
                </Link>{" "}
                (or{" "}
                <Link className="font-semibold text-[#1A4FA3] hover:underline" href="/contact">
                  Contact
                </Link>{" "}
                if available).
              </SectionCard>

              <div className="rounded-3xl border border-black/10 bg-white px-6 py-5 text-xs leading-relaxed text-black/55 shadow-[0_18px_60px_rgba(0,0,0,0.06)]">
                These terms are a starting point and not legal advice. For
                stronger protection, have counsel review before a full public
                launch.
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
