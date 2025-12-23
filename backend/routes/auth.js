// backend/routes/auth.js
import express from "express";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();

function isEmail(s) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(s || "").trim());
}

// POST /engine/auth/register
router.post("/register", async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      industry,
      location,
      services,
      keywords,
      naics,
      phone,
    } = req.body || {};

    const cleanName = String(name || "").trim();
    const cleanEmail = String(email || "").trim().toLowerCase();
    const cleanPassword = String(password || "");

    if (cleanName.length < 2) return res.status(400).json({ ok: false, error: "Name is required." });
    if (!isEmail(cleanEmail)) return res.status(400).json({ ok: false, error: "Valid email is required." });
    if (cleanPassword.length < 8) return res.status(400).json({ ok: false, error: "Password must be at least 8 characters." });

    const existing = await prisma.customer.findUnique({ where: { email: cleanEmail } });
    if (existing) return res.status(409).json({ ok: false, error: "An account with that email already exists." });

    // IMPORTANT: We store passwordHash on Customer
    const passwordHash = await bcrypt.hash(cleanPassword, 10);

    const customer = await prisma.customer.create({
      data: {
        name: cleanName,
        email: cleanEmail,
        passwordHash,
        phone: phone ? String(phone).trim() : null,
        industry: industry ? String(industry).trim() : null,
        location: location ? String(location).trim() : null,
        services: services ? String(services).trim() : null,
        keywords: keywords ? String(keywords).trim() : null,
        naics: naics ? String(naics).trim() : null,
        isActive: false,
      },
      select: { id: true, name: true, email: true, isActive: true },
    });

    return res.status(201).json({ ok: true, customer });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ ok: false, error: "Failed to register." });
  }
});

// POST /engine/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};
    const cleanEmail = String(email || "").trim().toLowerCase();
    const cleanPassword = String(password || "");

    if (!isEmail(cleanEmail)) return res.status(400).json({ ok: false, error: "Valid email is required." });
    if (!cleanPassword) return res.status(400).json({ ok: false, error: "Password is required." });

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
    console.error(e);
    return res.status(500).json({ ok: false, error: "Failed to login." });
  }
});

export default router;
