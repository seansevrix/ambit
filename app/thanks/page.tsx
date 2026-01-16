// app/thanks/page.tsx
import Link from "next/link";

export default function ThanksPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-20">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-sm backdrop-blur">
        <h1 className="text-2xl font-semibold text-white">You’re in ✅</h1>
        <p className="mt-3 text-white/70">
          We received your info. You’ll get <span className="font-semibold text-white">3 matches</span>{" "}
          within 24 hours (1 Residential • 1 Commercial • 1 Government).
        </p>

        <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-4">
          <div className="text-sm font-semibold text-white/90">Quick heads-up</div>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-white/70">
            <li>Check spam/promotions just in case.</li>
            <li>Reply to the email if you want us to prioritize a specific type of work.</li>
          </ul>
        </div>

        <div className="mt-8">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-2xl bg-[#1A4FA3] px-5 py-3 text-sm font-semibold text-white hover:bg-[#15428B]"
          >
            Back to home
          </Link>
        </div>
      </div>
    </main>
  );
}
