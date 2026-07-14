import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '@/stores/authStore'
import * as authApi from '@/api/authApi'

vi.mock('@/api/authApi')

const mockAuthApi = authApi as {
  registerApi:       ReturnType<typeof vi.fn>
  verifyOtpApi:      ReturnType<typeof vi.fn>
  resendOtpApi:      ReturnType<typeof vi.fn>
  loginApi:          ReturnType<typeof vi.fn>
  logoutApi:         ReturnType<typeof vi.fn>
  getProfileApi:     ReturnType<typeof vi.fn>
  updateUserApi:     ReturnType<typeof vi.fn>
  forgotPasswordApi: ReturnType<typeof vi.fn>
  verifyForgotOtpApi:ReturnType<typeof vi.fn>
  resetPasswordApi:  ReturnType<typeof vi.fn>
}

describe('authStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  describe('initial state', () => {
    it('starts with null user, not authenticated, empty resetToken', () => {
      const store = useAuthStore()
      expect(store.user).toBeNull()
      expect(store.isAuthenticated).toBe(false)
      expect(store.resetToken).toBe('')
    })
  })

  // ─── register ────────────────────────────────────────────────────────────
  describe('register', () => {
    it('calls registerApi and returns response data', async () => {
      mockAuthApi.registerApi.mockResolvedValueOnce({ data: { message: 'OTP sent' } })
      const store = useAuthStore()

      const res = await store.register({ name: 'Alice', email: 'alice@example.com', password: 'pass' })

      expect(mockAuthApi.registerApi).toHaveBeenCalledOnce()
      expect(res.message).toBe('OTP sent')
    })
  })

  // ─── verifyOtp ───────────────────────────────────────────────────────────
  describe('verifyOtp', () => {
    it('sets user and isAuthenticated on success', async () => {
      mockAuthApi.verifyOtpApi.mockResolvedValueOnce({
        data: { _id: 'u1', name: 'Alice', email: 'alice@example.com', token: 'tok', message: 'ok' },
      })
      const store = useAuthStore()

      await store.verifyOtp({ email: 'alice@example.com', otp: '123456' })

      expect(store.isAuthenticated).toBe(true)
      expect(store.user?._id).toBe('u1')
      expect(store.user?.currentBalance).toBe(0)
    })
  })

  // ─── resendOtp ───────────────────────────────────────────────────────────
  describe('resendOtp', () => {
    it('calls resendOtpApi and returns data', async () => {
      mockAuthApi.resendOtpApi.mockResolvedValueOnce({ data: { message: 'OTP resent' } })
      const store = useAuthStore()

      const res = await store.resendOtp('alice@example.com')

      expect(mockAuthApi.resendOtpApi).toHaveBeenCalledWith('alice@example.com')
      expect(res.message).toBe('OTP resent')
    })
  })

  // ─── login ───────────────────────────────────────────────────────────────
  describe('login', () => {
    it('sets user and isAuthenticated on successful login', async () => {
      mockAuthApi.loginApi.mockResolvedValueOnce({
        data: { _id: 'u2', name: 'Bob', email: 'bob@example.com', token: 'tok2', message: 'ok' },
      })
      const store = useAuthStore()

      await store.login({ email: 'bob@example.com', password: 'pass' })

      expect(store.isAuthenticated).toBe(true)
      expect(store.user?.name).toBe('Bob')
      expect(store.user?.email).toBe('bob@example.com')
    })

    it('sets currentBalance to 0 on login', async () => {
      mockAuthApi.loginApi.mockResolvedValueOnce({
        data: { _id: 'u2', name: 'Bob', email: 'bob@example.com', token: 'tok2', message: 'ok' },
      })
      const store = useAuthStore()
      await store.login({ email: 'bob@example.com', password: 'pass' })
      expect(store.user?.currentBalance).toBe(0)
    })
  })

  // ─── logout ──────────────────────────────────────────────────────────────
  describe('logout', () => {
    it('clears user, isAuthenticated and resetToken', async () => {
      mockAuthApi.loginApi.mockResolvedValueOnce({
        data: { _id: 'u1', name: 'Alice', email: 'alice@example.com', token: 'tok', message: 'ok' },
      })
      mockAuthApi.logoutApi.mockResolvedValueOnce({ data: { message: 'logged out' } })
      const store = useAuthStore()

      await store.login({ email: 'alice@example.com', password: 'pass' })
      store.resetToken = 'sometoken'
      await store.logout()

      expect(store.user).toBeNull()
      expect(store.isAuthenticated).toBe(false)
      expect(store.resetToken).toBe('')
    })
  })

  // ─── fetchProfile ────────────────────────────────────────────────────────
  describe('fetchProfile', () => {
    it('sets user and isAuthenticated from profile response', async () => {
      mockAuthApi.getProfileApi.mockResolvedValueOnce({
        data: { _id: 'u1', name: 'Alice', email: 'alice@example.com', currentBalance: 750 },
      })
      const store = useAuthStore()

      await store.fetchProfile()

      expect(store.isAuthenticated).toBe(true)
      expect(store.user?.currentBalance).toBe(750)
    })
  })

  // ─── updateUser ──────────────────────────────────────────────────────────
  describe('updateUser', () => {
    it('calls updateUserApi and then fetchProfile', async () => {
      mockAuthApi.updateUserApi.mockResolvedValueOnce({ data: { message: 'updated' } })
      mockAuthApi.getProfileApi.mockResolvedValueOnce({
        data: { _id: 'u1', name: 'NewName', email: 'alice@example.com', currentBalance: 0 },
      })
      const store = useAuthStore()

      await store.updateUser({ name: 'NewName' })

      expect(mockAuthApi.updateUserApi).toHaveBeenCalledOnce()
      expect(mockAuthApi.getProfileApi).toHaveBeenCalledOnce()
      expect(store.user?.name).toBe('NewName')
    })
  })

  // ─── forgotPassword ──────────────────────────────────────────────────────
  describe('forgotPassword', () => {
    it('calls forgotPasswordApi and returns data', async () => {
      mockAuthApi.forgotPasswordApi.mockResolvedValueOnce({ data: { message: 'OTP sent' } })
      const store = useAuthStore()

      const res = await store.forgotPassword({ email: 'alice@example.com' })

      expect(res.message).toBe('OTP sent')
    })
  })

  // ─── verifyForgotOtp ─────────────────────────────────────────────────────
  describe('verifyForgotOtp', () => {
    it('stores resetToken from response', async () => {
      mockAuthApi.verifyForgotOtpApi.mockResolvedValueOnce({
        data: { success: true, message: 'ok', resetToken: 'reset-abc' },
      })
      const store = useAuthStore()

      await store.verifyForgotOtp({ email: 'alice@example.com', otp: '000000' })

      expect(store.resetToken).toBe('reset-abc')
    })
  })

  // ─── resetPassword ───────────────────────────────────────────────────────
  describe('resetPassword', () => {
    it('clears resetToken after successful reset', async () => {
      mockAuthApi.resetPasswordApi.mockResolvedValueOnce({ data: { message: 'Password reset successful' } })
      const store = useAuthStore()
      store.resetToken = 'reset-abc'

      await store.resetPassword({ resetToken: 'reset-abc', newPassword: 'newpass', confirmPassword: 'newpass' })

      expect(store.resetToken).toBe('')
    })

    it('returns response data', async () => {
      mockAuthApi.resetPasswordApi.mockResolvedValueOnce({ data: { message: 'Password reset successful' } })
      const store = useAuthStore()

      const res = await store.resetPassword({ resetToken: 'tok', newPassword: 'pass', confirmPassword: 'pass' })

      expect(res.message).toBe('Password reset successful')
    })
  })
})