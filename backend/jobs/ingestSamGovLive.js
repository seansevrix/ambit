import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const SAM_KEY = process.env.SAM_GOV_API_KEY;
const BASE = "https://api.sam.gov/opportunities/v2/search";

function envBool(value, defaultValue = false) {
  if (value === null || value === undefined || value === "") return defaultValue;
  const v = String(value).trim().toLowerCase();
  return v === "1" || v === "true" || v === "yes" || v === "on";
}

const SAM_LIVE_LOOKBACK_DAYS = Number(process.env.SAM_LIVE_LOOKBACK_DAYS || 21);
const SAM_LIVE_PAGE_SIZE = Number(process.env.SAM_LIVE_PAGE_SIZE || 50);
const SAM_LIVE_MAX_PAGES = Number(process.env.SAM_LIVE_MAX_PAGES || 12);

const SAM_MAX_RETRIES = Number(process.env.SAM_MAX_RETRIES || 6);
const SAM_RETRY_BASE_MS = Number(process.env.SAM_RETRY_BASE_MS || 2500);
const SAM_RETRY_MAX_MS = Number(process.env.SAM_RETRY_MAX_MS || 45000);
const SAM_FETCH_TIMEOUT_MS = Number(process.env.SAM_FETCH_TIMEOUT_MS || 30000);
const SAM_SOFT_FAIL_ON_UPSTREAM = envBool(process.env.SAM_SOFT_FAIL_ON_UPSTREAM, true);
const FORCE_ACTIVE_QUERY = envBool(process.env.SAM_FORCE_ACTIVE_QUERY, false);

const RETRYABLE_HTTP = new Set([408, 425, 429, 500, 502, 503, 504]);

