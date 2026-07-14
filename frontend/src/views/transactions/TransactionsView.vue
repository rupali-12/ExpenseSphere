<template>
  <div class="space-y-4">
    <!-- ── Summary Bar ───────────────────────────────────────────────── -->
    <div class="grid grid-cols-3 gap-3 animate-fade-up">
      <div
        v-for="(item, i) in summary"
        :key="i"
        :class="[
          'bg-white rounded-xl border border-[#E2E8F0] p-4 shadow-sm',
          `delay-${i}00`,
        ]"
      >
        <p class="text-xs text-[#64748B] font-medium uppercase tracking-wide">
          {{ item.label }}
        </p>
        <p :class="['font-mono text-lg font-bold mt-1', item.color]">
          ₹{{ formatAmount(item.value) }}
        </p>
      </div>
    </div>

    <!-- ── Filters ────────────────────────────────────────────────────── -->
    <div
      class="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-4 animate-fade-up delay-100"
    >
      <div class="flex flex-wrap gap-3 items-end">
        <!-- Search -->
        <div class="flex-1 min-w-48">
          <label class="text-xs font-semibold text-[#1E293B] mb-1.5 block"
            >Search</label
          >
          <div class="relative">
            <svg
              class="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              v-model="localFilters.search"
              type="text"
              placeholder="Search by note..."
              class="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E2E8F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#00B4D8]/20 focus:border-[#00B4D8] transition-all"
              @keyup.enter="applyFilters"
            />
          </div>
        </div>

        <!-- Type -->
        <div class="min-w-36">
          <label class="text-xs font-semibold text-[#1E293B] mb-1.5 block"
            >Type</label
          >
          <select
            v-model="localFilters.type"
            class="w-full px-3 py-2.5 rounded-xl border border-[#E2E8F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#00B4D8]/20 focus:border-[#00B4D8] bg-white transition-all"
          >
            <option value="">All types</option>
            <option value="deposit">Deposit</option>
            <option value="withdrawal">Withdrawal</option>
          </select>
        </div>

        <!-- Start Date -->
        <div class="min-w-36">
          <label class="text-xs font-semibold text-[#1E293B] mb-1.5 block"
            >From</label
          >
          <input
            v-model="localFilters.startDate"
            type="date"
            class="w-full px-3 py-2.5 rounded-xl border border-[#E2E8F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#00B4D8]/20 focus:border-[#00B4D8] bg-white transition-all"
          />
        </div>

        <!-- End Date -->
        <div class="min-w-36">
          <label class="text-xs font-semibold text-[#1E293B] mb-1.5 block"
            >To</label
          >
          <input
            v-model="localFilters.endDate"
            type="date"
            class="w-full px-3 py-2.5 rounded-xl border border-[#E2E8F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#00B4D8]/20 focus:border-[#00B4D8] bg-white transition-all"
          />
        </div>

        <!-- Buttons -->
        <div class="flex gap-2">
          <BaseButton variant="primary" size="md" @click="applyFilters"
            >Apply</BaseButton
          >
          <BaseButton variant="ghost" size="md" @click="resetFilters"
            >Reset</BaseButton
          >
          <BaseButton variant="secondary" size="md" @click="exportCSV">
            ↓ Export CSV
          </BaseButton>
        </div>
      </div>
    </div>

    <!-- ── Passbook Table ─────────────────────────────────────────────── -->
    <div
      class="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden animate-fade-up delay-200"
    >
      <!-- Table Header -->
      <div
        class="grid grid-cols-12 gap-2 px-5 py-3 bg-[#F8FAFC] border-b border-[#E2E8F0]"
      >
        <div
          class="col-span-2 text-xs font-bold text-[#64748B] uppercase tracking-wide"
        >
          Date
        </div>
        <div
          class="col-span-1 text-xs font-bold text-[#64748B] uppercase tracking-wide"
        >
          Type
        </div>
        <div
          class="col-span-3 text-xs font-bold text-[#64748B] uppercase tracking-wide"
        >
          Note
        </div>
        <div
          class="col-span-2 text-xs font-bold text-[#64748B] uppercase tracking-wide text-right"
        >
          Amount
        </div>
        <div
          class="col-span-2 text-xs font-bold text-[#64748B] uppercase tracking-wide text-right"
        >
          Before
        </div>
        <div
          class="col-span-2 text-xs font-bold text-[#64748B] uppercase tracking-wide text-right"
        >
          Balance
        </div>
      </div>

      <!-- Loading -->
      <div
        v-if="txStore.isLoading"
        class="flex items-center justify-center py-16"
      >
        <div
          class="w-6 h-6 border-2 border-[#E2E8F0] border-t-[#1A365D] rounded-full animate-spin"
        />
      </div>

      <!-- Empty -->
      <div
        v-else-if="!txStore.transactions?.length"
        class="flex flex-col items-center justify-center py-16 text-center"
      >
        <div
          class="w-14 h-14 rounded-2xl bg-[#F0F4F8] flex items-center justify-center mb-3"
        >
          <svg
            class="w-7 h-7 text-[#94A3B8]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="1.5"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
        </div>
        <p class="text-sm font-semibold text-[#64748B]">
          No transactions found
        </p>
        <p class="text-xs text-[#94A3B8] mt-1">Try adjusting your filters</p>
      </div>

      <!-- Rows -->
      <div v-else>
        <div
          v-for="(tx, i) in txStore.transactions ?? []"
          :key="tx._id"
          :class="[
            'grid grid-cols-12 gap-2 px-5 py-3.5 border-b border-[#F1F5F9] hover:bg-[#F8FAFC] transition-colors items-center',
            i === (txStore.transactions?.length ?? 0) - 1 ? 'border-0' : '',
          ]"
        >
          <!-- Date -->
          <div class="col-span-2">
            <p class="text-xs font-mono text-[#1E293B]">
              {{ formatDateShort(tx.date) }}
            </p>
          </div>

          <!-- Type badge -->
          <div class="col-span-1">
            <BaseBadge
              :variant="tx.type === 'deposit' ? 'deposit' : 'withdrawal'"
              size="sm"
            >
              {{ tx.type === "deposit" ? "↑" : "↓" }}
            </BaseBadge>
          </div>

          <!-- Note -->
          <div class="col-span-3">
            <p class="text-sm text-[#1E293B] truncate">
              {{
                tx.note || (tx.type === "deposit" ? "Deposit" : "Withdrawal")
              }}
            </p>
          </div>

          <!-- Amount -->
          <div class="col-span-2 text-right">
            <p
              :class="[
                'font-mono text-sm font-bold',
                tx.type === 'deposit' ? 'text-[#059669]' : 'text-[#DC2626]',
              ]"
            >
              {{ tx.type === "deposit" ? "+" : "-" }}₹{{
                formatAmount(tx.amount)
              }}
            </p>
          </div>

          <!-- Before Balance -->
          <div class="col-span-2 text-right">
            <p class="font-mono text-xs text-[#94A3B8]">
              ₹{{ formatAmount(tx.beforeBalance) }}
            </p>
          </div>

          <!-- After Balance -->
          <div class="col-span-2 text-right">
            <p class="font-mono text-sm font-semibold text-[#1A365D]">
              ₹{{ formatAmount(tx.afterBalance) }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Pagination ─────────────────────────────────────────────────── -->
    <div
      v-if="(txStore.pages ?? 0) > 1"
      class="flex items-center justify-between bg-white rounded-2xl border border-[#E2E8F0] shadow-sm px-5 py-3 animate-fade-up delay-300"
    >
      <p class="text-xs text-[#64748B]">
        Showing page
        <span class="font-bold text-[#1E293B]">{{ txStore.currentPage }}</span>
        of
        <span class="font-bold text-[#1E293B]">{{ txStore.pages }}</span>
        ·
        <span class="font-bold text-[#1E293B]">{{ txStore.total }}</span> total
      </p>
      <div class="flex items-center gap-1">
        <button
          @click="txStore.changePage?.(txStore.currentPage - 1)"
          :disabled="txStore.currentPage === 1"
          class="w-8 h-8 rounded-lg flex items-center justify-center text-[#64748B] hover:bg-[#F0F4F8] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <svg
            class="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
        <button
          v-for="page in visiblePages"
          :key="page"
          @click="typeof page === 'number' && txStore.changePage?.(page)"
          :class="[
            'w-8 h-8 rounded-lg text-sm font-semibold transition-colors',
            page === txStore.currentPage
              ? 'bg-[#1A365D] text-white'
              : page === '...'
                ? 'cursor-default text-[#94A3B8]'
                : 'text-[#64748B] hover:bg-[#F0F4F8]',
          ]"
        >
          {{ page }}
        </button>
        <button
          @click="txStore.changePage?.(txStore.currentPage + 1)"
          :disabled="txStore.currentPage === txStore.pages"
          class="w-8 h-8 rounded-lg flex items-center justify-center text-[#64748B] hover:bg-[#F0F4F8] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <svg
            class="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, onMounted } from "vue";
