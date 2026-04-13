<template>
  <div class="max-w-2xl mx-auto space-y-4">

    <!-- ── Profile Header ────────────────────────────────────────────── -->
    <div class="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-6 flex items-center gap-4 animate-fade-up"
      style="background: linear-gradient(135deg, #1A365D 0%, #2B4F81 100%);">
      <div class="w-16 h-16 rounded-2xl bg-[#00B4D8] flex items-center justify-center text-white font-bold text-2xl shadow-lg">
        {{ userInitial }}
      </div>
      <div>
        <p class="text-white font-bold text-lg">{{ authStore.user?.name }}</p>
        <p class="text-white/60 text-sm">{{ authStore.user?.email }}</p>
        <p class="text-white/40 text-xs mt-1 font-mono">Balance: ₹{{ formatAmount(authStore.user?.currentBalance ?? 0) }}</p>
      </div>
    </div>

    <!-- ── Update Details ────────────────────────────────────────────── -->
    <div class="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-6 animate-fade-up delay-100">
      <h2 class="text-sm font-bold text-[#1E293B] mb-4">Personal Information</h2>

      <Transition enter-active-class="transition-all duration-300" enter-from-class="opacity-0 -translate-y-2" enter-to-class="opacity-100 translate-y-0">
        <div v-if="detailsMsg" :class="['mb-4 flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium border',
          detailsSuccess ? 'bg-[#D1FAE5] border-[#059669]/20 text-[#064E3B]' : 'bg-[#FEE2E2] border-[#DC2626]/20 text-[#DC2626]']">
          {{ detailsMsg }}
        </div>
      </Transition>

      <form @submit.prevent="handleUpdateDetails" class="space-y-4">
        <BaseInput v-model="detailsForm.name" label="Full Name" placeholder="Your name"
          :error="detailsErrors.name" required>
          <template #icon>
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
            </svg>
          </template>
        </BaseInput>

        <BaseInput v-model="detailsForm.email" label="Email Address" type="email"
          placeholder="you@example.com" :error="detailsErrors.email" required>
          <template #icon>
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"/>
            </svg>
          </template>
        </BaseInput>

        <BaseButton type="submit" variant="primary" size="md" :loading="detailsLoading">
          Save Changes
        </BaseButton>
      </form>
    </div>

    <!-- ── Change Password ───────────────────────────────────────────── -->
    <div class="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-6 animate-fade-up delay-200">
      <h2 class="text-sm font-bold text-[#1E293B] mb-4">Change Password</h2>

      <Transition enter-active-class="transition-all duration-300" enter-from-class="opacity-0 -translate-y-2" enter-to-class="opacity-100 translate-y-0">
        <div v-if="pwdMsg" :class="['mb-4 flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium border',
          pwdSuccess ? 'bg-[#D1FAE5] border-[#059669]/20 text-[#064E3B]' : 'bg-[#FEE2E2] border-[#DC2626]/20 text-[#DC2626]']">
          {{ pwdMsg }}
        </div>
      </Transition>

      <form @submit.prevent="handleUpdatePassword" class="space-y-4">
        <BaseInput v-model="pwdForm.oldPassword" label="Current Password" type="password"
          placeholder="Enter current password" :error="pwdErrors.oldPassword" required>
          <template #icon>
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
            </svg>
          </template>
        </BaseInput>

        <BaseInput v-model="pwdForm.newPassword" label="New Password" type="password"
          placeholder="Min. 6 characters" :error="pwdErrors.newPassword" required>
          <template #icon>
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/>
            </svg>
          </template>
        </BaseInput>

        <BaseButton type="submit" variant="primary" size="md" :loading="pwdLoading">
          Update Password
        </BaseButton>
      </form>
    </div>

    <!-- ── Update Balance ────────────────────────────────────────────── -->
    <div class="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-6 animate-fade-up delay-300">
      <h2 class="text-sm font-bold text-[#1E293B] mb-1">Set Balance</h2>
      <p class="text-xs text-[#94A3B8] mb-4">Manually set your current balance. This does not create a transaction record.</p>

      <Transition enter-active-class="transition-all duration-300" enter-from-class="opacity-0 -translate-y-2" enter-to-class="opacity-100 translate-y-0">
        <div v-if="balMsg" :class="['mb-4 flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium border',
          balSuccess ? 'bg-[#D1FAE5] border-[#059669]/20 text-[#064E3B]' : 'bg-[#FEE2E2] border-[#DC2626]/20 text-[#DC2626]']">
          {{ balMsg }}
        </div>
      </Transition>

      <form @submit.prevent="handleUpdateBalance" class="flex gap-3 items-end">
        <div class="flex-1">
          <label class="text-xs font-semibold text-[#1E293B] mb-1.5 block">Amount (₹)</label>
          <div class="relative">
            <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8] font-mono font-bold">₹</span>
            <input v-model.number="newBalance" type="number" min="0"
              :placeholder="String(authStore.user?.currentBalance ?? 0)"
              class="w-full pl-8 pr-4 py-2.5 rounded-xl border border-[#E2E8F0] text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#00B4D8]/20 focus:border-[#00B4D8] transition-all" />
          </div>
        </div>
        <BaseButton type="submit" variant="primary" size="md" :loading="balLoading">
          Update Balance
        </BaseButton>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { useSessionStore } from '@/stores/sessionStore'
