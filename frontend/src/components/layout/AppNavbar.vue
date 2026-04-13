<template>
  <header class="flex items-center justify-between px-4 lg:px-6 py-4 bg-white border-b border-[#E2E8F0] shadow-sm shrink-0">

    <!-- Mobile sidebar toggle -->
    <button
      @click="sessionStore.toggleSidebar()"
      class="lg:hidden p-2 rounded-lg text-[#64748B] hover:bg-[#F0F4F8] transition-colors cursor-pointer"
    >
      <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16"/>
      </svg>
    </button>

    <!-- Page title + subtitle -->
    <div class="flex-1 lg:flex-none ml-2 lg:ml-0">
      <h1 class="text-base font-bold text-[#1E293B] leading-tight">{{ pageTitle }}</h1>
      <p class="text-xs text-[#94A3B8] hidden sm:block mt-0.5">{{ pageSubtitle }}</p>
    </div>

    <!-- Right side actions -->
    <div class="flex items-center gap-2 sm:gap-3">

      <!-- Balance chip — hidden on very small screens -->
      <div class="hidden sm:flex items-center gap-2 bg-[#F0F4F8] rounded-xl px-3 py-2">
        <div class="w-2 h-2 rounded-full bg-[#059669] animate-pulse shrink-0" />
        <span class="text-xs text-[#64748B] font-medium">Balance</span>
        <span class="font-mono font-bold text-[#1A365D] text-sm">
          ₹{{ formatAmount(authStore.user?.currentBalance ?? 0) }}
        </span>
      </div>

      <!-- Quick add button — emits event so parent can open modal -->
      <button
        @click="$emit('openAddModal')"
        class="w-9 h-9 rounded-xl flex items-center justify-center transition-all shadow-sm hover:shadow-md active:scale-95 cursor-pointer"
        style="background: #1A365D;"
        title="Add Transaction"
      >
        <svg class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/>
        </svg>
      </button>

      <!-- Avatar / profile shortcut -->
      <RouterLink
        to="/app/profile"
        class="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-sm hover:opacity-90 transition-opacity cursor-pointer"
        style="background: #00B4D8;"
        :title="authStore.user?.name"
      >
        {{ userInitial }}
      </RouterLink>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useSessionStore } from '@/stores/sessionStore'
import { formatAmount } from '@/utils/formatCurrency'

// Emitted so AppLayout can open the Add Transaction modal
defineEmits<{ openAddModal: [] }>()

const authStore    = useAuthStore()
const sessionStore = useSessionStore()
const route        = useRoute()

const userInitial = computed(() =>
  authStore.user?.name?.charAt(0).toUpperCase() ?? 'U'
)

// Page metadata per route
const pageMeta: Record<string, { title: string; subtitle: string }> = {
  '/app/dashboard':    { title: 'Dashboard',    subtitle: 'Overview of your finances'   },
  '/app/transactions': { title: 'Transactions', subtitle: 'Your complete passbook'      },
  '/app/profile':      { title: 'Profile',      subtitle: 'Manage your account'         },
}

const pageTitle    = computed(() => pageMeta[route.path]?.title    ?? 'ExpenseTrack')
const pageSubtitle = computed(() => pageMeta[route.path]?.subtitle ?? '')
</script>