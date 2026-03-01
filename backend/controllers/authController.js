import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import User from "../models/User.js";
import PendingUser from "../models/PendingUser.js";
import PasswordResetUser from "../models/passwordResetModel.js"
import { generateOTP } from "../utils/generateOTP.js";
import { sendEmail } from "../utils/sendEmail.js";

// Generate JWT and send cookie
const generateToken = (res, userId) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "30d",
  });

  res.cookie("jwt", token, {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });

  return token;
};

// STEP 1: Register user and send OTP
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ message: "All fields are required" });

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    // Delete any old pending entry
    await PendingUser.deleteOne({ email });

    // Generate OTP + hash
    const { otp, otpHash } = await generateOTP();

    // Save temporarily in PendingUser (password NOT hashed)
    const pendingUser = new PendingUser({
      name,
      email,
      password, // plain text for now
      otpHash,
      otpExpires: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
    });

    await pendingUser.save();

    // Email the OTP
    const html = `
      <h2>Welcome to Expense Tracker!</h2>
      <p>Hi ${name}, your OTP for registration is:</p>
      <h1>${otp}</h1>
      <p>This OTP is valid for 10 minutes.</p>
    `;

    await sendEmail(email, "Expense Tracker OTP Verification", html);

    res.status(200).json({
      message: "OTP sent to your email. Please verify to complete registration.",
    });
  } catch (err) {
    console.error("Register Error:", err);
    res.status(500).json({ message: "Error in sending OTP" });
  }
};

// STEP 2: Verify OTP and create actual user
export const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const pendingUser = await PendingUser.findOne({ email });
    if (!pendingUser)
      return res.status(400).json({ message: "No pending registration found" });

    if (pendingUser.otpExpires < Date.now())
      return res.status(400).json({ message: "OTP expired" });

    const isMatch = await bcrypt.compare(otp, pendingUser.otpHash);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid OTP" });

    // Hash password here before saving to real user DB
    const hashedPassword = await bcrypt.hash(pendingUser.password, 10);

    // Create verified user
    const user = await User.create({
      name: pendingUser.name,
      email: pendingUser.email,
      password: hashedPassword,
    });

    // Remove pending record to clean up
    await PendingUser.deleteOne({ email });

    const token = generateToken(res, user._id);
    res.status(201).json({
      message: "Registration successful!",
      _id: user._id,
      name: user.name,
      email: user.email,
      token,
    });
  } catch (err) {
    console.error("OTP Verify Error:", err);
    res.status(500).json({ message: "Error verifying OTP" });
  }
};

// STEP 3: Resend OTP
export const resendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    const pendingUser = await PendingUser.findOne({ email });

    if (!pendingUser)
      return res.status(400).json({ message: "No pending registration found" });

    const { otp, otpHash } = await generateOTP();
    pendingUser.otpHash = otpHash;
    pendingUser.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
    await pendingUser.save();

    const html = `
      <h2>Expense Tracker</h2>
      <p>Your new OTP is:</p>
      <h1>${otp}</h1>
      <p>Valid for 10 minutes.</p>
    `;

    await sendEmail(email, "Resend OTP - Expense Tracker", html);
    res.json({ message: "New OTP sent successfully!" });
  } catch (err) {
    console.error("Resend OTP Error:", err);
    res.status(500).json({ message: "Error resending OTP" });
  }
};

// STEP 4: Normal Login
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select("+password");

    // Use matchPassword method correctly
    if (user && (await user.matchPassword(password))) {
      const token = generateToken(res, user._id);
      res.json({
        message: "Login successful",
        _id: user._id,
        name: user.name,
        email: user.email,
        token,
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error in Login" });
  }
};

// STEP 5: Logout + Get Profile
export const logoutUser = (req, res) => {
  res.cookie("jwt", "", { httpOnly: true, expires: new Date(0) });
  res.json({ message: "Logged out successfully" });
};

export const getProfile = async (req, res) => {
  const user = await User.findById(req.user._id);
  if (user) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      currentBalance: user.currentBalance,
    });
  } else {
    res.status(404).json({ message: "User not found" });
  }
};

// STEP 6: Update Balance
export const updateBalance = async (req, res) => {
  try {
    const { currentBalance } = req.body;

    if (currentBalance == null || isNaN(currentBalance)) {
      return res.status(400).json({ message: "Please provide a valid balance amount" });
    }

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.currentBalance = currentBalance;
    await user.save();

    res.json({
      message: "Balance updated successfully",
      currentBalance: user.currentBalance,
    });
  } catch (error) {
    console.error("Error updating balance:", error);
    res.status(500).json({ message: "Server error while updating balance" });
  }
};

// Forgot password
 export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Remove previous pending reset (if exists)
    await PasswordResetUser.deleteOne({ email });

    const { otp, otpHash } = await generateOTP();

    await PasswordResetUser.create({
      email,
      otpHash,
      otpExpires: Date.now() + 10 * 60 * 1000, // 10 minutes
    });

    const html = `
      <h2>Password Reset</h2>
      <p>Your OTP for password reset is:</p>
      <h1>${otp}</h1>
      <p>This OTP is valid for 10 minutes.</p>
    `;

    await sendEmail(email, "Reset Password OTP", html);

    res.json({ message: "OTP sent to email" });
  } catch (error) {
    console.error("Forgot Password Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// verify otp for forgot password 
export const verifyForgotOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp)
      return res.status(400).json({ message: "Email and OTP required" });

    // Find OTP record
    const record = await PasswordResetUser.findOne({ email });
    if (!record)
      return res.status(404).json({ message: "OTP not found or expired" });

    // Check expiry
    if (record.otpExpires < Date.now())
      return res.status(400).json({ message: "OTP expired" });

    // Match entered OTP with stored hash
    const isMatch = await bcrypt.compare(otp, record.otpHash);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid OTP" });

    // OTP verified → Now create a temporary reset JWT token
    const resetToken = jwt.sign(
      { email }, 
      process.env.JWT_SECRET,
      { expiresIn: "10m" }
    );

    res.json({
      success: true,
      message: "OTP verified successfully",
      resetToken,
    });

  } catch (err) {
    console.error("Verify Forgot OTP Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Reset password 
export const resetPassword = async (req, res) => {
  try {
    const { resetToken, newPassword, confirmPassword } = req.body;

    if (!resetToken)
      return res.status(400).json({ message: "Unauthorized request" });

    if (!newPassword || !confirmPassword)
      return res.status(400).json({ message: "Both passwords required" });

    if (newPassword !== confirmPassword)
      return res.status(400).json({ message: "Passwords do not match" });

    // Decode token
    const decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
    const email = decoded.email;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    // Cleanup pending record
    await PasswordResetUser.deleteOne({ email });

    res.json({ message: "Password reset successful" });
  } catch (error) {
    console.error("Reset Password Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// update user details
export const updateUserDetails = async (req, res) => {
  try {
    const userId = req.user._id; // coming from protect middleware
    const { name, email, oldPassword, newPassword } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // 🔹 Update name
    if (name) {
      user.name = name;
    }

    // 🔹 Update email (check if already exists)
    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return res.status(400).json({ message: "Email already in use" });
      }
      user.email = email;
    }

    // 🔹 Update password (only if oldPassword & newPassword provided)
    if (oldPassword && newPassword) {
      const isMatch = await bcrypt.compare(oldPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: "Old password is incorrect" });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({ message: "Password must be 6+ characters" });
      }

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
    }

    // 🔹 Save updated user
    await user.save();

    res.status(200).json({
      message: "User details updated successfully",
      user: {
        name: user.name,
        email: user.email,
        balance: user.balance,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};