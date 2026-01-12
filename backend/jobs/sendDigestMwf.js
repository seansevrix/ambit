// backend/jobs/sendDigestMwf.js
// DAILY digest job (QUIET MODE):
// - Runs every day (cron controls schedule)
// - Sends ONLY when there is a NEW match (top 1)
// - If there are NO new matches, sends the NO_MATCHES_TEXT only once every X days
// - Prevents double-send on the same day (uses DigestLog if available; otherwise DigestEmail)

import "dotenv/config";
import crypto from "crypto";
import { PrismaClient } from "@prisma/client";
import { Resend } from "resend";

const prisma = new PrismaClient();

const NO_MATCHES_TEXT =
  "No new solicitations were identified today; however, this is a normal fluctuation in the procurement cycle. There are approximately 800 to 1,200 notices daily, contributing to an annual spend of over $750 billion. We are maintaining our daily search to ensure we capture the next relevant opportunity as soon as it is published.";

function safe(v) {
  return (v ?? "").toString();
}

function fmtDate(v) {
  if (!v) return "—";
  try {
    const d = new Date(v);
    return isNaN(d.getTime()) ? safe(v) : d.toLocaleDateString("en-US");
  } catch {
    return safe(v);
  }
}

function pick(obj, keys) {
  for (const k of keys) {
    if (obj && obj[k] != null && obj[k] !== "") return obj[k];
  }
  return null;
}

// Supports payload shapes:
// A) { matches: [...] }
// B) array itself
// Also supports entries shaped like { opportunity: {...} }
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

function buildFooterHtml({ signupUrl, unsubscribeUrl, companyAddress, supportEmail }) {
  return `
    <hr style="border:none;border-top:1px solid #eee;margin:18px 0" />
    <div style="color:#666;font-size:12px;line-height:1.5">
      <div style="margin-bottom:6px">
        You’re receiving this email because you signed up for AMBIT alerts at
        <a href="${signupUrl}" target="_blank" style="color:#111">${signupUrl}</a>.
      </div>
      <div style="margin-bottom:6px">
        To improve delivery: add <strong>${supportEmail}</strong> to your contacts and mark this email as “Not spam”.
      </div>
      <div style="margin-bottom:6px">
        <a href="${unsubscribeUrl}" target="_blank" style="color:#111">Unsubscribe</a>
        &nbsp;•&nbsp;
        <a href="${signupUrl}" target="_blank" style="color:#111">Manage preferences</a>
      </div>
      <div>${safe(companyAddress)}</div>
    </div>
  `;
}

function buildHtml({
  customerId,
  email,
  matches,
  appUrl,
  signupUrl,
  unsubscribeUrl,
  companyAddress,
  supportEmail,
}) {
  const header = `
    <div style="font-family:Arial,sans-serif;line-height:1.5">
      <h2 style="margin:0 0 10px">AMBIT Daily Match</h2>
      <div style="color:#444;margin-bottom:14px">
        <div><strong>Customer ID:</strong> ${customerId}</div>
        <div><strong>Registered Email:</strong> ${email}</div>
      </div>
  `;

  const footer = buildFooterHtml({ signupUrl, unsubscribeUrl, companyAddress, supportEmail });

  if (!matches || matches.length === 0) {
    return `
      ${header}
      <p style="margin:0 0 12px">${NO_MATCHES_TEXT}</p>
      <p style="margin:16px 0 0">
        <a href="${appUrl}" target="_blank"
           style="display:inline-block;padding:10px 14px;border-radius:10px;text-decoration:none;border:1px solid #111">
          Open AMBIT
        </a>
      </p>
      ${footer}
    </div>
    `;
  }

  // "top match once a day" -> default 1
  const max = Number(process.env.DIGEST_MAX_MATCHES || 1);

  const cards = matches
    .slice(0, max)
    .map((m) => {
      const title = pick(m, ["title", "opportunityTitle", "name"]) || "Untitled";
      const location = pick(m, ["location", "place", "cityState"]) || "—";
      const naics = pick(m, ["naics", "naicsCode"]) || "—";
      const url = pick(m, ["url", "link", "samUrl"]);
      const posted = fmtDate(pick(m, ["postedDate", "postedAt", "createdAt"]));
      const due = fmtDate(pick(m, ["dueDate", "responseDueDate", "deadline"]));
      const value = pick(m, ["value", "estimatedValue", "amount"]);
      const summary = pick(m, ["summary", "shortSummary", "description"]);

      return `
        <div style="padding:12px;border:1px solid #eee;border-radius:12px;margin-bottom:10px">
          <div style="font-weight:700;margin-bottom:6px">
            ${
              url
                ? `<a href="${url}" target="_blank" style="color:#111;text-decoration:none">${safe(
                    title
                  )}</a>`
                : safe(title)
            }
          </div>
          <div style="color:#444;font-size:14px">
            <div><strong>Location:</strong> ${safe(location)}</div>
            <div><strong>NAICS:</strong> ${safe(naics)}</div>
            <div><strong>Posted:</strong> ${posted}</div>
            <div><strong>Due:</strong> ${due}</div>
            ${value ? `<div><strong>Est. Value:</strong> ${safe(value)}</div>` : ``}
          </div>
          ${
            summary
              ? `<p style="margin:8px 0 0;color:#333">${safe(summary).slice(0, 400)}${
                  safe(summary).length > 400 ? "…" : ""
                }</p>`
              : ``
          }
        </div>
      `;
    })
    .join("");

  return `
    ${header}
    <p style="margin:0 0 12px">Here is your top match for today:</p>
    ${cards}
    <p style="margin:16px 0 0">
      <a href="${appUrl}" target="_blank"
         style="display:inline-block;padding:10px 14px;border-radius:10px;text-decoration:none;border:1px solid #111">
        View all matches
      </a>
    </p>
    ${footer}
  </div>
  `;
}

