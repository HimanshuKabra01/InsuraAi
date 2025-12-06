import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import Policy from "../models/policy.js";
import { sendEmail } from "../src/config/email.js";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import dotenv from "dotenv";
import path from "path";
dotenv.config()
const router = express.Router();



cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const ext = file.originalname.split(".").pop().toLowerCase();
    const isPDF = ext === "pdf";

    return {
      folder: "insuraai_uploads",
      resource_type: isPDF ? "raw" : "image",
      allowed_formats: ["jpg", "png", "pdf"],
      public_id: `${Date.now()}-${path.parse(file.originalname).base}`, // ✅ keep .pdf
    };
  },
});


const upload = multer({ storage });

router.post("/", authMiddleware, upload.single("file"), async (req, res) => {
  try {
    const {
      policyNumber,
      type,
      premiumAmount,
      sumInsured,
      deductible,
      startDate,
      endDate,
    } = req.body;

    
    const policyExists = await Policy.findOne({
      policyNumber,
      createdBy: req.user.id,
    });
    if (policyExists) {
      return res.status(400).json({ error: "Policy number already exists" });
    }

    const renewalDueDate = new Date(endDate);
    renewalDueDate.setDate(renewalDueDate.getDate() - 15);

    const cleanNumber = (value) => {
      if (!value) return 0;
      return Number(
        String(value)
          .replace(/[,₹$%]/g, "") 
          .trim()
      );
    };

    const policyData = {
      policyNumber,
      type,
      premiumAmount: cleanNumber(premiumAmount),
      sumInsured: cleanNumber(sumInsured),
      deductible: cleanNumber(deductible),
      startDate,
      endDate,
      renewalDueDate,
      createdBy: req.user.id,
    };

    console.log("Received body:", req.body);
    console.log("Sanitized policy data:", policyData);
    console.log("Received file:", req.file);

    if (req.file && req.file.path) {
      policyData.fileUrl = req.file.path; 
    }

    const policy = new Policy(policyData);
    await policy.save();

    res.status(201).json(policy);
  } catch (error) {
    console.error("❌ Create policy error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/", authMiddleware, async (req, res) => {
  try {
    const policies = await Policy.find({ createdBy: req.user.id });
    res.json(policies);
  } catch (error) {
    console.error("Fetch policies error:", error.message);
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const policy = await Policy.findOne({ _id: req.params.id, createdBy: req.user.id });
    if (!policy) return res.status(404).json({ error: "Policy not found" });
    res.json(policy);
  } catch (error) {
    console.error("Fetch policy error:", error.message);
    res.status(500).json({ error: "Server error" });
  }
});

router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const policy = await Policy.findOneAndDelete({ _id: req.params.id, createdBy: req.user.id });
    if (!policy) return res.status(404).json({ error: "Policy not found" });
    res.json({ message: "Policy deleted" });
  } catch (error) {
    console.error("Delete policy error:", error.message);
    res.status(500).json({ error: "Server error" });
  }
});
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const { type, premiumAmount, startDate, endDate, status } = req.body;

    const policy = await Policy.findOne({ _id: req.params.id, createdBy: req.user.id });
    if (!policy) {
      return res.status(404).json({ error: "Policy not found" });
    }

    if (type) policy.type = type;
    if (premiumAmount) policy.premiumAmount = premiumAmount;
    if (sumInsured) policy.sumInsured = sumInsured;
    if (deductible) policy.deductible = deductible;
    if (startDate) policy.startDate = startDate;
    if (endDate) policy.endDate = endDate;
    if (status) policy.status = status;

    const updatedPolicy = await policy.save();
    res.json(updatedPolicy);
  } catch (error) {
    console.error("Update policy error:", error.message);
    res.status(500).json({ error: "Server error" });
  }
});
router.post("/:id/renew", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const policy = await Policy.findById(id);
    if (!policy) {
      return res.status(404).json({ error: "Policy not found" });
    }

    if (policy.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ error: "Not authorized to renew this policy" });
    }

    const newEndDate = new Date(policy.endDate);
    newEndDate.setMonth(newEndDate.getMonth() + 6);
    const newRenewalDueDate = new Date(newEndDate);
    newRenewalDueDate.setDate(newRenewalDueDate.getDate() - 15);
    policy.endDate = newEndDate;
    policy.renewalDueDate = newRenewalDueDate;
    policy.status = "active"; 

    await policy.save();

    res.status(200).json({
      message: "Policy renewed successfully",
      policy,
    });
  } catch (error) {
    console.error("Renewal error:", error.message);
    res.status(500).json({ error: "Server error" });
  }
});
router.post("/:id/remind", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const policy = await Policy.findById(id).populate("createdBy", "email name");
    if (!policy) {
      return res.status(404).json({ error: "Policy not found" });
    }

    if (policy.createdBy._id.toString() !== req.user.id) {
      return res.status(403).json({ error: "Not authorized to send reminder" });
    }

    if (!policy.createdBy?.email) {
      return res.status(400).json({ error: "User has no email on file" });
    }

    await sendEmail(
      policy.createdBy.email,
      "Policy Renewal Reminder",
      `
        <h2>Hello ${policy.createdBy.name || "User"},</h2>
        <p>This is a reminder for your policy <b>${policy.policyNumber}</b> (${policy.type}).</p>
        <p>Your current policy will expire on <b>${policy.endDate.toDateString()}</b>.</p>
        <p>Please renew before <b>${policy.renewalDueDate.toDateString()}</b> to avoid expiry.</p>
        <br/>
        <p>– InsuraAI Team</p>
      `
    );

    res.status(200).json({ message: "Reminder email sent successfully" });
  } catch (error) {
    console.error("Reminder error:", error.message);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
