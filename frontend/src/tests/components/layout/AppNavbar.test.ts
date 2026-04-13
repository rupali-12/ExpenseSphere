import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import { useAuthStore } from '@/stores/authStore'
import { useSessionStore } from '@/stores/sessionStore'
import AppNavbar from '@/components/layout/AppNavbar.vue'
import { nextTick } from 'vue'

vi.mock('vue-router', () => ({
  useRoute: () => ({
    path: '/app/dashboard',
  }),
  RouterLink: {
    template: '<a><slot /></a>',
  },
}))

const mountNavbar = () => {
  return mount(AppNavbar, {
    global: {
      plugins: [
        createTestingPinia({
          stubActions: false,
        }),
      ],
    },
  })
}

describe('AppNavbar.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders page title and subtitle based on route', () => {
    const wrapper = mountNavbar()

    expect(wrapper.text()).toContain('Dashboard')
    expect(wrapper.text()).toContain('Overview of your finances')
  })

  it('shows user initial from auth store', async () => {
    const wrapper = mountNavbar()
    const authStore = useAuthStore()

    authStore.user = {
      _id: '1',
      name: 'Rupali',
      email: 'rupali@example.com',
      currentBalance: 5000,
    }

    await nextTick()

    expect(wrapper.text()).toContain('R')
  })

  it('formats and displays user balance', async () => {
    const wrapper = mountNavbar()
    const authStore = useAuthStore()

    authStore.user = {
      _id: '2',
      name: 'Test User',
      email: 'testuser@example.com',
      currentBalance: 12345,
    }

    await nextTick()

    expect(wrapper.text()).toContain('₹')
    expect(wrapper.text()).toContain('12,345')
  })

  it('calls toggleSidebar when mobile menu button is clicked', async () => {
    const wrapper = mountNavbar()
    const sessionStore = useSessionStore()

    const toggleSpy = vi.spyOn(sessionStore, 'toggleSidebar')

    const button = wrapper.find('button')
    await button.trigger('click')

    expect(toggleSpy).toHaveBeenCalledOnce()
  })

  it('emits openAddModal when add button is clicked', async () => {
    const wrapper = mountNavbar()

    const buttons = wrapper.findAll('button')
    const addButton = buttons[1] 

    await addButton.trigger('click')

    expect(wrapper.emitted('openAddModal')).toBeTruthy()
    expect(wrapper.emitted('openAddModal')?.length).toBe(1)
  })

  it('renders RouterLink with user initial', async () => {
    const wrapper = mountNavbar()
    const authStore = useAuthStore()

    authStore.user = {
      _id: '3',
      name: 'Alex',
      email: 'alex@example.com',
      currentBalance: 0,
    }

    await nextTick()

    const link = wrapper.find('a')
    expect(link.exists()).toBe(true)
    expect(link.text()).toContain('A')
  })
})