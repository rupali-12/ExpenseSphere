import { defineStore } from "pinia";
import { ref, reactive } from "vue";
import type {
  Transaction,
  TransactionFilters,
  AddTransactionPayload,
} from "@/types/transaction.types";
import {
  addTransactionApi,
  deleteTransactionApi,
  editTransactionNoteApi,
  getTransactionsApi,
} from "@/api/transactionApi";
import { useAuthStore } from "./authStore";

export const useTransactionStore = defineStore("transaction", () => {
  // ─── State ────────────────────────────────────────────────────────────────
  const transactions = ref<Transaction[]>([]);
  const total = ref<number>(0);
  const pages = ref<number>(1);
  const currentPage = ref<number>(1);
  const totalDeposits = ref<number>(0);
  const totalWithdrawals = ref<number>(0);
  const netChange = ref<number>(0);
  const isLoading = ref<boolean>(false);

  // ─── Filters ──────────────────────────────────────────────────────────────
  const filters = reactive<TransactionFilters>({
    page: 1,
    limit: 10,
    type: "",
    startDate: "",
    endDate: "",
    search: "",
  });

  // ─── Fetch Transactions ───────────────────────────────────────────────────
  const fetchTransactions = async (overrideFilters?: TransactionFilters) => {
    isLoading.value = true;
    try {
      const activeFilters = overrideFilters ?? filters;
      const response = await getTransactionsApi(activeFilters);
      const data = response.data;

      transactions.value = Array.isArray(data.data) ? data.data : [];
      total.value = data.total ?? 0;
      pages.value = data.pages ?? 1;
      currentPage.value = data.page ?? 1;
      totalDeposits.value = data.totalDeposits ?? 0;
      totalWithdrawals.value = data.totalWithdrawals ?? 0;
      netChange.value = data.netChange ?? 0;
    } catch {
      transactions.value = [];
      total.value = 0;
      pages.value = 1;
      currentPage.value = 1;
      totalDeposits.value = 0;
      totalWithdrawals.value = 0;
      netChange.value = 0;
    } finally {
      isLoading.value = false;
    }
  };

  // ─── Add Transaction ──────────────────────────────────────────────────────
  const addTransaction = async (payload: AddTransactionPayload) => {
    const response = await addTransactionApi(payload);
    const { transaction, currentBalance } = response.data;

    transactions.value.unshift(transaction);
    total.value += 1;

    const authStore = useAuthStore();
    if (authStore.user) {
      authStore.user.currentBalance = currentBalance;
    }

    return response.data;
  };

  // ─── Apply Filters ────────────────────────────────────────────────────────
  const applyFilters = async (newFilters: TransactionFilters) => {
    Object.assign(filters, { ...newFilters, page: 1 });
    await fetchTransactions();
  };

  // ─── Change Page ──────────────────────────────────────────────────────────
  const changePage = async (page: number) => {
    filters.page = page;
    await fetchTransactions();
  };

  // ─── Reset Filters ────────────────────────────────────────────────────────
  const resetFilters = async () => {
    Object.assign(filters, {
      page: 1,
      limit: 10,
      type: "",
      startDate: "",
      endDate: "",
      search: "",
    });
    await fetchTransactions();
  };

  // ─── Edit Note ────────────────────────────────────────────────────────────
  const editNote = async (id: string, note: string) => {
    const response = await editTransactionNoteApi(id, { note });
    const index = transactions.value.findIndex((t) => t._id === id);
    if (index !== -1) {
      transactions.value[index] = response.data.transaction;
    }
    return response.data;
  };

  const deleteTransaction = async (id: string) => {
    const response = await deleteTransactionApi(id);
    const { currentBalance } = response.data;
    transactions.value = transactions.value.filter((t) => t._id !== id);
    total.value = Math.max(0, total.value - 1);
    const authStore = useAuthStore();
    if (authStore.user) {
      authStore.user.currentBalance = currentBalance;
    }
    return response.data;
  };

  // ─── Return ───────────────────────────────────────────────────────────────
  return {
    transactions,
    total,
    pages,
    currentPage,
    totalDeposits,
    totalWithdrawals,
    netChange,
    isLoading,
    filters,
    fetchTransactions,
    addTransaction,
    applyFilters,
    changePage,
    resetFilters,
    editNote,
    deleteTransaction,
  };
});
