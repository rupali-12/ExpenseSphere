import mongoose from "mongoose";

const pendingUserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // stored temporarily (not hashed)
    otpHash: { type: String, required: true },
    otpExpires: { type: Date, required: true },
  },
  { timestamps: true }
);

// Automatically delete expired pending users after 10 minutes 
pendingUserSchema.index({ otpExpires: 1 }, { expireAfterSeconds: 600 });

export default mongoose.model("PendingUser", pendingUserSchema);
