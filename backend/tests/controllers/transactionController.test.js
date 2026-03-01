// tests/controllers/transactionController.test.js
import {
  addTransaction,
  getTransactions,
} from '../../controllers/transactionController.js'

import Transaction from '../../models/Transaction.js'
import User        from '../../models/User.js'

jest.mock('../../models/Transaction.js')
jest.mock('../../models/User.js')

// ── Factories ───
const makeRes = () => ({
  status: jest.fn().mockReturnThis(),
  json:   jest.fn().mockReturnThis(),
})
const makeReq = (body = {}, user = { _id: 'uid1' }, query = {}) => ({
  body, user, query,
})


//  addTransaction
describe('addTransaction', () => {
  afterEach(() => jest.clearAllMocks())

  it('400 — type missing', async () => {
    const res = makeRes()
    await addTransaction(makeReq({ amount: 500 }), res)
    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith({ message: 'Type and amount are required' })
  })

  it('400 — amount missing', async () => {
    const res = makeRes()
    await addTransaction(makeReq({ type: 'deposit' }), res)
    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith({ message: 'Type and amount are required' })
  })

  it('404 — user not found', async () => {
    User.findById.mockResolvedValue(null)
    const res = makeRes()
    await addTransaction(makeReq({ type: 'deposit', amount: 500 }), res)
    expect(res.status).toHaveBeenCalledWith(404)
    expect(res.json).toHaveBeenCalledWith({ message: 'User not found' })
  })

  it('400 — invalid transaction type', async () => {
    User.findById.mockResolvedValue({ currentBalance: 1000, save: jest.fn() })
    const res = makeRes()
    await addTransaction(makeReq({ type: 'transfer', amount: 500 }), res)
    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith({ message: 'Invalid transaction type' })
  })

  it('400 — insufficient balance on withdrawal', async () => {
    User.findById.mockResolvedValue({ currentBalance: 200, save: jest.fn() })
    const res = makeRes()
    await addTransaction(makeReq({ type: 'withdrawal', amount: 500 }), res)
    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith({ message: 'Insufficient balance' })
  })

  it('201 — deposit: adds amount to balance, creates transaction', async () => {
    const mockUser = {
      currentBalance: 1000,
      save:           jest.fn().mockResolvedValue({}),
    }
    const mockTransaction = {
      _id: 'tx1', type: 'deposit', amount: 500,
      beforeBalance: 1000, afterBalance: 1500,
    }

    User.findById.mockResolvedValue(mockUser)
    Transaction.create.mockResolvedValue(mockTransaction)

    const res = makeRes()
    await addTransaction(
      makeReq({ type: 'deposit', amount: 500, note: 'Salary' }),
      res
    )

    expect(Transaction.create).toHaveBeenCalledWith(
      expect.objectContaining({
        type:          'deposit',
        amount:        500,
        beforeBalance: 1000,
        afterBalance:  1500,
        note:          'Salary',
      })
    )
    expect(mockUser.currentBalance).toBe(1500)
    expect(mockUser.save).toHaveBeenCalled()
    expect(res.status).toHaveBeenCalledWith(201)
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message:        'Transaction added successfully',
        currentBalance: 1500,
      })
    )
  })

  it('201 — withdrawal: subtracts amount from balance', async () => {
    const mockUser = {
      currentBalance: 1000,
      save:           jest.fn().mockResolvedValue({}),
    }
    const mockTransaction = {
      _id: 'tx2', type: 'withdrawal', amount: 300,
      beforeBalance: 1000, afterBalance: 700,
    }

    User.findById.mockResolvedValue(mockUser)
    Transaction.create.mockResolvedValue(mockTransaction)

    const res = makeRes()
    await addTransaction(makeReq({ type: 'withdrawal', amount: 300 }), res)

    expect(Transaction.create).toHaveBeenCalledWith(
      expect.objectContaining({
        type:          'withdrawal',
        amount:        300,
        beforeBalance: 1000,
        afterBalance:  700,
      })
    )
    expect(mockUser.currentBalance).toBe(700)
    expect(res.status).toHaveBeenCalledWith(201)
  })

  it('201 — withdrawal with exact balance (boundary)', async () => {
    const mockUser = { currentBalance: 500, save: jest.fn().mockResolvedValue({}) }
    Transaction.create.mockResolvedValue({ _id: 'tx3', type: 'withdrawal', amount: 500 })
    User.findById.mockResolvedValue(mockUser)

    const res = makeRes()
    await addTransaction(makeReq({ type: 'withdrawal', amount: 500 }), res)

    expect(mockUser.currentBalance).toBe(0)
    expect(res.status).toHaveBeenCalledWith(201)
  })

  it('201 — deposit without note (note is optional)', async () => {
    const mockUser = { currentBalance: 0, save: jest.fn().mockResolvedValue({}) }
    Transaction.create.mockResolvedValue({ _id: 'tx4', type: 'deposit', amount: 100 })
    User.findById.mockResolvedValue(mockUser)

    const res = makeRes()
    await addTransaction(makeReq({ type: 'deposit', amount: 100 }), res)

    expect(res.status).toHaveBeenCalledWith(201)
  })

  it('500 — unexpected DB error', async () => {
    User.findById.mockRejectedValue(new Error('DB crash'))
    const res = makeRes()
    await addTransaction(makeReq({ type: 'deposit', amount: 500 }), res)
    expect(res.status).toHaveBeenCalledWith(500)
    expect(res.json).toHaveBeenCalledWith({ message: 'Error adding transaction' })
  })
})


