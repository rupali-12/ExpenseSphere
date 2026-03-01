// tests/controllers/authController.test.js
import {
  registerUser,
  verifyOTP,
  resendOTP,
  loginUser,
  logoutUser,
  getProfile,
  updateBalance,
  forgotPassword,
  verifyForgotOTP,
  resetPassword,
  updateUserDetails,
} from "../../controllers/authController.js";

import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import User from "../../models/User.js";
import PendingUser from "../../models/PendingUser.js";
import PasswordResetUser from "../../models/passwordResetModel.js";
import { generateOTP } from "../../utils/generateOTP.js";
import { sendEmail } from "../../utils/sendEmail.js";

// ── Mock everything ────
jest.mock("jsonwebtoken");
jest.mock("bcrypt");
jest.mock("../../models/User.js");
jest.mock("../../models/PendingUser.js");
jest.mock("../../models/passwordResetModel.js");
jest.mock("../../utils/generateOTP.js");
jest.mock("../../utils/sendEmail.js");

// ── Factories ────
const makeRes = () => ({
  status: jest.fn().mockReturnThis(),
  json: jest.fn().mockReturnThis(),
  cookie: jest.fn().mockReturnThis(),
});
const makeReq = (body = {}, user = null, query = {}) => ({ body, user, query });

//  registerUser
describe("registerUser", () => {
  afterEach(() => jest.clearAllMocks());

  it("400 — missing name", async () => {
    const res = makeRes();
    await registerUser(makeReq({ email: "a@b.com", password: "pass" }), res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "All fields are required",
    });
  });

  it("400 — missing email", async () => {
    const res = makeRes();
    await registerUser(makeReq({ name: "John", password: "pass" }), res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "All fields are required",
    });
  });

  it("400 — missing password", async () => {
    const res = makeRes();
    await registerUser(makeReq({ name: "John", email: "a@b.com" }), res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "All fields are required",
    });
  });

  it("400 — user already exists", async () => {
    User.findOne.mockResolvedValue({ email: "john@test.com" });
    const res = makeRes();
    await registerUser(
      makeReq({ name: "John", email: "john@test.com", password: "pass" }),
      res,
    );
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "User already exists" });
  });

  it("200 — success: deletes pending, saves new pending, sends email", async () => {
    User.findOne.mockResolvedValue(null);
    PendingUser.deleteOne.mockResolvedValue({});
    generateOTP.mockResolvedValue({ otp: "123456", otpHash: "hashed123" });

    const saveMock = jest.fn().mockResolvedValue({});
    PendingUser.mockImplementation(() => ({ save: saveMock }));
    sendEmail.mockResolvedValue({});

    const res = makeRes();
    await registerUser(
      makeReq({ name: "John", email: "john@test.com", password: "pass123" }),
      res,
    );

    expect(PendingUser.deleteOne).toHaveBeenCalledWith({
      email: "john@test.com",
    });
    expect(saveMock).toHaveBeenCalled();
    expect(sendEmail).toHaveBeenCalledWith(
      "john@test.com",
      "Expense Tracker OTP Verification",
      expect.stringContaining("123456"),
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message:
        "OTP sent to your email. Please verify to complete registration.",
    });
  });

  it("500 — unexpected DB error", async () => {
    User.findOne.mockRejectedValue(new Error("DB crash"));
    const res = makeRes();
    await registerUser(
      makeReq({ name: "John", email: "john@test.com", password: "pass" }),
      res,
    );
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: "Error in sending OTP" });
  });
});

