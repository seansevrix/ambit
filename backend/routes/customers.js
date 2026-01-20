// backend/routes/customers.js
import express from "express";
import crypto from "crypto";
import prisma from "../lib/prisma.js";

const router = express.Router();

/**
 * Email helpers (Resend via fetch)
 * Required env:
 *  - RESEND_API_KEY
 *  - RESEND_FROM   (example: "ambit@sevrixgov.com" or "AMBIT <ambit@sevrixgov.com>")
 *
 * Optional env:
 *  - ADMIN_NOTIFY_EMAIL (default: ambit@sevrixgov.com)
 *  - ADMIN_NOTIFY_ON_REPEAT=1  (also notify admin on repeat submits)
 *  - APP_URL / FRONTEND_URL (used for links in welcome email)
 */
const ADMIN_NOTIFY_EMAIL = process.env.ADMIN_NOTIFY_EMAIL || "ambit@sevrixgov.com";
const ADMIN_NOTIFY_ON_REPEAT = String(process.env.ADMIN_NOTIFY_ON_REPEAT || "") === "1";

const APP_URL =
  process.env.FRONTEND_URL ||
  process.env.APP_URL ||
  "https://www.ambitco.app";

async function sendResendEmail({ to, subject, html, text }) {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM;

  if (!key || !from) {
    console.log("[email] skipping (missing RESEND_API_KEY or RESEND_FROM)");
    return null;
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to,
      subject,
      html,
      text,
    }),
  });

  if (!res.ok) {
    const msg = await res.text().catch(() => "");
    throw new Error(`Resend error ${res.status}: ${msg}`);
  }

  return await res.json().catch(() => ({}));
}

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

  if (Array.isArray(v)) {
    const arr = v.map((x) => cleanStr(x)).filter(Boolean);
    return arr.length ? arr : undefined;
  }

  const s = cleanStr(v);
  if (!s) return undefined;
  const parts = s
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);
  return parts.length ? parts : undefined;
}

const VALID_SEGMENTS = new Set(["government", "commercial", "residential"]);

function normalizeSegments(v) {
  const arr = normalizeStringArray(v);
  if (!arr) return undefined;

  const cleaned = arr
    .map((x) => cleanStr(x).toLowerCase())
    .filter(Boolean)
    .filter((x) => VALID_SEGMENTS.has(x));

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
 */

// GET profile
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

    if (normEmail(customer.email) !== email) {
      return res.status(401).json({ ok: false, error: "Email does not match this customer." });
    }

    return res.json({ ok: true, customer });
  } catch (err) {
    console.error("GET /engine/customers/:id/profile error:", err);
    return res.status(500).json({ ok: false, error: "Server error" });
  }
});

// PATCH profile
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

    const name = optionalStr(body.name) || optionalStr(body.companyName);

    const location = optionalStr(body.location) || optionalStr(body.serviceArea);
    const serviceArea = optionalStr(body.serviceArea) || optionalStr(body.location);

    const naics = normalizeComma(body.naics);
    const keywords = normalizeComma(body.keywords);
    const services = optionalStr(body.services);

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

