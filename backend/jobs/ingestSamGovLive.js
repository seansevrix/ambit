import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const SAM_KEY = process.env.SAM_GOV_API_KEY;
const SAM_BASE_URL = "https://api.sam.gov/opportunities/v2/search";

const SAM_LIVE_LOOKBACK_DAYS = Number(process.env.SAM_LIVE_LOOKBACK_DAYS || 180);
const SAM_LIVE_PAGE_SIZE = Math.min(
  Math.max(Number(process.env.SAM_LIVE_PAGE_SIZE || 250), 1),
  1000
);
const SAM_LIVE_MAX_PAGES = Math.max(Number(process.env.SAM_LIVE_MAX_PAGES || 12), 1);
const SAM_LIVE_PTYPES = String(process.env.SAM_LIVE_PTYPES || "p,r,o,k")
  .split(",")
  .map((value) => value.trim().toLowerCase())
  .filter(Boolean);

const SAM_MAX_RETRIES = Number(process.env.SAM_MAX_RETRIES || 6);
const SAM_RETRY_BASE_MS = Number(process.env.SAM_RETRY_BASE_MS || 2500);
const SAM_RETRY_MAX_MS = Number(process.env.SAM_RETRY_MAX_MS || 45000);
const SAM_FETCH_TIMEOUT_MS = Number(process.env.SAM_FETCH_TIMEOUT_MS || 30000);
const SAM_SOFT_FAIL_ON_UPSTREAM = envBool(process.env.SAM_SOFT_FAIL_ON_UPSTREAM, true);

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
      "cleaning services",
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
      "weed and feed",
      "weed control",
      "fertilizer",
      "fertilization",
      "irrigation",
      "tree trimming",
      "snow removal",
      "grounds care",
      "vegetation",
      "shrub",
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

const CATEGORY_LABELS = {
  janitorial: "janitorial",
  landscaping: "landscaping",
  "plumbing-hvac": "plumbing and HVAC",
  electrical: "electrical",
  security: "security",
  "waste-management": "waste management",
  roofing: "roofing",
  painting: "painting",
  "logistics-supply-chain": "logistics and supply chain",
  "office-admin": "office admin",
  "temporary-help": "temporary staffing",
  "office-supplies": "office supplies",
  warehousing: "warehousing",
  "nursing-home-health": "nursing and home health",
  "medical-equipment-rental": "medical equipment rental",
  "environmental-remediation": "environmental remediation",
  "concrete-paving": "concrete and paving",
  "fire-alarm-access-control": "fire alarm and access control",
  "fencing-gates": "fencing and gates",
  "restoration-mitigation": "restoration and mitigation",
  "pest-control": "pest control",
};