//  verifyOTP
describe("verifyOTP", () => {
  afterEach(() => jest.clearAllMocks());

  it("400 — no pending user found", async () => {
    PendingUser.findOne.mockResolvedValue(null);
    const res = makeRes();
    await verifyOTP(makeReq({ email: "john@test.com", otp: "123456" }), res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "No pending registration found",
    });
  });

  it("400 — OTP expired", async () => {
    PendingUser.findOne.mockResolvedValue({
      otpExpires: new Date(Date.now() - 5000),  
      otpHash: "hash",
    });
    const res = makeRes();
    await verifyOTP(makeReq({ email: "john@test.com", otp: "123456" }), res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "OTP expired" });
  });

  it("400 — OTP does not match", async () => {
    PendingUser.findOne.mockResolvedValue({
      otpExpires: new Date(Date.now() + 60000),
      otpHash: "hashXXX",
    });
    bcrypt.compare.mockResolvedValue(false);
    const res = makeRes();
    await verifyOTP(makeReq({ email: "john@test.com", otp: "000000" }), res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Invalid OTP" });
  });

  it("201 — success: creates user, deletes pending, returns token", async () => {
    PendingUser.findOne.mockResolvedValue({
      name: "John",
      email: "john@test.com",
      password: "plainpass",
      otpHash: "hashXXX",
      otpExpires: new Date(Date.now() + 60000),
    });
    bcrypt.compare.mockResolvedValue(true);
    bcrypt.hash.mockResolvedValue("hashedPassword");

    const mockUser = { _id: "uid1", name: "John", email: "john@test.com" };
    User.create.mockResolvedValue(mockUser);
    PendingUser.deleteOne.mockResolvedValue({});
    jwt.sign.mockReturnValue("mock.jwt.token");

    const res = makeRes();
    await verifyOTP(makeReq({ email: "john@test.com", otp: "123456" }), res);

    expect(User.create).toHaveBeenCalledWith(
      expect.objectContaining({ name: "John", email: "john@test.com" }),
    );
    expect(PendingUser.deleteOne).toHaveBeenCalledWith({
      email: "john@test.com",
    });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Registration successful!",
        token: "mock.jwt.token",
      }),
    );
  });

  it("500 — unexpected DB error", async () => {
    PendingUser.findOne.mockRejectedValue(new Error("crash"));
    const res = makeRes();
    await verifyOTP(makeReq({ email: "john@test.com", otp: "123456" }), res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: "Error verifying OTP" });
  });
});

//  resendOTP
describe("resendOTP", () => {
  afterEach(() => jest.clearAllMocks());

  it("400 — no pending user found", async () => {
    PendingUser.findOne.mockResolvedValue(null);
    const res = makeRes();
    await resendOTP(makeReq({ email: "nobody@test.com" }), res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "No pending registration found",
    });
  });

  it("200 — success: updates otpHash, saves, sends email", async () => {
    const mockPending = {
      otpHash: "oldhash",
      otpExpires: new Date(),
      save: jest.fn().mockResolvedValue({}),
    };
    PendingUser.findOne.mockResolvedValue(mockPending);
    generateOTP.mockResolvedValue({ otp: "654321", otpHash: "newhash" });
    sendEmail.mockResolvedValue({});

    const res = makeRes();
    await resendOTP(makeReq({ email: "john@test.com" }), res);

    expect(mockPending.otpHash).toBe("newhash");
    expect(mockPending.save).toHaveBeenCalled();
    expect(sendEmail).toHaveBeenCalledWith(
      "john@test.com",
      "Resend OTP - Expense Tracker",
      expect.stringContaining("654321"),
    );
    expect(res.json).toHaveBeenCalledWith({
      message: "New OTP sent successfully!",
    });
  });

  it("500 — unexpected DB error", async () => {
    PendingUser.findOne.mockRejectedValue(new Error("crash"));
    const res = makeRes();
    await resendOTP(makeReq({ email: "john@test.com" }), res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: "Error resending OTP" });
  });
});

