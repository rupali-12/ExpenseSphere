import { mount, flushPromises } from '@vue/test-utils'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { nextTick } from 'vue'
import LoginView from '@/views/auth/LoginView.vue'

// Router mock
const mockPush = vi.fn()
vi.mock('vue-router', async () => {
  const actual = await vi.importActual<any>('vue-router')
  return {
    ...actual,
    useRouter: () => ({ push: mockPush }),
    RouterLink: { template: '<a><slot/></a>' },
  }
})

// Auth & session mocks
let mockLogin = vi.fn().mockResolvedValue({})
const mockShowSuccess = vi.fn()
vi.mock('@/stores/authStore', () => ({ useAuthStore: () => ({ login: (...args: any[]) => mockLogin(...args) }) }))
vi.mock('@/stores/sessionStore', () => ({ useSessionStore: () => ({ showSuccess: mockShowSuccess }) }))

// BaseInput stub renders the icon slot so SVG markup is included in DOM
const BaseInputStub = {
  props: ['modelValue', 'label', 'type', 'error', 'placeholder'],
  emits: ['update:modelValue'],
  template: '<div><label>{{ label }}</label><input :placeholder="placeholder" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" /><p v-if="error">{{ error }}</p><slot name="icon"/></div>',
}
const BaseButtonStub = { template: '<button v-bind="$attrs" @click="$emit(\'click\')"><slot/></button>' }

const mountView = () => mount(LoginView, { attachTo: document.body, global: { stubs: { BaseInput: BaseInputStub, BaseButton: BaseButtonStub, Transition: { template: '<div><slot/></div>' } } } })

describe('LoginView', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockLogin = vi.fn().mockResolvedValue({})
    mockShowSuccess.mockClear()
    mockPush.mockClear()
  })
  afterEach(() => { document.body.innerHTML = '' })

  it('renders and includes input icon SVG', async () => {
    const wrapper = mountView()
    await nextTick()
    // the email input icon path should be present in DOM
    expect(wrapper.html()).toContain('M16 12a4 4 0 10-8 0')
  })

  it('validates email format and prevents login', async () => {
    const wrapper = mountView()
    await nextTick()
    const email = wrapper.find('input[placeholder="you@example.com"]')
    const pwd = wrapper.find('input[placeholder="Enter your password"]')
    await email.setValue('bad-email')
    await pwd.setValue('something')
    await wrapper.find('form').trigger('submit')
    await nextTick()
    expect(wrapper.text()).toContain('Enter a valid email')
    expect(mockLogin).not.toHaveBeenCalled()
  })

  it('validates password presence and prevents login', async () => {
    const wrapper = mountView()
    await nextTick()
    const email = wrapper.find('input[placeholder="you@example.com"]')
    await email.setValue('user@test.com')
    await wrapper.find('form').trigger('submit')
    await nextTick()
    expect(wrapper.text()).toContain('Password is required')
    expect(mockLogin).not.toHaveBeenCalled()
  })

  it('calls login and navigates on success', async () => {
    const wrapper = mountView()
    await nextTick()
    const email = wrapper.find('input[placeholder="you@example.com"]')
    const pwd = wrapper.find('input[placeholder="Enter your password"]')
    await email.setValue('user@test.com')
    await pwd.setValue('pass123')
    await wrapper.find('form').trigger('submit')
    await flushPromises()
    await nextTick()

    expect(mockLogin).toHaveBeenCalledWith({ email: 'user@test.com', password: 'pass123' })
    expect(mockShowSuccess).toHaveBeenCalledWith('Welcome back!')
    expect(mockPush).toHaveBeenCalledWith('/app/dashboard')
  })

  it('displays backend error message when login fails with response message', async () => {
    mockLogin = vi.fn().mockRejectedValue({ response: { data: { message: 'Invalid credentials' } } })
    const wrapper = mountView()
    await nextTick()
    const email = wrapper.find('input[placeholder="you@example.com"]')
    const pwd = wrapper.find('input[placeholder="Enter your password"]')
    await email.setValue('user@test.com')
    await pwd.setValue('wrong')
    await wrapper.find('form').trigger('submit')
    await flushPromises()
    await nextTick()
    expect(wrapper.text()).toContain('Invalid credentials')
  })

  it('shows generic fallback when login fails without response message', async () => {
    mockLogin = vi.fn().mockRejectedValue(new Error('network'))
    const wrapper = mountView()
    await nextTick()
    const email = wrapper.find('input[placeholder="you@example.com"]')
    const pwd = wrapper.find('input[placeholder="Enter your password"]')
    await email.setValue('user@test.com')
    await pwd.setValue('wrong')
    await wrapper.find('form').trigger('submit')
    await flushPromises()
    await nextTick()
    expect(wrapper.text()).toContain('Login failed. Please try again.')
  })
})