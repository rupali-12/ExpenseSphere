// tests/middleware/authMiddleware.test.js
import { protect } from '../../middlewares/authMiddleware.js'
import jwt  from 'jsonwebtoken'
import User from '../../models/User.js'

jest.mock('jsonwebtoken')
jest.mock('../../models/User.js')

// ── Helpers ───
const makeReq  = (token) => ({ cookies: { jwt: token } })
const makeRes  = () => ({
  status: jest.fn().mockReturnThis(),
  json:   jest.fn().mockReturnThis(),
})
const makeNext = () => jest.fn()

describe('protect middleware', () => {
  afterEach(() => jest.clearAllMocks())

  it('returns 401 with "no token" message when cookie is missing', async () => {
    const req  = makeReq(undefined)
    const res  = makeRes()
    const next = makeNext()

    await protect(req, res, next)

    expect(res.status).toHaveBeenCalledWith(401)
    expect(res.json).toHaveBeenCalledWith({ message: 'Not authorized, no token' })
    expect(next).not.toHaveBeenCalled()
  })

  it('returns 401 with "no token" when cookie is empty string', async () => {
    const req  = makeReq('')
    const res  = makeRes()
    const next = makeNext()

    await protect(req, res, next)

    expect(res.status).toHaveBeenCalledWith(401)
    expect(next).not.toHaveBeenCalled()
  })

  it('sets req.user and calls next() when token is valid', async () => {
    const mockUser = { _id: 'uid1', name: 'John', email: 'john@test.com' }

    jwt.verify.mockReturnValue({ userId: 'uid1' })
    User.findById.mockReturnValue({
      select: jest.fn().mockResolvedValue(mockUser),
    })

    const req  = makeReq('valid.jwt.token')
    const res  = makeRes()
    const next = makeNext()

    await protect(req, res, next)

    expect(jwt.verify).toHaveBeenCalledWith(
      'valid.jwt.token',
      process.env.JWT_SECRET
    )
    expect(User.findById).toHaveBeenCalledWith('uid1')
    expect(req.user).toEqual(mockUser)
    expect(next).toHaveBeenCalled()
    expect(res.status).not.toHaveBeenCalled()
  })

  it('calls next() with req.user as null when user not found in DB', async () => {
    jwt.verify.mockReturnValue({ userId: 'nonexistent' })
    User.findById.mockReturnValue({
      select: jest.fn().mockResolvedValue(null),
    })

    const req  = makeReq('valid.token')
    const res  = makeRes()
    const next = makeNext()

    await protect(req, res, next)

    expect(req.user).toBeNull()
    expect(next).toHaveBeenCalled()
  })

  it('returns 401 "token failed" when jwt.verify throws', async () => {
    jwt.verify.mockImplementation(() => {
      throw new Error('jwt malformed')
    })

    const req  = makeReq('bad.token.here')
    const res  = makeRes()
    const next = makeNext()

    await protect(req, res, next)

    expect(res.status).toHaveBeenCalledWith(401)
    expect(res.json).toHaveBeenCalledWith({ message: 'Not authorized, token failed' })
    expect(next).not.toHaveBeenCalled()
  })

  it('returns 401 "token failed" when jwt.verify throws expired error', async () => {
    jwt.verify.mockImplementation(() => {
      throw new Error('jwt expired')
    })

    const req  = makeReq('expired.token')
    const res  = makeRes()
    const next = makeNext()

    await protect(req, res, next)

    expect(res.status).toHaveBeenCalledWith(401)
    expect(res.json).toHaveBeenCalledWith({ message: 'Not authorized, token failed' })
  })

})