"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AmbitMark from "../components/AmbitMark";
import LoadingOverlay from "../components/LoadingOverlay";

const API_BASE =
  (process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_BASE ||
    "http://localhost:5001")?.replace(/\/$/, "");

async function postJson(url: string, body: any, signal?: AbortSignal) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(body),
    signal,
  });
  const json = await res.json().catch(() => ({}));
  return { res, json };
}

type SegmentKey = "residential" | "commercial" | "government";
type Focus = "all" | SegmentKey;

const ALL_SEGMENTS: SegmentKey[] = ["residential", "commercial", "government"];

function normalizeFocus(raw: string | null): Focus | null {
  const v = String(raw || "").trim().toLowerCase();
  if (v === "all") return "all";
  if (v === "residential") return "residential";
  if (v === "commercial") return "commercial";
  if (v === "government" || v === "gov") return "government";
  return null;
}

function focusLabel(f: Focus) {
  if (f === "all") return "All markets";
  return f.charAt(0).toUpperCase() + f.slice(1);
}

export default function GetStartedClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const didPrefillRef = useRef(false);

  // Essential fields only
  const [email, setEmail] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [serviceArea, setServiceArea] = useState("");
  const [keywords, setKeywords] = useState("");

  // Optional: preference (not required)
  const [focus, setFocus] = useState<Focus>("all");

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Pre-warm backend to reduce Render cold-start pain
  useEffect(() => {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), 6000);

    fetch(`${API_BASE}/engine/health`, {
      method: "GET",
      credentials: "include",
      signal: controller.signal,
      cache: "no-store",
    }).catch(() => {});

    return () => {
      clearTimeout(t);
      controller.abort();
    };
  }, []);

  // Prefill from query params: area + keywords + focus (optional)
  useEffect(() => {
    if (didPrefillRef.current) return;
    if (!searchParams) return;

    const qpArea = String(searchParams.get("area") || "").trim();
    const qpKeywords = String(searchParams.get("keywords") || "").trim();
    const qpFocus = normalizeFocus(searchParams.get("market"));

    if (qpArea && !serviceArea.trim()) setServiceArea(qpArea);
    if (qpKeywords && !keywords.trim()) setKeywords(qpKeywords);
    if (qpFocus) setFocus(qpFocus);

    if (qpArea || qpKeywords || qpFocus) didPrefillRef.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const canSubmit = useMemo(() => {
    return (
      companyName.trim().length >= 2 &&
      email.trim().includes("@") &&
      serviceArea.trim().length >= 2 &&
      keywords.trim().length >= 2
    );
  }, [companyName, email, serviceArea, keywords]);

  async function createCustomer() {
    if (loading) return;

    setErr("");
    setLoading(true); // turn on overlay immediately

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);

    try {
      const company = companyName.trim();
      const mail = email.trim().toLowerCase();
      const loc = serviceArea.trim();
      const kw = keywords.trim();

      // Always all segments (one plan, all markets)
      const segments = ALL_SEGMENTS;
      const payload: any = {
        name: company,
        companyName: company,
        email: mail,
        location: loc,
        serviceArea: loc,
        keywords: kw,
        segments,
        segmentCsv: segments.join(","),
        // optional preference metadata (safe if backend ignores)
        preferredFocus: focus,
      };

      try {
        localStorage.setItem("ambit_email", mail);
      } catch {}

      const { res, json } = await postJson(
        `${API_BASE}/engine/customers`,
        payload,
        controller.signal
      );

      if (!res.ok) {
        const msg = String(json?.message || json?.error || `Signup failed (${res.status})`);
        throw new Error(msg);
      }

      const id = Number(json?.id) || Number(json?.customer?.id);
      if (!id || !Number.isFinite(id)) {
        throw new Error("Customer created, but no customer id returned.");
      }

      // Keep overlay up (do NOT setLoading(false)) — navigation will replace the page
      router.push(`/matches/${id}?new=1`);
      return;
    } catch (e: any) {
      const msg =
        e?.name === "AbortError"
          ? "That took too long. Please try again (our server may be waking up)."
          : e?.message || "Signup failed";

      if (mountedRef.current) {
        setErr(msg);
        setLoading(false); // only turn off overlay on error
      }
    } finally {
      clearTimeout(timeout);
    }
  }

  return (
    <section className="mx-auto w-full max-w-2xl">
      {/* Fullscreen loading overlay */}
      {loading && (
        <LoadingOverlay
          serviceArea={serviceArea}
          naics={undefined}
          keywords={keywords}
          title="Looking for your matches"
        />
      )}

      {/* Top trust row */}
      <div className="mb-6 flex items-start justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-2">
            <AmbitMark size={34} />
          </div>
          <div>
            <div className="text-sm font-semibold text-white/90">AMBIT</div>
            <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-white/60">
              <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1">
                7-day free trial
              </span>
              <span>No credit card required</span>
              <span className="opacity-50">•</span>
              <span>$49.99/mo after trial</span>
            </div>
          </div>
        </div>

        <div className="text-xs text-white/55">Secure signup • Encrypted</div>
      </div>

      {/* Trust + form card */}
      <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-[0_20px_80px_rgba(0,0,0,0.35)] backdrop-blur sm:p-8">
        {/* Mini testimonial / trust bar */}
        <div className="mb-6 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
          <div className="text-xs font-semibold tracking-widest text-white/55">
            TRUSTED BY LOCAL PROS
          </div>
          <div className="mt-2 text-sm text-white/80">
            “Ambit found us a $50k municipal contract in our first week.”
          </div>
          <div className="mt-2 text-xs text-white/55">— Contractor, California</div>
        </div>

        {/* Optional preference (not required) */}
        <div className="mb-6">
          <div className="mb-2 flex items-center justify-between">
            <div className="text-xs font-semibold text-white/75">Primary focus (optional)</div>
            <div className="text-xs text-white/55">You can change this later</div>
          </div>

          <div className="inline-flex flex-wrap gap-2">
            {(["all", "residential", "commercial", "government"] as Focus[]).map((f) => {
              const active = focus === f;
              return (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFocus(f)}
                  className={[
                    "rounded-full border px-4 py-2 text-sm font-semibold transition",
                    active
                      ? "border-blue-400/60 bg-blue-500/15 text-white"
                      : "border-white/10 bg-slate-950/25 text-white/70 hover:text-white hover:bg-slate-950/35",
                  ].join(" ")}
                  aria-pressed={active}
                  disabled={loading}
                >
                  {focusLabel(f)}
                </button>
              );
            })}
          </div>
        </div>

        {/* Essential-only form */}
        <form
          className="grid gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (!loading && canSubmit) createCustomer();
          }}
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="grid gap-2 text-left">
              <div className="text-xs font-semibold text-white/75">Work email</div>
              <input
                type="email"
                className="w-full rounded-2xl border border-white/10 bg-slate-950/35 px-4 py-3 text-sm text-white placeholder:text-white/35 outline-none focus:border-blue-400/60 focus:ring-2 focus:ring-blue-500/20"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                autoComplete="email"
                disabled={loading}
              />
            </label>

            <label className="grid gap-2 text-left">
              <div className="text-xs font-semibold text-white/75">Company name</div>
              <input
                className="w-full rounded-2xl border border-white/10 bg-slate-950/35 px-4 py-3 text-sm text-white placeholder:text-white/35 outline-none focus:border-blue-400/60 focus:ring-2 focus:ring-blue-500/20"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Your company"
                autoComplete="organization"
                disabled={loading}
              />
            </label>
          </div>

          <label className="grid gap-2 text-left">
            <div className="text-xs font-semibold text-white/75">Service area</div>
            <input
              className="w-full rounded-2xl border border-white/10 bg-slate-950/35 px-4 py-3 text-sm text-white placeholder:text-white/35 outline-none focus:border-blue-400/60 focus:ring-2 focus:ring-blue-500/20"
              value={serviceArea}
              onChange={(e) => setServiceArea(e.target.value)}
              placeholder="City, State (or Nationwide)"
              autoComplete="address-level2"
              disabled={loading}
            />
          </label>

          <label className="grid gap-2 text-left">
            <div className="text-xs font-semibold text-white/75">Keywords</div>
            <input
              className="w-full rounded-2xl border border-white/10 bg-slate-950/35 px-4 py-3 text-sm text-white placeholder:text-white/35 outline-none focus:border-blue-400/60 focus:ring-2 focus:ring-blue-500/20"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              placeholder="dumpster rental, concrete, striping, HVAC"
              disabled={loading}
            />
            <div className="text-xs text-white/55">
              Add services, equipment, materials, and job types.
            </div>
          </label>

          {err ? (
            <div className="rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {err}
            </div>
          ) : null}

          <div className="text-xs text-white/55">
            By continuing, you agree to our{" "}
            <Link
              href="/terms"
              className="font-semibold text-white/75 underline underline-offset-4 decoration-white/20 hover:decoration-white/50"
            >
              Terms
            </Link>{" "}
            and{" "}
            <Link
              href="/privacy"
              className="font-semibold text-white/75 underline underline-offset-4 decoration-white/20 hover:decoration-white/50"
            >
              Privacy Policy
            </Link>
            .
          </div>

          <button
            type="submit"
            disabled={!canSubmit || loading}
            className="mt-1 inline-flex w-full items-center justify-center rounded-2xl bg-[#1A4FA3] px-5 py-3 text-sm font-semibold text-white hover:bg-[#15428B] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Finding matches…" : "Start free trial"}
          </button>

          <div className="pt-1 text-center text-sm text-white/70">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-semibold text-white underline underline-offset-4 decoration-white/20 hover:decoration-white/50"
            >
              Sign in
            </Link>
          </div>
        </form>
      </div>
    </section>
  );
}
