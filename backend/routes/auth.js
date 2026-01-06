// backend/routes/auth.js
import express from "express";
import prisma from "../lib/prismaClient.js";

const router = express.Router();

/**
 * POST /engine/auth/login
 * Body: { email: string }
 * Finds the customer by email and returns their customer id.
 * (MVP email-only login — no password / no OTP)
 */
router.post("/login", async (req, res) => {
  try {
    const cleanEmail = String(req.body?.email || "").trim().toLowerCase();

    if (!cleanEmail) {
      return res.status(400).json({ error: "email is required." });
    }

    const customer = await prisma.customer.findUnique({
      where: { email: cleanEmail },
    });

    if (!customer) {
      return res.status(404).json({ error: "No account found for that email." });
    }

    // Return minimal shape the frontend expects: { id }
    // (You can include extra fields if you want)
    return res.json({
      id: customer.id,
      subscriptionStatus: customer.subscriptionStatus,
      isActive: customer.isActive,
      name: customer.name,
    });
  } catch (err) {
    console.error("auth login error:", err);
    return res.status(500).json({ error: "Auth error." });
  }
});

export default router;
