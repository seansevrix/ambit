// backend/routes/customers.js
import express from "express";
import crypto from "crypto";
import prisma from "../lib/prisma.js";
import stripe from "../lib/stripe.js"; // make sure this path matches your project

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
 *  - APP_URL / FRONTEND_URL (used for links in emails)
 */
const ADMIN_NOTIFY_EMAIL = process.env.ADMIN_NOTIFY_EMAIL || "ambit@sevrixgov.com";
const ADMIN_NOTIFY_ON_REPEAT = String(process.env.ADMIN_NOTIFY_ON_REPEAT || "") === "1";

const APP_URL = process.env.FRONTEND_URL || process.env.APP_URL || "https://www.ambitco.app";
const RESEND_TIMEOUT_MS = Number(process.env.RESEND_TIMEOUT_MS || 2500);

/**
 * ✅ Plans (CURRENT)
 *  - associate   (LEGACY / grandfathered only)  existing subs keep old $49.99 forever
 *  - starter     ($49.99/mo)  morning matches only
 *  - pro         ($129.99/mo) 1:1 analyst + summaries + templates
 *  - enterprise  ($1499.99/mo) priority lane + execution support
 *
 * ✅ Env var standard (recommended)
 *  - STRIPE_PRICE_ID_ASSOCIATE   (legacy)
 *  - STRIPE_PRICE_ID_STARTER
 *  - STRIPE_PRICE_ID_PRO
 *  - STRIPE_PRICE_ID_ENTERPRISE
 *
 * ✅ Back-compat supported (old names)
 *  - associate: STRIPE_PRICE_ASSOCIATE / STRIPE_PRICE_SINGLE_ID / STRIPE_PRICE_ID
 *  - starter: STRIPE_PRICE_STARTER
 *  - pro: STRIPE_PRICE_PRO
 *  - enterprise: STRIPE_PRICE_ENTERPRISE / STRIPE_PRICE_ENTERPRISE_ID
 *  - optional legacy: STRIPE_PRICE_ID_EXECUTIVE / STRIPE_PRICE_EXECUTIVE / STRIPE_PRICE_ALL_ID / STRIPE_PRICE_ALL
 */

// Legacy / Associate (grandfathered)
const PRICE_ID_ASSOCIATE =
  process.env.STRIPE_PRICE_ID_ASSOCIATE ||
  process.env.STRIPE_ASSOCIATE_PRICE_ID ||
  process.env.STRIPE_PRICE_ASSOCIATE ||
  process.env.STRIPE_PRICE_SINGLE_ID ||
  process.env.STRIPE_PRICE_SINGLE ||
  process.env.STRIPE_PRICE_ID ||
  "";

// Starter (new)
const PRICE_ID_STARTER =
  process.env.STRIPE_PRICE_ID_STARTER ||
  process.env.STRIPE_STARTER_PRICE_ID ||
  process.env.STRIPE_PRICE_STARTER ||
  "";

// Pro (new)
const PRICE_ID_PRO =
  process.env.STRIPE_PRICE_ID_PRO ||
  process.env.STRIPE_PRO_PRICE_ID ||
  process.env.STRIPE_PRICE_PRO ||
  "";

// Enterprise (new)
const PRICE_ID_ENTERPRISE =
  process.env.STRIPE_PRICE_ID_ENTERPRISE ||
  process.env.STRIPE_ENTERPRISE_PRICE_ID ||
  process.env.STRIPE_PRICE_ENTERPRISE ||
  process.env.STRIPE_PRICE_ENTERPRISE_ID ||
  "";

// Optional: old executive fallbacks (kept only so ancient env setups / old links won't break)
const PRICE_ID_EXECUTIVE =
  process.env.STRIPE_PRICE_ID_EXECUTIVE ||
  process.env.STRIPE_EXECUTIVE_PRICE_ID ||
  process.env.STRIPE_PRICE_EXECUTIVE ||
  process.env.STRIPE_PRICE_ALL_ID ||
  process.env.STRIPE_PRICE_ALL ||
  "";

/**
 * Consider these statuses "paid/allowed" from Stripe webhook sync.
 */
const PAID_ACTIVE_STATUSES = new Set(["ACTIVE", "PAST_DUE", "UNPAID"]);

/**
 * ✅ Resend email with hard timeout (so it can’t hang the server)
 */
async function sendResendEmail({ to, subject, html, text, timeoutMs = RESEND_TIMEOUT_MS }) {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM;

  if (!key || !from) {
    console.log("[email] skipping (missing RESEND_API_KEY or RESEND_FROM)");
    return null;
  }

  const ac = new AbortController();
  const t = setTimeout(() => ac.abort(), timeoutMs);

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from, to, subject, html, text }),
      signal: ac.signal,
    });

    if (!res.ok) {
      const msg = await res.text().catch(() => "");
      throw new Error(`Resend error ${res.status}: ${msg}`);
    }

    return await res.json().catch(() => ({}));
  } finally {
    clearTimeout(t);
  }
}

