"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const PROD_BACKEND = "https://ambit-0dnp.onrender.com";
const DEV_BACKEND = "http://localhost:5001";
const FALLBACK = process.env.NODE_ENV === "development" ? DEV_BACKEND : PROD_BACKEND;

const API_BASE = (
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_BASE ||
  FALLBACK
).replace(/\/$/, "");

const REQUEST_TIMEOUT_MS = 15000;

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
        className="absolute inset-0"
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

async function postJson(url: string, body: any, ms = REQUEST_TIMEOUT_MS) {
  const ac = new AbortController();
  const t = setTimeout(() => ac.abort(), ms);

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(body),
      signal: ac.signal,
    });

    const json = await res.json().catch(() => ({}));
    return { res, json };
  } catch (e: any) {
    if (e?.name === "AbortError") {
      throw new Error("Server is waking up — please retry in a few seconds.");
    }
    throw new Error(e?.message || "Network error — please retry.");
  } finally {
    clearTimeout(t);
  }
}

type Market = "residential" | "commercial" | "government";

function normalizeMarket(m: string | null): Market {
  if (m === "commercial" || m === "government" || m === "residential") return m;
  return "residential";
}

export default function GetStartedClient() {
  const router = useRouter();
  const sp = useSearchParams();

  const intent = useMemo(() => normalizeMarket(sp.get("intent")), [sp]);

  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [serviceArea, setServiceArea] = useState("");
  const [keywords, setKeywords] = useState("");
  const [naics, setNaics] = useState("");

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onContinue() {
    if (loading) return;

    setErr(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setErr("Please enter your work email.");
      return;
    }

    setLoading(true);
    try {
      const trimmedPhone = phone.trim();

      const payload = {
        email: trimmedEmail,
        phone: trimmedPhone || null,
        phoneNumber: trimmedPhone || null, // optional alias for backend compatibility
        companyName: companyName.trim() || null,
        name: companyName.trim() || null,
        serviceArea: serviceArea.trim() || null,
        location: serviceArea.trim() || null,
        keywords: keywords.trim() || null,
        naics: naics.trim() || null,
        intent,
        segments: ["residential", "commercial", "government"],
      };

      const { res, json } = await postJson(`${API_BASE}/engine/customers`, payload);

      if (!res.ok) {
        setErr(json?.error || json?.message || "Signup failed. Please try again.");
        return;
      }

      const id =
        json?.customerId ??
        json?.customer?.id ??
        json?.id ??
        json?.customer?.customerId ??
        null;

      if (id) router.push(`/matches/${id}`);
      else router.push(`/matches`);
    } catch (e: any) {
      setErr(e?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative min-h-[calc(100vh-72px)] px-6 py-14 text-black">
      <PageBackdrop />

      <div className="relative z-10">
        {/* Top bar */}
        <div className="mx-auto max-w-[980px]">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-black/70 hover:text-black"
          >
            <span aria-hidden>←</span> Back
          </Link>
        </div>

        {/* Centered card (modal-style) */}
        <div className="mx-auto mt-10 max-w-[980px]">
          <div className="mx-auto w-full max-w-[780px] rounded-[28px] bg-white/75 backdrop-blur-md shadow-[0_30px_90px_rgba(0,0,0,0.12)]">
            <div className="px-8 py-7 sm:px-10 sm:py-9">
              <div className="text-[11px] font-black tracking-[0.16em] text-black/50">SIGN UP</div>

              <div className="mt-2">
                <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
                  Create your AMBIT profile
                </h1>
                <p className="mt-2 text-sm text-black/60">
                  Enter the basics — we’ll tailor your matches automatically.
                </p>
              </div>

              <div className="mt-5 text-sm font-semibold text-black/70">
                Markets:{" "}
                <span className="font-black text-black/85">
                  Residential, Commercial, Government
                </span>
              </div>

              <div className="mt-6 grid gap-4">
                <div>
                  <div className="text-xs font-semibold text-black/55">Work email</div>
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    className="mt-2 w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm text-black placeholder:text-black/35 outline-none focus:border-[#63A7FF] focus:ring-2 focus:ring-[#63A7FF]/20"
                  />
                </div>

                <div>
                  <div className="text-xs font-semibold text-black/55">Phone number</div>
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    placeholder="(555) 123-4567"
                    className="mt-2 w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm text-black placeholder:text-black/35 outline-none focus:border-[#63A7FF] focus:ring-2 focus:ring-[#63A7FF]/20"
                  />
                </div>

                <div>
                  <div className="text-xs font-semibold text-black/55">Company name</div>
                  <input
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Your Company"
                    className="mt-2 w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm text-black placeholder:text-black/35 outline-none focus:border-[#63A7FF] focus:ring-2 focus:ring-[#63A7FF]/20"
                  />
                </div>

                <div>
                  <div className="text-xs font-semibold text-black/55">Service area</div>
                  <input
                    value={serviceArea}
                    onChange={(e) => setServiceArea(e.target.value)}
                    placeholder="City, county, or state"
                    className="mt-2 w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm text-black placeholder:text-black/35 outline-none focus:border-[#63A7FF] focus:ring-2 focus:ring-[#63A7FF]/20"
                  />
                </div>

                <div>
                  <div className="text-xs font-semibold text-black/55">Keywords</div>
                  <input
                    value={keywords}
                    onChange={(e) => setKeywords(e.target.value)}
                    placeholder="landscaping, HVAC, concrete, hauling…"
                    className="mt-2 w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm text-black placeholder:text-black/35 outline-none focus:border-[#63A7FF] focus:ring-2 focus:ring-[#63A7FF]/20"
                  />
                  <div className="mt-2 text-xs text-black/45">
                    Services, equipment, materials, job types.
                  </div>
                </div>

                <div>
                  <div className="text-xs font-semibold text-black/55">NAICS codes</div>
                  <input
                    value={naics}
                    onChange={(e) => setNaics(e.target.value)}
                    placeholder="561730, 238220, 236220…"
                    className="mt-2 w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm text-black placeholder:text-black/35 outline-none focus:border-[#63A7FF] focus:ring-2 focus:ring-[#63A7FF]/20"
                  />
                  <div className="mt-2 text-xs text-black/45">Comma-separated is fine.</div>
                </div>

                {err ? (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {err}
                  </div>
                ) : null}

                <div className="mt-2 flex items-center justify-end">
                  <button
                    onClick={onContinue}
                    disabled={loading}
                    className="inline-flex items-center justify-center rounded-full bg-[#63A7FF] px-10 py-3 text-sm font-semibold text-white shadow-[0_10px_28px_rgba(99,167,255,0.35)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? "Working…" : "Continue"}
                  </button>
                </div>

                <div className="pt-1 text-center text-xs text-black/40">
                  Secure signup • No spam
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
