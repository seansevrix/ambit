// app/api/test-email/route.ts
import nodemailer from "nodemailer";

export const runtime = "nodejs";

function must(name: string) {
  const v = process.env[name];
  return v && v.trim() ? v.trim() : null;
}

function requireAdmin(req: Request) {
  const key = req.headers.get("x-admin-key");
  return !!process.env.ADMIN_API_KEY && key === process.env.ADMIN_API_KEY;
}

export async function POST(req: Request) {
  // ✅ LOCK IT DOWN (prevents public abuse/spam)
  if (!requireAdmin(req)) {
    return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const SMTP_HOST = must("SMTP_HOST");
    const SMTP_PORT = must("SMTP_PORT");
    const SMTP_SECURE =
      (process.env.SMTP_SECURE || "true").toLowerCase() === "true";
    const SMTP_USER = must("SMTP_USER");
    const SMTP_PASS = must("SMTP_PASS");

    const MAIL_FROM = (process.env.MAIL_FROM || SMTP_USER || "").trim();
    const DEFAULT_TO = (process.env.MAIL_TO || "").trim();

    if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
      return Response.json(
        {
          ok: false,
          error: "Missing SMTP env vars",
          missing: {
            SMTP_HOST: !SMTP_HOST,
            SMTP_PORT: !SMTP_PORT,
            SMTP_USER: !SMTP_USER,
            SMTP_PASS: !SMTP_PASS,
          },
        },
        { status: 500 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const to = String(body?.to || DEFAULT_TO || SMTP_USER).trim();

    if (!to) {
      return Response.json(
        { ok: false, error: "Missing recipient (to)" },
        { status: 400 }
      );
    }

    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT),
      secure: SMTP_SECURE, // true for 465
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    });

    await transporter.verify();

    const info = await transporter.sendMail({
      from: MAIL_FROM || SMTP_USER,
      to,
      subject: "AMBIT SMTP test ✅",
      text: `If you got this, SMTP works.\n\nSent at: ${new Date().toISOString()}\n`,
    });

    return Response.json({
      ok: true,
      to,
      from: MAIL_FROM || SMTP_USER,
      messageId: info.messageId,
    });
  } catch (err: any) {
    return Response.json(
      { ok: false, error: err?.message || String(err) },
      { status: 500 }
    );
  }
}
