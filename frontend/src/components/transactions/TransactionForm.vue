<template>
  <div class="space-y-4">

    <!-- Type Toggle -->
    <div class="flex bg-[#F0F4F8] rounded-xl p-1">
      <button
        v-for="t in (['deposit', 'withdrawal'] as const)"
        :key="t"
        type="button"
        @click="form.type = t; formError = ''; errors.amount = ''"
        :class="[
          'flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer',
          form.type === t
            ? t === 'deposit'
              ? 'bg-white text-[#059669] shadow-sm'
              : 'bg-white text-[#DC2626] shadow-sm'
            : 'text-[#94A3B8] hover:text-[#64748B]',
        ]"
      >
        {{ t === 'deposit' ? '+ Deposit' : '− Withdraw' }}
      </button>
    </div>

    <Transition
      enter-active-class="transition-all duration-300"
      enter-from-class="opacity-0 -translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition-all duration-200"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="formError"
        class="flex items-start gap-2.5 bg-[#FEE2E2] border border-[#DC2626]/20 rounded-xl px-4 py-3"
      >
        <svg class="w-4 h-4 text-[#DC2626] mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
        </svg>
        <p class="text-sm text-[#DC2626] font-medium">{{ formError }}</p>
      </div>
    </Transition>

    <!-- Amount -->
    <div>
      <label class="text-xs font-semibold text-[#1E293B] mb-1.5 block">
        Amount <span class="text-[#DC2626]">*</span>
      </label>
      <div class="relative">
        <span class="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono font-bold text-[#94A3B8]">₹</span>
        <input
          v-model.number="form.amount"
          type="number"
          min="1"
          placeholder="0.00"
          @input="errors.amount = ''; formError = ''"
          :class="[
            'w-full pl-8 pr-4 py-3 rounded-xl border text-sm font-mono font-bold transition-all',
            'focus:outline-none focus:ring-2',
            errors.amount || formError
              ? 'border-[#DC2626] focus:ring-[#DC2626]/20 focus:border-[#DC2626]'
              : 'border-[#E2E8F0] focus:ring-[#00B4D8]/20 focus:border-[#00B4D8]',
          ]"
          style="font-family: var(--font-mono);"
        />
      </div>
      <p v-if="errors.amount" class="text-xs text-[#DC2626] mt-1 font-medium">
        {{ errors.amount }}
      </p>
    </div>

    <!-- Note -->
    <div>
      <label class="text-xs font-semibold text-[#1E293B] mb-1.5 block">
        Note <span class="text-[#94A3B8] font-normal">(optional)</span>
      </label>
      <input
        v-model="form.note"
        type="text"
        placeholder="e.g. Grocery, Salary, Rent..."
        @input="formError = ''"
        class="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#00B4D8]/20 focus:border-[#00B4D8] transition-all"
        style="font-family: var(--font-primary);"
      />
    </div>

    <Transition
      enter-active-class="transition-all duration-300"
      enter-from-class="opacity-0 -translate-y-1"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition-all duration-150"
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
          Available balance:
          <span class="font-mono font-bold">
            ₹{{ formatAmount(authStore.user?.currentBalance ?? 0) }}
          </span>
        </p>
      </div>
    </Transition>

    <!-- Submit -->
    <BaseButton
      :variant="form.type === 'deposit' ? 'success' : 'danger'"
      size="lg"
      :loading="loading"
      @click="handleSubmit"
      class="w-full"
    >
      {{ form.type === 'deposit' ? '+ Add Deposit' : '− Add Withdrawal' }}
    </BaseButton>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { useTransactionStore } from '@/stores/transactionStore'
import { useSessionStore } from '@/stores/sessionStore'
import { formatAmount } from '@/utils/formatCurrency'
import type { TransactionType } from '@/types/transaction.types'
import BaseButton from '@/components/common/BaseButton.vue'

// Emitted so parent (modal or page) knows when to close/refresh
const emit = defineEmits<{ success: [] }>()

const authStore    = useAuthStore()
const txStore      = useTransactionStore()
const sessionStore = useSessionStore()

const loading   = ref(false)
const formError = ref('')        
const errors    = reactive({ amount: '' })

const form = reactive<{ type: TransactionType; amount: number | ''; note: string }>({
  type:   'deposit',
  amount: '',
  note:   '',
})

const handleSubmit = async () => {
  errors.amount   = ''
  formError.value = ''

  // Step 1: Basic validation
  if (!form.amount || Number(form.amount) < 1) {
    errors.amount = 'Enter a valid amount (minimum ₹1)'
    return
  }

  if (
    form.type === 'withdrawal' &&
    Number(form.amount) > (authStore.user?.currentBalance ?? 0)
  ) {
    formError.value = `Insufficient balance. Available: ₹${formatAmount(authStore.user?.currentBalance ?? 0)}`
    return
  }

  // Step 3: Hit backend
  loading.value = true
  try {
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

    // Reset form
    form.amount     = ''
    form.note       = ''
    formError.value = ''

    emit('success')  // parent can close modal or refresh list

  } catch (err: any) {
    formError.value = err?.response?.data?.message ?? 'Transaction failed. Try again.'
  } finally {
    loading.value = false
  }
}
</script>