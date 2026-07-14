<template>
  <div class="flex items-center gap-3 py-2.5 px-3 rounded-xl hover:bg-[#F8FAFC] transition-colors group">

    <!-- Type icon -->
    <div :class="['w-8 h-8 rounded-lg flex items-center justify-center shrink-0',
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
      <template v-if="!isEditing">
        <p class="text-sm font-semibold text-[#1E293B] truncate">
          {{ transaction.note || (transaction.type === 'deposit' ? 'Deposit' : 'Withdrawal') }}
        </p>
        <p class="text-xs text-[#94A3B8] mt-0.5">{{ formatDate(transaction.date) }}</p>
      </template>
      <template v-else>
        <input
          ref="inputRef"
          v-model="editedNote"
          type="text"
          placeholder="Add a note..."
          maxlength="100"
          @keyup.enter="saveNote"
          @keyup.escape="cancelEdit"
          class="w-full text-sm font-semibold text-[#1E293B] border border-[#00B4D8] rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[#00B4D8]/20"
        />
        <p class="text-xs text-[#94A3B8] mt-0.5">{{ formatDate(transaction.date) }}</p>
      </template>
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

    <!-- Action buttons -->
    <div class="shrink-0 flex items-center gap-1">
      <template v-if="!isEditing">

        <!-- Edit — always on mobile, hover-only on desktop -->
        <button
          @click="startEdit"
          :class="[
            'p-1.5 rounded-lg transition-all duration-150',
            'hover:bg-[#E2E8F0] hover:text-[#1E293B]',
            'opacity-100 text-[#64748B]'
          ]"
          title="Edit note"
        >
          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
          </svg>
        </button>

        <!-- Delete — always on mobile, hover-only on desktop -->
        <button
          @click="showDeleteModal = true"
          :class="[
            'p-1.5 rounded-lg transition-all duration-150',
            'hover:bg-[#FEE2E2] hover:text-[#DC2626]',
            'opacity-100 text-[#64748B]'
          ]"
          title="Delete transaction"
        >
          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
          </svg>
        </button>

      </template>

      <!-- Edit mode: Save + Cancel -->
      <template v-else>
        <button
          @click="saveNote"
          :disabled="saving"
          class="p-1.5 rounded-lg bg-[#D1FAE5] hover:bg-[#A7F3D0] text-[#059669] transition-colors"
          title="Save note"
        >
          <svg v-if="!saving" class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
          </svg>
          <svg v-else class="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
          </svg>
        </button>
        <button
          @click="cancelEdit"
          :disabled="saving"
          class="p-1.5 rounded-lg bg-[#FEE2E2] hover:bg-[#FECACA] text-[#DC2626] transition-colors"
          title="Cancel"
        >
          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </template>
    </div>
  </div>

  <!-- ── Delete Confirm Modal ──────────────────────────────────────────────── -->
  <BaseModal
    v-model="showDeleteModal"
    title="Delete Transaction"
    maxWidth="sm"
    :persistent="false"
    :closable="!deleting"
  >
    <div class="space-y-4">
      <div class="flex items-center gap-3 p-3 bg-[#FEF2F2] rounded-xl border border-[#DC2626]/10">
        <div class="w-8 h-8 rounded-lg bg-[#FEE2E2] flex items-center justify-center shrink-0">
          <svg class="w-4 h-4 text-[#DC2626]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
          </svg>
        </div>
        <div>
          <p class="text-sm font-semibold text-[#1E293B]">This cannot be undone</p>
          <p class="text-xs text-[#64748B] mt-0.5">Your balance will be adjusted automatically</p>
        </div>
      </div>

      <div class="bg-[#F8FAFC] rounded-xl p-3 space-y-1.5">
        <div class="flex justify-between text-sm">
          <span class="text-[#64748B]">Type</span>
          <span :class="['font-semibold capitalize', transaction.type === 'deposit' ? 'text-[#059669]' : 'text-[#DC2626]']">
            {{ transaction.type }}
          </span>
        </div>
        <div class="flex justify-between text-sm">
          <span class="text-[#64748B]">Amount</span>
          <span class="font-mono font-bold text-[#1E293B]">₹{{ formatAmount(transaction.amount) }}</span>
        </div>
        <div class="flex justify-between text-sm">
          <span class="text-[#64748B]">Note</span>
          <span class="text-[#1E293B] truncate max-w-32">{{ transaction.note || '—' }}</span>
        </div>
        <div class="flex justify-between text-sm">
          <span class="text-[#64748B]">Date</span>
          <span class="text-[#1E293B]">{{ formatDate(transaction.date) }}</span>
        </div>
      </div>

      <p class="text-xs text-[#94A3B8] text-center">
        {{ transaction.type === 'deposit' ? '−' : '+' }}₹{{ formatAmount(transaction.amount) }} will be
        {{ transaction.type === 'deposit' ? 'deducted from' : 'added to' }} your current balance
      </p>
    </div>

    <template #footer>
      <BaseButton variant="secondary" size="sm" :disabled="deleting" @click="showDeleteModal = false">
        Cancel
      </BaseButton>
      <BaseButton variant="danger" size="sm" :loading="deleting" @click="confirmDelete">
        {{ deleting ? 'Deleting...' : 'Delete' }}
      </BaseButton>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, nextTick, onMounted, onUnmounted } from 'vue'
import type { Transaction } from '@/types/transaction.types'
import { formatDate } from '@/utils/formatDate'
import { formatAmount } from '@/utils/formatCurrency'
import { useTransactionStore } from '@/stores/transactionStore'
import { useSessionStore } from '@/stores/sessionStore'
import BaseModal from '@/components/common/BaseModal.vue'
import BaseButton from '@/components/common/BaseButton.vue'

const props = defineProps<{ transaction: Transaction }>()

const txStore      = useTransactionStore()
const sessionStore = useSessionStore()

// ─── Edit state ───────────────────────────────────────────────────────────────
const isEditing  = ref(false)
const editedNote = ref('')
const saving     = ref(false)
const inputRef   = ref<HTMLInputElement | null>(null)

// ─── Delete state ─────────────────────────────────────────────────────────────
const showDeleteModal = ref(false)
const deleting        = ref(false)

// ─── Edit handlers ────────────────────────────────────────────────────────────
const startEdit = async () => {
  editedNote.value = props.transaction.note || ''
  isEditing.value  = true
  await nextTick()
  inputRef.value?.focus()
  inputRef.value?.select()
}

const saveNote = async () => {
  if (editedNote.value.trim() === (props.transaction.note || '')) {
    cancelEdit()
    return
  }
  saving.value = true
  try {
    await txStore.editNote(props.transaction._id, editedNote.value.trim())
    sessionStore.showSuccess('Note updated!')
    isEditing.value = false
  } catch {
    sessionStore.showError('Failed to update note. Try again.')
  } finally {
    saving.value = false
  }
}

const cancelEdit = () => {
  isEditing.value  = false
  editedNote.value = ''
}

// ─── Delete handler ───────────────────────────────────────────────────────────
const confirmDelete = async () => {
  deleting.value = true
  try {
    await txStore.deleteTransaction(props.transaction._id)
    showDeleteModal.value = false
    sessionStore.showSuccess('Transaction deleted!')
  } catch (err: any) {
    showDeleteModal.value = false
    sessionStore.showError(err?.response?.data?.message ?? 'Failed to delete. Try again.')
  } finally {
    deleting.value = false
  }
}
</script>