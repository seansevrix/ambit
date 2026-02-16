// backend/jobs/sendDigestMwf.js
// DAILY digest job (QUIET MODE + TRIAL-ENDED NUDGE):
// - Runs every day (cron controls schedule)
// - If customer is ACTIVE:
//    - Sends ONLY when there is a NEW match (top 1)
//    - If NO new matches: sends NO_MATCHES_TEXT only once every X days
// - If customer is TRIAL ACTIVE (no-CC trial):
//    - Sends DAILY (even if no new match)
// - If customer is NOT active AND TRIAL ENDED:
//    - Sends DAILY "Finish signing up to receive more matches" email (NO match details)
// - Prevents double-send on the same day (uses DigestLog if available; otherwise DigestEmail)

import "dotenv/config";
import crypto from "crypto";
import { PrismaClient } from "@prisma/client";
import { Resend } from "resend";
import { renderMorningMatchesV2 } from "../lib/emailTemplates/morningMatchesV2.js";

const prisma = new PrismaClient();

const NO_MATCHES_TEXT =
  "No new solicitations were identified today; however, this is a normal fluctuation in the procurement cycle. There are approximately 800 to 1,200 notices daily, contributing to an annual spend of over $750 billion. We are maintaining our daily search to ensure we capture the next relevant opportunity as soon as it is published.";

function safe(v) {
  return (v ?? "").toString();
}

function pick(obj, keys) {
  for (const k of keys) {
    if (obj && obj[k] != null && obj[k] !== "") return obj[k];
  }
  return null;
}

function extractMatches(payload) {
  const raw = Array.isArray(payload) ? payload : payload?.matches;
  if (!Array.isArray(raw)) return [];
  return raw
    .map((m) => (m && typeof m === "object" && m.opportunity ? m.opportunity : m))
    .filter(Boolean);
}

function signUnsub(email, ts, secret) {
  const base = `${email}|${ts}`;
  return crypto.createHmac("sha256", secret).update(base).digest("hex");
}

function mapMatchForTemplate(m) {
  return {
    title: pick(m, ["title", "opportunityTitle", "name"]) || "Untitled",
    location: pick(m, ["location", "place", "cityState"]) || "—",
    naics: pick(m, ["naics", "naicsCode"]) || "—",
    noticeType: pick(m, ["noticeType", "type", "solicitationType"]) || "Contract opportunity",
    dueDate: pick(m, ["dueDate", "responseDueDate", "deadline"]),
    // Intentionally not used as clickable opportunity link in template flow
    url: pick(m, ["url", "link", "samUrl"]) || "",
    score: pick(m, ["matchScore", "score"]) || 3,
  };
}

function guessNameFromEmail(email) {
  const raw = safe(email).split("@")[0] || "";
  if (!raw) return "there";
  return raw.charAt(0).toUpperCase() + raw.slice(1);
}

function buildFooterHtml({ companyAddress, supportEmail }) {
  return `
    <hr style="border:none;border-top:1px solid #eee;margin:18px 0" />
    <div style="color:#666;font-size:12px;line-height:1.5">
      <div style="margin-bottom:6px">
        You’re receiving this email because you signed up for AMBIT alerts.
      </div>
      <div style="margin-bottom:6px">
        To improve delivery: add <strong>${safe(supportEmail)}</strong> to your contacts and mark this email as “Not spam”.
      </div>
      <div>${safe(companyAddress)}</div>
    </div>
  `;
}

// Digest HTML:
// - If there is a match => use morningMatchesV2 template (TOP MATCH ONLY)
// - If no match => simple no-match body with only one CTA link
function buildHtml({
  email,
  matches,
  viewMatchesUrl,
  companyAddress,
  supportEmail,
  logoUrl,
  tagline,
}) {
  if (!matches || matches.length === 0) {
    const footer = buildFooterHtml({ companyAddress, supportEmail });

    return `
      <div style="font-family:Inter,Segoe UI,Arial,sans-serif;line-height:1.5;background:#f3f4f6;padding:24px">
        <div style="max-width:640px;margin:0 auto;background:#fff;border-radius:12px;padding:24px">
          <h2 style="margin:0 0 10px;color:#0f172a">AMBIT Daily Match</h2>
          <div style="color:#334155;margin-bottom:14px">
            <div><strong>Registered Email:</strong> ${safe(email)}</div>
          </div>
          <p style="margin:0 0 14px;color:#0f172a">${NO_MATCHES_TEXT}</p>
          <p style="margin:18px 0 0">
            <a href="${safe(viewMatchesUrl)}" target="_blank"
               style="display:inline-block;background:#2563eb;color:#fff;padding:11px 16px;border-radius:10px;text-decoration:none;font-weight:700">
              View My Matches
            </a>
          </p>
          <p style="margin:12px 0 0;color:#64748b;font-size:14px">
            Reach out to ambit@sevrixgov.com to be connected with an AMBIT Associate for next steps.
          </p>
          ${footer}
        </div>
      </div>
    `;
  }

  // TOP MATCH ONLY
  const topMatch = matches[0];
  const mappedTop = [mapMatchForTemplate(topMatch)];

  return renderMorningMatchesV2({
    customerName: guessNameFromEmail(email),
    matches: mappedTop, // <= exactly one
    viewMatchesUrl, // <= only CTA link in template
    logoUrl,
    tagline,
    addressLine: companyAddress,
    previewText: "Your AMBIT top match is ready.",
  });
}

