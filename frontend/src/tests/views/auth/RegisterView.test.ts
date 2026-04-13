import { mount, flushPromises } from '@vue/test-utils'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { nextTick } from 'vue'
import RegisterView from '@/views/auth/RegisterView.vue'

// Mock router
const mockPush = vi.fn()
vi.mock('vue-router', async () => {
  const actual = await vi.importActual<any>('vue-router')
  return {
    ...actual,
    useRouter: () => ({ push: mockPush }),
    RouterLink: { template: '<a><slot/></a>' },
  }
})

// Mock stores
const mockRegister = vi.fn().mockResolvedValue({})
const mockShowSuccess = vi.fn()
vi.mock('@/stores/authStore', () => ({ useAuthStore: () => ({ register: (...args: any[]) => mockRegister(...args) }) }))
vi.mock('@/stores/sessionStore', () => ({ useSessionStore: () => ({ showSuccess: mockShowSuccess }) }))

const BaseInputStub = {
  props: ['modelValue', 'label', 'type', 'error', 'placeholder'],
  emits: ['update:modelValue'],
  template: '<div><label>{{ label }}</label><input :placeholder="placeholder" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" /><p v-if="error">{{ error }}</p><slot name="icon"/></div>',
}
const BaseButtonStub = { template: '<button v-bind="$attrs" @click="$emit(\'click\')"><slot/></button>' }

const mountView = () => mount(RegisterView, { attachTo: document.body, global: { stubs: { BaseInput: BaseInputStub, BaseButton: BaseButtonStub, Transition: { template: '<div><slot/></div>' } } } })

describe('RegisterView', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockRegister.mockResolvedValue({})
  })
  afterEach(() => { document.body.innerHTML = '' })

  it('renders form fields and basic layout', async () => {
    const wrapper = mountView()
    await nextTick()
    expect(wrapper.text()).toContain('Create account')
    expect(wrapper.find('input[placeholder="John Doe"]').exists()).toBe(true)
    expect(wrapper.find('input[placeholder="you@example.com"]').exists()).toBe(true)
  })

  it('validates inputs and shows errors without calling API', async () => {
    const wrapper = mountView()
    await nextTick()
    // submit empty form
    await wrapper.find('form').trigger('submit')
    await nextTick()
    expect(wrapper.text()).toContain('Name is required')
    expect(wrapper.text()).toContain('Email is required')
    expect(wrapper.text()).toContain('Password is required')
    expect(mockRegister).not.toHaveBeenCalled()

    // invalid email and short password
    const name = wrapper.find('input[placeholder="John Doe"]')
    const email = wrapper.find('input[placeholder="you@example.com"]')
    const pwd = wrapper.find('input[placeholder="Min. 8 characters"]')
    await name.setValue('Alice')
    await email.setValue('bad-email')
    await pwd.setValue('short')
    await wrapper.find('form').trigger('submit')
    await nextTick()
    expect(wrapper.text()).toContain('Enter a valid email')
    expect(wrapper.text()).toContain('Minimum 8 characters')
    expect(mockRegister).not.toHaveBeenCalled()
  })

  it('calls register and navigates on success', async () => {
    const wrapper = mountView()
    await nextTick()
    const name = wrapper.find('input[placeholder="John Doe"]')
    const email = wrapper.find('input[placeholder="you@example.com"]')
    const pwd = wrapper.find('input[placeholder="Min. 8 characters"]')
    await name.setValue('Alice')
    await email.setValue('alice@test.com')
    await pwd.setValue('longpassword')
    await wrapper.find('form').trigger('submit')
    await flushPromises()
    await nextTick()

    expect(mockRegister).toHaveBeenCalledWith({ name: 'Alice', email: 'alice@test.com', password: 'longpassword' })
    expect(mockShowSuccess).toHaveBeenCalledWith('OTP sent to your email!')
    expect(mockPush).toHaveBeenCalled()
  })

  it('shows backend error message when register fails', async () => {
    mockRegister.mockRejectedValue({ response: { data: { message: 'Email exists' } } })
    const wrapper = mountView()
    await nextTick()
    const name = wrapper.find('input[placeholder="John Doe"]')
    const email = wrapper.find('input[placeholder="you@example.com"]')
    const pwd = wrapper.find('input[placeholder="Min. 8 characters"]')
    await name.setValue('Alice')
    await email.setValue('alice@test.com')
    await pwd.setValue('longpassword')
    await wrapper.find('form').trigger('submit')
    await flushPromises()
    await nextTick()
    expect(wrapper.text()).toContain('Email exists')
  })

  it('shows generic fallback error when no response message', async () => {
    mockRegister.mockRejectedValue(new Error('network'))
    const wrapper = mountView()
    await nextTick()
    const name = wrapper.find('input[placeholder="John Doe"]')
    const email = wrapper.find('input[placeholder="you@example.com"]')
    const pwd = wrapper.find('input[placeholder="Min. 8 characters"]')
    await name.setValue('Alice')
    await email.setValue('alice@test.com')
    await pwd.setValue('longpassword')
    await wrapper.find('form').trigger('submit')
    await flushPromises()
    await nextTick()
    expect(wrapper.text()).toContain('Registration failed. Try again.')
  })
})