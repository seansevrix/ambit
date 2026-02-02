"use client";

import { useEffect, useMemo, useState } from "react";

const PROD_BACKEND = "https://ambit-0dnp.onrender.com";
const DEV_BACKEND = "http://localhost:5001";
const FALLBACK =
  process.env.NODE_ENV === "development" ? DEV_BACKEND : PROD_BACKEND;

const RAW_BASE =
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_BASE ||
  FALLBACK;

const API_BASE = String(RAW_BASE).replace(/\/$/, "");

const DISMISS_KEY = "ambit_call_widget_dismissed_v1";
const SUBMITTED_KEY = "ambit_call_widget_submitted_v1";

function digitsOnly(s: string) {
  return String(s || "").replace(/[^\d]/g, "");
}

function isValidPhone(s: string) {
  const d = digitsOnly(s);
  // allow US 10-digit, or 11-digit starting with 1
  return d.length === 10 || (d.length === 11 && d.startsWith("1"));
}

export default function CallRequestWidget() {
  const [open, setOpen] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [phone, setPhone] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const canSubmit = useMemo(() => {
    return !!firstName.trim() && isValidPhone(phone) && !sending && !sent;
  }, [firstName, phone, sending, sent]);

  // Auto-open after a short delay, but only if not dismissed/submitted before
  useEffect(() => {
    try {
      const dismissed = localStorage.getItem(DISMISS_KEY) === "1";
      const submitted = localStorage.getItem(SUBMITTED_KEY) === "1";
      if (dismissed || submitted) return;
    } catch {
      // ignore
    }

    const t = setTimeout(() => setOpen(true), 9000);
    return () => clearTimeout(t);
  }, []);

  function dismiss() {
    setOpen(false);
    try {
      localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      // ignore
    }
  }

  async function submit() {
    setErr(null);

    if (!firstName.trim()) {
      setErr("Please enter your first name.");
      return;
    }

    if (!isValidPhone(phone)) {
      setErr("Please enter a valid phone number.");
      return;
    }

    setSending(true);
    try {
      const res = await fetch(`${API_BASE}/engine/leads/call-request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          firstName: firstName.trim(),
          phone: phone.trim(),
          page: typeof window !== "undefined" ? window.location.href : null,
        }),
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(json?.error || json?.message || `Request failed (${res.status})`);
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

  // Collapsed button (when closed)
  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 hidden sm:inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-black/80 shadow-lg hover:bg-black/[0.03]"
      >
        <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500" />
        5-min call?
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 z-50 w-auto sm:w-[360px]">
      <div className="rounded-3xl border border-black/10 bg-white shadow-2xl overflow-hidden">
        <div className="flex items-start justify-between gap-3 px-5 py-4 border-b border-black/10">
          <div className="min-w-0">
            <div className="text-xs font-black tracking-[0.16em] text-black/45">
              QUICK CHAT
            </div>
            <div className="mt-1 text-base font-black text-black leading-snug">
              Still haven’t signed up?
            </div>
            <div className="mt-1 text-sm text-black/65 leading-relaxed">
              AMBIT would love a quick 5-minute phone call to learn your needs and
              show you how matches work.
            </div>
          </div>

          <button
            type="button"
            onClick={dismiss}
            className="rounded-xl border border-black/10 bg-white px-3 py-2 text-xs font-semibold text-black/60 hover:bg-black/[0.03]"
            aria-label="Close"
          >
            Close
          </button>
        </div>

        <div className="px-5 py-4">
          {sent ? (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm text-emerald-900">
              <div className="font-semibold">Thank you.</div>
              <div className="mt-1 text-emerald-900/80">
                An AMBIT associate will reach out via call within the next business day.
              </div>

              <button
                type="button"
                onClick={dismiss}
                className="mt-4 inline-flex items-center justify-center rounded-xl bg-[#1A4FA3] px-4 py-2 text-sm font-semibold text-white hover:bg-[#15428B]"
              >
                Done
              </button>
            </div>
          ) : (
            <>
              <div className="grid gap-3">
                <div>
                  <div className="text-xs font-semibold text-black/55">First name</div>
                  <input
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Sean"
                    className="mt-2 w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm text-black placeholder:text-black/35 outline-none focus:border-[#63A7FF] focus:ring-2 focus:ring-[#63A7FF]/20"
                  />
                </div>

                <div>
                  <div className="text-xs font-semibold text-black/55">Phone number</div>
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(555) 555-5555"
                    inputMode="tel"
                    className="mt-2 w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm text-black placeholder:text-black/35 outline-none focus:border-[#63A7FF] focus:ring-2 focus:ring-[#63A7FF]/20"
                  />
                  <div className="mt-2 text-[11px] text-black/45 leading-relaxed">
                    By submitting, you agree AMBIT may contact you about your account.
                  </div>
                </div>

                {err ? (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {err}
                  </div>
                ) : null}
              </div>

              <div className="mt-4 flex items-center gap-2">
                <button
                  type="button"
                  onClick={submit}
                  disabled={!canSubmit}
                  className="inline-flex flex-1 items-center justify-center rounded-2xl bg-[#1A4FA3] px-4 py-3 text-sm font-semibold text-white hover:bg-[#15428B] disabled:opacity-60"
                >
                  {sending ? "Sending…" : "Request a call"}
                </button>

                <button
                  type="button"
                  onClick={dismiss}
                  className="inline-flex items-center justify-center rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm font-semibold text-black/60 hover:bg-black/[0.03]"
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
