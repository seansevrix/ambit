// backend/lib/mailer.js
import nodemailer from "nodemailer";

let cachedTransporter = null;

function must(name) {
  const v = process.env[name];
  return v && String(v).trim() ? String(v).trim() : null;
}

function getTransporter() {
  if (cachedTransporter) return cachedTransporter;

  const host = must("SMTP_HOST");
  const port = must("SMTP_PORT");
  const secure = (process.env.SMTP_SECURE || "true").toLowerCase() === "true";
  const user = must("SMTP_USER");
  const pass = must("SMTP_PASS");

  if (!host || !port || !user || !pass) {
    throw new Error(
      `SMTP env vars missing. Need SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS (and optionally SMTP_SECURE).`
    );
  }

  cachedTransporter = nodemailer.createTransport({
    host,
    port: Number(port),
    secure, // true for 465
    auth: { user, pass },
  });

  return cachedTransporter;
}

export async function sendMail({ to, subject, text, html }) {
  const transporter = getTransporter();

  const from = (process.env.MAIL_FROM || process.env.SMTP_USER || "").trim();
  if (!from) throw new Error("MAIL_FROM or SMTP_USER must be set");

  // Optional: verify once at runtime (fast enough, but you can remove if you want)
  await transporter.verify();

  return transporter.sendMail({
    from,
    to,
    subject,
    text,
    ...(html ? { html } : {}),
  });
}

export async function sendWelcomeEmail({ to, companyName }) {
  const appUrl =
    (process.env.APP_URL || process.env.FRONTEND_URL || "").trim() ||
    "http://localhost:3000";

  const name = companyName ? String(companyName).trim() : "there";

  const subject = "Welcome to AMBIT ✅";

  const text = `Hey ${name},

Welcome to AMBIT.

You can log in here:
${appUrl}

If you have any questions, just reply to this email.

— AMBIT
`;

  // keep it simple (deliverability > fancy)
  return sendMail({ to, subject, text });
}
