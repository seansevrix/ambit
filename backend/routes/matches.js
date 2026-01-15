import express from "express";
import prisma from "../lib/prisma.js";

const router = express.Router();

// ✅ SIMPLE TUNING KNOBS
const MIN_SCORE = 60;        // raise/lower to change strictness
const DEFAULT_LIMIT = 50;    // return more so "Load more" is meaningful
const MAX_LIMIT = 200;       // safety cap

// ✅ IMPORTANT: cap how many opportunities we score (prevents huge scans / raw JSON blowups)
const MAX_OPPS = Number(process.env.MATCHES_MAX_OPPS || 3000);

// ✅ Location relevance tuning (simple, no geocoding)
const OUT_OF_AREA_PENALTY = 25; // subtract if state mismatch
const STRICT_IN_AREA_ONLY = String(process.env.MATCHES_STRICT_IN_AREA || "") === "1";

const STOP = new Set([
  "the","and","or","a","an","of","to","for","in","on","at","with","by",
  "llc","inc","co","company","services","service","solutions","group",
  // ✅ prevents garbage tokenization when location got stringified badly
  "object"
]);

// Minimal US state code helpers
const STATE_CODES = new Set([
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD",
  "MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC",
  "SD","TN","TX","UT","VT","VA","WA","WV","WI","WY","DC"
]);

const STATE_NAME_TO_CODE = {
  alabama: "AL",
  alaska: "AK",
  arizona: "AZ",
  arkansas: "AR",
  california: "CA",
  colorado: "CO",
  connecticut: "CT",
  delaware: "DE",
  florida: "FL",
  georgia: "GA",
  hawaii: "HI",
  idaho: "ID",
  illinois: "IL",
  indiana: "IN",
  iowa: "IA",
  kansas: "KS",
  kentucky: "KY",
  louisiana: "LA",
  maine: "ME",
  maryland: "MD",
  massachusetts: "MA",
  michigan: "MI",
  minnesota: "MN",
  mississippi: "MS",
  missouri: "MO",
  montana: "MT",
  nebraska: "NE",
  nevada: "NV",
  "new hampshire": "NH",
  "new jersey": "NJ",
  "new mexico": "NM",
  "new york": "NY",
  "north carolina": "NC",
  "north dakota": "ND",
  ohio: "OH",
  oklahoma: "OK",
  oregon: "OR",
  pennsylvania: "PA",
  "rhode island": "RI",
  "south carolina": "SC",
  "south dakota": "SD",
  tennessee: "TN",
  texas: "TX",
  utah: "UT",
  vermont: "VT",
  virginia: "VA",
  washington: "WA",
  "west virginia": "WV",
  wisconsin: "WI",
  wyoming: "WY",
  "district of columbia": "DC",
};

function tokenize(s = "") {
  if (s == null) return [];
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
  const raw = splitCsv(naicsStr)
    .map((x) => String(x).replace(/[^0-9]/g, ""))
    .filter(Boolean)
    .map((x) => x.slice(0, 6))
    .filter((x) => x.length >= 2);

  const seen = new Set();
  const out = [];
  for (const n of raw) {
    if (!seen.has(n)) {
      seen.add(n);
      out.push(n);
    }
  }
  return out;
}

function normalizeKeywordsList(keywordsStr) {
  return splitCsv(keywordsStr).flatMap(tokenize).filter(Boolean);
}

function normalize(s) {
  return String(s || "").trim().toLowerCase();
}

function normUrl(u) {
  return normalize(u).replace(/\/+$/, "");
}

/**
 * Extract a US state code from a free-form location string.
 * Supports "CA", "CA 920xx", "City, CA", and full state names like "California".
 */
