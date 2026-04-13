<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="modelValue"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        style="background: rgba(15,23,42,0.5); backdrop-filter: blur(4px);"
        @click.self="onOverlayClick"
      >
        <Transition
          enter-active-class="transition-all duration-300 ease-out"
          enter-from-class="opacity-0 scale-95 translate-y-4"
          enter-to-class="opacity-100 scale-100 translate-y-0"
          leave-active-class="transition-all duration-200 ease-in"
          leave-from-class="opacity-100 scale-100 translate-y-0"
          leave-to-class="opacity-0 scale-95 translate-y-4"
        >
          <div
            v-if="modelValue"
            :class="['bg-white rounded-2xl shadow-xl border border-[#E2E8F0] w-full', maxWidthClass]"
          >
            <!-- Header — only renders if title prop given -->
            <div
              v-if="title"
              class="flex items-center justify-between px-6 py-4 border-b border-[#F1F5F9]"
            >
              <h2 class="text-base font-bold text-[#1E293B]">{{ title }}</h2>
              <button
                v-if="closable"
                @click="$emit('update:modelValue', false)"
                class="w-7 h-7 rounded-lg flex items-center justify-center text-[#94A3B8] hover:bg-[#F0F4F8] hover:text-[#64748B] transition-colors cursor-pointer"
              >
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
                </svg>
              </button>
            </div>

            <!-- Body -->
            <div class="px-6 py-5">
              <slot />
            </div>

            <div
              v-if="$slots.footer"
              class="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#F1F5F9]"
            >
              <slot name="footer" />
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  modelValue:  boolean
  title?:      string
  closable?:   boolean
  maxWidth?:   'sm' | 'md' | 'lg' | 'xl'
  persistent?: boolean
}>(), {
  closable:    true,
  maxWidth:    'md',
  persistent:  false,
})

const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>()

const maxWidthClass = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
}[props.maxWidth]

const onOverlayClick = () => {
  if (!props.persistent) emit('update:modelValue', false)
}
</script>