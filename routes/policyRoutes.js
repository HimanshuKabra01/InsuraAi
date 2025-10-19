import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import Policy from "../models/policy.js";
import { sendEmail } from "../config/email.js";
import multer from "multer";
import path from "path";

const router = express.Router();


// Create new policy
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // Max 10MB
  fileFilter: (req, file, cb) => {
    const allowed = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/jpg",
    ];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error("Only PDF, JPG, and PNG files are allowed!"));
  },
});

// 🟢 Create new policy (with optional document upload)
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

    // Prevent duplicates for the same user
    const policyExists = await Policy.findOne({
      policyNumber,
      createdBy: req.user.id,
    });
    if (policyExists) {
      return res.status(400).json({ error: "Policy number already exists" });
    }

    // Auto-set renewal date 15 days before end date
    const renewalDueDate = new Date(endDate);
    renewalDueDate.setDate(renewalDueDate.getDate() - 15);

    // Build new policy object
    const policyData = {
      policyNumber,
      type,
      premiumAmount,
      sumInsured,
      deductible,
      startDate,
      endDate,
      renewalDueDate,
      createdBy: req.user.id,
    };

    // If file uploaded, attach file URL
    if (req.file) {
      policyData.fileUrl = `/uploads/${req.file.filename}`;
    }

    const policy = new Policy(policyData);
    await policy.save();

    res.status(201).json(policy);
  } catch (error) {
    console.error("Create policy error:", error.message);
    res.status(500).json({ error: "Server error" });
  }
});

// Get all policies for logged-in user
router.get("/", authMiddleware, async (req, res) => {
  try {
    const policies = await Policy.find({ createdBy: req.user.id });
    res.json(policies);
  } catch (error) {
    console.error("Fetch policies error:", error.message);
    res.status(500).json({ error: "Server error" });
  }
});

// Get single policy by ID
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

// Delete policy
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
// Update policy
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const { type, premiumAmount, startDate, endDate, status } = req.body;

    const policy = await Policy.findOne({ _id: req.params.id, createdBy: req.user.id });
    if (!policy) {
      return res.status(404).json({ error: "Policy not found" });
    }

    // Update only the provided fields
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
// @route   POST /api/policies/:id/renew
// @desc    Renew a policy (extend by 6 months)
// @access  Private
router.post("/:id/renew", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    // Find the policy
    const policy = await Policy.findById(id);
    if (!policy) {
      return res.status(404).json({ error: "Policy not found" });
    }

    // Check ownership (only creator can renew)
    if (policy.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ error: "Not authorized to renew this policy" });
    }

    // Extend endDate by 6 months
    const newEndDate = new Date(policy.endDate);
    newEndDate.setMonth(newEndDate.getMonth() + 6);

    // Set renewalDueDate = 15 days before new endDate
    const newRenewalDueDate = new Date(newEndDate);
    newRenewalDueDate.setDate(newRenewalDueDate.getDate() - 15);

    // Update policy
    policy.endDate = newEndDate;
    policy.renewalDueDate = newRenewalDueDate;
    policy.status = "active"; // reset status if it was expired

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

    // Find policy
    const policy = await Policy.findById(id).populate("createdBy", "email name");
    if (!policy) {
      return res.status(404).json({ error: "Policy not found" });
    }

    // Only the creator can send a reminder (or you can skip this check if agents can do it)
    if (policy.createdBy._id.toString() !== req.user.id) {
      return res.status(403).json({ error: "Not authorized to send reminder" });
    }

    // Ensure user has an email
    if (!policy.createdBy?.email) {
      return res.status(400).json({ error: "User has no email on file" });
    }

    // Send reminder email
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
