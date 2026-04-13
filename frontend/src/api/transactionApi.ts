import api from './axiosInstance'
import type {
  AddTransactionPayload,
  AddTransactionResponse,
  GetTransactionsResponse,
  TransactionFilters,
} from '@/types/transaction.types'

const BASE = '/api/transactions'

// ─── Add Transaction ───
export const addTransactionApi = (payload: AddTransactionPayload) =>
  api.post<AddTransactionResponse>(`${BASE}/add-transaction`, payload)

// ─── Get Transactions ──
export const getTransactionsApi = (filters: TransactionFilters = {}) => {
  // Remove empty/undefined values so they don't get sent as empty query params
  const params = Object.fromEntries(
    Object.entries(filters).filter(([_, v]) => v !== '' && v !== undefined)
  )

  return api.get<GetTransactionsResponse>(`${BASE}/get-transactions`, { params })
}