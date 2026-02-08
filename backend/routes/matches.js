import express from "express";
import prisma from "../lib/prisma.js";

const router = express.Router();

/** ---------------------------
 * ✅ SIMPLE TUNING KNOBS
 * -------------------------- */
const MIN_SCORE = 60; // government strictness
const MIN_SCORE_NON_GOV = Number(process.env.MATCHES_MIN_SCORE_NON_GOV || 35);
const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 200;

// ✅ IMPORTANT: cap how many opportunities we score
const MAX_OPPS = Number(process.env.MATCHES_MAX_OPPS || 3000);

// ✅ Location relevance tuning (simple, no geocoding)
const OUT_OF_AREA_PENALTY = 25;

// ✅ Strict nearby-only filter
const STRICT_NEARBY_ONLY = String(process.env.MATCHES_STRICT_NEARBY || "") === "1";

/** ---------------------------
 * ✅ CRAIGSLIST WANTED-ONLY FLAG (FIXED)
 * - Supports multiple env var names + typo
 * - Provides back-compat alias so old references won't crash
 * -------------------------- */
function envBool(value, defaultValue = false) {
  if (value === null || value === undefined || value === "") return defaultValue;
  const v = String(value).trim().toLowerCase();
  return v === "1" || v === "true" || v === "yes" || v === "on";
}

// Default ON (matches your current behavior)
const CRAIGSLIST_WANTED_ONLY = envBool(
  process.env.MATCHES_CRAIGSLIST_WANTED_ONLY ??
    process.env.CRAIGSLIST_WANTED_ONLY ??
    process.env.CRAILSLIST_WANTED_ONLY, // <- supports the typo too
  true
);

// Back-compat alias in case code references the misspelled constant name
const CRAILSLIST_WANTED_ONLY = CRAIGSLIST_WANTED_ONLY;

const STOP = new Set([
  "the",
  "and",
  "or",
  "a",
  "an",
  "of",
  "to",
  "for",
  "in",
  "on",
  "at",
  "with",
  "by",
  "llc",
  "inc",
  "co",
  "company",
  "services",
  "service",
  "solutions",
  "group",
  "object",
]);

/** ---------------------------
 * ✅ State helpers
 * -------------------------- */
