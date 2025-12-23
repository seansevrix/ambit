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
import authRoutes from "./routes/auth.js"; // ✅ NEW

const app = express();

// ✅ Stripe webhook must be mounted BEFORE express.json()
// (Stripe needs raw body for signature verification)
app.use("/webhooks/stripe", stripeWebhookRoutes);

// Logging
app.use(morgan("dev"));

// JSON body parsing for all non-webhook routes
app.use(express.json({ limit: "2mb" }));

// CORS
const allowedOrigins = [
  process.env.FRONTEND_URL || "http://localhost:3000",
];

app.use(
  cors({
    origin: (origin, callback) => {
      // allow server-to-server or curl (no origin)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) return callback(null, true);

      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
  })
);

// Health
app.get("/engine/health", (req, res) => res.json({ status: "ok" }));

// ✅ API routes
app.use("/engine/auth", authRoutes); // ✅ NEW: /engine/auth/register + /engine/auth/login

app.use("/engine", customersRoutes);
app.use("/engine", opportunitiesRoutes);
app.use("/engine", matchesRoutes);

app.use("/engine/billing", billingRoutes);

// 404 handler (helps when you hit wrong endpoints)
app.use((req, res) => {
  res.status(404).json({ ok: false, error: "Route not found." });
});

// Error handler (so errors return JSON)
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ ok: false, error: "Server error." });
});

const PORT = Number(process.env.PORT) || 5001;
app.listen(PORT, () => {
  console.log(`AMBIT backend listening on port ${PORT}`);
});
