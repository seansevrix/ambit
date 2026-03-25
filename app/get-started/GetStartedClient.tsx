"use client";

import { useMemo, useState, type ReactNode } from "react";
import { useSearchParams } from "next/navigation";

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

type Market = "commercial" | "government";
type UiPlan = "starter" | "managed_capture";
type BackendPlan = "starter" | "enterprise";

const ONBOARDING_MESSAGE =
  "Next: confirm securely in Stripe. After activation, AMBIT starts sending ranked matches daily and you can update your profile anytime.";

function normalizeMarket(m: string | null): Market {
  const v = String(m || "").trim().toLowerCase();
  if (v === "commercial" || v === "government") return v;
  return "commercial";
}

function normalizeUiPlan(p: string | null): UiPlan {
  const v = String(p || "").trim().toLowerCase();

  if (
    v === "managed_capture" ||
    v === "managed-capture" ||
    v === "managed" ||
    v === "capture" ||
    v === "enterprise" ||
    v === "premium"
  ) {
    return "managed_capture";
  }

  if (
    v === "starter" ||
    v === "matches" ||
    v === "morning_matches" ||
    v === "morning-matches" ||
    v === "basic"
  ) {
    return "starter";
  }

  return "managed_capture";
}

function toBackendPlan(plan: UiPlan): BackendPlan {
  return plan === "managed_capture" ? "enterprise" : "starter";
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

function Pill({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/70 px-3 py-1 text-[11px] font-semibold text-black/65 backdrop-blur">
      <span className="h-1.5 w-1.5 rounded-full bg-[#1A4FA3]" />
      {children}
    </span>
  );
}

function CheckIcon() {
  return <span className="font-black text-[#1A4FA3]">✓</span>;
}

function PlanButton({
  active,
  title,
  priceLine,
  desc,
  bullets,
  onClick,
  featured,
  badge,
}: {
  active: boolean;
  title: string;
  priceLine: string;
  desc: string;
  bullets: string[];
  onClick: () => void;
  featured?: boolean;
  badge?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "group relative rounded-[28px] border p-5 text-left transition",
        active
          ? "border-[#1A4FA3]/40 bg-[linear-gradient(135deg,rgba(26,79,163,0.12),rgba(99,167,255,0.06))] ring-2 ring-[#1A4FA3]/20"
          : "border-black/10 bg-white/75 hover:border-black/20",
        featured
          ? "shadow-[0_18px_55px_rgba(26,79,163,0.12)]"
          : "shadow-[0_14px_40px_rgba(0,0,0,0.06)]",
      ].join(" ")}
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-black/45">
          {featured ? "Main offer" : "Alternative"}
        </span>

        {badge ? (
          <span className="rounded-full border border-[#1A4FA3]/25 bg-white/80 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide text-[#1A4FA3]">
            {badge}
          </span>
        ) : null}
      </div>

      <div className="text-xl font-black tracking-tight text-black">{title}</div>
      <div className="mt-1 text-sm font-semibold text-black/70">{priceLine}</div>
      <div className="mt-3 text-sm leading-7 text-black/62">{desc}</div>

      <ul className="mt-4 space-y-2">
        {bullets.map((bullet) => (
          <li key={bullet} className="flex items-start gap-2 text-sm text-black/80">
            <span className="mt-[1px]">
              <CheckIcon />
            </span>
            <span>{bullet}</span>
          </li>
        ))}
      </ul>

      <div className="pointer-events-none absolute inset-0 rounded-[28px] opacity-0 transition group-hover:opacity-100">
        <div className="absolute inset-0 rounded-[28px] bg-[radial-gradient(700px_250px_at_0%_0%,rgba(92,116,255,0.10),transparent_60%)]" />
      </div>
    </button>
  );
}

function FieldLabel({
  children,
  required = false,
}: {
  children: ReactNode;
  required?: boolean;
}) {
  return (
    <div className="flex items-center gap-1 text-xs font-semibold text-black/55">
      <span>{children}</span>
      {required ? <span className="text-black/60">*</span> : null}
    </div>
  );
}

function isValidEmail(value: string) {
  return /\S+@\S+\.\S+/.test(value);
}

