// src/controllers/authController.js
import dotenv from "dotenv";
dotenv.config();

import { client } from "../config/redisClient.js";
import { generateNumericOtp, hashOtp, verifyOtp } from "../utils/otp.js";
import { sendOtpSms, sendOtpEmail } from "../utils/senders.js";
import User from "../../models/user.js";
import jwt from "jsonwebtoken";

// NEW import for Google ID token verification
import { OAuth2Client } from "google-auth-library";

const OTP_TTL = Number(process.env.OTP_TTL_SECONDS || 300); // seconds
const OTP_RESEND_COOLDOWN = Number(process.env.OTP_RESEND_COOLDOWN_SECONDS || 30); // seconds
const OTP_MAX_ATTEMPTS = Number(process.env.OTP_MAX_ATTEMPTS || 5);
const JWT_EXPIRES = process.env.JWT_EXPIRES_IN || "365d";

/* Helper Redis key builders */
const otpKey = (via, id) => `otp:${via}:${id}`;
const attemptsKey = (via, id) => `otp:attempts:${via}:${id}`;
const cooldownKey = (via, id) => `otp:cooldown:${via}:${id}`;

/* Request OTP endpoint */
export async function requestOtp(req, res) {
  try {
    const { phone, email, via = "sms" } = req.body;
    if (!phone && !email) {
      return res.status(400).json({ error: "phone or email required" });
    }

    const identifier = phone ?? email;
    const channel = via === "email" ? "email" : "sms";

    // Check cooldown to prevent immediate resends
    const cd = await client.get(cooldownKey(channel, identifier));
    if (cd) {
      return res.status(429).json({ error: "Please wait before resending OTP" });
    }

    // Generate and hash OTP
    const otp = generateNumericOtp();
    const hashed = await hashOtp(otp);

    // Store hashed OTP in Redis with TTL
    await client.set(otpKey(channel, identifier), hashed, { EX: OTP_TTL });

    // reset attempts counter (so user gets fresh tries)
    await client.del(attemptsKey(channel, identifier));

    // set cooldown key (short) to prevent immediate resend
    await client.set(cooldownKey(channel, identifier), "1", {
      EX: OTP_RESEND_COOLDOWN,
    });

    // Send OTP via configured provider
    try {
      if (channel === "sms") {
        await sendOtpSms(phone, otp);
      } else {
        await sendOtpEmail(email, otp);
      }
    } catch (sendErr) {
      console.error("OTP send failed:", sendErr);
      // Clean up stored OTP if send failed
      await client.del(otpKey(channel, identifier));
      await client.del(cooldownKey(channel, identifier));
      return res.status(500).json({ error: "Failed to send OTP" });
    }

    // Successful response (don’t reveal whether identifier exists)
    return res.json({ ok: true, message: "OTP sent if the identifier exists." });
  } catch (err) {
    console.error("requestOtp error:", err);
    return res.status(500).json({ error: "Server error" });
  }
}

