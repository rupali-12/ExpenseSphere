import { vi, describe, it, expect, beforeEach } from 'vitest'
import { addTransactionApi, getTransactionsApi } from '@/api/transactionApi'

vi.mock('@/api/axiosInstance', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
    put: vi.fn(),
  },
}))

import api from '@/api/axiosInstance'

describe('transactionApi', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('addTransactionApi calls POST with correct payload', async () => {
    vi.mocked(api.post).mockResolvedValue({
      data: { transaction: {}, currentBalance: 500 }
    })

    await addTransactionApi({ type: 'deposit', amount: 500, note: 'Salary' })

    expect(api.post).toHaveBeenCalledWith(
      '/api/transactions/add-transaction',
      { type: 'deposit', amount: 500, note: 'Salary' }
    )
  })

  it('getTransactionsApi sends correct params', async () => {
    vi.mocked(api.get).mockResolvedValue({
      data: { data: [], total: 0, pages: 1 }
    })

    await getTransactionsApi({ page: 2, limit: 10, type: 'withdrawal' })

    expect(api.get).toHaveBeenCalledWith(
      '/api/transactions/get-transactions',
      { params: { page: 2, limit: 10, type: 'withdrawal' } }
    )
  })

  it('getTransactionsApi strips empty string filters', async () => {
    vi.mocked(api.get).mockResolvedValue({
      data: { data: [], total: 0, pages: 1 }
    })

    await getTransactionsApi({ page: 1, type: '', search: '' })

    const callParams = vi.mocked(api.get).mock.calls[0][1]
    expect(callParams?.params?.type).toBeUndefined()
    expect(callParams?.params?.search).toBeUndefined()
  })
})