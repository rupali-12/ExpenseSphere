import { vi, describe, it, expect, beforeEach } from 'vitest'
import { loginApi, registerApi, verifyOtpApi, logoutApi } from '@/api/authApi'

// Mock the entire axios instance
vi.mock('@/api/axiosInstance', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
    put: vi.fn(),
  },
}))

// Import the mocked instance
import api from '@/api/axiosInstance'

describe('authApi', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('loginApi calls POST /api/users/login with correct payload', async () => {
    const mockResponse = { data: { _id: '1', name: 'John', token: 'tok' } }
    vi.mocked(api.post).mockResolvedValue(mockResponse)

    const result = await loginApi({ email: 'john@test.com', password: 'pass123' })

    expect(api.post).toHaveBeenCalledWith(
      '/api/users/login',
      { email: 'john@test.com', password: 'pass123' }
    )
    expect(result.data._id).toBe('1')
  })

  it('registerApi calls POST /api/users/register with correct payload', async () => {
    vi.mocked(api.post).mockResolvedValue({ data: { message: 'OTP sent' } })

    await registerApi({ name: 'John', email: 'john@test.com', password: 'pass123' })

    expect(api.post).toHaveBeenCalledWith(
      '/api/users/register',
      { name: 'John', email: 'john@test.com', password: 'pass123' }
    )
  })

  it('verifyOtpApi calls POST /api/users/verify-otp', async () => {
    vi.mocked(api.post).mockResolvedValue({ data: { message: 'Success', token: 'tok' } })

    await verifyOtpApi({ email: 'john@test.com', otp: '123456' })

    expect(api.post).toHaveBeenCalledWith(
      '/api/users/verify-otp',
      { email: 'john@test.com', otp: '123456' }
    )
  })

  it('logoutApi calls POST /api/users/logout', async () => {
    vi.mocked(api.post).mockResolvedValue({ data: { message: 'Logged out' } })

    await logoutApi()

    expect(api.post).toHaveBeenCalledWith('/api/users/logout')
  })
})