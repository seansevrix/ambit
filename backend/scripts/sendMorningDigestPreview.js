// backend/scripts/sendMorningDigestPreview.js
import { renderMorningMatchesV2 } from "../lib/emailTemplates/morningMatchesV2.js";

const TEST_TO_EMAIL = process.env.TEST_TO_EMAIL;
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const RESEND_FROM = process.env.RESEND_FROM || "AMBIT <ambit@sevrixgov.com>";
const LOGO_URL =
  process.env.MORNING_MATCHES_LOGO_URL ||
  "https://www.ambitco.app/branding/ambit-logo-email.jpeg";

if (!TEST_TO_EMAIL) {
  console.error("Missing TEST_TO_EMAIL");
  process.exit(1);
}
if (!RESEND_API_KEY) {
  console.error("Missing RESEND_API_KEY");
  process.exit(1);
}

// Use sample matches for pure visual QA (safe, no DB writes, no customer loop)
const html = renderMorningMatchesV2({
  customerName: "Sean",
  logoUrl: LOGO_URL,
  tagline: "Stop hunting. Start receiving.",
  allMatchesUrl: "https://www.ambitco.app/live-opportunities",
  unsubscribeUrl: "https://www.ambitco.app/unsubscribe",
  managePrefsUrl: "https://www.ambitco.app/preferences",
  addressLine: "32071 Campanula Way",
  matches: [
    {
      title: "Air Conditioning system replacement in Paris US Embassy Offices",
      location: "PARIS",
      naics: "238220",
      noticeType: "Combined Synopsis/Solicitation",
      dueDate: "2026-03-06",
      url: "https://api.sam.gov/prod/opportunities/v1/noticedesc?noticeid=example",
      score: 78,
    },
    {
      title: "Senior CRM Associate, Spanish",
      location: "Boston and 2 others",
      naics: "541613",
      noticeType: "Full time",
      dueDate: "2026-03-10",
      url: "https://www.ambitco.app/live-opportunities",
      score: 60,
    },
    {
      title: "Marketing and Promotions Specialist, Pick6",
      location: "Remote - US and Boston",
      naics: "541810",
      noticeType: "Full time",
      dueDate: "2026-03-12",
      url: "https://www.ambitco.app/live-opportunities",
      score: 62,
    },
  ],
});

const res = await fetch("https://api.resend.com/emails", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${RESEND_API_KEY}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    from: RESEND_FROM,
    to: [TEST_TO_EMAIL], // ONLY you
    subject: "AMBIT Morning Digest Preview",
    html,
  }),
});

const data = await res.json();
if (!res.ok) {
  console.error("Resend error:", data);
  process.exit(1);
}

console.log("Preview email sent:", data);
