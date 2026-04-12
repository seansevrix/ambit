import express from "express";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();

function asStr(value) {
  if (value === null || value === undefined) return "";
  return String(value).trim();
}

function getSingleQueryValue(value, fallback = "") {
  if (Array.isArray(value)) return value[0] ?? fallback;
  return value ?? fallback;
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

    const where = {
      isActive: true,
      source: "sam.gov",
    };

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
      orderBy: [{ dueDate: "asc" }, { postedDate: "desc" }, { createdAt: "desc" }],
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

    res.status(200).json({
      opportunities: opportunities.map((opp) => ({
        ...opp,
        dueDate: opp.dueDate ? opp.dueDate.toISOString() : null,
      })),
    });
  } catch (error) {
    console.error("[GET /engine/live-contracts] error:", error);
    res.status(500).json({
      error: "Failed to load live contracts.",
    });
  }
});

export default router;