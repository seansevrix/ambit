"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { signIn } from "next-auth/react";

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5001";

export default function SignupPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [industry, setIndustry] = useState("");
  const [location, setLocation] = useState("");
  const [services, setServices] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const resp = await fetch(`${BACKEND}/engine/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        email,
        password,
        industry: industry || undefined,
        location: location || undefined,
        services: services || undefined,
      }),
    });

    const data = await resp.json().catch(() => null);

    if (!resp.ok || !data?.ok) {
      setLoading(false);
      setError(data?.error || "Failed to create account.");
      return;
    }

    // Auto-login after signup
    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    setLoading(false);

    if (!res?.ok) {
      router.push("/login");
      return;
    }

    router.push("/dashboard");
  }

  return (
    <main className="min-h-screen bg-[#070B18] text-white">
      <div className="mx-auto max-w-[1700px] px-6 py-12 lg:px-12">
        <div className="mx-auto max-w-2xl">
          {/* ✅ Back arrow */}
          <Link
            href="/"
            className="mb-6 inline-flex items-center gap-2 text-sm text-white/70 hover:text-white"
          >
            ← Back
          </Link>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur">
            <h1 className="text-3xl font-semibold tracking-tight">Create your Ambit account</h1>
            <p className="mt-2 text-sm text-white/70">
              One plan. <span className="text-white">$39.99/month</span>. Cancel anytime.
            </p>

            <form onSubmit={onSubmit} className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="text-sm text-white/80">Name</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-white/10 bg-[#070B18]/60 px-4 py-3 text-sm outline-none focus:ring-white/20"
                  placeholder="Your name"
                  required
                />
              </div>

              <div>
                <label className="text-sm text-white/80">Email</label>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  className="mt-2 w-full rounded-xl border border-white/10 bg-[#070B18]/60 px-4 py-3 text-sm outline-none focus:ring-white/20"
                  placeholder="you@company.com"
                  required
                />
              </div>

              <div>
                <label className="text-sm text-white/80">Password</label>
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type="password"
                  className="mt-2 w-full rounded-xl border border-white/10 bg-[#070B18]/60 px-4 py-3 text-sm outline-none focus:ring-white/20"
                  placeholder="At least 8 characters"
                  required
                />
              </div>

              <div>
                <label className="text-sm text-white/80">Industry (optional)</label>
                <input
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-white/10 bg-[#070B18]/60 px-4 py-3 text-sm outline-none focus:ring-white/20"
                  placeholder="IT, Logistics, Engineering…"
                />
              </div>

              <div>
                <label className="text-sm text-white/80">Location (optional)</label>
                <input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-white/10 bg-[#070B18]/60 px-4 py-3 text-sm outline-none focus:ring-white/20"
                  placeholder="San Diego, CA"
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-sm text-white/80">Services (optional)</label>
                <input
                  value={services}
                  onChange={(e) => setServices(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-white/10 bg-[#070B18]/60 px-4 py-3 text-sm outline-none focus:ring-white/20"
                  placeholder="Managed security, freight brokerage, systems integration…"
                />
              </div>

              {error ? (
                <div className="md:col-span-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                  {error}
                </div>
              ) : null}

              <button
                disabled={loading}
                className="md:col-span-2 w-full rounded-xl bg-white px-4 py-3 text-sm font-semibold text-black hover:bg-white/90 disabled:opacity-60"
              >
                {loading ? "Creating…" : "Create Account"}
              </button>
            </form>

            <div className="mt-6 text-sm text-white/70">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-white underline decoration-white/30 underline-offset-4 hover:decoration-white/60"
              >
                Log in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
