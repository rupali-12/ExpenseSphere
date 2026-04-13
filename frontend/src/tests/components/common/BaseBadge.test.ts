import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import BaseBadge from '@/components/common/BaseBadge.vue'

describe('BaseBadge', () => {
  it('renders slot content', () => {
    const wrapper = mount(BaseBadge, { slots: { default: 'Deposit' } })
    expect(wrapper.text()).toBe('Deposit')
  })

  it('applies deposit variant classes', () => {
    const wrapper = mount(BaseBadge, { props: { variant: 'deposit' } })
    expect(wrapper.classes()).toContain('bg-[#D1FAE5]')
    expect(wrapper.classes()).toContain('text-[#059669]')
  })

  it('applies withdrawal variant classes', () => {
    const wrapper = mount(BaseBadge, { props: { variant: 'withdrawal' } })
    expect(wrapper.classes()).toContain('bg-[#FEE2E2]')
    expect(wrapper.classes()).toContain('text-[#DC2626]')
  })

  it('applies info variant classes', () => {
    const wrapper = mount(BaseBadge, { props: { variant: 'info' } })
    expect(wrapper.classes()).toContain('bg-[#DBEAFE]')
  })

  it('applies warning variant classes', () => {
    const wrapper = mount(BaseBadge, { props: { variant: 'warning' } })
    expect(wrapper.classes()).toContain('bg-[#FEF3C7]')
  })

  it('applies default variant by default', () => {
    const wrapper = mount(BaseBadge)
    expect(wrapper.classes()).toContain('bg-[#F1F5F9]')
  })

  it('applies sm size classes', () => {
    const wrapper = mount(BaseBadge, { props: { size: 'sm' } })
    expect(wrapper.classes()).toContain('text-xs')
    expect(wrapper.classes()).toContain('px-2')
  })

  it('applies md size classes by default', () => {
    const wrapper = mount(BaseBadge)
    expect(wrapper.classes()).toContain('px-2.5')
  })

  it('always has base classes', () => {
    const wrapper = mount(BaseBadge)
    expect(wrapper.classes()).toContain('inline-flex')
    expect(wrapper.classes()).toContain('rounded-full')
    expect(wrapper.classes()).toContain('font-semibold')
  })
})