// app/get-started/GetStartedClient.tsx
"use client";

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

type Market = "residential" | "commercial" | "government";

function normalizeMarket(m: string | null): Market {
  if (m === "commercial" || m === "government" || m === "residential") return m;
  return "residential";
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

    const trimmedEmail = email.trim().toLowerCase();
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
    <div className="grid gap-4">
      <div>
        <div className="text-xs font-semibold text-black/55">Work email *</div>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          inputMode="email"
          autoComplete="email"
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
          placeholder="landscaping, HVAC, concrete, hauling..."
          className="mt-2 w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm text-black placeholder:text-black/35 outline-none focus:border-[#63A7FF] focus:ring-2 focus:ring-[#63A7FF]/20"
        />
        <div className="mt-2 text-xs text-black/45">Services, equipment, materials, job types.</div>
      </div>

      <div>
        <div className="text-xs font-semibold text-black/55">NAICS codes</div>
        <input
          value={naics}
          onChange={(e) => setNaics(e.target.value)}
          placeholder="561730, 238220, 236220..."
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
        Secure signup • 7-day free access starts after profile creation
      </div>
    </div>
  );
}
