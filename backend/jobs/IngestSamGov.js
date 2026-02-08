// backend/jobs/ingestSamGov.js
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const SAM_KEY = process.env.SAM_GOV_API_KEY;
const BASE = "https://api.sam.gov/opportunities/v2/search"; // SAM.gov opportunities v2 search

function envBool(value, defaultValue = false) {
  if (value === null || value === undefined || value === "") return defaultValue;
  const v = String(value).trim().toLowerCase();
  return v === "1" || v === "true" || v === "yes" || v === "on";
}

// ✅ Guardrails (defaults are safe)
const REQUIRE_OPEN_DUE_DATE = envBool(process.env.SAM_REQUIRE_OPEN_DUE_DATE, true);
const FORCE_ACTIVE_QUERY = envBool(process.env.SAM_FORCE_ACTIVE_QUERY, false);

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function mmddyyyy(d) {
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  const yyyy = d.getUTCFullYear();
  return `${mm}/${dd}/${yyyy}`;
}

function asStr(v) {
  if (v === null || v === undefined) return "";
  return String(v).trim();
}

function lower(v) {
  return asStr(v).toLowerCase();
}

function toDateOrNull(v) {
  if (!v) return null;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
}

function pickFirst(obj, paths) {
  for (const path of paths) {
    const value = path.split(".").reduce((acc, key) => {
      if (acc === null || acc === undefined) return undefined;
      return acc[key];
    }, obj);

    if (value !== null && value !== undefined && asStr(value) !== "") {
      return value;
    }
  }
  return null;
}

function buildLocation(o) {
  // 1) Place of Performance (preferred)
  const pop = o?.placeOfPerformance || o?.data?.placeOfPerformance;
  const popCity = asStr(pop?.city?.name || pop?.city);
  const popState = asStr(pop?.state?.code || pop?.state);
  const popZip = asStr(pop?.zip);

  const popLoc = [popCity, popState].filter(Boolean).join(", ");
  if (popLoc) return popLoc;
  if (popZip) return popZip;

  // 2) Office address fallback
  const off = o?.officeAddress || o?.data?.officeAddress;
  const offCity = asStr(off?.city);
  const offState = asStr(off?.state || off?.stateCode);
  const offZip = asStr(off?.zipcode || off?.zip);

  const offLoc = [offCity, offState].filter(Boolean).join(", ");
  if (offLoc) return offLoc;
  if (offZip) return offZip;

  return null;
}

function normalizeNaics(val) {
  const s = asStr(val);
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
  return asStr(o?.uiLink || o?.data?.uiLink) || null;
}

function pickNoticeId(o) {
  return (
    asStr(o?.noticeId) ||
    asStr(o?.noticeID) ||
    asStr(o?.id) ||
    null
  );
}

function pickNoticeType(o) {
  return (
    asStr(o?.typeOfNoticeDescription) ||
    asStr(o?.noticeType) ||
    asStr(o?.type) ||
    asStr(o?.data?.typeOfNoticeDescription) ||
    null
  );
}

function pickStatus(o) {
  return (
    asStr(o?.status) ||
    asStr(o?.opportunityStatus) ||
    asStr(o?.data?.status) ||
    null
  );
}

function pickAgency(o) {
  return (
    asStr(o?.fullParentPathName) ||
    asStr(o?.department) ||
    asStr(o?.subTier) ||
    asStr(o?.office) ||
    null
  );
}

function pickDueDateRaw(o) {
  return pickFirst(o, [
    "responseDeadLine",
    "responseDeadline",
    "responseDate",
    "closeDate",
    "archiveDate",
    "data.responseDeadLine",
    "data.responseDeadline",
    "data.responseDate",
    "data.closeDate",
    "data.archiveDate",
  ]);
}

function pickInactiveDateRaw(o) {
  return pickFirst(o, [
    "inactiveDate",
    "data.inactiveDate",
    "archiveDate",
    "data.archiveDate",
  ]);
}

function isClosedOrNonActionable({ title, noticeType, status, active, dueDate, inactiveDate }) {
  const text = `${lower(title)} ${lower(noticeType)} ${lower(status)}`;

  // Hard-block non-biddable types
  const blockedTerms = [
    "award notice",
    "award",
    "awarded",
    "inactive",
    "closed",
    "archive",
    "archived",
    "cancelled",
    "canceled",
    "expired",
    "justification",
    "fair opportunity/limited sources justification",
  ];

  for (const term of blockedTerms) {
    if (text.includes(term)) {
      return { blocked: true, reason: `term:${term}` };
    }
  }

  // Explicit inactive flags
  if (active === false || lower(active) === "false") {
    return { blocked: true, reason: "active:false" };
  }

  const now = Date.now();

  // Inactive date passed => closed
  if (inactiveDate && inactiveDate.getTime() <= now) {
    return { blocked: true, reason: "inactiveDate passed" };
  }

  // Require open due date (default ON)
  if (REQUIRE_OPEN_DUE_DATE) {
    if (!dueDate) return { blocked: true, reason: "missing dueDate" };
    if (dueDate.getTime() <= now) return { blocked: true, reason: "dueDate passed" };
  } else if (dueDate && dueDate.getTime() <= now) {
    return { blocked: true, reason: "dueDate passed" };
  }

  return { blocked: false, reason: "open" };
}

