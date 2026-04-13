import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import BaseLoader from '@/components/common/BaseSpinner.vue'

describe('BaseLoader.vue', () => {
  const mountLoader = (props = {}) =>
    mount(BaseLoader, {
      props,
    })

  it('renders loader container', () => {
    const wrapper = mountLoader()
    expect(wrapper.find('div').exists()).toBe(true)
  })

  it('does not apply fullPage class by default', () => {
    const wrapper = mountLoader()
    expect(wrapper.classes()).not.toContain('min-h-screen')
  })

  it('applies fullPage class when fullPage is true', () => {
    const wrapper = mountLoader({ fullPage: true })
    expect(wrapper.classes()).toContain('min-h-screen')
  })

  it('applies default size class (md)', () => {
    const wrapper = mountLoader()
    const spinner = wrapper.find('.animate-spin')

    expect(spinner.classes()).toContain('w-6')
    expect(spinner.classes()).toContain('h-6')
  })

  it('applies small size class when size="sm"', () => {
    const wrapper = mountLoader({ size: 'sm' })
    const spinner = wrapper.find('.animate-spin')

    expect(spinner.classes()).toContain('w-4')
    expect(spinner.classes()).toContain('h-4')
  })

  it('applies large size class when size="lg"', () => {
    const wrapper = mountLoader({ size: 'lg' })
    const spinner = wrapper.find('.animate-spin')

    expect(spinner.classes()).toContain('w-10')
    expect(spinner.classes()).toContain('h-10')
    expect(spinner.classes()).toContain('border-[3px]')
  })

  it('applies primary color classes by default', () => {
    const wrapper = mountLoader()
    const spinner = wrapper.find('.animate-spin')

    expect(spinner.classes()).toContain('border-[#E2E8F0]')
    expect(spinner.classes()).toContain('border-t-[#1A365D]')
  })

  it('applies white color classes when color="white"', () => {
    const wrapper = mountLoader({ color: 'white' })
    const spinner = wrapper.find('.animate-spin')

    expect(spinner.classes()).toContain('border-white/30')
    expect(spinner.classes()).toContain('border-t-white')
  })

  it('applies accent color classes when color="accent"', () => {
    const wrapper = mountLoader({ color: 'accent' })
    const spinner = wrapper.find('.animate-spin')

    expect(spinner.classes()).toContain('border-[#E2E8F0]')
    expect(spinner.classes()).toContain('border-t-[#00B4D8]')
  })
})