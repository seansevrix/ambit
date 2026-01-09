"use client";

import { useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import AmbitMark from "../components/AmbitMark";

const API_BASE =
  (process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_BASE ||
    "http://localhost:5001")?.replace(/\/$/, "");

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

/** NAICS helpers */
function sanitizeNaicsToken(input: string) {
  // digits only, max 6
  return input.replace(/[^\d]/g, "").slice(0, 6);
}
function isValidNaicsToken(input: string) {
  // allow 2–6 digits (prefix matching is useful), but recommend full 6
  return /^\d{2,6}$/.test(input);
}
function parseNaicsList(raw: string) {
  // split by comma; allow extra spaces
  const parts = raw
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);

  const cleaned = parts.map(sanitizeNaicsToken).filter(Boolean);

  const valid = cleaned.filter(isValidNaicsToken);

  // unique, keep order
  const seen = new Set<string>();
  const uniqueValid: string[] = [];
  for (const v of valid) {
    if (!seen.has(v)) {
      seen.add(v);
      uniqueValid.push(v);
    }
  }

  return {
    valid: uniqueValid,
    hasAny: uniqueValid.length > 0,
    // "invalid" means user typed something non-empty that doesn't become a valid token
    hasInvalid:
      parts.length > 0 &&
      cleaned.some((t) => t.length > 0 && !isValidNaicsToken(t)),
  };
}

