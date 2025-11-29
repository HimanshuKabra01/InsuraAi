import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    // Display name (optional for OTP-only users)
    name: { type: String, default: null },

    // Email (optional now — because OTP may be phone-only)
    email: {
      type: String,
      unique: true,
      sparse: true,          // IMPORTANT: allows null/undefined without unique conflicts
      trim: true,
    },

    // Phone (optional — used for OTP login)
    phone: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },

    // For Google Sign-In
    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },

    picture: { type: String, default: null },

    // Password (only for email/password login)
    password: {
      type: String,
      required: false,
      default: null,         // not required anymore because OTP/Google may not use passwords
    },

    // Optional flags
    isEmailVerified: { type: Boolean, default: false },
    provider: {
      type: String,
      enum: ["google", "otp", "password", null],
      default: null,
    },
  },
  {
    timestamps: true,
    collection: "users",
  }
);


// Hash password before save
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);
export default User;
