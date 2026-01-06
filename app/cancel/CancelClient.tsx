"use client";

import { useState } from "react";

export default function CancelClient() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);

    const trimmed = email.trim().toLowerCase();
    if (!trimmed) {
      setErr("Enter the email you used for AMBIT.");
      return;
    }

    setLoading(true);
    try {
      // If you already have a frontend env like NEXT_PUBLIC_BACKEND_URL, use it:
      const backend = process.env.NEXT_PUBLIC_BACKEND_URL;
      if (!backend) throw new Error("Missing NEXT_PUBLIC_BACKEND_URL on the frontend.");

      const resp = await fetch(`${backend}/engine/billing/create-portal-session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed }),
      });

      const data = await resp.json();
      if (!resp.ok || !data?.ok || !data?.url) {
        throw new Error(data?.error || "Could not open billing portal.");
      }

      window.location.href = data.url;
    } catch (e: any) {
      setErr(e?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#050b1a] text-white flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl">
        <h1 className="text-2xl font-semibold">Cancel Subscription</h1>
        <p className="mt-2 text-sm text-white/70">
          Enter the email you used for AMBIT. We’ll send you to Stripe to cancel safely.
        </p>

        <form onSubmit={onSubmit} className="mt-5 space-y-3">
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            className="w-full rounded-xl bg-black/30 border border-white/10 px-4 py-3 outline-none"
          />

          {err ? <div className="text-sm text-red-300">{err}</div> : null}

          <button
            disabled={loading}
            className="w-full rounded-xl bg-white text-black font-medium py-3 disabled:opacity-60"
          >
            {loading ? "Opening Stripe…" : "Continue"}
          </button>

          <a href="/support" className="block text-center text-sm text-white/70 hover:text-white">
            Back to Support
          </a>
        </form>
      </div>
    </div>
  );
}
