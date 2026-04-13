<template>
  <div class="flex flex-col gap-1.5">
    <!-- Label -->
    <label v-if="label" :for="id" class="text-sm font-semibold text-[#1E293B]">
      {{ label }}
      <span v-if="required" class="text-[#DC2626] ml-0.5">*</span>
    </label>

    <!-- Input wrapper -->
    <div class="relative">
      <!-- Left icon -->
      <div v-if="$slots.icon" class="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]">
        <slot name="icon" />
      </div>

      <input
        :id="id"
        :type="inputType"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :required="required"
        :autocomplete="autocomplete"
        @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
        @blur="$emit('blur')"
        :class="[
          'w-full rounded-xl border bg-white text-[#1E293B] text-sm transition-all duration-200',
          'placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-offset-0',
          $slots.icon ? 'pl-10' : 'pl-4',
          isPassword ? 'pr-11' : 'pr-4',
          'py-3',
          error
            ? 'border-[#DC2626] focus:ring-[#DC2626]/20 focus:border-[#DC2626]'
            : 'border-[#E2E8F0] focus:ring-[#00B4D8]/20 focus:border-[#00B4D8]',
          disabled ? 'opacity-50 cursor-not-allowed bg-[#F8FAFC]' : '',
        ]"
        style="font-family: var(--font-primary);"
      />

      <!-- Password toggle -->
      <button
        v-if="isPassword"
        type="button"
        @click="showPassword = !showPassword"
        class="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#64748B] transition-colors"
      >
        <svg v-if="!showPassword" class="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
          <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
        </svg>
        <svg v-else class="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
        </svg>
      </button>
    </div>

    <!-- Error message -->
    <p v-if="error" class="text-xs text-[#DC2626] font-medium flex items-center gap-1">
      <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
      </svg>
      {{ error }}
    </p>

    <!-- Helper text -->
    <p v-if="hint && !error" class="text-xs text-[#94A3B8]">{{ hint }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const props = withDefaults(defineProps<{
  modelValue:   string | number
  label?:       string
  placeholder?: string
  type?:        string
  id?:          string
  error?:       string
  hint?:        string
  disabled?:    boolean
  required?:    boolean
  autocomplete?: string
}>(), {
  type:     'text',
  disabled: false,
  required: false,
})

defineEmits<{
  'update:modelValue': [value: string]
  'blur': []
}>()

const showPassword = ref(false)
const isPassword = computed(() => props.type === 'password')
const inputType = computed(() => {
  if (isPassword.value) return showPassword.value ? 'text' : 'password'
  return props.type
})
</script>