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

const CATEGORY_PRIORITY = {
  janitorial: 1,
  landscaping: 2,
  "plumbing-hvac": 3,
  electrical: 4,
  "fire-alarm-access-control": 5,
  security: 6,
  "waste-management": 7,
  roofing: 8,
  painting: 9,
  "pest-control": 10,
  "fencing-gates": 11,
  "restoration-mitigation": 12,
  "concrete-paving": 13,
  "temporary-help": 14,
  "environmental-remediation": 15,
  "nursing-home-health": 16,
  "medical-equipment-rental": 17,
  "logistics-supply-chain": 18,
  "office-admin": 19,
  warehousing: 20,
  "office-supplies": 21,
};

const NOTICE_TYPE_PRIORITY = {
  presolicitation: 1,
  solicitation: 2,
  "combined synopsis/solicitation": 3,
  "sources sought": 4,
};

function asStr(value) {
  if (value === null || value === undefined) return "";
  return String(value).trim();
}

function lower(value) {
  return asStr(value).toLowerCase();
}

function getSingleQueryValue(value, fallback = "") {
  if (Array.isArray(value)) return value[0] ?? fallback;
  return value ?? fallback;
}

function buildBaseWhere() {
  return {
    isActive: true,
    source: "sam.gov",
    segment: "government",
    category: { in: ALLOWED_CATEGORIES },
  };
}

function getCategoryPriority(category) {
  return CATEGORY_PRIORITY[category] ?? 999;
}

function getNoticeTypePriority(noticeType) {
  const text = lower(noticeType);
  return NOTICE_TYPE_PRIORITY[text] ?? 999;
}

function toTimestamp(value, fallback) {
  if (!value) return fallback;
  const date = new Date(value);
  const time = date.getTime();
  return Number.isNaN(time) ? fallback : time;
}

function compareLiveOpportunities(a, b) {
  const aCategoryPriority = getCategoryPriority(a.category);
  const bCategoryPriority = getCategoryPriority(b.category);
  if (aCategoryPriority !== bCategoryPriority) {
    return aCategoryPriority - bCategoryPriority;
  }

  const aNoticeTypePriority = getNoticeTypePriority(a.noticeType);
  const bNoticeTypePriority = getNoticeTypePriority(b.noticeType);
  if (aNoticeTypePriority !== bNoticeTypePriority) {
    return aNoticeTypePriority - bNoticeTypePriority;
  }

  const farFuture = new Date("2100-01-01").getTime();
  const aDue = toTimestamp(a.dueDate, farFuture);
  const bDue = toTimestamp(b.dueDate, farFuture);
  if (aDue !== bDue) {
    return aDue - bDue;
  }

  const zero = 0;
  const aPosted = toTimestamp(a.postedDate, zero);
  const bPosted = toTimestamp(b.postedDate, zero);
  if (aPosted !== bPosted) {
    return bPosted - aPosted;
  }

  const aCreated = toTimestamp(a.createdAt, zero);
  const bCreated = toTimestamp(b.createdAt, zero);
  return bCreated - aCreated;
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

    const fetchSize = Math.min(Math.max(limit * 4, 80), 240);

    const opportunities = await prisma.liveOpportunity.findMany({
      where,
      orderBy: [{ postedDate: "desc" }, { createdAt: "desc" }],
      take: fetchSize,
      select: {
        id: true,
        slug: true,
        title: true,
        buyer: true,
        location: true,
        state: true,
        category: true,
        noticeType: true,
        dueDate: true,
        postedDate: true,
        createdAt: true,
        source: true,
        summaryShort: true,
        summaryLong: true,
        sourceUrl: true,
      },
    });

    const rankedOpportunities = [...opportunities]
      .sort(compareLiveOpportunities)
      .slice(0, limit);

    return res.status(200).json({
      opportunities: rankedOpportunities.map((opp) => ({
        id: opp.id,
        slug: opp.slug,
        title: opp.title,
        buyer: opp.buyer,
        location: opp.location,
        state: opp.state,
        category: opp.category,
        noticeType: opp.noticeType,
        dueDate: opp.dueDate ? opp.dueDate.toISOString() : null,
        postedDate: opp.postedDate ? opp.postedDate.toISOString() : null,
        source: opp.source,
        summaryShort: opp.summaryShort,
        opportunitySummary: opp.summaryLong || opp.summaryShort,
        sourceUrl: opp.sourceUrl,
      })),
    });
  } catch (error) {
    console.error("[GET /engine/live-contracts] error:", error);
    return res.status(500).json({ error: "Failed to load live contracts." });
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
      dueDate: opportunity.dueDate ? opportunity.dueDate.toISOString() : null,
      opportunitySummary: opportunity.summaryLong || opportunity.summaryShort,
    });
  } catch (error) {
    console.error("[GET /engine/live-contracts/:slug] error:", error);
    return res.status(500).json({ error: "Failed to load live contract." });
  }
});

export default router;