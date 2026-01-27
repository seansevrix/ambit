// app/login/page.tsx
import Link from "next/link";
import LoginClient from "./LoginClient";

export const metadata = {
  title: "Log In | AMBIT",
  description: "Log in to view your match history.",
};

export default function LoginPage({
  searchParams,
}: {
  searchParams?: { next?: string };
}) {
  const nextParam = typeof searchParams?.next === "string" ? searchParams.next : "";
  const safeNext = nextParam.startsWith("/") ? nextParam : "";

  return (
    <div className="min-h-screen bg-[#070B18] text-white">
      {/* Background glow + subtle grid */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(900px_600px_at_20%_0%,rgba(26,79,163,0.25),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(800px_520px_at_80%_25%,rgba(52,211,153,0.16),transparent_55%)]" />
        <div className="absolute inset-0 opacity-[0.06] [background-image:linear-gradient(to_right,rgba(255,255,255,0.25)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.25)_1px,transparent_1px)] [background-size:72px_72px]" />
        <div className="absolute inset-0 bg-gradient-to-b from-white/[0.03] via-transparent to-transparent" />
      </div>

      <div className="mx-auto max-w-[1200px] px-6 py-10 lg:px-10">
        <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,560px)_minmax(0,420px)]">
          {/* LEFT: Single card (no extra header above it) */}
          <div className="mx-auto w-full max-w-[560px] lg:mx-0">
            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_10px_60px_rgba(0,0,0,0.35)] sm:p-8">
              {/* subtle corner glows */}
              <div className="pointer-events-none absolute -left-24 -top-24 h-64 w-64 rounded-full bg-white/7 blur-3xl opacity-40" />
              <div className="pointer-events-none absolute -right-24 -bottom-24 h-64 w-64 rounded-full bg-white/6 blur-3xl opacity-35" />

              <div className="relative">
                {/* small top row */}
                <div className="mb-4 flex items-center justify-between">
                  <Link href="/" className="text-sm font-semibold text-white/60 hover:text-white/80">
                    ← Back
                  </Link>

                  <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[11px] font-semibold text-white/80">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/60" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                    </span>
                    Secure login
                  </span>
                </div>

                {/* Your existing form UI lives here */}
                <LoginClient safeNext={safeNext} />
              </div>
            </div>

            <p className="mt-5 text-center text-xs text-white/45">
              By continuing, you agree to our{" "}
              <Link href="/terms" className="underline underline-offset-2 hover:text-white/70">
                Terms
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="underline underline-offset-2 hover:text-white/70">
                Privacy Policy
              </Link>
              .
            </p>
          </div>

          {/* RIGHT: Optional helper panel (desktop only) */}
          <aside className="hidden lg:block">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_10px_60px_rgba(0,0,0,0.25)]">
              <div className="text-sm font-semibold text-white/85">What you’ll see inside</div>
              <p className="mt-2 text-sm text-white/65">
                Your matched opportunities, ranked and summarized—so you can respond faster.
              </p>

              <div className="mt-5 space-y-3">
                {[
                  { title: "Daily matches", desc: "Fresh local leads delivered every morning." },
                  { title: "Clear summaries", desc: "Know why it matches before you click." },
                  { title: "Better fit", desc: "Less noise. More bid-ready work." },
                ].map((x) => (
                  <div key={x.title} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                    <div className="text-sm font-semibold text-white/80">{x.title}</div>
                    <div className="mt-1 text-sm text-white/60">{x.desc}</div>
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                <div className="text-xs font-semibold text-white/75">Tip</div>
                <div className="mt-1 text-sm text-white/60">
                  If you’re not seeing matches yet, tighten your service area + keywords.
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
