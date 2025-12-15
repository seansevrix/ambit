// app/config.ts

// Frontend base URL for talking to the AMBIT backend.
// In dev, we default to localhost:5001.
// In production, we'll override NEXT_PUBLIC_API_BASE_URL in the hosting env.
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:5001';
