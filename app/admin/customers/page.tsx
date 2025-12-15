'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

type Customer = {
  id: number;
  name: string;
  contactEmail?: string;
  industry?: string;
  location?: string;
  minValue?: number;
  maxValue?: number;
  services?: string;
};

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCustomers = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch('http://localhost:5001/engine/customers');

        if (!res.ok) {
          const text = await res.text();
          throw new Error(
            `Backend error (${res.status}): ${text || 'Unknown error'}`
          );
        }

        const data = (await res.json()) as Customer[];
        setCustomers(data);
      } catch (err: any) {
        console.error('Error fetching customers:', err);
        setError(err.message || 'Failed to load customers');
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  return (
    <main className="max-w-5xl mx-auto px-6 py-10 space-y-6">
      <header className="space-y-1">
        <h1 className="text-xl font-semibold">AMBIT customers</h1>
        <p className="text-sm text-gray-600">
          Internal list of companies that AMBIT is tracking and matching.
        </p>
      </header>

      {loading && <p>Loading customers…</p>}

      {error && <p className="text-red-600">Error: {error}</p>}

      {!loading && !error && customers.length === 0 && (
        <p className="text-sm text-gray-600">
          No customers yet. Use the Signup page to add one.
        </p>
      )}

      {!loading && !error && customers.length > 0 && (
        <section className="space-y-3">
          {customers.map((c) => (
            <article
              key={c.id}
              className="border rounded-md p-4 flex flex-col md:flex-row md:items-start md:justify-between gap-3"
            >
              <div className="space-y-1">
                <h2 className="font-medium">
                  {c.name} <span className="text-xs text-gray-500">ID: {c.id}</span>
                </h2>
                <p className="text-sm text-gray-700">
                  {c.industry && `${c.industry} • `}
                  {c.location}
                </p>
                {c.contactEmail && (
                  <p className="text-sm text-gray-700">{c.contactEmail}</p>
                )}
                {typeof c.minValue === 'number' &&
                  typeof c.maxValue === 'number' && (
                    <p className="text-xs text-gray-600">
                      Prefers jobs between $
                      {c.minValue.toLocaleString('en-US')} and $
                      {c.maxValue.toLocaleString('en-US')}
                    </p>
                  )}
                {c.services && (
                  <p className="text-xs text-gray-600">
                    Services: {c.services}
                  </p>
                )}
              </div>

              <div className="text-sm md:text-right flex md:block gap-2">
                <Link
                  href={`/matches/${c.id}`}
                  className="inline-block border rounded px-3 py-1 text-xs md:text-sm hover:bg-gray-50"
                >
                  View matches
                </Link>
              </div>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}
