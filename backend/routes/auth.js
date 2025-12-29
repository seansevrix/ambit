// backend/routes/auth.js
import express from "express";
import prisma from "../lib/prismaClient.js";

const router = express.Router();

/**
 * POST /engine/auth/login
 * Body: { customerId: number, email: string }
 * Verifies that the email matches the customer record.
 */
router.post("/login", async (req, res) => {
  try {
    const { customerId, email } = req.body || {};
    const id = Number(customerId);
    const cleanEmail = String(email || "").trim().toLowerCase();

    if (!id || !Number.isFinite(id)) {
      return res.status(400).json({ ok: false, error: "customerId is required." });
    }
    if (!cleanEmail) {
      return res.status(400).json({ ok: false, error: "email is required." });
    }

    const customer = await prisma.customer.findUnique({ where: { id } });
    if (!customer) {
      return res.status(404).json({ ok: false, error: "Customer not found." });
    }

    const storedEmail = String(customer.email || "").trim().toLowerCase();
    if (!storedEmail || storedEmail !== cleanEmail) {
      return res.status(401).json({
        ok: false,
        error: "Email does not match this Customer ID.",
      });
    }

    return res.json({
      ok: true,
      customerId: customer.id,
      subscriptionStatus: customer.subscriptionStatus,
      isActive: customer.isActive,
      name: customer.name,
    });
  } catch (err) {
    console.error("auth login error:", err);
    return res.status(500).json({ ok: false, error: "Auth error." });
  }
});

export default router;
