// backend/jobs/sendDigestMwf.js
import "dotenv/config";
import crypto from "crypto";
import { PrismaClient } from "@prisma/client";
import { Resend } from "resend";

const prisma = new PrismaClient();

function isMwf(date = new Date()) {
  const d = date.getDay(); // 0 Sun, 1 Mon, 2 Tue, 3 Wed, 4 Thu, 5 Fri, 6 Sat
  return d === 1 || d === 3 || d === 5;
}

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

// Supports both shapes:
// 1) [ {title, location, ...}, ... ]
// 2) [ {score, opportunity: {title, location, ...}}, ... ]
function normalizeMatches(raw) {
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

function buildHtml({ customerId, email, matches, appUrl, signupUrl, unsubscribeUrl, companyAddress, supportEmail }) {
  const header = `
    <div style="font-family:Arial,sans-serif;line-height:1.5">
      <h2 style="margin:0 0 10px">AMBIT Matches Digest</h2>
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

  const max = Number(process.env.DIGEST_MAX_MATCHES || 10);

  const cards = matches.slice(0, max).map((m) => {
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
              ? `<a href="${url}" target="_blank" style="color:#111;text-decoration:none">${safe(title)}</a>`
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
  }).join("");

  return `
    ${header}
    <p style="margin:0 0 12px">Here are your latest matches:</p>
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

async function main() {
  if (!isMwf()) {
    console.log("Not Mon/Wed/Fri — skipping digest.");
    return;
  }

  const FROM = process.env.EMAIL_FROM;                 // e.g. "AMBIT <ambit@sevrixgov.com>"
  const BACKEND_URL = process.env.BACKEND_URL;         // e.g. https://ambit-0dnp.onrender.com
  const APP_URL = process.env.FRONTEND_URL || "https://ambitco.app";

  // Where users sign up (Resend cares about this)
  const SIGNUP_URL = process.env.SIGNUP_URL || `${APP_URL}/get-started`;

  // Unsubscribe endpoint lives on backend (we’ll add it below)
  const UNSUB_BASE = process.env.UNSUBSCRIBE_BASE_URL || `${BACKEND_URL}/public/unsubscribe`;

  // CAN-SPAM style footer address (set this in env)
  const COMPANY_ADDRESS = process.env.COMPANY_ADDRESS || "Sevrix LLC";
  const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL || "ambit@sevrixgov.com";

  if (!process.env.RESEND_API_KEY) throw new Error("Missing RESEND_API_KEY");
  if (!process.env.UNSUBSCRIBE_SECRET) throw new Error("Missing UNSUBSCRIBE_SECRET");
  if (!FROM) throw new Error("Missing EMAIL_FROM");
  if (!BACKEND_URL) throw new Error("Missing BACKEND_URL");
  if (!process.env.DATABASE_URL) throw new Error("Missing DATABASE_URL");

  const resend = new Resend(process.env.RESEND_API_KEY);

  const customers = await prisma.customer.findMany({
    where: { isActive: true },
    select: { id: true, email: true },
  });

  console.log(`Active customers: ${customers.length}`);
  console.log(`Using FROM: ${FROM}`);

  for (const c of customers) {
    try {
      const resp = await fetch(`${BACKEND_URL}/engine/matches/${c.id}`);
      if (!resp.ok) {
        console.error(`Matches fetch failed for customer ${c.id}: ${resp.status}`);
        continue;
      }

      const raw = await resp.json();
      const matches = normalizeMatches(raw);
      const hasMatches = matches.length > 0;

      const subject = hasMatches
        ? `AMBIT Matches Digest — ${new Date().toLocaleDateString("en-US")}`
        : `AMBIT Matches Digest — No new solicitations`;

      // Secure unsubscribe link
      const ts = Date.now().toString();
      const sig = signUnsub(c.email, ts, process.env.UNSUBSCRIBE_SECRET);
      const unsubscribeUrl =
        `${UNSUB_BASE}?email=${encodeURIComponent(c.email)}&ts=${encodeURIComponent(ts)}&sig=${encodeURIComponent(sig)}`;

      const text = hasMatches
        ? `AMBIT Matches Digest\n\nCustomer ID: ${c.id}\nRegistered Email: ${c.email}\n\nYou have ${matches.length} match(es).\nOpen AMBIT: ${APP_URL}\n\nUnsubscribe: ${unsubscribeUrl}\nReason: You signed up for AMBIT alerts at ${SIGNUP_URL}\n`
        : `AMBIT Matches Digest\n\nCustomer ID: ${c.id}\nRegistered Email: ${c.email}\n\n${NO_MATCHES_TEXT}\nOpen AMBIT: ${APP_URL}\n\nUnsubscribe: ${unsubscribeUrl}\nReason: You signed up for AMBIT alerts at ${SIGNUP_URL}\n`;

      const html = buildHtml({
        customerId: c.id,
        email: c.email,
        matches,
        appUrl: APP_URL,
        signupUrl: SIGNUP_URL,
        unsubscribeUrl,
        companyAddress: COMPANY_ADDRESS,
        supportEmail: SUPPORT_EMAIL,
      });

      const { data, error } = await resend.emails.send({
        from: FROM,
        to: c.email,
        subject,
        text,
        html,
      });

      if (error) {
        console.error(`❌ Resend error for ${c.email}:`, error);
        continue;
      }

      console.log(`✅ Resend accepted: ${c.email} (id=${data?.id || "n/a"})`);
    } catch (err) {
      console.error(`Digest failed for customer ${c.id}:`, err?.message || err);
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
