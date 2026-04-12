import express from "express";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();

const ALLOWED_CATEGORIES = [
  "janitorial",
  "landscaping",
  "plumbing-hvac",
  "electrical",
  "security",
  "waste-management",
  "roofing",
  "painting",
  "logistics-supply-chain",
  "office-admin",
  "temporary-help",
  "office-supplies",
  "warehousing",
  "nursing-home-health",
  "medical-equipment-rental",
  "environmental-remediation",
  "concrete-paving",
  "fire-alarm-access-control",
  "fencing-gates",
  "restoration-mitigation",
  "pest-control",
];

function asStr(value) {
  if (value === null || value === undefined) return "";
  return String(value).trim();
}

function getSingleQueryValue(value, fallback = "") {
  if (Array.isArray(value)) return value[0] ?? fallback;
  return value ?? fallback;
}

function buildBaseWhere() {
  return {
    isActive: true,
    source: "sam.gov",
    category: { in: ALLOWED_CATEGORIES },
  };
}

router.get("/live-contracts", async (req, res) => {
  try {
    const trade = getSingleQueryValue(req.query.trade, "All");
    const state = getSingleQueryValue(req.query.state, "All");
    const keyword = asStr(getSingleQueryValue(req.query.keyword, ""));
    const limitRaw = Number(getSingleQueryValue(req.query.limit, "60"));

    const limit = Number.isFinite(limitRaw)
      ? Math.min(Math.max(limitRaw, 1), 100)
      : 60;

    const where = buildBaseWhere();

    if (trade !== "All") {
      where.category = trade;
    }

    if (state !== "All") {
      where.state = state;
    }

    if (keyword) {
      where.OR = [
        { title: { contains: keyword, mode: "insensitive" } },
        { buyer: { contains: keyword, mode: "insensitive" } },
        { location: { contains: keyword, mode: "insensitive" } },
        { state: { contains: keyword, mode: "insensitive" } },
        { category: { contains: keyword, mode: "insensitive" } },
        { summaryShort: { contains: keyword, mode: "insensitive" } },
        { summaryLong: { contains: keyword, mode: "insensitive" } },
        { noticeType: { contains: keyword, mode: "insensitive" } },
        { naics: { contains: keyword, mode: "insensitive" } },
      ];
    }

    const opportunities = await prisma.liveOpportunity.findMany({
      where,
      orderBy: [
        { dueDate: "asc" },
        { postedDate: "desc" },
        { createdAt: "desc" },
      ],
      take: limit,
      select: {
        id: true,
        slug: true,
        title: true,
        buyer: true,
        location: true,
        state: true,
        category: true,
        dueDate: true,
        source: true,
        summaryShort: true,
        sourceUrl: true,
      },
    });

    return res.status(200).json({
      opportunities: opportunities.map((opp) => ({
        ...opp,
        dueDate: opp.dueDate ? opp.dueDate.toISOString() : null,
      })),
    });
  } catch (error) {
    console.error("[GET /engine/live-contracts] error:", error);
    return res.status(500).json({
      error: "Failed to load live contracts.",
    });
  }
});

router.get("/live-contracts/:slug", async (req, res) => {
  try {
    const slug = asStr(req.params.slug);

    if (!slug) {
      return res.status(400).json({ error: "Missing slug." });
    }

    const opportunity = await prisma.liveOpportunity.findFirst({
      where: {
        ...buildBaseWhere(),
        slug,
      },
      select: {
        id: true,
        slug: true,
        title: true,
        buyer: true,
        location: true,
        state: true,
        category: true,
        status: true,
        noticeType: true,
        naics: true,
        postedDate: true,
        dueDate: true,
        summaryShort: true,
        summaryLong: true,
        source: true,
        sourceUrl: true,
      },
    });

    if (!opportunity) {
      return res.status(404).json({ error: "Live contract not found." });
    }

    return res.status(200).json({
      ...opportunity,
      postedDate: opportunity.postedDate
        ? opportunity.postedDate.toISOString()
        : null,
      dueDate: opportunity.dueDate
        ? opportunity.dueDate.toISOString()
        : null,
    });
  } catch (error) {
    console.error("[GET /engine/live-contracts/:slug] error:", error);
    return res.status(500).json({
      error: "Failed to load live contract.",
    });
  }
});

export default router;