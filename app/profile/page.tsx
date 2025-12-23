// app/profile/page.tsx
"use client";

import { useState } from "react";
import { SiteHeader, SiteFooter } from "../components/site-chrome";

export default function ProfilePage() {
  const [saved, setSaved] = useState(false);

  function onSave(e: React.FormEvent) {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="min-h-screen bg-[#070B18] text-white">
      <SiteHeader />

      <main className="mx-auto max-w-[1700px] px-6 pb-10 pt-10 lg:px-12">
        <div className="mx-auto max-w-[900px] rounded-2xl border border-white/10 bg-white/5 p-6">
          <h1 className="text-3xl font-semibold tracking-tight">Company profile</h1>
          <p className="mt-2 text-sm text-white/70">
            These settings control your match quality. Keep it simple and accurate.
          </p>

          <form onSubmit={onSave} className="mt-6 space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Company name">
                <input className={inputClass} placeholder="Sevrix LLC" />
              </Field>
              <Field label="Primary email">
                <input className={inputClass} placeholder="you@company.com" />
              </Field>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Primary NAICS">
                <input className={inputClass} placeholder="541512" />
              </Field>
              <Field label="Service focus (keywords)">
                <input className={inputClass} placeholder="IT support, logistics, engineering…" />
              </Field>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Locations served">
                <input className={inputClass} placeholder="Nationwide, CA, TX…" />
              </Field>
              <Field label="Contract size range">
                <input className={inputClass} placeholder="$10k–$500k" />
              </Field>
            </div>

            <Field label="Notes (optional)">
              <textarea className={`${inputClass} min-h-[140px]`} placeholder="Anything we should prioritize or avoid?" />
            </Field>

            <div className="flex items-center gap-3">
              <button
                type="submit"
                className="rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black hover:bg-white/90"
              >
                Save profile
              </button>

              {saved && <span className="text-sm text-white/75">Saved ✅</span>}
            </div>

            <p className="text-xs text-white/60">
              (This is MVP UI — we’ll wire it to your database next.)
            </p>
          </form>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="mb-2 text-xs font-semibold text-white/80">{label}</div>
      {children}
    </label>
  );
}

const inputClass =
  "w-full rounded-xl border border-white/10 bg-[#070B18]/50 px-4 py-3 text-sm text-white placeholder:text-white/40 outline-none focus:border-white/25";
