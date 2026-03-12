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

function PageBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[#EAF3FF]" />

      <div
        className="absolute inset-0 opacity-[0.16]"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(26,79,163,0.22) 1px, transparent 1px), linear-gradient(to bottom, rgba(26,79,163,0.22) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
        }}
      />

      <div
        className="absolute inset-0 opacity-100"
        style={{
          backgroundImage:
            "radial-gradient(circle at 18% 10%, rgba(99,167,255,0.55), transparent 55%), radial-gradient(circle at 78% 18%, rgba(26,79,163,0.22), transparent 52%), radial-gradient(circle at 70% 78%, rgba(99,167,255,0.30), transparent 58%)",
        }}
      />

      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(to bottom, rgba(234,243,255,0.00), rgba(234,243,255,0.85) 65%, rgba(234,243,255,1))",
        }}
      />
    </div>
  );
}

async function abortableFetch(
  url: string,
  init: RequestInit = {},
  ms = REQUEST_TIMEOUT_MS
) {
  const ac = new AbortController();
  const t = setTimeout(() => ac.abort(), ms);

  try {
    return await fetch(url, { ...init, signal: ac.signal });
  } finally {
    clearTimeout(t);
  }
}

function prettyErr(e: any) {
  if (e?.name === "AbortError") {
    return "Server is waking up — please retry in a few seconds.";
  }
  return e?.message || "Something went wrong. Please try again.";
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

  async function onShowMatches() {
    if (!canSubmit || loadingLogin) return;

    setErr(null);
    setLoadingLogin(true);

    try {
      const cleanEmail = email.trim().toLowerCase();
      if (!cleanEmail) throw new Error("Enter your email.");

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
    } catch (e: any) {
      setErr(prettyErr(e));
    } finally {
      setLoadingLogin(false);
    }
  }

  return (
    <main className="relative min-h-[calc(100vh-72px)] px-6 py-14 text-black">
      <PageBackdrop />

      <div className="relative z-10 mx-auto max-w-[980px]">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-black/70 hover:text-black"
        >
          <span aria-hidden>←</span> Back
        </Link>

        <div className="mx-auto mt-10 w-full max-w-[720px] rounded-[28px] bg-white/75 shadow-[0_30px_90px_rgba(0,0,0,0.12)] backdrop-blur-md">
          <div className="px-8 py-7 sm:px-10 sm:py-9">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-[11px] font-black tracking-[0.16em] text-black/50">
                  COMPANY PORTAL
                </div>
                <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
                  Log in to your matches
                </h1>
                <p className="mt-2 text-sm text-black/60">
                  Enter the email you signed up with.
                </p>
              </div>

              <div className="hidden items-center gap-2 rounded-full border border-black/10 bg-white px-3 py-1 text-xs font-semibold text-black/60 sm:flex">
                Secure login
              </div>
            </div>

            <div className="mt-7 grid gap-4">
              <div>
                <div className="text-xs font-semibold text-black/55">Email</div>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="mt-2 w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm text-black placeholder:text-black/35 outline-none focus:border-[#63A7FF] focus:ring-2 focus:ring-[#63A7FF]/20"
                />

                <div className="mt-2 flex items-center justify-between text-xs text-black/55">
                  <label className="inline-flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={remember}
                      onChange={(e) => setRemember(e.target.checked)}
                    />
                    Remember me
                  </label>

                  <Link
                    href="/get-started"
                    className="font-semibold text-[#1A4FA3] hover:underline"
                  >
                    New here? Create your profile →
                  </Link>
                </div>
              </div>

              {err ? (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {err}
                </div>
              ) : null}

              <button
                onClick={onShowMatches}
                disabled={!canSubmit || loadingLogin}
                className="inline-flex items-center justify-center rounded-full bg-[#1A4FA3] px-8 py-3 text-sm font-semibold text-white shadow-[0_10px_28px_rgba(26,79,163,0.25)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loadingLogin ? "Signing in…" : "Show My Matches"}
              </button>

              <div className="pt-1 text-center text-xs text-black/40">
                Secure login • No spam
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}