// backend/routes/customers.js
import express from "express";
import crypto from "crypto";
import prisma from "../lib/prisma.js";

const router = express.Router();

/**
 * SECURITY:
 * In production, GET endpoints require an admin key.
 * Set ADMIN_API_KEY in Render, then call:
 *   /engine/customers?key=YOUR_KEY
 * Or send header:
 *   x-admin-key: YOUR_KEY
 */
function requireAdmin(req, res) {
  const isProd = process.env.NODE_ENV === "production";
  const adminKey = process.env.ADMIN_API_KEY;

  // In dev/local, allow without key
  if (!isProd) return true;

  // In prod, require key if ADMIN_API_KEY is set
  if (adminKey) {
    const provided = req.query?.key || req.headers["x-admin-key"];
    if (String(provided || "") === String(adminKey)) return true;

    res.status(401).json({ ok: false, error: "Unauthorized" });
    return false;
  }

  // If prod + no ADMIN_API_KEY set, block by default (safer)
  res.status(403).json({
    ok: false,
    error: "GET /customers disabled in production (set ADMIN_API_KEY to enable).",
  });
  return false;
}

function cleanStr(v) {
  if (v === null || v === undefined) return "";
  return String(v).trim();
}

function optionalStr(v) {
  const s = cleanStr(v);
  return s ? s : undefined;
}

function normalizeComma(v) {
  if (v === null || v === undefined) return undefined;

  if (Array.isArray(v)) {
    const joined = v.map((x) => cleanStr(x)).filter(Boolean).join(", ");
    return joined ? joined : undefined;
  }

  const s = cleanStr(v);
  return s ? s : undefined;
}

function makeAnonEmail() {
  const id =
    typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : crypto.randomBytes(16).toString("hex");
  return `anon-${id}@ambit.local`;
}

function normalizeEmail(raw) {
  const s = cleanStr(raw).toLowerCase();
  if (!s) return makeAnonEmail();
  if (!s.includes("@")) return `${s}@ambit.local`;
  return s;
}

function normEmail(v) {
  return String(v || "").toLowerCase().trim();
}

/**
 * ✅ Array helpers
 */
function normalizeStringArray(v) {
  if (v === null || v === undefined) return undefined;

  // allow ["a","b"]
  if (Array.isArray(v)) {
    const arr = v.map((x) => cleanStr(x)).filter(Boolean);
    return arr.length ? arr : undefined;
  }

  // allow "a,b,c"
  const s = cleanStr(v);
  if (!s) return undefined;
  const parts = s
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);
  return parts.length ? parts : undefined;
}

const VALID_SEGMENTS = new Set(["government", "commercial", "residential"]);

// returns array of enum strings (lowercase) or undefined
function normalizeSegments(v) {
  const arr = normalizeStringArray(v);
  if (!arr) return undefined;

  const cleaned = arr
    .map((x) => cleanStr(x).toLowerCase())
    .filter(Boolean)
    .filter((x) => VALID_SEGMENTS.has(x));

  // unique, keep order
  const seen = new Set();
  const uniq = [];
  for (const x of cleaned) {
    if (!seen.has(x)) {
      seen.add(x);
      uniq.push(x);
    }
  }

  return uniq.length ? uniq : undefined;
}

// normalize NAICS codes array (digits only, max 6)
function normalizeNaicsCodes(v) {
  const arr = normalizeStringArray(v);
  if (!arr) return undefined;

  const cleaned = arr
    .map((x) => cleanStr(x).replace(/[^\d]/g, "").slice(0, 6))
    .filter(Boolean)
    .filter((x) => /^\d{2,6}$/.test(x));

  const seen = new Set();
  const uniq = [];
  for (const x of cleaned) {
    if (!seen.has(x)) {
      seen.add(x);
      uniq.push(x);
    }
  }

  return uniq.length ? uniq : undefined;
}

// ✅ Ingestion sources (NOT markets)
const VALID_SOURCES = new Set(["sam", "opengov", "planhub", "thumbtack"]);

// returns string[] of known ingestion sources, or undefined
function normalizeSources(v) {
  const arr = normalizeStringArray(v);
  if (!arr) return undefined;

  const cleaned = arr
    .map((x) => cleanStr(x).toLowerCase())
    .filter(Boolean)
    .filter((x) => VALID_SOURCES.has(x));

  const seen = new Set();
  const uniq = [];
  for (const x of cleaned) {
    if (!seen.has(x)) {
      seen.add(x);
      uniq.push(x);
    }
  }

  return uniq.length ? uniq : undefined;
}

