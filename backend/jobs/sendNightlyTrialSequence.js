// backend/jobs/sendNightlyTrialSequence.js
import prisma from "../lib/prisma.js";

const TZ = "America/Los_Angeles";
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const RESEND_FROM = process.env.RESEND_FROM || "AMBIT <ambit@sevrixgov.com>";
const REPLY_TO = process.env.REPLY_TO || "ambit@sevrixgov.com";
const APP_URL = process.env.FRONTEND_URL || process.env.APP_URL || "https://www.ambitco.app";
const DRY_RUN = String(process.env.DRY_RUN || "") === "1";

// Throttle/retry controls (override with env vars if needed)
const SEND_GAP_MS = Number(process.env.SEND_GAP_MS || 650); // <= 2 req/sec
const RESEND_MAX_RETRIES = Number(process.env.RESEND_MAX_RETRIES || 4);
const RESEND_BASE_RETRY_MS = Number(process.env.RESEND_BASE_RETRY_MS || 800);

/**
 * 7-night trial sequence
 * Day index is 1..7
 */
const SEQUENCE = [
  {
    subject: "Your AMBIT matches are being prepared tonight",
    headline: "Your AMBIT pipeline is running.",
    body: [
      "Tonight we’re ingesting and ranking opportunities based on your service area, NAICS, and keywords.",
      "Tomorrow morning, you’ll get high-fit opportunities without manually searching portals.",
    ],
    cta: "Keep your pipeline active",
  },
  {
    subject: "A paused pipeline means missed opportunities",
    headline: "Quick reality check:",
    body: [
      "If your AMBIT access is paused, you are likely missing opportunities your competitors are already seeing.",
      "Reactivating takes less than a minute and keeps daily matches flowing.",
    ],
    cta: "Reactivate your pipeline",
  },
  {
    subject: "Replace part of your ad spend with direct opportunities",
    headline: "Less ad waste. More targeted opportunities.",
    body: [
      "Instead of increasing paid ads, AMBIT can deliver matched opportunities directly to your inbox.",
      "You stay focused on bidding and closing work, not hunting manually.",
    ],
    cta: "Resume daily matches",
  },
  {
    subject: "More opportunities, no additional signups needed",
    headline: "You don’t need more forms or funnels.",
    body: [
      "AMBIT is designed to route relevant opportunities to you based on the profile you already set up.",
      "No extra signup campaigns required to keep quality opportunities coming.",
    ],
    cta: "Keep opportunities coming",
  },
  {
    subject: "AMBIT support is available when you need it",
    headline: "You’re not doing this alone.",
    body: [
      "Need help choosing what to pursue? Reply to this email and an AMBIT associate will help prioritize your next best opportunities.",
      "Software + human support is how you move faster.",
    ],
    cta: "Get associate support",
  },
  {
    subject: "Your competitors are still moving tonight",
    headline: "Speed matters in contracting.",
    body: [
      "Every week, companies are reviewing and acting on new opportunities.",
      "Keeping your AMBIT pipeline active helps you stay visible and competitive.",
    ],
    cta: "Stay competitive",
  },
  {
    subject: "Final trial reminder: keep your AMBIT pipeline active",
    headline: "Final trial reminder.",
    body: [
      "If you want consistent matched opportunities without extra marketing complexity, keep your AMBIT access active.",
      "Reply to this email if you want a quick profile tune-up before you continue.",
    ],
    cta: "Activate AMBIT",
  },
];

/* ---------------- Helpers ---------------- */

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function hasField(obj, field) {
  return Object.prototype.hasOwnProperty.call(obj, field);
}