function envBool(value, defaultValue = false) {
  if (value === null || value === undefined || value === "") return defaultValue;
  const normalized = String(value).trim().toLowerCase();
  return ["1", "true", "yes", "on"].includes(normalized);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function jitter(ms) {
  return Math.floor(ms * (0.8 + Math.random() * 0.4));
}

function mmddyyyy(date) {
  const mm = String(date.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(date.getUTCDate()).padStart(2, "0");
  const yyyy = date.getUTCFullYear();
  return `${mm}/${dd}/${yyyy}`;
}

function formatDate(date) {
  if (!date) return null;
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

function asStr(value) {
  if (value === null || value === undefined) return "";
  return String(value).trim();
}

function lower(value) {
  return asStr(value).toLowerCase();
}

function looksLikeUrl(value) {
  const text = asStr(value);
  return /^https?:\/\//i.test(text);
}

function toDateOrNull(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function normalizeNaics(value) {
  const digits = asStr(value).replace(/\D/g, "");
  if (digits.length < 6) return null;
  return digits.slice(0, 6);
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

function cleanText(text, maxLen = 1600) {
  const raw = asStr(text);
  if (!raw || looksLikeUrl(raw)) return null;

  const cleaned = raw
    .replace(/<[^>]*>/g, " ")
    .replace(/https?:\/\/\S+/gi, " ")
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!cleaned) return null;
  if (cleaned.length <= maxLen) return cleaned;
  return `${cleaned.slice(0, maxLen - 1).trim()}…`;
}

function firstSentence(text) {
  const cleaned = cleanText(text, 900);
  if (!cleaned) return null;

  const match = cleaned.match(/^(.+?[.!?])(\s|$)/);
  const sentence = match?.[1] || cleaned;

  if (sentence.length <= 240) return sentence;
  return `${sentence.slice(0, 239).trim()}…`;
}

function pickNoticeId(opportunity) {
  return (
    asStr(opportunity?.noticeId) ||
    asStr(opportunity?.noticeID) ||
    asStr(opportunity?.id) ||
    null
  );
}

function pickUiLink(opportunity) {
  return asStr(opportunity?.uiLink || opportunity?.data?.uiLink) || null;
}

function pickNoticeType(opportunity) {
  return (
    asStr(opportunity?.typeOfNoticeDescription) ||
    asStr(opportunity?.type) ||
    asStr(opportunity?.noticeType) ||
    asStr(opportunity?.data?.typeOfNoticeDescription) ||
    null
  );
}

function pickStatus(opportunity) {
  return (
    asStr(opportunity?.status) ||
    asStr(opportunity?.opportunityStatus) ||
    asStr(opportunity?.active) ||
    asStr(opportunity?.data?.status) ||
    null
  );
}

function pickAgency(opportunity) {
  return (
    asStr(opportunity?.fullParentPathName) ||
    asStr(opportunity?.organizationName) ||
    [
      asStr(opportunity?.department),
      asStr(opportunity?.subTier),
      asStr(opportunity?.office),
    ]
      .filter(Boolean)
      .join(" > ") ||
    null
  );
}

function pickDueDateRaw(opportunity) {
  return pickFirst(opportunity, [
    "responseDeadLine",
    "reponseDeadLine",
    "responseDeadline",
    "responseDate",
    "closeDate",
    "data.responseDeadLine",
    "data.reponseDeadLine",
    "data.responseDeadline",
    "data.responseDate",
    "data.closeDate",
  ]);
}

function buildLocation(opportunity) {
  const pop = opportunity?.placeOfPerformance || opportunity?.data?.placeOfPerformance;
  const popCity = asStr(pop?.city?.name || pop?.city);
  const popState = asStr(pop?.state?.code || pop?.state);
  const popZip = asStr(pop?.zip);

  const popLocation = [popCity, popState].filter(Boolean).join(", ");
  if (popLocation) return popLocation;
  if (popZip) return popZip;

  const officeAddress = opportunity?.officeAddress || opportunity?.data?.officeAddress;
  const officeCity = asStr(officeAddress?.city);
  const officeState = asStr(officeAddress?.state || officeAddress?.stateCode);
  const officeZip = asStr(officeAddress?.zipcode || officeAddress?.zip);

  const officeLocation = [officeCity, officeState].filter(Boolean).join(", ");
  if (officeLocation) return officeLocation;
  if (officeZip) return officeZip;

  return null;
}

function pickState(opportunity) {
  const pop = opportunity?.placeOfPerformance || opportunity?.data?.placeOfPerformance;
  const popState = asStr(pop?.state?.code || pop?.state);
  if (popState) return popState;

  const officeAddress = opportunity?.officeAddress || opportunity?.data?.officeAddress;
  const officeState = asStr(officeAddress?.state || officeAddress?.stateCode);
  if (officeState) return officeState;

  return null;
}

function pickNaics(opportunity) {
  const value =
    opportunity?.naicsCode ||
    opportunity?.naics ||
    opportunity?.ncode ||
    (Array.isArray(opportunity?.naicsCodes) ? opportunity.naicsCodes[0] : null) ||
    opportunity?.data?.naics?.[0]?.naicsCode ||
    opportunity?.data?.naicsCode ||
    null;

  return normalizeNaics(value);
}

function pickDescription(opportunity) {
  const description =
    cleanText(opportunity?.description, 1800) ||
    cleanText(opportunity?.data?.description, 1800) ||
    cleanText(opportunity?.data?.synopsis, 1800) ||
    null;

  return description;
}

function getCategoryLabel(category) {
  return CATEGORY_LABELS[category] || "contract";
}

function deriveTargetCategory(title, description, naics) {
  const normalizedNaics = normalizeNaics(naics);
  const haystack = lower(`${title} ${description}`);

  if (normalizedNaics) {
    for (const rule of TARGET_LANE_RULES) {
      if (rule.naics.includes(normalizedNaics)) {
        return rule.category;
      }
    }
  }

  for (const rule of TARGET_LANE_RULES) {
    if (rule.keywords.some((term) => haystack.includes(term))) {
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

function buildSummaries({ title, description, noticeType, agency, location, category, dueDate }) {
  const categoryLabel = getCategoryLabel(category);
  const typeText = asStr(noticeType) || "live";
  const dueText = formatDate(dueDate);

  const summaryShort =
    firstSentence(description) ||
    cleanText(
      `${agency || "Public agency"} posted a ${typeText.toLowerCase()} ${categoryLabel} opportunity${location ? ` in ${location}` : ""}.`,
      240
    ) ||
    null;

  const summaryLong =
    cleanText(description, 1800) ||
    cleanText(
      `${agency || "A public agency"} posted ${title}${location ? ` in ${location}` : ""}. Notice type: ${typeText}. This appears to be a ${categoryLabel} opportunity for public-facing review.${dueText ? ` Responses are due ${dueText}.` : ""}`,
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
    "intent to award",
    "special notice: award",
    "fair opportunity",
    "archived",
    "cancelled",
    "canceled",
    "deleted",
  ];

  if (blockedTerms.some((term) => text.includes(term))) {
    return { keep: false, reason: "blocked_term" };
  }

  if (isExpired(dueDate)) {
    return { keep: false, reason: "past_due_date" };
  }

  return { keep: true, reason: "ok" };
}

function isSamSuspendedPayload(text = "") {
  const payload = String(text || "");
  return (
    payload.includes('"code":"303001"') ||
    (payload.includes("303001") && /State\s*:\s*SUSPENDED/i.test(payload))
  );
}

class UpstreamTransientError extends Error {
  constructor(message, meta = {}) {
    super(message);
    this.name = "UpstreamTransientError";
    Object.assign(this, meta);
  }
}

async function fetchPage({ postedFrom, postedTo, limit, pageIndex }) {
  const url = new URL(SAM_BASE_URL);
  url.searchParams.set("api_key", SAM_KEY);
  url.searchParams.set("postedFrom", postedFrom);
  url.searchParams.set("postedTo", postedTo);
  url.searchParams.set("status", "active");
  url.searchParams.set("limit", String(limit));
  url.searchParams.set("offset", String(pageIndex));

  for (const ptype of SAM_LIVE_PTYPES) {
    url.searchParams.append("ptype", ptype);
  }

  for (let attempt = 0; attempt <= SAM_MAX_RETRIES; attempt++) {
    const abortController = new AbortController();
    const timeout = setTimeout(() => abortController.abort(), SAM_FETCH_TIMEOUT_MS);

    try {
      const response = await fetch(url.toString(), {
        method: "GET",
        headers: { Accept: "application/json" },
        signal: abortController.signal,
      });

      const text = await response.text().catch(() => "");
      clearTimeout(timeout);

      if (response.ok) {
        try {
          return JSON.parse(text);
        } catch {
          throw new Error(`SAM.gov returned non-JSON body (${response.status}): ${text.slice(0, 300)}`);
        }
      }

      const retryable = RETRYABLE_HTTP.has(response.status) || isSamSuspendedPayload(text);
      const errorMessage = `SAM.gov API failed ${response.status}: ${text.slice(0, 600)}`;

      if (!retryable) {
        throw new Error(errorMessage);
      }

      if (attempt === SAM_MAX_RETRIES) {
        throw new UpstreamTransientError(errorMessage, {
          retryable: true,
          status: response.status,
          body: text,
        });
      }

      const backoffMs = Math.min(SAM_RETRY_MAX_MS, SAM_RETRY_BASE_MS * 2 ** attempt);
      console.warn(
        `[ingestSamGovLive] transient ${response.status} (try ${attempt + 1}/${SAM_MAX_RETRIES + 1}) — retrying in ${backoffMs}ms`
      );
      await sleep(jitter(backoffMs));
    } catch (error) {
      clearTimeout(timeout);

      const message = String(error?.message || error || "");
      const networkLike =
        error?.name === "AbortError" ||
        error?.name === "TypeError" ||
        error?.code === "ECONNRESET" ||
        error?.code === "ETIMEDOUT" ||
        /fetch failed|network|timeout|aborted/i.test(message);

      if (!networkLike) {
        throw error;
      }

      if (attempt === SAM_MAX_RETRIES) {
        throw new UpstreamTransientError(`SAM.gov network failure after retries: ${message}`, {
          retryable: true,
          networkLike: true,
        });
      }

      const backoffMs = Math.min(SAM_RETRY_MAX_MS, SAM_RETRY_BASE_MS * 2 ** attempt);
      console.warn(
        `[ingestSamGovLive] network error (try ${attempt + 1}/${SAM_MAX_RETRIES + 1}) — retrying in ${backoffMs}ms: ${message}`
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

function shouldSoftFail(error) {
  const message = String(error?.message || error || "");
  if (error instanceof UpstreamTransientError) return true;
  if (isSamSuspendedPayload(message)) return true;
  if (/SAM\.gov API failed (408|425|429|500|502|503|504)/i.test(message)) return true;
  return false;
}

async function main() {
  if (!SAM_KEY) {
    throw new Error("Missing SAM_GOV_API_KEY env var");
  }

  const now = new Date();
  const lookbackStart = new Date(now.getTime() - SAM_LIVE_LOOKBACK_DAYS * 24 * 60 * 60 * 1000);
  const postedFrom = mmddyyyy(lookbackStart);
  const postedTo = mmddyyyy(now);

  let pageIndex = 0;
  let scanned = 0;
  let inserted = 0;
  let updated = 0;
  let skippedNoTitle = 0;
  let skippedNoUrl = 0;
  let skippedUnusable = 0;
  let skippedWrongLane = 0;
  let deactivatedFilteredOut = 0;

  while (pageIndex < SAM_LIVE_MAX_PAGES) {
    const data = await fetchPage({
      postedFrom,
      postedTo,
      limit: SAM_LIVE_PAGE_SIZE,
      pageIndex,
    });

    const rows = data?.opportunitiesData || data?.opportunities || [];
    if (!Array.isArray(rows) || rows.length === 0) {
      break;
    }

    for (const opportunity of rows) {
      scanned += 1;

      const title = asStr(opportunity?.title);
      if (!title) {
        skippedNoTitle += 1;
        continue;
      }

      const externalId = pickNoticeId(opportunity);
      const sourceUrl =
        pickUiLink(opportunity) ||
        (externalId ? `https://sam.gov/opp/${externalId}/view` : null);

      if (!sourceUrl) {
        skippedNoUrl += 1;
        continue;
      }

      const noticeType = pickNoticeType(opportunity);
      const status = pickStatus(opportunity);
      const postedDate = toDateOrNull(opportunity?.postedDate);
      const dueDate = toDateOrNull(pickDueDateRaw(opportunity));

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
        skippedUnusable += 1;
        continue;
      }

      const buyer = pickAgency(opportunity);
      const location = buildLocation(opportunity);
      const state = pickState(opportunity);
      const naics = pickNaics(opportunity);
      const description = pickDescription(opportunity);
      const category = deriveTargetCategory(title, description, naics);

      if (!category || !ALLOWED_CATEGORIES.includes(category)) {
        deactivatedFilteredOut += await deactivateExistingLiveOpportunity({
          source: "sam.gov",
          externalId,
          sourceUrl,
        });
        skippedWrongLane += 1;
        continue;
      }

      const { summaryShort, summaryLong } = buildSummaries({
        title,
        description,
        noticeType,
        agency: buyer,
        location,
        category,
        dueDate,
      });

      const slug = buildSlug(title, externalId || sourceUrl);
      const isMarkedActiveByApi = !/\b(no|inactive|archived|cancelled|canceled|deleted)\b/i.test(
        lower(status)
      );
      const isActive = isMarkedActiveByApi && !isExpired(dueDate);

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
        raw: opportunity,
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
        updated += 1;
      } else {
        await prisma.liveOpportunity.create({ data: payload });
        inserted += 1;
      }
    }

    pageIndex += 1;

    if (rows.length < SAM_LIVE_PAGE_SIZE) {
      break;
    }
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
      OR: [{ category: null }, { category: { notIn: ALLOWED_CATEGORIES } }],
    },
    data: { isActive: false },
  });

  console.log(
    `[ingestSamGovLive] scanned=${scanned} inserted=${inserted} updated=${updated} skippedNoTitle=${skippedNoTitle} skippedNoUrl=${skippedNoUrl} skippedUnusable=${skippedUnusable} skippedWrongLane=${skippedWrongLane} deactivatedFilteredOut=${deactivatedFilteredOut} expiredMarkedInactive=${expireResult.count} deactivatedNonTarget=${nonTargetCleanupResult.count} postedFrom=${postedFrom} postedTo=${postedTo} pages=${pageIndex}`
  );
}

main()
  .then(async () => {
    await prisma.$disconnect();
    process.exit(0);
  })
  .catch(async (error) => {
    const message = String(error?.message || error || "");

    if (SAM_SOFT_FAIL_ON_UPSTREAM && shouldSoftFail(error)) {
      console.warn(`[ingestSamGovLive] upstream outage/transient issue detected — soft fail: ${message}`);
      await prisma.$disconnect();
      process.exit(0);
      return;
    }

    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });