<template>
  <div class="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-4">
    <div class="flex flex-wrap gap-3 items-end">

      <!-- Search -->
      <div class="flex-1 min-w-44">
        <label class="text-xs font-semibold text-[#1E293B] mb-1.5 block">Search</label>
        <div class="relative">
          <svg
            class="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8] pointer-events-none"
            fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          <input
            :value="modelValue.search"
            type="text"
            placeholder="Search by note..."
            class="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E2E8F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#00B4D8]/20 focus:border-[#00B4D8] transition-all"
            @input="update('search', ($event.target as HTMLInputElement).value)"
            @keyup.enter="$emit('apply')"
          />
        </div>
      </div>

      <!-- Type -->
      <div class="min-w-36">
        <label class="text-xs font-semibold text-[#1E293B] mb-1.5 block">Type</label>
        <select
          :value="modelValue.type"
          class="w-full px-3 py-2.5 rounded-xl border border-[#E2E8F0] text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#00B4D8]/20 focus:border-[#00B4D8] transition-all cursor-pointer"
          @change="update('type', ($event.target as HTMLSelectElement).value)"
        >
          <option value="">All types</option>
          <option value="deposit">Deposit</option>
          <option value="withdrawal">Withdrawal</option>
        </select>
      </div>

      <!-- Start date -->
      <div class="min-w-36">
        <label class="text-xs font-semibold text-[#1E293B] mb-1.5 block">From</label>
        <input
          :value="modelValue.startDate"
          type="date"
          class="w-full px-3 py-2.5 rounded-xl border border-[#E2E8F0] text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#00B4D8]/20 focus:border-[#00B4D8] transition-all cursor-pointer"
          @input="update('startDate', ($event.target as HTMLInputElement).value)"
        />
      </div>

      <!-- End date -->
      <div class="min-w-36">
        <label class="text-xs font-semibold text-[#1E293B] mb-1.5 block">To</label>
        <input
          :value="modelValue.endDate"
          type="date"
          class="w-full px-3 py-2.5 rounded-xl border border-[#E2E8F0] text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#00B4D8]/20 focus:border-[#00B4D8] transition-all cursor-pointer"
          @input="update('endDate', ($event.target as HTMLInputElement).value)"
        />
      </div>

      <!-- Buttons -->
      <div class="flex gap-2 shrink-0">
        <BaseButton variant="primary" size="md" @click="$emit('apply')">
          Apply
        </BaseButton>
        <BaseButton variant="ghost" size="md" @click="$emit('reset')">
          Reset
        </BaseButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { TransactionFilters } from '@/types/transaction.types'
import BaseButton from '@/components/common/BaseButton.vue'

const props = defineProps<{ modelValue: TransactionFilters }>()

const emit = defineEmits<{
  'update:modelValue': [value: TransactionFilters]
  'apply': []
  'reset': []
}>()

const update = (key: keyof TransactionFilters, value: string | number) => {
  emit('update:modelValue', { ...props.modelValue, [key]: value })
}
</script>