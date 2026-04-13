import { mount } from '@vue/test-utils'
import { describe, it, expect, vi } from 'vitest'

const mockForgot = vi.fn().mockResolvedValue({})
const mockShowSuccess = vi.fn()
const mockPush = vi.fn()

vi.mock('@/stores/authStore', () => ({ useAuthStore: () => ({ forgotPassword: mockForgot }) }))
vi.mock('@/stores/sessionStore', () => ({ useSessionStore: () => ({ showSuccess: mockShowSuccess }) }))
vi.mock('vue-router', () => ({ useRouter: () => ({ push: mockPush }), RouterLink: { template: '<a><slot/></a>' } }))

import ForgotPasswordView from '@/views/auth/ForgotPasswordView.vue'

const BaseInputStub = {
  props: ['modelValue', 'error'],
  emits: ['update:modelValue'],
  template: '<div><input :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" /><span class="error">{{ error }}</span></div>',
}
const BaseButtonStub = { template: '<button @click="$emit(\'click\')"><slot/></button>' }

describe('ForgotPasswordView', () => {
  it('validates email and sends reset OTP', async () => {
    const wrapper = mount(ForgotPasswordView, { global: { stubs: { BaseInput: BaseInputStub, BaseButton: BaseButtonStub } } })
    await wrapper.find('form').trigger('submit')
    expect(wrapper.text()).toContain('Email is required')

    const input = wrapper.find('input')
    await input.setValue('user@example.com')
    await wrapper.find('form').trigger('submit')
    await wrapper.vm.$nextTick()
    expect(mockForgot).toHaveBeenCalled()
    expect(mockShowSuccess).toHaveBeenCalled()
    expect(mockPush).toHaveBeenCalled()
  })
})
