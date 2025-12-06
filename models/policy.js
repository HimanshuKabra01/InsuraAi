import mongoose from "mongoose";

const policySchema = new mongoose.Schema({
  policyNumber: { type: String, required: true, unique: true },
  type: { type: String, required: true }, 
  premiumAmount: { type: Number, required: true },
  sumInsured: { type: Number, required: false },
  deductible: { type: Number, required: false },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  renewalDueDate: { type: Date, required: true },
  fileUrl : { type: String, required: false },
  status: { type: String, enum: ["active", "expired", "pending"], default: "active" },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true } 
}, { timestamps: true,
    collection : "policies"
  });
policySchema.index({ policyNumber: 1, createdBy: 1 }, { unique: true });
const Policy = mongoose.model("Policy", policySchema);

export default mongoose.model("Policy", policySchema);
