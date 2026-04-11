"use client";

import { useState } from "react";

export default function ShareOpportunityButton({
  slug,
}: {
  slug: string;
}) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    const shareUrl =
      typeof window !== "undefined"
        ? window.location.href
        : `https://ambitco.app/live-contracts/${slug}`;

    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      className="inline-flex items-center justify-center rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm font-medium transition hover:bg-black/[0.03]"
    >
      {copied ? "Ambit link copied" : "Share Opportunity"}
    </button>
  );
}