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

import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import { connectRedis } from "./src/config/redisClient.js";

connectDB();

const app = express();

const allowedOrigins = [
  "https://insura-ai-pi.vercel.app",
  "https://insuraai.onrender.com",
  "http://localhost:5173",
  "http://127.0.0.1:5173" 
];

const globalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(
  cors({
    origin: function (origin, callback) {
      
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.log("⚠️ Blocked by CORS:", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  })
);

app.use(express.json());
app.use(morgan("dev"));
app.use(cookieParser());
app.use(globalLimiter);


app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
  next();
});

app.use("/api/auth", authRoutes);
app.use("/api/policies", policyRoutes);
app.use("/api/extractRoutes", extractRoutes);
app.use("/uploads", express.static("uploads"));

app.get("/", (req, res) => res.send("InsuraAI API is running 🚀"));

cron.schedule("0 0 * * *", async () => {
  try {
    console.log("⏳ Running daily policy jobs...");
    const now = new Date();

    const expiredPolicies = await Policy.updateMany(
      { endDate: { $lt: now }, status: "active" },
      { $set: { status: "expired" } }
    );
    console.log(`✅ Expired policies: ${expiredPolicies.modifiedCount}`);

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
  } catch (err) {
    console.error("❌ Cron job error:", err.message);
  }
});

const PORT = process.env.PORT || 5000;

async function start() {
  try {
    await connectRedis().catch(err => {
        console.warn("⚠️ REDIS CONNECTION FAILED: OTP features will not work.");
        console.warn("   Error:", err.message);
    });
    
    app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
}

start();