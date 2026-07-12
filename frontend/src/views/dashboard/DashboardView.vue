<template>
  <div class="space-y-6">

    <!-- ── Balance Cards ─────────────────────────────────────────────── -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">

      <!-- Current Balance -->
      <div class="sm:col-span-1 rounded-2xl p-5 text-white relative overflow-hidden shadow-lg animate-fade-up"
        style="background: linear-gradient(135deg, #1A365D 0%, #2B4F81 100%);">
        <div class="absolute -top-6 -right-6 w-28 h-28 rounded-full opacity-10" style="background: #00B4D8;" />
        <div class="absolute bottom-0 right-0 w-20 h-20 rounded-full opacity-8" style="background: #00B4D8;" />
        <p class="text-white/60 text-xs font-medium tracking-widest uppercase mb-3">Current Balance</p>
        <p class="font-mono text-3xl font-bold tracking-tight">
          ₹{{ formatAmount(authStore.user?.currentBalance ?? 0) }}
        </p>
        <div class="flex items-center gap-2 mt-3">
          <div class="w-2 h-2 rounded-full bg-[#00B4D8] animate-pulse" />
          <p class="text-white/50 text-xs">{{ authStore.user?.name }}</p>
        </div>
      </div>

      <!-- Total Deposits -->
      <div class="rounded-2xl p-5 bg-white border border-[#E2E8F0] shadow-sm animate-fade-up delay-100">
        <div class="flex items-center justify-between mb-3">
          <p class="text-[#64748B] text-xs font-medium tracking-wide uppercase">Total Deposits</p>
          <div class="w-8 h-8 rounded-lg bg-[#D1FAE5] flex items-center justify-center">
            <svg class="w-4 h-4 text-[#059669]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          </div>
        </div>
        <p class="font-mono text-2xl font-bold text-[#059669]">₹{{ formatAmount(txStore.totalDeposits ?? 0) }}</p>
        <p class="text-[#94A3B8] text-xs mt-1">{{ txStore.total }} transactions total</p>
      </div>

      <!-- Total Withdrawals -->
      <div class="rounded-2xl p-5 bg-white border border-[#E2E8F0] shadow-sm animate-fade-up delay-200">
        <div class="flex items-center justify-between mb-3">
          <p class="text-[#64748B] text-xs font-medium tracking-wide uppercase">Total Spent</p>
          <div class="w-8 h-8 rounded-lg bg-[#FEE2E2] flex items-center justify-center">
            <svg class="w-4 h-4 text-[#DC2626]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M20 12H4" />
            </svg>
          </div>
        </div>
        <p class="font-mono text-2xl font-bold text-[#DC2626]">₹{{ formatAmount(txStore.totalWithdrawals ?? 0) }}</p>
        <p class="text-[#94A3B8] text-xs mt-1">Net: ₹{{ formatAmount(txStore.netChange ?? 0) }}</p>
      </div>
    </div>

    <!-- ── Bottom Grid:  Add + Recent Transactions ──────────────── -->
    <div class="grid grid-cols-1 lg:grid-cols-5 gap-4">

      <div class="lg:col-span-2 bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-5 animate-fade-up delay-300">
        <h2 class="text-sm font-bold text-[#1E293B] mb-4">Quick Add</h2>

        <Transition
          enter-active-class="transition-all duration-300"
          enter-from-class="opacity-0 -translate-y-2"
          enter-to-class="opacity-100 translate-y-0"
          leave-active-class="transition-all duration-200"
          leave-from-class="opacity-100 scale-100"
          leave-to-class="opacity-0 scale-95"
        >
          <div
            v-if="formError"
            class="mb-4 flex items-start gap-2.5 bg-[#FEE2E2] border border-[#DC2626]/20 rounded-xl px-4 py-3"
          >
            <svg class="w-4 h-4 text-[#DC2626] mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
            </svg>
            <p class="text-sm text-[#DC2626] font-medium">{{ formError }}</p>
          </div>
        </Transition>

        <!-- Type Toggle -->
        <div class="flex bg-[#F0F4F8] rounded-xl p-1 mb-4">
          <button
            v-for="t in ['deposit', 'withdrawal']"
            :key="t"
            @click="form.type = t as any; formError = ''; amountError = ''"
            :class="[
              'flex-1 py-2 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer',
              form.type === t
                ? t === 'deposit'
                  ? 'bg-white text-[#059669] shadow-sm'
                  : 'bg-white text-[#DC2626] shadow-sm'
                : 'text-[#94A3B8] hover:text-[#64748B]',
            ]"
          >
            {{ t === 'deposit' ? '+ Deposit' : '- Withdraw' }}
          </button>
        </div>

        <div class="space-y-3">

          <!-- Amount input -->
          <div>
            <label class="text-xs font-semibold text-[#1E293B] mb-1.5 block">Amount</label>
            <div class="relative">
              <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8] font-mono font-bold">₹</span>
              <input
                v-model.number="form.amount"
                type="number"
                min="1"
                placeholder="0.00"
                @input="amountError = ''; formError = ''"
                :class="[
                  'w-full pl-8 pr-4 py-3 rounded-xl border text-sm font-mono font-bold transition-all',
                  'focus:outline-none focus:ring-2',
                  amountError || formError
                    ? 'border-[#DC2626] focus:ring-[#DC2626]/20 focus:border-[#DC2626]'
                    : 'border-[#E2E8F0] focus:ring-[#00B4D8]/20 focus:border-[#00B4D8]',
                ]"
                style="font-family: var(--font-mono);"
              />
            </div>
            <p v-if="amountError" class="text-xs text-[#DC2626] mt-1 font-medium">
              {{ amountError }}
            </p>
          </div>

          <!-- Note input -->
          <div>
            <label class="text-xs font-semibold text-[#1E293B] mb-1.5 block">
              Note <span class="text-[#94A3B8] font-normal">(optional)</span>
            </label>
            <input
              v-model="form.note"
              type="text"
              placeholder="e.g. Grocery, Salary..."
              @input="formError = ''"
              class="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#00B4D8]/20 focus:border-[#00B4D8] transition-all"
              style="font-family: var(--font-primary);"
            />
          </div>

          <Transition
            enter-active-class="transition-all duration-300"
            enter-from-class="opacity-0 -translate-y-1"
            enter-to-class="opacity-100 translate-y-0"
            leave-active-class="transition-all duration-200"
            leave-from-class="opacity-100"
            leave-to-class="opacity-0"
          >
            <div
              v-if="form.type === 'withdrawal'"
              class="flex items-center gap-2 px-3 py-2 bg-[#FEF9E7] rounded-lg border border-[#D97706]/20"
            >
              <svg class="w-3.5 h-3.5 text-[#D97706] shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/>
              </svg>
              <p class="text-xs text-[#D97706] font-medium">
                Available:
                <span class="font-mono font-bold">
                  ₹{{ formatAmount(authStore.user?.currentBalance ?? 0) }}
                </span>
              </p>
            </div>
          </Transition>

          <BaseButton
            :variant="form.type === 'deposit' ? 'success' : 'danger'"
            size="md"
            :loading="adding"
            @click="handleAdd"
            class="w-full mt-1"
          >
            {{ form.type === 'deposit' ? '+ Add Deposit' : '- Add Withdrawal' }}
          </BaseButton>
        </div>
      </div>

      <!-- ── Recent Transactions ──────────────────── -->
      <div class="lg:col-span-3 bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-5 animate-fade-up delay-400">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-sm font-bold text-[#1E293B]">Recent Transactions</h2>
          <RouterLink
            to="/app/transactions"
            class="text-xs font-semibold text-[#0077B6] hover:text-[#00B4D8] transition-colors flex items-center gap-1"
          >
            View all
            <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/>
            </svg>
          </RouterLink>
        </div>

        <!-- Loading state using BaseSpinner -->
        <div v-if="txStore.isLoading" class="flex items-center justify-center py-10">
          <BaseSpinner size="md" color="primary" />
        </div>

        <!-- Empty state -->
        <div
          v-else-if="!txStore.transactions?.length"
          class="flex flex-col items-center justify-center py-10 text-center"
        >
          <div class="w-12 h-12 rounded-2xl bg-[#F0F4F8] flex items-center justify-center mb-3">
            <svg class="w-6 h-6 text-[#94A3B8]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
            </svg>
          </div>
          <p class="text-sm font-semibold text-[#64748B]">No transactions yet</p>
          <p class="text-xs text-[#94A3B8] mt-1">Add your first transaction above</p>
        </div>

        <!-- Transactions list -->
        <div v-else class="space-y-1">
          <TransactionRow
            v-for="tx in (txStore.transactions ?? []).slice(0, 6)"
            :key="tx._id"
            :transaction="tx"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useTransactionStore } from '@/stores/transactionStore'
