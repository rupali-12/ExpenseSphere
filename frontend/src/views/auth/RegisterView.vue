<template>
  <div class="min-h-screen flex items-center justify-center p-6" style="background: var(--color-bg);">
    <div class="w-full max-w-sm animate-fade-up">

      <!-- Header -->
      <div class="text-center mb-8">
        <div class="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-md" style="background: var(--color-primary);">
          <svg class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
        </div>
        <h1 class="text-2xl font-bold text-[#1E293B]">Create account</h1>
        <p class="text-[#64748B] text-sm mt-1">Start tracking your expenses today</p>
      </div>

      <!-- Card -->
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
          <BaseInput v-model="form.name" label="Full name" placeholder="John Doe"
            :error="errors.name" autocomplete="name" required>
            <template #icon>
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
              </svg>
            </template>
          </BaseInput>

          <BaseInput v-model="form.email" label="Email address" type="email"
            placeholder="you@example.com" :error="errors.email" autocomplete="email" required>
            <template #icon>
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"/>
              </svg>
            </template>
          </BaseInput>

          <BaseInput v-model="form.password" label="Password" type="password"
            placeholder="Min. 8 characters" :error="errors.password"
            hint="Must be at least 8 characters" autocomplete="new-password" required>
            <template #icon>
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
              </svg>
            </template>
          </BaseInput>

          <BaseButton type="submit" variant="primary" size="lg" :loading="loading" class="w-full mt-2">
            Send OTP & Continue
          </BaseButton>
        </form>
      </div>

      <p class="text-center text-sm text-[#64748B] mt-6">
        Already have an account?
        <RouterLink to="/login" class="font-semibold text-[#0077B6] hover:text-[#00B4D8] transition-colors ml-1">Sign in</RouterLink>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useSessionStore } from '@/stores/sessionStore'
import BaseInput from '@/components/common/BaseInput.vue'
import BaseButton from '@/components/common/BaseButton.vue'

const router       = useRouter()
const authStore    = useAuthStore()
const sessionStore = useSessionStore()

const loading = ref(false)
const error   = ref('')
const form    = reactive({ name: '', email: '', password: '' })
const errors  = reactive({ name: '', email: '', password: '' })

const validate = () => {
  errors.name = errors.email = errors.password = ''
  let valid = true
  if (!form.name.trim())  { errors.name = 'Name is required'; valid = false }
  if (!form.email)        { errors.email = 'Email is required'; valid = false }
  else if (!/\S+@\S+\.\S+/.test(form.email)) { errors.email = 'Enter a valid email'; valid = false }
  if (!form.password)     { errors.password = 'Password is required'; valid = false }
  else if (form.password.length < 8) { errors.password = 'Minimum 8 characters'; valid = false }
  return valid
}

const handleSubmit = async () => {
  if (!validate()) return
  loading.value = true
  error.value   = ''
  try {
    await authStore.register({ name: form.name, email: form.email, password: form.password })
    sessionStore.showSuccess('OTP sent to your email!')
    router.push({ name: 'VerifyOtp', query: { email: form.email } })
  } catch (err: any) {
    error.value = err?.response?.data?.message ?? 'Registration failed. Try again.'
  } finally {
    loading.value = false
  }
}
</script>