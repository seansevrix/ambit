"use client";

import { useEffect, useMemo, useState } from "react";

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
const EMAIL_STORAGE_KEY = "ambit_login_email";

type Segment = "residential" | "commercial" | "government";

type CustomerProfile = {
  id: number;
  name?: string | null;
  email?: string | null;
  location?: string | null;
  serviceArea?: string | null;
  keywords?: string | null;
  naics?: string | null;
  naicsCodes?: string[] | null;
  segments?: Segment[] | null;
  sources?: string[] | null;
};

function abortableFetch(url: string, init: RequestInit = {}, ms = REQUEST_TIMEOUT_MS) {
  const ac = new AbortController();
  const t = setTimeout(() => ac.abort(), ms);

  return fetch(url, { ...init, signal: ac.signal }).finally(() => clearTimeout(t));
}

function parseNaicsCodes(input: string) {
  const parts = input
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => s.replace(/[^\d]/g, "").slice(0, 6))
    .filter((s) => /^\d{2,6}$/.test(s));

  // unique
  return Array.from(new Set(parts));
}

function prettyErr(e: any) {
  if (e?.name === "AbortError") return "Server is waking up — please retry in a few seconds.";
  return e?.message || "Something went wrong.";
}

export default function ProfileEditor({
  customerId,
  onSaved,
}: {
  customerId: number | string;
  onSaved?: () => void;
}) {
  const id = useMemo(() => Number(customerId), [customerId]);

  const [email, setEmail] = useState("");
  const [remember, setRemember] = useState(true);

  // profile fields
  const [companyName, setCompanyName] = useState("");
  const [serviceArea, setServiceArea] = useState("");
  const [keywords, setKeywords] = useState("");
  const [naics, setNaics] = useState("");

  const [segResidential, setSegResidential] = useState(true);
  const [segCommercial, setSegCommercial] = useState(true);
  const [segGovernment, setSegGovernment] = useState(true);

  // ui state
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<"idle" | "loaded" | "saved">("idle");
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(EMAIL_STORAGE_KEY) || "";
      if (stored && !email) setEmail(stored);
    } catch {
      // ignore
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!remember) return;
    if (!email?.trim()) return;
    try {
      localStorage.setItem(EMAIL_STORAGE_KEY, email.trim().toLowerCase());
    } catch {
      // ignore
    }
  }, [email, remember]);

  async function loadProfile() {
    setErr(null);

    if (!Number.isFinite(id) || id <= 0) {
      setErr("Invalid customer id.");
      return;
    }

    const e = email.trim().toLowerCase();
    if (!e) {
      setErr("Enter the same email you used to sign up.");
      return;
    }

    setLoading(true);
    try {
      const url = `${API_BASE}/engine/customers/${id}/profile?email=${encodeURIComponent(e)}`;
      const res = await abortableFetch(url, { method: "GET", credentials: "include", cache: "no-store" });
      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(json?.error || json?.message || `Failed to load profile (${res.status})`);
      }

      const customer: CustomerProfile | undefined = json?.customer;
      if (!customer) throw new Error("Profile not found.");

      setCompanyName(String(customer?.name || ""));
      setServiceArea(String(customer?.serviceArea || customer?.location || ""));
      setKeywords(String(customer?.keywords || ""));
      setNaics(String(customer?.naics || (customer?.naicsCodes || []).join(", ") || ""));

      const segs = customer?.segments || [];
      setSegResidential(segs.includes("residential"));
      setSegCommercial(segs.includes("commercial"));
      setSegGovernment(segs.includes("government"));

      setStatus("loaded");
    } catch (e: any) {
      setErr(prettyErr(e));
    } finally {
      setLoading(false);
    }
  }

  async function saveProfile() {
    setErr(null);

    if (!Number.isFinite(id) || id <= 0) {
      setErr("Invalid customer id.");
      return;
    }

    const e = email.trim().toLowerCase();
    if (!e) {
      setErr("Enter the same email you used to sign up.");
      return;
    }

    const segments: Segment[] = [];
    if (segResidential) segments.push("residential");
    if (segCommercial) segments.push("commercial");
    if (segGovernment) segments.push("government");

    if (segments.length === 0) {
      setErr("Select at least one market.");
      return;
    }

    const naicsInput = naics.trim();
    const naicsCodes = parseNaicsCodes(naicsInput);

    setSaving(true);
    try {
      const url = `${API_BASE}/engine/customers/${id}/profile`;
      const payload = {
        email: e, // ✅ REQUIRED BY BACKEND
        name: companyName.trim() || null,
        companyName: companyName.trim() || null,
        serviceArea: serviceArea.trim() || null,
        location: serviceArea.trim() || null,
        keywords: keywords.trim() || null,
        naics: naicsInput || null,
        naicsCodes, // ✅ sets proper code array too
        segments,
      };

      const res = await abortableFetch(
        url,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload),
        },
        REQUEST_TIMEOUT_MS
      );

      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(json?.error || json?.message || `Save failed (${res.status})`);
      }

      setStatus("saved");
      if (onSaved) onSaved();
    } catch (e: any) {
      setErr(prettyErr(e));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-3xl border border-black/10 bg-white/75 p-6 shadow-[0_30px_90px_rgba(0,0,0,0.10)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-xs font-black tracking-[0.16em] text-black/45">PROFILE</div>
          <div className="mt-1 text-xl font-black tracking-tight text-black">Edit your match settings</div>
          <div className="mt-1 text-sm text-black/60">
            This controls your daily matches and scoring.
          </div>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={loadProfile}
            disabled={loading || saving}
            className="rounded-xl border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-black/70 hover:bg-black/[0.03] disabled:opacity-60"
          >
            {loading ? "Loading…" : "Load"}
          </button>
          <button
            type="button"
            onClick={saveProfile}
            disabled={saving || loading}
            className="rounded-xl bg-[#1A4FA3] px-4 py-2 text-sm font-semibold text-white hover:bg-[#15428B] disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>

      <div className="mt-5 grid gap-4">
        {/* Auth email */}
        <div>
          <div className="text-xs font-semibold text-black/55">Email (required to edit)</div>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            className="mt-2 w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm text-black placeholder:text-black/35 outline-none focus:border-[#63A7FF] focus:ring-2 focus:ring-[#63A7FF]/20"
          />
          <label className="mt-2 flex items-center gap-2 text-xs text-black/55">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
            />
            Remember email on this device
          </label>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
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
        </div>

        <div>
          <div className="text-xs font-semibold text-black/55">Keywords</div>
          <input
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            placeholder="plumbing, drain, water heater, commercial…"
            className="mt-2 w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm text-black placeholder:text-black/35 outline-none focus:border-[#63A7FF] focus:ring-2 focus:ring-[#63A7FF]/20"
          />
          <div className="mt-2 text-xs text-black/45">Comma-separated is best.</div>
        </div>

        <div>
          <div className="text-xs font-semibold text-black/55">NAICS codes</div>
          <input
            value={naics}
            onChange={(e) => setNaics(e.target.value)}
            placeholder="238220, 221310…"
            className="mt-2 w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm text-black placeholder:text-black/35 outline-none focus:border-[#63A7FF] focus:ring-2 focus:ring-[#63A7FF]/20"
          />
          <div className="mt-2 text-xs text-black/45">
            We’ll extract valid codes automatically on save.
          </div>
        </div>

        <div>
          <div className="text-xs font-semibold text-black/55">Markets</div>
          <div className="mt-2 flex flex-wrap gap-2">
            <label className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-3 py-2 text-sm text-black/70">
              <input
                type="checkbox"
                checked={segResidential}
                onChange={(e) => setSegResidential(e.target.checked)}
              />
              Residential
            </label>
            <label className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-3 py-2 text-sm text-black/70">
              <input
                type="checkbox"
                checked={segCommercial}
                onChange={(e) => setSegCommercial(e.target.checked)}
              />
              Commercial
            </label>
            <label className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-3 py-2 text-sm text-black/70">
              <input
                type="checkbox"
                checked={segGovernment}
                onChange={(e) => setSegGovernment(e.target.checked)}
              />
              Government
            </label>
          </div>
        </div>

        {err ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {err}
          </div>
        ) : null}

        {status === "saved" ? (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            Saved. If your match list doesn’t update immediately, refresh the page.
          </div>
        ) : null}

        <div className="text-xs text-black/45">
          Tip: click <b>Load</b> first to pull your current profile, then edit and hit <b>Save</b>.
        </div>
      </div>
    </div>
  );
}
