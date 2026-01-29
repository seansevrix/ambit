"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type SignupKind = "company" | "individual";

export default function SignupModal({
  open,
  onClose,
  kind,
  market,
}: {
  open: boolean;
  onClose: () => void;
  kind: SignupKind;
  market: "residential" | "commercial" | "government";
}) {
  const router = useRouter();

  const [signupKind, setSignupKind] = useState<SignupKind>(kind);
  const [companyName, setCompanyName] = useState("");
  const [serviceArea, setServiceArea] = useState("");
  const [keywords, setKeywords] = useState("");
  const [naicsCodes, setNaicsCodes] = useState("");

  useEffect(() => {
    if (open) setSignupKind(kind);
  }, [open, kind]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const canContinue = useMemo(() => {
    return (
      companyName.trim().length >= 2 &&
      serviceArea.trim().length >= 2 &&
      keywords.trim().length >= 2 &&
      naicsCodes.trim().length >= 2
    );
  }, [companyName, serviceArea, keywords, naicsCodes]);

  function go() {
    // We keep this simple: route to /get-started and pass prefill params.
    // If you later decide you want the modal to create the customer directly, we can wire that too.
    const qs = new URLSearchParams({
      market,
      kind: signupKind,
      company: companyName.trim(),
      area: serviceArea.trim(),
      keywords: keywords.trim(),
      naics: naicsCodes.trim(),
    });

    onClose();
    router.push(`/get-started?${qs.toString()}`);
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      {/* overlay */}
      <button
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
      />

      {/* modal */}
      <div className="relative w-full max-w-xl overflow-hidden rounded-3xl border border-black/10 bg-[#FAFAF7] shadow-[0_30px_90px_rgba(0,0,0,0.22)]">
        <div className="px-6 py-5 sm:px-7">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-xs font-semibold tracking-widest text-black/50">
                SIGN UP
              </div>
              <div className="mt-1 text-2xl font-semibold text-black">
                Create your AMBIT profile
              </div>
              <div className="mt-1 text-sm text-black/60">
                Enter the basics — we’ll tailor your matches by market.
              </div>
            </div>

            <button
              onClick={onClose}
              className="rounded-full border border-black/10 bg-white px-3 py-1.5 text-sm font-semibold text-black/70 hover:bg-black/[0.03]"
            >
              Close
            </button>
          </div>

          {/* kind toggle (Malakye vibe) */}
          <div className="mt-5 inline-flex rounded-full border border-black/10 bg-white p-1">
            {(["company", "individual"] as SignupKind[]).map((k) => {
              const active = signupKind === k;
              return (
                <button
                  key={k}
                  type="button"
                  onClick={() => setSignupKind(k)}
                  className={[
                    "rounded-full px-4 py-2 text-sm font-semibold transition",
                    active
                      ? "bg-black text-white"
                      : "text-black/70 hover:text-black hover:bg-black/[0.04]",
                  ].join(" ")}
                >
                  {k === "company" ? "Company" : "Individual"}
                </button>
              );
            })}
          </div>

          <div className="mt-6 grid gap-4">
            <label className="grid gap-2">
              <div className="text-xs font-semibold text-black/70">
                Company name
              </div>
              <input
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Your Company"
                className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-black placeholder:text-black/35 outline-none focus:border-[#63A7FF] focus:ring-2 focus:ring-[#63A7FF]/20"
              />
            </label>

            <label className="grid gap-2">
              <div className="text-xs font-semibold text-black/70">
                Service area
              </div>
              <input
                value={serviceArea}
                onChange={(e) => setServiceArea(e.target.value)}
                placeholder="City, county, or state"
                className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-black placeholder:text-black/35 outline-none focus:border-[#63A7FF] focus:ring-2 focus:ring-[#63A7FF]/20"
              />
            </label>

            <label className="grid gap-2">
              <div className="text-xs font-semibold text-black/70">
                Keywords
              </div>
              <input
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                placeholder="landscaping, HVAC, concrete, hauling…"
                className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-black placeholder:text-black/35 outline-none focus:border-[#63A7FF] focus:ring-2 focus:ring-[#63A7FF]/20"
              />
              <div className="text-xs text-black/50">
                Services, equipment, materials, job types.
              </div>
            </label>

            <label className="grid gap-2">
              <div className="text-xs font-semibold text-black/70">
                NAICS codes
              </div>
              <input
                value={naicsCodes}
                onChange={(e) => setNaicsCodes(e.target.value)}
                placeholder="561730, 238220, 236220…"
                className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-black placeholder:text-black/35 outline-none focus:border-[#63A7FF] focus:ring-2 focus:ring-[#63A7FF]/20"
              />
              <div className="text-xs text-black/50">
                Comma-separated is fine.
              </div>
            </label>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-xs text-black/50">
              Market:{" "}
              <span className="font-semibold text-black/70">
                {market.charAt(0).toUpperCase() + market.slice(1)}
              </span>
            </div>

            <button
              type="button"
              onClick={go}
              disabled={!canContinue}
              className="inline-flex items-center justify-center rounded-full bg-[#63A7FF] px-6 py-3 text-sm font-semibold text-white shadow-[0_10px_28px_rgba(99,167,255,0.35)] transition hover:bg-[#3E8CFF] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
