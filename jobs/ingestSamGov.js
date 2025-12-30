// backend/jobs/ingestSamGov.js
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const SAM_KEY = process.env.SAM_GOV_API_KEY; // set this in Render
const BASE = "https://api.sam.gov/opportunities/v2/search"; // official v2 endpoint

function mmddyyyy(d) {
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  const yyyy = d.getUTCFullYear();
  return `${mm}/${dd}/${yyyy}`;
}

function buildLocation(o) {
  // API responses vary; this keeps it resilient.
  const pop = o?.placeOfPerformance || o?.data?.placeOfPerformance;
  const city = pop?.city?.name || pop?.city || "";
  const state = pop?.state?.code || pop?.state || "";
  const zip = pop?.zip || "";
  return [city, state].filter(Boolean).join(", ") || zip || null;
}

function pickNaics(o) {
  // common shapes: ncode / naicsCode / naics
  return (
    o?.ncode ||
    o?.naicsCode ||
    o?.naics ||
    o?.data?.naics?.[0]?.naicsCode ||
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
  // Optional: only active notices (if supported in your responses)
  // url.searchParams.set("status", "active");

  const res = await fetch(url.toString());
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`SAM.gov API failed ${res.status}: ${text.slice(0, 200)}`);
  }
  return res.json();
}

async function main() {
  if (!SAM_KEY) throw new Error("Missing SAM_GOV_API_KEY env var");

  // Look back 2 days to avoid missing anything; cron runs every 10h
  const now = new Date();
  const from = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);

  const postedFrom = mmddyyyy(from);
  const postedTo = mmddyyyy(now);

  const limit = 100; // keep it conservative
  let offset = 0;
  let inserted = 0;
  let scanned = 0;

  while (true) {
    const data = await fetchPage({ postedFrom, postedTo, limit, offset });
    const rows = data?.opportunitiesData || data?.opportunities || [];
    if (!Array.isArray(rows) || rows.length === 0) break;

    for (const o of rows) {
      scanned++;

      const title = (o?.title || "").trim();
      if (!title) continue;

      const naics = String(pickNaics(o) || "").trim() || null;
      const location = buildLocation(o);

      const agency =
        o?.fullParentPathName ||
        o?.department ||
        o?.subTier ||
        o?.office ||
        null;

      const postedDate = o?.postedDate ? new Date(o.postedDate) : null;

      // A stable “source id” is best; SAM commonly provides noticeId
      const noticeId = o?.noticeId || o?.noticeID || null;

      // Soft dedupe for MVP: if same title+naics+location+postedDate exists, skip.
      const exists = await prisma.opportunity.findFirst({
        where: {
          title,
          naics,
          location,
          ...(postedDate ? { postedDate } : {}),
        },
        select: { id: true },
      });

      if (exists) continue;

      await prisma.opportunity.create({
        data: {
          title,
          location,
          naics,
          agency,
          postedDate,
          url: noticeId ? `https://sam.gov/opp/${noticeId}/view` : null,
          summary: null,
          keywords: null,
        },
      });

      inserted++;
    }

    offset += rows.length;
    // stop if fewer than limit returned
    if (rows.length < limit) break;
  }

  console.log(
    `[ingestSamGov] scanned=${scanned} inserted=${inserted} postedFrom=${postedFrom} postedTo=${postedTo}`
  );
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (err) => {
    console.error(err);
    await prisma.$disconnect();
    process.exit(1);
  });