// ---------- "new match" logic (dedupe) ----------

function isoDayKeyUTC(d = new Date()) {
  // "YYYY-MM-DD" UTC
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

async function main() {
  const FROM = process.env.EMAIL_FROM; // e.g. "AMBIT <ambit@sevrixgov.com>"
  const BACKEND_URL = process.env.BACKEND_URL; // e.g. https://ambit-0dnp.onrender.com
  const APP_URL = process.env.FRONTEND_URL || "https://ambitco.app";

  const SIGNUP_URL = process.env.SIGNUP_URL || `${APP_URL}/get-started`;
  const UNSUB_BASE = process.env.UNSUBSCRIBE_BASE_URL || `${BACKEND_URL}/public/unsubscribe`;

  const COMPANY_ADDRESS = process.env.COMPANY_ADDRESS || "Sevrix LLC";
  const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL || "ambit@sevrixgov.com";

  const FETCH_LIMIT = Number(process.env.DIGEST_FETCH_LIMIT || 50); // fetch more to find a "new" one
  const DEDUPE_DAYS = Number(process.env.DIGEST_DEDUPE_DAYS || 60);  // how far back to remember sent matches

  // ✅ Quiet mode knob (no-match email only once every X days)
  const NO_MATCH_COOLDOWN_DAYS = Number(process.env.NO_MATCH_COOLDOWN_DAYS || 7);

  if (!process.env.RESEND_API_KEY) throw new Error("Missing RESEND_API_KEY");
  if (!process.env.UNSUBSCRIBE_SECRET) throw new Error("Missing UNSUBSCRIBE_SECRET");
  if (!FROM) throw new Error("Missing EMAIL_FROM");
  if (!BACKEND_URL) throw new Error("Missing BACKEND_URL");
  if (!process.env.DATABASE_URL) throw new Error("Missing DATABASE_URL");

  const resend = new Resend(process.env.RESEND_API_KEY);

  // If you added DigestLog model, Prisma client will have prisma.digestLog at runtime.
  const hasDigestLog = !!prisma.digestLog;

  // ✅ Only email customers who are active AND have digest enabled
  const customers = await prisma.customer.findMany({
    where: { isActive: true, digestEnabled: true },
    select: { id: true, email: true },
  });

  console.log(`Active customers (digest enabled): ${customers.length}`);
  console.log(`Using FROM: ${FROM}`);
  console.log(`Quiet mode: NO_MATCH_COOLDOWN_DAYS=${NO_MATCH_COOLDOWN_DAYS}`);
  console.log(`Using DigestLog: ${hasDigestLog ? "YES" : "NO (fallback to DigestEmail)"}`);

  const todayKey = isoDayKeyUTC(new Date());
  const since = new Date(Date.now() - DEDUPE_DAYS * 24 * 60 * 60 * 1000);

  for (const c of customers) {
    const customerId = c.id;

    try {
      // 0) Already emailed today? (only counts if we actually SENT something)
      if (hasDigestLog) {
        const dayLogKey = `DAY:${customerId}:${todayKey}`;
        const dayLog = await prisma.digestLog.findUnique({
          where: { key: dayLogKey },
          select: { id: true },
        });
        if (dayLog) {
          console.log(`Already sent today (DigestLog) for customer ${customerId} — skipping.`);
          continue;
        }
      } else {
        const existing = await prisma.digestEmail.findUnique({
          where: { customerId_digestDate: { customerId, digestDate: todayKey } },
          select: { status: true },
        });
        if (existing?.status === "sent") {
          console.log(`Already sent today (DigestEmail) for customer ${customerId} — skipping.`);
          continue;
        }
      }

      // 1) Fetch matches
      const resp = await fetch(`${BACKEND_URL}/engine/matches/${customerId}?limit=${FETCH_LIMIT}`);
      if (!resp.ok) {
        console.error(`Matches fetch failed for customer ${customerId}: ${resp.status}`);

        // If a DigestEmail row exists (from older runs), mark failed, otherwise ignore
        try {
          await prisma.digestEmail.update({
            where: { customerId_digestDate: { customerId, digestDate: todayKey } },
            data: { status: "failed", error: `matches_fetch_${resp.status}` },
          });
        } catch {}
        continue;
      }

      const payload = await resp.json();
      const allMatches = extractMatches(payload);

      // 2) Load recently sent match keys (dedupe)
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

      // 3) Pick the TOP "new" match (first unsent)
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

      // 4) If no new match: enforce cooldown
      if (!hasNewMatch) {
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
          if (diffDays < NO_MATCH_COOLDOWN_DAYS) {
            console.log(
              `Quiet mode: no-match cooldown active for customer ${customerId} (${diffDays.toFixed(
                1
              )}d < ${NO_MATCH_COOLDOWN_DAYS}d). Skipping email.`
            );
            continue; // ✅ do not send anything
          }
        }
      }

      // 5) Build email (either match or (allowed) no-match)
      const matchesToSend = picked ? [picked] : [];

      const titleForSubject =
        picked ? safe(pick(picked, ["title", "opportunityTitle", "name"])).slice(0, 70) : "";

      const subject = hasNewMatch
        ? `AMBIT — New match: ${titleForSubject || new Date().toLocaleDateString("en-US")}`
        : `AMBIT — No new matches`;

      const ts = Date.now().toString();
      const sig = signUnsub(c.email, ts, process.env.UNSUBSCRIBE_SECRET);

      const unsubscribeUrl = `${UNSUB_BASE}?email=${encodeURIComponent(
        c.email
      )}&ts=${encodeURIComponent(ts)}&sig=${encodeURIComponent(sig)}`;

      const text = hasNewMatch
        ? `AMBIT Daily Match\n\nCustomer ID: ${customerId}\nRegistered Email: ${c.email}\n\nYou have 1 new top match.\nOpen AMBIT: ${APP_URL}\n\nUnsubscribe: ${unsubscribeUrl}\nReason: You signed up for AMBIT alerts at ${SIGNUP_URL}\n`
        : `AMBIT Daily Match\n\nCustomer ID: ${customerId}\nRegistered Email: ${c.email}\n\n${NO_MATCHES_TEXT}\nOpen AMBIT: ${APP_URL}\n\nUnsubscribe: ${unsubscribeUrl}\nReason: You signed up for AMBIT alerts at ${SIGNUP_URL}\n`;

      const html = buildHtml({
        customerId,
        email: c.email,
        matches: matchesToSend,
        appUrl: APP_URL,
        signupUrl: SIGNUP_URL,
        unsubscribeUrl,
        companyAddress: COMPANY_ADDRESS,
        supportEmail: SUPPORT_EMAIL,
      });

      const listUnsubscribeMailto = `mailto:${SUPPORT_EMAIL}?subject=unsubscribe`;
      const listUnsubscribeHttp = unsubscribeUrl;
      const listUnsubscribe = `<${listUnsubscribeHttp}>, <${listUnsubscribeMailto}>`;

      // 6) Create "running" record only when we are about to send
      // (prevents "running" rows on cooldown skips)
      await prisma.digestEmail.upsert({
        where: { customerId_digestDate: { customerId, digestDate: todayKey } },
        create: { customerId, digestDate: todayKey, status: "running" },
        update: { status: "running" },
      });

      // 7) Send
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
        console.error(`❌ Resend error for ${c.email}:`, error);
        await prisma.digestEmail.update({
          where: { customerId_digestDate: { customerId, digestDate: todayKey } },
          data: { status: "failed", error: safe(error?.message || error) },
        });
        continue;
      }

      // 8) Mark sent + store match key/title/url (matchKey null means no-match email)
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

      // 9) Also write DigestLog entries if available (for quiet mode auditing)
      if (hasDigestLog) {
        const dayLogKey = `DAY:${customerId}:${todayKey}`;

        const rows = [
          {
            customerId,
            type: "DAY",
            key: dayLogKey,
            meta: { date: todayKey, kind: hasNewMatch ? "MATCH" : "NO_MATCH" },
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
            meta: { date: todayKey },
          });
        }

        try {
          await prisma.digestLog.createMany({ data: rows });
        } catch (e) {
          // If createMany fails due to unique collisions, it just means we already logged it.
          console.warn(`[digest] digestLog createMany warning: ${e?.message || e}`);
        }
      }

      console.log(
        `✅ Sent: ${c.email} (${hasNewMatch ? "NEW MATCH" : "NO MATCH"}; resendId=${data?.id || "n/a"})`
      );
    } catch (err) {
      console.error(`Digest failed for customer ${customerId}:`, err?.message || err);
      try {
        await prisma.digestEmail.update({
          where: { customerId_digestDate: { customerId, digestDate: todayKey } },
          data: { status: "failed", error: safe(err?.message || err) },
        });
      } catch {
        // ignore
      }
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
