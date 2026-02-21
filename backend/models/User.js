import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please enter your name"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Please enter your email"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Please enter your password"],
      minlength: 8,
      select: false, // ensures password isn’t returned in queries
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    currentBalance: {
      type: Number,
      default: 0, // starts with 0
    },
  },
  { timestamps: true }
);

// 🔹 Hash password before saving (only if not already hashed)
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  // Prevent rehashing if password already hashed (starts with $2b$ or $2a$)
  if (this.password && this.password.startsWith("$2")) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// 🔹 Compare entered password with hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);
export default User;