// ✅ POST /engine/customers (create or update) + START 7-DAY TRIAL (no CC) + WELCOME + ADMIN NOTIFY
router.post("/customers", async (req, res) => {
  try {
    const body = req.body || {};
    const email = normalizeEmail(body.email);

    const providedName = optionalStr(body.name) || optionalStr(body.companyName);
    const emailPrefix = email.includes("@") ? email.split("@")[0] : email;
    const nameForCreate = providedName || emailPrefix || "Customer";

    const phone = optionalStr(body.phone);
    const industry = optionalStr(body.industry);

    const location = optionalStr(body.location) || optionalStr(body.serviceArea);
    const serviceArea = optionalStr(body.serviceArea) || optionalStr(body.location);

    const services = optionalStr(body.services);

    const keywords = normalizeComma(body.keywords);
    const naics = normalizeComma(body.naics);

    const segments = normalizeSegments(body.segments);
    const sources = normalizeSources(body.sources); // ingest sources only
    const naicsCodes = normalizeNaicsCodes(body.naicsCodes);

    const segmentsForCreate = segments ?? ["residential", "commercial", "government"];
    const sourcesForCreate = sources ?? ["sam", "opengov"];
    const naicsCodesForCreate = naicsCodes ?? [];

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

    const isNewSignup = !existing;

    const shouldStartTrial =
      !existing ||
      (!existing.isActive && !existing.trialStartedAt && !existing.trialEndsAt);

    const { now, trialEndsAt } = buildTrialWindow(7);

    const updateData = {};
    if (providedName) updateData.name = providedName;
    if (phone !== undefined) updateData.phone = phone;
    if (industry !== undefined) updateData.industry = industry;

    if (location !== undefined) updateData.location = location;
    if (serviceArea !== undefined) updateData.serviceArea = serviceArea;

    if (services !== undefined) updateData.services = services;
    if (keywords !== undefined) updateData.keywords = keywords;
    if (naics !== undefined) updateData.naics = naics;

    if (segments !== undefined) updateData.segments = segments;
    if (sources !== undefined) updateData.sources = sources; // only if valid
    if (naicsCodes !== undefined) updateData.naicsCodes = naicsCodes;

    if (shouldStartTrial) {
      updateData.trialStartedAt = now;
      updateData.trialEndsAt = trialEndsAt;
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
        segments: segmentsForCreate,
        sources: sourcesForCreate,
        naicsCodes: naicsCodesForCreate,
        trialStartedAt: now,
        trialEndsAt,
        subscriptionStatus: "TRIALING",
        isActive: false,
      },
    });

    // ✅ Welcome email to customer (NEW signup only)
    if (isNewSignup) {
      const subject = "Welcome to AMBIT — your 7-day free trial starts now";
      const matchesUrl = `${APP_URL}/matches/${customer.id}`;

      const html = `
        <div style="font-family:ui-sans-serif,system-ui;line-height:1.5">
          <h2 style="margin:0 0 8px">Welcome to AMBIT 👋</h2>
          <p style="margin:0 0 12px">
            Your <b>7-day free trial</b> is active. You’ll receive <b>daily matched opportunities</b>
            across <b>Residential • Commercial • Government</b>.
          </p>

          <p style="margin:0 0 12px">
            Want to see your matches now?
          </p>

          <p style="margin:16px 0 0">
            <a href="${matchesUrl}" target="_blank"
              style="display:inline-block;background:#2563eb;color:white;padding:10px 14px;border-radius:10px;text-decoration:none;font-weight:700">
              View my matches
            </a>
          </p>

          <p style="margin:14px 0 0;color:#444;font-size:13px">
            Trial ends: <b>${customer.trialEndsAt ? new Date(customer.trialEndsAt).toLocaleString("en-US") : "—"}</b>
          </p>

          <hr style="border:none;border-top:1px solid #eee;margin:18px 0" />
          <div style="color:#666;font-size:12px;line-height:1.5">
            You’re receiving this because you signed up at
            <a href="${APP_URL}" target="_blank" style="color:#111">${APP_URL}</a>.
            <br/>
            Questions? Reply to this email.
          </div>
        </div>
      `;

      const text =
        `Welcome to AMBIT!\n\n` +
        `Your 7-day free trial is active. You'll receive daily matched opportunities.\n\n` +
        `View matches: ${matchesUrl}\n`;

      sendResendEmail({
        to: customer.email,
        subject,
        html,
        text,
      }).catch((e) => console.error("[email] welcome send failed:", e?.message || e));
    }

    // ✅ Admin notify on new signup (and optionally on repeats)
    if (isNewSignup || ADMIN_NOTIFY_ON_REPEAT) {
      const subject = `New AMBIT signup: ${customer.email}`;
      const html = `
        <div style="font-family:ui-sans-serif,system-ui;line-height:1.5">
          <h2 style="margin:0 0 8px">New AMBIT signup</h2>
          <p style="margin:0 0 12px"><b>${customer.email}</b> just created a profile.</p>
          <ul style="margin:0;padding-left:18px">
            <li><b>Name:</b> ${customer.name || "—"}</li>
            <li><b>Location:</b> ${customer.location || customer.serviceArea || "—"}</li>
            <li><b>Segments:</b> ${(customer.segments || []).join(", ")}</li>
            <li><b>NAICS:</b> ${customer.naics || "—"}</li>
            <li><b>Keywords:</b> ${customer.keywords || "—"}</li>
            <li><b>Trial ends:</b> ${customer.trialEndsAt ? new Date(customer.trialEndsAt).toISOString() : "—"}</li>
          </ul>
        </div>
      `;

      sendResendEmail({
        to: ADMIN_NOTIFY_EMAIL,
        subject,
        html,
        text: `New AMBIT signup: ${customer.email}`,
      }).catch((e) => console.error("[email] admin signup notify failed:", e?.message || e));
    }

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
