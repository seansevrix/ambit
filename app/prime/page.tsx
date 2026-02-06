import Link from "next/link";

export default function PrimePage() {
  return (
    <main className="mx-auto max-w-[900px] px-6 py-20">
      <h1 className="text-3xl font-semibold tracking-tight">Ambit Prime</h1>
      <p className="mt-4 text-base text-black/70">
        AMBIT can prime qualified opportunities for your company.
      </p>

      <div className="mt-8 rounded-2xl border border-black/10 bg-white/70 p-6">
        <p className="text-sm text-black/70">
          Pricing: <span className="font-semibold text-black">$299/month</span>
        </p>
        <p className="mt-2 text-sm text-black/70">
          If you want us to prime for your team, start here and we’ll review fit.
        </p>

        <div className="mt-6">
          <Link
            href="/get-started"
            className="inline-flex items-center justify-center rounded-md border border-black/20 px-4 py-2 text-sm font-semibold hover:bg-black hover:text-white transition"
          >
            Apply for Ambit Prime
          </Link>
        </div>
      </div>
    </main>
  );
}
