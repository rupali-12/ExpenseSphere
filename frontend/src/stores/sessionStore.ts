import { defineStore } from 'pinia'
import { ref } from 'vue'

// ─── Toast Type ───
export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface Toast {
  id: number
  message: string
  type: ToastType
}

export const useSessionStore = defineStore('session', () => {
  // ─── State ────
  const isLoading = ref<boolean>(false)
  const sidebarOpen = ref<boolean>(false)
  const toasts = ref<Toast[]>([])
  let toastId = 0

  // ─── Loading ─────
  const setLoading = (val: boolean) => {
    isLoading.value = val
  }

  // ─── Sidebar ───
  const toggleSidebar = () => {
    sidebarOpen.value = !sidebarOpen.value
  }

  const closeSidebar = () => {
    sidebarOpen.value = false
  }

  // ─── Toasts ────
  const showToast = (message: string, type: ToastType = 'info') => {
    const id = ++toastId
    toasts.value.push({ id, message, type })

    // Auto remove after 3 seconds
    setTimeout(() => {
      removeToast(id)
    }, 3000)
  }

  const removeToast = (id: number) => {
    toasts.value = toasts.value.filter((t) => t.id !== id)
  }

  // ─── Shorthand Toast Helpers ────
  const showSuccess = (message: string) => showToast(message, 'success')
  const showError = (message: string) => showToast(message, 'error')
  const showWarning = (message: string) => showToast(message, 'warning')
  const showInfo = (message: string) => showToast(message, 'info')

  return {
    // State
    isLoading,
    sidebarOpen,
    toasts,
    // Actions
    setLoading,
    toggleSidebar,
    closeSidebar,
    showToast,
    removeToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  }
})