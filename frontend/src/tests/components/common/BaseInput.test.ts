import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import BaseInput from '@/components/common/BaseInput.vue'

describe('BaseInput', () => {
  const defaultProps = { modelValue: '' }

  it('renders an input element', () => {
    const wrapper = mount(BaseInput, { props: defaultProps })
    expect(wrapper.find('input').exists()).toBe(true)
  })

  it('displays label when label prop is given', () => {
    const wrapper = mount(BaseInput, { props: { ...defaultProps, label: 'Email' } })
    expect(wrapper.find('label').text()).toContain('Email')
  })

  it('does not render label when label prop is absent', () => {
    const wrapper = mount(BaseInput, { props: defaultProps })
    expect(wrapper.find('label').exists()).toBe(false)
  })

  it('shows required asterisk when required=true and label is set', () => {
    const wrapper = mount(BaseInput, { props: { ...defaultProps, label: 'Name', required: true } })
    expect(wrapper.find('span').text()).toBe('*')
  })

  it('does not show asterisk when required=false', () => {
    const wrapper = mount(BaseInput, { props: { ...defaultProps, label: 'Name', required: false } })
    const spans = wrapper.findAll('span')
    const hasAsterisk = spans.some(s => s.text() === '*')
    expect(hasAsterisk).toBe(false)
  })

  it('renders placeholder', () => {
    const wrapper = mount(BaseInput, { props: { ...defaultProps, placeholder: 'Enter value' } })
    expect(wrapper.find('input').attributes('placeholder')).toBe('Enter value')
  })

  it('disables input when disabled=true', () => {
    const wrapper = mount(BaseInput, { props: { ...defaultProps, disabled: true } })
    expect(wrapper.find('input').attributes('disabled')).toBeDefined()
  })

  it('emits update:modelValue on input event', async () => {
    const wrapper = mount(BaseInput, { props: defaultProps })
    await wrapper.find('input').setValue('hello')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['hello'])
  })

  it('emits blur on blur event', async () => {
    const wrapper = mount(BaseInput, { props: defaultProps })
    await wrapper.find('input').trigger('blur')
    expect(wrapper.emitted('blur')).toBeTruthy()
  })

  it('shows error message when error prop is provided', () => {
    const wrapper = mount(BaseInput, { props: { ...defaultProps, error: 'Field is required' } })
    expect(wrapper.text()).toContain('Field is required')
  })

  it('does not show error message when error prop is absent', () => {
    const wrapper = mount(BaseInput, { props: defaultProps })
    expect(wrapper.find('p.text-\\[\\#DC2626\\]').exists()).toBe(false)
  })

  it('shows hint text when hint prop is provided and no error', () => {
    const wrapper = mount(BaseInput, { props: { ...defaultProps, hint: 'We never share your email' } })
    expect(wrapper.text()).toContain('We never share your email')
  })

  it('hides hint when error is also present', () => {
    const wrapper = mount(BaseInput, { props: { ...defaultProps, hint: 'Hint', error: 'Error' } })
    const paragraphs = wrapper.findAll('p')
    const hintPara = paragraphs.find(p => p.text() === 'Hint')
    expect(hintPara).toBeUndefined()
  })

  it('renders password toggle button when type=password', () => {
    const wrapper = mount(BaseInput, { props: { ...defaultProps, type: 'password' } })
    expect(wrapper.find('button').exists()).toBe(true)
  })

  it('does not render password toggle for text type', () => {
    const wrapper = mount(BaseInput, { props: { ...defaultProps, type: 'text' } })
    expect(wrapper.find('button').exists()).toBe(false)
  })

  it('toggles password visibility when toggle button is clicked', async () => {
    const wrapper = mount(BaseInput, { props: { ...defaultProps, type: 'password', modelValue: 'secret' } })
    const input = wrapper.find('input')
    expect(input.attributes('type')).toBe('password')

    await wrapper.find('button').trigger('click')
    expect(input.attributes('type')).toBe('text')

    await wrapper.find('button').trigger('click')
    expect(input.attributes('type')).toBe('password')
  })

  it('adds pl-10 padding when icon slot is used', () => {
    const wrapper = mount(BaseInput, {
      props: defaultProps,
      slots: { icon: '<svg />' },
    })
    expect(wrapper.find('input').classes()).toContain('pl-10')
  })

  it('uses pl-4 padding when no icon slot', () => {
    const wrapper = mount(BaseInput, { props: defaultProps })
    expect(wrapper.find('input').classes()).toContain('pl-4')
  })

  it('binds id to input and label', () => {
    const wrapper = mount(BaseInput, { props: { ...defaultProps, id: 'email-field', label: 'Email' } })
    expect(wrapper.find('input').attributes('id')).toBe('email-field')
    expect(wrapper.find('label').attributes('for')).toBe('email-field')
  })
})