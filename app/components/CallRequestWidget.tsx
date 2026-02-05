"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

const MODE_KEY = "ambit_call_widget_mode_v1"; // "docked" | "hidden"
const SUBMITTED_KEY = "ambit_call_widget_submitted_v1";

type Mode = "modal" | "docked" | "hidden";

function isValidEmail(s: string) {
  const email = String(s || "").trim();
  if (!email) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(email);
}

export default function CallRequestWidget() {
  const [mode, setMode] = useState<Mode>("hidden");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const triggeredRef = useRef(false);

  // ✅ Formspree (or any lead-capture endpoint you control)
  const LEAD_CAPTURE_URL =
    process.env.NEXT_PUBLIC_LEAD_CAPTURE_URL ||
    process.env.NEXT_PUBLIC_FORMSPREE_URL ||
    "";

  const canSubmit = useMemo(() => {
    return isValidEmail(email) && !sending && !sent;
  }, [email, sending, sent]);

  function persistMode(next: Mode) {
    setMode(next);
    try {
      if (next === "modal") return; // don’t persist modal
      localStorage.setItem(MODE_KEY, next);
    } catch {
      // ignore
    }
  }

  function minimize() {
    persistMode("docked");
  }

  // Boot: show modal via (exit intent OR scroll depth OR delay) unless previously submitted,
  // or user already minimized it.
  useEffect(() => {
    let delayTimer: any = null;
    const cleanupFns: Array<() => void> = [];

    function cleanup() {
      cleanupFns.forEach((fn) => {
        try {
          fn();
        } catch {
          // ignore
        }
      });
      cleanupFns.length = 0;

      if (delayTimer) {
        clearTimeout(delayTimer);
        delayTimer = null;
      }
    }

    function showModalOnce() {
      if (triggeredRef.current) return;
      triggeredRef.current = true;
      setMode("modal");
      cleanup();
    }

    // Respect “submitted” + remembered mode
    try {
      const submitted = localStorage.getItem(SUBMITTED_KEY) === "1";
      if (submitted) return;

      const saved = (localStorage.getItem(MODE_KEY) || "") as Mode;
      if (saved === "docked") {
        setMode("docked");
        return;
      }
      if (saved === "hidden") {
        setMode("hidden");
        return;
      }
    } catch {
      // ignore
    }

    // Trigger #1: delay (give them time to read first)
    delayTimer = setTimeout(() => showModalOnce(), 25000);

    // Trigger #2: scroll depth
    const onScroll = () => {
      if (triggeredRef.current) return;
      const doc = document.documentElement;
      const scrollTop = window.scrollY || doc.scrollTop || 0;
      const maxScroll = (doc.scrollHeight || 1) - (window.innerHeight || 1);
      const pct = maxScroll > 0 ? scrollTop / maxScroll : 0;
      if (pct >= 0.55) showModalOnce();
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    cleanupFns.push(() => window.removeEventListener("scroll", onScroll));

    // Trigger #3: exit intent (desktop)
    const onMouseOut = (e: MouseEvent) => {
      if (triggeredRef.current) return;
      if (e.clientY <= 0) showModalOnce();
    };
    window.addEventListener("mouseout", onMouseOut);
    cleanupFns.push(() => window.removeEventListener("mouseout", onMouseOut));

    return () => cleanup();
  }, []);

  async function submit() {
    setErr(null);

    if (!isValidEmail(email)) {
      setErr("Please enter a valid email.");
      return;
    }

    if (!LEAD_CAPTURE_URL) {
      setErr(
        "Lead capture isn’t configured yet. Set NEXT_PUBLIC_LEAD_CAPTURE_URL in Vercel and redeploy."
      );
      return;
    }

    setSending(true);
    try {
      // ✅ Formspree-friendly payload
      const form = new FormData();
      form.append("email", email.trim());

      const cleanPhone = phone.trim();
      if (cleanPhone) {
        form.append("phone", cleanPhone);
        form.append("phone_number", cleanPhone); // optional alias
      }

      form.append("page", typeof window !== "undefined" ? window.location.href : "");
      form.append("source", "free-matches-popup");
      form.append("intent", "free-matches");
      form.append("_subject", "New AMBIT: Free matches request");

      const res = await fetch(LEAD_CAPTURE_URL, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: form,
      });

      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(
          json?.error || json?.message || `Request failed (${res.status})`
        );
      }

      setSent(true);
      try {
        localStorage.setItem(SUBMITTED_KEY, "1");
      } catch {
        // ignore
      }
    } catch (e: any) {
      setErr(e?.message || "Something went wrong.");
    } finally {
      setSending(false);
    }
  }

  if (mode === "hidden") return null;

  // Docked pill
  if (mode === "docked") {
    return (
      <button
        type="button"
        onClick={() => setMode("modal")}
        className="fixed bottom-6 right-6 z-50 inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-black/80 shadow-lg hover:bg-black/[0.03]"
      >
        <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500" />
        Free matches
      </button>
    );
  }

  // Modal mode
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Minimize"
        onClick={minimize}
        className="absolute inset-0 bg-black/25"
      />

      <div className="relative w-full max-w-[440px] overflow-hidden rounded-3xl border border-black/10 bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-3 border-b border-black/10 px-5 py-4">
          <div className="min-w-0">
            <div className="text-xs font-black tracking-[0.16em] text-black/45">
              FREE MATCHES
            </div>
            <div className="mt-1 text-base font-black leading-snug text-black">
              Want free matches tomorrow morning?
            </div>
            <div className="mt-1 text-sm leading-relaxed text-black/65">
              Enter your email and we’ll send sample opportunities to show how
              AMBIT works.
              <span className="block mt-1 text-[12px] text-black/45">
                No spam. Unsubscribe anytime.
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={minimize}
            className="rounded-xl border border-black/10 bg-white px-3 py-2 text-xs font-semibold text-black/60 hover:bg-black/[0.03]"
          >
            Minimize
          </button>
        </div>

        <div className="px-5 py-4">
          {sent ? (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm text-emerald-900">
              <div className="font-semibold">You’re in.</div>
              <div className="mt-1 text-emerald-900/80">
                We’ll email your matches starting tomorrow morning.
              </div>

              <div className="mt-4 grid gap-2">
                <Link
                  href="/get-started"
                  className="inline-flex w-full items-center justify-center rounded-2xl bg-[#1A4FA3] px-4 py-3 text-sm font-semibold text-white hover:bg-[#15428B]"
                >
                  Start 7-day free trial
                </Link>

                <button
                  type="button"
                  onClick={minimize}
                  className="inline-flex w-full items-center justify-center rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm font-semibold text-black/70 hover:bg-black/[0.03]"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="grid gap-3">
                <div>
                  <div className="text-xs font-semibold text-black/55">Email</div>
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Work email"
                    inputMode="email"
                    autoComplete="email"
                    className="mt-2 w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm text-black placeholder:text-black/35 outline-none focus:border-[#63A7FF] focus:ring-2 focus:ring-[#63A7FF]/20"
                  />
                  <div className="mt-2 text-[11px] leading-relaxed text-black/45">
                    We’ll only use this to send your matches and AMBIT updates.
                  </div>
                </div>

                <div>
                  <div className="text-xs font-semibold text-black/55">Phone Number</div>
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(555) 123-4567"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    className="mt-2 w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm text-black placeholder:text-black/35 outline-none focus:border-[#63A7FF] focus:ring-2 focus:ring-[#63A7FF]/20"
                  />
                </div>

                {err ? (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {err}
                  </div>
                ) : null}
              </div>

              <div className="mt-4 grid gap-2">
                <button
                  type="button"
                  onClick={submit}
                  disabled={!canSubmit}
                  className="inline-flex w-full items-center justify-center rounded-2xl bg-[#1A4FA3] px-4 py-3 text-sm font-semibold text-white hover:bg-[#15428B] disabled:opacity-60"
                >
                  {sending ? "Sending…" : "Send my matches"}
                </button>

                <Link
                  href="/get-started"
                  className="inline-flex w-full items-center justify-center rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm font-semibold text-black/70 hover:bg-black/[0.03]"
                >
                  Or start the 7-day free trial
                </Link>

                <button
                  type="button"
                  onClick={minimize}
                  className="text-xs font-semibold text-black/45 hover:text-black/60"
                >
                  Not now
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
