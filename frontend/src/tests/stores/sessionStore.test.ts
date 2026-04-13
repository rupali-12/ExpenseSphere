import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useSessionStore } from '@/stores/sessionStore'

describe('sessionStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  // ─── Initial State ───────────────────────────────────────────────────────
  describe('initial state', () => {
    it('starts with isLoading false, sidebarOpen false, empty toasts', () => {
      const store = useSessionStore()
      expect(store.isLoading).toBe(false)
      expect(store.sidebarOpen).toBe(false)
      expect(store.toasts).toHaveLength(0)
    })
  })

  // ─── setLoading ──────────────────────────────────────────────────────────
  describe('setLoading', () => {
    it('sets isLoading to true', () => {
      const store = useSessionStore()
      store.setLoading(true)
      expect(store.isLoading).toBe(true)
    })

    it('sets isLoading back to false', () => {
      const store = useSessionStore()
      store.setLoading(true)
      store.setLoading(false)
      expect(store.isLoading).toBe(false)
    })
  })

  // ─── toggleSidebar ───────────────────────────────────────────────────────
  describe('toggleSidebar', () => {
    it('toggles sidebarOpen from false to true', () => {
      const store = useSessionStore()
      store.toggleSidebar()
      expect(store.sidebarOpen).toBe(true)
    })

    it('toggles sidebarOpen back to false', () => {
      const store = useSessionStore()
      store.toggleSidebar()
      store.toggleSidebar()
      expect(store.sidebarOpen).toBe(false)
    })
  })

  // ─── closeSidebar ────────────────────────────────────────────────────────
  describe('closeSidebar', () => {
    it('sets sidebarOpen to false', () => {
      const store = useSessionStore()
      store.toggleSidebar() 
      store.closeSidebar()
      expect(store.sidebarOpen).toBe(false)
    })

    it('is idempotent when already closed', () => {
      const store = useSessionStore()
      store.closeSidebar()
      expect(store.sidebarOpen).toBe(false)
    })
  })

  // ─── showToast ───────────────────────────────────────────────────────────
  describe('showToast', () => {
    it('adds a toast with the correct message and type', () => {
      const store = useSessionStore()
      store.showToast('Hello', 'success')

      expect(store.toasts).toHaveLength(1)
      expect(store.toasts[0].message).toBe('Hello')
      expect(store.toasts[0].type).toBe('success')
    })

    it('defaults to type "info" when no type given', () => {
      const store = useSessionStore()
      store.showToast('Info message')

      expect(store.toasts[0].type).toBe('info')
    })

    it('assigns incrementing unique ids to toasts', () => {
      const store = useSessionStore()
      store.showToast('First')
      store.showToast('Second')

      expect(store.toasts[0].id).not.toBe(store.toasts[1].id)
    })

    it('auto-removes toast after 3 seconds', () => {
      const store = useSessionStore()
      store.showToast('Auto remove me')
      expect(store.toasts).toHaveLength(1)

      vi.advanceTimersByTime(3000)
      expect(store.toasts).toHaveLength(0)
    })

    it('keeps other toasts when one expires', () => {
      const store = useSessionStore()
      store.showToast('First')
      vi.advanceTimersByTime(1000)
      store.showToast('Second')
      vi.advanceTimersByTime(2000) 

      expect(store.toasts).toHaveLength(1)
      expect(store.toasts[0].message).toBe('Second')
    })
  })

  // ─── removeToast ─────────────────────────────────────────────────────────
  describe('removeToast', () => {
    it('removes the toast with the matching id', () => {
      const store = useSessionStore()
      store.showToast('Remove me')
      const id = store.toasts[0].id

      store.removeToast(id)
      expect(store.toasts).toHaveLength(0)
    })

    it('does not remove other toasts', () => {
      const store = useSessionStore()
      store.showToast('Keep me')
      store.showToast('Remove me')

      const idToRemove = store.toasts[1].id
      store.removeToast(idToRemove)

      expect(store.toasts).toHaveLength(1)
      expect(store.toasts[0].message).toBe('Keep me')
    })

    it('does nothing when id does not exist', () => {
      const store = useSessionStore()
      store.showToast('Stay')
      store.removeToast(99999)
      expect(store.toasts).toHaveLength(1)
    })
  })

  // ─── Shorthand helpers ───────────────────────────────────────────────────
  describe('shorthand toast helpers', () => {
    it('showSuccess adds a success toast', () => {
      const store = useSessionStore()
      store.showSuccess('Done!')
      expect(store.toasts[0].type).toBe('success')
      expect(store.toasts[0].message).toBe('Done!')
    })

    it('showError adds an error toast', () => {
      const store = useSessionStore()
      store.showError('Failed!')
      expect(store.toasts[0].type).toBe('error')
    })

    it('showWarning adds a warning toast', () => {
      const store = useSessionStore()
      store.showWarning('Careful!')
      expect(store.toasts[0].type).toBe('warning')
    })

    it('showInfo adds an info toast', () => {
      const store = useSessionStore()
      store.showInfo('FYI')
      expect(store.toasts[0].type).toBe('info')
    })
  })
})