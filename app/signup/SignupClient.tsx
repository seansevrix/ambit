"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import AmbitMark from "../components/AmbitMark";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_BASE ||
  "http://localhost:5001";

type CreateCustomerResponse =
  | { id: number }
  | { customer: { id: number } }
  | any;

async function postJson(url: string, body: any) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({}));
  return { res, json };
}

export default function SignupClient() {
  const router = useRouter();

  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [location, setLocation] = useState("");
  const [naics, setNaics] = useState("");
  const [keywords, setKeywords] = useState("");

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const canSubmit = useMemo(() => {
    return (
      companyName.trim().length >= 2 &&
      email.trim().includes("@") &&
      location.trim().length >= 2
    );
  }, [companyName, email, location]);

  async function createCustomer() {
    setErr("");
    setLoading(true);

    try {
      // Try common schema: companyName/email/location/naics/keywords
      let payload: any = {
        companyName: companyName.trim(),
        email: email.trim(),
        location: location.trim(),
        naics: naics.trim() || null,
        keywords: keywords.trim() || null,
      };

      let { res, json } = await postJson(`${API_BASE}/engine/customers`, payload);

      // Fallback if your backend uses `name` instead of `companyName`
      // (this catches Prisma-style "Unknown argument" failures)
      const msg = String(json?.message || json?.error || "");
      if (!res.ok && msg.toLowerCase().includes("unknown argument") && msg.includes("companyName")) {
        payload = {
          name: companyName.trim(),
          email: email.trim(),
          location: location.trim(),
          naics: naics.trim() || null,
          keywords: keywords.trim() || null,
        };
        ({ res, json } = await postJson(`${API_BASE}/engine/customers`, payload));
      }

      if (!res.ok) {
        throw new Error(json?.message || json?.error || `Signup failed (${res.status})`);
      }

      const id =
        Number(json?.id) ||
        Number(json?.customer?.id);

      if (!id || !Number.isFinite(id)) {
        throw new Error("Customer created, but no customer id returned.");
      }

      // Go straight to matches (they may hit paywall → subscribe)
      router.push(`/matches/${id}`);
      router.refresh();
    } catch (e: any) {
      setErr(e?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
        {/* Left */}
        <div className="rounded-2xl border border-slate-900/10 bg-white p-8 shadow-sm">
          <div className="flex items-center gap-3">
            <AmbitMark size={44} />
            <div>
              <div className="text-sm font-semibold text-slate-900">AMBIT</div>
              <div className="text-xs text-slate-600">
                Ranked government leads for contractors
              </div>
            </div>
          </div>

          <h1 className="mt-6 text-3xl font-semibold tracking-tight text-slate-900">
            Create your profile
          </h1>
          <p className="mt-2 max-w-md text-sm text-slate-700">
            We’ll match opportunities to your trade, service area, and keywords—then deliver
            the best fits to your inbox.
          </p>

          <div className="mt-6 grid gap-4">
            <Field label="Company name">
              <input
                className="w-full rounded-xl border border-slate-900/15 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-900"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Sevrix LLC"
              />
            </Field>

            <Field label="Email">
              <input
                className="w-full rounded-xl border border-slate-900/15 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-900"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
              />
            </Field>

            <Field label="Service area">
              <input
                className="w-full rounded-xl border border-slate-900/15 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-900"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="San Diego, CA"
              />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="NAICS (optional)">
                <input
                  className="w-full rounded-xl border border-slate-900/15 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-900"
                  value={naics}
                  onChange={(e) => setNaics(e.target.value)}
                  placeholder="237310"
                />
              </Field>

              <Field label="Keywords (optional)">
                <input
                  className="w-full rounded-xl border border-slate-900/15 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-900"
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  placeholder="asphalt, striping, concrete"
                />
              </Field>
            </div>

            {err ? (
              <div className="rounded-xl border border-red-600/20 bg-red-50 px-3 py-2 text-sm text-red-700">
                {err}
              </div>
            ) : null}

            <button
              disabled={!canSubmit || loading}
              onClick={createCustomer}
              className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-black disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Creating…" : "Continue"}
            </button>

            <div className="text-xs text-slate-600">
              By continuing, you’ll be taken to your matches page. If your subscription is inactive,
              you’ll see the subscribe screen.
            </div>
          </div>
        </div>

        {/* Right */}
        <div className="rounded-2xl border border-slate-900/10 bg-white p-8 shadow-sm">
          <div className="text-xs font-semibold text-slate-600">WHAT YOU GET</div>

          <div className="mt-4 grid gap-3">
            <Benefit title="Match score" body="Instant fit ranking so you can move fast." />
            <Benefit title="Plain-English summary" body="What it is, what to verify, what to do next." />
            <Benefit title="Daily digest" body="Less noise. More real bids." />
          </div>

          <div className="mt-6 rounded-2xl border border-slate-900/10 bg-slate-50 p-5">
            <div className="text-sm font-semibold text-slate-900">Price</div>
            <div className="mt-2 flex items-end gap-2">
              <div className="text-3xl font-semibold text-slate-900 tabular-nums">$39.99</div>
              <div className="pb-1 text-sm text-slate-600">/ month</div>
            </div>
            <div className="mt-2 text-xs text-slate-600">Cancel anytime.</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-2">
      <div className="text-xs font-semibold text-slate-700">{label}</div>
      {children}
    </label>
  );
}

function Benefit({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-xl border border-slate-900/10 bg-white p-4">
      <div className="text-sm font-semibold text-slate-900">{title}</div>
      <div className="mt-1 text-sm text-slate-700">{body}</div>
    </div>
  );
}
