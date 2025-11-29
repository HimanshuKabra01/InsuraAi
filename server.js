import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import morgan from "morgan";
import connectDB from "./src/config/db.js";
import policyRoutes from "./routes/policyRoutes.js";
import cron from "node-cron";
import Policy from "./models/policy.js";
import User from "./models/user.js";
import { sendEmail } from "./src/config/email.js";

import authRoutes from "./routes/authRoutes.js";
import extractRoutes from "./routes/extractRoutes.js";

// NEW imports
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import { connectRedis } from "./src/config/redisClient.js";

connectDB();

const app = express();

// Add your production origin here (exact scheme + host)
const allowedOrigins = [
  "https://insura-ai-pi.vercel.app",
  "https://insuraai.onrender.com", // <-- added deployed domain (exact origin)
  "http://localhost:5173",
];

// Global rate limiter (tweak values as needed)
const globalLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 200, // max requests per IP per window
  standardHeaders: true,
  legacyHeaders: false,
});

// CORS middleware (keep this before any route handlers)
app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (mobile apps, curl, etc.)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.log("❌ Blocked by CORS:", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  })
);

// parse JSON bodies
app.use(express.json());
app.use(morgan("dev"));

// NEW middleware
app.use(cookieParser());
app.use(globalLimiter);

// -------------------- COOP (allow google popup postMessage) --------------------
// Place this BEFORE routes so GSI popup can communicate back via postMessage.
// Note: we use 'same-origin-allow-popups' to keep COOP protection but permit popups to call back.
app.use((req, res, next) => {
  // If your hosting/edge already sets a COOP header, adjust there instead.
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
  // Do NOT set Cross-Origin-Embedder-Policy unless you know you need it; it can break many libs.
  next();
});
// -------------------------------------------------------------------------------

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/policies", policyRoutes);
app.use("/api/extractRoutes", extractRoutes);
app.use("/uploads", express.static("uploads"));

app.get("/", (req, res) => res.send("InsuraAI API is running 🚀"));

cron.schedule("0 0 * * *", async () => {
  try {
    console.log("⏳ Running daily policy jobs...");
    const now = new Date();

    // 1️⃣ Expire old policies
    const expiredPolicies = await Policy.updateMany(
      { endDate: { $lt: now }, status: "active" },
      { $set: { status: "expired" } }
    );
    console.log(`✅ Expired policies: ${expiredPolicies.modifiedCount}`);

    // 2️⃣ Send renewal reminders
    const reminders = await Policy.find({
      renewalDueDate: { $lte: now },
      status: "active",
    }).populate("createdBy", "email name");

    for (const policy of reminders) {
      if (policy.createdBy?.email) {
        await sendEmail(
          policy.createdBy.email,
          "Policy Renewal Reminder",
          `
            <h2>Hello ${policy.createdBy.name || "User"},</h2>
            <p>Your policy <b>${policy.policyNumber}</b> (${policy.type}) is due for renewal.</p>
            <p>Please renew before <b>${policy.endDate.toDateString()}</b> to avoid expiry.</p>
            <br/>
            <p>– InsuraAI Team</p>
          `
        );
      }
    }
    console.log(`🔔 Renewal reminders sent: ${reminders.length}`);
  } catch (err) {
    console.error("❌ Cron job error:", err.message);
  }
});

const PORT = process.env.PORT || 5000;

// wrap startup so we can await redis connection
async function start() {
  try {
    await connectRedis();
    app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
}

start();
