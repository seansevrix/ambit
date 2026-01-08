"use client";

import { useEffect, useMemo, useState } from "react";

const BTN =
  "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold transition";
const PRIMARY = `${BTN} bg-[#1A4FA3] text-white hover:bg-[#15428B]`;
const SECONDARY = `${BTN} border border-white/15 bg-white/5 text-white hover:bg-white/10`;

function getBackend() {
  const b = process.env.NEXT_PUBLIC_BACKEND_URL;
  if (!b) throw new Error("Missing NEXT_PUBLIC_BACKEND_URL on the frontend.");
  return b.replace(/\/$/, "");
}

export default function ProfileEditor({
  customerId,
  onSaved,
}: {
  customerId: number;
  onSaved?: () => void;
}) {
  const backend = useMemo(() => getBackend(), []);
  const [open, setOpen] = useState(false);

  const [email, setEmail] = useState("");
  const [location, setLocation] = useState("");
  const [naics, setNaics] = useState("");
  const [keywords, setKeywords] = useState("");

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("ambit_email");
    if (saved) setEmail(saved);
  }, []);

  async function loadProfile() {
    setMsg(null);
    const em = email.trim().toLowerCase();
    if (!em) {
      setMsg("Enter your signup email to load your profile.");
      return;
    }

    setLoading(true);
    try {
      const resp = await fetch(
        `${backend}/engine/customers/${customerId}/profile?email=${encodeURIComponent(em)}`,
        { method: "GET" }
      );
      const data = await resp.json();
      if (!resp.ok || !data?.ok) throw new Error(data?.error || "Failed to load profile.");

      setLocation(data.customer.location || "");
      setNaics(data.customer.naics || "");
      setKeywords(data.customer.keywords || "");

      localStorage.setItem("ambit_email", em);
      setMsg("Loaded.");
    } catch (e: any) {
      setMsg(e?.message || "Failed to load profile.");
    } finally {
      setLoading(false);
    }
  }

  async function saveProfile() {
    setMsg(null);
    const em = email.trim().toLowerCase();
    if (!em) {
      setMsg("Enter your signup email to save changes.");
      return;
    }

    setLoading(true);
    try {
      const resp = await fetch(`${backend}/engine/customers/${customerId}/profile`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: em,
          location,
          naics,
          keywords,
        }),
      });

      const data = await resp.json().catch(() => ({}));
      if (!resp.ok || !data?.ok) throw new Error(data?.error || "Failed to save profile.");

      localStorage.setItem("ambit_email", em);
      setMsg("Saved! Hit Refresh to re-run matches (or we’ll auto-refresh).");

      onSaved?.();
    } catch (e: any) {
      setMsg(e?.message || "Failed to save profile.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button className={SECONDARY} onClick={() => setOpen(true)}>
        Edit profile
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => !loading && setOpen(false)}
          />

          <div className="relative w-full max-w-xl rounded-3xl border border-[#5AA7FF]/40 bg-[#081027] p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-white">Update your profile</h3>
                <p className="mt-1 text-sm text-white/75">
                  NAICS + service area are the #1 drivers of match quality.
                </p>
              </div>

              <button
                className={SECONDARY}
                onClick={() => !loading && setOpen(false)}
              >
                Close
              </button>
            </div>

            <div className="mt-5 space-y-4">
              <div>
                <label className="text-sm font-bold text-white">Email (login)</label>
                <div className="mt-2 flex gap-2">
                  <input
                    className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm font-bold text-white placeholder:text-white/40 outline-none focus:border-[#5AA7FF]/60"
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <button className={SECONDARY} onClick={loadProfile} disabled={loading}>
                    Load
                  </button>
                </div>
              </div>

              <div>
                <label className="text-sm font-bold text-white">Service area / locations</label>
                <input
                  className="mt-2 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm font-bold text-white placeholder:text-white/40 outline-none focus:border-[#5AA7FF]/60"
                  placeholder="e.g., San Diego, CA; Temecula, CA; Nationwide"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm font-bold text-white">NAICS codes</label>
                <input
                  className="mt-2 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm font-bold text-white placeholder:text-white/40 outline-none focus:border-[#5AA7FF]/60"
                  placeholder="e.g., 238220, 561730, 236220"
                  value={naics}
                  onChange={(e) => setNaics(e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm font-bold text-white">Keywords / services</label>
                <input
                  className="mt-2 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm font-bold text-white placeholder:text-white/40 outline-none focus:border-[#5AA7FF]/60"
                  placeholder="e.g., HVAC install, ductwork, commercial maintenance"
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                />
              </div>

              {msg && (
                <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-white">
                  {msg}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button className={SECONDARY} onClick={() => setOpen(false)} disabled={loading}>
                  Cancel
                </button>
                <button className={PRIMARY} onClick={saveProfile} disabled={loading}>
                  {loading ? "Saving..." : "Save changes"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
