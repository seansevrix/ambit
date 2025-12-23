import express from "express";
import prisma from "../lib/prisma.js";

const router = express.Router();

// ✅ SIMPLE TUNING KNOBS
const MIN_SCORE = 60;     // raise/lower to change strictness
const MAX_RESULTS = 10;   // keep it simple, don’t spam

const STOP = new Set([
  "the","and","or","a","an","of","to","for","in","on","at","with","by",
  "llc","inc","co","company","services","service","solutions","group"
]);

function tokenize(s = "") {
  return String(s)
    .toLowerCase()
    .split(/[^a-z0-9]+/g)
    .filter(Boolean)
    .filter((t) => !STOP.has(t));
}

function splitCsv(s = "") {
  return String(s || "")
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);
}

function normalizeNaicsList(naicsStr) {
  // accepts "237310, 238220" -> ["237310","238220"]
  return splitCsv(naicsStr)
    .map((x) => x.replace(/[^0-9]/g, ""))
    .filter(Boolean);
}

function normalizeKeywordsList(keywordsStr) {
  // accepts "asphalt,paving,resurfacing" -> tokens
  return splitCsv(keywordsStr).flatMap(tokenize).filter(Boolean);
}

function normalize(s) {
  return String(s || "").trim().toLowerCase();
}

function normUrl(u) {
  return normalize(u).replace(/\/+$/, ""); // remove trailing slash
}

/**
 * ✅ Dedupe rules:
 * - If URL exists: use URL as primary key.
 * - If no URL: use title+location+naics fallback.
 * - If we already kept a fallback match and later see a URL version of the SAME fallback,
 *   replace the fallback with the URL match (so we keep the best record).
 */
function dedupeMatches(matches) {
  const seen = new Set();
  const out = [];

  for (const m of matches) {
    const url = normUrl(m.url);
    const title = normalize(m.title);
    const location = normalize(m.location);
    const naics = normalize(m.naics);

    const fallbackKey = `${title}|${location}|${naics}`;
    const fallbackSeenKey = `fallback:${fallbackKey}`;
    const key = url ? `url:${url}` : fallbackSeenKey;

    // If this match has URL and we already kept a fallback duplicate, replace it.
    if (url && seen.has(fallbackSeenKey)) {
      const idx = out.findIndex((x) => {
        const xfb = `${normalize(x.title)}|${normalize(x.location)}|${normalize(x.naics)}`;
        const xUrl = normUrl(x.url);
        return `fallback:${xfb}` === fallbackSeenKey && !xUrl;
      });

      if (idx >= 0) {
        out[idx] = m;
        seen.add(`url:${url}`);
        continue;
      }
    }

    if (seen.has(key)) continue;

    seen.add(key);
    out.push(m);
  }

  return out;
}

function scoreMatch(customer, opp) {
  // Customer signals
  const industryTokens = tokenize(customer.industry);
  const serviceTokens = tokenize(customer.services);
  const locationTokens = tokenize(customer.location);

  const customerNaics = new Set(normalizeNaicsList(customer.naics));
  const customerKeywordTokens = new Set(normalizeKeywordsList(customer.keywords));

  // Base “what they do” tokens
  const baseTokens = new Set([
    ...industryTokens,
    ...serviceTokens,
    ...customerKeywordTokens,
  ]);

  const hasAnything =
    baseTokens.size > 0 ||
    locationTokens.length > 0 ||
    customerNaics.size > 0;

  if (!hasAnything) {
    return {
      score: 0,
      reasons: ["Customer profile missing industry/services/location/keywords/naics."],
      profileIncomplete: true,
    };
  }

  // Opportunity signals
  const oppTitleTokens = tokenize(opp.title);
  const oppLocTokens = tokenize(opp.location);
  const oppNaics = String(opp.naics || "").replace(/[^0-9]/g, "");
  const oppKeywordTokens = tokenize(opp.keywords);
  const oppSummaryTokens = tokenize(opp.summary);

  let score = 0;
  const reasons = [];

  // 1) NAICS exact match (big)
  if (oppNaics && customerNaics.size > 0 && customerNaics.has(oppNaics)) {
    score += 60;
    reasons.push(`NAICS exact match (${oppNaics}) +60`);
  }

  // 2) Location overlap (high)
  const locSet = new Set(locationTokens);
  let locHits = 0;
  for (const t of oppLocTokens) if (locSet.has(t)) locHits += 1;

  if (locHits > 0) {
    const add = Math.min(35, locHits * 12);
    score += add;
    reasons.push(`Location overlap: ${locHits} hit(s) +${add}`);
  }

  // 3) Keyword overlap (small)
  let kwHits = 0;
  for (const t of oppKeywordTokens) if (baseTokens.has(t)) kwHits += 1;

  if (kwHits > 0) {
    const add = Math.min(20, kwHits * 5);
    score += add;
    reasons.push(`Keyword overlap: ${kwHits} hit(s) +${add}`);
  }

  // 4) Title overlap (medium)
  let titleHits = 0;
  for (const t of oppTitleTokens) if (baseTokens.has(t)) titleHits += 1;

  if (titleHits > 0) {
    const add = Math.min(25, titleHits * 5);
    score += add;
    reasons.push(`Title overlap: ${titleHits} hit(s) +${add}`);
  }

  // 5) Summary overlap (tiny boost, still simple)
  let summaryHits = 0;
  for (const t of oppSummaryTokens) if (baseTokens.has(t)) summaryHits += 1;

  if (summaryHits > 0) {
    const add = Math.min(10, summaryHits * 2);
    score += add;
    reasons.push(`Summary overlap: ${summaryHits} hit(s) +${add}`);
  }

  // cap to keep it readable
  if (score > 100) score = 100;

  return { score, reasons, profileIncomplete: false };
}

// GET /engine/matches/:customerId
router.get("/matches/:customerId", async (req, res) => {
  try {
    const customerId = Number(req.params.customerId);
    if (!customerId || Number.isNaN(customerId)) {
      return res.status(400).json({ message: "Invalid customerId" });
    }

    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
      select: {
        id: true,
        industry: true,
        services: true,
        location: true,
        keywords: true,
        naics: true,
        isActive: true,
        subscriptionStatus: true,
      },
    });

    if (!customer) return res.status(404).json({ message: "Customer not found" });

    if (!customer.isActive) {
      return res.status(402).json({
        message: "Subscription required",
        subscriptionStatus: customer.subscriptionStatus ?? "inactive",
      });
    }

    const opportunities = await prisma.opportunity.findMany();

    const raw = opportunities
      .map((opp) => {
        const s = scoreMatch(customer, opp);
        return {
          id: opp.id,
          title: opp.title,
          location: opp.location,
          naics: opp.naics,

          // option A: extra useful fields
          keywords: opp.keywords ?? null,
          agency: opp.agency ?? null,
          url: opp.url ?? null,
          postedDate: opp.postedDate ?? null,
          summary: opp.summary ?? null,

          score: s.score,
          reasons: s.reasons,
          profileIncomplete: s.profileIncomplete,
        };
      })
      .filter((m) => m.score >= MIN_SCORE)
      .sort((a, b) => b.score - a.score);

    const matches = dedupeMatches(raw).slice(0, MAX_RESULTS);

    return res.json({ customerId, matches });
  } catch (err) {
    console.error("matches error:", err);
    return res.status(500).json({ message: "Failed to compute matches" });
  }
});

export default router;
