import express from "express";
import multer from "multer";
import Tesseract from "tesseract.js";
import OpenAI from "openai";
import fs from "fs";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse");

const router = express.Router();
const upload = multer({ dest: "uploads/" });

const openai = new OpenAI({
  
});

router.post("/extract", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    console.log("📄 File uploaded:", req.file.originalname);

    let rawText = "";

    // Step 1: Extract text from PDF or Image
    if (req.file.mimetype === "application/pdf") {
      console.log("📑 Processing as PDF...");
      const pdfBuffer = fs.readFileSync(req.file.path);
      const pdfData = await pdfParse(pdfBuffer);
      rawText = pdfData.text;
    } else {
      console.log("🖼️ Processing as Image...");
      const result = await Tesseract.recognize(req.file.path, "eng");
      rawText = result.data.text;
    }

    console.log("📝 Extracted Text Sample:", rawText.slice(0, 200), "...");

    // Step 2: Use GPT to normalize and extract fields
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `
You are an assistant that extracts insurance policy details from text. 
Look for equivalent terms, synonyms, or variations:

- policyNumber → may appear as Policy No., Policy No, Policy ID, Reference No
- type → Life, Health, Motor, Car, Travel, or inferred from context
- premiumAmount → may appear as Basic Premium , Total Premium , Total Premium(Including taxes) , Premium, Annual Premium  , etc.
- sumInsured → may appear as Sum Insured, Coverage Amount, Insured Amount , Maximum Bnenefit, Coverage Limit , etc.
- deductible → may appear as Deductible , Excess, Out-of-pocket, Deductible Amount , Co-pay, etc.
- startDate → may appear as Policy Start Date, Valid From, Period of Insurance (first date)
- endDate → may appear as Policy End Date, Valid Till, Period of Insurance (second date)

Return ONLY normalized JSON in this format:
{
  "policyNumber": "...",
  "type": "...",
  "premiumAmount": "...",
  "sumInsured": "...",
  "deductible": "...",
  "startDate": "YYYY-MM-DD",
  "endDate": "YYYY-MM-DD"
}
          `,
        },
        {
          role: "user",
          content: rawText,
        },
      ],
    });

    let extracted = {};
    let content = response.choices[0].message.content.trim();

    // Remove ```json ... ``` wrappers if present
    if (content.startsWith("```")) {
      content = content.replace(/```json|```/g, "").trim();
    }

    try {
      extracted = JSON.parse(content);
    } catch (err) {
      console.error("❌ Failed to parse GPT response:", content);
      extracted = {};
    }

    // Step 3: Fallback Regex Extraction if fields missing
    if (!extracted.policyNumber) {
      const match = rawText.match(/Policy\s*(No|Number|ID)[:\-]?\s*([A-Za-z0-9\-]+)/i);
      if (match) extracted.policyNumber = match[2];
    }

    if (!extracted.startDate || !extracted.endDate) {
      const dateMatches = rawText.match(/\d{2}[\/\-]\d{2}[\/\-]\d{4}/g);
      if (dateMatches && dateMatches.length >= 2) {
        extracted.startDate = extracted.startDate || dateMatches[0];
        extracted.endDate = extracted.endDate || dateMatches[1];
      }
    }

    if (!extracted.premiumAmount) {
      const match = rawText.match(/(?:Premium|Sum Assured|Amount)[:\-]?\s*([\d,]+)/i);
      if (match) extracted.premiumAmount = match[1].replace(/,/g, "");
    }
    if (!extracted.sumInsured) {
  const match = rawText.match(/(?:Sum Insured|Coverage Amount)[:\-]?\s*([\d,]+)/i);
  if (match) extracted.sumInsured = match[1].replace(/,/g, "");
}

if (!extracted.deductible) {
  const match = rawText.match(/(?:Deductible|Co-pay)[:\-]?\s*([\d,]+)/i);
  if (match) extracted.deductible = match[1].replace(/,/g, "");
}

    // Cleanup uploaded file
    fs.unlinkSync(req.file.path);

    res.json(
      // rawText: rawText.slice(0, 500), // save preview of extracted text
      extracted
    );
  } catch (error) {
    console.error("❌ Extraction error:", error.message);
    res.status(500).json({ error: "Failed to extract policy" });
  }
});

export default router;
