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

// ✅ Core sender (Resend API)
export async function sendMail({ to, subject, text, html }) {
  if (!RESEND_API_KEY) throw new Error("RESEND_API_KEY missing on backend env vars.");
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
    const msg = data?.message || data?.error || `Resend error: HTTP ${resp.status}`;
    throw new Error(msg);
  }

  return data;
}

// ✅ Welcome email (uses sendMail defined above)
export async function sendWelcomeEmail({ to, companyName }) {
  const name = (companyName || "").trim() || "there";
  const subject = "Welcome to AMBIT — your 7-day trial is live";

  const text = `Hi ${name},

I’m Sean, founder of AMBIT — pumped to have you here.

To help you get value fast, here’s the simplest way to win your first 24 hours:

Step 1 — Log in + confirm your profile
Make sure your service area (cities/states) and NAICS codes match what you actually bid.

Step 2 — Review your matches
You’ll see a ranked list of opportunities tailored to your business. Open the top few and focus on the ones that fit your crew, location, and capabilities.

Step 3 — Use the summaries to decide fast
Each opportunity comes with a plain-English snapshot so you can quickly decide BID / NO-BID without spending hours digging.

Why AMBIT?
As a subscriber, you get full access to:
- Ranked Matches — we surface the best-fit opportunities first so you don’t waste time.
- Plain-English Summaries — understand the job requirements in minutes, not hours.
- Email Digests — new opportunities sent to you automatically so you don’t have to babysit portals.

Pro tip (this matters most):
Keep your NAICS codes + service area up to date. Those two inputs drive the match engine more than anything.

Log in here:
${APP_URL}

If you have any questions, just reply to this email — I read every one.

— Sean S.
Founder, AMBIT`;

  return sendMail({ to, subject, text });
}

// ✅ Optional helper for your existing digest code (if you call this elsewhere)
export async function sendDigestEmail({ to, subject, text, html }) {
  return sendMail({ to, subject, text, html });
}