export default function GetStartedPage() {
  const router = useRouter();

  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [serviceArea, setServiceArea] = useState("");
  const [naicsInput, setNaicsInput] = useState(""); // ✅ now multiple NAICS allowed
  const [keywords, setKeywords] = useState("");

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const [naicsTouched, setNaicsTouched] = useState(false);

  const naicsParsed = useMemo(() => parseNaicsList(naicsInput), [naicsInput]);
  const naicsCsv = useMemo(() => naicsParsed.valid.join(","), [naicsParsed.valid]);

  // ✅ Keywords required ONLY on this page
  // ✅ NAICS required (now: at least one valid NAICS)
  const canSubmit = useMemo(() => {
    return (
      companyName.trim().length >= 2 &&
      email.trim().includes("@") &&
      serviceArea.trim().length >= 2 &&
      keywords.trim().length >= 2 &&
      naicsParsed.hasAny
    );
  }, [companyName, email, serviceArea, keywords, naicsParsed.hasAny]);

  async function createCustomer() {
    setErr("");
    setLoading(true);

    try {
      const company = companyName.trim();
      const mail = email.trim().toLowerCase();
      const loc = serviceArea.trim();
      const kw = keywords.trim();

      if (!naicsParsed.hasAny) {
        setNaicsTouched(true);
        throw new Error("Please enter at least one valid NAICS code (2–6 digits each).");
      }

      // ✅ IMPORTANT: deployed backend expects `name`. Send both for compatibility.
      // ✅ For multi-NAICS: send CSV in `naics` + also send `naicsCodes` array for future-proofing.
      const payload: any = {
        name: company,
        companyName: company,
        email: mail,
        location: loc,
        serviceArea: loc,
        naics: naicsCsv, // e.g., "237310,238220"
        naicsCodes: naicsParsed.valid, // e.g., ["237310","238220"]
        keywords: kw,
      };

      const { res, json } = await postJson(`${API_BASE}/engine/customers`, payload);

      if (!res.ok) {
        const msg = String(json?.message || json?.error || `Signup failed (${res.status})`);
        throw new Error(msg);
      }

      const id = Number(json?.id) || Number(json?.customer?.id);
      if (!id || !Number.isFinite(id)) {
        throw new Error("Customer created, but no customer id returned.");
      }

      router.push(`/matches/${id}`);
      router.refresh();
    } catch (e: any) {
      setErr(e?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-[#061033] via-[#040b24] to-[#020617] text-slate-100">
      {/* subtle glows like your homepage */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-blue-600/10 blur-3xl" />
        <div className="absolute -bottom-32 right-[-80px] h-[520px] w-[520px] rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.12),transparent_55%)]" />
      </div>

      <div className="relative mx-auto max-w-6xl px-6 py-12">
        {/* HERO */}
        <header className="mx-auto max-w-4xl text-center">
          <div className="mx-auto flex items-center justify-center gap-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-2 shadow-sm backdrop-blur">
              <AmbitMark size={34} />
            </div>
            <div className="text-left">
              <div className="text-sm font-semibold tracking-wide">AMBIT</div>
              {/* ✅ Removed tagline line entirely */}
            </div>
          </div>

          <h1 className="mt-7 text-4xl font-semibold tracking-tight sm:text-5xl">
            Create your profile
          </h1>

          <div className="mt-5 flex flex-wrap justify-center gap-2 text-xs font-semibold text-slate-200">
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 backdrop-blur">
              Built for contractors
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 backdrop-blur">
              Save hours weekly
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 backdrop-blur">
              Cancel anytime
            </span>
          </div>

          <p className="mx-auto mt-6 max-w-3xl text-base leading-relaxed text-slate-200">
            <span className="font-semibold text-white">Invest in Scale, Not Search.</span>{" "}
            For just <span className="font-semibold text-white">$1.33/day</span>, AMBIT automates the
            search process, reclaiming{" "}
            <span className="font-semibold text-white">15–20 hours</span> of your week. In an industry
            where one contract can generate millions, AMBIT doesn’t just pay for itself—it powers your
            growth.
          </p>
        </header>

        {/* FORM */}
        <section className="mx-auto mt-10 max-w-4xl rounded-[32px] border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur">
          <div className="grid gap-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Company name">
                <input
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/35 px-4 py-3 text-sm text-white placeholder:text-slate-400 outline-none focus:border-blue-400/60 focus:ring-2 focus:ring-blue-500/20"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Sevrix LLC"
                />
              </Field>

              <Field label="Email">
                <input
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/35 px-4 py-3 text-sm text-white placeholder:text-slate-400 outline-none focus:border-blue-400/60 focus:ring-2 focus:ring-blue-500/20"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                />
              </Field>
            </div>

            <Field label="Service area">
              <input
                className="w-full rounded-2xl border border-white/10 bg-slate-950/35 px-4 py-3 text-sm text-white placeholder:text-slate-400 outline-none focus:border-blue-400/60 focus:ring-2 focus:ring-blue-500/20"
                value={serviceArea}
                onChange={(e) => setServiceArea(e.target.value)}
                placeholder="San Diego, CA"
              />
            </Field>

            {/* ✅ NAICS (multiple) */}
            <Field label="NAICS codes (required)">
              <input
                className="w-full rounded-2xl border border-white/10 bg-slate-950/35 px-4 py-3 text-sm text-white placeholder:text-slate-400 outline-none focus:border-blue-400/60 focus:ring-2 focus:ring-blue-500/20"
                value={naicsInput}
                onChange={(e) => setNaicsInput(e.target.value)}
                onBlur={() => setNaicsTouched(true)}
                placeholder="237310, 238220, 561730"
                inputMode="text"
              />

              {/* keep this font/style exactly */}
              <div className="text-xs text-slate-300">
                Add as many as you want to broaden your search. 6 digits is best (example:{" "}
                <span className="font-semibold text-white">237310</span>).
              </div>

              {/* ✅ keep NAICS help line */}
              <div className="text-xs text-slate-300">
                Need help? Find your code at{" "}
                <a
                  href="https://www.naics.com"
                  target="_blank"
                  rel="noreferrer"
                  className="font-semibold text-white underline decoration-white/30 underline-offset-4 hover:decoration-white/70"
                >
                  naics.com
                </a>
                .
              </div>

              {naicsTouched && !naicsParsed.hasAny ? (
                <div className="text-xs text-red-200">
                  Enter at least one valid NAICS code (2–6 digits each).
                </div>
              ) : naicsTouched && naicsParsed.hasInvalid ? (
                <div className="text-xs text-amber-200">
                  One or more NAICS entries look invalid — use digits only (2–6 digits each).
                </div>
              ) : null}
            </Field>

            {/* ✅ Keywords */}
            <Field label="Keywords (required)">
              <input
                className="w-full rounded-2xl border border-white/10 bg-slate-950/35 px-4 py-3 text-sm text-white placeholder:text-slate-400 outline-none focus:border-blue-400/60 focus:ring-2 focus:ring-blue-500/20"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                placeholder="asphalt, striping, concrete"
              />
              {/* ✅ Removed: “Use commas…” helper line */}
            </Field>

            {/* ✅ Replace the match-count panel with your exact message */}
            <div className="rounded-2xl border border-white/10 bg-slate-950/25 px-4 py-3 text-sm text-slate-200">
              Great news: we’ve found a selection of high-potential opportunities tailored to your
              specific expertise.
            </div>

            {err ? (
              <div className="rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {err}
              </div>
            ) : null}

            <button
              disabled={!canSubmit || loading}
              onClick={createCustomer}
              className="inline-flex items-center justify-center rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Creating…" : "Show My Matches"}
            </button>

            <div className="text-center text-xs text-slate-300">
              No long-term contracts. Pause or cancel in one click.
            </div>
          </div>
        </section>

        {/* WHAT YOU GET + PRICE */}
        <section className="mx-auto mt-12 max-w-5xl">
          <div className="text-center text-xs font-semibold tracking-widest text-slate-300">
            WHAT YOU GET
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <FeatureCard
              title="Know what’s worth bidding"
              body="A match score that helps you ignore the junk and move fast."
            />
            <FeatureCard
              title="Understand it in 60 seconds"
              body="Plain-English summaries so you can decide quickly."
            />
            <FeatureCard
              title="Wake up to new leads"
              body="Stop manual searching. We scan while you sleep."
            />
          </div>

          <div className="mt-6 rounded-[32px] border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="text-sm font-semibold text-white">Price</div>
                <div className="mt-1 text-xs text-slate-300">Cancel anytime.</div>
              </div>

              <div className="flex items-end justify-center gap-2 sm:justify-end">
                <div className="text-5xl font-semibold text-white tabular-nums">$39.99</div>
                <div className="pb-2 text-sm text-slate-300">/ month</div>
              </div>
            </div>

            <div className="mt-5 rounded-2xl border border-white/10 bg-slate-950/20 p-4 text-sm text-slate-200">
              Tip: You can refine NAICS/keywords anytime to tighten matches.
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="grid gap-2">
      <div className="text-xs font-semibold text-slate-200">{label}</div>
      {children}
    </label>
  );
}

function FeatureCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-lg backdrop-blur">
      <div className="text-sm font-semibold text-white">{title}</div>
      <div className="mt-2 text-sm text-slate-200">{body}</div>
    </div>
  );
}
