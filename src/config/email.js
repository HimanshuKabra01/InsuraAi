// config/email.js
import dotenv from "dotenv";
dotenv.config();
import nodemailer from "nodemailer";

console.log("🔍 EMAIL_USER:", process.env.EMAIL_USER || "❌ Not Loaded");
console.log("🔍 EMAIL_PASS:", process.env.EMAIL_PASS ? "✅ Loaded" : "❌ Not Loaded");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendEmail = async (to, subject, html) => {
  try {
    await transporter.sendMail({
      from: `"InsuraAI" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
      // ✅ Force HTML MIME type
      headers: {
        "Content-Type": "text/html; charset=UTF-8",
      },
    });

    console.log(`📧 Email sent to ${to}`);
  } catch (err) {
    console.error("❌ Email error:", err.message);
  }
};
