// app/page.tsx

import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="max-w-5xl mx-auto px-6 py-12 space-y-10">
      {/* Hero section */}
      <section className="space-y-4">
        <p className="text-xs font-semibold tracking-wide text-gray-500 uppercase">
          For small service contractors
        </p>
        <h1 className="text-3xl md:text-4xl font-semibold leading-tight">
          AMBIT watches government contracts for you
          <span className="block text-gray-600 text-lg md:text-xl mt-2">
            You focus on work. AMBIT finds the bids that actually fit your crew,
            location, and job size.
          </span>
        </h1>

        <div className="flex flex-wrap gap-3 pt-2">
          <Link
            href="/signup"
            className="inline-flex items-center justify-center rounded-md border border-gray-900 bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-black"
          >
            Get started – add your company
          </Link>

          <Link
            href="/matches/1"
            className="inline-flex items-center justify-center rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-50"
          >
            View demo matches
          </Link>
        </div>

        <p className="text-xs text-gray-500 pt-1">
          Built for construction, HVAC, plumbing, electrical, landscaping and
          other blue-collar service businesses.
        </p>
      </section>

      {/* How it works */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">How AMBIT works</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="border rounded-md p-4 space-y-1">
            <p className="text-xs font-semibold text-gray-500 uppercase">
              Step 1
            </p>
            <h3 className="text-sm font-medium">Tell us who you are</h3>
            <p className="text-sm text-gray-600">
              Add your company, service types, locations you care about, and the
              job size you actually want to bid.
            </p>
          </div>

          <div className="border rounded-md p-4 space-y-1">
            <p className="text-xs font-semibold text-gray-500 uppercase">
              Step 2
            </p>
            <h3 className="text-sm font-medium">AMBIT watches solicitations</h3>
            <p className="text-sm text-gray-600">
              We pull opportunities from SAM.gov and other sources into an
              internal opportunities list.
            </p>
          </div>

          <div className="border rounded-md p-4 space-y-1">
            <p className="text-xs font-semibold text-gray-500 uppercase">
              Step 3
            </p>
            <h3 className="text-sm font-medium">You get matched deals</h3>
            <p className="text-sm text-gray-600">
              AMBIT scores each opportunity against your profile and surfaces
              the best matches for you to chase.
            </p>
          </div>
        </div>
      </section>

      {/* Who it's for */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Who AMBIT is built for</h2>
        <p className="text-sm text-gray-600">
          Small teams that don&apos;t have a full-time proposal department but
          still want a slice of federal and state contract work:
        </p>
        <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
          <li>General contractors and site work companies</li>
          <li>HVAC, plumbing, electrical, and mechanical contractors</li>
          <li>Landscaping, snow removal, and facility maintenance teams</li>
          <li>Equipment rental and specialty service providers</li>
        </ul>
      </section>

      {/* Admin demo callout */}
      <section className="border rounded-md p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="space-y-1">
          <h2 className="text-sm font-semibold">Want to see under the hood?</h2>
          <p className="text-sm text-gray-600">
            Use the admin pages to see the internal customer list and
            opportunities AMBIT is using for matching.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-sm">
          <Link
            href="/admin/customers"
            className="inline-flex items-center justify-center rounded-md border border-gray-300 px-3 py-1 hover:bg-gray-50"
          >
            Admin – customers
          </Link>
          <Link
            href="/admin/opportunities"
            className="inline-flex items-center justify-center rounded-md border border-gray-300 px-3 py-1 hover:bg-gray-50"
          >
            Admin – opportunities
          </Link>
        </div>
      </section>
    </main>
  );
}
