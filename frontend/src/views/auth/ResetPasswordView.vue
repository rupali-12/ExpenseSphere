<template>
  <div class="min-h-screen flex items-center justify-center p-6" style="background: var(--color-bg);">
    <div class="w-full max-w-sm animate-fade-up">

      <!-- Header -->
      <div class="text-center mb-8">
        <div class="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-md" style="background: var(--color-primary);">
          <svg class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
          </svg>
        </div>
        <h1 class="text-2xl font-bold text-[#1E293B]">{{ step === 1 ? 'Enter OTP' : 'New Password' }}</h1>
        <p class="text-[#64748B] text-sm mt-1">
          {{ step === 1 ? `Code sent to ${email}` : 'Choose a strong new password' }}
        </p>
      </div>

      <!-- Step indicators -->
      <div class="flex items-center gap-2 justify-center mb-6">
        <div v-for="s in 2" :key="s"
          :class="['h-1.5 rounded-full transition-all duration-300', s === step ? 'w-8 bg-[#1A365D]' : s < step ? 'w-4 bg-[#00B4D8]' : 'w-4 bg-[#E2E8F0]']" />
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

        <!-- Step 1: OTP -->
        <div v-if="step === 1">
          <div class="flex gap-2 justify-center mb-6">
            <input v-for="(_, i) in otpDigits" :key="i"
              :ref="el => { if(el) inputRefs[i] = el as HTMLInputElement }"
              v-model="otpDigits[i]" type="text" inputmode="numeric" maxlength="1"
              @input="handleInput(i)" @keydown="handleKeydown($event, i)" @paste="handlePaste"
              :class="['w-11 h-14 text-center font-mono text-xl font-bold rounded-xl border-2 transition-all duration-200 focus:outline-none',
                otpDigits[i] ? 'border-[#00B4D8] bg-[#EAF9FC] text-[#1A365D]' : 'border-[#E2E8F0] bg-white',
                'focus:border-[#00B4D8] focus:bg-[#EAF9FC]']" />
          </div>
          <BaseButton variant="primary" size="lg" :loading="loading"
            :disabled="otpString.length < 6" @click="handleVerifyOtp" class="w-full">
            Verify OTP
          </BaseButton>
        </div>

        <!-- Step 2: New Password -->
        <form v-else @submit.prevent="handleResetPassword" class="space-y-4">
          <BaseInput v-model="newPassword" label="New Password" type="password"
            placeholder="Min. 8 characters" :error="errors.newPassword" required>
            <template #icon>
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
              </svg>
            </template>
          </BaseInput>
          <BaseInput v-model="confirmPassword" label="Confirm Password" type="password"
            placeholder="Repeat new password" :error="errors.confirmPassword" required>
            <template #icon>
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
              </svg>
            </template>
          </BaseInput>
          <BaseButton type="submit" variant="primary" size="lg" :loading="loading" class="w-full">
            Reset Password
          </BaseButton>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useSessionStore } from '@/stores/sessionStore'
import BaseInput from '@/components/common/BaseInput.vue'
import BaseButton from '@/components/common/BaseButton.vue'

const router       = useRouter()
const route        = useRoute()
const authStore    = useAuthStore()
const sessionStore = useSessionStore()

const email          = computed(() => route.query.email as string ?? '')
const step           = ref(1)
const loading        = ref(false)
const error          = ref('')
const otpDigits      = ref<string[]>(Array(6).fill(''))
const inputRefs      = ref<HTMLInputElement[]>([])
const newPassword    = ref('')
const confirmPassword = ref('')
const errors         = ref({ newPassword: '', confirmPassword: '' })

const otpString = computed(() => otpDigits.value.join(''))

onMounted(() => inputRefs.value[0]?.focus())

const handleInput = (i: number) => { if (otpDigits.value[i] && i < 5) inputRefs.value[i+1]?.focus() }
const handleKeydown = (e: KeyboardEvent, i: number) => { if (e.key === 'Backspace' && !otpDigits.value[i] && i > 0) inputRefs.value[i-1]?.focus() }
const handlePaste = (e: ClipboardEvent) => {
  e.preventDefault()
  const text = e.clipboardData?.getData('text').replace(/\D/g, '').slice(0, 6) ?? ''
  text.split('').forEach((c, i) => { otpDigits.value[i] = c })
}

const handleVerifyOtp = async () => {
  loading.value = true; error.value = ''
  try {
    await authStore.verifyForgotOtp({ email: email.value, otp: otpString.value })
    step.value = 2
  } catch (err: any) {
    error.value = err?.response?.data?.message ?? 'Invalid OTP.'
    otpDigits.value = Array(6).fill('')
    inputRefs.value[0]?.focus()
  } finally { loading.value = false }
}

const handleResetPassword = async () => {
  errors.value = { newPassword: '', confirmPassword: '' }
  if (newPassword.value.length < 8) { errors.value.newPassword = 'Minimum 8 characters'; return }
  if (newPassword.value !== confirmPassword.value) { errors.value.confirmPassword = 'Passwords do not match'; return }

  loading.value = true; error.value = ''
  try {
    await authStore.resetPassword({
      resetToken: authStore.resetToken,
      newPassword: newPassword.value,
      confirmPassword: confirmPassword.value,
    })
    sessionStore.showSuccess('Password reset successfully!')
    router.push('/login')
  } catch (err: any) {
    error.value = err?.response?.data?.message ?? 'Reset failed.'
  } finally { loading.value = false }
}
</script>