async function fetchPage({ postedFrom, postedTo, limit, offset }) {
  const url = new URL(BASE);
  url.searchParams.set("api_key", SAM_KEY);
  url.searchParams.set("postedFrom", postedFrom);
  url.searchParams.set("postedTo", postedTo);
  url.searchParams.set("limit", String(limit));
  url.searchParams.set("offset", String(offset));

  if (FORCE_ACTIVE_QUERY) {
    // Optional; only applied when explicitly enabled
    url.searchParams.set("active", "true");
  }

  const attempts = 5;

  for (let i = 1; i <= attempts; i++) {
    try {
      const res = await fetch(url.toString());

      if (res.ok) return res.json();

      const text = await res.text().catch(() => "");
      const transient = res.status === 429 || res.status >= 500;

      if (transient && i < attempts) {
        const backoffMs = 2000 * i; // 2s, 4s, 6s, 8s...
        console.warn(
          `[ingestSamGov] SAM.gov ${res.status} (try ${i}/${attempts}) — retrying in ${backoffMs}ms`
        );
        await sleep(backoffMs);
        continue;
      }

      throw new Error(`SAM.gov API failed ${res.status}: ${text.slice(0, 260)}`);
    } catch (err) {
      if (i < attempts) {
        const backoffMs = 2000 * i;
        console.warn(
          `[ingestSamGov] fetch error (try ${i}/${attempts}) — retrying in ${backoffMs}ms: ${err?.message || err}`
        );
        await sleep(backoffMs);
        continue;
      }
      throw err;
    }
  }
}

async function findExistingOpportunity({ title, naics, location, postedDate, url, noticeId }) {
  // 1) Strongest: URL
  if (url) {
    const byUrl = await prisma.opportunity.findFirst({
      where: { url },
      select: { id: true },
    });
    if (byUrl) return byUrl;
  }

  // 2) Notice ID marker in keywords (best-effort)
  if (noticeId) {
    const marker = `noticeId:${noticeId}`;
    const byNoticeId = await prisma.opportunity.findFirst({
      where: { keywords: { contains: marker } },
      select: { id: true },
    });
    if (byNoticeId) return byNoticeId;
  }

  // 3) Soft fallback
  const where = { title, naics, location };
  if (postedDate) where.postedDate = postedDate;

  return prisma.opportunity.findFirst({
    where,
    select: { id: true },
  });
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
  let updated = 0;
  let skippedNoTitle = 0;
  let skippedNoLocation = 0;
  let skippedNoNaics = 0;
  let skippedClosed = 0;
  let skippedDuplicate = 0;

  while (true) {
    const data = await fetchPage({ postedFrom, postedTo, limit, offset });
    const rows = data?.opportunitiesData || data?.opportunities || [];

    if (!Array.isArray(rows) || rows.length === 0) break;

    for (const o of rows) {
      scanned++;

      const title = asStr(o?.title);
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
      // Your schema expects NAICS for matching quality
      if (!naics) {
        skippedNoNaics++;
        continue;
      }

      const postedDate = toDateOrNull(o?.postedDate);
      const dueDate = toDateOrNull(pickDueDateRaw(o));
      const inactiveDate = toDateOrNull(pickInactiveDateRaw(o));

      const noticeId = pickNoticeId(o);
      const noticeType = pickNoticeType(o);
      const status = pickStatus(o);
      const active = o?.active ?? o?.isActive ?? o?.data?.active ?? null;

      const gate = isClosedOrNonActionable({
        title,
        noticeType,
        status,
        active,
        dueDate,
        inactiveDate,
      });

      if (gate.blocked) {
        skippedClosed++;
        continue;
      }

      const uiLink = pickUiLink(o);
      const url = uiLink || (noticeId ? `https://sam.gov/opp/${noticeId}/view` : null);
      const agency = pickAgency(o);

      const summaryParts = [
        asStr(o?.description) || asStr(o?.data?.description) || null,
        noticeType ? `Notice Type: ${noticeType}` : null,
        status ? `Status: ${status}` : null,
      ].filter(Boolean);

      const summary = summaryParts.length ? summaryParts.join(" | ") : null;

      const keywordsParts = [
        noticeId ? `noticeId:${noticeId}` : null,
        noticeType ? `noticeType:${noticeType}` : null,
      ].filter(Boolean);

      const keywords = keywordsParts.length ? keywordsParts.join(", ") : null;

      const existing = await findExistingOpportunity({
        title,
        naics,
        location,
        postedDate,
        url,
        noticeId,
      });

      const payload = {
        title,
        location,
        naics,
        agency,
        postedDate,
        dueDate,
        url,
        summary,
        keywords,
        source: "sam.gov",
        segment: "government",
      };

      if (existing) {
        // Update existing instead of creating duplicates
        await prisma.opportunity.update({
          where: { id: existing.id },
          data: payload,
        });
        updated++;
        skippedDuplicate++; // tracked as "not newly inserted"
        continue;
      }

      await prisma.opportunity.create({ data: payload });
      inserted++;
    }

    offset += rows.length;
    if (rows.length < limit) break;
  }

  console.log(
    `[ingestSamGov] scanned=${scanned} inserted=${inserted} updated=${updated} skippedNoTitle=${skippedNoTitle} skippedNoLocation=${skippedNoLocation} skippedNoNaics=${skippedNoNaics} skippedClosed=${skippedClosed} skippedDuplicate=${skippedDuplicate} postedFrom=${postedFrom} postedTo=${postedTo}`
  );
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (err) => {
    console.error(err);
    await prisma.$disconnect();
    process.exit(1);
  });