//  loginUser
describe("loginUser", () => {
  afterEach(() => jest.clearAllMocks());

  it("401 — user not found", async () => {
    User.findOne.mockReturnValue({ select: jest.fn().mockResolvedValue(null) });
    const res = makeRes();
    await loginUser(
      makeReq({ email: "nobody@test.com", password: "pass" }),
      res,
    );
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: "Invalid email or password",
    });
  });

  it("401 — wrong password", async () => {
    const mockUser = { matchPassword: jest.fn().mockResolvedValue(false) };
    User.findOne.mockReturnValue({
      select: jest.fn().mockResolvedValue(mockUser),
    });
    const res = makeRes();
    await loginUser(
      makeReq({ email: "john@test.com", password: "wrongpass" }),
      res,
    );
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: "Invalid email or password",
    });
  });

  it("200 — success: sets cookie, returns user data and token", async () => {
    const mockUser = {
      _id: "uid1",
      name: "John",
      email: "john@test.com",
      matchPassword: jest.fn().mockResolvedValue(true),
    };
    User.findOne.mockReturnValue({
      select: jest.fn().mockResolvedValue(mockUser),
    });
    jwt.sign.mockReturnValue("mock.jwt.token");

    const res = makeRes();
    await loginUser(
      makeReq({ email: "john@test.com", password: "pass123" }),
      res,
    );

    expect(res.cookie).toHaveBeenCalledWith(
      "jwt",
      "mock.jwt.token",
      expect.any(Object),
    );
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Login successful",
        name: "John",
        email: "john@test.com",
        token: "mock.jwt.token",
      }),
    );
  });

  it("500 — unexpected DB error", async () => {
    User.findOne.mockReturnValue({
      select: jest.fn().mockRejectedValue(new Error("crash")),
    });
    const res = makeRes();
    await loginUser(makeReq({ email: "john@test.com", password: "pass" }), res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: "Error in Login" });
  });
});

//  logoutUser
describe("logoutUser", () => {
  it('uses default JWT expiry "30d" when JWT_EXPIRES_IN is not set', async () => {
    const originalExpiry = process.env.JWT_EXPIRES_IN;
    delete process.env.JWT_EXPIRES_IN;

    const mockUser = {
      _id: "uid1",
      name: "John",
      email: "john@test.com",
      matchPassword: jest.fn().mockResolvedValue(true),
    };

    User.findOne.mockReturnValue({
      select: jest.fn().mockResolvedValue(mockUser),
    });

    jwt.sign.mockReturnValue("mock.jwt.token");

    const res = makeRes();
    await loginUser(
      makeReq({ email: "john@test.com", password: "pass123" }),
      res,
    );

    expect(jwt.sign).toHaveBeenCalledWith(
      { userId: "uid1" },
      expect.any(String),
      expect.objectContaining({ expiresIn: "30d" }),  
    );
    process.env.JWT_EXPIRES_IN = originalExpiry;
  });

  it("clears jwt cookie and returns success message", () => {
    const res = makeRes();
    logoutUser(makeReq(), res);
    expect(res.cookie).toHaveBeenCalledWith(
      "jwt",
      "",
      expect.objectContaining({ httpOnly: true }),
    );
    expect(res.json).toHaveBeenCalledWith({
      message: "Logged out successfully",
    });
  });
});

//  getProfile
describe("getProfile", () => {
  afterEach(() => jest.clearAllMocks());

  it("200 — returns profile data when user exists", async () => {
    const mockUser = {
      _id: "uid1",
      name: "John",
      email: "john@test.com",
      currentBalance: 5000,
    };
    User.findById.mockResolvedValue(mockUser);

    const res = makeRes();
    await getProfile(makeReq({}, { _id: "uid1" }), res);

    expect(res.json).toHaveBeenCalledWith({
      _id: "uid1",
      name: "John",
      email: "john@test.com",
      currentBalance: 5000,
    });
  });

  it("404 — user not found", async () => {
    User.findById.mockResolvedValue(null);
    const res = makeRes();
    await getProfile(makeReq({}, { _id: "uid1" }), res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "User not found" });
  });
});

