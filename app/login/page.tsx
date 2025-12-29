"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

function getApiBaseUrl() {
  const raw = process.env.NEXT_PUBLIC_API_BASE_URL || "";
  return raw.replace(/\/$/, "");
}

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const apiBase = useMemo(() => getApiBaseUrl(), []);
  const nextParam = searchParams.get("next"); // optional: /login?next=/matches/1
  const safeNext =
    nextParam && nextParam.startsWith("/") ? nextParam : null;

  const [customerId, setCustomerId] = useState("");
  const [email, setEmail] = useState("");
  const [remember, setRemember] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Prefill from localStorage
  useEffect(() => {
    try {
      const savedId = localStorage.getItem("ambit_customerId");
      const savedEmail = localStorage.getItem("ambit_email");
      if (savedId) setCustomerId(savedId);
      if (savedEmail) setEmail(savedEmail);
    } catch {
      // ignore
    }
  }, []);

  const parsedId = useMemo(() => Number(customerId), [customerId]);
  const idIsValid = Number.isFinite(parsedId) && parsedId > 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!idIsValid) {
      setError("Please enter a valid Customer ID (e.g., 1).");
      return;
    }

    setLoading(true);
    try {
      // If email is provided AND backend is configured, verify email+ID match
      if (email.trim() && apiBase) {
        const res = await fetch(`${apiBase}/engine/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          // Keep it simple: verify that this email belongs to this customerId
          body: JSON.stringify({
            customerId: parsedId,
            email: email.trim(),
          }),
        });

        const data = await res.json().catch(() => ({}));

        if (!res.ok || data?.ok === false) {
          throw new Error(
            data?.error ||
              "Login failed. Double-check your Customer ID + email and try again."
          );
        }
      }

      if (remember) {
        try {
          localStorage.setItem("ambit_customerId", String(parsedId));
          if (email.trim()) localStorage.setItem("ambit_email", email.trim());
        } catch {
          // ignore
        }
      }

      // Redirect
      const destination = safeNext || `/matches/${parsedId}`;
      router.push(destination);
    } catch (err: any) {
      setError(err?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen w-full bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900">
      <div className="mx-auto flex min-h-screen max-w-6xl items-center justify-center px-6 py-16">
        <div className="w-full max-w-xl rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white">
              A
            </div>
            <div>
              <div className="text-sm font-semibold text-white">AMBIT</div>
              <div className="text-xs text-white/60">
                Log in to view your match history
              </div>
            </div>
          </div>

          <h1 className="mt-6 text-3xl font-semibold tracking-tight text-white">
            Log in
          </h1>
          <p className="mt-2 text-sm text-white/70">
            Use your Customer ID. For extra verification, add the email you used
            during signup.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-white/70">
                Customer ID
              </label>
              <input
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                inputMode="numeric"
                placeholder="e.g., 1"
                className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none placeholder:text-white/30 focus:border-white/30"
              />
              <div className="mt-1 text-xs text-white/50">
                Don’t know it?{" "}
                <Link className="underline hover:text-white" href="/get-started">
                  Create your profile
                </Link>{" "}
                (you’ll be shown your Customer ID).
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-white/70">
                Email (recommended)
              </label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                inputMode="email"
                placeholder="you@company.com"
                className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none placeholder:text-white/30 focus:border-white/30"
              />
              {!apiBase && (
                <div className="mt-1 text-xs text-amber-200/80">
                  Note: email verification is disabled (missing
                  NEXT_PUBLIC_API_BASE_URL).
                </div>
              )}
            </div>

            <div className="flex items-center justify-between gap-3">
              <label className="flex cursor-pointer items-center gap-2 text-sm text-white/70">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="h-4 w-4 rounded border-white/20 bg-black/30"
                />
                Remember me
              </label>

              <Link
                href="/contact"
                className="text-sm text-white/70 underline hover:text-white"
              >
                Need help?
              </Link>
            </div>

            {error && (
              <div className="rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-100">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Signing in…" : "View My Matches"}
            </button>

            <div className="text-xs text-white/50">
              By continuing you agree to our{" "}
              <Link className="underline hover:text-white" href="/terms">
                Terms
              </Link>{" "}
              and{" "}
              <Link className="underline hover:text-white" href="/privacy">
                Privacy Policy
              </Link>
              .
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
