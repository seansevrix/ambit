// backend/routes/auth.js
import express from "express";
import bcrypt from "bcryptjs";
import prisma from "../lib/prismaClient.js";

const router = express.Router();

function cleanStr(v) {
  if (v === null || v === undefined) return "";
  return String(v).trim();
}

function isEmail(s) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(s || "").trim());
}

// Return undefined if empty -> Prisma update won't touch it
function optionalStr(v) {
  const s = cleanStr(v);
  return s ? s : undefined;
}

// Store comma-separated strings in DB (keywords/naics in your schema)
function normalizeComma(v) {
  if (v === null || v === undefined) return undefined;

  if (Array.isArray(v)) {
    const joined = v.map((x) => cleanStr(x)).filter(Boolean).join(", ");
    return joined ? joined : undefined;
  }

  const s = cleanStr(v);
  return s ? s : undefined;
}

// POST /engine/auth/register
router.post("/register", async (req, res) => {
  try {
    const body = req.body || {};

    const cleanEmail = cleanStr(body.email).toLowerCase();
    const cleanPassword = String(body.password || "");

    if (!isEmail(cleanEmail)) {
      return res.status(400).json({ ok: false, error: "Valid email is required." });
    }
    if (cleanPassword.length < 8) {
      return res.status(400).json({ ok: false, error: "Password must be at least 8 characters." });
    }

    // Name is optional (auto-fill)
    const nameFromBody = optionalStr(body.name);
    const emailPrefix = cleanEmail.split("@")[0];
    const finalName = nameFromBody || emailPrefix || "Customer";

    // Optional fields
    const phone = optionalStr(body.phone);
    const industry = optionalStr(body.industry);
    const location = optionalStr(body.location);
    const services = optionalStr(body.services);

    const keywords = normalizeComma(body.keywords);
    const naics = normalizeComma(body.naics);

    const existing = await prisma.customer.findUnique({
      where: { email: cleanEmail },
      select: { id: true, passwordHash: true, name: true, email: true, isActive: true },
    });

    const passwordHash = await bcrypt.hash(cleanPassword, 10);

    // ✅ If record exists but has no passwordHash (lead created earlier),
    // upgrade it into a real account instead of blocking with 409.
    if (existing) {
      if (existing.passwordHash) {
        return res.status(409).json({ ok: false, error: "An account with that email already exists." });
      }

      const updated = await prisma.customer.update({
        where: { email: cleanEmail },
        data: {
          passwordHash,
          // Only update these if caller provided them (avoid wiping fields)
          ...(nameFromBody ? { name: finalName } : {}),
          ...(phone !== undefined ? { phone } : {}),
          ...(industry !== undefined ? { industry } : {}),
          ...(location !== undefined ? { location } : {}),
          ...(services !== undefined ? { services } : {}),
          ...(keywords !== undefined ? { keywords } : {}),
          ...(naics !== undefined ? { naics } : {}),
          isActive: false,
        },
        select: { id: true, name: true, email: true, isActive: true },
      });

      return res.status(200).json({ ok: true, customer: updated, upgraded: true });
    }

    // Otherwise create fresh account
    const customer = await prisma.customer.create({
      data: {
        name: finalName,
        email: cleanEmail,
        passwordHash,
        phone: phone ?? null,
        industry: industry ?? null,
        location: location ?? null,
        services: services ?? null,
        keywords: keywords ?? null,
        naics: naics ?? null,
        isActive: false,
      },
      select: { id: true, name: true, email: true, isActive: true },
    });

    return res.status(201).json({ ok: true, customer });
  } catch (e) {
    console.error("REGISTER ERROR:", e);
    return res.status(500).json({ ok: false, error: "Failed to register." });
  }
});

// POST /engine/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};
    const cleanEmail = cleanStr(email).toLowerCase();
    const cleanPassword = String(password || "");

    if (!isEmail(cleanEmail)) {
      return res.status(400).json({ ok: false, error: "Valid email is required." });
    }
    if (!cleanPassword) {
      return res.status(400).json({ ok: false, error: "Password is required." });
    }

    const customer = await prisma.customer.findUnique({
      where: { email: cleanEmail },
      select: { id: true, name: true, email: true, passwordHash: true, isActive: true },
    });

    if (!customer?.passwordHash) {
      return res.status(401).json({ ok: false, error: "Invalid email or password." });
    }

    const ok = await bcrypt.compare(cleanPassword, customer.passwordHash);
    if (!ok) {
      return res.status(401).json({ ok: false, error: "Invalid email or password." });
    }

    return res.status(200).json({
      ok: true,
      user: {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        isActive: customer.isActive,
      },
    });
  } catch (e) {
    console.error("LOGIN ERROR:", e);
    return res.status(500).json({ ok: false, error: "Failed to login." });
  }
});

export default router;
