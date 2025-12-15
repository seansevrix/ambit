'use client';

import { useState, FormEvent, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { API_BASE_URL } from '../config';

type SignupFormState = {
  name: string;
  contactEmail: string;
  industry: string;
  location: string;
  minValue: string;
  maxValue: string;
  services: string;
};

type Status = 'idle' | 'submitting' | 'success' | 'error';

export default function SignupPage() {
  const router = useRouter();

  const [form, setForm] = useState<SignupFormState>({
    name: '',
    contactEmail: '',
    industry: '',
    location: '',
    minValue: '',
    maxValue: '',
    services: '',
  });

  const [status, setStatus] = useState<Status>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    setErrorMessage(null);

    try {
      const res = await fetch(`${API_BASE_URL}/customers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          contactEmail: form.contactEmail,
          industry: form.industry || undefined,
          location: form.location || undefined,
          minValue: form.minValue ? Number(form.minValue) : undefined,
          maxValue: form.maxValue ? Number(form.maxValue) : undefined,
          services: form.services || undefined,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || 'Failed to create customer');
      }

      const created = await res.json();
      const customerId = created.id;

      setStatus('success');

      // Send them to their matches page
      router.push(`/matches/${customerId}`);
    } catch (err: any) {
      console.error('Signup error:', err);
      setStatus('error');
      setErrorMessage(err.message || 'Something went wrong');
    }
  };

  return (
    <main className="min-h-screen p-6">
      <div className="max-w-xl mx-auto space-y-6">
        <header className="space-y-2">
          <h1 className="text-2xl font-semibold">Create your AMBIT profile</h1>
          <p className="text-sm text-gray-600">
            Tell us about your company so AMBIT can start matching you with
            opportunities that fit your size, industry, and locations.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-3 border rounded-lg p-4">
          <div>
            <label className="block text-sm mb-1">
              Company Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              className="w-full border rounded px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm mb-1">
              Contact Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="contactEmail"
              value={form.contactEmail}
              onChange={handleChange}
              required
              className="w-full border rounded px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Industry</label>
            <input
              type="text"
              name="industry"
              value={form.industry}
              onChange={handleChange}
              placeholder="Construction, HVAC, maintenance, etc."
              className="w-full border rounded px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Location</label>
            <input
              type="text"
              name="location"
              value={form.location}
              onChange={handleChange}
              placeholder="Primary city / region (e.g. San Diego, CA)"
              className="w-full border rounded px-3 py-2 text-sm"
            />
          </div>

          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-sm mb-1">Min Job Size ($)</label>
              <input
                type="number"
                name="minValue"
                value={form.minValue}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2 text-sm"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm mb-1">Max Job Size ($)</label>
              <input
                type="number"
                name="maxValue"
                value={form.maxValue}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm mb-1">Services</label>
            <textarea
              name="services"
              value={form.services}
              onChange={handleChange}
              rows={3}
              placeholder="Short description of what you actually perform (e.g. small civil work, HVAC PM, snow, landscaping)."
              className="w-full border rounded px-3 py-2 text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={status === 'submitting'}
            className="mt-1 border rounded-md px-4 py-2 text-sm font-medium disabled:opacity-60"
          >
            {status === 'submitting' ? 'Creating profile…' : 'Create profile'}
          </button>

          {status === 'error' && (
            <p className="text-xs text-red-600 mt-1">
              {errorMessage || 'Something went wrong. Please try again.'}
            </p>
          )}
        </form>
      </div>
    </main>
  );
}