async function sendResendEmailSafe(args) {
  try {
    await sendResendEmail(args);
  } catch (e) {
    console.error("[email] send failed:", e?.message || e);
  }
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
 * ✅ Normalize phone so email notifications are clean/consistent
 */
function normalizePhone(raw) {
  const s = cleanStr(raw);
  if (!s) return undefined;

  const digits = s.replace(/\D/g, "");

  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }

  if (digits.length === 11 && digits.startsWith("1")) {
    return `+1 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
  }

  // Keep original if international/custom format
  return s;
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

/**
 * Plans:
 *  - starter (public)
 *  - pro (public)
 *  - enterprise (public)
 *  - associate (legacy/grandfathered)
 *
 * Back-compat:
 *  - associate/single/basic => associate
 *  - executive/prime/all/all3/all_markets => pro (default)
 */
function normalizePlan(v) {
  const p = String(v || "").trim().toLowerCase();

  // New public plans
  if (p === "starter" || p === "49.99" || p === "49" || p === "starter_monthly") return "starter";
  if (
    p === "pro" ||
    p === "129.99" ||
    p === "129" ||
    p === "pro_monthly" ||
    p === "executive" ||
    p === "exec" ||
    p === "prime" ||
    p === "all" ||
    p === "all3" ||
    p === "all_markets"
  )
    return "pro";
  if (p === "enterprise" || p === "1499" || p === "1499.99" || p === "elite" || p === "enterprise_monthly")
    return "enterprise";

  // Legacy/grandfathered
  if (p === "associate" || p === "single" || p === "single_market" || p === "basic") return "associate";

  // Default for new traffic
  return "pro";
}

function resolvePriceId(plan, planRaw) {
  // If someone hits old "executive" AND you still have legacy env configured, honor it.
  const raw = String(planRaw || "").trim().toLowerCase();
  const wantsLegacyExecutive = raw === "executive" || raw === "prime";
  if (wantsLegacyExecutive && PRICE_ID_EXECUTIVE) return PRICE_ID_EXECUTIVE;

  if (plan === "starter") return PRICE_ID_STARTER;
  if (plan === "pro") return PRICE_ID_PRO;
  if (plan === "enterprise") return PRICE_ID_ENTERPRISE;
  if (plan === "associate") return PRICE_ID_ASSOCIATE;

  return "";
}

function missingPriceMessage(plan) {
  if (plan === "starter") {
    return "Stripe price ID is missing. Set STRIPE_PRICE_ID_STARTER (or STRIPE_PRICE_STARTER) in backend env.";
  }
  if (plan === "pro") {
    return "Stripe price ID is missing. Set STRIPE_PRICE_ID_PRO (or STRIPE_PRICE_PRO) in backend env.";
  }
  if (plan === "enterprise") {
    return "Stripe price ID is missing. Set STRIPE_PRICE_ID_ENTERPRISE (or STRIPE_PRICE_ENTERPRISE / STRIPE_PRICE_ENTERPRISE_ID) in backend env.";
  }
  if (plan === "associate") {
    return "Stripe price ID is missing. Set STRIPE_PRICE_ID_ASSOCIATE (or STRIPE_PRICE_ASSOCIATE / STRIPE_PRICE_SINGLE_ID / STRIPE_PRICE_ID) in backend env.";
  }
  return "Stripe price ID is missing. Set the appropriate STRIPE_PRICE_ID_* env var in backend env.";
}

function getSuccessUrl(customerId, plan) {
  return `${APP_URL}/matches/${customerId}?checkout=success&plan=${encodeURIComponent(plan || "")}`;
}

function getCancelUrl(customerId, email, plan) {
  return `${APP_URL}/get-started?customerId=${customerId}&email=${encodeURIComponent(
    email || ""
  )}&checkout=canceled&plan=${encodeURIComponent(plan || "")}`;
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
        phone: true,
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
    const phone = normalizePhone(body.phone || body.phoneNumber);

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
    if (phone !== undefined) data.phone = phone;
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
        phone: true,
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
        phone: true,
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

/**
 * ✅ POST /engine/customers
 * Paid-first + immediate checkout session creation.
 * - New customers are created as INACTIVE.
 * - Checkout session is created immediately.
 * - Account becomes active only after Stripe webhook confirms payment/subscription.
 *
 * ✅ IMPORTANT FIX:
 * Do NOT deactivate paid/active customers if they submit this endpoint again.
 * That preserves grandfathered "associate" customers and prevents accidental re-checkout.
 */
router.post("/customers", async (req, res) => {
  try {
    const body = req.body || {};
    const email = normalizeEmail(body.email);

    const providedName = optionalStr(body.name) || optionalStr(body.companyName);
    const emailPrefix = email.includes("@") ? email.split("@")[0] : email;
    const nameForCreate = providedName || emailPrefix || "Customer";

    const phone = normalizePhone(body.phone || body.phoneNumber);
    const industry = optionalStr(body.industry);

    const location = optionalStr(body.location) || optionalStr(body.serviceArea);
    const serviceArea = optionalStr(body.serviceArea) || optionalStr(body.location);

    const services = optionalStr(body.services);
    const keywords = normalizeComma(body.keywords);
    const naics = normalizeComma(body.naics);

    const segments = normalizeSegments(body.segments);
    const sources = normalizeSources(body.sources);
    const naicsCodes = normalizeNaicsCodes(body.naicsCodes);

    const segmentsForCreate = segments ?? ["residential", "commercial", "government"];
    const sourcesForCreate = sources ?? ["sam", "opengov"];
    const naicsCodesForCreate = naicsCodes ?? [];

    // Plan can come in under a few keys (don’t break old clients/frontends)
    const planRaw =
      body.plan ||
      body.tier ||
      body.subscription ||
      body.priceTier ||
      "";

    const plan = normalizePlan(planRaw);

    const existing = await prisma.customer.findUnique({
      where: { email },
      select: {
        id: true,
        isActive: true,
        subscriptionStatus: true,
        stripeCustomerId: true,
        stripeSubscriptionId: true,
      },
    });

    const isNewSignup = !existing;

    // ✅ If they are already paid (per webhook sync), do NOT force checkout or deactivate them.
    const existingStatusUpper = String(existing?.subscriptionStatus || "").toUpperCase();
    const existingPaid = Boolean(existing) && PAID_ACTIVE_STATUSES.has(existingStatusUpper);

    const updateData = {};
    if (providedName !== undefined) updateData.name = providedName;
    if (phone !== undefined) updateData.phone = phone;
    if (industry !== undefined) updateData.industry = industry;
    if (location !== undefined) updateData.location = location;
    if (serviceArea !== undefined) updateData.serviceArea = serviceArea;
    if (services !== undefined) updateData.services = services;
    if (keywords !== undefined) updateData.keywords = keywords;
    if (naics !== undefined) updateData.naics = naics;
    if (segments !== undefined) updateData.segments = segments;
    if (sources !== undefined) updateData.sources = sources;
    if (naicsCodes !== undefined) updateData.naicsCodes = naicsCodes;

    // ✅ Only force INACTIVE for unpaid flows (new signups or unpaid repeats)
    if (!existingPaid) {
      updateData.isActive = false;
      updateData.subscriptionStatus = "INACTIVE";
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
        subscriptionStatus: "INACTIVE",
        isActive: false,
      },
    });

    // If already paid/active, no need to force another checkout.
    const statusUpper = String(customer.subscriptionStatus || "").toUpperCase();
    const alreadyPaid = PAID_ACTIVE_STATUSES.has(statusUpper) && (customer.isActive || existingPaid);

    let checkoutUrl = null;
    let checkoutSessionId = null;

    if (!alreadyPaid) {
      const priceId = resolvePriceId(plan, planRaw);

      if (!priceId) {
        return res.status(500).json({
          ok: false,
          error: missingPriceMessage(plan),
        });
      }

      // Ensure Stripe customer exists (re-use if present)
      let stripeCustomerId = customer.stripeCustomerId || existing?.stripeCustomerId || null;

      if (!stripeCustomerId) {
        const sc = await stripe.customers.create({
          email: customer.email,
          name: customer.name || undefined,
          phone: customer.phone || undefined,
          metadata: {
            customerId: String(customer.id),
            app: "ambit",
          },
        });
        stripeCustomerId = sc.id;
      }

      const session = await stripe.checkout.sessions.create({
        mode: "subscription",
        customer: stripeCustomerId,
        line_items: [{ price: priceId, quantity: 1 }],
        success_url: getSuccessUrl(customer.id, plan),
        cancel_url: getCancelUrl(customer.id, customer.email, plan),
        payment_method_collection: "always",
        allow_promotion_codes: true,
        client_reference_id: String(customer.id),
        metadata: {
          customerId: String(customer.id),
          email: customer.email,
          plan,
          source: "customers_signup",
        },
        subscription_data: {
          metadata: {
            customerId: String(customer.id),
            plan,
          },
        },
      });

      checkoutUrl = session.url || null;
      checkoutSessionId = session.id || null;

      await prisma.customer.update({
        where: { id: customer.id },
        data: {
          stripeCustomerId,
          isActive: false,
          subscriptionStatus: "INACTIVE",
        },
      });
    }

    const safeCustomer = {
      id: customer.id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone ?? null,
      location: customer.location,
      serviceArea: customer.serviceArea,
      services: customer.services,
      keywords: customer.keywords,
      naics: customer.naics,
      naicsCodes: customer.naicsCodes,
      segments: customer.segments,
      sources: customer.sources,
      isActive: alreadyPaid ? true : false,
      subscriptionStatus: alreadyPaid ? customer.subscriptionStatus : "INACTIVE",
      stripeCustomerId: customer.stripeCustomerId ?? null,
      createdAt: customer.createdAt,
      updatedAt: customer.updatedAt,
    };

    // Respond immediately
    res.status(200).json({
      ok: true,
      customerId: customer.id,
      customer: safeCustomer,
      isNewSignup,
      alreadyPaid,
      requiresCheckout: !alreadyPaid,
      checkoutUrl,
      checkoutSessionId,
      plan,
    });

    // Background emails
    queueMicrotask(() => {
      if (isNewSignup) {
        const subject = "Welcome to AMBIT — complete payment to activate your account";
        const profileUrl = `${APP_URL}/customers/${customer.id}/profile`;

        const html = `
          <div style="font-family:ui-sans-serif,system-ui;line-height:1.5">
            <h2 style="margin:0 0 8px">Welcome to AMBIT 👋</h2>

            <p style="margin:0 0 12px">
              Your profile is created. Complete payment to activate daily matched opportunities.
            </p>

            ${
              checkoutUrl
                ? `
              <p style="margin:16px 0 0">
                <a href="${checkoutUrl}" target="_blank"
                  style="display:inline-block;background:#2563eb;color:white;padding:10px 14px;border-radius:10px;text-decoration:none;font-weight:700">
                  Complete payment
                </a>
              </p>
              `
                : ""
            }

            <p style="margin:10px 0 0">
              <a href="${profileUrl}" target="_blank" style="color:#111;text-decoration:underline">
                Update my profile
              </a>
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
          `Your profile is created. Complete payment to activate daily matched opportunities.\n\n` +
          (checkoutUrl ? `Complete payment: ${checkoutUrl}\n` : "") +
          `Update profile: ${profileUrl}\n`;

        void sendResendEmailSafe({
          to: customer.email,
          subject,
          html,
          text,
        });
      }

      if (isNewSignup || ADMIN_NOTIFY_ON_REPEAT) {
        const subject = `New AMBIT signup: ${customer.email}`;
        const html = `
          <div style="font-family:ui-sans-serif,system-ui;line-height:1.5">
            <h2 style="margin:0 0 8px">New AMBIT signup</h2>
            <p style="margin:0 0 12px"><b>${customer.email}</b> created/updated a profile.</p>
            <ul style="margin:0;padding-left:18px">
              <li><b>Name:</b> ${customer.name || "—"}</li>
              <li><b>Phone:</b> ${customer.phone || "—"}</li>
              <li><b>Location:</b> ${customer.location || customer.serviceArea || "—"}</li>
              <li><b>Segments:</b> ${(customer.segments || []).join(", ")}</li>
              <li><b>NAICS:</b> ${customer.naics || "—"}</li>
              <li><b>Keywords:</b> ${customer.keywords || "—"}</li>
              <li><b>Plan:</b> ${plan}</li>
              <li><b>Status:</b> ${alreadyPaid ? customer.subscriptionStatus : "INACTIVE"}</li>
              <li><b>Checkout created:</b> ${checkoutSessionId ? "Yes" : "No"}</li>
            </ul>
          </div>
        `;

        const text =
          `New AMBIT signup\n` +
          `Email: ${customer.email}\n` +
          `Name: ${customer.name || "—"}\n` +
          `Phone: ${customer.phone || "—"}\n` +
          `Location: ${customer.location || customer.serviceArea || "—"}\n` +
          `Segments: ${(customer.segments || []).join(", ") || "—"}\n` +
          `NAICS: ${customer.naics || "—"}\n` +
          `Keywords: ${customer.keywords || "—"}\n` +
          `Plan: ${plan}\n` +
          `Status: ${alreadyPaid ? customer.subscriptionStatus : "INACTIVE"}\n` +
          `Checkout created: ${checkoutSessionId ? "Yes" : "No"}`;

        void sendResendEmailSafe({
          to: ADMIN_NOTIFY_EMAIL,
          subject,
          html,
          text,
        });
      }
    });
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