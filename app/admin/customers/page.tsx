"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getCustomers } from "@/lib/ambitApi";

type Customer = {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  industry?: string | null;
  location?: string | null;
  services?: string | null;
};

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [err, setErr] = useState<string>("");

  useEffect(() => {
    (async () => {
      try {
        setErr("");
        const data = await getCustomers();
        setCustomers(Array.isArray(data) ? data : []);
      } catch (e: any) {
        setErr(e?.message || "Failed to load customers");
      }
    })();
  }, []);

  return (
    <div style={{ maxWidth: 980, margin: "40px auto", padding: 16 }}>
      <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 6 }}>
        AMBIT customers
      </h1>
      <p style={{ opacity: 0.8, marginBottom: 18 }}>
        Internal list of companies AMBIT is tracking and matching.
      </p>

      {err ? (
        <div style={{ color: "crimson", fontWeight: 700, marginBottom: 12 }}>
          {err}
        </div>
      ) : null}

      {customers.length === 0 ? (
        <div style={{ opacity: 0.8 }}>
          No customers yet. Have someone fill out the signup form.
        </div>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {customers.map((c) => (
            <div
              key={c.id}
              style={{
                border: "1px solid rgba(0,0,0,0.15)",
                borderRadius: 12,
                padding: 14,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 16 }}>{c.name}</div>
                  <div style={{ opacity: 0.8 }}>{c.email}</div>
                  <div style={{ opacity: 0.8 }}>
                    {c.location ? `📍 ${c.location}` : null}
                    {c.location && c.industry ? " • " : null}
                    {c.industry ? `🏗️ ${c.industry}` : null}
                  </div>
                </div>

                <Link
                  href={`/matches/${c.id}`}
                  style={{
                    alignSelf: "center",
                    fontWeight: 800,
                    textDecoration: "none",
                  }}
                >
                  View matches →
                </Link>
              </div>

              {c.services ? (
                <div style={{ marginTop: 10, opacity: 0.9 }}>
                  <span style={{ fontWeight: 700 }}>Services:</span> {c.services}
                </div>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
