import express from "express";
import cors from "cors";

const router = express.Router();

const ADMIN_NOTIFY_EMAIL =
  process.env.ADMIN_NOTIFY_EMAIL || "ambit@sevrixgov.com";
const RESEND_FROM =
  process.env.RESEND_FROM || "AMBIT <ambit@sevrixgov.com>";

const ALLOWED_ORIGINS = [
  "https://ambitco.app",
  "https://www.ambitco.app",
  "http://localhost:3000",
];

const corsOptions = {
  origin: (origin, cb) => {
    // allow server-to-server / curl (no origin)
    if (!origin) return cb(null, true);
    if (ALLOWED_ORIGINS.includes(origin)) return cb(null, true);
    return cb(new Error(`CORS blocked for origin: ${origin}`));
  },
  methods: ["POST", "OPTIONS"],
  allowedHeaders: ["Content-Type"],
  credentials: false,
  optionsSuccessStatus: 204,
};

async function sendResendEmail({ to, subject, html, text }) {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("Missing RESEND_API_KEY on server.");

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: RESEND_FROM,
      to,
      subject,
      html,
      text,
    }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(
      data?.message || data?.error || `Resend failed (${res.status})`
    );
  }
  return data;
}

function digitsOnly(s = "") {
  return String(s).replace(/[^\d]/g, "");
}

// ✅ Preflight handler
router.options("/call-request", cors(corsOptions));

// ✅ Actual handler (with CORS)
router.post("/call-request", cors(corsOptions), async (req, res) => {
  try {
    const firstName = String(req.body?.firstName || "").trim();
    const phone = String(req.body?.phone || "").trim();
    const page = String(req.body?.page || "").trim();

    if (!firstName) return res.status(400).json({ error: "First name is required." });

    const d = digitsOnly(phone);
    const phoneOk = d.length === 10 || (d.length === 11 && d.startsWith("1"));
    if (!phoneOk) return res.status(400).json({ error: "Valid phone is required." });

    const when = new Date().toISOString();
    const subject = `AMBIT call request: ${firstName} (${phone})`;

    const text =
      `New AMBIT call request\n\n` +
      `First name: ${firstName}\n` +
      `Phone: ${phone}\n` +
      `Page: ${page || "(unknown)"}\n` +
      `Time: ${when}\n`;

    const html = `
      <div style="font-family: ui-sans-serif, system-ui; line-height: 1.4;">
        <h2 style="margin: 0 0 12px;">New AMBIT call request</h2>
        <p style="margin: 0 0 8px;"><b>First name:</b> ${firstName}</p>
        <p style="margin: 0 0 8px;"><b>Phone:</b> ${phone}</p>
        <p style="margin: 0 0 8px;"><b>Page:</b> ${page || "(unknown)"}</p>
        <p style="margin: 0;"><b>Time:</b> ${when}</p>
      </div>
    `;

    await sendResendEmail({
      to: [ADMIN_NOTIFY_EMAIL],
      subject,
      html,
      text,
    });

    return res.json({ ok: true });
  } catch (e) {
    return res.status(500).json({ error: e?.message || "Server error" });
  }
});

export default router;