// Trial-ended email (NO match details) with one CTA
function buildUpsellHtml({
  email,
  viewMatchesUrl,
  companyAddress,
  supportEmail,
}) {
  const footer = buildFooterHtml({ companyAddress, supportEmail });

  return `
    <div style="font-family:Inter,Segoe UI,Arial,sans-serif;line-height:1.5;background:#f3f4f6;padding:24px">
      <div style="max-width:640px;margin:0 auto;background:#fff;border-radius:12px;padding:24px">
        <h2 style="margin:0 0 10px;color:#0f172a">Finish signing up to receive more matches</h2>
        <div style="color:#334155;margin-bottom:14px">
          <div><strong>Registered Email:</strong> ${safe(email)}</div>
        </div>

        <p style="margin:0 0 12px;color:#0f172a">
          Your trial period ended, so daily match delivery is paused.
        </p>

        <p style="margin:0 0 14px;color:#0f172a">
          Finish signing up to resume daily matched opportunities in your inbox.
        </p>

        <p style="margin:18px 0 0">
          <a href="${safe(viewMatchesUrl)}" target="_blank"
             style="display:inline-block;background:#2563eb;color:#fff;padding:11px 16px;border-radius:10px;text-decoration:none;font-weight:700">
            View My Matches
          </a>
        </p>

        <p style="margin:12px 0 0;color:#64748b;font-size:14px">
          Reach out to ambit@sevrixgov.com to be connected with an AMBIT Associate for next steps.
        </p>

        ${footer}
      </div>
    </div>
  `;
}

function isoDayKeyUTC(d = new Date()) {
  return d.toISOString().slice(0, 10);
}

function normalizeStr(s) {
  return String(s || "").trim().toLowerCase();
}

function normUrl(u) {
  return normalizeStr(u).replace(/\/+$/, "");
}

function hashKey(s) {
  return crypto.createHash("sha256").update(String(s)).digest("hex");
}

function daysBetween(a, b) {
  const ms = Math.abs(b.getTime() - a.getTime());
  return ms / (1000 * 60 * 60 * 24);
}

/**
 * Match key:
 * - Prefer URL if present (stable across sources)
 * - Else fallback on title|location|naics|postedDate
 */
function buildMatchKey(m) {
  const url = normUrl(pick(m, ["url", "link", "samUrl"]));
  if (url) return `url:${url}`;

  const title = normalizeStr(pick(m, ["title", "opportunityTitle", "name"]));
  const location = normalizeStr(pick(m, ["location", "place", "cityState"]));
  const naics = normalizeStr(pick(m, ["naics", "naicsCode"]));
  const postedRaw = pick(m, ["postedDate", "postedAt", "createdAt"]);
  const posted = postedRaw ? isoDayKeyUTC(new Date(postedRaw)) : "na";

  return `fb:${title}|${location}|${naics}|${posted}`;
}

function trialIsActive(trialEndsAt) {
  if (!trialEndsAt) return false;
  const t = new Date(trialEndsAt).getTime();
  return Number.isFinite(t) && t > Date.now();
}

function trialIsEnded(trialEndsAt) {
  if (!trialEndsAt) return false;
  const t = new Date(trialEndsAt).getTime();
  return Number.isFinite(t) && t <= Date.now();
}

function trialDayNumber(trialEndsAt, totalDays = 7) {
  if (!trialEndsAt) return null;
  const end = new Date(trialEndsAt).getTime();
  if (!Number.isFinite(end)) return null;
  const msRemaining = end - Date.now();
  const remaining = Math.ceil(msRemaining / (24 * 60 * 60 * 1000));
  const day = totalDays - remaining + 1;
  return Math.max(1, Math.min(totalDays, day));
}