//  updateBalance
describe("updateBalance", () => {
  afterEach(() => jest.clearAllMocks());

  it("400 — currentBalance is null", async () => {
    const res = makeRes();
    await updateBalance(
      makeReq({ currentBalance: null }, { _id: "uid1" }),
      res,
    );
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Please provide a valid balance amount",
    });
  });

  it("400 — currentBalance is NaN", async () => {
    const res = makeRes();
    await updateBalance(makeReq({ currentBalance: NaN }, { _id: "uid1" }), res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("404 — user not found", async () => {
    User.findById.mockResolvedValue(null);
    const res = makeRes();
    await updateBalance(
      makeReq({ currentBalance: 1000 }, { _id: "uid1" }),
      res,
    );
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "User not found" });
  });

  it("200 — success: updates and saves balance", async () => {
    const mockUser = {
      currentBalance: 0,
      save: jest.fn().mockResolvedValue({}),
    };
    User.findById.mockResolvedValue(mockUser);

    const res = makeRes();
    await updateBalance(
      makeReq({ currentBalance: 5000 }, { _id: "uid1" }),
      res,
    );

    expect(mockUser.currentBalance).toBe(5000);
    expect(mockUser.save).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Balance updated successfully",
        currentBalance: 5000,
      }),
    );
  });

  it("500 — unexpected DB error", async () => {
    User.findById.mockRejectedValue(new Error("crash"));
    const res = makeRes();
    await updateBalance(
      makeReq({ currentBalance: 1000 }, { _id: "uid1" }),
      res,
    );
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: "Server error while updating balance",
    });
  });
});

//  forgotPassword
describe("forgotPassword", () => {
  afterEach(() => jest.clearAllMocks());

  it("400 — email missing", async () => {
    const res = makeRes();
    await forgotPassword(makeReq({}), res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Email is required" });
  });

  it("404 — user not found", async () => {
    User.findOne.mockResolvedValue(null);
    const res = makeRes();
    await forgotPassword(makeReq({ email: "nobody@test.com" }), res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "User not found" });
  });

  it("200 — success: creates reset record, sends OTP email", async () => {
    User.findOne.mockResolvedValue({ _id: "uid1", email: "john@test.com" });
    PasswordResetUser.deleteOne.mockResolvedValue({});
    generateOTP.mockResolvedValue({ otp: "111222", otpHash: "resethash" });
    PasswordResetUser.create.mockResolvedValue({});
    sendEmail.mockResolvedValue({});

    const res = makeRes();
    await forgotPassword(makeReq({ email: "john@test.com" }), res);

    expect(PasswordResetUser.deleteOne).toHaveBeenCalledWith({
      email: "john@test.com",
    });
    expect(PasswordResetUser.create).toHaveBeenCalledWith(
      expect.objectContaining({ email: "john@test.com", otpHash: "resethash" }),
    );
    expect(sendEmail).toHaveBeenCalledWith(
      "john@test.com",
      "Reset Password OTP",
      expect.stringContaining("111222"),
    );
    expect(res.json).toHaveBeenCalledWith({ message: "OTP sent to email" });
  });

  it("500 — unexpected DB error", async () => {
    User.findOne.mockRejectedValue(new Error("crash"));
    const res = makeRes();
    await forgotPassword(makeReq({ email: "john@test.com" }), res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: "Server error" });
  });
});

