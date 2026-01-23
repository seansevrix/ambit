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
  const nextParam =
    typeof searchParams?.next === "string" ? searchParams.next : "";

  const safeNext = nextParam.startsWith("/") ? nextParam : "";

  return (
    <div className="min-h-screen bg-[#070B18] text-white">
      {/* Background glow + subtle grid (matches Pricing/Get Started/Preview/Landing) */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(900px_600px_at_20%_0%,rgba(26,79,163,0.25),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(800px_520px_at_80%_25%,rgba(52,211,153,0.16),transparent_55%)]" />
        <div className="absolute inset-0 opacity-[0.06] [background-image:linear-gradient(to_right,rgba(255,255,255,0.25)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.25)_1px,transparent_1px)] [background-size:72px_72px]" />
        <div className="absolute inset-0 bg-gradient-to-b from-white/[0.03] via-transparent to-transparent" />
      </div>

      <div className="mx-auto max-w-[1200px] px-6 py-14 lg:px-10">
        {/* Back */}
        <Link href="/" className="text-sm text-white/70 hover:text-white">
          ← Back
        </Link>

        {/* Header */}
        <div className="mt-6 flex flex-col items-start gap-3">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Company Portal
            </h1>

            {/* Live pill */}
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[11px] font-semibold text-white/80">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>
              Secure login
            </span>
          </div>

          <p className="max-w-2xl text-sm text-white/70">
            Enter the email you used when you signed up to view your matched opportunities.
          </p>

          {/* Trust mini-bar */}
          <div className="flex flex-wrap gap-2">
            {["No spam", "Cancel anytime", "Secure portal"].map((t) => (
              <span
                key={t}
                className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/80"
              >
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* Login card */}
        <div className="mt-10">
          <div className="mx-auto max-w-xl rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_10px_60px_rgba(0,0,0,0.35)] sm:p-8">
            <LoginClient safeNext={safeNext} />

            {/* Bottom helper row */}
            <div className="mt-6 flex flex-col gap-2 border-t border-white/10 pt-5 text-xs text-white/55 sm:flex-row sm:items-center sm:justify-between">
              <span>
                New here?{" "}
                <Link
                  href="/get-started"
                  className="font-semibold text-white/75 hover:text-white"
                >
                  Create a profile →
                </Link>
              </span>

              <Link
                href="/support"
                className="font-semibold text-white/60 hover:text-white/80"
              >
                Need help?
              </Link>
            </div>
          </div>

          <p className="mt-6 text-center text-xs text-white/45">
            By continuing, you agree to our{" "}
            <Link href="/terms" className="underline underline-offset-2 hover:text-white/70">
              Terms
            </Link>{" "}
            and{" "}
            <Link
              href="/privacy"
              className="underline underline-offset-2 hover:text-white/70"
            >
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