/* Verify OTP endpoint */
export async function verifyOtpHandler(req, res) {
  try {
    const { phone, email, via = "sms", otp } = req.body;

    // --- validate ---
    if (!otp || (!phone && !email)) {
      return res.status(400).json({ error: "missing fields" });
    }

    // Normalize identifier to avoid key mismatches
    const rawIdentifier = phone ?? email;
    const identifier = String(rawIdentifier).trim(); // remove accidental spaces
    const channel = via === "email" ? "email" : "sms";

    // Compose keys exactly as used in request-otp
    const otpKeyStr = otpKey(channel, identifier);
    const attemptsKeyStr = attemptsKey(channel, identifier);
    const cooldownKeyStr = cooldownKey(channel, identifier);

    // Debug logs (will show in server console)
    console.log("verifyOtpHandler called", {
      identifier,
      channel,
      otpKey: otpKeyStr,
      attemptsKey: attemptsKeyStr,
      cooldownKey: cooldownKeyStr,
      incomingOtp: otp ? `${otp.length} digits` : null,
    });

    // Fetch stored hashed OTP
    const storedHashed = await client.get(otpKeyStr);
    console.log("storedHashed (raw):", storedHashed ? ("<hashed:" + storedHashed.slice(0, 8) + "...>") : null);

    // DEV helper: return debug info (only when not in production)
    const debugInfo = {
      otpKey: otpKeyStr,
      storedHashedExists: !!storedHashed,
      otpTTL: null,
      attemptsValue: null,
    };

    // If key exists, show TTL and attempts (best-effort; guard for clients that don't support ttl)
    try {
      const ttlVal = typeof client.ttl === "function" ? await client.ttl(otpKeyStr) : null;
      debugInfo.otpTTL = ttlVal;
      const attemptsVal = await client.get(attemptsKeyStr);
      debugInfo.attemptsValue = attemptsVal;
    } catch (e) {
      // some client fallbacks may not implement ttl; ignore silently
      console.warn("Could not fetch ttl/attempts:", e.message);
    }

    if (!storedHashed) {
      // Dev: helpful response so you can see why it's missing
      if (process.env.NODE_ENV !== "production") {
        return res.status(400).json({ error: "OTP expired or not requested", debug: debugInfo });
      }
      return res.status(400).json({ error: "OTP expired or not requested" });
    }

    // increment attempt counter
    const attempts = Number((await client.get(attemptsKeyStr)) ?? 0) + 1;
    await client.set(attemptsKeyStr, String(attempts), { EX: OTP_TTL });

    if (attempts > OTP_MAX_ATTEMPTS) {
      await client.del(otpKeyStr);
      await client.del(attemptsKeyStr);
      if (process.env.NODE_ENV !== "production") {
        return res.status(429).json({ error: "Too many attempts", debug: { attempts } });
      }
      return res.status(429).json({ error: "Too many attempts" });
    }

    const ok = await verifyOtp(otp, storedHashed);
    if (!ok) {
      if (process.env.NODE_ENV !== "production") {
        return res.status(401).json({ error: "Invalid OTP", debug: { attempts } });
      }
      return res.status(401).json({ error: "Invalid OTP" });
    }

    // success: remove keys
    await client.del(otpKeyStr);
    await client.del(attemptsKeyStr);
    await client.del(cooldownKeyStr);

    // fetch/create user
    let user = null;
    try {
      if (phone) user = await User.findOne({ phone: identifier });
      else if (email) user = await User.findOne({ email: identifier });

      if (!user) {
        const createObj = {};
        if (phone) createObj.phone = identifier;
        if (email) createObj.email = identifier;
        user = await User.create(createObj);
      }
    } catch (dbErr) {
      console.warn("User find/create failed (continuing):", dbErr.message);
      user = null;
    }

    const payload = user ? { id: user._id } : { identifier };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: JWT_EXPIRES });

    const respUser = user ? { _id: user._id, name: user.name, email: user.email, phone: user.phone } : { identifier };

    // Return success (no debug in production)
    if (process.env.NODE_ENV !== "production") {
      return res.json({ ok: true, token, user: respUser, debug: debugInfo });
    }
    return res.json({ ok: true, token, user: respUser });
  } catch (err) {
    console.error("verifyOtpHandler error:", err);
    return res.status(500).json({ error: "Server error" });
  }
}

/* -------------------- Google Sign-in -------------------- */
// Google OAuth2Client for verifying ID tokens
// replace googleSignIn in src/controllers/authController.js with this function

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";
const JWT_SECRET = process.env.JWT_SECRET || "changeme";
const googleClient = GOOGLE_CLIENT_ID ? new OAuth2Client(GOOGLE_CLIENT_ID) : null;

