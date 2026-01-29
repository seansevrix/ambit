"use client";

import Link from "next/link";

function openSignup() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent("ambit:open-signup", { detail: { kind: "company" } })
  );
}

export default function SiteNav() {
  return (
    <header className="sticky top-0 z-[150] w-full border-b border-black/10 bg-[#F7F5F2]/90 backdrop-blur">
      <div className="mx-auto flex max-w-[1180px] items-center justify-between px-6 py-4 lg:px-10">
        {/* Left */}
        <Link href="/" className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl border border-black/10 bg-white flex items-center justify-center">
            <span className="text-sm font-black text-black">A</span>
          </div>
          <span className="text-sm font-extrabold tracking-wide text-black">
            AMBIT
          </span>
        </Link>

        {/* Middle intentionally blank (Malakye style) */}
        <div className="hidden md:block" />

        {/* Right */}
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-full border-2 border-black px-5 py-2 text-sm font-semibold text-black hover:bg-black/[0.04]"
          >
            Log In
          </Link>

          <button
            type="button"
            onClick={openSignup}
            className="inline-flex items-center justify-center rounded-full bg-black px-5 py-2 text-sm font-semibold text-white hover:bg-black/90"
          >
            Sign Up
          </button>
        </div>
      </div>
    </header>
  );
}
