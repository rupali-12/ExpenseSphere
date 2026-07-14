import express from 'express';
import { registerUser, loginUser, logoutUser, getProfile,updateUserDetails, verifyOTP, resendOTP, updateBalance, forgotPassword, resetPassword, verifyForgotOTP } from '../controllers/authController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post("/verify-otp", verifyOTP);
router.post("/resend-otp", resendOTP);
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.get('/profile', protect, getProfile);
// router.put("/update-balance", protect, updateBalance);
router.post("/forgot-password", forgotPassword);
router.post("/verify-forgot-otp", verifyForgotOTP);
router.post("/reset-password", resetPassword);
router.put("/update-user", protect, updateUserDetails);

export default router;
