"use client";

import { useMemo, useState } from "react";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [fromEmail, setFromEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);

  const canSend = useMemo(() => {
    return message.trim().length >= 10;
  }, [message]);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!canSend) {
      setError("Please enter a message (10+ characters).");
      return;
    }

    const to = "sean.s@sevrixgov.com";
    const subject = `AMBIT Contact — ${company || name || "New message"}`;
    const bodyLines = [
      `Name: ${name || "(not provided)"}`,
      `Company: ${company || "(not provided)"}`,
      `Email: ${fromEmail || "(not provided)"}`,
      "",
      "Message:",
      message,
      "",
      "--",
      "Sent from the AMBIT contact form",
    ];

    const mailto = `mailto:${to}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(bodyLines.join("\n"))}`;

    window.location.href = mailto;
  }

  return (
    <main className="min-h-[calc(100vh-80px)] px-4 py-16">
      <div className="mx-auto w-full max-w-4xl">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur md:p-10">
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
            Contact
          </h1>
          <p className="mt-3 text-white/70">
            Questions, issues, or want to talk? Send us a note and we’ll get back
            to you.
          </p>

          <form
            onSubmit={onSubmit}
            className="mt-8 rounded-2xl border border-white/10 bg-black/20 p-6"
          >
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm text-white/70">Your name</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-2 text-white outline-none placeholder:text-white/30 focus:border-white/25"
                  placeholder="Sean"
                />
              </div>

              <div>
                <label className="text-sm text-white/70">Company</label>
                <input
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-2 text-white outline-none placeholder:text-white/30 focus:border-white/25"
                  placeholder="Sevrix LLC"
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-sm text-white/70">Email</label>
                <input
                  value={fromEmail}
                  onChange={(e) => setFromEmail(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-2 text-white outline-none placeholder:text-white/30 focus:border-white/25"
                  placeholder="you@company.com"
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-sm text-white/70">Message</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="mt-2 min-h-[140px] w-full resize-y rounded-xl border border-white/10 bg-black/30 px-4 py-2 text-white outline-none placeholder:text-white/30 focus:border-white/25"
                  placeholder="Tell us what you need help with…"
                />
              </div>
            </div>

            {error ? (
              <div className="mt-3 text-sm text-red-300">{error}</div>
            ) : null}

            <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="submit"
                className="inline-flex w-fit items-center justify-center rounded-xl border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/15 disabled:opacity-50"
                disabled={!canSend}
              >
                Send Message
              </button>

              <div className="text-xs text-white/50">
                Emails will be directed to AMBIT’s parent company —{" "}
                <span className="text-white/70">Sevrix Government Contracting</span>.
              </div>
            </div>
          </form>

          <div className="mt-6 text-sm text-white/70">
            Or email directly:{" "}
            <a className="underline hover:text-white" href="mailto:sean.s@sevrixgov.com">
              sean.s@sevrixgov.com
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
