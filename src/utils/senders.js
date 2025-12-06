
import dotenv from "dotenv";
dotenv.config();

import twilio from "twilio";
import nodemailer from "nodemailer";

const OTP_TTL_SECONDS = process.env.OTP_TTL_SECONDS || 300;

function getTwilioClient() {
  const sid = process.env.TWILIO_SID;
  const token = process.env.TWILIO_TOKEN;
  if (!sid || !token) return null;
  try {
    return twilio(sid, token);
  } catch (err) {
    console.error("Twilio client init error:", err);
    return null;
  }
}

export async function sendOtpSms(phone, otp) {
  const client = getTwilioClient();
  const from = process.env.TWILIO_FROM;
  const messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID;

  if (!client) {
    console.warn("Twilio not configured — falling back to console log for SMS.");
    console.log(`[DEV OTP SMS] to=${phone} otp=${otp} (expires in ${OTP_TTL_SECONDS}s)`);
    return { ok: true, dev: true, otp };
  }

  if (!phone || typeof phone !== "string") {
    throw new Error("Invalid phone number for sendOtpSms");
  }

  const body = `Your verification code is ${otp}. It expires in ${OTP_TTL_SECONDS} seconds.`;

  try {
    const params = {
      to: phone,
      body,
    };

    if (messagingServiceSid) {
      params.messagingServiceSid = messagingServiceSid;
    } else if (from) {
      params.from = from;
    } else {
      throw new Error("Twilio configured but no TWILIO_FROM or TWILIO_MESSAGING_SERVICE_SID provided");
    }

    const msg = await client.messages.create(params);
    return { ok: true, sid: msg.sid, status: msg.status };
  } catch (err) {
    console.error("Twilio send error:", err?.message || err);
    throw new Error("Failed to send SMS via Twilio: " + (err?.message || "unknown"));
  }
}

export async function sendOtpEmail(email, otp) {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.EMAIL_FROM || `No Reply <no-reply@example.com>`;

  if (!host || !user || !pass) {
    console.warn("SMTP not configured — falling back to console log for Email.");
    console.log(`[DEV OTP EMAIL] to=${email} otp=${otp} (expires in ${OTP_TTL_SECONDS}s)`);
    return { ok: true, dev: true, otp };
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  const subject = "Your login code";
  const text = `Your verification code is ${otp}. It expires in ${OTP_TTL_SECONDS} seconds.`;
  const html = `<p>Your verification code is <strong>${otp}</strong>. It expires in ${OTP_TTL_SECONDS} seconds.</p>`;

  try {
    const info = await transporter.sendMail({
      from,
      to: email,
      subject,
      text,
      html,
    });
    return { ok: true, messageId: info.messageId, accepted: info.accepted };
  } catch (err) {
    console.error("SMTP send error:", err);
    throw new Error("Failed to send email via SMTP: " + (err?.message || "unknown"));
  }
}
