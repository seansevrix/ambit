// backend/server.js
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import morgan from "morgan";

import customersRoutes from "./routes/customers.js";
import opportunitiesRoutes from "./routes/opportunities.js";
import matchesRoutes from "./routes/matches.js";
import billingRoutes from "./routes/billing.js";
import stripeWebhookRoutes from "./routes/stripeWebhook.js";
import authRoutes from "./routes/auth.js";
import unsubscribeRoutes from "./routes/unsubscribe.js";

const app = express();
app.disable("x-powered-by");
app.set("trust proxy", 1);

// ✅ Stripe webhook must be mounted BEFORE express.json()
app.use("/webhooks/stripe", stripeWebhookRoutes);

// Logging
app.use(morgan("dev"));

/**
 * ✅ BODY PARSING
 * - JSON (including accidental text/plain JSON)
 * - URL-encoded (needed for List-Unsubscribe one-click POST)
 */
app.use(
  express.json({
    limit: "2mb",
    type: ["application/json", "text/plain", "application/*+json"],
  })
);
app.use(express.urlencoded({ extended: false }));

/**
 * ✅ CORS
 */
const allowedOrigins = [
  process.env.FRONTEND_URL, // e.g. https://ambitco.app
  "https://www.ambitco.app",
  "https://ambitco.app",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
].filter(Boolean);

function isAllowedOrigin(origin) {
  if (!origin) return true; // curl / server-to-server requests
  if (allowedOrigins.includes(origin)) return true;
  if (origin.endsWith(".vercel.app")) return true; // allow Vercel previews
  return false;
}

const corsOptions = {
  origin: (origin, callback) => {
    if (isAllowedOrigin(origin)) return callback(null, true);
    console.log("❌ CORS blocked origin:", origin);
    return callback(null, false);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "x-admin-key"],
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

/**
 * ✅ ROOT (Render sometimes probes / during deploy)
 * Return 200 so deploy health checks don’t fail on 404.
 */
app.get("/", (req, res) => {
  res.status(200).send("ok");
});

// ✅ Health (keep)
app.get("/engine/health", (req, res) => res.status(200).json({ status: "ok" }));

/**
 * ✅ Public routes (no auth) — unsubscribe links
 */
app.use("/public", unsubscribeRoutes);

// Engine routes
app.use("/engine/auth", authRoutes);
app.use("/engine", customersRoutes);
app.use("/engine", opportunitiesRoutes);
app.use("/engine", matchesRoutes);
app.use("/engine/billing", billingRoutes);

// 404 (for everything else)
app.use((req, res) => {
  res.status(404).json({ ok: false, error: "Route not found." });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("SERVER ERROR:", err);
  res.status(500).json({ ok: false, error: err?.message || "Server error." });
});

const PORT = Number(process.env.PORT) || 5001;
app.listen(PORT, () => {
  console.log(`AMBIT backend listening on port ${PORT}`);
  console.log("Allowed origins:", allowedOrigins);
});
