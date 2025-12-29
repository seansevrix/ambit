"use client";

// app/contact/page.tsx
import { useMemo, useState } from "react";

export default function ContactPage() {
  const [company, setCompany] = useState("");
  const [name, setName] = useState("");
  const [fromEmail, setFromEmail] = useState("");
  const [topic, setTopic] = useState("General question");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "copied">("idle");

  // NOTE: We are intentionally NOT displaying your email on the page.
  // This is only used to build the mailto link on submit.
  const ROUTE_TO_EMAIL = "sean.s@sevrixgov.com";

  const isValid = useMemo(() => {
    if (!company.trim()) return false;
    if (!name.trim()) return false;
    if (!fromEmail.trim()) return false;
    if (!message.trim()) return false;
    // light email check (MVP)
    if (!fromEmail.includes("@") || !fromEmail.includes(".")) return false;
    return true;
  }, [company, name, fromEmail, message]);

  const mailto = useMemo(() => {
    const safeTopic = encodeURIComponent(`[AMBIT] ${topic} — ${company}`);
    const bodyLines = [
      `Company: ${company}`,
      `Name: ${name}`,
      `Reply-to Email: ${fromEmail}`,
      `Topic: ${topic}`,
      "",
      "Message:",
      message,
      "",
      "—",
      "Note: This message was sent from the AMBIT contact form.",
      "Emails are routed to AMBIT’s parent company — Sevrix Government Contracting.",
    ];
    const safeBody = encodeURIComponent(bodyLines.join("\n"));
    return `mailto:${ROUTE_TO_EMAIL}?subject=${safeTopic}&body=${safeBody}`;
  }, [company, name, fromEmail, topic, message]);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(
        [
          `Company: ${company}`,
          `Name: ${name}`,
          `Reply-to Email: ${fromEmail}`,
          `Topic: ${topic}`,
          "",
          message,
        ].join("\n")
      );
      setStatus("copied");
      setTimeout(() => setStatus("idle"), 1500);
    } catch {
      // no-op (clipboard blocked)
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid) return;

    // Open the user's email client with a prefilled message.
    // (MVP-friendly, no backend email service required.)
    window.location.href = mailto;
  }

  return (
    <main className="min-h-[calc(100vh-120px)] px-4 py-10">
      <div className="mx-auto w-full max-w-3xl">
        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-8 shadow-2xl backdrop-blur">
          <h1 className="text-3xl font-semibold tracking-tight text-white">
            Contact
          </h1>
          <p className="mt-2 text-sm text-white/70">
            Questions, issues, or feedback — send a note and we’ll route it to a
            Sevrix associate.
          </p>

          <div className="mt-6 grid gap-6">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <p className="text-sm text-white/80">
                <span className="font-medium text-white">How it works:</span>{" "}
                Fill this out and hit <span className="font-medium">Send</span>.
                Your email app will open with everything pre-filled.
              </p>
              <p className="mt-2 text-xs text-white/60">
                * Please don’t include payment details, passwords, or sensitive
                personal data.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="grid gap-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <label className="text-sm text-white/80">Company name</label>
                  <input
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="Your company"
                    className="h-11 w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 text-sm text-white placeholder:text-white/40 outline-none focus:border-white/20"
                  />
                </div>

                <div className="grid gap-2">
                  <label className="text-sm text-white/80">Your name</label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="First + last"
                    className="h-11 w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 text-sm text-white placeholder:text-white/40 outline-none focus:border-white/20"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <label className="text-sm text-white/80">
                    Best email to reply to
                  </label>
                  <input
                    value={fromEmail}
                    onChange={(e) => setFromEmail(e.target.value)}
                    placeholder="you@company.com"
                    className="h-11 w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 text-sm text-white placeholder:text-white/40 outline-none focus:border-white/20"
                  />
                </div>

                <div className="grid gap-2">
                  <label className="text-sm text-white/80">Topic</label>
                  <select
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="h-11 w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 text-sm text-white outline-none focus:border-white/20"
                  >
                    <option className="bg-[#0B1220]" value="General question">
                      General question
                    </option>
                    <option className="bg-[#0B1220]" value="Billing / subscription">
                      Billing / subscription
                    </option>
                    <option className="bg-[#0B1220]" value="Bug / technical issue">
                      Bug / technical issue
                    </option>
                    <option className="bg-[#0B1220]" value="Feature request">
                      Feature request
                    </option>
                    <option className="bg-[#0B1220]" value="Partnership / enterprise">
                      Partnership / enterprise
                    </option>
                  </select>
                </div>
              </div>

              <div className="grid gap-2">
                <label className="text-sm text-white/80">Message</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="What can we help with?"
                  rows={6}
                  className="w-full resize-none rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white placeholder:text-white/40 outline-none focus:border-white/20"
                />
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs text-white/50">
                    Emails will be directed to AMBIT’s parent company —{" "}
                    <span className="text-white/70">
                      Sevrix Government Contracting
                    </span>
                    .
                  </p>

                  <button
                    type="button"
                    onClick={handleCopy}
                    className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-white/80 hover:bg-white/[0.06]"
                  >
                    {status === "copied" ? "Copied ✅" : "Copy message"}
                  </button>
                </div>
              </div>

              <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-white/50">
                  AMBIT is not affiliated with the U.S. Government. Information
                  provided is for general informational purposes only.
                </p>

                <button
                  type="submit"
                  disabled={!isValid}
                  className="h-11 rounded-xl bg-white px-6 text-sm font-medium text-black disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Send message
                </button>
              </div>

              {!isValid && (
                <p className="text-xs text-white/50">
                  Fill out company, name, reply-to email, and message to enable
                  send.
                </p>
              )}
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
