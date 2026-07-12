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
      <!-- View mode -->
      <template v-if="!isEditing">
        <p class="text-sm font-semibold text-[#1E293B] truncate">
          {{ transaction.note || (transaction.type === 'deposit' ? 'Deposit' : 'Withdrawal') }}
        </p>
        <p class="text-xs text-[#94A3B8] mt-0.5">{{ formatDate(transaction.date) }}</p>
      </template>

      <!-- Edit mode -->
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

      <!-- View mode: Edit button (shows on hover) -->
      <template v-if="!isEditing">
        <button
          @click="startEdit"
          class="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-[#E2E8F0] text-[#94A3B8] hover:text-[#1E293B]"
          title="Edit note"
        >
          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
          </svg>
        </button>
      </template>

      <!-- Edit mode: Save + Cancel buttons -->
      <template v-else>
        <!-- Save -->
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

        <!-- Cancel -->
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
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue'
import type { Transaction } from '@/types/transaction.types'
import { formatDate } from '@/utils/formatDate'
import { formatAmount } from '@/utils/formatCurrency'
import { useTransactionStore } from '@/stores/transactionStore'
import { useSessionStore } from '@/stores/sessionStore'

const props = defineProps<{ transaction: Transaction }>()

const txStore      = useTransactionStore()
const sessionStore = useSessionStore()

// ─── State ────────────────────────────────────────────────────────────────────
const isEditing  = ref(false)
const editedNote = ref('')
const saving     = ref(false)
const inputRef   = ref<HTMLInputElement | null>(null)

// ─── Start editing ────────────────────────────────────────────────────────────
const startEdit = async () => {
  editedNote.value = props.transaction.note || ''
  isEditing.value  = true
  // Focus input after DOM updates
  await nextTick()
  inputRef.value?.focus()
  inputRef.value?.select()
}

// ─── Save note ────────────────────────────────────────────────────────────────
const saveNote = async () => {
  // No change — just cancel
  if (editedNote.value.trim() === (props.transaction.note || '')) {
    cancelEdit()
    return
  }

  if (typeof txStore.editNote !== 'function') {
    sessionStore.showError('Failed to update note. Try again.')
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

// ─── Cancel edit ──────────────────────────────────────────────────────────────
const cancelEdit = () => {
  isEditing.value  = false
  editedNote.value = ''
}
</script>