// src/utils/otp.js
import crypto from "crypto";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
dotenv.config();

const OTP_LENGTH = Number(process.env.OTP_LENGTH || 6);

/**
 * Generate a numeric OTP of given length (default from env)
 * Uses crypto.randomInt for stronger randomness.
 */
export function generateNumericOtp(length = OTP_LENGTH) {
  const min = Math.pow(10, length - 1);
  const max = Math.pow(10, length) - 1;
  return String(crypto.randomInt(min, max + 1));
}

/**
 * Hash OTP using bcrypt
 */
export async function hashOtp(otp) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(otp, salt);
}

/**
 * Verify plain OTP against hashed value
 */
export async function verifyOtp(otp, hashed) {
  return bcrypt.compare(otp, hashed);
}
