/* backend/jobs/ingestPublicPortals.js */

const crypto = require("crypto");
const cheerio = require("cheerio");
const { XMLParser } = require("fast-xml-parser");

const { PUBLIC_PORTALS } = require("./sources/publicPortals.cjs");

// If your prisma import is different, we'll fix it after the first run.
// Common alternatives are: "../db", "../lib/prisma", "../prismaClient", etc.
const prisma = require("../prisma");

function sha1(input) {
  return crypto.createHash("sha1").update(input).digest("hex");
}

function clean(str) {
  return (str || "").toString().replace(/\s+/g, " ").trim();
}

/**
 * Dedupe strategy (no schema changes):
 * - If externalId exists: dedupe on (source, externalId)
 * - Else: create a stable hash based on (source|title|url|dueDate)
 */
async function createIfNew(data) {
  const title = clean(data.title);
  const url = clean(data.url);
  if (!title || !url) return { created: false, reason: "missing" };

  const externalId =
    clean(data.externalId) ||
    sha1(`${data.source}|${title}|${url}|${data.dueDate || ""}`);

  // NOTE: This assumes your Opportunity model has source + externalId fields.
  const exists = await prisma.opportunity.findFirst({
    where: { source: data.source, externalId },
    select: { id: true },
  });

  if (exists) return { created: false, reason: "duplicate" };

  await prisma.opportunity.create({
    data: {
      title,
      url,
      source: data.source,
      externalId,
      segment: data.segment || "COMMERCIAL",
      location: data.location || null,
      description: data.description || null,
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      naics: null,
    },
  });

  return { created: true, reason: "created" };
}

/** ---------- RSS ingestion (LA County) ---------- */
async function ingestRss(source) {
  const res = await fetch(source.url, {
    headers: { "user-agent": "AMBIT-Ingest/1.0" },
  });
  if (!res.ok) throw new Error(`RSS fetch failed ${res.status}`);
  const xml = await res.text();

  const parser = new XMLParser();
  const data = parser.parse(xml);

  const items = data?.rss?.channel?.item || [];
  const list = Array.isArray(items) ? items : [items];

  let created = 0;
  for (const item of list) {
    const r = await createIfNew({
      source: source.key,
      segment: source.segment,
      title: item.title,
      url: item.link,
      description: item.description || null,
      location: "Los Angeles County, CA",
    });
    if (r.created) created++;
  }
  return { seen: list.length, created };
}

/** ---------- PlanetBids public page ingestion (HTML) ---------- */
async function ingestPlanetBids(source) {
  const res = await fetch(source.url, {
    headers: { "user-agent": "AMBIT-Ingest/1.0" },
  });
  if (!res.ok) throw new Error(`HTML fetch failed ${res.status}`);
  const html = await res.text();
  const $ = cheerio.load(html);

  // Use a conservative approach: look for links in table rows first
  const rows = $("tr").toArray();

  let seen = 0;
  let created = 0;

  for (const row of rows) {
    const a = $(row).find("a").first();
    const href = a.attr("href");
    const title = clean(a.text());

    if (!href || !title) continue;

    const url = new URL(href, source.url).toString();

    const r = await createIfNew({
      source: source.key,
      segment: source.segment,
      title,
      url,
    });

    seen++;
    if (r.created) created++;
  }

  // Fallback if the table-row method finds nothing
  if (seen === 0) {
    $("a").each(async (_, el) => {
      const title = clean($(el).text());
      const href = $(el).attr("href");
      if (!title || !href) return;

      const url = new URL(href, source.url).toString();

      const r = await createIfNew({
        source: source.key,
        segment: source.segment,
        title,
        url,
      });

      seen++;
      if (r.created) created++;
    });
  }

  return { seen, created };
}

/** ---------- Runner ---------- */
async function main() {
  console.log("Starting public portal ingestion…");

  for (const source of PUBLIC_PORTALS) {
    try {
      let stats = { seen: 0, created: 0 };

      if (source.kind === "rss") stats = await ingestRss(source);
      if (source.kind === "planetbids_html") stats = await ingestPlanetBids(source);

      console.log(`✓ ${source.name} | seen: ${stats.seen} | created: ${stats.created}`);
    } catch (err) {
      console.error(`✗ ${source.name} | ${err.message}`);
    }
  }

  console.log("Done.");
  if (prisma?.$disconnect) await prisma.$disconnect();
}

main().catch((e) => {
  console.error("Fatal:", e);
  process.exitCode = 1;
});
