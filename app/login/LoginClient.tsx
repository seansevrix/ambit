"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

function getBackendBaseUrl() {
  const raw =
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_BASE ||
    "";

  return raw.replace(/\/$/, "");
}

export default function LoginClient({ safeNext }: { safeNext?: string }) {
  const router = useRouter();

  const backend = useMemo(() => getBackendBaseUrl(), []);
  const [email, setEmail] = useState("");
  const [remember, setRemember] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const savedEmail = localStorage.getItem("ambit_email");
      if (savedEmail) setEmail(savedEmail);
    } catch {
      // ignore
    }
  }, []);

  function isValidEmail(v: string) {
    const s = v.trim().toLowerCase();
    return s.length >= 5 && s.includes("@") && s.includes(".");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const trimmedEmail = email.trim().toLowerCase();

    if (!isValidEmail(trimmedEmail)) {
      setError("Enter the email you used during signup.");
      return;
    }

    if (!backend) {
      setError("Login is unavailable (missing NEXT_PUBLIC_BACKEND_URL).");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${backend}/engine/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmedEmail }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(
          data?.error || "Login failed. Double-check your email and try again."
        );
      }

      const id = Number(data?.id);
      if (!id || !Number.isFinite(id)) {
        throw new Error("Login succeeded, but no account id was returned.");
      }

      if (remember) {
        try {
          localStorage.setItem("ambit_email", trimmedEmail);
        } catch {
          // ignore
        }
      } else {
        try {
          localStorage.removeItem("ambit_email");
        } catch {
          // ignore
        }
      }

      const destination = safeNext || `/matches/${id}`;
      router.push(destination);
      router.refresh();
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
                Enter your company portal to view your opportunity matches
              </div>
            </div>
          </div>

          <h1 className="mt-6 text-3xl font-semibold tracking-tight text-white">
            Company Portal
          </h1>
          <p className="mt-2 text-sm text-white/70">
            Enter the email you used when you signed up.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-white/70">
                Email
              </label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                inputMode="email"
                placeholder="you@company.com"
                className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none placeholder:text-white/30 focus:border-white/30"
              />

              {!backend && (
                <div className="mt-1 text-xs text-amber-200/80">
                  Missing frontend env: NEXT_PUBLIC_BACKEND_URL
                </div>
              )}

              <div className="mt-2 text-xs text-white/50">
                New here?{" "}
                <Link className="underline hover:text-white" href="/get-started">
                  Create your profile
                </Link>
                .
              </div>
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
              {loading ? "Signing in…" : "Show My Matches"}
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
