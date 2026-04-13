import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import BaseButton from '@/components/common/BaseButton.vue'

describe('BaseButton', () => {
  it('renders slot content', () => {
    const wrapper = mount(BaseButton, { slots: { default: 'Click me' } })
    expect(wrapper.text()).toContain('Click me')
  })

  it('defaults to type="button"', () => {
    const wrapper = mount(BaseButton)
    expect(wrapper.attributes('type')).toBe('button')
  })

  it('accepts type="submit"', () => {
    const wrapper = mount(BaseButton, { props: { type: 'submit' } })
    expect(wrapper.attributes('type')).toBe('submit')
  })

  it('is disabled when disabled prop is true', () => {
    const wrapper = mount(BaseButton, { props: { disabled: true } })
    expect(wrapper.attributes('disabled')).toBeDefined()
    expect(wrapper.classes()).toContain('opacity-60')
    expect(wrapper.classes()).toContain('cursor-not-allowed')
  })

  it('is disabled when loading prop is true', () => {
    const wrapper = mount(BaseButton, { props: { loading: true } })
    expect(wrapper.attributes('disabled')).toBeDefined()
  })

  it('shows spinner svg when loading', () => {
    const wrapper = mount(BaseButton, { props: { loading: true } })
    expect(wrapper.find('svg.animate-spin').exists()).toBe(true)
  })

  it('does not show spinner when not loading', () => {
    const wrapper = mount(BaseButton, { props: { loading: false } })
    expect(wrapper.find('svg.animate-spin').exists()).toBe(false)
  })

  it('applies primary variant classes by default', () => {
    const wrapper = mount(BaseButton)
    expect(wrapper.classes()).toContain('bg-[#1A365D]')
  })

  it('applies secondary variant classes', () => {
    const wrapper = mount(BaseButton, { props: { variant: 'secondary' } })
    expect(wrapper.classes()).toContain('bg-white')
    expect(wrapper.classes()).toContain('border')
  })

  it('applies danger variant classes', () => {
    const wrapper = mount(BaseButton, { props: { variant: 'danger' } })
    expect(wrapper.classes()).toContain('bg-[#DC2626]')
  })

  it('applies success variant classes', () => {
    const wrapper = mount(BaseButton, { props: { variant: 'success' } })
    expect(wrapper.classes()).toContain('bg-[#059669]')
  })

  it('applies ghost variant classes', () => {
    const wrapper = mount(BaseButton, { props: { variant: 'ghost' } })
    expect(wrapper.classes()).toContain('bg-transparent')
  })

  it('applies sm size classes', () => {
    const wrapper = mount(BaseButton, { props: { size: 'sm' } })
    expect(wrapper.classes()).toContain('px-3')
  })

  it('applies md size classes by default', () => {
    const wrapper = mount(BaseButton)
    expect(wrapper.classes()).toContain('px-4')
  })

  it('applies lg size classes', () => {
    const wrapper = mount(BaseButton, { props: { size: 'lg' } })
    expect(wrapper.classes()).toContain('px-6')
  })

  it('always has base classes', () => {
    const wrapper = mount(BaseButton)
    expect(wrapper.classes()).toContain('inline-flex')
    expect(wrapper.classes()).toContain('rounded-xl')
    expect(wrapper.classes()).toContain('font-semibold')
  })
})