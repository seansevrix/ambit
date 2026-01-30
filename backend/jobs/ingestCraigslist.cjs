/**
 * jobs/ingestCraigslist.cjs
 *
 * Craigslist buyer-intent ingestion (WANTED only):
 * - Pulls ONLY /search/wan
 * - Hard rejects anything not /wan/ (prevents /lbs/ etc)
 * - Normalizes URLs (absolute + strips query/hash)
 * - Dedupe across ALL queries per city (so you don’t upsert same post 10x)
 * - Optional freshness cutoff (default 7 days)
 * - Optional DB cleanup of non-/wan/ craigslist rows
 *
 * Run:
 *   node jobs/ingestCraigslist.cjs
 *
 * Env:
 *   CRAIGSLIST_CITIES="sandiego,losangeles,orangecounty"
 *   CRAIGSLIST_QUERY="junk removal|hauling|demo|landscaping"
 *   CRAIGSLIST_LIMIT_PER_CITY=50
 *   CRAIGSLIST_STRICT_WAN=1              (default 1)
 *   CRAIGSLIST_HAS_PIC=0                 (default 0)
 *   CRAIGSLIST_SRCH_TYPE=T               (default T; set "" to remove)
 *   CRAIGSLIST_CLEANUP_NON_WAN=0         (default 0; if 1 deletes ALL craigslist not containing /wan/)
 *   CRAIGSLIST_MAX_AGE_DAYS=7            (default 7; filters older posts if datetime present)
 *   CRAIGSLIST_SLEEP_MS=700              (default 700)
 */

const DEFAULT_CITIES = ["sandiego"];
const DEFAULT_QUERY = [
  "junk removal",
  "hauling",
  "trash",
  "yard cleanup",
  "landscaping",
  "lawn",
  "tree",
  "pressure washing",
  "handyman",
  "painting",
  "tile",
  "flooring",
  "concrete",
  "dump run",
];

const CITY_LIST = (process.env.CRAIGSLIST_CITIES || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

const QUERY_LIST = (process.env.CRAIGSLIST_QUERY || "")
  .split("|")
  .map((s) => s.trim())
  .filter(Boolean);

const CITIES = CITY_LIST.length ? CITY_LIST : DEFAULT_CITIES;
const QUERIES = QUERY_LIST.length ? QUERY_LIST : DEFAULT_QUERY;

const LIMIT_PER_CITY = Number(process.env.CRAIGSLIST_LIMIT_PER_CITY || 50);

const STRICT_WAN = String(process.env.CRAIGSLIST_STRICT_WAN || "1") === "1";
const HAS_PIC = String(process.env.CRAIGSLIST_HAS_PIC || "0") === "1";
const SRCH_TYPE = process.env.CRAIGSLIST_SRCH_TYPE ?? "T"; // T = title-only, "" to disable

const DO_CLEANUP_NON_WAN =
  String(process.env.CRAIGSLIST_CLEANUP_NON_WAN || "0") === "1";

const MAX_AGE_DAYS = Number(process.env.CRAIGSLIST_MAX_AGE_DAYS || 7);
const SLEEP_MS = Number(process.env.CRAIGSLIST_SLEEP_MS || 700);

// Prisma
let prisma = null;
try {
  const { PrismaClient } = require("@prisma/client");
  prisma = new PrismaClient();
} catch (_) {
  prisma = null;
}

/** ---------- Helpers ---------- */

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function norm(str) {
  return (str || "").toLowerCase().trim();
}

function cleanText(s, maxLen = 240) {
  const out = (s || "")
    .replace(/\s+/g, " ")
    .replace(/\u00a0/g, " ")
    .trim();
  return out.length > maxLen ? out.slice(0, maxLen - 1) + "…" : out;
}

function looksLikeSpam(title) {
  const t = norm(title);

  // provider/advertiser language (not buyer intent)
  const bad =
    t.includes("*****") ||
    t.includes("call now") ||
    t.includes("text me") ||
    t.includes("available now") ||
    t.includes("licensed") ||
    t.includes("insured") ||
    t.includes("we offer") ||
    t.includes("free estimate") ||
    t.includes("best prices") ||
    t.includes("same day") ||
    t.includes("serving") ||
    t.includes("discount");

  return bad;
}

function normalizeUrl(url, city) {
  if (!url) return "";
  let out = url.trim();

  if (out.startsWith("/")) out = `https://${city}.craigslist.org${out}`;

  try {
    const u = new URL(out);
    u.search = "";
    u.hash = "";
    out = u.toString();
  } catch (_) {}

  return out;
}

function isWantedUrl(url) {
  return typeof url === "string" && url.includes("/wan/");
}

function parseDateSafe(s) {
  if (!s) return null;
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d;
}

function isFreshEnough(postedAtIso, maxAgeDays) {
  if (!maxAgeDays || maxAgeDays <= 0) return true;
  const d = parseDateSafe(postedAtIso);
  if (!d) return true; // if we can't parse, don't drop it
  const ageMs = Date.now() - d.getTime();
  const maxMs = maxAgeDays * 24 * 60 * 60 * 1000;
  return ageMs <= maxMs;
}

function buildSearchUrl(city, query) {
  const base = `https://${city}.craigslist.org`;
  const path = "/search/wan"; // WANTED ONLY

  const params = new URLSearchParams();
  params.set("query", query);
  params.set("sort", "date");
  if (SRCH_TYPE) params.set("srchType", SRCH_TYPE);
  if (HAS_PIC) params.set("hasPic", "1");

  return `${base}${path}?${params.toString()}`;
}

async function fetchHtml(url) {
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome Safari",
      Accept: "text/html,application/xhtml+xml",
    },
  });
  if (!res.ok) throw new Error(`Fetch failed ${res.status} for ${url}`);
  return await res.text();
}