export default function GetStartedClient() {
  const sp = useSearchParams();

  const intent = useMemo(() => normalizeMarket(sp.get("intent")), [sp]);
  const defaultPlan = useMemo(() => normalizeUiPlan(sp.get("plan")), [sp]);

  const [selectedPlan, setSelectedPlan] = useState<UiPlan>(defaultPlan);
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [serviceArea, setServiceArea] = useState("");
  const [keywords, setKeywords] = useState("");
  const [naics, setNaics] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const selectedPlanName =
    selectedPlan === "managed_capture" ? "Managed Capture" : "Morning Matches";

  async function onContinue() {
    if (loading) return;
    setErr(null);

    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedEmail || !isValidEmail(trimmedEmail)) {
      setErr("Please enter a valid work email.");
      return;
    }

    const backendPlan = toBackendPlan(selectedPlan);

    setLoading(true);
    try {
      const trimmedPhone = phone.trim();
      const trimmedCompanyName = companyName.trim();
      const trimmedServiceArea = serviceArea.trim();
      const trimmedKeywords = keywords.trim();
      const trimmedNaics = naics.trim();

      const customerPayload = {
        email: trimmedEmail,
        phone: trimmedPhone || null,
        phoneNumber: trimmedPhone || null,
        companyName: trimmedCompanyName || null,
        name: trimmedCompanyName || null,
        serviceArea: trimmedServiceArea || null,
        location: trimmedServiceArea || null,
        keywords: trimmedKeywords || null,
        naics: trimmedNaics || null,
        intent,
        plan: backendPlan,
        requestedPlan: selectedPlan,
        selectedPlan,
        offerName: selectedPlanName,
        segments: ["commercial", "government"],
      };

      const { res: customerRes, json: customerJson } = await postJson(
        `${API_BASE}/engine/customers`,
        customerPayload
      );

      if (!customerRes.ok) {
        setErr(
          customerJson?.error ||
            customerJson?.message ||
            "Signup failed. Please try again."
        );
        return;
      }

      const customerId =
        customerJson?.customerId ??
        customerJson?.customer?.id ??
        customerJson?.id ??
        customerJson?.customer?.customerId ??
        null;

      const checkoutPayload = {
        customerId: customerId ?? undefined,
        email: trimmedEmail,
        plan: backendPlan,
        requestedPlan: selectedPlan,
        selectedPlan,
        offerName: selectedPlanName,
      };

      const { res: checkoutRes, json: checkoutJson } = await postJson(
        `${API_BASE}/engine/billing/create-checkout-session`,
        checkoutPayload
      );

      if (!checkoutRes.ok) {
        setErr(
          checkoutJson?.error ||
            checkoutJson?.message ||
            "Could not start secure checkout. Please try again."
        );
        return;
      }

      const checkoutUrl =
        checkoutJson?.url ||
        checkoutJson?.checkoutUrl ||
        checkoutJson?.sessionUrl;

      if (!checkoutUrl || typeof checkoutUrl !== "string") {
        setErr("Checkout link was missing. Please try again.");
        return;
      }

      window.location.href = checkoutUrl;
    } catch (e: any) {
      setErr(e?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-6">
      <div>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <div className="text-xs font-semibold text-black/55">Choose plan *</div>
            <div className="mt-1 text-xs text-black/45">
              Managed Capture is the main lane. Morning Matches is the cheap self-serve option.
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Pill>Direct Stripe checkout</Pill>
            <Pill>No request form</Pill>
            <Pill>Cancel anytime</Pill>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <PlanButton
            active={selectedPlan === "managed_capture"}
            title="Managed Capture"
            priceLine="$1,499.99/mo • High-touch bid support"
            desc="AMBIT helps source work, pressure-test fits, support proposal development, track amendments, and keep the front-end bid workload moving."
            bullets={[
              "Active opportunity sourcing",
              "Capture + proposal support lane",
              "Amendment + deadline tracking",
              "Priority handling on active pursuits",
            ]}
            onClick={() => setSelectedPlan("managed_capture")}
            featured
            badge="Main offer"
          />

          <PlanButton
            active={selectedPlan === "starter"}
            title="Morning Matches"
            priceLine="$49.99/mo • Daily ranked opportunities"
            desc="Cheap self-serve lane for companies that only want opportunities delivered and prefer to handle the rest internally."
            bullets={[
              "Daily matched opportunities",
              "Ranked by fit",
              "Simple self-serve lane",
              "Low-cost entry point",
            ]}
            onClick={() => setSelectedPlan("starter")}
          />
        </div>
      </div>

      <div className="grid gap-4">
        <div>
          <FieldLabel required>Work email</FieldLabel>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            inputMode="email"
            autoComplete="email"
            placeholder="you@company.com"
            className="mt-2 w-full rounded-2xl border border-black/10 bg-white/80 px-4 py-3 text-sm text-black placeholder:text-black/35 outline-none focus:border-[#1A4FA3]/40 focus:ring-2 focus:ring-[#1A4FA3]/15"
          />
          <div className="mt-2 text-xs text-black/45">
            Only your work email is required to continue.
          </div>
        </div>

        <div>
          <FieldLabel>Service area</FieldLabel>
          <input
            value={serviceArea}
            onChange={(e) => setServiceArea(e.target.value)}
            placeholder="City, county, or state"
            className="mt-2 w-full rounded-2xl border border-black/10 bg-white/80 px-4 py-3 text-sm text-black placeholder:text-black/35 outline-none focus:border-[#1A4FA3]/40 focus:ring-2 focus:ring-[#1A4FA3]/15"
          />
          <div className="mt-2 text-xs text-black/45">
            Helps AMBIT sharpen your targeting.
          </div>
        </div>

        <div>
          <FieldLabel>Keywords</FieldLabel>
          <input
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            placeholder="HVAC, electrical, concrete, sitework..."
            className="mt-2 w-full rounded-2xl border border-black/10 bg-white/80 px-4 py-3 text-sm text-black placeholder:text-black/35 outline-none focus:border-[#1A4FA3]/40 focus:ring-2 focus:ring-[#1A4FA3]/15"
          />
          <div className="mt-2 text-xs text-black/45">
            Services, materials, scopes, job types.
          </div>
        </div>
      </div>

      <details className="group rounded-2xl border border-black/10 bg-white/55 px-4 py-3">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3">
          <div>
            <div className="text-sm font-semibold text-black/80">
              Optional profile details
            </div>
            <div className="text-xs text-black/50">
              Add company, phone, and NAICS now — or skip and update later.
            </div>
          </div>

          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-black/10 bg-white/80 text-black/60 transition group-open:rotate-45">
            +
          </span>
        </summary>

        <div className="mt-4 grid gap-4">
          <div>
            <FieldLabel>Company name</FieldLabel>
            <input
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Your Company"
              className="mt-2 w-full rounded-2xl border border-black/10 bg-white/90 px-4 py-3 text-sm text-black placeholder:text-black/35 outline-none focus:border-[#1A4FA3]/40 focus:ring-2 focus:ring-[#1A4FA3]/15"
            />
          </div>

          <div>
            <FieldLabel>Phone number</FieldLabel>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="(555) 123-4567"
              className="mt-2 w-full rounded-2xl border border-black/10 bg-white/90 px-4 py-3 text-sm text-black placeholder:text-black/35 outline-none focus:border-[#1A4FA3]/40 focus:ring-2 focus:ring-[#1A4FA3]/15"
            />
          </div>

          <div>
            <FieldLabel>NAICS codes</FieldLabel>
            <input
              value={naics}
              onChange={(e) => setNaics(e.target.value)}
              placeholder="561730, 238220, 236220..."
              className="mt-2 w-full rounded-2xl border border-black/10 bg-white/90 px-4 py-3 text-sm text-black placeholder:text-black/35 outline-none focus:border-[#1A4FA3]/40 focus:ring-2 focus:ring-[#1A4FA3]/15"
            />
            <div className="mt-2 text-xs text-black/45">Comma-separated is fine.</div>
          </div>
        </div>
      </details>

      <div className="rounded-2xl border border-[#1A4FA3]/15 bg-[#1A4FA3]/6 px-4 py-4 text-sm leading-7 text-black/68">
        <span className="font-semibold text-black/82">Managed Capture</span> is
        where the real value sits. It is built for companies that want AMBIT in
        the room helping move the front-end bid process — not just sending alerts.
      </div>

      {err ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {err}
        </div>
      ) : null}

      <div className="mt-1 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-xs text-black/50">
          Secure Stripe checkout • Cancel anytime • No spam
        </div>

        <button
          onClick={onContinue}
          disabled={loading}
          className="inline-flex items-center justify-center rounded-full bg-[#1A4FA3] px-10 py-3.5 text-sm font-semibold text-white shadow-[0_18px_45px_rgba(26,79,163,0.28)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading
            ? "Working…"
            : selectedPlan === "managed_capture"
            ? "Start Managed Capture"
            : "Start Morning Matches"}
        </button>
      </div>

      <div className="pt-1 text-center text-xs text-black/45">
        {ONBOARDING_MESSAGE}
      </div>
    </div>
  );
}