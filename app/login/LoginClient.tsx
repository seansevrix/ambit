"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AmbitMark from "../components/AmbitMark";

export default function LoginClient() {
  const router = useRouter();
  const [customerId, setCustomerId] = useState("");
  const [err, setErr] = useState("");

  function go() {
    setErr("");
    const id = Number(customerId);
    if (!id || !Number.isFinite(id)) {
      setErr("Enter a valid Customer ID (number).");
      return;
    }
    router.push(`/matches/${id}`);
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-xl px-6 py-10">
      <div className="rounded-2xl border border-slate-900/10 bg-white p-8 shadow-sm">
        <div className="flex items-center gap-3">
          <AmbitMark size={44} />
          <div>
            <div className="text-sm font-semibold text-slate-900">AMBIT</div>
            <div className="text-xs text-slate-600">Log in to view match history</div>
          </div>
        </div>

        <h1 className="mt-6 text-3xl font-semibold tracking-tight text-slate-900">
          Log In
        </h1>
        <p className="mt-2 text-sm text-slate-700">
          For now, log in using your Customer ID (we’ll add email/password later).
        </p>

        <div className="mt-6 grid gap-3">
          <label className="grid gap-2">
            <div className="text-xs font-semibold text-slate-700">Customer ID</div>
            <input
              className="w-full rounded-xl border border-slate-900/15 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-900"
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              placeholder="e.g. 1"
            />
          </label>

          {err ? (
            <div className="rounded-xl border border-red-600/20 bg-red-50 px-3 py-2 text-sm text-red-700">
              {err}
            </div>
          ) : null}

          <button
            onClick={go}
            className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-black"
          >
            View My Matches
          </button>

          <div className="text-xs text-slate-600">
            New customer?{" "}
            <a className="underline" href="/get-started">
              Get started
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
