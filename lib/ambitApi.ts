type FetchJsonOptions = RequestInit & { body?: any };

export async function fetchJson(path: string, options: FetchJsonOptions = {}) {
  const isAbsolute = /^https?:\/\//i.test(path);
  const url = isAbsolute ? path : path; // keep relative; Next rewrite will proxy /engine/*

  const headers = new Headers(options.headers);
  if (!headers.has("Content-Type") && options.body != null) {
    headers.set("Content-Type", "application/json");
  }

  const res = await fetch(url, {
    ...options,
    headers,
    cache: "no-store", // important (prevents 304 + stale cache issues)
    body: options.body != null && typeof options.body !== "string"
      ? JSON.stringify(options.body)
      : options.body,
  });

  // 204/304 have no body; don't try res.json()
  if (res.status === 204 || res.status === 304) return null;

  const text = await res.text();
  const data = text ? (() => { try { return JSON.parse(text); } catch { return text; } })() : null;

  if (!res.ok) {
    const msg =
      typeof data === "object" && data && "message" in (data as any)
        ? (data as any).message
        : `Request failed: ${res.status}`;
    throw new Error(msg);
  }

  return data;
}

// Customers
export async function getCustomers() {
  return fetchJson("/engine/customers");
}

export async function createCustomer(payload: any) {
  return fetchJson("/engine/customers", { method: "POST", body: payload });
}

// Opportunities
export async function getOpportunities() {
  return fetchJson("/engine/opportunities");
}

export async function createOpportunity(payload: any) {
  return fetchJson("/engine/opportunities", { method: "POST", body: payload });
}

// Matches
export async function getCustomerMatches(customerId: string | number) {
  return fetchJson(`/engine/matches/${customerId}`);
}
