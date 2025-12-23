"use client";

import { useEffect, useState } from "react";
import { createOpportunity, getOpportunities } from "@/lib/ambitApi";

export default function AdminOpportunitiesPage() {
  const [items, setItems] = useState<any[]>([]);
  const [err, setErr] = useState("");
  const [status, setStatus] = useState("");

  // simple quick-add (optional)
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");

  async function refresh() {
    const data = await getOpportunities();
    setItems(Array.isArray(data) ? data : []);
  }

  useEffect(() => {
    (async () => {
      try {
        setErr("");
        await refresh();
      } catch (e: any) {
        setErr(e?.message || "Failed to load opportunities");
      }
    })();
  }, []);

  async function onCreate() {
    try {
      setErr("");
      setStatus("");

      // only send what you have; backend can ignore extras
      await createOpportunity({ title, location });

      setStatus("✅ Created.");
      setTitle("");
      setLocation("");
      await refresh();
    } catch (e: any) {
      setErr(e?.message || "Create failed");
    }
  }

  return (
    <div style={{ maxWidth: 980, margin: "40px auto", padding: 16 }}>
      <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 6 }}>
        AMBIT opportunities
      </h1>
      <p style={{ opacity: 0.8, marginBottom: 18 }}>
        Internal list of opportunities AMBIT can match against.
      </p>

      <div
        style={{
          border: "1px solid rgba(0,0,0,0.15)",
          borderRadius: 12,
          padding: 14,
          marginBottom: 18,
        }}
      >
        <div style={{ fontWeight: 800, marginBottom: 10 }}>Quick add</div>
        <div style={{ display: "grid", gap: 10 }}>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
            style={inputStyle}
          />
          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Location"
            style={inputStyle}
          />
          <button onClick={onCreate} style={buttonStyle}>
            Create
          </button>

          {status ? (
            <div style={{ color: "green", fontWeight: 800 }}>{status}</div>
          ) : null}
          {err ? (
            <div style={{ color: "crimson", fontWeight: 800 }}>{err}</div>
          ) : null}
        </div>
      </div>

      {items.length === 0 ? (
        <div style={{ opacity: 0.8 }}>No opportunities yet.</div>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {items.map((o, idx) => (
            <div
              key={o?.id ?? idx}
              style={{
                border: "1px solid rgba(0,0,0,0.15)",
                borderRadius: 12,
                padding: 14,
              }}
            >
              <div style={{ fontWeight: 800 }}>
                {o?.title || o?.name || "Opportunity"}
              </div>
              <div style={{ opacity: 0.85 }}>
                {o?.location ? `📍 ${o.location}` : null}
              </div>
            </div>
          ))}
        </div>
      )}
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

const buttonStyle: React.CSSProperties = {
  padding: "12px 14px",
  borderRadius: 12,
  border: "none",
  fontWeight: 800,
  cursor: "pointer",
};
