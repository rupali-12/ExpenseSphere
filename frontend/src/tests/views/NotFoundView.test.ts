import { mount, RouterLinkStub } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import NotFoundView from '@/views/NotFoundView.vue'

describe('NotFoundView', () => {
  it('renders 404 text, heading, description and login link', () => {
    const wrapper = mount(NotFoundView, {
      global: {
        stubs: {
          RouterLink: RouterLinkStub,
          BaseButton: { template: '<button><slot/></button>' },
        },
      },
    })

    expect(wrapper.text()).toContain('404')
    expect(wrapper.find('h1').text()).toBe('Page not found')

    expect(wrapper.text()).toContain("doesn't exist")

    const link = wrapper.findComponent(RouterLinkStub)
    expect(link.exists()).toBe(true)
    expect(link.props('to')).toBe('/login')
    expect(link.text()).toContain('Go to Login')
  })
})
