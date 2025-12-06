
import dotenv from "dotenv";
dotenv.config();

import { client } from "../config/redisClient.js";
import { generateNumericOtp, hashOtp, verifyOtp } from "../utils/otp.js";
import { sendOtpSms, sendOtpEmail } from "../utils/senders.js";
import User from "../../models/user.js";
import jwt from "jsonwebtoken";

import { OAuth2Client } from "google-auth-library";

const OTP_TTL = Number(process.env.OTP_TTL_SECONDS || 300); // seconds
const OTP_RESEND_COOLDOWN = Number(process.env.OTP_RESEND_COOLDOWN_SECONDS || 30); // seconds
const OTP_MAX_ATTEMPTS = Number(process.env.OTP_MAX_ATTEMPTS || 5);
const JWT_EXPIRES = process.env.JWT_EXPIRES_IN || "365d";

const otpKey = (via, id) => `otp:${via}:${id}`;
const attemptsKey = (via, id) => `otp:attempts:${via}:${id}`;
const cooldownKey = (via, id) => `otp:cooldown:${via}:${id}`;

export async function requestOtp(req, res) {
  try {
    const { phone, email, via = "sms" } = req.body;
    if (!phone && !email) {
      return res.status(400).json({ error: "phone or email required" });
    }

    const identifier = phone ?? email;
    const channel = via === "email" ? "email" : "sms";

    
    const cd = await client.get(cooldownKey(channel, identifier));
    if (cd) {
      return res.status(429).json({ error: "Please wait before resending OTP" });
    }

    const otp = generateNumericOtp();
    const hashed = await hashOtp(otp);

    await client.set(otpKey(channel, identifier), hashed, { EX: OTP_TTL });
    await client.del(attemptsKey(channel, identifier));

    
    await client.set(cooldownKey(channel, identifier), "1", {
      EX: OTP_RESEND_COOLDOWN,
    });

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

    return res.json({ ok: true, message: "OTP sent if the identifier exists." });
  } catch (err) {
    console.error("requestOtp error:", err);
    return res.status(500).json({ error: "Server error" });
  }
}


export async function verifyOtpHandler(req, res) {
  try {
    const { phone, email, via = "sms", otp } = req.body;

    
    if (!otp || (!phone && !email)) {
      return res.status(400).json({ error: "missing fields" });
    }

    
    const rawIdentifier = phone ?? email;
    const identifier = String(rawIdentifier).trim(); // remove accidental spaces
    const channel = via === "email" ? "email" : "sms";

    const otpKeyStr = otpKey(channel, identifier);
    const attemptsKeyStr = attemptsKey(channel, identifier);
    const cooldownKeyStr = cooldownKey(channel, identifier);

    console.log("verifyOtpHandler called", {
      identifier,
      channel,
      otpKey: otpKeyStr,
      attemptsKey: attemptsKeyStr,
      cooldownKey: cooldownKeyStr,
      incomingOtp: otp ? `${otp.length} digits` : null,
    });

    const storedHashed = await client.get(otpKeyStr);
    console.log("storedHashed (raw):", storedHashed ? ("<hashed:" + storedHashed.slice(0, 8) + "...>") : null);

    const debugInfo = {
      otpKey: otpKeyStr,
      storedHashedExists: !!storedHashed,
      otpTTL: null,
      attemptsValue: null,
    };

    try {
      const ttlVal = typeof client.ttl === "function" ? await client.ttl(otpKeyStr) : null;
      debugInfo.otpTTL = ttlVal;
      const attemptsVal = await client.get(attemptsKeyStr);
      debugInfo.attemptsValue = attemptsVal;
    } catch (e) {
      console.warn("Could not fetch ttl/attempts:", e.message);
    }

    if (!storedHashed) {
      if (process.env.NODE_ENV !== "production") {
        return res.status(400).json({ error: "OTP expired or not requested", debug: debugInfo });
      }
      return res.status(400).json({ error: "OTP expired or not requested" });
    }

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
    await client.del(otpKeyStr);
    await client.del(attemptsKeyStr);
    await client.del(cooldownKeyStr);
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

    if (process.env.NODE_ENV !== "production") {
      return res.json({ ok: true, token, user: respUser, debug: debugInfo });
    }
    return res.json({ ok: true, token, user: respUser });
  } catch (err) {
    console.error("verifyOtpHandler error:", err);
    return res.status(500).json({ error: "Server error" });
  }
}


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

    let user;
    try {
      user = await User.findOne({ googleId });

      if (!user && email) {
        user = await User.findOne({ email });
      }
      if (!user) {
        user = await User.findOneAndUpdate(
          { $or: [{ googleId }, { email }] },
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
        let changed = false;
        if (!user.googleId && googleId) { user.googleId = googleId; changed = true; }
        if (name && user.name !== name) { user.name = name; changed = true; }
        if (picture && user.picture !== picture) { user.picture = picture; changed = true; }
        if (changed) await user.save();
      }
    } catch (dbErr) {
      console.error("googleSignIn: DB error during find/create:", dbErr && dbErr.stack ? dbErr.stack : dbErr);

      if (dbErr && dbErr.code === 11000) {
        console.error("Duplicate key details:", dbErr.keyValue);
        return res.status(409).json({ error: "Duplicate key error creating user", details: dbErr.keyValue });
      }
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

        if (fallbackErr && fallbackErr.name === "ValidationError") {
          const details = {};
          for (const k in fallbackErr.errors) details[k] = fallbackErr.errors[k].message;
          return res.status(422).json({ error: "Validation error creating user", details });
        }

        return res.status(500).json({ error: "Database error on user lookup/create" });
      }
    }

    
    if (!user) {
      console.error("googleSignIn: user still null after create/upsert");
      return res.status(500).json({ error: "User creation failed" });
    }

    
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
    
    const userProfile = await User.findById(req.user._id).select('-password'); 

    if (!userProfile) {
      return res.status(404).json({ error: "User not found" });
    }

    
    return res.json({
      _id: userProfile._id,
      name: userProfile.name,
      email: userProfile.email,
      phone: userProfile.phone, 
      avatar: userProfile.picture, 
      isEmailVerified: userProfile.isEmailVerified,
      provider: userProfile.provider,
      createdAt: userProfile.createdAt,
    });
  } catch (error) {
    console.error("getMe error:", error);
    return res.status(500).json({ error: "Server error fetching user profile" });
  }
}