//  verifyForgotOTP
describe("verifyForgotOTP", () => {
  afterEach(() => jest.clearAllMocks());

  it("400 — email missing", async () => {
    const res = makeRes();
    await verifyForgotOTP(makeReq({ otp: "123456" }), res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Email and OTP required",
    });
  });

  it("400 — otp missing", async () => {
    const res = makeRes();
    await verifyForgotOTP(makeReq({ email: "john@test.com" }), res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Email and OTP required",
    });
  });

  it("404 — no reset record found", async () => {
    PasswordResetUser.findOne.mockResolvedValue(null);
    const res = makeRes();
    await verifyForgotOTP(
      makeReq({ email: "john@test.com", otp: "123456" }),
      res,
    );
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      message: "OTP not found or expired",
    });
  });

  it("400 — OTP expired", async () => {
    PasswordResetUser.findOne.mockResolvedValue({
      otpExpires: Date.now() - 1000,
      otpHash: "hash",
    });
    const res = makeRes();
    await verifyForgotOTP(
      makeReq({ email: "john@test.com", otp: "123456" }),
      res,
    );
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "OTP expired" });
  });

  it("400 — OTP mismatch", async () => {
    PasswordResetUser.findOne.mockResolvedValue({
      otpExpires: Date.now() + 60000,
      otpHash: "hash",
    });
    bcrypt.compare.mockResolvedValue(false);
    const res = makeRes();
    await verifyForgotOTP(
      makeReq({ email: "john@test.com", otp: "000000" }),
      res,
    );
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Invalid OTP" });
  });

  it("200 — success: returns resetToken", async () => {
    PasswordResetUser.findOne.mockResolvedValue({
      otpExpires: Date.now() + 60000,
      otpHash: "hash",
    });
    bcrypt.compare.mockResolvedValue(true);
    jwt.sign.mockReturnValue("reset.jwt.token");

    const res = makeRes();
    await verifyForgotOTP(
      makeReq({ email: "john@test.com", otp: "123456" }),
      res,
    );

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true, resetToken: "reset.jwt.token" }),
    );
  });

  it("500 — unexpected DB error", async () => {
    PasswordResetUser.findOne.mockRejectedValue(new Error("crash"));
    const res = makeRes();
    await verifyForgotOTP(
      makeReq({ email: "john@test.com", otp: "123456" }),
      res,
    );
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: "Server error" });
  });
});

//  resetPassword
describe("resetPassword", () => {
  afterEach(() => jest.clearAllMocks());

  it("400 — resetToken missing", async () => {
    const res = makeRes();
    await resetPassword(
      makeReq({ newPassword: "abc", confirmPassword: "abc" }),
      res,
    );
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Unauthorized request" });
  });

  it("400 — newPassword missing", async () => {
    const res = makeRes();
    await resetPassword(
      makeReq({ resetToken: "tok", confirmPassword: "abc" }),
      res,
    );
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Both passwords required",
    });
  });

  it("400 — confirmPassword missing", async () => {
    const res = makeRes();
    await resetPassword(
      makeReq({ resetToken: "tok", newPassword: "abc" }),
      res,
    );
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Both passwords required",
    });
  });

  it("400 — passwords do not match", async () => {
    const res = makeRes();
    await resetPassword(
      makeReq({
        resetToken: "tok",
        newPassword: "abc123",
        confirmPassword: "xyz789",
      }),
      res,
    );
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Passwords do not match",
    });
  });

  it("404 — user not found after decoding token", async () => {
    jwt.verify.mockReturnValue({ email: "nobody@test.com" });
    User.findOne.mockResolvedValue(null);
    const res = makeRes();
    await resetPassword(
      makeReq({
        resetToken: "tok",
        newPassword: "newpass",
        confirmPassword: "newpass",
      }),
      res,
    );
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "User not found" });
  });

  it("200 — success: hashes password, saves, cleans up reset record", async () => {
    jwt.verify.mockReturnValue({ email: "john@test.com" });
    const mockUser = { password: "old", save: jest.fn().mockResolvedValue({}) };
    User.findOne.mockResolvedValue(mockUser);
    bcrypt.hash.mockResolvedValue("newhashed");
    PasswordResetUser.deleteOne.mockResolvedValue({});

    const res = makeRes();
    await resetPassword(
      makeReq({
        resetToken: "tok",
        newPassword: "newpass123",
        confirmPassword: "newpass123",
      }),
      res,
    );

    expect(mockUser.password).toBe("newhashed");
    expect(mockUser.save).toHaveBeenCalled();
    expect(PasswordResetUser.deleteOne).toHaveBeenCalledWith({
      email: "john@test.com",
    });
    expect(res.json).toHaveBeenCalledWith({
      message: "Password reset successful",
    });
  });

  it("500 — jwt.verify throws (bad token)", async () => {
    jwt.verify.mockImplementation(() => {
      throw new Error("invalid token");
    });
    const res = makeRes();
    await resetPassword(
      makeReq({
        resetToken: "bad",
        newPassword: "pass",
        confirmPassword: "pass",
      }),
      res,
    );
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: "Server error" });
  });
});

