// backend/jobs/ingestOpenGov.js
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const API_BASE = "https://api.procurement.opengov.com/api/v1/government";
const PUBLIC_PORTAL_BASE = "https://procurement.opengov.com/portal";

// Required: comma-separated OpenGov portal slugs, e.g. "cityofvista,smusd"
const PORTALS_RAW = process.env.OPEN_GOV_PORTALS || "";

// Optional knobs
const LIMIT = Number(process.env.OPEN_GOV_LIMIT || 200);        // items per page
const MAX_PAGES = Number(process.env.OPEN_GOV_MAX_PAGES || 20); // safety cap
const STATUS = (process.env.OPEN_GOV_STATUS || "open").trim();  // open

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function parsePortals(raw) {
  return String(raw || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function stripHtml(html) {
  if (!html) return null;
  return String(html)
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function safeDate(v) {
  if (!v) return null;
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return null;
  return d;
}

function buildOppUrl(portal, id) {
  return `${PUBLIC_PORTAL_BASE}/${portal}/projects/${id}`;
}

function buildLocation(row) {
  const org = row?.government?.organization;
  const city = org?.city || "";
  const state = org?.state || "";
  const zip = org?.zipCode || "";
  const cs = [city, state].filter(Boolean).join(", ").trim();
  if (cs) return cs;
  if (zip) return zip;
  return "USA";
}

function buildAgency(row) {
  const dept = row?.department?.name;
  const orgName = row?.government?.organization?.name;
  return dept || orgName || null;
}

// ✅ NEW: create keywords for matching (OpenGov often lacks NAICS)
function buildKeywords(title, agency, location, summary) {
  return [title, agency, location, summary].filter(Boolean).join(", ");
}

class OpenGovHttpError extends Error {
  constructor({ portal, page, status, bodySnippet }) {
    super(`[ingestOpenGov] portal=${portal} HTTP ${status}: ${bodySnippet}`);
    this.name = "OpenGovHttpError";
    this.portal = portal;
    this.page = page;
    this.status = status;
  }
}

function isNotFound(err) {
  if (err && err.name === "OpenGovHttpError" && err.status === 404) return true;
  const msg = String(err?.message || err || "");
  return msg.includes("HTTP 404") || msg.includes('"Not found"') || msg.includes("Not found");
}

async function fetchPage({ portal, page, limit }) {
  const url = `${API_BASE}/${portal}/project/public`;

  const body = {
    filters: [{ type: "status", value: STATUS }],
    quickSearchQuery: null,
    limit,
    page,
  };

  const attempts = 5;

  for (let i = 1; i <= attempts; i++) {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          accept: "application/json, */*",
          origin: "https://procurement.opengov.com",
          referer: "https://procurement.opengov.com/",
        },
        body: JSON.stringify(body),
      });

      const text = await res.text().catch(() => "");

      if (res.ok) {
        try {
          return JSON.parse(text);
        } catch {
          throw new Error(`OpenGov JSON parse failed (portal=${portal} page=${page})`);
        }
      }

      const transient = res.status === 429 || res.status >= 500;
      if (transient && i < attempts) {
        const backoff = 1500 * i;
        console.warn(
          `[ingestOpenGov] portal=${portal} HTTP ${res.status} (try ${i}/${attempts}) retrying in ${backoff}ms`
        );
        await sleep(backoff);
        continue;
      }

      throw new OpenGovHttpError({
        portal,
        page,
        status: res.status,
        bodySnippet: text.slice(0, 200),
      });
    } catch (err) {
      if (i < attempts) {
        if (isNotFound(err)) throw err;

        const backoff = 1500 * i;
        console.warn(
          `[ingestOpenGov] portal=${portal} fetch error (try ${i}/${attempts}) retrying in ${backoff}ms: ${
            err?.message || err
          }`
        );
        await sleep(backoff);
        continue;
      }
      throw err;
    }
  }
}

async function upsertRow(portal, row) {
  const id = row?.id;
  if (!id) return { ok: false, reason: "missing_id" };

  const title = String(row?.title || "").trim();
  if (!title) return { ok: false, reason: "missing_title" };

  const externalId = `${portal}:${id}`;

  const postedDate =
    safeDate(row?.releaseProjectDate) ||
    safeDate(row?.created_at) ||
    null;

  const dueDate = safeDate(row?.proposalDeadline) || null;

  const agency = buildAgency(row);
  const location = buildLocation(row);
  const status = row?.status ? String(row.status).trim() : null;

  const summary = stripHtml(row?.summary || null);
  const url = buildOppUrl(portal, id);

  // OpenGov rarely provides NAICS; keep empty string (schema default "")
  const naics = "";

  // ✅ NEW: store keywords so OpenGov items can match customers without NAICS
  const keywords = buildKeywords(title, agency, location, summary);

  const data = {
    segment: "government",
    source: "opengov",
    externalId,
    url,
    title,
    location,
    naics,
    agency,
    postedDate,
    dueDate,
    summary,
    keywords,          // ✅ add keywords
    category: agency,
    valueText: null,
    status,
    raw: row,
  };

  await prisma.opportunity.upsert({
    where: {
      source_externalId: {
        source: "opengov",
        externalId,
      },
    },
    update: data,
    create: data,
  });

  return { ok: true };
}

async function ingestPortal(portal) {
  let scanned = 0;
  let upserted = 0;
  let skipped = 0;

  // Quick preflight: invalid portal throws 404 and will be skipped in main()
  await fetchPage({ portal, page: 1, limit: 1 });

  for (let page = 1; page <= MAX_PAGES; page++) {
    const data = await fetchPage({ portal, page, limit: LIMIT });

    const rows = Array.isArray(data?.rows) ? data.rows : [];

    if (page === 1) {
      const keys = Object.keys(data || {});
      console.log(`[ingestOpenGov][debug] portal=${portal} topKeys=${keys.join(", ")}`);
    }

    if (!rows.length) break;

    for (const row of rows) {
      scanned++;
      const r = await upsertRow(portal, row);
      if (r.ok) upserted++;
      else skipped++;
    }

    if (rows.length < LIMIT) break;
  }

  console.log(
    `[ingestOpenGov] portal=${portal} scanned=${scanned} upserted=${upserted} skipped=${skipped}`
  );
}

async function main() {
  const portals = parsePortals(PORTALS_RAW);

  if (!portals.length) {
    throw new Error(
      "Missing OPEN_GOV_PORTALS env var. Example: OPEN_GOV_PORTALS=cityofvista,smusd"
    );
  }

  console.log(
    `[ingestOpenGov] starting portals=${portals.length} limit=${LIMIT} maxPages=${MAX_PAGES} status=${STATUS}`
  );

  for (const portal of portals) {
    try {
      await ingestPortal(portal);
    } catch (err) {
      if (isNotFound(err)) {
        console.warn(`[ingestOpenGov] portal=${portal} not found on OpenGov (404) — skipping.`);
        continue;
      }
      throw err;
    }
  }

  console.log("[ingestOpenGov] done");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (err) => {
    console.error(err);
    await prisma.$disconnect();
    process.exit(1);
  });