const TARGET_LANE_RULES = [
  {
    category: "janitorial",
    naics: ["561720"],
    keywords: [
      "janitorial",
      "custodial",
      "custodian",
      "floor care",
      "window cleaning",
      "housekeeping",
      "sanitation",
      "disinfection",
      "restroom cleaning",
      "building cleaning",
    ],
  },
  {
    category: "landscaping",
    naics: ["561730"],
    keywords: [
      "landscaping",
      "grounds maintenance",
      "groundskeeping",
      "mowing",
      "lawn",
      "irrigation",
      "tree trimming",
      "snow removal",
      "grounds care",
      "vegetation",
    ],
  },
  {
    category: "plumbing-hvac",
    naics: ["238220"],
    keywords: [
      "hvac",
      "heating",
      "ventilation",
      "air conditioning",
      "chiller",
      "boiler",
      "mechanical system",
      "mechanical systems",
      "plumbing",
      "pipe repair",
      "water heater",
      "ductwork",
      "controls upgrade",
      "test and balance",
      "makeup air unit",
      "rtu",
      "cooling tower",
      "sewer line",
      "water line",
    ],
  },
  {
    category: "electrical",
    naics: ["238210"],
    keywords: [
      "electrical",
      "electric",
      "wiring",
      "lighting",
      "low voltage",
      "low-voltage",
      "power distribution",
      "generator",
      "switchgear",
      "panelboard",
      "transformer",
      "site lighting",
    ],
  },
  {
    category: "security",
    naics: ["561612", "561621"],
    keywords: [
      "security guard",
      "guard services",
      "armed guard",
      "unarmed guard",
      "physical security",
      "patrol",
      "surveillance",
      "access control",
      "camera system",
      "cctv",
      "alarm monitoring",
      "security system",
    ],
  },
  {
    category: "waste-management",
    naics: ["562111", "562112", "562119"],
    keywords: [
      "trash removal",
      "refuse",
      "recycling",
      "solid waste",
      "waste hauling",
      "dumpster",
      "roll-off",
      "garbage collection",
      "debris removal",
      "hazmat disposal",
    ],
  },
  {
    category: "roofing",
    naics: ["238160"],
    keywords: [
      "roof",
      "roofing",
      "shingle",
      "membrane",
      "gutter",
      "roof replacement",
      "roof repair",
      "sheet metal roofing",
      "standing seam",
      "flashing",
    ],
  },
  {
    category: "painting",
    naics: ["238320"],
    keywords: [
      "painting",
      "paint",
      "coating",
      "industrial coating",
      "surface prep",
      "lead abatement",
      "striping",
      "epoxy coating",
      "repaint",
    ],
  },
  {
    category: "logistics-supply-chain",
    naics: ["541614"],
    keywords: [
      "logistics",
      "supply chain",
      "distribution",
      "freight",
      "procurement support",
      "material management",
      "inventory support",
      "shipping and receiving",
      "delivery support",
      "transportation support",
    ],
  },
  {
    category: "office-admin",
    naics: ["561110"],
    keywords: [
      "clerical",
      "data entry",
      "record management",
      "records management",
      "administrative support",
      "office support",
      "mailroom",
      "document processing",
      "back office",
      "program support",
    ],
  },
  {
    category: "temporary-help",
    naics: ["561320"],
    keywords: [
      "temporary help",
      "staffing",
      "temp services",
      "labor hire",
      "personnel support",
      "contract staffing",
      "temporary staffing",
      "supplemental staffing",
    ],
  },
  {
    category: "office-supplies",
    naics: ["453210"],
    keywords: [
      "office supplies",
      "stationery",
      "toner",
      "printer paper",
      "office furniture",
      "desks",
      "chairs",
      "filing cabinet",
      "copier supplies",
      "micro-purchase",
    ],
  },
  {
    category: "warehousing",
    naics: ["493110"],
    keywords: [
      "warehouse",
      "warehousing",
      "storage",
      "cold storage",
      "inventory management",
      "distribution center",
      "fulfillment",
      "stockroom",
      "material storage",
    ],
  },
  {
    category: "nursing-home-health",
    naics: ["623110", "621610"],
    keywords: [
      "nursing",
      "home health",
      "home healthcare",
      "patient care",
      "elder care",
      "skilled nursing",
      "home visits",
      "caregiver",
      "clinical staffing",
    ],
  },
  {
    category: "medical-equipment-rental",
    naics: ["532283"],
    keywords: [
      "medical equipment rental",
      "hospital bed",
      "oxygen",
      "oxygen concentrator",
      "mobility device",
      "wheelchair rental",
      "durable medical equipment",
      "dme rental",
    ],
  },
  {
    category: "environmental-remediation",
    naics: ["562910"],
    keywords: [
      "environmental remediation",
      "asbestos",
      "mold removal",
      "soil testing",
      "hazardous cleanup",
      "lead cleanup",
      "site remediation",
      "contaminated soil",
      "abatement",
    ],
  },

  // Adjacent teaser lanes
  {
    category: "concrete-paving",
    naics: ["237310"],
    keywords: [
      "concrete",
      "asphalt",
      "paving",
      "sidewalk",
      "curb",
      "parking lot",
      "striping",
      "milling",
      "resurfacing",
    ],
  },
  {
    category: "fire-alarm-access-control",
    naics: ["561621", "238210"],
    keywords: [
      "fire alarm",
      "access control",
      "card reader",
      "burglar alarm",
      "mass notification",
      "security electronics",
      "door hardware",
      "electronic security",
    ],
  },
  {
    category: "fencing-gates",
    naics: ["238990"],
    keywords: [
      "fence",
      "fencing",
      "gate",
      "gates",
      "perimeter fencing",
      "chain link",
      "ornamental fence",
      "barrier",
    ],
  },
  {
    category: "restoration-mitigation",
    naics: [],
    keywords: [
      "water mitigation",
      "fire restoration",
      "disaster restoration",
      "flood cleanup",
      "smoke damage",
      "emergency restoration",
    ],
  },
  {
    category: "pest-control",
    naics: ["561710"],
    keywords: [
      "pest control",
      "extermination",
      "rodent control",
      "termite treatment",
      "insect control",
      "wildlife control",
    ],
  },
];

const ALLOWED_CATEGORIES = TARGET_LANE_RULES.map((rule) => rule.category);

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function jitter(ms) {
  return Math.floor(ms * (0.8 + Math.random() * 0.4));
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
  const pop = o?.placeOfPerformance || o?.data?.placeOfPerformance;
  const popCity = asStr(pop?.city?.name || pop?.city);
  const popState = asStr(pop?.state?.code || pop?.state);
  const popZip = asStr(pop?.zip);

  const popLoc = [popCity, popState].filter(Boolean).join(", ");
  if (popLoc) return popLoc;
  if (popZip) return popZip;

  const off = o?.officeAddress || o?.data?.officeAddress;
  const offCity = asStr(off?.city);
  const offState = asStr(off?.state || off?.stateCode);
  const offZip = asStr(off?.zipcode || off?.zip);

  const offLoc = [offCity, offState].filter(Boolean).join(", ");
  if (offLoc) return offLoc;
  if (offZip) return offZip;

  return null;
}

