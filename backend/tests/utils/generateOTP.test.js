// tests/utils/generateOTP.test.js
import { generateOTP } from '../../utils/generateOTP.js'

describe('generateOTP', () => {

  it('returns an object with otp and otpHash properties', async () => {
    const result = await generateOTP()
    expect(result).toHaveProperty('otp')
    expect(result).toHaveProperty('otpHash')
  })

  it('otp is a string of exactly 6 digits', async () => {
    const { otp } = await generateOTP()
    expect(typeof otp).toBe('string')
    expect(otp).toMatch(/^\d{6}$/)
  })

  it('otp value is between 100000 and 999999', async () => {
    const { otp } = await generateOTP()
    const num = parseInt(otp)
    expect(num).toBeGreaterThanOrEqual(100000)
    expect(num).toBeLessThanOrEqual(999999)
  })

  it('otpHash is a bcrypt hash string starting with $2b$', async () => {
    const { otpHash } = await generateOTP()
    expect(typeof otpHash).toBe('string')
    expect(otpHash).toMatch(/^\$2[ab]\$/)
  })

  it('otpHash is different from the plain otp', async () => {
    const { otp, otpHash } = await generateOTP()
    expect(otp).not.toBe(otpHash)
  })

  it('two calls produce two separate result objects', async () => {
    const first  = await generateOTP()
    const second = await generateOTP()
    expect(first).not.toBe(second)
  })

})