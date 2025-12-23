"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

type CustomerProfile = {
  id: number;
  name?: string | null;
  email?: string | null;
  industry?: string | null;
  services?: string | null;
  location?: string | null;
  keywords?: string | null;
  naics?: string | null;
};

export default function ProfileClient({ customerId }: { customerId: number }) {
  const baseUrl = useMemo(
    () => process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5001",
    []
  );

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [industry, setIndustry] = useState("");
  const [services, setServices] = useState("");
  const [location, setLocation] = useState("");
  const [keywords, setKeywords] = useState("");
  const [naics, setNaics] = useState("");

  const loadProfile = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${baseUrl}/engine/customers/${customerId}`, { cache: "no-store" });
      const txt = await res.text();
      if (!res.ok) throw new Error(txt || `Load failed: ${res.status}`);

      const data: CustomerProfile = JSON.parse(txt);

      setIndustry(data.industry ?? "");
      setServices(data.services ?? "");
      setLocation(data.location ?? "");
      setKeywords(data.keywords ?? "");
      setNaics(data.naics ?? "");
    } catch (e: any) {
      setError(e?.message || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  }, [baseUrl, customerId]);

  const saveAndGo = useCallback(async () => {
    setSaving(true);
    setError(null);

    try {
      const res = await fetch(`${baseUrl}/engine/customers/${customerId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ industry, services, location, keywords, naics }),
      });

      const txt = await res.text();
      if (!res.ok) throw new Error(txt || `Save failed: ${res.status}`);

      window.location.href = `/matches/${customerId}`;
    } catch (e: any) {
      setError(e?.message || "Failed to save profile");
    } finally {
      setSaving(false);
    }
  }, [baseUrl, customerId, industry, services, location, keywords, naics]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  if (loading) return <div style={{ padding: 16 }}>Loading…</div>;

  return (
    <div style={{ maxWidth: 720, margin: "40px auto", padding: 16 }}>
      <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>Profile</h1>
      <p style={{ marginBottom: 16, opacity: 0.8 }}>
        Keep it simple: Industry, Services, Location. Keywords + NAICS are optional.
      </p>

      {error ? (
        <div style={{ color: "crimson", fontWeight: 700, marginBottom: 12 }}>
          Error: {error}
        </div>
      ) : null}

      <div style={{ display: "grid", gap: 14 }}>
        <Field label="Industry">
          <input value={industry} onChange={(e) => setIndustry(e.target.value)} style={inputStyle} />
        </Field>

        <Field label="Services">
          <input value={services} onChange={(e) => setServices(e.target.value)} style={inputStyle} />
        </Field>

        <Field label="Location">
          <input value={location} onChange={(e) => setLocation(e.target.value)} style={inputStyle} />
        </Field>

        <Field label="Keywords (optional, comma separated)">
          <input
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            placeholder="asphalt,paving,resurfacing"
            style={inputStyle}
          />
        </Field>

        <Field label="NAICS (optional)">
          <input value={naics} onChange={(e) => setNaics(e.target.value)} placeholder="237310" style={inputStyle} />
        </Field>

        <button
          onClick={saveAndGo}
          disabled={saving}
          style={{
            padding: "12px 14px",
            borderRadius: 12,
            border: "none",
            fontWeight: 800,
            cursor: "pointer",
            opacity: saving ? 0.7 : 1,
          }}
        >
          {saving ? "Saving…" : "Save & View Matches"}
        </button>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ display: "block", fontWeight: 700, marginBottom: 6 }}>{label}</label>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px 12px",
  borderRadius: 10,
  border: "1px solid rgba(0,0,0,0.2)",
  outline: "none",
};