// ✅ 7-day trial helper
function buildTrialWindow(days = 7) {
  const now = new Date();
  const ms = days * 24 * 60 * 60 * 1000;
  const trialEndsAt = new Date(now.getTime() + ms);
  return { now, trialEndsAt };
}

/**
 * ✅ SELF-SERVE PROFILE ROUTES (NO ADMIN KEY)
 *
 * GET   /engine/customers/:id/profile?email=...
 * PATCH /engine/customers/:id/profile   { email, location, naics, keywords, services, name }
 */

// ✅ GET profile (prefill editor)
router.get("/customers/:id/profile", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id) || id <= 0) {
      return res.status(400).json({ ok: false, error: "Invalid id" });
    }

    const email = normEmail(req.query?.email);
    if (!email) {
      return res.status(401).json({ ok: false, error: "Email required." });
    }

    const customer = await prisma.customer.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        location: true,
        serviceArea: true,
        naics: true,
        naicsCodes: true,
        keywords: true,
        services: true,
        segments: true,
        sources: true,
        isActive: true,
        subscriptionStatus: true,
        trialStartedAt: true,
        trialEndsAt: true,
        updatedAt: true,
      },
    });

    if (!customer) return res.status(404).json({ ok: false, error: "Not found" });

    // Simple proof-of-ownership (MVP): email must match the customer record
    if (normEmail(customer.email) !== email) {
      return res.status(401).json({ ok: false, error: "Email does not match this customer." });
    }

    return res.json({ ok: true, customer });
  } catch (err) {
    console.error("GET /engine/customers/:id/profile error:", err);
    return res.status(500).json({ ok: false, error: "Server error" });
  }
});

// ✅ PATCH profile (save changes)
router.patch("/customers/:id/profile", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id) || id <= 0) {
      return res.status(400).json({ ok: false, error: "Invalid id" });
    }

    const body = req.body || {};
    const email = normEmail(body.email);
    if (!email) {
      return res.status(401).json({ ok: false, error: "Email required." });
    }

    const existing = await prisma.customer.findUnique({
      where: { id },
      select: { id: true, email: true },
    });

    if (!existing) return res.status(404).json({ ok: false, error: "Not found" });

    if (normEmail(existing.email) !== email) {
      return res.status(401).json({ ok: false, error: "Email does not match this customer." });
    }

    // Allow these fields to be updated by the customer
    const name = optionalStr(body.name) || optionalStr(body.companyName);

    // Support both location and serviceArea inputs
    const location = optionalStr(body.location) || optionalStr(body.serviceArea);
    const serviceArea = optionalStr(body.serviceArea) || optionalStr(body.location);

    const naics = normalizeComma(body.naics);
    const keywords = normalizeComma(body.keywords);
    const services = optionalStr(body.services);

    // Optional (safe)
    const segments = normalizeSegments(body.segments);
    const sources = normalizeSources(body.sources);
    const naicsCodes = normalizeNaicsCodes(body.naicsCodes);

    const data = {};
    if (name !== undefined) data.name = name;
    if (location !== undefined) data.location = location;
    if (serviceArea !== undefined) data.serviceArea = serviceArea;
    if (naics !== undefined) data.naics = naics;
    if (keywords !== undefined) data.keywords = keywords;
    if (services !== undefined) data.services = services;

    if (segments !== undefined) data.segments = segments;
    if (sources !== undefined) data.sources = sources;
    if (naicsCodes !== undefined) data.naicsCodes = naicsCodes;

    if (Object.keys(data).length === 0) {
      return res.status(400).json({ ok: false, error: "No fields provided to update." });
    }

    await prisma.customer.update({ where: { id }, data });

    return res.json({ ok: true });
  } catch (err) {
    console.error("PATCH /engine/customers/:id/profile error:", err);
    return res.status(500).json({ ok: false, error: "Server error" });
  }
});

/**
 * ✅ ADMIN-ONLY ENDPOINTS (PROTECTED IN PROD)
 */

// ✅ GET /engine/customers
router.get("/customers", async (req, res) => {
  try {
    if (!requireAdmin(req, res)) return;

    const customers = await prisma.customer.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        location: true,
        serviceArea: true,
        keywords: true,
        naics: true,
        naicsCodes: true,
        segments: true,
        sources: true,
        isActive: true,
        subscriptionStatus: true,
        stripeCustomerId: true,
        stripeSubscriptionId: true,
        trialStartedAt: true,
        trialEndsAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return res.json(customers);
  } catch (err) {
    console.error("GET /engine/customers error:", err);
    return res.status(500).json({ ok: false, error: "Server error" });
  }
});

