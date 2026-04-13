<template>
  <div class="flex items-center gap-3 py-2.5 px-3 rounded-xl hover:bg-[#F8FAFC] transition-colors group">

    <!-- Type icon -->
    <div :class="['w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-transform group-hover:scale-105',
      transaction.type === 'deposit' ? 'bg-[#D1FAE5]' : 'bg-[#FEE2E2]']">
      <svg v-if="transaction.type === 'deposit'" class="w-4 h-4 text-[#059669]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/>
      </svg>
      <svg v-else class="w-4 h-4 text-[#DC2626]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
        <path stroke-linecap="round" stroke-linejoin="round" d="M20 12H4"/>
      </svg>
    </div>

    <!-- Note + date -->
    <div class="flex-1 min-w-0">
      <p class="text-sm font-semibold text-[#1E293B] truncate">
        {{ transaction.note || (transaction.type === 'deposit' ? 'Deposit' : 'Withdrawal') }}
      </p>
      <p class="text-xs text-[#94A3B8] mt-0.5">{{ formatDate(transaction.date) }}</p>
    </div>

    <!-- Amount + balance -->
    <div class="text-right shrink-0">
      <p :class="['font-mono text-sm font-bold', transaction.type === 'deposit' ? 'text-[#059669]' : 'text-[#DC2626]']">
        {{ transaction.type === 'deposit' ? '+' : '-' }}₹{{ formatAmount(transaction.amount) }}
      </p>
      <p class="font-mono text-xs text-[#94A3B8] mt-0.5">
        Bal: ₹{{ formatAmount(transaction.afterBalance) }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Transaction } from '@/types/transaction.types'
import { formatDate } from '@/utils/formatDate'
import { formatAmount } from '@/utils/formatCurrency'

defineProps<{ transaction: Transaction }>()
</script>