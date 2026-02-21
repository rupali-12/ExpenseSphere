import mongoose from "mongoose";

const passwordResetSchema = new mongoose.Schema(
  {
    email: { type: String, required: true },
    otpHash: { type: String, required: true },
    otpExpires: { type: Date, required: true }
  },
  { timestamps: true }
);

// Auto-delete after expiry
passwordResetSchema.index({ otpExpires: 1 }, { expireAfterSeconds: 600 });

export default mongoose.model("PasswordResetUser", passwordResetSchema);
