import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import BaseModal from '@/components/common/BaseModal.vue'

const globalConfig = {
  global: {
    stubs: { Teleport: true },
  },
}

describe('BaseModal', () => {
  it('does not render content when modelValue is false', () => {
    const wrapper = mount(BaseModal, {
      props: { modelValue: false },
      ...globalConfig,
    })
    expect(wrapper.find('.bg-white').exists()).toBe(false)
  })

  it('renders content when modelValue is true', () => {
    const wrapper = mount(BaseModal, {
      props: { modelValue: true },
      ...globalConfig,
    })
    expect(wrapper.find('.bg-white').exists()).toBe(true)
  })

  it('renders title in header when title prop is given', () => {
    const wrapper = mount(BaseModal, {
      props: { modelValue: true, title: 'My Modal' },
      ...globalConfig,
    })
    expect(wrapper.find('h2').text()).toBe('My Modal')
  })

  it('does not render header when title prop is absent', () => {
    const wrapper = mount(BaseModal, {
      props: { modelValue: true },
      ...globalConfig,
    })
    expect(wrapper.find('h2').exists()).toBe(false)
  })

  it('renders close button when closable=true (default)', () => {
    const wrapper = mount(BaseModal, {
      props: { modelValue: true, title: 'Modal' },
      ...globalConfig,
    })
    expect(wrapper.find('button').exists()).toBe(true)
  })

  it('hides close button when closable=false', () => {
    const wrapper = mount(BaseModal, {
      props: { modelValue: true, title: 'Modal', closable: false },
      ...globalConfig,
    })
    expect(wrapper.find('button').exists()).toBe(false)
  })

  it('emits update:modelValue with false when close button is clicked', async () => {
    const wrapper = mount(BaseModal, {
      props: { modelValue: true, title: 'Modal' },
      ...globalConfig,
    })
    await wrapper.find('button').trigger('click')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([false])
  })

  it('emits update:modelValue with false on overlay click when not persistent', async () => {
    const wrapper = mount(BaseModal, {
      props: { modelValue: true, persistent: false },
      ...globalConfig,
    })
    const overlay = wrapper.find('.fixed')
    await overlay.trigger('click')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([false])
  })

  it('does NOT emit close on overlay click when persistent=true', async () => {
    const wrapper = mount(BaseModal, {
      props: { modelValue: true, persistent: true },
      ...globalConfig,
    })
    const overlay = wrapper.find('.fixed')
    await overlay.trigger('click')
    expect(wrapper.emitted('update:modelValue')).toBeFalsy()
  })

  it('renders default slot content inside body', () => {
    const wrapper = mount(BaseModal, {
      props: { modelValue: true },
      slots: { default: '<p class="body-content">Hello World</p>' },
      ...globalConfig,
    })
    expect(wrapper.find('.body-content').exists()).toBe(true)
    expect(wrapper.find('.body-content').text()).toBe('Hello World')
  })

  it('renders footer slot when provided', () => {
    const wrapper = mount(BaseModal, {
      props: { modelValue: true },
      slots: { footer: '<button class="footer-btn">Confirm</button>' },
      ...globalConfig,
    })
    expect(wrapper.find('.footer-btn').exists()).toBe(true)
  })

  it('does not render footer wrapper when footer slot is not provided', () => {
    const wrapper = mount(BaseModal, {
      props: { modelValue: true },
      ...globalConfig,
    })
    expect(wrapper.find('.border-t').exists()).toBe(false)
  })

  it.each([
    ['sm', 'max-w-sm'],
    ['md', 'max-w-md'],
    ['lg', 'max-w-lg'],
    ['xl', 'max-w-xl'],
  ] as const)('applies %s maxWidth class', (maxWidth, cls) => {
    const wrapper = mount(BaseModal, {
      props: { modelValue: true, maxWidth },
      ...globalConfig,
    })
    const panel = wrapper.find(`.${cls}`)
    expect(panel.exists()).toBe(true)
  })
})