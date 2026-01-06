// backend/routes/unsubscribe.js
import express from "express";
import crypto from "crypto";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();

function signUnsub(email, ts, secret) {
  const base = `${email}|${ts}`;
  return crypto.createHmac("sha256", secret).update(base).digest("hex");
}

function timingSafeEqualHex(a, b) {
  try {
    const ba = Buffer.from(String(a), "hex");
    const bb = Buffer.from(String(b), "hex");
    if (ba.length !== bb.length) return false;
    return crypto.timingSafeEqual(ba, bb);
  } catch {
    return false;
  }
}

function validateAndExtract(req) {
  const { email, ts, sig } = req.query;

  if (!process.env.UNSUBSCRIBE_SECRET) {
    return { ok: false, status: 500, msg: "Missing UNSUBSCRIBE_SECRET" };
  }
  if (!email || !ts || !sig) {
    return { ok: false, status: 400, msg: "Missing parameters." };
  }

  const emailStr = String(email);
  const tsStr = String(ts);
  const sigStr = String(sig);

  // Expire tokens after 14 days
  const ageMs = Date.now() - Number(tsStr);
  const maxAgeMs = 14 * 24 * 60 * 60 * 1000;
  if (!Number.isFinite(ageMs) || ageMs < 0 || ageMs > maxAgeMs) {
    return { ok: false, status: 400, msg: "This unsubscribe link has expired." };
  }

  const expected = signUnsub(emailStr, tsStr, process.env.UNSUBSCRIBE_SECRET);
  if (!timingSafeEqualHex(expected, sigStr)) {
    return { ok: false, status: 403, msg: "Invalid unsubscribe link." };
  }

  return { ok: true, emailStr };
}

// ✅ GET: user clicked the link (human)
router.get("/unsubscribe", async (req, res) => {
  try {
    const v = validateAndExtract(req);
    if (!v.ok) return res.status(v.status).send(v.msg);

    await prisma.customer.updateMany({
      where: { email: v.emailStr },
      data: { isActive: false },
    });

    const appUrl = process.env.FRONTEND_URL || "https://ambitco.app";

    return res.status(200).send(`
      <div style="font-family:Arial,sans-serif;line-height:1.5;padding:24px">
        <h2>Unsubscribed</h2>
        <p><strong>${v.emailStr}</strong> has been unsubscribed from AMBIT digests.</p>
        <p>If this was a mistake, you can re-enable alerts by signing in again.</p>
        <p><a href="${appUrl}" style="color:#111">Go to AMBIT</a></p>
      </div>
    `);
  } catch (e) {
    console.error("Unsubscribe GET error:", e);
    return res.status(500).send("Server error.");
  }
});

// ✅ POST: inbox provider one-click unsubscribe (machine)
router.post("/unsubscribe", async (req, res) => {
  try {
    // Providers often POST: List-Unsubscribe=One-Click (form-url-encoded)
    const oneClick =
      req.body?.["List-Unsubscribe"] === "One-Click" ||
      req.body?.["List-Unsubscribe"] === "One-click" ||
      req.body?.["list-unsubscribe"] === "One-Click";

    if (!oneClick) {
      // Still allow, but require valid signed params
      // (Some providers POST without the body field)
    }

    const v = validateAndExtract(req);
    if (!v.ok) return res.status(v.status).send(v.msg);

    await prisma.customer.updateMany({
      where: { email: v.emailStr },
      data: { isActive: false },
    });

    // Keep it simple for machines
    return res.status(200).send("OK");
  } catch (e) {
    console.error("Unsubscribe POST error:", e);
    return res.status(500).send("Server error.");
  }
});

export default router;
