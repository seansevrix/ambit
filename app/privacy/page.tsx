import Link from "next/link";

const TOC = [
  { id: "collect", label: "Information we collect" },
  { id: "use", label: "How we use information" },
  { id: "share", label: "How we share information" },
  { id: "retention", label: "Data retention" },
  { id: "security", label: "Security" },
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

export default function PrivacyPage() {
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
                We do not sell personal information. We use your profile to match
                opportunities and deliver results.
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
                Privacy Policy
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-black/70 md:text-base">
                This Privacy Policy explains how AMBIT collects, uses, and shares
                information when you use our website and services (the “Service”).
              </p>
            </div>

            <div className="mt-8 grid gap-6">
              <SectionCard id="collect" title="1) Information we collect">
                <ul className="mt-1 space-y-2">
                  <li className="flex gap-2">
                    <span className="mt-[7px] h-1.5 w-1.5 rounded-full bg-black/30" />
                    <span>
                      <span className="font-semibold text-black">Account/profile info:</span>{" "}
                      company name, email, service area, keywords, NAICS, and related
                      fields you submit.
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="mt-[7px] h-1.5 w-1.5 rounded-full bg-black/30" />
                    <span>
                      <span className="font-semibold text-black">Usage data:</span>{" "}
                      basic logs and analytics (e.g., pages viewed, feature usage,
                      performance).
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="mt-[7px] h-1.5 w-1.5 rounded-full bg-black/30" />
                    <span>
                      <span className="font-semibold text-black">Billing info:</span>{" "}
                      handled by our payment processor (e.g., Stripe). AMBIT does not
                      store full card numbers.
                    </span>
                  </li>
                </ul>
              </SectionCard>

              <SectionCard id="use" title="2) How we use information">
                <ul className="mt-1 space-y-2">
                  <li className="flex gap-2">
                    <span className="mt-[7px] h-1.5 w-1.5 rounded-full bg-black/30" />
                    <span>Provide and improve the Service (matching, dashboards).</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="mt-[7px] h-1.5 w-1.5 rounded-full bg-black/30" />
                    <span>Operate billing, subscriptions, and fraud prevention.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="mt-[7px] h-1.5 w-1.5 rounded-full bg-black/30" />
                    <span>Respond to support and customer requests.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="mt-[7px] h-1.5 w-1.5 rounded-full bg-black/30" />
                    <span>Communicate product updates and important notices.</span>
                  </li>
                </ul>
              </SectionCard>

              <SectionCard id="share" title="3) How we share information">
                We do not sell your personal information. We may share information
                with vendors who help us operate the Service (hosting, analytics,
                email delivery, payment processing), and with legal authorities if
                required by law.
              </SectionCard>

              <SectionCard id="retention" title="4) Data retention">
                We retain information as long as needed to provide the Service and
                comply with legal, tax, and accounting obligations. You may request
                deletion of your account by contacting us (some records may be retained
                where legally required).
              </SectionCard>

              <SectionCard id="security" title="5) Security">
                We use reasonable administrative, technical, and physical safeguards
                designed to protect information. No method of transmission or storage
                is 100% secure.
              </SectionCard>

              <SectionCard id="contact" title="6) Contact">
                Privacy questions? Visit{" "}
                <Link className="font-semibold text-[#1A4FA3] hover:underline" href="/support">
                  Support
                </Link>{" "}
                or email{" "}
                <a
                  className="font-semibold text-[#1A4FA3] hover:underline"
                  href="mailto:ambit@sevrixgov.com"
                >
                  ambit@sevrixgov.com
                </a>
                .
              </SectionCard>

              <div className="rounded-3xl border border-black/10 bg-white px-6 py-5 text-xs leading-relaxed text-black/55 shadow-[0_18px_60px_rgba(0,0,0,0.06)]">
                This policy is informational and not legal advice.
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
