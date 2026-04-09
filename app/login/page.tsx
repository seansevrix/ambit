"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

const PROD_BACKEND = "https://ambit-0dnp.onrender.com";
const DEV_BACKEND = "http://localhost:5001";
const FALLBACK =
  process.env.NODE_ENV === "development" ? DEV_BACKEND : PROD_BACKEND;

const API_BASE = (
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_BASE ||
  FALLBACK
).replace(/\/$/, "");

const REQUEST_TIMEOUT_MS = 15000;
const EMAIL_KEY = "ambit_login_email";
const CONTAINER = "mx-auto max-w-[1240px] px-6 lg:px-10";

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden="true">
      <path
        d="M7.5 10.2V8.6a4.5 4.5 0 0 1 9 0v1.6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M6.8 10.2h10.4c.9 0 1.6.7 1.6 1.6v7.6c0 .9-.7 1.6-1.6 1.6H6.8c-.9 0-1.6-.7-1.6-1.6v-7.6c0-.9.7-1.6 1.6-1.6Z"
        stroke="currentColor"
        strokeWidth="2"
      />
    </svg>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#7A7590]">
      {children}
    </div>
  );
}

async function abortableFetch(
  url: string,
  init: RequestInit = {},
  ms = REQUEST_TIMEOUT_MS
) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), ms);

  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

function prettyErr(error: any) {
  if (error?.name === "AbortError") {
    return "Server is waking up — please retry in a few seconds.";
  }
  return error?.message || "Something went wrong. Please try again.";
}

function extractCustomerId(json: any) {
  return (
    json?.customerId ??
    json?.customer?.id ??
    json?.id ??
    json?.customer?.customerId ??
    null
  );
}

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [remember, setRemember] = useState(true);
  const [loadingLogin, setLoadingLogin] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(EMAIL_KEY) || "";
      if (stored) setEmail(stored);
    } catch {}
  }, []);

  useEffect(() => {
    const trimmed = email.trim().toLowerCase();

    if (remember && trimmed) {
      try {
        localStorage.setItem(EMAIL_KEY, trimmed);
      } catch {}
    }

    if (!remember) {
      try {
        localStorage.removeItem(EMAIL_KEY);
      } catch {}
    }
  }, [email, remember]);

  const canSubmit = useMemo(() => email.trim().length > 0, [email]);

  async function onLogin() {
    if (!canSubmit || loadingLogin) return;

    setErr(null);
    setLoadingLogin(true);

    try {
      const cleanEmail = email.trim().toLowerCase();

      if (!cleanEmail) {
        throw new Error("Enter your email.");
      }

      const res = await abortableFetch(`${API_BASE}/engine/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: cleanEmail }),
      });

      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(
          json?.error || json?.message || `Login failed (${res.status})`
        );
      }

      const idRaw = extractCustomerId(json);
      const id = idRaw ? Number(idRaw) : null;

      if (id && Number.isFinite(id)) {
        router.push(`/matches/${id}`);
      } else {
        router.push("/matches");
      }
    } catch (error: any) {
      setErr(prettyErr(error));
    } finally {
      setLoadingLogin(false);
    }
  }

  return (
    <main className="min-h-[calc(100vh-72px)] bg-[#E6F5F2] text-[#31245C]">
      <div className={`${CONTAINER} py-12 sm:py-16 lg:py-20`}>
        <div className="flex items-center justify-between gap-4">
          <Link
            href="/"
            className="text-sm font-semibold text-[#6A6775] transition hover:text-[#31245C]"
          >
            ← Back
          </Link>

          <div className="inline-flex items-center gap-2 rounded-full border border-[#2A8F8B]/15 bg-white px-3 py-1.5 text-xs font-semibold text-[#31245C] shadow-sm">
            <span className="text-[#2A8F8B]">
              <LockIcon />
            </span>
            Secure login
          </div>
        </div>

        <div className="mx-auto mt-12 max-w-[720px] rounded-[32px] bg-white p-8 shadow-[0_18px_40px_rgba(49,36,92,0.08)] sm:mt-16 sm:p-10">
          <Eyebrow>Account access</Eyebrow>

          <h1 className="mt-4 text-4xl font-black tracking-tight text-[#31245C] sm:text-5xl">
            Log in to AMBIT
          </h1>

          <p className="mt-4 max-w-[520px] text-base leading-8 text-[#6A6775]">
            Use the email connected to your account to continue to your matches.
          </p>

          <div className="mt-8">
            <label
              htmlFor="email"
              className="block text-sm font-semibold text-[#31245C]"
            >
              Email
            </label>

            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              className="mt-2 w-full rounded-[16px] border border-black/10 bg-[#F7F5F6] px-4 py-3.5 text-sm text-[#31245C] outline-none placeholder:text-[#7A7590] transition focus:border-[#2A8F8B] focus:ring-2 focus:ring-[#2A8F8B]/15"
            />
          </div>

          <div className="mt-3 flex flex-col gap-3 text-xs text-[#6A6775] sm:flex-row sm:items-center sm:justify-between">
            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="accent-[#2A8F8B]"
              />
              Remember me
            </label>

            <Link
              href="/get-started"
              className="font-semibold text-[#2A8F8B] transition hover:underline"
            >
              New here? Get started →
            </Link>
          </div>

          {err ? (
            <div className="mt-5 rounded-[16px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {err}
            </div>
          ) : null}

          <button
            onClick={onLogin}
            disabled={!canSubmit || loadingLogin}
            className="mt-6 inline-flex w-full items-center justify-center rounded-[16px] bg-[#2A8F8B] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-[#247d7a] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loadingLogin ? "Signing in..." : "Log in"}
          </button>

          <div className="mt-4 text-center text-xs text-[#7A7590]">
            Secure login • No spam
          </div>
        </div>
      </div>
    </main>
  );
}