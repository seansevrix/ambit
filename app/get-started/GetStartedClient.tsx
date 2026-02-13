// app/get-started/GetStartedClient.tsx
"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

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
type Plan = "associate" | "executive" | "enterprise";

const ONBOARDING_MESSAGE =
  "To receive ongoing matches, RFQ alerts, and bid support, an active subscription is required.";

function normalizeMarket(m: string | null): Market {
  if (m === "commercial" || m === "government" || m === "residential") return m;
  return "residential";
}

function normalizePlan(p: string | null): Plan {
  const v = String(p || "").trim().toLowerCase();

  if (v === "enterprise") return "enterprise";
  if (v === "executive") return "executive";
  if (v === "associate") return "associate";

  // Enterprise aliases
  if (v === "corp" || v === "corporate" || v === "enterprise_plus") return "enterprise";

  // Back-compat aliases
  // Keep prime => executive for legacy links. New enterprise pages should use ?plan=enterprise.
  if (v === "all" || v === "all3" || v === "all_markets" || v === "prime") return "executive";
  if (v === "single" || v === "single_market" || v === "basic") return "associate";

  return "associate";
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
  const sp = useSearchParams();

  const intent = useMemo(() => normalizeMarket(sp.get("intent")), [sp]);
  const initialPlan = useMemo(() => normalizePlan(sp.get("plan")), [sp]);

  const [selectedPlan, setSelectedPlan] = useState<Plan>(initialPlan);

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

      // 1) Create/update customer profile
      const customerPayload = {
        email: trimmedEmail,
        phone: trimmedPhone || null,
        phoneNumber: trimmedPhone || null, // alias for backend compatibility
        companyName: companyName.trim() || null,
        name: companyName.trim() || null,
        serviceArea: serviceArea.trim() || null,
        location: serviceArea.trim() || null,
        keywords: keywords.trim() || null,
        naics: naics.trim() || null,
        intent,
        plan: selectedPlan,
        segments: ["residential", "commercial", "government"],
      };

      const { res: customerRes, json: customerJson } = await postJson(
        `${API_BASE}/engine/customers`,
        customerPayload
      );

      if (!customerRes.ok) {
        setErr(customerJson?.error || customerJson?.message || "Signup failed. Please try again.");
        return;
      }

      const customerId =
        customerJson?.customerId ??
        customerJson?.customer?.id ??
        customerJson?.id ??
        customerJson?.customer?.customerId ??
        null;

      // 2) Immediately create Stripe checkout session
      const { res: checkoutRes, json: checkoutJson } = await postJson(
        `${API_BASE}/engine/billing/create-checkout-session`,
        {
          customerId: customerId ?? undefined,
          email: trimmedEmail,
          plan: selectedPlan,
        }
      );

      if (!checkoutRes.ok) {
        setErr(
          checkoutJson?.error ||
            checkoutJson?.message ||
            "Could not start secure checkout. Please try again."
        );
        return;
      }

      const checkoutUrl = checkoutJson?.url;
      if (!checkoutUrl || typeof checkoutUrl !== "string") {
        setErr("Checkout link was missing. Please try again.");
        return;
      }

      // 3) Redirect to Stripe (payment required)
      window.location.href = checkoutUrl;
    } catch (e: any) {
      setErr(e?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-4">
      <div>
        <div className="text-xs font-semibold text-black/55">Choose plan *</div>
        <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3">
          <button
            type="button"
            onClick={() => setSelectedPlan("associate")}
            className={[
              "rounded-xl border px-4 py-3 text-left transition",
              selectedPlan === "associate"
                ? "border-[#63A7FF] bg-[#63A7FF]/10 ring-2 ring-[#63A7FF]/25"
                : "border-black/10 bg-white hover:border-black/20",
            ].join(" ")}
          >
            <div className="text-sm font-semibold text-black">Associate</div>
            <div className="text-xs text-black/55">$49.99/mo • Matches + alerts</div>
          </button>

          <button
            type="button"
            onClick={() => setSelectedPlan("executive")}
            className={[
              "rounded-xl border px-4 py-3 text-left transition",
              selectedPlan === "executive"
                ? "border-[#63A7FF] bg-[#63A7FF]/10 ring-2 ring-[#63A7FF]/25"
                : "border-black/10 bg-white hover:border-black/20",
            ].join(" ")}
          >
            <div className="text-sm font-semibold text-black">Executive</div>
            <div className="text-xs text-black/55">$299/mo • Bid-readiness support</div>
          </button>

          <button
            type="button"
            onClick={() => setSelectedPlan("enterprise")}
            className={[
              "rounded-xl border px-4 py-3 text-left transition",
              selectedPlan === "enterprise"
                ? "border-[#63A7FF] bg-[#63A7FF]/10 ring-2 ring-[#63A7FF]/25"
                : "border-black/10 bg-white hover:border-black/20",
            ].join(" ")}
          >
            <div className="text-sm font-semibold text-black">Enterprise</div>
            <div className="text-xs text-black/55">
              $899.99/mo • 24/7 founder access + priority sourcing desk
            </div>
          </button>
        </div>
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
          className="inline-flex items-center justify-center rounded-full bg-[#63A7FF] px-10 py-3 text-sm font-semibold text-white shadow-[0_10px_28px_rgba(99,167,255,0.35)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Working…" : "Continue to Secure Checkout"}
        </button>
      </div>

      <div className="pt-1 text-center text-xs text-black/45">{ONBOARDING_MESSAGE}</div>
    </div>
  );
}