import { useSessionStore } from '@/stores/sessionStore'
import { formatAmount } from '@/utils/formatCurrency'
import BaseButton from '@/components/common/BaseButton.vue'
import BaseSpinner from '@/components/common/BaseSpinner.vue'
import TransactionRow from '@/components/transactions/TransactionRow.vue'
import type { TransactionType } from '@/types/transaction.types'

const authStore    = useAuthStore()
const txStore      = useTransactionStore()
const sessionStore = useSessionStore()

const adding      = ref(false)
const amountError = ref('')
const formError   = ref('') 

const form = reactive<{ type: TransactionType; amount: number | ''; note: string }>({
  type:   'deposit',
  amount: '',
  note:   '',
})

onMounted(() => txStore?.fetchTransactions?.({ page: 1, limit: 6 }))

const handleAdd = async () => {
  if (adding.value) return
  adding.value = true

  amountError.value = ''
  formError.value   = ''

  // Step 1: Basic validation
  if (!form.amount || Number(form.amount) < 1) {
    amountError.value = 'Enter a valid amount (minimum ₹1)'
    adding.value = false
    return
  }

  // Step 2: Frontend balance check, faster than hitting backend
  if (
    form.type === 'withdrawal' &&
    Number(form.amount) > (authStore.user?.currentBalance ?? 0)
  ) {
    formError.value = `Insufficient balance. Available: ₹${formatAmount(authStore.user?.currentBalance ?? 0)}`
    adding.value = false
    return
  }

  // Step 3: Hit backend
  try {
    if (!txStore?.addTransaction) {
      formError.value = 'Transaction service unavailable. Try again.'
      adding.value = false
      return
    }
    await txStore.addTransaction({
      type:   form.type,
      amount: Number(form.amount),
      note:   form.note || undefined,
    })

    sessionStore.showSuccess(
      form.type === 'deposit'
        ? 'Deposit added successfully!'
        : 'Withdrawal recorded successfully!'
    )

    form.amount     = ''
    form.note       = ''
    formError.value = ''

  } catch (err: any) {
    // Step 4: show backend error inline, not just as toast
    formError.value = err?.response?.data?.message ?? 'Transaction failed. Try again.'
  } finally {
    adding.value = false
  }
}
</script>