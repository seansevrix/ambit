// app/get-started/GetStartedClient.tsx
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

type Market = "residential" | "commercial" | "government";
type Plan = "associate" | "executive";

function normalizeMarket(m: string | null): Market {
  if (m === "commercial" || m === "government" || m === "residential") return m;
  return "residential";
}

function normalizePlan(p: string | null): Plan {
  return p === "executive" ? "executive" : "associate";
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
  const selectedPlan = useMemo(() => normalizePlan(sp.get("plan")), [sp]);

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
        phoneNumber: trimmedPhone || null, // backend compatibility alias
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

      const q = new URLSearchParams();
      q.set("email", trimmedEmail);
      q.set("plan", selectedPlan);
      if (id != null && Number.isFinite(Number(id))) q.set("customerId", String(Number(id)));

      router.push(`/choose-plan?${q.toString()}`);
    } catch (e: any) {
      setErr(e?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-4">
      {/* plan preselect */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-black/55">Selected plan:</span>
        <span className="rounded-full border border-black/10 bg-white/80 px-3 py-1 text-xs font-semibold text-black/80">
          {selectedPlan === "executive" ? "Executive ($299/mo)" : "Associate ($49.99/mo)"}
        </span>
        <Link
          href={selectedPlan === "executive" ? "/get-started?plan=associate#signup-card" : "/get-started?plan=executive#signup-card"}
          className="text-xs font-semibold text-[#1A4FA3] hover:underline"
        >
          Switch
        </Link>
      </div>

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
          className="inline-flex items-center justify-center rounded-full bg-[#1A4FA3] px-10 py-3 text-sm font-semibold text-white shadow-[0_10px_28px_rgba(26,79,163,0.30)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Working..." : "Continue to plan selection"}
        </button>
      </div>

      <div className="pt-1 text-center text-xs text-black/45">
        No credit card required for profile setup. Billing starts only after you choose a plan.
      </div>
    </div>
  );
}
