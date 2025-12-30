// backend/jobs/ingestSamGov.js
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const SAM_KEY = process.env.SAM_GOV_API_KEY;
const BASE = "https://api.sam.gov/opportunities/v2/search"; // SAM.gov opportunities v2 search

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function mmddyyyy(d) {
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  const yyyy = d.getUTCFullYear();
  return `${mm}/${dd}/${yyyy}`;
}

function buildLocation(o) {
  // 1) Place of Performance (preferred)
  const pop = o?.placeOfPerformance || o?.data?.placeOfPerformance;
  const popCity = pop?.city?.name || pop?.city || "";
  const popState = pop?.state?.code || pop?.state || "";
  const popZip = pop?.zip || "";

  const popLoc = [popCity, popState].filter(Boolean).join(", ");
  if (popLoc) return popLoc;
  if (popZip) return popZip;

  // 2) Office address fallback (often present)
  const off = o?.officeAddress || o?.data?.officeAddress;
  const offCity = off?.city || "";
  const offState = off?.state || off?.stateCode || "";
  const offZip = off?.zipcode || off?.zip || "";

  const offLoc = [offCity, offState].filter(Boolean).join(", ");
  if (offLoc) return offLoc;
  if (offZip) return offZip;

  return null;
}

function normalizeNaics(val) {
  const s = String(val || "").trim();
  const digits = s.replace(/\D/g, "");
  if (digits.length < 6) return null;
  return digits.slice(0, 6);
}

function pickNaics(o) {
  const candidate =
    o?.naicsCode ||
    o?.naics ||
    o?.ncode ||
    (Array.isArray(o?.naicsCodes) ? o.naicsCodes[0] : null) ||
    o?.data?.naics?.[0]?.naicsCode ||
    o?.data?.naicsCode ||
    null;

  return normalizeNaics(candidate);
}

function pickUiLink(o) {
  return o?.uiLink || o?.data?.uiLink || null;
}

function pickAgency(o) {
  return (
    o?.fullParentPathName ||
    o?.department ||
    o?.subTier ||
    o?.office ||
    null
  );
}

async function fetchPage({ postedFrom, postedTo, limit, offset }) {
  const url = new URL(BASE);
  url.searchParams.set("api_key", SAM_KEY);
  url.searchParams.set("postedFrom", postedFrom);
  url.searchParams.set("postedTo", postedTo);
  url.searchParams.set("limit", String(limit));
  url.searchParams.set("offset", String(offset));
  // Optional filters (uncomment if you want to reduce load)
  // url.searchParams.set("active", "true");

  const attempts = 5;

  for (let i = 1; i <= attempts; i++) {
    try {
      const res = await fetch(url.toString());

      if (res.ok) return res.json();

      const text = await res.text().catch(() => "");
      const transient = res.status === 429 || res.status >= 500; // rate limit or server errors

      if (transient && i < attempts) {
        const backoffMs = 2000 * i; // 2s, 4s, 6s, 8s...
        console.warn(
          `[ingestSamGov] SAM.gov ${res.status} (try ${i}/${attempts}) — retrying in ${backoffMs}ms`
        );
        await sleep(backoffMs);
        continue;
      }

      throw new Error(`SAM.gov API failed ${res.status}: ${text.slice(0, 220)}`);
    } catch (err) {
      // Network / gateway timeouts sometimes throw, sometimes come back as 504 HTML
      if (i < attempts) {
        const backoffMs = 2000 * i;
        console.warn(
          `[ingestSamGov] fetch error (try ${i}/${attempts}) — retrying in ${backoffMs}ms: ${
            err?.message || err
          }`
        );
        await sleep(backoffMs);
        continue;
      }
      throw err;
    }
  }
}

async function main() {
  if (!SAM_KEY) throw new Error("Missing SAM_GOV_API_KEY env var");

  // Look back 1 day (lighter) — cron runs every ~10h
  const now = new Date();
  const from = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000);

  const postedFrom = mmddyyyy(from);
  const postedTo = mmddyyyy(now);

  const limit = 25; // smaller pages reduce SAM.gov timeouts
  let offset = 0;

  let scanned = 0;
  let inserted = 0;
  let skippedNoTitle = 0;
  let skippedNoLocation = 0;
  let skippedNoNaics = 0;
  let skippedDuplicate = 0;

  while (true) {
    const data = await fetchPage({ postedFrom, postedTo, limit, offset });
    const rows = data?.opportunitiesData || data?.opportunities || [];

    if (!Array.isArray(rows) || rows.length === 0) break;

    for (const o of rows) {
      scanned++;

      const title = (o?.title || "").trim();
      if (!title) {
        skippedNoTitle++;
        continue;
      }

      const location = buildLocation(o);
      if (!location) {
        skippedNoLocation++;
        continue;
      }

      const naics = pickNaics(o);
      // Your Prisma schema requires naics, so we must skip if missing.
      if (!naics) {
        skippedNoNaics++;
        continue;
      }

      const agency = pickAgency(o);
      const postedDate = o?.postedDate ? new Date(o.postedDate) : null;

      const uiLink = pickUiLink(o);
      const noticeId = o?.noticeId || o?.noticeID || null;
      const url = uiLink || (noticeId ? `https://sam.gov/opp/${noticeId}/view` : null);

      // Soft dedupe for MVP: same title+naics+location(+postedDate) => skip
      const where = { title, naics, location };
      if (postedDate) where.postedDate = postedDate;

      const exists = await prisma.opportunity.findFirst({
        where,
        select: { id: true },
      });

      if (exists) {
        skippedDuplicate++;
        continue;
      }

      await prisma.opportunity.create({
        data: {
          title,
          location,
          naics,
          agency,
          postedDate,
          url,
          summary: null,
          keywords: null,
        },
      });

      inserted++;
    }

    offset += rows.length;
    if (rows.length < limit) break;
  }

  console.log(
    `[ingestSamGov] scanned=${scanned} inserted=${inserted} skippedNoTitle=${skippedNoTitle} skippedNoLocation=${skippedNoLocation} skippedNoNaics=${skippedNoNaics} skippedDuplicate=${skippedDuplicate} postedFrom=${postedFrom} postedTo=${postedTo}`
  );
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (err) => {
    console.error(err);
    await prisma.$disconnect();
    process.exit(1);
  });
