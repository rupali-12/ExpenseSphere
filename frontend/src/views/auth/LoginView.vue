<template>
  <div class="min-h-screen flex" style="background: var(--color-bg);">

    <!-- ── Left Panel ────────────────────────────────────────────────── -->
    <div class="hidden lg:flex flex-col justify-between w-5/12 p-10 relative overflow-hidden" style="background: var(--color-primary);">
      <!-- Background decoration -->
      <div class="absolute inset-0 overflow-hidden pointer-events-none">
        <div class="absolute -top-20 -right-20 w-80 h-80 rounded-full opacity-10" style="background: var(--color-accent);" />
        <div class="absolute bottom-20 -left-10 w-56 h-56 rounded-full opacity-8" style="background: var(--color-accent-2);" />
        <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full opacity-5" style="background: var(--color-accent);" />
      </div>

      <!-- Logo -->
      <div class="relative flex items-center gap-3 animate-fade-in">
        <div class="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg" style="background: var(--color-accent);">
          <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
        </div>
        <span class="text-white font-bold text-lg tracking-wide">ExpenseSphere</span>
      </div>

      <!-- Hero text -->
      <div class="relative space-y-6">
        <div class="space-y-3 animate-fade-up">
          <p class="text-white/50 text-sm font-medium tracking-widest uppercase">Personal Finance</p>
          <h2 class="text-white font-bold text-4xl leading-tight">Track every<br/>rupee, effortlessly.</h2>
          <p class="text-white/60 text-base leading-relaxed max-w-xs">Your complete digital passbook — deposits, withdrawals, and a running balance all in one place.</p>
        </div>

        <!-- Stats row -->
        <div class="flex gap-6 animate-fade-up delay-200">
          <div>
            <p class="text-white font-bold text-2xl font-mono">₹0</p>
            <p class="text-white/40 text-xs mt-0.5">Start balance</p>
          </div>
          <div class="w-px bg-white/10" />
          <div>
            <p class="text-white font-bold text-2xl">100%</p>
            <p class="text-white/40 text-xs mt-0.5">Secure & private</p>
          </div>
        </div>
      </div>

      <p class="relative text-white/25 text-xs">© 2026 ExpenseSphere. All rights reserved.</p>
    </div>

    <!-- ── Right Panel — Form ────────────────────────────────────────── -->
    <div class="flex-1 flex items-center justify-center p-6 lg:p-12">
      <div class="w-full max-w-sm animate-fade-up">

        <!-- Mobile logo -->
        <div class="flex items-center gap-2 mb-8 lg:hidden">
          <div class="w-8 h-8 rounded-lg flex items-center justify-center" style="background: var(--color-primary);">
            <svg class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <span class="font-bold text-[#1A365D]">ExpenseSphere</span>
        </div>

        <div class="mb-8">
          <h1 class="text-2xl font-bold text-[#1E293B]">Welcome back</h1>
          <p class="text-[#64748B] text-sm mt-1">Sign in to your account</p>
        </div>

        <!-- Error alert -->
        <Transition enter-active-class="transition-all duration-300" enter-from-class="opacity-0 -translate-y-2" enter-to-class="opacity-100 translate-y-0">
          <div v-if="error" class="mb-4 flex items-start gap-2.5 bg-[#FEE2E2] border border-[#DC2626]/20 rounded-xl px-4 py-3">
            <svg class="w-4 h-4 text-[#DC2626] mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
            </svg>
            <p class="text-sm text-[#DC2626] font-medium">{{ error }}</p>
          </div>
        </Transition>

        <!-- Form -->
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <BaseInput v-model="form.email" label="Email address" type="email"
            placeholder="you@example.com" :error="errors.email" autocomplete="email" required>
            <template #icon>
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"/>
              </svg>
            </template>
          </BaseInput>

          <BaseInput v-model="form.password" label="Password" type="password"
            placeholder="Enter your password" :error="errors.password" autocomplete="current-password" required>
            <template #icon>
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
              </svg>
            </template>
          </BaseInput>

          <!-- Forgot password -->
          <div class="flex justify-end">
            <RouterLink to="/forgot-password" class="text-xs font-semibold text-[#0077B6] hover:text-[#00B4D8] transition-colors">
              Forgot password?
            </RouterLink>
          </div>

          <BaseButton type="submit" variant="primary" size="lg" :loading="loading" class="w-full">
            Sign in
          </BaseButton>
        </form>

        <!-- Divider -->
        <div class="flex items-center gap-3 my-6">
          <div class="flex-1 h-px bg-[#E2E8F0]" />
          <span class="text-xs text-[#94A3B8] font-medium">New here?</span>
          <div class="flex-1 h-px bg-[#E2E8F0]" />
        </div>

        <RouterLink to="/register">
          <BaseButton variant="secondary" size="lg" class="w-full">
            Create an account
          </BaseButton>
        </RouterLink>
      </div>
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

const form = reactive({ email: '', password: '' })
const errors = reactive({ email: '', password: '' })

const validate = () => {
  errors.email    = ''
  errors.password = ''
  let valid = true
  if (!form.email)    { errors.email = 'Email is required'; valid = false }
  else if (!/\S+@\S+\.\S+/.test(form.email)) { errors.email = 'Enter a valid email'; valid = false }
  if (!form.password) { errors.password = 'Password is required'; valid = false }
  return valid
}

const handleSubmit = async () => {
  if (!validate()) return
  loading.value = true
  error.value   = ''
  try {
    await authStore.login({ email: form.email, password: form.password })
    sessionStore.showSuccess('Welcome back!')
    router.push('/app/dashboard')
  } catch (err: any) {
    error.value = err?.response?.data?.message ?? 'Login failed. Please try again.'
  } finally {
    loading.value = false
  }
}
</script>