import { formatAmount } from '@/utils/formatCurrency'
import BaseInput from '@/components/common/BaseInput.vue'
import BaseButton from '@/components/common/BaseButton.vue'

const authStore    = useAuthStore()
const sessionStore = useSessionStore()

const userInitial = computed(() => authStore.user?.name?.charAt(0).toUpperCase() ?? 'U')

// ── Details form ─────────────────────────────────────────────────────────────
const detailsLoading = ref(false)
const detailsMsg     = ref('')
const detailsSuccess = ref(false)
const detailsForm    = reactive({ name: '', email: '' })
const detailsErrors  = reactive({ name: '', email: '' })

onMounted(() => {
  detailsForm.name  = authStore.user?.name  ?? ''
  detailsForm.email = authStore.user?.email ?? ''
})

const handleUpdateDetails = async () => {
  detailsErrors.name = detailsErrors.email = ''
  if (!detailsForm.name.trim()) { detailsErrors.name = 'Name is required'; return }
  if (!/\S+@\S+\.\S+/.test(detailsForm.email)) { detailsErrors.email = 'Enter valid email'; return }

  detailsLoading.value = true; detailsMsg.value = ''
  try {
    await authStore.updateUser({ name: detailsForm.name, email: detailsForm.email })
    detailsSuccess.value = true
    detailsMsg.value = 'Details updated successfully!'
    sessionStore.showSuccess('Profile updated!')
  } catch (err: any) {
    detailsSuccess.value = false
    detailsMsg.value = err?.response?.data?.message ?? 'Update failed.'
  } finally { detailsLoading.value = false }
}

// ── Password form ─────────────────────────────────────────────────────────────
const pwdLoading = ref(false)
const pwdMsg     = ref('')
const pwdSuccess = ref(false)
const pwdForm    = reactive({ oldPassword: '', newPassword: '' })
const pwdErrors  = reactive({ oldPassword: '', newPassword: '' })

const handleUpdatePassword = async () => {
  pwdErrors.oldPassword = pwdErrors.newPassword = ''
  if (!pwdForm.oldPassword) { pwdErrors.oldPassword = 'Current password required'; return }
  if (pwdForm.newPassword.length < 6) { pwdErrors.newPassword = 'Minimum 6 characters'; return }

  pwdLoading.value = true; pwdMsg.value = ''
  try {
    await authStore.updateUser({ oldPassword: pwdForm.oldPassword, newPassword: pwdForm.newPassword })
    pwdSuccess.value = true
    pwdMsg.value = 'Password updated successfully!'
    pwdForm.oldPassword = pwdForm.newPassword = ''
    sessionStore.showSuccess('Password changed!')
  } catch (err: any) {
    pwdSuccess.value = false
    pwdMsg.value = err?.response?.data?.message ?? 'Password update failed.'
  } finally { pwdLoading.value = false }
}

// ── Balance form ─────────────────────────────────────────────────────────────
const balLoading = ref(false)
const balMsg     = ref('')
const balSuccess = ref(false)
const newBalance = ref<number | ''>('')

const handleUpdateBalance = async () => {
  if (newBalance.value === '' || Number(newBalance.value) < 0) return
  balLoading.value = true; balMsg.value = ''
  try {
    await authStore.updateBalance({ currentBalance: Number(newBalance.value) })
    balSuccess.value = true
    balMsg.value = `Balance updated to ₹${formatAmount(Number(newBalance.value))}`
    sessionStore.showSuccess('Balance updated!')
    newBalance.value = ''
  } catch (err: any) {
    balSuccess.value = false
    balMsg.value = err?.response?.data?.message ?? 'Balance update failed.'
  } finally { balLoading.value = false }
}
</script>