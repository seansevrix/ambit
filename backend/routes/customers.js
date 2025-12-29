// backend/routes/customers.js
import express from "express";
import crypto from "crypto";
import prisma from "../lib/prismaClient.js";

const router = express.Router();

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

// POST /engine/customers
router.post("/customers", async (req, res) => {
  try {
    const body = req.body || {};

    const email = normalizeEmail(body.email);

    const providedName =
      optionalStr(body.name) || optionalStr(body.companyName);
    const emailPrefix = email.includes("@") ? email.split("@")[0] : email;

    // Required by schema on CREATE
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
        // passwordHash stays null until they register
      },
    });

    return res.status(200).json(customer);
  } catch (err) {
    console.error("POST /engine/customers error:", err);
    return res.status(500).json({
      message: "Server error creating customer",
      error: err?.message || String(err),
    });
  }
});

export default router;
