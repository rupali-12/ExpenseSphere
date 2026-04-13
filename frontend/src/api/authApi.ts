import api from './axiosInstance'
import type {
  RegisterPayload,
  VerifyOtpPayload,
  LoginPayload,
  ForgotPasswordPayload,
  VerifyForgotOtpPayload,
  ResetPasswordPayload,
  UpdateUserPayload,
  UpdateBalancePayload,
  AuthResponse,
  ProfileResponse,
  UpdateBalanceResponse,
  MessageResponse,
  VerifyForgotOtpResponse,
} from '@/types/auth.types'

const BASE = '/api/users'

// ─── Register — Step 1 ───
export const registerApi = (payload: RegisterPayload) =>
  api.post<MessageResponse>(`${BASE}/register`, payload)

// ─── Verify OTP — Step 2 ────
export const verifyOtpApi = (payload: VerifyOtpPayload) =>
  api.post<AuthResponse>(`${BASE}/verify-otp`, payload)

// ─── Resend OTP -───────
export const resendOtpApi = (email: string) =>
  api.post<MessageResponse>(`${BASE}/resend-otp`, { email })

// ─── Login -────────────
export const loginApi = (payload: LoginPayload) =>
  api.post<AuthResponse>(`${BASE}/login`, payload)

// ─── Logout -───────────
export const logoutApi = () =>
  api.post<MessageResponse>(`${BASE}/logout`)

// ─── Get Profile -──────
export const getProfileApi = () =>
  api.get<ProfileResponse>(`${BASE}/profile`)

// ─── Update Balance -───
export const updateBalanceApi = (payload: UpdateBalancePayload) =>
  api.put<UpdateBalanceResponse>(`${BASE}/update-balance`, payload)

// ─── Update User Details ─
export const updateUserApi = (payload: UpdateUserPayload) =>
  api.put<MessageResponse>(`${BASE}/update-user`, payload)

// ─── Forgot Password -──
export const forgotPasswordApi = (payload: ForgotPasswordPayload) =>
  api.post<MessageResponse>(`${BASE}/forgot-password`, payload)

// ─── Verify Forgot OTP -
export const verifyForgotOtpApi = (payload: VerifyForgotOtpPayload) =>
  api.post<VerifyForgotOtpResponse>(`${BASE}/verify-forgot-otp`, payload)

// ─── Reset Password -───
export const resetPasswordApi = (payload: ResetPasswordPayload) =>
  api.post<MessageResponse>(`${BASE}/reset-password`, payload)