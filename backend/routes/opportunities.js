import express from "express";
import prisma from "../lib/prisma.js";

const router = express.Router();

function parsePostedDate(value) {
  if (value == null || value === "") return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "__INVALID__";
  return d;
}

function parseIntParam(v, fallback) {
  const n = Number.parseInt(String(v ?? ""), 10);
  return Number.isFinite(n) ? n : fallback;
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

// Build a Prisma "where" from query params (optional filters)
function buildWhereFromQuery(q) {
  const where = {};

  const search = typeof q.q === "string" ? q.q.trim() : "";
  if (search) {
    // Title contains (case-insensitive)
    where.title = { contains: search, mode: "insensitive" };
  }

  const naics = typeof q.naics === "string" ? q.naics.trim() : "";
  if (naics) where.naics = naics;

  const location = typeof q.location === "string" ? q.location.trim() : "";
  if (location) {
    where.location = { contains: location, mode: "insensitive" };
  }

  const agency = typeof q.agency === "string" ? q.agency.trim() : "";
  if (agency) {
    where.agency = { contains: agency, mode: "insensitive" };
  }

  return where;
}

// GET /engine/opportunities?limit=25&offset=0&q=&naics=&location=&agency=
router.get("/opportunities", async (req, res) => {
  try {
    const limit = clamp(parseIntParam(req.query.limit, 50), 1, 200);
    const offset = clamp(parseIntParam(req.query.offset, 0), 0, 1_000_000);

    const where = buildWhereFromQuery(req.query);

    const opportunities = await prisma.opportunity.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
    });

    // Keep response as an ARRAY (so it won't break your current frontend)
    return res.json(opportunities);
  } catch (err) {
    console.error("opportunities GET error:", err);
    return res.status(500).json({ message: "Failed to fetch opportunities" });
  }
});

// GET /engine/opportunities/count?q=&naics=&location=&agency=
router.get("/opportunities/count", async (req, res) => {
  try {
    const where = buildWhereFromQuery(req.query);
    const count = await prisma.opportunity.count({ where });
    return res.json({ count });
  } catch (err) {
    console.error("opportunities COUNT error:", err);
    return res.status(500).json({ message: "Failed to count opportunities" });
  }
});

// GET /engine/opportunities/:id
router.get("/opportunities/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) {
      return res.status(400).json({ message: "Invalid id" });
    }

    const row = await prisma.opportunity.findUnique({ where: { id } });
    if (!row) return res.status(404).json({ message: "Not found" });

    return res.json(row);
  } catch (err) {
    console.error("opportunity GET by id error:", err);
    return res.status(500).json({ message: "Failed to fetch opportunity" });
  }
});

// POST /engine/opportunities
router.post("/opportunities", async (req, res) => {
  try {
    const {
      title,
      location,
      naics,
      keywords,
      agency,
      url,
      postedDate,
      summary,
    } = req.body || {};

    const t = typeof title === "string" ? title.trim() : "";
    const loc = typeof location === "string" ? location.trim() : "";
    const n = typeof naics === "string" ? naics.trim() : "";

    if (!t || !loc || !n) {
      return res.status(400).json({
        message: "title, location, and naics are required",
      });
    }

    const parsedPostedDate = parsePostedDate(postedDate);
    if (parsedPostedDate === "__INVALID__") {
      return res.status(400).json({
        message:
          "postedDate must be a valid date (ex: 2025-12-17 or 2025-12-17T00:00:00Z)",
      });
    }

    const created = await prisma.opportunity.create({
      data: {
        title: t,
        location: loc,
        naics: n,
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
