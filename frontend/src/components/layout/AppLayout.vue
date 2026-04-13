<template>
  <div class="flex h-screen overflow-hidden" style="background: var(--color-bg);">

    <!-- ── Sidebar Overlay (mobile) ─────────────────────────────────── -->
    <Transition enter-active-class="transition-opacity duration-300" enter-from-class="opacity-0" enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-200" leave-from-class="opacity-100" leave-to-class="opacity-0">
      <div v-if="sessionStore.sidebarOpen" @click="sessionStore.closeSidebar()"
        class="fixed inset-0 bg-black/30 z-20 lg:hidden backdrop-blur-sm" />
    </Transition>

    <!-- ── Sidebar ──────────────────────────────────────────────────── -->
    <aside :class="[
      'fixed lg:relative inset-y-0 left-0 z-30 flex flex-col w-64 transition-transform duration-300 ease-out',
      'border-r border-[#E2E8F0]',
      sessionStore.sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
    ]" style="background: var(--color-primary);">

      <!-- Logo -->
      <div class="flex items-center gap-3 px-6 py-5 border-b border-white/10">
        <div class="w-9 h-9 rounded-xl bg-[#00B4D8] flex items-center justify-center shadow-lg">
          <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
        </div>
        <div>
          <p class="text-white font-bold text-sm tracking-wide">ExpenseSphere</p>
          <p class="text-white/40 text-xs">Personal Finance</p>
        </div>
      </div>

      <!-- Nav Links -->
      <nav class="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <RouterLink v-for="item in navItems" :key="item.name" :to="item.path"
          @click="sessionStore.closeSidebar()"
          :class="[
            'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group',
            isActive(item.path)
              ? 'bg-white/15 text-white'
              : 'text-white/60 hover:bg-white/8 hover:text-white/90',
          ]">
          <div :class="['w-8 h-8 rounded-lg flex items-center justify-center transition-colors', isActive(item.path) ? 'bg-[#00B4D8]' : 'bg-white/8 group-hover:bg-white/12']">
            <component :is="item.icon" class="w-4 h-4" />
          </div>
          {{ item.name }}
          <div v-if="isActive(item.path)" class="ml-auto w-1.5 h-1.5 rounded-full bg-[#00B4D8]" />
        </RouterLink>
      </nav>

      <!-- User Card at Bottom -->
      <div class="p-3 border-t border-white/10">
        <div class="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/8 transition-colors cursor-pointer group">
          <div class="w-8 h-8 rounded-full bg-[#00B4D8] flex items-center justify-center text-white font-bold text-sm shrink-0">
            {{ userInitial }}
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-white text-sm font-semibold truncate">{{ authStore.user?.name }}</p>
            <p class="text-white/40 text-xs truncate">{{ authStore.user?.email }}</p>
          </div>
          <button @click.stop="handleLogout" class="text-white/30 hover:text-white/80 transition-colors" title="Logout">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
            </svg>
          </button>
        </div>
      </div>
    </aside>

    <!-- ── Main Content ──────────────────────────────────────────────── -->
    <div class="flex-1 flex flex-col min-w-0 overflow-hidden">

      <!-- Top Bar -->
      <header class="flex items-center justify-between px-4 lg:px-6 py-4 bg-white border-b border-[#E2E8F0] shadow-sm shrink-0">
        <!-- Mobile menu toggle -->
        <button @click="sessionStore.toggleSidebar()"
          class="lg:hidden p-2 rounded-lg text-[#64748B] hover:bg-[#F0F4F8] transition-colors">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16"/>
          </svg>
        </button>

        <!-- Page title -->
        <div class="flex-1 lg:flex-none">
          <h1 class="text-base font-bold text-[#1E293B]">{{ currentPageTitle }}</h1>
        </div>

        <!-- Balance chip -->
        <div class="flex items-center gap-2 bg-[#F0F4F8] rounded-xl px-4 py-2">
          <div class="w-2 h-2 rounded-full bg-[#059669] animate-pulse" />
          <span class="text-xs text-[#64748B] font-medium">Balance</span>
          <span class="font-mono font-bold text-[#1A365D] text-sm">
            ₹{{ formatAmount(authStore.user?.currentBalance ?? 0) }}
          </span>
        </div>
      </header>

      <!-- Page Content -->
      <main class="flex-1 overflow-y-auto p-4 lg:p-6">
        <RouterView v-slot="{ Component }">
          <Transition enter-active-class="transition-all duration-300" enter-from-class="opacity-0 translate-y-3" enter-to-class="opacity-100 translate-y-0" mode="out-in">
            <component :is="Component" />
          </Transition>
        </RouterView>
      </main>
    </div>

    <!-- Toast Notifications -->
    <ToastContainer />
  </div>
</template>

<script setup lang="ts">
import { computed, h } from 'vue'
import { RouterView, RouterLink, useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useSessionStore } from '@/stores/sessionStore'
import { formatAmount } from '@/utils/formatCurrency'
import ToastContainer from '@/components/common/ToastContainer.vue'

const authStore    = useAuthStore()
const sessionStore = useSessionStore()
const route        = useRoute()
const router       = useRouter()

const userInitial = computed(() => authStore.user?.name?.charAt(0).toUpperCase() ?? 'U')

const isActive = (path: string) => route.path.startsWith(path)

const currentPageTitle = computed(() => {
  if (route.path.includes('dashboard'))    return 'Dashboard'
  if (route.path.includes('transactions')) return 'Transactions'
  if (route.path.includes('profile'))      return 'Profile'
  return 'ExpenseSphere'
})

const handleLogout = async () => {
  await authStore.logout()
  router.push('/login')
}

// ── SVG Icon components ──────────────────────────────────────────────────────
const DashboardIcon = () => h('svg', { fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor', 'stroke-width': '2', class: 'w-4 h-4' }, [
  h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', d: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' })
])

const TxIcon = () => h('svg', { fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor', 'stroke-width': '2', class: 'w-4 h-4' }, [
  h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', d: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' })
])

const ProfileIcon = () => h('svg', { fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor', 'stroke-width': '2', class: 'w-4 h-4' }, [
  h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', d: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' })
])

const navItems = [
  { name: 'Dashboard',    path: '/app/dashboard',    icon: DashboardIcon },
  { name: 'Transactions', path: '/app/transactions',  icon: TxIcon },
  { name: 'Profile',      path: '/app/profile',       icon: ProfileIcon },
]
</script>