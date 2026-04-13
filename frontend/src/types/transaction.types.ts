// ─── Core Transaction ────────────────────────────────────────────────────────
export type TransactionType = 'deposit' | 'withdrawal'

export interface Transaction {
  _id: string
  user: string
  type: TransactionType
  amount: number
  note?: string
  beforeBalance: number
  afterBalance: number
  date: string
  createdAt: string
  updatedAt: string
}

// ─── Request Payloads ────────────────────────────────────────────────────────
export interface AddTransactionPayload {
  type: TransactionType
  amount: number
  note?: string
}

export interface TransactionFilters {
  page?: number
  limit?: number
  type?: TransactionType | ''
  startDate?: string
  endDate?: string
  search?: string
}

// ─── API Responses ───────────────────────────────────────────────────────────
export interface AddTransactionResponse {
  message: string
  transaction: Transaction
  currentBalance: number
}

export interface GetTransactionsResponse {
  success: boolean
  count: number
  total: number
  page: number
  pages: number
  totalDeposits: number
  totalWithdrawals: number
  netChange: number
  data: Transaction[]
}