function pickState(o) {
  const pop = o?.placeOfPerformance || o?.data?.placeOfPerformance;
  const popState = asStr(pop?.state?.code || pop?.state);
  if (popState) return popState;

  const off = o?.officeAddress || o?.data?.officeAddress;
  const offState = asStr(off?.state || off?.stateCode);
  if (offState) return offState;

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
  return asStr(o?.noticeId) || asStr(o?.noticeID) || asStr(o?.id) || null;
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
  return asStr(o?.status) || asStr(o?.opportunityStatus) || asStr(o?.data?.status) || null;
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

function pickDescription(o) {
  return (
    asStr(o?.description) ||
    asStr(o?.data?.description) ||
    asStr(o?.additionalInfoLink) ||
    ""
  );
}

function isSamSuspendedPayload(text = "") {
  const t = String(text || "");
  return (
    t.includes('"code":"303001"') ||
    t.includes('code":"303001"') ||
    (t.includes("303001") && /State\s*:\s*SUSPENDED/i.test(t))
  );
}

class UpstreamTransientError extends Error {
  constructor(message, meta = {}) {
    super(message);
    this.name = "UpstreamTransientError";
    Object.assign(this, meta);
  }
}

function cleanText(text, maxLen = 1200) {
  const cleaned = asStr(text)
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .replace(/\u00a0/g, " ")
    .trim();

  if (!cleaned) return null;
  if (cleaned.length <= maxLen) return cleaned;
  return `${cleaned.slice(0, maxLen - 1).trim()}…`;
}

function firstSentence(text) {
  const cleaned = cleanText(text, 800);
  if (!cleaned) return null;

  const match = cleaned.match(/^(.+?[.!?])(\s|$)/);
  const sentence = match?.[1] || cleaned;

  if (sentence.length <= 220) return sentence;
  return `${sentence.slice(0, 219).trim()}…`;
}

function deriveTargetCategory(title, description, naics) {
  const normalizedNaics = normalizeNaics(naics);
  const text = lower(`${title} ${description}`);

  if (normalizedNaics) {
    for (const rule of TARGET_LANE_RULES) {
      if (rule.naics.includes(normalizedNaics)) {
        return rule.category;
      }
    }
  }

  for (const rule of TARGET_LANE_RULES) {
    if (rule.keywords.some((term) => text.includes(term))) {
      return rule.category;
    }
  }

  return null;
}

function slugify(text) {
  return asStr(text)
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-")
    .slice(0, 90);
}

function buildSlug(title, externalId) {
  const base = slugify(title) || "live-contract";
  const suffix = slugify(externalId || "").slice(0, 24);
  return suffix ? `${base}-${suffix}`.slice(0, 120) : base.slice(0, 120);
}

function buildSummaries({ title, description, noticeType, agency, location, category }) {
  const cleanedDescription = cleanText(description, 1800);

  const summaryShort =
    firstSentence(cleanedDescription) ||
    cleanText(
      [category, noticeType, title, agency, location].filter(Boolean).join(" — "),
      220
    ) ||
    null;

  const summaryLong =
    cleanedDescription ||
    cleanText(
      [
        title,
        category ? `Lane: ${category}` : null,
        noticeType ? `Notice type: ${noticeType}` : null,
        agency,
        location,
      ]
        .filter(Boolean)
        .join(" — "),
      1200
    ) ||
    null;

  return { summaryShort, summaryLong };
}

function isExpired(dueDate) {
  if (!dueDate) return false;
  return dueDate.getTime() < Date.now();
}

function isPubliclyUsefulNotice({ title, noticeType, status, dueDate }) {
  const text = lower(`${title} ${noticeType} ${status}`);

  const blockedTerms = [
    "award notice",
    "justification and approval",
    "sole source justification",
    "special notice: award",
    "archived",
    "cancelled",
    "canceled",
  ];

  if (blockedTerms.some((term) => text.includes(term))) {
    return { keep: false, reason: "blocked_term" };
  }

  if (isExpired(dueDate)) {
    return { keep: false, reason: "past_due_date" };
  }

  return { keep: true, reason: "ok" };
}

async function fetchPage({ postedFrom, postedTo, limit, offset }) {
  const url = new URL(BASE);
  url.searchParams.set("api_key", SAM_KEY);
  url.searchParams.set("postedFrom", postedFrom);
  url.searchParams.set("postedTo", postedTo);
  url.searchParams.set("limit", String(limit));
  url.searchParams.set("offset", String(offset));

  if (FORCE_ACTIVE_QUERY) {
    url.searchParams.set("active", "true");
  }

  for (let attempt = 0; attempt <= SAM_MAX_RETRIES; attempt++) {
    const ac = new AbortController();
    const timeout = setTimeout(() => ac.abort(), SAM_FETCH_TIMEOUT_MS);

    try {
      const res = await fetch(url.toString(), {
        method: "GET",
        headers: { Accept: "application/json" },
        signal: ac.signal,
      });

      const text = await res.text().catch(() => "");
      clearTimeout(timeout);

      if (res.ok) {
        try {
          return JSON.parse(text);
        } catch {
          throw new Error(`SAM.gov returned non-JSON body (${res.status}): ${text.slice(0, 300)}`);
        }
      }

      const retryable = RETRYABLE_HTTP.has(res.status) || isSamSuspendedPayload(text);
      const errMsg = `SAM.gov API failed ${res.status}: ${text.slice(0, 600)}`;

      if (!retryable) {
        throw new Error(errMsg);
      }

      if (attempt === SAM_MAX_RETRIES) {
        throw new UpstreamTransientError(errMsg, {
          retryable: true,
          status: res.status,
          body: text,
          samSuspended: isSamSuspendedPayload(text),
        });
      }

      const backoffMs = Math.min(SAM_RETRY_MAX_MS, SAM_RETRY_BASE_MS * 2 ** attempt);
      console.warn(
        `[ingestSamGovLive] transient ${res.status} (try ${attempt + 1}/${SAM_MAX_RETRIES + 1}) — retrying in ${backoffMs}ms`
      );
      await sleep(jitter(backoffMs));
    } catch (err) {
      clearTimeout(timeout);

      const msg = String(err?.message || err || "");
      const networkLike =
        err?.name === "AbortError" ||
        err?.name === "TypeError" ||
        err?.code === "ECONNRESET" ||
        err?.code === "ETIMEDOUT" ||
        /fetch failed|network|timeout|aborted/i.test(msg);

      if (!networkLike) {
        throw err;
      }

      if (attempt === SAM_MAX_RETRIES) {
        throw new UpstreamTransientError(`SAM.gov network failure after retries: ${msg}`, {
          retryable: true,
          networkLike: true,
        });
      }

      const backoffMs = Math.min(SAM_RETRY_MAX_MS, SAM_RETRY_BASE_MS * 2 ** attempt);
      console.warn(
        `[ingestSamGovLive] network error (try ${attempt + 1}/${SAM_MAX_RETRIES + 1}) — retrying in ${backoffMs}ms: ${msg}`
      );
      await sleep(jitter(backoffMs));
    }
  }

  throw new UpstreamTransientError("SAM.gov fetch exhausted retries", { retryable: true });
}

async function findExistingLiveOpportunity({ source, externalId, sourceUrl, slug }) {
  if (sourceUrl) {
    const byUrl = await prisma.liveOpportunity.findFirst({
      where: { source, sourceUrl },
      select: { id: true },
    });
    if (byUrl) return byUrl;
  }

  if (externalId) {
    const byExternalId = await prisma.liveOpportunity.findFirst({
      where: { source, externalId },
      select: { id: true },
    });
    if (byExternalId) return byExternalId;
  }

  return prisma.liveOpportunity.findFirst({
    where: { slug },
    select: { id: true },
  });
}

async function deactivateExistingLiveOpportunity({ source, externalId, sourceUrl }) {
  const ors = [];

  if (sourceUrl) ors.push({ source, sourceUrl });
  if (externalId) ors.push({ source, externalId });

  if (!ors.length) return 0;

  const result = await prisma.liveOpportunity.updateMany({
    where: { OR: ors },
    data: { isActive: false },
  });

  return result.count;
}

function shouldSoftFail(err) {
  const msg = String(err?.message || err || "");
  if (err instanceof UpstreamTransientError) return true;
  if (isSamSuspendedPayload(msg)) return true;
  if (/SAM\.gov API failed (408|425|429|500|502|503|504)/i.test(msg)) return true;
  return false;
}

async function main() {
  if (!SAM_KEY) throw new Error("Missing SAM_GOV_API_KEY env var");

  const now = new Date();
  const from = new Date(now.getTime() - SAM_LIVE_LOOKBACK_DAYS * 24 * 60 * 60 * 1000);

  const postedFrom = mmddyyyy(from);
  const postedTo = mmddyyyy(now);

  let offset = 0;
  let pageCount = 0;

  let scanned = 0;
  let inserted = 0;
  let updated = 0;
  let skippedNoTitle = 0;
  let skippedNoUrl = 0;
  let skippedUnusable = 0;
  let skippedWrongLane = 0;
  let deactivatedFilteredOut = 0;

  while (pageCount < SAM_LIVE_MAX_PAGES) {
    const data = await fetchPage({
      postedFrom,
      postedTo,
      limit: SAM_LIVE_PAGE_SIZE,
      offset,
    });

    const rows = data?.opportunitiesData || data?.opportunities || [];
    if (!Array.isArray(rows) || rows.length === 0) break;

    for (const o of rows) {
      scanned++;

      const title = asStr(o?.title);
      if (!title) {
        skippedNoTitle++;
        continue;
      }

      const externalId = pickNoticeId(o);
      const sourceUrl =
        pickUiLink(o) || (externalId ? `https://sam.gov/opp/${externalId}/view` : null);

      if (!sourceUrl) {
        skippedNoUrl++;
        continue;
      }

      const noticeType = pickNoticeType(o);
      const status = pickStatus(o);
      const postedDate = toDateOrNull(o?.postedDate);
      const dueDate = toDateOrNull(pickDueDateRaw(o));

      const keepDecision = isPubliclyUsefulNotice({
        title,
        noticeType,
        status,
        dueDate,
      });

      if (!keepDecision.keep) {
        deactivatedFilteredOut += await deactivateExistingLiveOpportunity({
          source: "sam.gov",
          externalId,
          sourceUrl,
        });
        skippedUnusable++;
        continue;
      }

      const buyer = pickAgency(o);
      const location = buildLocation(o);
      const state = pickState(o);
      const naics = pickNaics(o);
      const description = pickDescription(o);

      const category = deriveTargetCategory(title, description, naics);

      if (!category || !ALLOWED_CATEGORIES.includes(category)) {
        deactivatedFilteredOut += await deactivateExistingLiveOpportunity({
          source: "sam.gov",
          externalId,
          sourceUrl,
        });
        skippedWrongLane++;
        continue;
      }

      const { summaryShort, summaryLong } = buildSummaries({
        title,
        description,
        noticeType,
        agency: buyer,
        location,
        category,
      });

      const slug = buildSlug(title, externalId || sourceUrl);
      const isActive =
        !isExpired(dueDate) && !/archived|cancelled|canceled/i.test(lower(status));

      const payload = {
        segment: "government",
        source: "sam.gov",
        externalId: externalId || null,
        sourceUrl,
        slug,
        title,
        buyer: buyer || null,
        location: location || null,
        state: state || null,
        naics: naics || null,
        category,
        status: status || null,
        noticeType: noticeType || null,
        summaryShort: summaryShort || null,
        summaryLong: summaryLong || null,
        postedDate,
        dueDate,
        isActive,
        raw: o,
      };

      const existing = await findExistingLiveOpportunity({
        source: "sam.gov",
        externalId: payload.externalId,
        sourceUrl: payload.sourceUrl,
        slug: payload.slug,
      });

      if (existing) {
        await prisma.liveOpportunity.update({
          where: { id: existing.id },
          data: payload,
        });
        updated++;
        continue;
      }

      await prisma.liveOpportunity.create({ data: payload });
      inserted++;
    }

    offset += rows.length;
    pageCount++;

    if (rows.length < SAM_LIVE_PAGE_SIZE) break;
  }

  const expireResult = await prisma.liveOpportunity.updateMany({
    where: {
      source: "sam.gov",
      dueDate: { lt: now },
      isActive: true,
    },
    data: { isActive: false },
  });

  const nonTargetCleanupResult = await prisma.liveOpportunity.updateMany({
    where: {
      source: "sam.gov",
      isActive: true,
      OR: [
        { category: null },
        { category: { notIn: ALLOWED_CATEGORIES } },
      ],
    },
    data: { isActive: false },
  });

  console.log(
    `[ingestSamGovLive] scanned=${scanned} inserted=${inserted} updated=${updated} skippedNoTitle=${skippedNoTitle} skippedNoUrl=${skippedNoUrl} skippedUnusable=${skippedUnusable} skippedWrongLane=${skippedWrongLane} deactivatedFilteredOut=${deactivatedFilteredOut} expiredMarkedInactive=${expireResult.count} deactivatedNonTarget=${nonTargetCleanupResult.count} postedFrom=${postedFrom} postedTo=${postedTo} pages=${pageCount}`
  );
}

main()
  .then(async () => {
    await prisma.$disconnect();
    process.exit(0);
  })
  .catch(async (err) => {
    const msg = String(err?.message || err || "");

    if (SAM_SOFT_FAIL_ON_UPSTREAM && shouldSoftFail(err)) {
      console.warn(
        `[ingestSamGovLive] upstream outage/transient issue detected — soft fail: ${msg}`
      );
      await prisma.$disconnect();
      process.exit(0);
      return;
    }

    console.error(err);
    await prisma.$disconnect();
    process.exit(1);
  });