/**
 * Very simple HTML scraping without cheerio.
 * Finds result rows and extracts title + url + location + time.
 */
function parseSearchResults(html, city) {
  const results = [];

  const rowRegex =
    /<li[^>]+class="[^"]*(?:result-row|cl-static-search-result)[^"]*"[^>]*>[\s\S]*?<\/li>/g;

  const rows = html.match(rowRegex) || [];

  for (const row of rows) {
    const hrefMatch = row.match(/href="([^"]+)"/i);
    if (!hrefMatch) continue;

    const url = normalizeUrl(hrefMatch[1], city);
    if (!url) continue;

    const titleMatch =
      row.match(/class="[^"]*(?:result-title|title)[^"]*"[^>]*>([\s\S]*?)<\/a>/i) ||
      row.match(/<a[^>]+href="[^"]+"[^>]*>([\s\S]*?)<\/a>/i);

    const rawTitle = titleMatch ? titleMatch[1] : "";
    const title = cleanText(rawTitle.replace(/<[^>]+>/g, ""));

    const hoodMatch = row.match(
      /class="result-hood"[^>]*>\s*\(([^)]+)\)\s*<\/span>/i
    );
    const hood = hoodMatch ? cleanText(hoodMatch[1]) : "";

    const timeMatch = row.match(/datetime="([^"]+)"/i);
    const postedAt = timeMatch ? timeMatch[1] : null;

    results.push({
      title,
      url,
      location: hood ? `${city} • ${hood}` : city,
      postedAt,
      source: "craigslist",
      segment: "residential",
    });
  }

  return results;
}

/** ---------- Main ingest ---------- */

async function ingest() {
  if (DO_CLEANUP_NON_WAN && prisma) {
    const del = await prisma.opportunity.deleteMany({
      where: { source: "craigslist", NOT: { url: { contains: "/wan/" } } },
    });
    console.log(`[craigslist] cleanup deleted non-/wan/: ${del.count}`);
  }

  const all = [];

  for (const city of CITIES) {
    const seenCity = new Set(); // ✅ dedupe across ALL queries per city

    for (const q of QUERIES) {
      const url = buildSearchUrl(city, q);
      console.log(`[craigslist] fetch ${city} q="${q}" -> ${url}`);

      let html = "";
      try {
        html = await fetchHtml(url);
      } catch (e) {
        console.error(`[craigslist] fetch error: ${e.message}`);
        continue;
      }

      let rows = parseSearchResults(html, city);

      rows = rows.slice(0, LIMIT_PER_CITY);
      rows = rows.filter((r) => r.title && !looksLikeSpam(r.title));
      rows = rows.filter((r) => isFreshEnough(r.postedAt, MAX_AGE_DAYS));

      // hard buyer-intent gate
      if (STRICT_WAN) rows = rows.filter((r) => isWantedUrl(r.url));

      // ✅ city-level dedupe so we don't upsert duplicates from different queries
      rows = rows.filter((r) => {
        if (!r.url) return false;
        if (seenCity.has(r.url)) return false;
        seenCity.add(r.url);
        return true;
      });

      all.push(...rows);
      await sleep(SLEEP_MS);
    }
  }

  console.log(`[craigslist] candidate posts: ${all.length}`);

  if (!prisma) {
    console.log("[craigslist] Prisma not available, sample:");
    console.log(all.slice(0, 10));
    return;
  }

  let upserts = 0;
  let skippedNotWan = 0;

  for (const post of all) {
    if (STRICT_WAN && !isWantedUrl(post.url)) {
      skippedNotWan += 1;
      continue;
    }

    try {
      await prisma.opportunity.upsert({
        where: { url: post.url },
        update: {
          title: post.title,
          location: post.location,
          segment: post.segment,
          source: post.source,
          naics: "",
          agency: null,
          keywords: null,
          // postedAt: post.postedAt ? new Date(post.postedAt) : null,
        },
        create: {
          title: post.title,
          location: post.location,
          segment: post.segment,
          source: post.source,
          url: post.url,
          naics: "",
          agency: null,
          keywords: null,
          // postedAt: post.postedAt ? new Date(post.postedAt) : null,
        },
      });
      upserts += 1;
    } catch (e) {
      console.error(`[craigslist] upsert failed for ${post.url}: ${e.message}`);
    }
  }

  console.log(`[craigslist] upserts attempted: ${upserts}`);
  if (STRICT_WAN) console.log(`[craigslist] skipped not /wan/: ${skippedNotWan}`);
}

ingest()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (prisma) await prisma.$disconnect();
  });
