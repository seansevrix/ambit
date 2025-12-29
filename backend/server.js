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

const app = express();
app.disable("x-powered-by");

// ✅ Stripe webhook must be mounted BEFORE express.json()
app.use("/webhooks/stripe", stripeWebhookRoutes);

// Logging
app.use(morgan("dev"));

/**
 * ✅ BODY PARSING (THIS IS THE FIX)
 * Many frontends accidentally send JSON with Content-Type: text/plain.
 * This makes sure req.body is still parsed.
 */
app.use(
  express.json({
    limit: "2mb",
    type: ["application/json", "text/plain", "application/*+json"],
  })
);

// CORS (keep your current approach)
const allowedOrigins = [
  process.env.FRONTEND_URL, // e.g. https://ambit-kappa.vercel.app
  "http://localhost:3000",
  "http://127.0.0.1:3000",
].filter(Boolean);

function isAllowedOrigin(origin) {
  if (!origin) return true; // server-to-server / curl
  if (allowedOrigins.includes(origin)) return true;
  if (origin.endsWith(".vercel.app")) return true;
  return false;
}

const corsOptions = {
  origin: (origin, callback) => {
    if (isAllowedOrigin(origin)) return callback(null, true);
    return callback(null, false);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

// Health
app.get("/engine/health", (req, res) => res.json({ status: "ok" }));

// Routes
app.use("/engine/auth", authRoutes);
app.use("/engine", customersRoutes);
app.use("/engine", opportunitiesRoutes);
app.use("/engine", matchesRoutes);
app.use("/engine/billing", billingRoutes);

// 404
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
