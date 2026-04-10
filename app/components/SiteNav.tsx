"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export default function SiteNav() {
  const [hideNav, setHideNav] = useState(false);

  useEffect(() => {
    const sync = () => {
      try {
        setHideNav(document.body.classList.contains("ambit-hide-nav"));
      } catch {
        setHideNav(false);
      }
    };

    sync();

    const obs = new MutationObserver(sync);
    try {
      obs.observe(document.body, {
        attributes: true,
        attributeFilter: ["class"],
      });
    } catch {
      // ignore
    }

    return () => obs.disconnect();
  }, []);

  return (
    <header
      data-ambit-nav="1"
      className={cx(
        "sticky top-0 z-[150] w-full border-b border-black/10 bg-[#F7F5F2]/70 backdrop-blur",
        "transition-opacity duration-150",
        hideNav && "pointer-events-none opacity-0"
      )}
    >
      <div className="mx-auto grid max-w-[1180px] grid-cols-[1fr_auto_1fr] items-center px-6 py-4 lg:px-10">
        {/* Left */}
        <div className="justify-self-start">
          <Link href="/" className="flex items-center gap-3">
            <span
              aria-label="AMBIT"
              className="text-lg font-black tracking-[0.55em] -mr-[0.55em] text-black sm:text-xl"
            >
              AMBIT
            </span>
          </Link>
        </div>

        {/* Middle */}
        <div className="hidden md:flex justify-self-center">
          <Link
            href="/live-contracts"
            className="text-sm font-medium text-black transition hover:opacity-70"
          >
            Live Contracts
          </Link>
        </div>

        {/* Right */}
        <div className="justify-self-end">
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