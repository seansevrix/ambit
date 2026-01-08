// backend/routes/customers.js
import express from "express";
import crypto from "crypto";
import prisma from "../lib/prisma.js"; // ✅ make sure this matches your actual file name

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
 * ✅ SELF-SERVE PROFILE ROUTES (NO ADMIN KEY)
 * Allows customers to update NAICS + location (and optional keywords/services)
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
        naics: true,
        keywords: true,
        services: true,
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
    const location = optionalStr(body.location) || optionalStr(body.serviceArea);
    const naics = normalizeComma(body.naics);
    const keywords = normalizeComma(body.keywords);
    const services = optionalStr(body.services);

    const data = {};
    if (name !== undefined) data.name = name;
    if (location !== undefined) data.location = location;
    if (naics !== undefined) data.naics = naics;
    if (keywords !== undefined) data.keywords = keywords;
    if (services !== undefined) data.services = services;

    // If they sent nothing to update
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
        keywords: true,
        naics: true,
        isActive: true,
        subscriptionStatus: true,
        stripeCustomerId: true,
        stripeSubscriptionId: true,
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
        keywords: true,
        naics: true,
        isActive: true,
        subscriptionStatus: true,
        stripeCustomerId: true,
        stripeSubscriptionId: true,
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

// ✅ POST /engine/customers (create or update)
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
    const location = optionalStr(body.location) || optionalStr(body.serviceArea);
    const services = optionalStr(body.services);

    const keywords = normalizeComma(body.keywords);
    const naics = normalizeComma(body.naics);

    // Only update what caller actually sent
    const updateData = {};
    if (providedName) updateData.name = providedName;
    if (phone !== undefined) updateData.phone = phone;
    if (industry !== undefined) updateData.industry = industry;
    if (location !== undefined) updateData.location = location;
    if (services !== undefined) updateData.services = services;
    if (keywords !== undefined) updateData.keywords = keywords;
    if (naics !== undefined) updateData.naics = naics;

    const customer = await prisma.customer.upsert({
      where: { email },
      update: updateData,
      create: {
        name: nameForCreate,
        email,
        phone: phone ?? null,
        industry: industry ?? null,
        location: location ?? null,
        services: services ?? null,
        keywords: keywords ?? null,
        naics: naics ?? null,
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