function extractStateCode(locationStr) {
  const raw = String(locationStr || "").trim();
  if (!raw) return null;

  // Try: ", CA" or " CA " etc
  const upper = raw.toUpperCase();

  // token-based scan for 2-letter codes
  const tokens = upper.split(/[^A-Z]+/g).filter(Boolean);
  for (const t of tokens) {
    if (t.length === 2 && STATE_CODES.has(t)) return t;
  }

  // full state name
  const lower = raw.toLowerCase();
  // look for multiword names first by scanning keys
  for (const name of Object.keys(STATE_NAME_TO_CODE)) {
    if (lower.includes(name)) return STATE_NAME_TO_CODE[name];
  }

  return null;
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

/**
 * ✅ NAICS matching:
 * - Exact match wins
 * - Prefix match allowed (customer "2373" matches opp "237310")
 */
function bestNaicsHit(customerNaicsList, oppNaicsList) {
  if (!customerNaicsList.length || !oppNaicsList.length) return null;

  for (const o of oppNaicsList) {
    for (const c of customerNaicsList) {
      if (c.length === o.length && c === o) {
        return { type: "exact", customer: c, opp: o };
      }
    }
  }

  for (const o of oppNaicsList) {
    for (const c of customerNaicsList) {
      if (c && o && o.startsWith(c)) {
        return { type: "prefix", customer: c, opp: o };
      }
    }
  }

  return null;
}

function scoreMatch(customer, opp) {
  const industryTokens = tokenize(customer.industry);
  const serviceTokens = tokenize(customer.services);

  // Use location OR serviceArea for location relevance
  const customerLocStr = customer.location || customer.serviceArea || "";
  const locationTokens = tokenize(customerLocStr);

  const customerNaicsList = normalizeNaicsList(customer.naics);
  const customerKeywordTokens = new Set(normalizeKeywordsList(customer.keywords));

  const baseTokens = new Set([
    ...industryTokens,
    ...serviceTokens,
    ...customerKeywordTokens,
  ]);

  const hasAnything =
    baseTokens.size > 0 ||
    locationTokens.length > 0 ||
    customerNaicsList.length > 0;

  if (!hasAnything) {
    return {
      score: 0,
      reasons: ["Customer profile missing industry/services/location/keywords/naics."],
      profileIncomplete: true,
    };
  }

  const oppTitleTokens = tokenize(opp.title);
  const oppLocTokens = tokenize(opp.location);
  const oppNaicsList = normalizeNaicsList(opp.naics);
  const oppKeywordTokens = tokenize(opp.keywords);
  const oppSummaryTokens = tokenize(opp.summary);

  let score = 0;
  const reasons = [];

  const nh = bestNaicsHit(customerNaicsList, oppNaicsList);

  if (nh?.type === "exact") {
    score += 65;
    reasons.push(`NAICS exact match (${nh.opp}) +65`);
  } else if (nh?.type === "prefix") {
    score += 60;
    reasons.push(`NAICS match (${nh.customer} → ${nh.opp}) +60`);
  }

  const locSet = new Set(locationTokens);
  let locHits = 0;
  for (const t of oppLocTokens) if (locSet.has(t)) locHits += 1;

  if (locHits > 0) {
    const add = Math.min(35, locHits * 12);
    score += add;
    reasons.push(`Location overlap: ${locHits} hit(s) +${add}`);
  }

  let kwHits = 0;
  for (const t of oppKeywordTokens) if (baseTokens.has(t)) kwHits += 1;

  if (kwHits > 0) {
    const add = Math.min(20, kwHits * 5);
    score += add;
    reasons.push(`Keyword overlap: ${kwHits} hit(s) +${add}`);
  }

  let titleHits = 0;
  for (const t of oppTitleTokens) if (baseTokens.has(t)) titleHits += 1;

  if (titleHits > 0) {
    const add = Math.min(25, titleHits * 5);
    score += add;
    reasons.push(`Title overlap: ${titleHits} hit(s) +${add}`);
  }

  let summaryHits = 0;
  for (const t of oppSummaryTokens) if (baseTokens.has(t)) summaryHits += 1;

  if (summaryHits > 0) {
    const add = Math.min(10, summaryHits * 2);
    score += add;
    reasons.push(`Summary overlap: ${summaryHits} hit(s) +${add}`);
  }

  // ✅ State-based relevance penalty (no geocoding)
  const custState = extractStateCode(customerLocStr);
  const oppState = extractStateCode(opp.location);

  if (custState && oppState && custState !== oppState) {
    score -= OUT_OF_AREA_PENALTY;
    reasons.push(`Out of area (${oppState} vs ${custState}) -${OUT_OF_AREA_PENALTY}`);
  }

  if (score < 0) score = 0;
  if (score > 100) score = 100;

  const inArea = !custState || !oppState ? null : custState === oppState;

  return { score, reasons, profileIncomplete: false, inArea, custState, oppState };
}

// ✅ keep path EXACTLY: GET /engine/matches/:customerId?limit=50
router.get("/matches/:customerId", async (req, res) => {
  const debug = String(req.query.debug || "") === "1";

  const fail = (stage, err) => {
    console.error(`matches error @${stage}:`, err?.stack || err);
    return res.status(500).json({
      message: "Failed to compute matches",
      ...(debug ? { stage, error: String(err?.message || err) } : {}),
    });
  };

  try {
    const customerId = Number(req.params.customerId);
    if (!customerId || Number.isNaN(customerId)) {
      return res.status(400).json({ message: "Invalid customerId" });
    }

    const limitRaw = Number(req.query.limit);
    const limit = Number.isFinite(limitRaw)
      ? Math.max(1, Math.min(MAX_LIMIT, limitRaw))
      : DEFAULT_LIMIT;

    let customer;
    try {
      customer = await prisma.customer.findUnique({
        where: { id: customerId },
        select: {
          id: true,
          industry: true,
          services: true,
          location: true,
          serviceArea: true, // ✅ include for local relevance
          keywords: true,
          naics: true,
          isActive: true,
          subscriptionStatus: true,
          trialEndsAt: true,
        },
      });
    } catch (e) {
      return fail("customer_findUnique", e);
    }

    if (!customer) return res.status(404).json({ message: "Customer not found" });

    // ✅ TRIAL-AWARE PAYWALL
    const trialActive =
      customer.trialEndsAt && new Date(customer.trialEndsAt).getTime() > Date.now();

    if (!customer.isActive && !trialActive) {
      return res.status(402).json({
        message: "Subscription required",
        subscriptionStatus: customer.subscriptionStatus ?? "inactive",
        trialEndedAt: customer.trialEndsAt ?? null,
      });
    }

    // ✅ Try segments safely
    let segments = null;
    try {
      const segRow = await prisma.customer.findUnique({
        where: { id: customerId },
        select: { segments: true },
      });
      segments = segRow?.segments ?? null;
    } catch (e) {
      segments = null;
    }

    const allowedSegments =
      Array.isArray(segments) && segments.length > 0
        ? segments
        : ["residential", "commercial", "government"];

    // ✅ Only fetch fields we use
    let opportunities = [];
    try {
      opportunities = await prisma.opportunity.findMany({
        where: { segment: { in: allowedSegments } },
        orderBy: { postedDate: "desc" },
        take: Math.max(1, Math.min(20000, MAX_OPPS)),
        select: {
          id: true,
          title: true,
          location: true,
          naics: true,
          segment: true,
          source: true,
          keywords: true,
          agency: true,
          url: true,
          postedDate: true,
          dueDate: true,
          summary: true,
        },
      });
    } catch (e) {
      try {
        opportunities = await prisma.opportunity.findMany({
          orderBy: { postedDate: "desc" },
          take: Math.max(1, Math.min(20000, MAX_OPPS)),
          select: {
            id: true,
            title: true,
            location: true,
            naics: true,
            segment: true,
            source: true,
            keywords: true,
            agency: true,
            url: true,
            postedDate: true,
            dueDate: true,
            summary: true,
          },
        });
      } catch (e2) {
        return fail("opportunity_findMany", e2);
      }
    }

    // Determine customer's state (for strict filtering option)
    const customerLocStr = customer.location || customer.serviceArea || "";
    const custState = extractStateCode(customerLocStr);

    let raw;
    try {
      raw = opportunities
        .map((opp) => {
          const s = scoreMatch(customer, opp);

          // ✅ location cleanup
          const safeLocation =
            typeof opp.location === "string"
              ? (opp.location.includes("[object Object]") ? null : opp.location)
              : opp.location
              ? JSON.stringify(opp.location)
              : null;

          // Optional strict filter: only keep in-area when we can detect both states
          if (STRICT_IN_AREA_ONLY && custState) {
            const oppState = extractStateCode(safeLocation);
            if (oppState && oppState !== custState) {
              return null;
            }
          }

          return {
            id: opp.id,
            title: opp.title,
            location: safeLocation,
            naics: opp.naics,

            segment: opp.segment,
            source: opp.source ?? null,

            keywords: opp.keywords ?? null,
            agency: opp.agency ?? null,
            url: opp.url ?? null,
            postedDate: opp.postedDate ?? null,
            dueDate: opp.dueDate ?? null,
            summary: opp.summary ?? null,

            score: s.score,
            reasons: s.reasons,
            profileIncomplete: s.profileIncomplete,

            // Optional debug/meta
            inArea: s.inArea ?? null,
            customerState: s.custState ?? null,
            oppState: s.oppState ?? null,
          };
        })
        .filter(Boolean)
        .filter((m) => m.score >= MIN_SCORE)
        .sort((a, b) => b.score - a.score);
    } catch (e) {
      return fail("scoring_map_filter_sort", e);
    }

    let matches;
    try {
      matches = dedupeMatches(raw).slice(0, limit);
    } catch (e) {
      return fail("dedupe_slice", e);
    }

    return res.json({
      customerId,
      segments: allowedSegments,
      access: {
        isActive: Boolean(customer.isActive),
        trialEndsAt: customer.trialEndsAt ?? null,
      },
      matches,
    });
  } catch (err) {
    return fail("outer_try", err);
  }
});

export default router;
