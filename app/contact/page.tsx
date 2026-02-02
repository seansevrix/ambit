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

  // Route email for contact
  const ROUTE_TO_EMAIL = "ambit@sevrixgov.com";

  const isValid = useMemo(() => {
    if (!company.trim()) return false;
    if (!name.trim()) return false;
    if (!fromEmail.trim()) return false;
    if (!message.trim()) return false;
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
      setTimeout(() => setStatus("idle"), 1400);
    } catch {
      // clipboard blocked — ignore
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid) return;

    // MVP: opens user's email app with everything prefilled
    window.location.href = mailto;
  }

  return (
    <main className="min-h-[calc(100vh-80px)] px-4 py-14 sm:py-16">
      <div className="mx-auto w-full max-w-4xl">
        {/* Header */}
        <div className="rounded-[32px] border border-black/10 bg-white p-7 shadow-[0_24px_80px_rgba(0,0,0,0.08)] md:p-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-3 py-1.5 text-xs font-semibold text-black/60">
            <span className="inline-flex h-2 w-2 rounded-full bg-[#1A4FA3]" />
            Contact
          </div>

          <h1 className="mt-4 text-3xl font-black tracking-tight text-black md:text-5xl">
            Send us a note
          </h1>

          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-black/70 md:text-base">
            Questions, issues, or feedback — message us and we’ll route it to an
            AMBIT associate.
          </p>

          <div className="mt-6 rounded-3xl border border-[#63A7FF]/30 bg-[#EAF3FF] px-5 py-4 text-sm font-semibold leading-relaxed text-[#0B2A55]">
            <span className="font-black">How it works:</span> Fill this out and hit{" "}
            <span className="font-black">Send</span>. Your email app will open with
            everything pre-filled.
            <div className="mt-2 text-xs font-semibold text-[#0B2A55]/70">
              Please don’t include payment details, passwords, or sensitive personal data.
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="mt-8 rounded-3xl border border-black/10 bg-white p-6 shadow-[0_18px_60px_rgba(0,0,0,0.07)] md:p-8">
          <form onSubmit={handleSubmit} className="grid gap-5">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-xs font-semibold text-black/55">
                  Company name
                </label>
                <input
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="Your company"
                  className="mt-2 h-11 w-full rounded-xl border border-black/10 bg-white px-4 text-sm text-black placeholder:text-black/35 outline-none focus:border-[#63A7FF] focus:ring-2 focus:ring-[#63A7FF]/20"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-black/55">
                  Your name
                </label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="First + last"
                  className="mt-2 h-11 w-full rounded-xl border border-black/10 bg-white px-4 text-sm text-black placeholder:text-black/35 outline-none focus:border-[#63A7FF] focus:ring-2 focus:ring-[#63A7FF]/20"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-xs font-semibold text-black/55">
                  Best email to reply to
                </label>
                <input
                  value={fromEmail}
                  onChange={(e) => setFromEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="mt-2 h-11 w-full rounded-xl border border-black/10 bg-white px-4 text-sm text-black placeholder:text-black/35 outline-none focus:border-[#63A7FF] focus:ring-2 focus:ring-[#63A7FF]/20"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-black/55">Topic</label>
                <select
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="mt-2 h-11 w-full rounded-xl border border-black/10 bg-white px-4 text-sm text-black outline-none focus:border-[#63A7FF] focus:ring-2 focus:ring-[#63A7FF]/20"
                >
                  <option value="General question">General question</option>
                  <option value="Billing / subscription">Billing / subscription</option>
                  <option value="Bug / technical issue">Bug / technical issue</option>
                  <option value="Feature request">Feature request</option>
                  <option value="Partnership / enterprise">Partnership / enterprise</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-black/55">Message</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="What can we help with?"
                rows={6}
                className="mt-2 w-full resize-none rounded-xl border border-black/10 bg-white px-4 py-3 text-sm text-black placeholder:text-black/35 outline-none focus:border-[#63A7FF] focus:ring-2 focus:ring-[#63A7FF]/20"
              />

              <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-black/55">
                  This message will open in your email app and send to{" "}
                  <span className="font-semibold text-black">ambit@sevrixgov.com</span>.
                </p>

                <button
                  type="button"
                  onClick={handleCopy}
                  className="inline-flex items-center justify-center rounded-xl border border-black/10 bg-white px-3 py-2 text-xs font-semibold text-black/70 hover:bg-black/[0.03]"
                >
                  {status === "copied" ? "Copied ✅" : "Copy message"}
                </button>
              </div>
            </div>

            <div className="mt-1 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-black/55">
                AMBIT is not affiliated with the U.S. Government. Information provided
                is for general informational purposes only.
              </p>

              <button
                type="submit"
                disabled={!isValid}
                className="h-11 rounded-2xl bg-[#1A4FA3] px-6 text-sm font-semibold text-white hover:bg-[#15428B] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Send message
              </button>
            </div>

            {!isValid && (
              <p className="text-xs text-black/50">
                Fill out company, name, reply-to email, and message to enable send.
              </p>
            )}
          </form>
        </div>
      </div>
    </main>
  );
}