function isLikelyAnonEmail(email) {
  const e = String(email || "").toLowerCase();
  if (!e) return true;
  if (e.endsWith("@ambit.local")) return true;
  if (!e.includes("@")) return true;
  return false;
}

async function main() {
  const FROM = process.env.EMAIL_FROM; // e.g. "AMBIT <ambit@sevrixgov.com>"
  const BACKEND_URL = process.env.BACKEND_URL; // e.g. https://ambit-0dnp.onrender.com
  const APP_URL = (process.env.FRONTEND_URL || "https://ambitco.app").replace(/\/$/, "");
  const VIEW_MATCHES_URL =
    (process.env.MORNING_MATCHES_VIEW_URL || "https://www.ambitco.app/login").replace(/\/$/, "");

  const UNSUB_BASE = process.env.UNSUBSCRIBE_BASE_URL || `${BACKEND_URL}/public/unsubscribe`;
  const COMPANY_ADDRESS = process.env.COMPANY_ADDRESS || "Sevrix LLC";
  const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL || "ambit@sevrixgov.com";

  // Branding/template controls
  const MORNING_MATCHES_LOGO_URL =
    process.env.MORNING_MATCHES_LOGO_URL || `${APP_URL}/branding/ambit-logo-email.jpeg`;
  const MORNING_MATCHES_TAGLINE =
    process.env.MORNING_MATCHES_TAGLINE || "Stop hunting. Start receiving.";

  const FETCH_LIMIT = Number(process.env.DIGEST_FETCH_LIMIT || 50);
  const DEDUPE_DAYS = Number(process.env.DIGEST_DEDUPE_DAYS || 60);
  const NO_MATCH_COOLDOWN_DAYS = Number(process.env.NO_MATCH_COOLDOWN_DAYS || 7);

  if (!process.env.RESEND_API_KEY) throw new Error("Missing RESEND_API_KEY");
  if (!process.env.UNSUBSCRIBE_SECRET) throw new Error("Missing UNSUBSCRIBE_SECRET");
  if (!FROM) throw new Error("Missing EMAIL_FROM");
  if (!BACKEND_URL) throw new Error("Missing BACKEND_URL");
  if (!process.env.DATABASE_URL) throw new Error("Missing DATABASE_URL");

  const resend = new Resend(process.env.RESEND_API_KEY);

  // DigestLog exists in your schema; this is still safe.
  const hasDigestLog = !!prisma.digestLog;

  // Include trial customers too
  const customers = await prisma.customer.findMany({
    where: { digestEnabled: true },
    select: { id: true, email: true, isActive: true, trialEndsAt: true },
  });

  const todayKey = isoDayKeyUTC(new Date());
  const since = new Date(Date.now() - DEDUPE_DAYS * 24 * 60 * 60 * 1000);

  for (const c of customers) {
    const customerId = c.id;

    try {
      if (isLikelyAnonEmail(c.email)) continue;

      const isTrial = !c.isActive && trialIsActive(c.trialEndsAt);
      const trialDay = isTrial ? trialDayNumber(c.trialEndsAt, 7) : null;

      const accessAllowed = Boolean(c.isActive) || isTrial;
      const shouldUpsell = !c.isActive && trialIsEnded(c.trialEndsAt);

      // 0) Already emailed today?
      if (hasDigestLog) {
        const dayLogKey = `DAY:${customerId}:${todayKey}`;
        const dayLog = await prisma.digestLog.findUnique({
          where: { key: dayLogKey },
          select: { id: true },
        });
        if (dayLog) continue;
      } else {
        const existing = await prisma.digestEmail.findUnique({
          where: { customerId_digestDate: { customerId, digestDate: todayKey } },
          select: { status: true },
        });
        if (existing?.status === "sent") continue;
      }

      // 1) Trial ended -> DAILY “finish signup” email (no match details)
      if (shouldUpsell) {
        const ts = Date.now().toString();
        const sig = signUnsub(c.email, ts, process.env.UNSUBSCRIBE_SECRET);

        const unsubscribeUrl = `${UNSUB_BASE}?email=${encodeURIComponent(
          c.email
        )}&ts=${encodeURIComponent(ts)}&sig=${encodeURIComponent(sig)}`;

        const subject = "Finish signing up to receive more matches";
        const html = buildUpsellHtml({
          email: c.email,
          viewMatchesUrl: VIEW_MATCHES_URL,
          companyAddress: COMPANY_ADDRESS,
          supportEmail: SUPPORT_EMAIL,
        });

        const text = `Finish signing up to resume daily matched opportunities.\nView My Matches: ${VIEW_MATCHES_URL}`;

        const listUnsubscribeMailto = `mailto:${SUPPORT_EMAIL}?subject=unsubscribe`;
        const listUnsubscribeHttp = unsubscribeUrl;
        const listUnsubscribe = `<${listUnsubscribeHttp}>, <${listUnsubscribeMailto}>`;

        await prisma.digestEmail.upsert({
          where: { customerId_digestDate: { customerId, digestDate: todayKey } },
          create: { customerId, digestDate: todayKey, status: "running" },
          update: { status: "running" },
        });

        const { data, error } = await resend.emails.send({
          from: FROM,
          to: c.email,
          subject,
          text,
          html,
          headers: {
            "List-Unsubscribe": listUnsubscribe,
            "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
          },
        });

        if (error) {
          await prisma.digestEmail.update({
            where: { customerId_digestDate: { customerId, digestDate: todayKey } },
            data: { status: "failed", error: safe(error?.message || error) },
          });
          continue;
        }

        await prisma.digestEmail.update({
          where: { customerId_digestDate: { customerId, digestDate: todayKey } },
          data: {
            status: "sent",
            resendId: data?.id || null,
            matchKey: "TRIAL_ENDED_NUDGE",
            matchTitle: null,
            matchUrl: VIEW_MATCHES_URL,
          },
        });

        if (hasDigestLog) {
          try {
            await prisma.digestLog.createMany({
              data: [
                {
                  customerId,
                  type: "DAY",
                  key: `DAY:${customerId}:${todayKey}`,
                  meta: { date: todayKey, kind: "TRIAL_ENDED" },
                },
                {
                  customerId,
                  type: "UPSELL",
                  key: `UPSELL:${customerId}:${todayKey}`,
                  meta: { date: todayKey, viewMatchesUrl: VIEW_MATCHES_URL },
                },
              ],
            });
          } catch {}
        }

        continue;
      }

      // 2) Active or trial active -> normal digest logic
      if (!accessAllowed) continue;

      // 3) Fetch matches
      let allMatches = [];
      try {
        const resp = await fetch(`${BACKEND_URL}/engine/matches/${customerId}?limit=${FETCH_LIMIT}`);

        // If matches endpoint fails:
        // - ACTIVE: skip (avoid noise)
        // - TRIAL: still send a daily email (no-match content)
        if (!resp.ok) {
          if (!isTrial) continue;
          allMatches = [];
        } else {
          const payload = await resp.json();
          allMatches = extractMatches(payload);
        }
      } catch {
        if (!isTrial) continue;
        allMatches = [];
      }

      // 4) Load recently sent match keys (dedupe)
      let sentSet = new Set();

      if (hasDigestLog) {
        const sentLogs = await prisma.digestLog.findMany({
          where: { customerId, type: "MATCH", sentAt: { gte: since } },
          select: { meta: true },
        });
        for (const l of sentLogs) {
          const mk = l?.meta?.matchKey;
          if (mk) sentSet.add(mk);
        }
      } else {
        const sent = await prisma.digestEmail.findMany({
          where: {
            customerId,
            matchKey: { not: null },
            createdAt: { gte: since },
          },
          select: { matchKey: true },
        });
        sentSet = new Set(sent.map((x) => x.matchKey).filter(Boolean));
      }

      // 5) Pick the TOP "new" match
      let picked = null;
      let pickedKey = null;

      for (const m of allMatches) {
        const k = buildMatchKey(m);
        if (!sentSet.has(k)) {
          picked = m;
          pickedKey = k;
          break;
        }
      }

      const hasNewMatch = !!picked;

      // 6) If no new match: enforce cooldown (ACTIVE ONLY)
      // Trial users get a DAILY email during the 7-day trial.
      if (!hasNewMatch && !isTrial) {
        let lastNoMatchAt = null;

        if (hasDigestLog) {
          const lastNoMatch = await prisma.digestLog.findFirst({
            where: { customerId, type: "NO_MATCH" },
            orderBy: { sentAt: "desc" },
            select: { sentAt: true },
          });
          lastNoMatchAt = lastNoMatch?.sentAt || null;
        } else {
          const lastNoMatch = await prisma.digestEmail.findFirst({
            where: { customerId, status: "sent", matchKey: null },
            orderBy: { createdAt: "desc" },
            select: { createdAt: true },
          });
          lastNoMatchAt = lastNoMatch?.createdAt || null;
        }

        if (lastNoMatchAt) {
          const diffDays = daysBetween(new Date(lastNoMatchAt), new Date());
          if (diffDays < NO_MATCH_COOLDOWN_DAYS) continue;
        }
      }

      // 7) Send digest (match or allowed no-match)
      const matchesToSend = picked ? [picked] : []; // top-match only
      const titleForSubject =
        picked ? safe(pick(picked, ["title", "opportunityTitle", "name"])).slice(0, 70) : "";

      const subject = hasNewMatch
        ? `AMBIT — New match: ${titleForSubject || new Date().toLocaleDateString("en-US")}`
        : isTrial
        ? `AMBIT — Trial day ${trialDay || 1}/7`
        : `AMBIT — No new matches`;

      const ts = Date.now().toString();
      const sig = signUnsub(c.email, ts, process.env.UNSUBSCRIBE_SECRET);

      const unsubscribeUrl = `${UNSUB_BASE}?email=${encodeURIComponent(
        c.email
      )}&ts=${encodeURIComponent(ts)}&sig=${encodeURIComponent(sig)}`;

      const text = hasNewMatch
        ? `AMBIT Daily Match\n\nYou have 1 new top match.\nView My Matches: ${VIEW_MATCHES_URL}`
        : `AMBIT Daily Match\n\n${NO_MATCHES_TEXT}\nView My Matches: ${VIEW_MATCHES_URL}`;

      const html = buildHtml({
        email: c.email,
        matches: matchesToSend,
        viewMatchesUrl: VIEW_MATCHES_URL,
        companyAddress: COMPANY_ADDRESS,
        supportEmail: SUPPORT_EMAIL,
        logoUrl: MORNING_MATCHES_LOGO_URL,
        tagline: MORNING_MATCHES_TAGLINE,
      });

      const listUnsubscribeMailto = `mailto:${SUPPORT_EMAIL}?subject=unsubscribe`;
      const listUnsubscribeHttp = unsubscribeUrl;
      const listUnsubscribe = `<${listUnsubscribeHttp}>, <${listUnsubscribeMailto}>`;

      await prisma.digestEmail.upsert({
        where: { customerId_digestDate: { customerId, digestDate: todayKey } },
        create: { customerId, digestDate: todayKey, status: "running" },
        update: { status: "running" },
      });

      const { data, error } = await resend.emails.send({
        from: FROM,
        to: c.email,
        subject,
        text,
        html,
        headers: {
          "List-Unsubscribe": listUnsubscribe,
          "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
        },
      });

      if (error) {
        await prisma.digestEmail.update({
          where: { customerId_digestDate: { customerId, digestDate: todayKey } },
          data: { status: "failed", error: safe(error?.message || error) },
        });
        continue;
      }

      await prisma.digestEmail.update({
        where: { customerId_digestDate: { customerId, digestDate: todayKey } },
        data: {
          status: "sent",
          resendId: data?.id || null,
          matchKey: pickedKey,
          matchTitle: picked ? safe(pick(picked, ["title", "opportunityTitle", "name"])) : null,
          matchUrl: picked ? safe(pick(picked, ["url", "link", "samUrl"])) : null,
        },
      });

      if (hasDigestLog) {
        const dayLogKey = `DAY:${customerId}:${todayKey}`;

        const rows = [
          {
            customerId,
            type: "DAY",
            key: dayLogKey,
            meta: { date: todayKey, kind: hasNewMatch ? "MATCH" : "NO_MATCH", trial: isTrial },
          },
        ];

        if (hasNewMatch) {
          rows.push({
            customerId,
            type: "MATCH",
            key: `MATCH:${customerId}:${hashKey(pickedKey)}`,
            meta: {
              matchKey: pickedKey,
              title: safe(pick(picked, ["title", "opportunityTitle", "name"])) || null,
              url: safe(pick(picked, ["url", "link", "samUrl"])) || null,
            },
          });
        } else {
          rows.push({
            customerId,
            type: "NO_MATCH",
            key: `NO_MATCH:${customerId}:${todayKey}`,
            meta: { date: todayKey, trial: isTrial },
          });
        }

        try {
          await prisma.digestLog.createMany({ data: rows });
        } catch {}
      }
    } catch (err) {
      console.error(`Digest failed for customer ${customerId}:`, err?.message || err);
      try {
        await prisma.digestEmail.update({
          where: { customerId_digestDate: { customerId, digestDate: todayKey } },
          data: { status: "failed", error: safe(err?.message || err) },
        });
      } catch {}
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
