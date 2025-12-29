"use client";

import { useMemo, useState } from "react";

export const metadata = {
  title: "Contact | AMBIT",
  description: "Contact AMBIT support and Sevrix Government Contracting.",
};

export default function ContactPage() {
  const SUPPORT_EMAIL = "sean.s@sevrixgov.com";

  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("AMBIT Support");
  const [message, setMessage] = useState("");

  const mailtoHref = useMemo(() => {
    const lines = [
      `Name: ${name || "-"}`,
      `Company: ${company || "-"}`,
      `Email: ${email || "-"}`,
      "",
      message || "",
    ].join("\n");

    const params = new URLSearchParams({
      subject: subject || "AMBIT Support",
      body: lines,
    });

    return `mailto:${SUPPORT_EMAIL}?${params.toString()}`;
  }, [name, company, email, subject, message]);

  return (
    <main className="min-h-screen bg-[#050B1A] text-white">
      <div className="mx-auto w-full max-w-4xl px-6 py-14">
        <h1 className="text-4xl font-semibold tracking-tight">Contact</h1>
        <p className="mt-3 text-white/70">
          Questions, concerns, or want to book a demo? Send a message below.
        </p>

        <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-6 shadow-sm">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm text-white/70">Name</label>
              <input
                className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white placeholder:text-white/30 outline-none focus:border-white/25"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm text-white/70">Company</label>
              <input
                className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white placeholder:text-white/30 outline-none focus:border-white/25"
                placeholder="Company name"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm text-white/70">Email</label>
              <input
                className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white placeholder:text-white/30 outline-none focus:border-white/25"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm text-white/70">Subject</label>
              <input
                className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white placeholder:text-white/30 outline-none focus:border-white/25"
                placeholder="AMBIT Support"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="text-sm text-white/70">Message</label>
            <textarea
              className="mt-2 min-h-[140px] w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white placeholder:text-white/30 outline-none focus:border-white/25"
              placeholder="How can we help?"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <a
              href={mailtoHref}
              className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold hover:bg-blue-500"
            >
              Send Message
            </a>

            <div className="text-sm text-white/60">
              Or email us directly:{" "}
              <a className="underline" href={`mailto:${SUPPORT_EMAIL}`}>
                {SUPPORT_EMAIL}
              </a>
            </div>
          </div>

          <p className="mt-6 text-xs text-white/50 leading-relaxed">
            Note: Emails will be directed to AMBIT’s parent company —{" "}
            <span className="text-white/70">Sevrix Government Contracting</span>.
          </p>
        </div>
      </div>
    </main>
  );
}
