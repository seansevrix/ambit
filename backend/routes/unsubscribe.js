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
    const ba = Buffer.from(a, "hex");
    const bb = Buffer.from(b, "hex");
    if (ba.length !== bb.length) return false;
    return crypto.timingSafeEqual(ba, bb);
  } catch {
    return false;
  }
}

router.get("/unsubscribe", async (req, res) => {
  try {
    const { email, ts, sig } = req.query;

    if (!process.env.UNSUBSCRIBE_SECRET) {
      return res.status(500).send("Missing UNSUBSCRIBE_SECRET");
    }

    if (!email || !ts || !sig) {
      return res.status(400).send("Missing parameters.");
    }

    const emailStr = String(email);
    const tsStr = String(ts);
    const sigStr = String(sig);

    // Optional: expire tokens after 14 days
    const ageMs = Date.now() - Number(tsStr);
    const maxAgeMs = 14 * 24 * 60 * 60 * 1000;
    if (!Number.isFinite(ageMs) || ageMs < 0 || ageMs > maxAgeMs) {
      return res.status(400).send("This unsubscribe link has expired.");
    }

    const expected = signUnsub(emailStr, tsStr, process.env.UNSUBSCRIBE_SECRET);
    if (!timingSafeEqualHex(expected, sigStr)) {
      return res.status(403).send("Invalid unsubscribe link.");
    }

    await prisma.customer.updateMany({
      where: { email: emailStr },
      data: { isActive: false },
    });

    const appUrl = process.env.FRONTEND_URL || "https://ambitco.app";

    return res
      .status(200)
      .send(`
        <div style="font-family:Arial,sans-serif;line-height:1.5;padding:24px">
          <h2>Unsubscribed</h2>
          <p>${emailStr} has been unsubscribed from AMBIT digests.</p>
          <p>If this was a mistake, you can re-enable alerts by signing in again.</p>
          <p><a href="${appUrl}" style="color:#111">Go to AMBIT</a></p>
        </div>
      `);
  } catch (e) {
    console.error("Unsubscribe error:", e);
    return res.status(500).send("Server error.");
  }
});

export default router;
