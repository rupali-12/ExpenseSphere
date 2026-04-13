import { defineStore } from 'pinia'
import { ref } from 'vue'
import type {
  User,
  LoginPayload,
  RegisterPayload,
  VerifyOtpPayload,
  UpdateUserPayload,
  UpdateBalancePayload,
  ForgotPasswordPayload,
  VerifyForgotOtpPayload,
  ResetPasswordPayload,
} from '@/types/auth.types'
import {
  loginApi,
  registerApi,
  verifyOtpApi,
  resendOtpApi,
  logoutApi,
  getProfileApi,
  updateBalanceApi,
  updateUserApi,
  forgotPasswordApi,
  verifyForgotOtpApi,
  resetPasswordApi,
} from '@/api/authApi'

export const useAuthStore = defineStore('auth', () => {
  // ─── State -────────
  const user = ref<User | null>(null)
  const isAuthenticated = ref<boolean>(false)
  const resetToken = ref<string>('')

  // ─── Register Step 1 -───────
  const register = async (payload: RegisterPayload) => {
    const response = await registerApi(payload)
    return response.data // { message: 'OTP sent' }
  }

  // ─── Register Step 2 — Verify OTP -────
  const verifyOtp = async (payload: VerifyOtpPayload) => {
    const response = await verifyOtpApi(payload)
    user.value = {
      _id: response.data._id,
      name: response.data.name,
      email: response.data.email,
      currentBalance: 0,
    }
    isAuthenticated.value = true
    return response.data
  }

  // ─── Resend OTP -───────
  const resendOtp = async (email: string) => {
    const response = await resendOtpApi(email)
    return response.data
  }

  // ─── Login -────
  const login = async (payload: LoginPayload) => {
    const response = await loginApi(payload)
    user.value = {
      _id: response.data._id,
      name: response.data.name,
      email: response.data.email,
      currentBalance: 0,
    }
    isAuthenticated.value = true
    return response.data
  }

  // ─── Logout -────
  const logout = async () => {
    await logoutApi()
    user.value = null
    isAuthenticated.value = false
    resetToken.value = ''
  }

  // ─── Fetch Profile -──────
  // Called on app load to restore session from cookie
  const fetchProfile = async () => {
    const response = await getProfileApi()
    user.value = response.data
    isAuthenticated.value = true
    return response.data
  }

  // ─── Update Balance -────
  const updateBalance = async (payload: UpdateBalancePayload) => {
    const response = await updateBalanceApi(payload)
    if (user.value) {
      user.value.currentBalance = response.data.currentBalance
    }
    return response.data
  }

  // ─── Update User Details -───
  const updateUser = async (payload: UpdateUserPayload) => {
    const response = await updateUserApi(payload)
    // Refresh profile after update
    await fetchProfile()
    return response.data
  }

  // ─── Forgot Password -─────
  const forgotPassword = async (payload: ForgotPasswordPayload) => {
    const response = await forgotPasswordApi(payload)
    return response.data
  }

  // ─── Verify Forgot OTP -───
  const verifyForgotOtp = async (payload: VerifyForgotOtpPayload) => {
    const response = await verifyForgotOtpApi(payload)
    // Save reset token to use in next step
    resetToken.value = response.data.resetToken
    return response.data
  }

  // ─── Reset Password -───
  const resetPassword = async (payload: ResetPasswordPayload) => {
    const response = await resetPasswordApi(payload)
    resetToken.value = ''
    return response.data
  }

  return {
    // State
    user,
    isAuthenticated,
    resetToken,
    // Actions
    register,
    verifyOtp,
    resendOtp,
    login,
    logout,
    fetchProfile,
    updateBalance,
    updateUser,
    forgotPassword,
    verifyForgotOtp,
    resetPassword,
  }
})