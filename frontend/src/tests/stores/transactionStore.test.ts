import { setActivePinia, createPinia } from 'pinia'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { useTransactionStore } from '@/stores/transactionStore'
import * as txApi from '@/api/transactionApi'

vi.mock('@/api/transactionApi')
vi.mock('@/stores/authStore', () => ({
  useAuthStore: () => ({ user: { currentBalance: 0 } })
}))

const mockTransactions = [
  { _id: 't1', type: 'deposit', amount: 3000, note: 'Salary',
    beforeBalance: 0, afterBalance: 3000, date: '2025-01-01',
    user: 'u1', createdAt: '', updatedAt: '' },
  { _id: 't2', type: 'withdrawal', amount: 500, note: 'Grocery',
    beforeBalance: 3000, afterBalance: 2500, date: '2025-01-05',
    user: 'u1', createdAt: '', updatedAt: '' },
]

describe('transactionStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('initializes with empty state', () => {
    const store = useTransactionStore()
    expect(store.transactions).toEqual([])
    expect(store.total).toBe(0)
    expect(store.pages).toBe(1)
  })

  it('fetchTransactions() populates state on success', async () => {
    vi.mocked(txApi.getTransactionsApi).mockResolvedValue({
      data: {
        success: true, data: mockTransactions,
        total: 2, pages: 1, page: 1, count: 2,
        totalDeposits: 3000, totalWithdrawals: 500, netChange: 2500
      }
    } as any)

    const store = useTransactionStore()
    await store.fetchTransactions()

    expect(store.transactions).toHaveLength(2)
    expect(store.total).toBe(2)
    expect(store.totalDeposits).toBe(3000)
    expect(store.totalWithdrawals).toBe(500)
  })

  it('addTransaction() prepends new transaction to list', async () => {
    const newTx = { _id: 't3', type: 'deposit', amount: 1000,
      note: 'Bonus', beforeBalance: 2500, afterBalance: 3500,
      date: '2025-01-10', user: 'u1', createdAt: '', updatedAt: '' }

    vi.mocked(txApi.addTransactionApi).mockResolvedValue({
      data: { message: 'ok', transaction: newTx, currentBalance: 3500 }
    } as any)

    const store = useTransactionStore()
    store.transactions = [...mockTransactions] as any

    await store.addTransaction({ type: 'deposit', amount: 1000, note: 'Bonus' })

    expect(store.transactions[0]._id).toBe('t3')
    expect(store.transactions).toHaveLength(3)
  })

  it('resetFilters() resets all filters to default', async () => {
    vi.mocked(txApi.getTransactionsApi).mockResolvedValue({
      data: { success: true, data: [], total: 0, pages: 1,
              page: 1, count: 0, totalDeposits: 0, totalWithdrawals: 0, netChange: 0 }
    } as any)

    const store = useTransactionStore()
    store.filters.type = 'withdrawal'
    store.filters.search = 'grocery'
    store.filters.page = 5

    await store.resetFilters()

    expect(store.filters.type).toBe('')
    expect(store.filters.search).toBe('')
    expect(store.filters.page).toBe(1)
  })
})