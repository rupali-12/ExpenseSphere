import bcrypt from 'bcrypt'
import User from '../../models/User'

jest.mock('bcrypt')

function runPreSave(user) {
  return new Promise((resolve, reject) => {
    user.constructor.schema.s.hooks.execPre(
      'save',
      user,
      err => (err ? reject(err) : resolve())
    )
  })
}

describe('User Model', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('password hashing (pre-save hook)', () => {
    it('hashes password before saving if password is modified', async () => {
      bcrypt.genSalt.mockResolvedValue('salt')
      bcrypt.hash.mockResolvedValue('hashedPassword')

      const user = new User({
        name: 'Rupali',
        email: 'rupali@test.com',
        password: 'plainPassword',
      })

      user.isModified = jest.fn().mockReturnValue(true)

      await runPreSave(user)

      expect(bcrypt.genSalt).toHaveBeenCalledWith(10)
      expect(bcrypt.hash).toHaveBeenCalledWith('plainPassword', 'salt')
      expect(user.password).toBe('hashedPassword')
    })

    it('does NOT hash password if not modified', async () => {
      const user = new User({
        name: 'Rupali',
        email: 'rupali@test.com',
        password: 'plainPassword',
      })

      user.isModified = jest.fn().mockReturnValue(false)

      await runPreSave(user)

      expect(bcrypt.hash).not.toHaveBeenCalled()
    })

    it('does NOT rehash password if already hashed', async () => {
      const user = new User({
        name: 'Rupali',
        email: 'rupali@test.com',
        password: '$2b$alreadyHashed',
      })

      user.isModified = jest.fn().mockReturnValue(true)

      await runPreSave(user)

      expect(bcrypt.hash).not.toHaveBeenCalled()
    })
  })

  describe('matchPassword()', () => {
    it('returns true if passwords match', async () => {
      bcrypt.compare.mockResolvedValue(true)

      const user = new User({ password: 'hashed' })
      const result = await user.matchPassword('plain')

      expect(result).toBe(true)
    })

    it('returns false if passwords do not match', async () => {
      bcrypt.compare.mockResolvedValue(false)

      const user = new User({ password: 'hashed' })
      const result = await user.matchPassword('plain')

      expect(result).toBe(false)
    })
  })
})