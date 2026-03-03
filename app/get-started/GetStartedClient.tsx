// app/get-started/GetStartedClient.tsx
"use client";

import { useMemo, useState, type ReactNode } from "react";
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

type Market = "commercial" | "government";

/**
 * Public checkout plans:
 *  - starter ($49.99/mo) morning matches only
 *  - pro ($129.99/mo)    1:1 analyst + summaries + templates
 *
 * Enterprise is request-based (not self-serve checkout) to reduce friction.
 */
type Plan = "starter" | "pro" | "enterprise";

const ONBOARDING_MESSAGE =
  "Next: confirm securely in Stripe. After activation, AMBIT starts sending ranked matches daily and you can update your profile anytime.";

function normalizeMarket(m: string | null): Market {
  const v = String(m || "").trim().toLowerCase();
  if (v === "commercial" || v === "government") return v;
  return "commercial";
}

function normalizePlan(p: string | null): Plan {
  const v = String(p || "").trim().toLowerCase();

  // Primary
  if (v === "starter") return "starter";
  if (v === "pro") return "pro";
  if (v === "enterprise") return "enterprise";

  // Friendly aliases
  if (v === "basic" || v === "matches" || v === "lead" || v === "leads") return "starter";

  // Legacy/back-compat (old naming)
  if (v === "associate") return "starter";
  if (v === "executive" || v === "elite" || v === "prime") return "enterprise";
  if (v === "all" || v === "all3" || v === "all_markets") return "pro";

  // Enterprise aliases
  if (v === "corp" || v === "corporate" || v === "enterprise_plus") return "enterprise";

  // Default
  return "pro";
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

function PlanButton({
  active,
  title,
  priceLine,
  desc,
  onClick,
  featured,
}: {
  active: boolean;
  title: string;
  priceLine: string;
  desc: string;
  onClick: () => void;
  featured?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "group relative rounded-2xl border p-4 text-left transition",
        active
          ? "border-[#1A4FA3]/40 bg-[linear-gradient(135deg,rgba(26,79,163,0.12),rgba(99,167,255,0.06))] ring-2 ring-[#1A4FA3]/20"
          : "border-black/10 bg-white/75 hover:border-black/20",
        featured
          ? "shadow-[0_18px_55px_rgba(26,79,163,0.12)]"
          : "shadow-[0_14px_40px_rgba(0,0,0,0.06)]",
      ].join(" ")}
    >
      {featured ? (
        <div className="mb-2 flex items-center justify-between">
          <span className="rounded-full border border-[#1A4FA3]/25 bg-white/70 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide text-[#1A4FA3]">
            Most popular
          </span>
          <span className="text-[10px] font-semibold text-black/45">Recommended</span>
        </div>
      ) : (
        <div className="mb-2 text-[10px] font-semibold text-black/45">Pick a plan</div>
      )}

      <div className="text-base font-black text-black">{title}</div>
      <div className="mt-1 text-sm font-semibold text-black/70">{priceLine}</div>
      <div className="mt-2 text-sm text-black/60">{desc}</div>

      <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition group-hover:opacity-100">
        <div className="absolute inset-0 rounded-2xl bg-[radial-gradient(700px_250px_at_0%_0%,rgba(92,116,255,0.10),transparent_60%)]" />
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

export default function GetStartedClient() {
  const sp = useSearchParams();

  const intent = useMemo(() => normalizeMarket(sp.get("intent")), [sp]);

  const planFromUrl = useMemo(() => normalizePlan(sp.get("plan")), [sp]);
  const enterpriseRequested = planFromUrl === "enterprise";

  // Default to Pro for new signups; if someone hits ?plan=enterprise, we keep them on Pro
  const [selectedPlan, setSelectedPlan] = useState<Plan>(() =>
    enterpriseRequested ? "pro" : planFromUrl
  );

  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [serviceArea, setServiceArea] = useState("");
  const [keywords, setKeywords] = useState("");
  const [naics, setNaics] = useState("");

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const enterpriseMailto = useMemo(() => {
    const subject = "AMBIT Enterprise Request";
    const bodyLines = [
      "Hi AMBIT team,",
      "",
      "I'd like to request Enterprise.",
      "",
      `Company: ${companyName.trim() || ""}`,
      `Email: ${email.trim() || ""}`,
      `Service area: ${serviceArea.trim() || ""}`,
      `Keywords: ${keywords.trim() || ""}`,
      `NAICS: ${naics.trim() || ""}`,
      "",
      "Thanks!",
    ];
    const body = bodyLines.join("\n");
    return `mailto:ambit@sevrixgov.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(
      body
    )}`;
  }, [companyName, email, serviceArea, keywords, naics]);

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
        segments: ["commercial", "government"],
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

      // 2) Create Stripe checkout session
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

      window.location.href = checkoutUrl;
    } catch (e: any) {
      setErr(e?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-5">
      {/* Plan select */}
      <div>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <div className="text-xs font-semibold text-black/55">Choose plan *</div>
            <div className="mt-1 text-xs text-black/45">
              Start with Starter or Pro — you can upgrade anytime.
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Pill>Daily matches</Pill>
            <Pill>Ranked by fit</Pill>
            <Pill>Cancel anytime</Pill>
          </div>
        </div>

        {enterpriseRequested ? (
          <div className="mt-3 rounded-2xl border border-[#1A4FA3]/20 bg-[#1A4FA3]/8 px-4 py-3 text-sm text-black/70">
            Enterprise is request-based (so there’s no checkout friction). Use{" "}
            <a href={enterpriseMailto} className="font-semibold text-[#1A4FA3] hover:underline">
              Request Enterprise
            </a>{" "}
            below.
          </div>
        ) : null}

        <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
          <PlanButton
            active={selectedPlan === "starter"}
            title="Starter"
            priceLine="$49.99/mo • Daily matches"
            desc="Daily matched opportunities. Simple and clean."
            onClick={() => setSelectedPlan("starter")}
          />

          <PlanButton
            active={selectedPlan === "pro"}
            title="Pro"
            priceLine="$129.99/mo • 1:1 analyst + summaries"
            desc="Matches + summaries + templates with a 1:1 analyst lane."
            onClick={() => setSelectedPlan("pro")}
            featured
          />
        </div>

        {/* Enterprise moved out of plan grid */}
        <div className="mt-3 rounded-2xl border border-black/10 bg-white/65 p-4 shadow-[0_14px_40px_rgba(0,0,0,0.06)] backdrop-blur-md">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="text-sm font-black text-black/85">Need Enterprise?</div>
              <div className="mt-0.5 text-xs text-black/55">
                White-glove priority lane + execution support (request-only).
              </div>
            </div>

            <a
              href={enterpriseMailto}
              className="inline-flex items-center justify-center rounded-full border border-[#1A4FA3]/25 bg-white/80 px-4 py-2 text-xs font-semibold text-[#1A4FA3] transition hover:bg-white"
            >
              Request Enterprise
            </a>
          </div>
        </div>
      </div>

      {/* Primary fields */}
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
        <div className="mt-2 text-xs text-black/45">Only your work email is required to continue.</div>
      </div>

      <div>
        <FieldLabel>Service area</FieldLabel>
        <input
          value={serviceArea}
          onChange={(e) => setServiceArea(e.target.value)}
          placeholder="City, county, or state"
          className="mt-2 w-full rounded-2xl border border-black/10 bg-white/80 px-4 py-3 text-sm text-black placeholder:text-black/35 outline-none focus:border-[#1A4FA3]/40 focus:ring-2 focus:ring-[#1A4FA3]/15"
        />
        <div className="mt-2 text-xs text-black/45">Helps AMBIT send better local matches.</div>
      </div>

      <div>
        <FieldLabel>Keywords</FieldLabel>
        <input
          value={keywords}
          onChange={(e) => setKeywords(e.target.value)}
          placeholder="HVAC, electrical, fire alarm, concrete..."
          className="mt-2 w-full rounded-2xl border border-black/10 bg-white/80 px-4 py-3 text-sm text-black placeholder:text-black/35 outline-none focus:border-[#1A4FA3]/40 focus:ring-2 focus:ring-[#1A4FA3]/15"
        />
        <div className="mt-2 text-xs text-black/45">Services, equipment, materials, job types.</div>
      </div>

      {/* Optional details */}
      <details className="group rounded-2xl border border-black/10 bg-white/55 px-4 py-3">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3">
          <div>
            <div className="text-sm font-semibold text-black/80">Optional profile details</div>
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
              placeholder="541330, 238220, 561210..."
              className="mt-2 w-full rounded-2xl border border-black/10 bg-white/90 px-4 py-3 text-sm text-black placeholder:text-black/35 outline-none focus:border-[#1A4FA3]/40 focus:ring-2 focus:ring-[#1A4FA3]/15"
            />
            <div className="mt-2 text-xs text-black/45">Comma-separated is fine.</div>
          </div>
        </div>
      </details>

      {err ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {err}
        </div>
      ) : null}

      {/* CTA */}
      <div className="mt-1 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-xs text-black/50">Secure Stripe checkout • Cancel anytime • No spam</div>

        <button
          onClick={onContinue}
          disabled={loading}
          className="inline-flex items-center justify-center rounded-full bg-[#1A4FA3] px-10 py-3.5 text-sm font-semibold text-white shadow-[0_18px_45px_rgba(26,79,163,0.28)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Working…" : "Continue"}
        </button>
      </div>

      <div className="pt-1 text-center text-xs text-black/45">{ONBOARDING_MESSAGE}</div>
    </div>
  );
}