//  getTransactions
describe('getTransactions', () => {
  afterEach(() => jest.clearAllMocks())

  const mockFindChain = (result) => {
    const chain = {
      sort:  jest.fn().mockReturnThis(),
      skip:  jest.fn().mockReturnThis(),
      limit: jest.fn().mockResolvedValue(result),
    }
    Transaction.find.mockReturnValue(chain)
    return chain
  }

  it('200 — returns transactions with default pagination (page 1, limit 10)', async () => {
    const mockTxs = [
      { _id: 'tx1', type: 'deposit',    amount: 500 },
      { _id: 'tx2', type: 'withdrawal', amount: 200 },
    ]
    mockFindChain(mockTxs)
    Transaction.countDocuments.mockResolvedValue(2)
    Transaction.aggregate.mockResolvedValue([
      { totalDeposits: 500, totalWithdrawals: 200 },
    ])

    const res = makeRes()
    await getTransactions(makeReq({}, { _id: 'uid1' }, {}), res)

    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success:          true,
        total:            2,
        page:             1,
        pages:            1,
        totalDeposits:    500,
        totalWithdrawals: 200,
        netChange:        300,
        data:             mockTxs,
      })
    )
  })

  it('200 — filters by type=deposit', async () => {
    mockFindChain([{ _id: 'tx1', type: 'deposit', amount: 500 }])
    Transaction.countDocuments.mockResolvedValue(1)
    Transaction.aggregate.mockResolvedValue([
      { totalDeposits: 500, totalWithdrawals: 0 },
    ])

    const res = makeRes()
    await getTransactions(
      makeReq({}, { _id: 'uid1' }, { type: 'deposit' }),
      res
    )

    expect(Transaction.find).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'deposit' })
    )
    expect(res.status).toHaveBeenCalledWith(200)
  })

  it('200 — filters by date range (startDate and endDate)', async () => {
    mockFindChain([])
    Transaction.countDocuments.mockResolvedValue(0)
    Transaction.aggregate.mockResolvedValue([])

    const res = makeRes()
    await getTransactions(
      makeReq({}, { _id: 'uid1' }, {
        startDate: '2025-01-01',
        endDate:   '2025-01-31',
      }),
      res
    )

    expect(Transaction.find).toHaveBeenCalledWith(
      expect.objectContaining({
        date: expect.objectContaining({
          $gte: expect.any(Date),
          $lte: expect.any(Date),
        }),
      })
    )
  })

  it('200 — filters by search keyword in note', async () => {
    mockFindChain([])
    Transaction.countDocuments.mockResolvedValue(0)
    Transaction.aggregate.mockResolvedValue([])

    const res = makeRes()
    await getTransactions(
      makeReq({}, { _id: 'uid1' }, { search: 'grocery' }),
      res
    )

    expect(Transaction.find).toHaveBeenCalledWith(
      expect.objectContaining({
        note: { $regex: 'grocery', $options: 'i' },
      })
    )
  })

  it('200 — handles pagination correctly (page 2, limit 5)', async () => {
    mockFindChain([])
    Transaction.countDocuments.mockResolvedValue(12)
    Transaction.aggregate.mockResolvedValue([
      { totalDeposits: 0, totalWithdrawals: 0 },
    ])

    const res = makeRes()
    await getTransactions(
      makeReq({}, { _id: 'uid1' }, { page: '2', limit: '5' }),
      res
    )

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        page:  2,
        pages: 3, 
      })
    )
  })

  it('200 — returns zeroed totals when aggregate returns empty array', async () => {
    mockFindChain([])
    Transaction.countDocuments.mockResolvedValue(0)
    Transaction.aggregate.mockResolvedValue([]) 

    const res = makeRes()
    await getTransactions(makeReq({}, { _id: 'uid1' }, {}), res)

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        totalDeposits:    0,
        totalWithdrawals: 0,
        netChange:        0,
      })
    )
  })

  it('200 — does NOT apply date filter when only startDate given (no endDate)', async () => {
    mockFindChain([])
    Transaction.countDocuments.mockResolvedValue(0)
    Transaction.aggregate.mockResolvedValue([])

    const res = makeRes()
    await getTransactions(
      makeReq({}, { _id: 'uid1' }, { startDate: '2025-01-01' }), 
      res
    )

    const callArg = Transaction.find.mock.calls[0][0]
    expect(callArg).not.toHaveProperty('date')
  })

  it('200 — does NOT apply search filter when search query is empty', async () => {
    mockFindChain([])
    Transaction.countDocuments.mockResolvedValue(0)
    Transaction.aggregate.mockResolvedValue([])

    const res = makeRes()
    await getTransactions(
      makeReq({}, { _id: 'uid1' }, { search: '' }), 
      res
    )

    const callArg = Transaction.find.mock.calls[0][0]
    expect(callArg).not.toHaveProperty('note')
  })

  it('500 — unexpected DB error', async () => {
    Transaction.find.mockReturnValue({
      sort:  jest.fn().mockReturnThis(),
      skip:  jest.fn().mockReturnThis(),
      limit: jest.fn().mockRejectedValue(new Error('DB crash')),
    })

    const res = makeRes()
    await getTransactions(makeReq({}, { _id: 'uid1' }, {}), res)

    expect(res.status).toHaveBeenCalledWith(500)
    expect(res.json).toHaveBeenCalledWith({ message: 'Server Error' })
  })
})