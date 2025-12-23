// app/api/support-contact/route.ts
import * as nodemailer from "nodemailer";

export const runtime = "nodejs"; // nodemailer requires Node runtime

type Payload = {
  type: "support" | "contact";
  name: string;
  email: string;
  subject?: string;
  message: string;
  company?: string;
  category?: string;
  // honeypot anti-spam field (should stay empty)
  website?: string;
};

function mustEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing environment variable: ${name}`);
  return v;
}

function isEmail(s: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

function onlyStrings(x: string | null): x is string {
  return typeof x === "string" && x.length > 0;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Payload;

    // Honeypot check
    if (body.website && body.website.trim().length > 0) {
      return Response.json({ ok: true });
    }

    // Validate
    const type = body.type;
    const name = (body.name || "").trim();
    const email = (body.email || "").trim();
    const subject = (body.subject || "").trim();
    const message = (body.message || "").trim();
    const company = (body.company || "").trim();
    const category = (body.category || "").trim();

    if (type !== "support" && type !== "contact") {
      return Response.json({ ok: false, error: "Invalid type." }, { status: 400 });
    }

    if (name.length < 2) {
      return Response.json({ ok: false, error: "Name is required." }, { status: 400 });
    }

    if (!isEmail(email)) {
      return Response.json({ ok: false, error: "Valid email is required." }, { status: 400 });
    }

    if (message.length < 10) {
      return Response.json(
        { ok: false, error: "Message must be at least 10 characters." },
        { status: 400 }
      );
    }

    // Load env
    const MAIL_TO = mustEnv("MAIL_TO");
    const MAIL_FROM = mustEnv("MAIL_FROM");

    const SMTP_HOST = mustEnv("SMTP_HOST");
    const SMTP_PORT = Number(mustEnv("SMTP_PORT"));
    const SMTP_SECURE = String(process.env.SMTP_SECURE || "true") === "true";
    const SMTP_USER = mustEnv("SMTP_USER");
    const SMTP_PASS = mustEnv("SMTP_PASS");

    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_SECURE,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    });

    const safeSubject =
      subject.length > 0 ? subject : type === "support" ? "Support request" : "Contact message";

    const emailSubject = `[Ambit ${type.toUpperCase()}] ${safeSubject}`;

    const text = [
      `Type: ${type}`,
      category ? `Category: ${category}` : null,
      `Name: ${name}`,
      `Email: ${email}`,
      company ? `Company: ${company}` : null,
      "",
      "Message:",
      message,
      "",
      `Sent: ${new Date().toISOString()}`,
    ]
      .filter(onlyStrings)
      .join("\n");

    await transporter.sendMail({
      from: MAIL_FROM,
      to: MAIL_TO, // sean.s@sevrixgov.com via env
      subject: emailSubject,
      text,
      replyTo: email,
    });

    return Response.json({ ok: true });
  } catch (err: any) {
    return Response.json(
      {
        ok: false,
        error: "Failed to send message.",
        detail: err?.message || String(err),
      },
      { status: 500 }
    );
  }
}
