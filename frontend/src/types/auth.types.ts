// User
export interface User{
    _id: string,
    name: string,
    email: string,
    currentBalance: number
}

// ─── Request Payloads ───────────────────
export interface RegisterPayload {
  name: string
  email: string
  password: string
}

export interface VerifyOtpPayload {
  email: string
  otp: string
}

export interface LoginPayload {
  email: string
  password: string
}

export interface ForgotPasswordPayload {
  email: string
}

export interface VerifyForgotOtpPayload {
  email: string
  otp: string
}

export interface ResetPasswordPayload {
  resetToken: string
  newPassword: string
  confirmPassword: string
}

export interface UpdateUserPayload {
  name?: string
  email?: string
  oldPassword?: string
  newPassword?: string
}

export interface UpdateBalancePayload {
  currentBalance: number
}

// ─── API Responses ─────────────────────────────────────────
export interface AuthResponse {
  message: string
  _id: string
  name: string
  email: string
  token: string
}

export interface ProfileResponse {
  _id: string
  name: string
  email: string
  currentBalance: number
}

export interface UpdateBalanceResponse {
  message: string
  currentBalance: number
}

export interface MessageResponse {
  message: string
}

export interface VerifyForgotOtpResponse {
  success: boolean
  message: string
  resetToken: string
}