<template>
  <div class="min-h-screen flex items-center justify-center p-6" style="background: var(--color-bg);">
    <div class="w-full max-w-sm animate-fade-up">

      <!-- Header -->
      <div class="text-center mb-8">
        <div class="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-md" style="background: var(--color-accent);">
          <svg class="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
          </svg>
        </div>
        <h1 class="text-2xl font-bold text-[#1E293B]">Verify your email</h1>
        <p class="text-[#64748B] text-sm mt-1">
          We sent a 6-digit code to<br/>
          <span class="font-semibold text-[#1E293B]">{{ email }}</span>
        </p>
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

        <!-- OTP Boxes -->
        <div class="flex gap-2 justify-center mb-6">
          <input v-for="(_, i) in otpDigits" :key="i" :ref="el => { if(el) inputRefs[i] = el as HTMLInputElement }"
            v-model="otpDigits[i]"
            type="text" inputmode="numeric" maxlength="1"
            @input="handleInput(i)"
            @keydown="handleKeydown($event, i)"
            @paste="handlePaste($event)"
            :class="[
              'w-11 h-14 text-center font-mono text-xl font-bold rounded-xl border-2 transition-all duration-200 focus:outline-none',
              otpDigits[i]
                ? 'border-[#00B4D8] bg-[#EAF9FC] text-[#1A365D]'
                : 'border-[#E2E8F0] bg-white text-[#1E293B]',
              'focus:border-[#00B4D8] focus:bg-[#EAF9FC]',
            ]"
          />
        </div>

        <BaseButton type="button" variant="primary" size="lg" :loading="loading"
          :disabled="otpString.length < 6" @click="handleVerify" class="w-full">
          Verify OTP
        </BaseButton>

        <!-- Resend -->
        <div class="mt-4 text-center">
          <p class="text-sm text-[#64748B]">
            Didn't receive it?
            <button v-if="countdown === 0" @click="handleResend" :disabled="resending"
              class="font-semibold text-[#0077B6] hover:text-[#00B4D8] transition-colors ml-1 disabled:opacity-50">
              {{ resending ? 'Sending...' : 'Resend OTP' }}
            </button>
            <span v-else class="font-mono text-[#94A3B8] text-xs ml-1">
              Resend in {{ countdown }}s
            </span>
          </p>
        </div>
      </div>

      <button @click="router.push('/register')"
        class="flex items-center gap-1.5 text-sm text-[#64748B] hover:text-[#1E293B] transition-colors mx-auto mt-6">
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/>
        </svg>
        Back to Register
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useSessionStore } from '@/stores/sessionStore'
import BaseButton from '@/components/common/BaseButton.vue'

const router       = useRouter()
const route        = useRoute()
const authStore    = useAuthStore()
const sessionStore = useSessionStore()

const email      = computed(() => route.query.email as string ?? '')
const loading    = ref(false)
const resending  = ref(false)
const error      = ref('')
const countdown  = ref(30)
const otpDigits  = ref<string[]>(Array(6).fill(''))
const inputRefs  = ref<HTMLInputElement[]>([])

const otpString = computed(() => otpDigits.value.join(''))

// ── Countdown timer ──────────────────────────────────────────────────────────
let timer: ReturnType<typeof setInterval>
const startTimer = () => {
  countdown.value = 30
  clearInterval(timer)
  timer = setInterval(() => {
    if (countdown.value > 0) countdown.value--
    else clearInterval(timer)
  }, 1000)
}
onMounted(() => { startTimer(); inputRefs.value[0]?.focus() })
onUnmounted(() => clearInterval(timer))

// ── Input handlers ───────────────────────────────────────────────────────────
const handleInput = (i: number) => {
  const val = otpDigits.value[i]
  if (val && i < 5) inputRefs.value[i + 1]?.focus()
}

const handleKeydown = (e: KeyboardEvent, i: number) => {
  if (e.key === 'Backspace' && !otpDigits.value[i] && i > 0) {
    inputRefs.value[i - 1]?.focus()
  }
}

const handlePaste = (e: ClipboardEvent) => {
  e.preventDefault()
  const text = e.clipboardData?.getData('text').replace(/\D/g, '').slice(0, 6) ?? ''
  text.split('').forEach((char, i) => { otpDigits.value[i] = char })
  inputRefs.value[Math.min(text.length, 5)]?.focus()
}

// ── Actions ──────────────────────────────────────────────────────────────────
const handleVerify = async () => {
  if (otpString.value.length < 6) return
  loading.value = true
  error.value   = ''
  try {
    await authStore.verifyOtp({ email: email.value, otp: otpString.value })
    sessionStore.showSuccess('Registration successful! Welcome!')
    router.push('/app/dashboard')
  } catch (err: any) {
    error.value = err?.response?.data?.message ?? 'Invalid OTP. Try again.'
    otpDigits.value = Array(6).fill('')
    inputRefs.value[0]?.focus()
  } finally {
    loading.value = false
  }
}

const handleResend = async () => {
  resending.value = true
  try {
    await authStore.resendOtp(email.value)
    sessionStore.showSuccess('New OTP sent!')
    startTimer()
  } catch (err: any) {
    error.value = err?.response?.data?.message ?? 'Failed to resend OTP.'
  } finally {
    resending.value = false
  }
}
</script>