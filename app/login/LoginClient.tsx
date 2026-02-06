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

function isValidEmail(v: string) {
  const s = v.trim().toLowerCase();
  return s.length >= 5 && s.includes("@") && s.includes(".");
}

function extractCustomerId(data: any) {
  return (
    data?.customerId ??
    data?.customer?.id ??
    data?.id ??
    data?.customer?.customerId ??
    null
  );
}

function isActiveFrom(data: any) {
  return Boolean(
    data?.access?.isActive ??
      data?.isActive ??
      data?.customer?.isActive ??
      false
  );
}

export default function LoginClient({ safeNext }: { safeNext?: string }) {
  const router = useRouter();

  const backend = useMemo(() => getBackendBaseUrl(), []);
  const [email, setEmail] = useState("");
  const [remember, setRemember] = useState(true);

  const [loadingAction, setLoadingAction] = useState<"matches" | "plan" | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const savedEmail = localStorage.getItem("ambit_email");
      if (savedEmail) setEmail(savedEmail);
    } catch {
      // ignore
    }
  }, []);

  async function loginAndGetAccount(trimmedEmail: string) {
    if (!backend) {
      throw new Error("Login is unavailable (missing NEXT_PUBLIC_BACKEND_URL).");
    }

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

    const idRaw = extractCustomerId(data);
    const id = idRaw ? Number(idRaw) : null;
    const active = isActiveFrom(data);

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

    return { id: id && Number.isFinite(id) ? id : null, active };
  }

  async function handleShowMatches(e?: React.FormEvent) {
    if (e) e.preventDefault();
    setError(null);

    const trimmedEmail = email.trim().toLowerCase();
    if (!isValidEmail(trimmedEmail)) {
      setError("Enter the email you used during signup.");
      return;
    }

    setLoadingAction("matches");
    try {
      const { id } = await loginAndGetAccount(trimmedEmail);

      const destination = safeNext || (id ? `/matches/${id}` : "/matches");
      router.push(destination);
      router.refresh();
    } catch (err: any) {
      setError(err?.message || "Login failed. Please try again.");
    } finally {
      setLoadingAction(null);
    }
  }

  async function handleChoosePlan() {
    setError(null);

    const trimmedEmail = email.trim().toLowerCase();
    if (!isValidEmail(trimmedEmail)) {
      setError("Enter the email you used during signup.");
      return;
    }

    setLoadingAction("plan");
    try {
      const { id, active } = await loginAndGetAccount(trimmedEmail);

      if (active) {
        router.push(id ? `/matches/${id}` : "/matches");
        router.refresh();
        return;
      }

      router.push(`/choose-plan?email=${encodeURIComponent(trimmedEmail)}`);
      router.refresh();
    } catch (err: any) {
      setError(err?.message || "Unable to open plan selection.");
    } finally {
      setLoadingAction(null);
    }
  }

  const inputBase =
    "w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-white outline-none placeholder:text-white/30 focus:border-white/25 focus:bg-black/30 transition";

  const primaryBtn =
    "w-full rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-60";

  const secondaryBtn =
    "w-full rounded-2xl border border-white/25 bg-transparent px-4 py-3 text-sm font-semibold text-white hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60";

  return (
    <div>
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white">
          A
        </div>
        <div>
          <div className="text-sm font-semibold text-white">AMBIT</div>
          <div className="text-xs text-white/60">
            Enter your email to access your match dashboard
          </div>
        </div>
      </div>

      <div className="mt-5">
        <h2 className="text-2xl font-semibold tracking-tight text-white">
          Company Portal
        </h2>
        <p className="mt-1 text-sm text-white/70">
          Use the email you signed up with.
        </p>
      </div>

      <form onSubmit={handleShowMatches} className="mt-6 space-y-4">
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-white/70">
            Email
          </label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            inputMode="email"
            autoComplete="email"
            placeholder="you@company.com"
            className={inputBase}
          />

          {!backend ? (
            <div className="mt-2 rounded-xl border border-amber-300/15 bg-amber-400/10 px-3 py-2 text-xs text-amber-100/90">
              Missing env: <span className="font-semibold">NEXT_PUBLIC_BACKEND_URL</span>
            </div>
          ) : null}

          <div className="mt-2 text-xs text-white/55">
            New here?{" "}
            <Link className="font-semibold text-white/70 underline hover:text-white" href="/get-started">
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
            href="/support"
            className="text-sm font-semibold text-white/60 underline hover:text-white/80"
          >
            Need help?
          </Link>
        </div>

        {error ? (
          <div className="rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-100">
            {error}
          </div>
        ) : null}

        <div className="grid gap-3 sm:grid-cols-2">
          <button type="submit" disabled={loadingAction !== null} className={primaryBtn}>
            {loadingAction === "matches" ? "Signing in…" : "Show My Matches"}
          </button>

          <button
            type="button"
            onClick={handleChoosePlan}
            disabled={loadingAction !== null}
            className={secondaryBtn}
          >
            {loadingAction === "plan" ? "Opening Plans…" : "Choose Plan"}
          </button>
        </div>

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
  );
}
