import { mount, RouterLinkStub } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import { describe, expect, it, vi } from 'vitest'

vi.mock('vue-router', () => ({
  useRoute: () => ({ path: '/app/dashboard' }),
  useRouter: () => ({ push: vi.fn() }),
  RouterLink: RouterLinkStub,
}))

import AppSidebar from '@/components/layout/AppSidebar.vue'

describe('AppSidebar.vue', () => {
  it('renders brand, nav items and user info with formatted balance', () => {
    const pinia = createTestingPinia({
      initialState: {
        auth: { user: { name: 'Alice', email: 'alice@example.com', currentBalance: 1234 } },
        session: { sidebarOpen: true },
      },
    })

    const wrapper = mount(AppSidebar, {
      global: {
        plugins: [pinia],
        stubs: { RouterLink: RouterLinkStub },
      },
    })

    expect(wrapper.text()).toContain('ExpenseTrack')

    expect(wrapper.text()).toContain('Dashboard')
    expect(wrapper.text()).toContain('Transactions')
    expect(wrapper.text()).toContain('Profile')

    expect(wrapper.text()).toContain('Alice')
    expect(wrapper.text()).toContain('alice@example.com')
    expect(wrapper.text()).toContain('A')

    expect(wrapper.text()).toContain('₹1,234')
  })
})
