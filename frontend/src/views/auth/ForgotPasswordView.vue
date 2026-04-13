<template>
  <div class="min-h-screen flex items-center justify-center p-6" style="background: var(--color-bg);">
    <div class="w-full max-w-sm animate-fade-up">

      <!-- Header -->
      <div class="text-center mb-8">
        <div class="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-md bg-[#FEF3C7]">
          <svg class="w-6 h-6 text-[#D97706]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/>
          </svg>
        </div>
        <h1 class="text-2xl font-bold text-[#1E293B]">Forgot password?</h1>
        <p class="text-[#64748B] text-sm mt-1">Enter your email and we'll send an OTP</p>
      </div>

      <div class="bg-white rounded-2xl shadow-md border border-[#E2E8F0] p-6">
        <!-- Error -->
        <Transition enter-active-class="transition-all duration-300" enter-from-class="opacity-0 -translate-y-2" enter-to-class="opacity-100 translate-y-0">
          <div v-if="error" class="mb-4 flex items-start gap-2.5 bg-[#FEE2E2] border border-[#DC2626]/20 rounded-xl px-4 py-3">
            <svg class="w-4 h-4 text-[#DC2626] mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
            </svg>
            <p class="text-sm text-[#DC2626] font-medium">{{ error }}</p>
          </div>
        </Transition>

        <form @submit.prevent="handleSubmit" class="space-y-4">
          <BaseInput v-model="email" label="Email address" type="email"
            placeholder="you@example.com" :error="emailError" required>
            <template #icon>
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"/>
              </svg>
            </template>
          </BaseInput>
          <BaseButton type="submit" variant="primary" size="lg" :loading="loading" class="w-full">
            Send Reset OTP
          </BaseButton>
        </form>
      </div>

      <RouterLink to="/login"
        class="flex items-center gap-1.5 text-sm text-[#64748B] hover:text-[#1E293B] transition-colors mx-auto mt-6 w-fit">
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/>
        </svg>
        Back to Login
      </RouterLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useSessionStore } from '@/stores/sessionStore'
import BaseInput from '@/components/common/BaseInput.vue'
import BaseButton from '@/components/common/BaseButton.vue'

const router       = useRouter()
const authStore    = useAuthStore()
const sessionStore = useSessionStore()

const email      = ref('')
const emailError = ref('')
const error      = ref('')
const loading    = ref(false)

const handleSubmit = async () => {
  emailError.value = ''
  if (!email.value) { emailError.value = 'Email is required'; return }
  if (!/\S+@\S+\.\S+/.test(email.value)) { emailError.value = 'Enter a valid email'; return }

  loading.value = true
  error.value   = ''
  try {
    await authStore.forgotPassword({ email: email.value })
    sessionStore.showSuccess('OTP sent to your email!')
    router.push({ name: 'ResetPassword', query: { email: email.value } })
  } catch (err: any) {
    error.value = err?.response?.data?.message ?? 'Something went wrong.'
  } finally {
    loading.value = false
  }
}
</script>