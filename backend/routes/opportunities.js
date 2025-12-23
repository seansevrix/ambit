import express from "express";
import prisma from "../lib/prisma.js";

const router = express.Router();

function parsePostedDate(value) {
  if (value == null || value === "") return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "__INVALID__";
  return d;
}

// GET /engine/opportunities
router.get("/opportunities", async (req, res) => {
  try {
    const opportunities = await prisma.opportunity.findMany({
      orderBy: { createdAt: "desc" },
    });
    return res.json(opportunities);
  } catch (err) {
    console.error("opportunities GET error:", err);
    return res.status(500).json({ message: "Failed to fetch opportunities" });
  }
});

// POST /engine/opportunities
router.post("/opportunities", async (req, res) => {
  try {
    const { title, location, naics, keywords, agency, url, postedDate, summary } = req.body || {};

    if (!title || !location || !naics) {
      return res.status(400).json({
        message: "title, location, and naics are required",
      });
    }

    const parsedPostedDate = parsePostedDate(postedDate);
    if (parsedPostedDate === "__INVALID__") {
      return res.status(400).json({
        message: "postedDate must be a valid date (ex: 2025-12-17 or 2025-12-17T00:00:00Z)",
      });
    }

    const created = await prisma.opportunity.create({
      data: {
        title: String(title),
        location: String(location),
        naics: String(naics),

        keywords: typeof keywords === "string" ? keywords : null,
        agency: typeof agency === "string" ? agency : null,
        url: typeof url === "string" ? url : null,
        postedDate: parsedPostedDate === null ? null : parsedPostedDate,
        summary: typeof summary === "string" ? summary : null,
      },
    });

    return res.status(201).json(created);
  } catch (err) {
    console.error("opportunities POST error:", err);
    return res.status(500).json({ message: "Failed to create opportunity" });
  }
});

export default router;
