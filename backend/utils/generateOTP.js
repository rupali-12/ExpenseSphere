import bcrypt from "bcrypt";

export const generateOTP = async () => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6 digits
  const otpHash = await bcrypt.hash(otp, 10);
  return { otp, otpHash };
};

// ExpenseTracker
// neqf luzw rfgg spmg