// ✅ GET /engine/customers/:id
router.get("/customers/:id", async (req, res) => {
  try {
    if (!requireAdmin(req, res)) return;

    const id = Number(req.params.id);
    if (!Number.isFinite(id) || id <= 0) {
      return res.status(400).json({ ok: false, error: "Invalid id" });
    }

    const customer = await prisma.customer.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        location: true,
        serviceArea: true,
        keywords: true,
        naics: true,
        naicsCodes: true,
        segments: true,
        sources: true,
        isActive: true,
        subscriptionStatus: true,
        stripeCustomerId: true,
        stripeSubscriptionId: true,
        trialStartedAt: true,
        trialEndsAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!customer) return res.status(404).json({ ok: false, error: "Not found" });
    return res.json(customer);
  } catch (err) {
    console.error("GET /engine/customers/:id error:", err);
    return res.status(500).json({ ok: false, error: "Server error" });
  }
});

// ✅ POST /engine/customers (create or update) + START 7-DAY TRIAL (no CC)
router.post("/customers", async (req, res) => {
  try {
    const body = req.body || {};

    const email = normalizeEmail(body.email);

    const providedName = optionalStr(body.name) || optionalStr(body.companyName);
    const emailPrefix = email.includes("@") ? email.split("@")[0] : email;

    // name is required by Prisma schema on CREATE
    const nameForCreate = providedName || emailPrefix || "Customer";

    const phone = optionalStr(body.phone);
    const industry = optionalStr(body.industry);

    // Support both location and serviceArea inputs
    const location = optionalStr(body.location) || optionalStr(body.serviceArea);
    const serviceArea = optionalStr(body.serviceArea) || optionalStr(body.location);

    const services = optionalStr(body.services);

    const keywords = normalizeComma(body.keywords);
    const naics = normalizeComma(body.naics);

    // arrays
    const segments = normalizeSegments(body.segments);
    const sources = normalizeSources(body.sources); // ingestion sources only
    const naicsCodes = normalizeNaicsCodes(body.naicsCodes);

    // ✅ IMPORTANT DEFAULTS on CREATE
    const segmentsForCreate = segments ?? ["residential", "commercial", "government"];
    const sourcesForCreate = sources ?? ["sam"];
    const naicsCodesForCreate = naicsCodes ?? [];

    // Look up existing so we can conditionally start a trial (no CC)
    const existing = await prisma.customer.findUnique({
      where: { email },
      select: {
        id: true,
        isActive: true,
        subscriptionStatus: true,
        trialStartedAt: true,
        trialEndsAt: true,
      },
    });

    const shouldStartTrial =
      !existing ||
      (!existing.isActive && !existing.trialStartedAt && !existing.trialEndsAt);

    const { now, trialEndsAt } = buildTrialWindow(7);

    // Only update what caller actually sent
    const updateData = {};
    if (providedName) updateData.name = providedName;
    if (phone !== undefined) updateData.phone = phone;
    if (industry !== undefined) updateData.industry = industry;

    if (location !== undefined) updateData.location = location;
    if (serviceArea !== undefined) updateData.serviceArea = serviceArea;

    if (services !== undefined) updateData.services = services;
    if (keywords !== undefined) updateData.keywords = keywords;
    if (naics !== undefined) updateData.naics = naics;

    // Only update arrays when provided (don’t clobber existing)
    if (segments !== undefined) updateData.segments = segments;
    if (sources !== undefined) updateData.sources = sources;
    if (naicsCodes !== undefined) updateData.naicsCodes = naicsCodes;

    // ✅ Start a 7-day trial if they don’t have one and aren’t active
    if (shouldStartTrial) {
      updateData.trialStartedAt = now;
      updateData.trialEndsAt = trialEndsAt;
      // Only set subscriptionStatus if empty
      if (!existing?.subscriptionStatus) updateData.subscriptionStatus = "TRIALING";
    }

    const customer = await prisma.customer.upsert({
      where: { email },
      update: updateData,
      create: {
        name: nameForCreate,
        email,
        phone: phone ?? null,
        industry: industry ?? null,
        location: location ?? null,
        serviceArea: serviceArea ?? null,
        services: services ?? null,
        keywords: keywords ?? null,
        naics: naics ?? null,

        // required arrays on create
        segments: segmentsForCreate,
        sources: sourcesForCreate,
        naicsCodes: naicsCodesForCreate,

        // trial fields (no credit card required)
        trialStartedAt: now,
        trialEndsAt,
        subscriptionStatus: "TRIALING",
        isActive: false,

        // passwordHash stays null until register
      },
    });

    return res.status(200).json(customer);
  } catch (err) {
    console.error("POST /engine/customers error:", err);
    return res.status(500).json({
      ok: false,
      message: "Server error creating customer",
      error: err?.message || String(err),
    });
  }
});

export default router;
