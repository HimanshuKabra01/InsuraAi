// src/routes/authRoutes.js

import express from "express";
import jwt from "jsonwebtoken";
import rateLimit from "express-rate-limit";
import User from "../models/user.js";
import { googleSignIn } from "../src/controllers/authController.js";

// NEW – OTP controllers (you will add this file next)
import {
  requestOtp,
  verifyOtpHandler,
} from "../src/controllers/authController.js";

const router = express.Router();

// --- Helper: Generate JWT for normal email+password logins ---
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "365d",
  });
};

/* ---------------------------------------------------------
   OTP RATE LIMITERS (per IP)
--------------------------------------------------------- */

const requestOtpLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 6,
  message: { error: "Too many OTP requests. Try again later." },
  standardHeaders: true,
});
0
// Limit OTP verification attempts
const verifyOtpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 12,
  message: { error: "Too many OTP verification attempts." },
  standardHeaders: true,
});

/* ---------------------------------------------------------
   OTP LOGIN ROUTES
--------------------------------------------------------- */

// Request OTP (phone or email)
router.post("/request-otp", requestOtpLimiter, requestOtp);

// Verify OTP
router.post("/verify-otp", verifyOtpLimiter, verifyOtpHandler);
router.post("/google", googleSignIn);
/* ---------------------------------------------------------
   EXISTING AUTH ROUTES (unchanged)
--------------------------------------------------------- */

// Signup
router.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const exists = await User.findOne({ email });
    if (exists)
      return res.status(400).json({ error: "User already exists" });

    const user = await User.create({ name, email, password });
    return res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
    });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (user && (await user.matchPassword(password))) {
      return res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id),
      });
    } else {
      return res.status(401).json({ error: "Invalid email or password" });
    }
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
