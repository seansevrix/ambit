'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { API_BASE_URL } from '../../config';

type Customer = {
  id: number;
  name: string;
  contactEmail?: string;
  industry?: string;
  location?: string;
};

type Opportunity = {
  id: number;
  title: string;
  agency?: string;
  location?: string;
  valueEstimate?: number;
  samLink?: string;
  notes?: string;
  matchScore?: number;
};

type MatchResponse = {
  customer: Customer;
  matches: Opportunity[];
};

function getMatchLabel(score?: number) {
  const s = score ?? 0;
  if (s >= 80) return { label: 'High match', style: 'bg-green-100 text-green-800' };
  if (s >= 60) return { label: 'Medium match', style: 'bg-yellow-100 text-yellow-800' };
  if (s > 0) return { label: 'Low match', style: 'bg-gray-100 text-gray-700' };
  return { label: 'Unscored', style: 'bg-gray-100 text-gray-700' };
}

export default function MatchesPage() {
  const params = useParams<{ customerId: string }>();
  const customerId = params?.customerId;

  const [data, setData] = useState<MatchResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [emailPreview, setEmailPreview] = useState<string | null>(null);
  const [hideLow, setHideLow] = useState(false);

  useEffect(() => {
    if (!customerId) return;

    const fetchMatches = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`${API_BASE_URL}/api/matches/${customerId}`);

        if (!res.ok) {
          const text = await res.text();
          throw new Error(
            `Backend error (${res.status}): ${text || 'Unknown error'}`
          );
        }

        const json = (await res.json()) as MatchResponse;
        setData(json);
      } catch (err: any) {
        console.error('Error fetching matches:', err);
        setError(err.message || 'Failed to load matches');
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, [customerId]);

  const handleGenerateEmail = () => {
    if (!data) return;

    const { customer, matches } = data;

    if (!matches || matches.length === 0) {
      setEmailPreview(
        `Hi ${customer.name || 'there'},\n\nRight now AMBIT isn’t tracking any active opportunities that match your profile. As soon as we see something for your industry and location, we’ll send another update.\n\nBest,\nAMBIT`
      );
      return;
    }

    // Take top 3 matches by score
    const sorted = [...matches].sort(
      (a, b) => (b.matchScore || 0) - (a.matchScore || 0)
    );
    const top = sorted.slice(0, 3);

    const lines: string[] = [];

    lines.push(
      `Hi ${customer.name || 'there'},`,
      '',
      `Here are some current opportunities AMBIT found that may be a good fit for your company:`,
      ''
    );

    top.forEach((opp, index) => {
      const num = index + 1;
      const score =
        typeof opp.matchScore === 'number' ? `${opp.matchScore}/100` : 'n/a';
      const value =
        typeof opp.valueEstimate === 'number'
          ? `$${opp.valueEstimate.toLocaleString('en-US')}`
          : 'N/A';

      lines.push(
        `${num}) ${opp.title}`,
        `   Agency: ${opp.agency || 'N/A'}`,
        `   Location: ${opp.location || 'N/A'}`,
        `   Est. value: ${value}`,
        `   Match score: ${score}`,
        opp.samLink ? `   Link: ${opp.samLink}` : '',
        ''
      );
    });

    lines.push(
      `If you’d like, we can prioritize similar opportunities based on your preferred job size and locations.`,
      '',
      'Best,',
      'AMBIT'
    );

    setEmailPreview(lines.join('\n'));
  };

  if (loading) {
    return (
      <main className="max-w-5xl mx-auto px-6 py-10">
        <p>Loading matches…</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="max-w-5xl mx-auto px-6 py-10">
        <p className="text-red-600">Something went wrong: {error}</p>
      </main>
    );
  }

  if (!data) {
    return (
      <main className="max-w-5xl mx-auto px-6 py-10">
        <p>No data returned from matching engine.</p>
      </main>
    );
  }

  const { customer, matches } = data;

  // Filtered matches for display
  const visibleMatches = hideLow
    ? matches.filter((m) => (m.matchScore ?? 0) >= 60)
    : matches;

  return (
    <main className="max-w-5xl mx-auto px-6 py-10 space-y-8">
      {/* Header */}
      <header className="space-y-1">
        <h1 className="text-xl font-semibold">
          Matches for {customer.name ?? `Customer ${customer.id}`}
        </h1>
        <p className="text-sm text-gray-600">
          {customer.industry && `${customer.industry} • `}
          {customer.location}
        </p>
        {customer.contactEmail && (
          <p className="text-sm text-gray-600">
            Contact: {customer.contactEmail}
          </p>
        )}
      </header>

      {/* Controls */}
      <section className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 text-sm">
        <div className="space-y-1">
          <p className="font-medium text-gray-800">Opportunities</p>
          <p className="text-xs text-gray-600">
            Showing {visibleMatches.length} of {matches.length} total matches.
          </p>
        </div>
        <label className="inline-flex items-center gap-2 text-xs cursor-pointer">
          <input
            type="checkbox"
            checked={hideLow}
            onChange={(e) => setHideLow(e.target.checked)}
          />
          <span>Hide low matches (score &lt; 60)</span>
        </label>
      </section>

      {/* Matches list */}
      <section className="space-y-4">
        {visibleMatches.length === 0 && (
          <p className="text-sm text-gray-600">
            No opportunities matched these filters yet.
          </p>
        )}

        {visibleMatches.map((opp) => {
          const { label, style } = getMatchLabel(opp.matchScore);
          return (
            <article
              key={opp.id}
              className="border rounded-md p-4 flex flex-col md:flex-row md:items-start md:justify-between gap-3"
            >
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-medium">{opp.title}</h3>
                  <span
                    className={`text-[11px] px-2 py-[2px] rounded-full ${style}`}
                  >
                    {label}
                  </span>
                </div>
                <p className="text-sm text-gray-700">
                  {opp.agency}
                  {opp.location ? ` • ${opp.location}` : ''}
                </p>
                {typeof opp.valueEstimate === 'number' && (
                  <p className="text-sm text-gray-700">
                    Est. value: $
                    {opp.valueEstimate.toLocaleString('en-US')}
                  </p>
                )}
                {opp.samLink && (
                  <a
                    href={opp.samLink}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm text-blue-600 hover:underline"
                  >
                    View on SAM.gov
                  </a>
                )}
                {opp.notes && (
                  <p className="text-xs text-gray-600 mt-1">{opp.notes}</p>
                )}
              </div>

              <div className="text-sm text-gray-700 md:text-right">
                <div>Match score: {opp.matchScore ?? 30} / 100</div>
              </div>
            </article>
          );
        })}
      </section>

      {/* Email preview */}
      <section className="space-y-3 border rounded-md p-4">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-semibold">Email preview</h2>
            <p className="text-xs text-gray-600">
              Use this as a starting point when emailing this customer about
              their current matches.
            </p>
          </div>
          <button
            type="button"
            onClick={handleGenerateEmail}
            className="inline-flex items-center justify-center rounded-md border border-gray-900 bg-gray-900 px-3 py-1 text-xs font-medium text-white hover:bg-black"
          >
            Generate email
          </button>
        </div>

        {emailPreview && (
          <textarea
            className="w-full h-56 text-xs font-mono border rounded-md p-2 bg-gray-50"
            readOnly
            value={emailPreview}
          />
        )}
      </section>
    </main>
  );
}