const STATE_CODES = new Set([
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME",
  "MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA",
  "RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY","DC",
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

const CODE_TO_STATE_NAME = Object.entries(STATE_NAME_TO_CODE).reduce((acc, [name, code]) => {
  if (!acc[code]) acc[code] = name;
  return acc;
}, {});

// ✅ Neighboring-state map
const NEIGHBORS = {
  CA: ["OR", "NV", "AZ"],
  OR: ["WA", "ID", "NV", "CA"],
  WA: ["ID", "OR"],
  NV: ["OR", "ID", "UT", "AZ", "CA"],
  AZ: ["CA", "NV", "UT", "NM"],
  ID: ["WA", "OR", "NV", "UT", "WY", "MT"],
  UT: ["ID", "NV", "AZ", "CO", "WY", "NM"],
  NM: ["AZ", "UT", "CO", "OK", "TX"],
  CO: ["WY", "NE", "KS", "OK", "NM", "UT"],
  TX: ["NM", "OK", "AR", "LA"],
  FL: ["GA", "AL"],
  GA: ["FL", "AL", "TN", "NC", "SC"],
  NC: ["SC", "GA", "TN", "VA"],
  VA: ["NC", "WV", "MD", "DC", "KY", "TN"],
  MD: ["VA", "WV", "PA", "DE", "DC"],
  DC: ["MD", "VA"],
  PA: ["NY", "NJ", "DE", "MD", "WV", "OH"],
  NY: ["NJ", "PA", "CT", "MA", "VT"],
  NJ: ["NY", "PA", "DE"],
  OH: ["PA", "WV", "KY", "IN", "MI"],
  IN: ["MI", "OH", "KY", "IL"],
  IL: ["WI", "IN", "KY", "MO", "IA"],
};

function isNearbyState(customerState, oppState) {
  if (!customerState || !oppState) return null;
  if (customerState === oppState) return true;
  const neighbors = NEIGHBORS[customerState] || [];
  return neighbors.includes(oppState);
}

/** ---------------------------
 * ✅ Tokenization/helpers
 * -------------------------- */
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
 */
function extractStateCode(locationStr) {
  const raw = String(locationStr || "").trim();
  if (!raw) return null;

  const upper = raw.toUpperCase();

  const tokens = upper.split(/[^A-Z]+/g).filter(Boolean);
  for (const t of tokens) {
    if (t.length === 2 && STATE_CODES.has(t)) return t;
  }

  const lower = raw.toLowerCase();
  for (const name of Object.keys(STATE_NAME_TO_CODE)) {
    if (lower.includes(name)) return STATE_NAME_TO_CODE[name];
  }

  return null;
}

function abbreviateStateInLocation(locationStr) {
  const raw = String(locationStr || "").trim();
  if (!raw) return raw;

  const code = extractStateCode(raw);
  if (!code) return raw;

  let out = raw;
  for (const [name, c] of Object.entries(STATE_NAME_TO_CODE)) {
    const pattern = name.replace(/\s+/g, "\\s+");
    const re = new RegExp(pattern, "ig");
    out = out.replace(re, c);
  }
  return out;
}

function locationTokensWithState(locStr) {
  const base = tokenize(locStr);
  const code = extractStateCode(locStr);
  if (!code) return base;

  const extra = [code.toLowerCase()];
  const stateName = CODE_TO_STATE_NAME[code];
  if (stateName) extra.push(...tokenize(stateName));

  return Array.from(new Set([...base, ...extra]));
}

/**
 * ✅ Dedupe rules
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
 * ✅ NAICS matching
 */
function bestNaicsHit(customerNaicsList, oppNaicsList) {
  if (!customerNaicsList.length || !oppNaicsList.length) return null;

  for (const o of oppNaicsList) {
    for (const c of customerNaicsList) {
      if (c.length === o.length && c === o) return { type: "exact", customer: c, opp: o };
    }
  }

  for (const o of oppNaicsList) {
    for (const c of customerNaicsList) {
      if (c && o && o.startsWith(c)) return { type: "prefix", customer: c, opp: o };
    }
  }

  return null;
}

function scoreMatch(customer, opp) {
  const industryTokens = tokenize(customer.industry);
  const serviceTokens = tokenize(customer.services);

  const customerLocStr = customer.location || customer.serviceArea || "";
  const locationTokens = locationTokensWithState(customerLocStr);

  const customerNaicsList = normalizeNaicsList(customer.naics);
  const customerKeywordTokens = new Set(normalizeKeywordsList(customer.keywords));

  const baseTokens = new Set([...industryTokens, ...serviceTokens, ...customerKeywordTokens]);

  const hasAnything =
    baseTokens.size > 0 || locationTokens.length > 0 || customerNaicsList.length > 0;

  if (!hasAnything) {
    return {
      score: 0,
      reasons: ["Customer profile missing industry/services/location/keywords/naics."],
      profileIncomplete: true,
      nearby: null,
      custState: null,
      oppState: null,
    };
  }

  const oppTitleTokens = tokenize(opp.title);
  const oppLocTokens = locationTokensWithState(opp.location);

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

  const custState = extractStateCode(customerLocStr);
  const oppState = extractStateCode(opp.location);

  if (custState && oppState) {
    const nearby = isNearbyState(custState, oppState);
    if (nearby === false) {
      score -= OUT_OF_AREA_PENALTY;
      reasons.push(`Out of area (${oppState} vs ${custState}) -${OUT_OF_AREA_PENALTY}`);
    }
  }

  if (score < 0) score = 0;
  if (score > 100) score = 100;

  const nearbyFlag = !custState || !oppState ? null : isNearbyState(custState, oppState);

  return {
    score,
    reasons,
    profileIncomplete: false,
    nearby: nearbyFlag,
    custState,
    oppState,
  };
}

function groupMatchesBySegment(matches) {
  const buckets = { residential: [], commercial: [], government: [] };
  for (const m of matches || []) {
    const seg = String(m.segment || "").toLowerCase();
    if (seg === "residential") buckets.residential.push(m);
    else if (seg === "commercial") buckets.commercial.push(m);
    else buckets.government.push(m);
  }
  return buckets;
}

// ✅ threshold helper
function minScoreForMatch(m) {
  const seg = String(m?.segment || "").toLowerCase();
  return seg === "government" ? MIN_SCORE : MIN_SCORE_NON_GOV;
}

// ✅ ONLY filter "award notice" records
function isAwardNotice(m) {
  if (!m) return false;

  const seg = String(m.segment || "").toLowerCase();
  const src = String(m.source || "").toLowerCase();
  const isGovLike = seg === "government" || src === "sam.gov" || src === "government";

  if (!isGovLike) return false;

  const blob = [m.title, m.summary, m.keywords].filter(Boolean).join(" ").toLowerCase();
  return blob.includes("award notice");
}

// ✅ Craigslist buyer-intent filter (Wanted only)
function keepMatch(m) {
  if (!m) return false;

  // Use correct var, but alias exists so old references won't crash
  if (CRAIGSLIST_WANTED_ONLY && String(m.source || "").toLowerCase() === "craigslist") {
    const u = String(m.url || "").toLowerCase();
    // allow ONLY wanted posts
    if (!u.includes("/wan/")) return false;
  }

  // ✅ NEW: block award notices
  if (isAwardNotice(m)) return false;

  return true;
}

/** ---------------------------
 * ✅ Route: GET /engine/matches/:customerId?limit=50
 * -------------------------- */
router.get("/matches/:customerId", async (req, res) => {
  const debug = String(req.query.debug || "") === "1";
  const grouped = String(req.query.grouped || "") === "1";

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
          serviceArea: true,
          keywords: true,
          naics: true,
          isActive: true,
          subscriptionStatus: true,
          trialEndsAt: true,
          segments: true,
        },
      });
    } catch (e) {
      return fail("customer_findUnique", e);
    }

    if (!customer) return res.status(404).json({ message: "Customer not found" });

    // ✅ TRIAL-AWARE PAYWALL
    const now = Date.now();
    const trialActive = customer.trialEndsAt && new Date(customer.trialEndsAt).getTime() > now;
    const accessAllowed = Boolean(customer.isActive) || Boolean(trialActive);

    if (!accessAllowed) {
      return res.status(402).json({
        ok: false,
        message: "Subscription required",
        subscriptionStatus: customer.subscriptionStatus ?? "inactive",
        trialEndedAt: customer.trialEndsAt ?? null,
        trialEnded: Boolean(customer.trialEndsAt),
      });
    }

    // ✅ segments normalized (supports array or csv string)
    const segRaw = customer.segments;
    const allowedSegments = Array.isArray(segRaw)
      ? (segRaw.length ? segRaw : ["residential", "commercial", "government"])
      : (typeof segRaw === "string" && segRaw.trim()
          ? splitCsv(segRaw.toLowerCase())
          : ["residential", "commercial", "government"]);

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
      // fallback without segment filter (safe)
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

    const customerLocStr = customer.location || customer.serviceArea || "";
    const custState = extractStateCode(customerLocStr);

    let raw;
    try {
      raw = opportunities
        .map((opp) => {
          const safeLocation =
            typeof opp.location === "string"
              ? opp.location.includes("[object Object]")
                ? null
                : opp.location
              : opp.location
              ? JSON.stringify(opp.location)
              : null;

          const prettyLocation = safeLocation ? abbreviateStateInLocation(safeLocation) : null;

          const s = scoreMatch(customer, { ...opp, location: prettyLocation });

          if (STRICT_NEARBY_ONLY && custState) {
            const oppState = extractStateCode(prettyLocation);
            const nearby = isNearbyState(custState, oppState);
            if (oppState && nearby === false) return null;
          }

          return {
            id: opp.id,
            title: opp.title,
            location: prettyLocation,
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
            nearby: s.nearby ?? null,
            customerState: s.custState ?? null,
            oppState: s.oppState ?? null,
          };
        })
        .filter(Boolean)
        .filter((m) => m.score >= minScoreForMatch(m))
        .filter(keepMatch)
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

    const buckets = grouped ? groupMatchesBySegment(matches) : null;

    return res.json({
      customerId,
      segments: allowedSegments,
      access: {
        isActive: Boolean(customer.isActive),
        subscriptionStatus: customer.subscriptionStatus ?? null,
        trialEndsAt: customer.trialEndsAt ?? null,
        trialActive: Boolean(trialActive),
      },
      matches,
      ...(grouped
        ? {
            grouped: true,
            groups: [
              { title: "Residential lead", key: "residential", items: buckets.residential },
              { title: "Commercial lead", key: "commercial", items: buckets.commercial },
              { title: "Government lead", key: "government", items: buckets.government },
            ],
          }
        : {}),
    });
  } catch (err) {
    return fail("outer_try", err);
  }
});

export default router;
