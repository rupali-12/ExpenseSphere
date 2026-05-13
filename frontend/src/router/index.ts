import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

// ─── Route Definitions ────────────────────────────────────────────────────────
const routes = [
  // ─── Public Routes (no auth needed) ────────────────────────────────────────
  {
    path: '/',
    redirect: '/login',
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/auth/LoginView.vue'),
    meta: { requiresAuth: false, guestOnly: true },
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/auth/RegisterView.vue'),
    meta: { requiresAuth: false, guestOnly: true },
  },
  {
    path: '/verify-otp',
    name: 'VerifyOtp',
    component: () => import('@/views/auth/OtpVerifyView.vue'),
    meta: { requiresAuth: false, guestOnly: true },
  },
  {
    path: '/forgot-password',
    name: 'ForgotPassword',
    component: () => import('@/views/auth/ForgotPasswordView.vue'),
    meta: { requiresAuth: false, guestOnly: true },
  },
  {
    path: '/reset-password',
    name: 'ResetPassword',
    component: () => import('@/views/auth/ResetPasswordView.vue'),
    meta: { requiresAuth: false, guestOnly: true },
  },

  // ─── Protected Routes (auth required) ──────────────────────────────────────
  {
    path: '/app',
    component: () => import('@/components/layout/AppLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        redirect: '/app/dashboard',
      },
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/DashboardView.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: 'transactions',
        name: 'Transactions',
        component: () => import('@/views/transactions/TransactionsView.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: 'profile',
        name: 'Profile',
        component: () => import('@/views/profile/ProfileView.vue'),
        meta: { requiresAuth: true },
      },
    ],
  },

  // ─── 404 Catch All ──────────────────────────────────────────────────────────
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFoundView.vue'),
  },
]

// ─── Create Router ────────────────────────────────────────────────────────────
const router = createRouter({
  history: createWebHistory(),
  routes,
  // Scroll to top on every route change
  scrollBehavior() {
    return { top: 0 }
  },
})

// ─── Navigation Guard ─────────────────────────────────────────────────────────
// Runs before EVERY route change
// router/index.ts
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  const token = localStorage.getItem("token")

  // If route requires auth
  if (to.meta.requiresAuth) {
    if (!token) {
      // No token — go to login
      return next("/login")
    }
    // Has token but store not loaded yet — fetch profile
    if (!authStore.isAuthenticated) {
      try {
        await authStore.fetchProfile()
      } catch {
        localStorage.removeItem("token")
        return next("/login")
      }
    }
    return next()
  }

  // If route is guest only (login/register) and user is logged in
  if (to.meta.guestOnly && token) {
    return next("/app/dashboard")
  }

  next()
})

export default router