//  updateUserDetails
describe("updateUserDetails", () => {
  afterEach(() => jest.clearAllMocks());

  it("404 — user not found", async () => {
    User.findById.mockResolvedValue(null);
    const res = makeRes();
    await updateUserDetails(makeReq({ name: "John" }, { _id: "uid1" }), res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "User not found" });
  });

  it("200 — updates name only", async () => {
    const mockUser = {
      _id: "uid1",
      name: "OldName",
      email: "john@test.com",
      save: jest.fn().mockResolvedValue({}),
    };
    User.findById.mockResolvedValue(mockUser);

    const res = makeRes();
    await updateUserDetails(makeReq({ name: "NewName" }, { _id: "uid1" }), res);

    expect(mockUser.name).toBe("NewName");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: "User details updated successfully" }),
    );
  });

  it("400 — new email already taken", async () => {
    const mockUser = {
      _id: "uid1",
      name: "John",
      email: "john@test.com",
      save: jest.fn(),
    };
    User.findById.mockResolvedValue(mockUser);
    User.findOne.mockResolvedValue({ email: "taken@test.com" });

    const res = makeRes();
    await updateUserDetails(
      makeReq({ email: "taken@test.com" }, { _id: "uid1" }),
      res,
    );

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Email already in use" });
  });

  it("200 — updates email when not taken", async () => {
    const mockUser = {
      _id: "uid1",
      name: "John",
      email: "john@test.com",
      save: jest.fn().mockResolvedValue({}),
    };
    User.findById.mockResolvedValue(mockUser);
    User.findOne.mockResolvedValue(null); 

    const res = makeRes();
    await updateUserDetails(
      makeReq({ email: "new@test.com" }, { _id: "uid1" }),
      res,
    );

    expect(mockUser.email).toBe("new@test.com");
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("400 — old password incorrect", async () => {
    const mockUser = {
      _id: "uid1",
      name: "John",
      email: "john@test.com",
      password: "hashed",
      save: jest.fn(),
    };
    User.findById.mockResolvedValue(mockUser);
    bcrypt.compare.mockResolvedValue(false);

    const res = makeRes();
    await updateUserDetails(
      makeReq(
        { oldPassword: "wrongold", newPassword: "newpass123" },
        { _id: "uid1" },
      ),
      res,
    );

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Old password is incorrect",
    });
  });

  it("400 — new password too short (less than 6 chars)", async () => {
    const mockUser = {
      _id: "uid1",
      name: "John",
      email: "john@test.com",
      password: "hashed",
      save: jest.fn(),
    };
    User.findById.mockResolvedValue(mockUser);
    bcrypt.compare.mockResolvedValue(true);

    const res = makeRes();
    await updateUserDetails(
      makeReq({ oldPassword: "correct", newPassword: "abc" }, { _id: "uid1" }),
      res,
    );

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Password must be 6+ characters",
    });
  });

  it("200 — updates password successfully", async () => {
    const mockUser = {
      _id: "uid1",
      name: "John",
      email: "john@test.com",
      password: "hashed",
      save: jest.fn().mockResolvedValue({}),
    };
    User.findById.mockResolvedValue(mockUser);
    bcrypt.compare.mockResolvedValue(true);
    bcrypt.genSalt.mockResolvedValue("salt");
    bcrypt.hash.mockResolvedValue("newhashedpass");

    const res = makeRes();
    await updateUserDetails(
      makeReq(
        { oldPassword: "correctold", newPassword: "newpass123" },
        { _id: "uid1" },
      ),
      res,
    );

    expect(mockUser.password).toBe("newhashedpass");
    expect(mockUser.save).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("500 — unexpected DB error", async () => {
    User.findById.mockRejectedValue(new Error("crash"));
    const res = makeRes();
    await updateUserDetails(makeReq({ name: "John" }, { _id: "uid1" }), res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: "Something went wrong" });
  });
});
