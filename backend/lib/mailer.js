// backend/lib/mailer.js
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const EMAIL_FROM =
  process.env.EMAIL_FROM ||
  process.env.RESEND_FROM ||
  "AMBIT <ambit@sevrixgov.com>";

const APP_URL =
  process.env.APP_URL ||
  process.env.FRONTEND_URL ||
  process.env.NEXT_PUBLIC_FRONTEND_URL ||
  "https://www.ambitco.app/login";

async function sendMail({ to, subject, text, html }) {
  if (!RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY missing on backend env vars.");
  }
  if (!to) throw new Error("sendMail: missing 'to'");
  if (!subject) throw new Error("sendMail: missing 'subject'");
  if (!text && !html) throw new Error("sendMail: provide 'text' or 'html'");

  const resp = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: EMAIL_FROM,
      to: Array.isArray(to) ? to : [to],
      subject,
      text,
      html,
    }),
  });

  const data = await resp.json().catch(() => ({}));

  if (!resp.ok) {
    const msg =
      data?.message ||
      data?.error ||
      `Resend error: HTTP ${resp.status}`;
    throw new Error(msg);
  }

  return data;
}

// ✅ Welcome email
export async function sendWelcomeEmail({ to, companyName }) {
  const name = (companyName || "").trim() || "there";
  const subject = "Welcome to AMBIT — your 7-day trial is live";

  const text = `Hey ${name},

Welcome to AMBIT — your 7-day free trial is active.

Log in here:
${APP_URL}

If you need anything, just reply to this email.

— AMBIT`;

  return sendMail({ to, subject, text });
}

// ✅ Generic helper (if your digest/job already calls sendMail directly)
export { sendMail };

// ✅ Optional alias in case other code calls this name
export async function sendDigestEmail({ to, subject, text, html }) {
  return sendMail({ to, subject, text, html });
}