function toDateSafe(value) {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

function normalizeEmail(raw) {
  if (raw == null) return "";
  return String(raw).trim().toLowerCase();
}

// Basic practical validator for outbound sending
function isValidEmail(email) {
  // disallow spaces, require exactly one "@", require dot in domain with 2+ char TLD
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}

function getPTParts(date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const map = {};
  for (const p of parts) {
    if (p.type !== "literal") map[p.type] = p.value;
  }

  return {
    year: Number(map.year),
    month: Number(map.month),
    day: Number(map.day),
  };
}

function ptDateKey(date) {
  const { year, month, day } = getPTParts(date);
  const mm = String(month).padStart(2, "0");
  const dd = String(day).padStart(2, "0");
  return `${year}-${mm}-${dd}`;
}

function ptMidnightUtcMs(date) {
  const { year, month, day } = getPTParts(date);
  return Date.UTC(year, month - 1, day);
}

function dayDiffInPT(startDate, endDate) {
  const diffMs = ptMidnightUtcMs(endDate) - ptMidnightUtcMs(startDate);
  return Math.floor(diffMs / 86400000);
}

function isLikelySubscribed(customer) {
  const raw =
    customer.stripeSubscriptionStatus ??
    customer.subscriptionStatus ??
    customer.planStatus ??
    "";
  const status = String(raw).toLowerCase().trim();

  // Paid/active-style states to skip trial nurture
  return ["active", "past_due", "unpaid", "paused"].includes(status);
}

function isUnsubscribed(customer) {
  return (
    customer.unsubscribed === true ||
    customer.emailUnsubscribed === true ||
    customer.marketingOptOut === true
  );
}

function getTrialStart(customer, now) {
  return toDateSafe(customer.trialStartedAt) || toDateSafe(customer.createdAt) || now;
}

function getTrialDay(customer, now) {
  const start = getTrialStart(customer, now);
  const diff = dayDiffInPT(start, now);
  return diff + 1; // 1..7
}

function alreadySentTonight(customer, now) {
  const last = toDateSafe(customer.lastNightlySentAt);
  if (!last) return false;
  return ptDateKey(last) === ptDateKey(now);
}

function buildEmail({ firstName, day, activateUrl }) {
  const safeDay = Math.min(Math.max(day, 1), 7);
  const tpl = SEQUENCE[safeDay - 1];
  const name = (firstName || "").trim() || "there";

  const html = `
  <div style="font-family: Arial, Helvetica, sans-serif; color:#111; line-height:1.6;">
    <p>Hi ${name},</p>

    <p><strong>${tpl.headline}</strong></p>

    ${tpl.body.map((p) => `<p>${p}</p>`).join("")}

    <p style="margin: 20px 0;">
      <a href="${activateUrl}" style="
        background:#111;
        color:#fff;
        text-decoration:none;
        padding:10px 14px;
        border-radius:8px;
        display:inline-block;
        font-weight:600;
      ">${tpl.cta}</a>
    </p>

    <p>Need help now? Just reply to this email and an AMBIT associate will connect with you.</p>

    <p style="font-size:12px; color:#666; margin-top:24px;">
      You’re receiving this because you started an AMBIT free trial.<br/>
      If you’d like to stop receiving these emails, reply STOP.
    </p>
  </div>`;

  const text = [
    `Hi ${name},`,
    ``,
    tpl.headline,
    ``,
    ...tpl.body,
    ``,
    `${tpl.cta}: ${activateUrl}`,
    ``,
    `Need help now? Reply to this email and an AMBIT associate will connect with you.`,
    ``,
    `If you'd like to stop receiving these emails, reply STOP.`,
  ].join("\n");

  return { subject: tpl.subject, html, text };
}

function getRetryDelayMs(res, attempt) {
  const retryAfter = res.headers.get("retry-after");
  if (retryAfter) {
    const asNumber = Number(retryAfter);
    if (!Number.isNaN(asNumber)) {
      return Math.max(500, asNumber * 1000);
    }
    const asDate = new Date(retryAfter);
    if (!Number.isNaN(asDate.getTime())) {
      return Math.max(500, asDate.getTime() - Date.now());
    }
  }

  // Exponential backoff fallback: 800ms, 1600ms, 3200ms...
  return Math.min(10000, RESEND_BASE_RETRY_MS * 2 ** (attempt - 1));
}

async function sendResendEmail({ to, subject, html, text }) {
  if (DRY_RUN) {
    console.log(`[DRY_RUN] Would send to ${to}: ${subject}`);
    return { id: "dry_run" };
  }

  let lastErr;

  for (let attempt = 1; attempt <= RESEND_MAX_RETRIES; attempt++) {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: RESEND_FROM,
        to: [to],
        reply_to: REPLY_TO,
        subject,
        html,
        text,
      }),
    });

    if (res.ok) {
      return res.json();
    }

    const errText = await res.text();
    const isRetryable = res.status === 429 || res.status >= 500;

    if (isRetryable && attempt < RESEND_MAX_RETRIES) {
      const waitMs = getRetryDelayMs(res, attempt);
      console.warn(
        `Resend ${res.status} for ${to} (attempt ${attempt}/${RESEND_MAX_RETRIES}). Retrying in ${waitMs}ms`
      );
      await sleep(waitMs);
      continue;
    }

    lastErr = new Error(`Resend ${res.status}: ${errText}`);
    break;
  }

  throw lastErr || new Error("Unknown email send error");
}

