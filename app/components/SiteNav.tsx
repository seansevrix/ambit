"use client";

import Link from "next/link";

type NavMode = "sticky" | "static";

function openSignup() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent("ambit:open-signup", { detail: { kind: "company" } })
  );
}

export default function SiteNav({ mode = "sticky" }: { mode?: NavMode }) {
  const sticky = mode === "sticky";

  return (
    <header
      className={[
        "w-full border-b border-black/10 bg-[#F7F5F2]/70 backdrop-blur",
        sticky ? "sticky top-0 z-40" : "relative z-10",
      ].join(" ")}
    >
      <div className="mx-auto flex max-w-[1180px] items-center justify-between px-6 py-4 lg:px-10">
        {/* Left */}
        <Link href="/" className="flex items-center gap-3">
          <span
            aria-label="AMBIT"
            className="text-lg sm:text-xl font-black tracking-[0.55em] -mr-[0.55em] text-black"
          >
            AMBIT
          </span>
        </Link>

        {/* Middle intentionally blank */}
        <div className="hidden md:block" />

        {/* Right */}
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-full border-2 border-black px-5 py-2 text-sm font-semibold text-black transition hover:bg-black/[0.04]"
          >
            Log In
          </Link>
        </div>
      </div>
    </header>
  );
}
