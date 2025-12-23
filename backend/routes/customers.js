import express from "express";
import prisma from "../lib/prisma.js";

const router = express.Router();

// GET /engine/customers
router.get("/customers", async (req, res) => {
  try {
    const customers = await prisma.customer.findMany({ orderBy: { id: "asc" } });
    return res.json(customers);
  } catch (err) {
    console.error("get customers error:", err);
    return res.status(500).json({ message: "Failed to load customers" });
  }
});

// GET /engine/customers/:customerId
router.get("/customers/:customerId", async (req, res) => {
  try {
    const customerId = Number(req.params.customerId);
    if (!customerId || Number.isNaN(customerId)) {
      return res.status(400).json({ message: "Invalid customerId" });
    }

    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        industry: true,
        services: true,
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

    if (!customer) return res.status(404).json({ message: "Customer not found" });
    return res.json(customer);
  } catch (err) {
    console.error("get customer error:", err);
    return res.status(500).json({ message: "Failed to load customer" });
  }
});

// POST /engine/customers
router.post("/customers", async (req, res) => {
  try {
    const { name, email, phone, industry, location, services, keywords, naics } = req.body || {};

    if (!name) return res.status(400).json({ message: "name is required" });
    if (!email) return res.status(400).json({ message: "email is required" });

    const created = await prisma.customer.create({
      data: {
        name: String(name),
        email: String(email),
        phone: typeof phone === "string" ? phone : null,
        industry: typeof industry === "string" ? industry : null,
        location: typeof location === "string" ? location : null,
        services: typeof services === "string" ? services : null,
        keywords: typeof keywords === "string" ? keywords : null,
        naics: typeof naics === "string" ? naics : null,
        // isActive stays false by default (paywall)
      },
    });

    return res.status(201).json(created);
  } catch (err) {
    console.error("create customer error:", err);
    return res.status(500).json({ message: "Failed to create customer" });
  }
});

// PATCH /engine/customers/:customerId
router.patch("/customers/:customerId", async (req, res) => {
  try {
    const customerId = Number(req.params.customerId);
    if (!customerId || Number.isNaN(customerId)) {
      return res.status(400).json({ message: "Invalid customerId" });
    }

    const { industry, services, location, keywords, naics, phone } = req.body || {};

    const updated = await prisma.customer.update({
      where: { id: customerId },
      data: {
        phone: typeof phone === "string" ? phone : undefined,
        industry: typeof industry === "string" ? industry : undefined,
        services: typeof services === "string" ? services : undefined,
        location: typeof location === "string" ? location : undefined,
        keywords: typeof keywords === "string" ? keywords : undefined,
        naics: typeof naics === "string" ? naics : undefined,
      },
    });

    return res.json(updated);
  } catch (err) {
    console.error("update customer error:", err);
    return res.status(500).json({ message: "Failed to update customer" });
  }
});

export default router;
