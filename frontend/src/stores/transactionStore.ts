import { defineStore } from 'pinia'
import { ref, reactive } from 'vue'
import type {
  Transaction,
  TransactionFilters,
  AddTransactionPayload,
} from '@/types/transaction.types'
import {
  addTransactionApi,
  getTransactionsApi,
} from '@/api/transactionApi'
import { useAuthStore } from './authStore'

export const useTransactionStore = defineStore('transaction', () => {
  // ─── State ────────────────────────────────────────────────────────────────
  const transactions = ref<Transaction[]>([])
  const total = ref<number>(0)
  const pages = ref<number>(1)
  const currentPage = ref<number>(1)
  const totalDeposits = ref<number>(0)
  const totalWithdrawals = ref<number>(0)
  const netChange = ref<number>(0)
  const isLoading = ref<boolean>(false)

  // ─── Filters ──────────────────────────────────────────────────────────────
  // reactive() used here because filters is an object
  // we update individual keys not the whole object
  const filters = reactive<TransactionFilters>({
    page: 1,
    limit: 10,
    type: '',
    startDate: '',
    endDate: '',
    search: '',
  })

  // ─── Fetch Transactions ───────────────────────────────────────────────────
  const fetchTransactions = async (overrideFilters?: TransactionFilters) => {
    isLoading.value = true
    try {
      const activeFilters = overrideFilters ?? filters
      const response = await getTransactionsApi(activeFilters)
      const data = response.data

      transactions.value = data.data
      total.value = data.total
      pages.value = data.pages
      currentPage.value = data.page
      totalDeposits.value = data.totalDeposits
      totalWithdrawals.value = data.totalWithdrawals
      netChange.value = data.netChange
    } finally {
      isLoading.value = false
    }
  }

  // ─── Add Transaction ──────────────────────────────────────────────────────
  const addTransaction = async (payload: AddTransactionPayload) => {
    const response = await addTransactionApi(payload)
    const { transaction, currentBalance } = response.data

    // Prepend new transaction to top of list
    transactions.value.unshift(transaction)
    total.value += 1

    // Sync balance back to authStore
    const authStore = useAuthStore()
    if (authStore.user) {
      authStore.user.currentBalance = currentBalance
    }

    return response.data
  }

  // ─── Apply Filters ───
  // Called when user changes filter values
  const applyFilters = async (newFilters: TransactionFilters) => {
    // Reset to page 1 when filters change
    Object.assign(filters, { ...newFilters, page: 1 })
    await fetchTransactions()
  }

  // ─── Change Page ───
  const changePage = async (page: number) => {
    filters.page = page
    await fetchTransactions()
  }

  // ─── Reset Filters ────
  const resetFilters = async () => {
    Object.assign(filters, {
      page: 1,
      limit: 10,
      type: '',
      startDate: '',
      endDate: '',
      search: '',
    })
    await fetchTransactions()
  }

  return {
    // State
    transactions,
    total,
    pages,
    currentPage,
    totalDeposits,
    totalWithdrawals,
    netChange,
    isLoading,
    filters,
    // Actions
    fetchTransactions,
    addTransaction,
    applyFilters,
    changePage,
    resetFilters,
  }
})