export async function googleSignIn(req, res) {
  try {
    const { idToken } = req.body;
    if (!idToken) return res.status(400).json({ error: "idToken required" });
    if (!GOOGLE_CLIENT_ID) {
      console.error("googleSignIn: missing GOOGLE_CLIENT_ID in env");
      return res.status(500).json({ error: "Server misconfiguration" });
    }

    // Verify with Google
    let ticket;
    try {
      ticket = await googleClient.verifyIdToken({ idToken, audience: GOOGLE_CLIENT_ID });
    } catch (verifyErr) {
      console.error("googleSignIn: verifyIdToken failed:", verifyErr && verifyErr.stack ? verifyErr.stack : verifyErr);
      return res.status(401).json({ error: "Invalid Google ID token" });
    }

    const payload = ticket.getPayload();
    if (!payload) return res.status(401).json({ error: "Invalid Google token payload" });

    const googleId = String(payload.sub);
    const email = payload.email ? String(payload.email).toLowerCase() : null;
    const name = payload.name ?? null;
    const picture = payload.picture ?? null;
    const emailVerified = !!payload.email_verified;

    // Robust DB find-or-create using atomic upsert to avoid races
    let user;
    try {
      // 1) prefer find by googleId
      user = await User.findOne({ googleId });

      // 2) if not found, try to find by email
      if (!user && email) {
        user = await User.findOne({ email });
      }

      // 3) If still no user, atomic upsert (creates if not exists)
      if (!user) {
        user = await User.findOneAndUpdate(
          { $or: [{ googleId }, { email }] }, // find by googleId OR email
          {
            $setOnInsert: {
              googleId,
              email,
              name,
              picture,
              provider: "google",
              isEmailVerified: emailVerified,
            },
          },
          { new: true, upsert: true, setDefaultsOnInsert: true }
        );
      } else {
        // If found, ensure googleId is linked and profile fields updated
        let changed = false;
        if (!user.googleId && googleId) { user.googleId = googleId; changed = true; }
        if (name && user.name !== name) { user.name = name; changed = true; }
        if (picture && user.picture !== picture) { user.picture = picture; changed = true; }
        if (changed) await user.save();
      }
    } catch (dbErr) {
      // Log full error for diagnosis
      console.error("googleSignIn: DB error during find/create:", dbErr && dbErr.stack ? dbErr.stack : dbErr);

      // If duplicate key, return helpful info (dev)
      if (dbErr && dbErr.code === 11000) {
        console.error("Duplicate key details:", dbErr.keyValue);
        return res.status(409).json({ error: "Duplicate key error creating user", details: dbErr.keyValue });
      }

      // Try a forgiving fallback: attempt to create minimal user (and capture validation errors)
      try {
        user = await User.create({
          googleId,
          email,
          name,
          picture,
          provider: "google",
          isEmailVerified: emailVerified,
        });
      } catch (fallbackErr) {
        console.error("googleSignIn: fallback create also failed:", fallbackErr && fallbackErr.stack ? fallbackErr.stack : fallbackErr);

        // If it's a mongoose validation error, return the errors back in dev
        if (fallbackErr && fallbackErr.name === "ValidationError") {
          const details = {};
          for (const k in fallbackErr.errors) details[k] = fallbackErr.errors[k].message;
          return res.status(422).json({ error: "Validation error creating user", details });
        }

        return res.status(500).json({ error: "Database error on user lookup/create" });
      }
    }

    // At this point we have a user doc
    if (!user) {
      console.error("googleSignIn: user still null after create/upsert");
      return res.status(500).json({ error: "User creation failed" });
    }

    // Issue JWT
    const token = jwt.sign({ sub: user._id.toString(), email: user.email }, JWT_SECRET, { expiresIn: JWT_EXPIRES });

    return res.json({
      ok: true,
      token,
      user: { _id: user._id, email: user.email, name: user.name, picture: user.picture },
    });
  } catch (err) {
    console.error("googleSignIn: unexpected error:", err && err.stack ? err.stack : err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function getMe(req, res) {
  try {
    // Select all fields except the password (and ensure email/phone are included)
    const userProfile = await User.findById(req.user._id).select('-password'); 

    if (!userProfile) {
      return res.status(404).json({ error: "User not found" });
    }

    // Return the profile object
    return res.json({
      _id: userProfile._id,
      name: userProfile.name,
      email: userProfile.email, // Explicitly include email
      phone: userProfile.phone, // Explicitly include phone
      avatar: userProfile.picture, // Assuming 'picture' is the field for avatar URL
      isEmailVerified: userProfile.isEmailVerified,
      provider: userProfile.provider,
      createdAt: userProfile.createdAt,
    });
  } catch (error) {
    console.error("getMe error:", error);
    return res.status(500).json({ error: "Server error fetching user profile" });
  }
}