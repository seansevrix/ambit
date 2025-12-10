'use client';

import { useEffect, useState, FormEvent, ChangeEvent } from 'react';
import { API_BASE_URL } from '../../config';

type Opportunity = {
  id: number;
  title: string;
  agency: string;
  location?: string;
  naicsCodes?: string[];
  valueEstimate?: number | null;
  samLink?: string;
  notes?: string;
};

export default function AdminOpportunitiesPage() {
  const [opps, setOpps] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formStatus, setFormStatus] =
    useState<null | 'idle' | 'submitting' | 'error'>('idle');
  const [formError, setFormError] = useState<string>('');

  const [form, setForm] = useState({
    title: '',
    agency: '',
    location: '',
    naicsCodes: '',
    valueEstimate: '',
    samLink: '',
    notes: '',
  });

  // Load existing opportunities from backend
  useEffect(() => {
    async function loadOpps() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`${API_BASE_URL}/engine/opportunities`);
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(
            body.error || `Request failed with status ${res.status}`,
          );
        }

        const json = (await res.json()) as Opportunity[];
        setOpps(json);
      } catch (err: any) {
        setError(err.message || 'Failed to load opportunities');
      } finally {
        setLoading(false);
      }
    }

    loadOpps();
  }, []);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormStatus('submitting');
    setFormError('');

    try {
      const res = await fetch(`${API_BASE_URL}/opportunities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title,
          agency: form.agency,
          location: form.location,
          naicsCodes: form.naicsCodes,
          valueEstimate: form.valueEstimate
            ? Number(form.valueEstimate)
            : undefined,
          samLink: form.samLink,
          notes: form.notes,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || 'Failed to create opportunity');
      }

      const created = (await res.json()) as Opportunity;

      // Add to list
      setOpps((prev) => [...prev, created]);

      // Reset form
      setForm({
        title: '',
        agency: '',
        location: '',
        naicsCodes: '',
        valueEstimate: '',
        samLink: '',
        notes: '',
      });
      setFormStatus('idle');
    } catch (err: any) {
      setFormStatus('error');
      setFormError(err.message || 'Failed to create opportunity');
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p>Loading opportunities…</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p>Something went wrong: {error}</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <header>
          <h1 className="text-2xl font-semibold">AMBIT opportunities</h1>
          <p className="text-sm text-gray-600">
            Internal list of opportunities that the matching engine uses.
          </p>
        </header>

        {/* Create new opportunity */}
        <section className="border rounded-lg p-4 space-y-3">
          <h2 className="text-lg font-medium">Add new opportunity</h2>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="block text-sm mb-1">Title *</label>
                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  required
                  className="w-full border rounded px-3 py-2 text-sm"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm mb-1">Agency *</label>
                <input
                  type="text"
                  name="agency"
                  value={form.agency}
                  onChange={handleChange}
                  required
                  className="w-full border rounded px-3 py-2 text-sm"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex-1">
                <label className="block text-sm mb-1">Location</label>
                <input
                  type="text"
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  placeholder="City, State or Region"
                  className="w-full border rounded px-3 py-2 text-sm"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm mb-1">
                  Est. value ($, optional)
                </label>
                <input
                  type="number"
                  name="valueEstimate"
                  value={form.valueEstimate}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm mb-1">
                NAICS codes (comma-separated)
              </label>
              <input
                type="text"
                name="naicsCodes"
                value={form.naicsCodes}
                onChange={handleChange}
                placeholder="e.g. 238220, 236220"
                className="w-full border rounded px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm mb-1">SAM.gov link</label>
              <input
                type="url"
                name="samLink"
                value={form.samLink}
                onChange={handleChange}
                placeholder="https://sam.gov/..."
                className="w-full border rounded px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm mb-1">Notes</label>
              <textarea
                name="notes"
                value={form.notes}
                onChange={handleChange}
                rows={3}
                className="w-full border rounded px-3 py-2 text-sm"
                placeholder="Short description, key requirements, etc."
              />
            </div>

            <button
              type="submit"
              disabled={formStatus === 'submitting'}
              className="mt-1 border rounded-md px-4 py-2 text-sm font-medium disabled:opacity-60"
            >
              {formStatus === 'submitting'
                ? 'Creating…'
                : 'Create opportunity'}
            </button>

            {formStatus === 'error' && (
              <p className="text-xs text-red-600 mt-1">{formError}</p>
            )}
          </form>
        </section>

        {/* Existing opportunities */}
        <section className="border rounded-lg p-4 space-y-3">
          <h2 className="text-lg font-medium">Existing opportunities</h2>

          {opps.length === 0 ? (
            <p className="text-sm text-gray-700">
              No opportunities yet. Use the form above to add one.
            </p>
          ) : (
            <div className="space-y-2">
              {opps.map((opp) => (
                <article
                  key={opp.id}
                  className="border rounded-md px-3 py-2 text-sm space-y-1"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="font-medium">{opp.title}</p>
                      <p className="text-gray-600">
                        {opp.agency}
                        {opp.location ? ` • ${opp.location}` : ''}
                      </p>
                    </div>
                    <p className="text-xs text-gray-500">ID: {opp.id}</p>
                  </div>

                  {opp.valueEstimate && (
                    <p>Est. value: ${opp.valueEstimate.toLocaleString()}</p>
                  )}

                  {opp.naicsCodes && opp.naicsCodes.length > 0 && (
                    <p className="text-xs text-gray-600">
                      NAICS: {opp.naicsCodes.join(', ')}
                    </p>
                  )}

                  {opp.samLink && (
                    <a
                      href={opp.samLink}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs underline"
                    >
                      View on SAM.gov
                    </a>
                  )}

                  {opp.notes && (
                    <p className="text-xs text-gray-600">{opp.notes}</p>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