/* ---------------- Main ---------------- */

async function main() {
  if (!RESEND_API_KEY && !DRY_RUN) {
    console.error("Missing RESEND_API_KEY");
    process.exit(1);
  }

  const now = new Date();
  const customers = await prisma.customer.findMany();

  console.log(`Loaded customers: ${customers.length}`);

  let eligible = 0;
  let sent = 0;
  let skipped = 0;
  let failed = 0;
  let invalidEmailCount = 0;
  let duplicateEmailCount = 0;

  const seenEmails = new Set();

  for (const c of customers) {
    try {
      const email = normalizeEmail(c.email);

      // Basic email guard
      if (!email || !isValidEmail(email)) {
        invalidEmailCount++;
        skipped++;
        if (c.email) console.warn(`Skipping invalid email: ${c.email}`);
        continue;
      }

      // De-duplicate recipients in same run
      if (seenEmails.has(email)) {
        duplicateEmailCount++;
        skipped++;
        continue;
      }
      seenEmails.add(email);

      if (isUnsubscribed(c)) {
        skipped++;
        continue;
      }

      if (isLikelySubscribed(c)) {
        skipped++;
        continue;
      }

      const trialEndsAt = toDateSafe(c.trialEndsAt);
      if (trialEndsAt && now > trialEndsAt) {
        skipped++;
        continue;
      }

      const day = getTrialDay(c, now);
      if (day < 1 || day > 7) {
        skipped++;
        continue;
      }

      if (alreadySentTonight(c, now)) {
        skipped++;
        continue;
      }

      eligible++;

      const activateUrl = `${APP_URL.replace(/\/$/, "")}/get-started?email=${encodeURIComponent(
        email
      )}`;

      const { subject, html, text } = buildEmail({
        firstName: c.firstName || "",
        day,
        activateUrl,
      });

      await sendResendEmail({
        to: email,
        subject,
        html,
        text,
      });

      // Optional progress fields update (only if fields exist in schema)
      if (!DRY_RUN && c.id != null) {
        const data = {};

        if (hasField(c, "lastNightlySentAt")) {
          data.lastNightlySentAt = now;
        }

        if (hasField(c, "nightlySequenceDay")) {
          const current = Number(c.nightlySequenceDay || day);
          data.nightlySequenceDay = Math.min(current + 1, 7);
        }

        if (Object.keys(data).length > 0) {
          await prisma.customer.update({
            where: { id: c.id },
            data,
          });
        }
      }

      sent++;
      console.log(`Sent day ${day} to ${email}`);

      // Throttle for Resend 2 req/sec limit
      if (!DRY_RUN) {
        await sleep(SEND_GAP_MS);
      }
    } catch (err) {
      failed++;
      console.error(`Failed for ${c.email}:`, err?.message || err);
    }
  }

  console.log(
    `Nightly trial sequence complete | eligible=${eligible} sent=${sent} skipped=${skipped} failed=${failed} invalidEmails=${invalidEmailCount} duplicates=${duplicateEmailCount}`
  );

  process.exit(0);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
