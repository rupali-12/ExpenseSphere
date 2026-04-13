<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    :class="[baseClass, variantClass, sizeClass, { 'opacity-60 cursor-not-allowed': disabled || loading }]"
    v-bind="$attrs"
  >
    <!-- Spinner -->
    <svg v-if="loading" class="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
    </svg>
    <slot />
  </button>
</template>

<script setup lang="ts">
defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<{
  type?:    'button' | 'submit' | 'reset'
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success'
  size?:    'sm' | 'md' | 'lg'
  loading?: boolean
  disabled?: boolean
}>(), {
  type:    'button',
  variant: 'primary',
  size:    'md',
  loading: false,
  disabled: false,
})

const baseClass = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 cursor-pointer select-none'

const variantClass = {
  primary:   'bg-[#1A365D] text-white hover:bg-[#2B4F81] focus:ring-[#1A365D] shadow-sm hover:shadow-md active:scale-[0.98]',
  secondary: 'bg-white text-[#1A365D] border border-[#E2E8F0] hover:bg-[#F0F4F8] focus:ring-[#1A365D] shadow-sm',
  ghost:     'bg-transparent text-[#64748B] hover:bg-[#F0F4F8] hover:text-[#1E293B] focus:ring-[#1A365D]',
  danger:    'bg-[#DC2626] text-white hover:bg-[#B91C1C] focus:ring-[#DC2626] shadow-sm hover:shadow-md active:scale-[0.98]',
  success:   'bg-[#059669] text-white hover:bg-[#047857] focus:ring-[#059669] shadow-sm hover:shadow-md active:scale-[0.98]',
}[props.variant]

const sizeClass = {
  sm:  'text-xs px-3 py-2 gap-1.5',
  md:  'text-sm px-4 py-2.5 gap-2',
  lg:  'text-base px-6 py-3 gap-2',
}[props.size]
</script>