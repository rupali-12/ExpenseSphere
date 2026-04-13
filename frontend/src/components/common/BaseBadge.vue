<template>
  <span :class="[base, variantClass, sizeClass]">
    <slot />
  </span>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  variant?: 'deposit' | 'withdrawal' | 'info' | 'warning' | 'default'
  size?:    'sm' | 'md'
}>(), { variant: 'default', size: 'md' })

const base = 'inline-flex items-center gap-1 font-semibold rounded-full'

const variantClass = {
  deposit:    'bg-[#D1FAE5] text-[#059669]',
  withdrawal: 'bg-[#FEE2E2] text-[#DC2626]',
  info:       'bg-[#DBEAFE] text-[#2563EB]',
  warning:    'bg-[#FEF3C7] text-[#D97706]',
  default:    'bg-[#F1F5F9] text-[#64748B]',
}[props.variant]

const sizeClass = {
  sm: 'text-xs px-2 py-0.5',
  md: 'text-xs px-2.5 py-1',
}[props.size]
</script>