import { useTransactionStore } from "@/stores/transactionStore";
import { formatAmount } from "@/utils/formatCurrency";
import { formatDateShort } from "@/utils/formatDate";
import BaseButton from "@/components/common/BaseButton.vue";
import BaseBadge from "@/components/common/BaseBadge.vue";
import type { TransactionType } from "@/types/transaction.types";

const txStore = useTransactionStore();

const localFilters = reactive({
  search: "",
  type: "" as TransactionType | "",
  startDate: "",
  endDate: "",
});

const exportCSV = () => {
  const rows = txStore.transactions;

  if (!rows.length) {
    alert("No transactions to export");
    return;
  }

  // Build CSV content
  const headers = [
    "Date",
    "Type",
    "Note",
    "Amount",
    "Before Balance",
    "After Balance",
  ];

  const lines = rows.map((tx) =>
    [
      formatDateShort(tx.date),
      tx.type,
      tx.note || "",
      tx.type === "deposit" ? tx.amount : -tx.amount,
      tx.beforeBalance,
      tx.afterBalance,
    ]
      .map((val) => `"${val}"`)
      .join(","),
  );

  const csv = [headers.join(","), ...lines].join("\n");

  // Trigger download
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `transactions-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
};

const summary = computed(() => [
  {
    label: "Total Deposits",
    value: txStore.totalDeposits ?? 0,
    color: "text-[#059669]",
  },
  {
    label: "Total Withdrawals",
    value: txStore.totalWithdrawals ?? 0,
    color: "text-[#DC2626]",
  },
  {
    label: "Net Change",
    value: txStore.netChange ?? 0,
    color: (txStore.netChange ?? 0) >= 0 ? "text-[#059669]" : "text-[#DC2626]",
  },
]);

const visiblePages = computed(() => {
  const total = txStore.pages ?? 0;
  const current = txStore.currentPage ?? 1;
  const pages: (number | string)[] = [];
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  pages.push(1);
  if (current > 3) pages.push("...");
  for (
    let i = Math.max(2, current - 1);
    i <= Math.min(total - 1, current + 1);
    i++
  )
    pages.push(i);
  if (current < total - 2) pages.push("...");
  pages.push(total);
  return pages;
});

const applyFilters = () => txStore.applyFilters?.({ ...localFilters });
const resetFilters = () => {
  Object.assign(localFilters, {
    search: "",
    type: "",
    startDate: "",
    endDate: "",
  });
  txStore.resetFilters?.();
};

onMounted(() => txStore.fetchTransactions?.());
</script>
