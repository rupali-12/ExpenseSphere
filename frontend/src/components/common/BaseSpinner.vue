<template>
  <div :class="['flex items-center justify-center', fullPage ? 'min-h-screen' : '']">
    <div
      :class="[
        'rounded-full animate-spin border-2',
        sizeClass,
        colorClass,
      ]"
    />
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  size?:     'sm' | 'md' | 'lg'
  color?:    'primary' | 'white' | 'accent'
  fullPage?: boolean
}>(), {
  size:     'md',
  color:    'primary',
  fullPage: false,
})

const sizeClass = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-10 h-10 border-[3px]',
}[props.size]

const colorClass = {
  primary: 'border-[#E2E8F0] border-t-[#1A365D]',
  white:   'border-white/30 border-t-white',
  accent:  'border-[#E2E8F0] border-t-[#00B4D8]',
}[props.color]
</script>