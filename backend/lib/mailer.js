export async function sendWelcomeEmail({ to, companyName }) {
  const appUrl =
    process.env.APP_URL ||
    process.env.FRONTEND_URL ||
    process.env.NEXT_PUBLIC_FRONTEND_URL ||
    "https://www.ambitco.app/login";

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

If you have any questions, just reply to this email — I read every one.

— Sean S.
Founder, AMBIT`;

  return sendMail({ to, subject, text });
}
