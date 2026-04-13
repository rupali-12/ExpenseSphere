import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import { useSessionStore } from '@/stores/sessionStore'
import { useAuthStore } from '@/stores/authStore'
import AppLayout from '@/components/layout/AppLayout.vue'
import { nextTick } from 'vue'

const pushMock = vi.fn()
const mockRoute = { path: '/app/dashboard' }

vi.mock('vue-router', () => ({
  RouterView: {
    template: `
      <div data-test="router-view">
        <slot :Component="DummyComponent" />
      </div>
    `,
    components: {
      DummyComponent: {
        template: `<div data-test="dummy-page">Dummy Page</div>`,
      },
    },
  },
  RouterLink: {
    template: `<a @click="$emit('click')"><slot/></a>`,
  },
  useRoute: () => mockRoute,
  useRouter: () => ({ push: pushMock }),
}))

vi.mock('@/components/common/ToastContainer.vue', () => ({
  default: {
    template: `<div data-test="toast-container" />`,
  },
}))

const mountLayout = () =>
  mount(AppLayout, {
    global: {
      plugins: [
        createTestingPinia({
          stubActions: false,
        }),
      ],
    },
  })

describe('AppLayout.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockRoute.path = '/app/dashboard'
  })

 it('renders layout structure', () => {
  const wrapper = mountLayout()

  expect(wrapper.find('header').exists()).toBe(true)
  expect(wrapper.find('aside').exists()).toBe(true)
  expect(wrapper.find('[data-test="router-view"]').exists()).toBe(true)
  expect(wrapper.find('[data-test="toast-container"]').exists()).toBe(true)
})

  it('reacts to sidebar state from session store', async () => {
    const wrapper = mountLayout()
    const sessionStore = useSessionStore()

    sessionStore.sidebarOpen = false
    await nextTick()

    expect(wrapper.find('aside').classes()).toContain('-translate-x-full')
  })

  it('toggles sidebar when mobile menu button is clicked', async () => {
    const wrapper = mountLayout()
    const sessionStore = useSessionStore()

    const btn = wrapper.find('header button')
    await btn.trigger('click')

    expect(sessionStore.sidebarOpen).toBe(true)
  })

  it('closes sidebar when overlay is clicked', async () => {
    const wrapper = mountLayout()
    const sessionStore = useSessionStore()

    sessionStore.sidebarOpen = true
    sessionStore.closeSidebar = vi.fn()
    await nextTick()

    const overlay = wrapper.find('.bg-black\\/30')
    expect(overlay.exists()).toBe(true)

    await overlay.trigger('click')
    expect(sessionStore.closeSidebar).toHaveBeenCalled()
  })

  it('closes sidebar when nav link is clicked', async () => {
    const wrapper = mountLayout()
    const sessionStore = useSessionStore()

    sessionStore.closeSidebar = vi.fn()
    await nextTick()

    const link = wrapper.find('a')
    await link.trigger('click')

    expect(sessionStore.closeSidebar).toHaveBeenCalled()
  })

  it('calls logout and redirects to login', async () => {
    const wrapper = mountLayout()
    const authStore = useAuthStore()

    authStore.logout = vi.fn()

    const logoutBtn = wrapper.find('button[title="Logout"]')
    expect(logoutBtn.exists()).toBe(true)

    await logoutBtn.trigger('click')

    expect(authStore.logout).toHaveBeenCalled()
    expect(pushMock).toHaveBeenCalledWith('/login')
  })

  it('shows Transactions title', async () => {
    mockRoute.path = '/app/transactions'
    const wrapper = mountLayout()

    await nextTick()
    expect(wrapper.text()).toContain('Transactions')
  })

  it('shows Profile title', async () => {
    mockRoute.path = '/app/profile'
    const wrapper = mountLayout()

    await nextTick()
    expect(wrapper.text()).toContain('Profile')
  })

  it('shows default title for unknown route', async () => {
    mockRoute.path = '/unknown'
    const wrapper = mountLayout()

    await nextTick()
    expect(wrapper.text()).toContain('ExpenseSphere')
  })
})