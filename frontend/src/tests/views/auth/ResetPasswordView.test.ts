import { mount, flushPromises } from '@vue/test-utils'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { nextTick } from 'vue'
import ResetPasswordView from '@/views/auth/ResetPasswordView.vue'

// Router + route mocks
const mockPush = vi.fn()
vi.mock('vue-router', async () => {
  const actual = await vi.importActual<any>('vue-router')
  return {
    ...actual,
    useRouter: () => ({ push: mockPush }),
    useRoute:  () => ({ query: { email: 'me@site.test' } }),
    RouterLink: { template: '<a><slot/></a>' },
  }
})

// Auth + session store mocks
let verifyForgotOtp = vi.fn().mockResolvedValue({})
let resetPassword = vi.fn().mockResolvedValue({})
const authStoreStub: any = { verifyForgotOtp: (...args: any[]) => verifyForgotOtp(...args), resetPassword: (...args: any[]) => resetPassword(...args), resetToken: 'rt-123' }
const mockShowSuccess = vi.fn()

vi.mock('@/stores/authStore', () => ({ useAuthStore: () => authStoreStub }))
vi.mock('@/stores/sessionStore', () => ({ useSessionStore: () => ({ showSuccess: mockShowSuccess }) }))

// Stubs for BaseInput and BaseButton
const BaseInputStub = {
  props: ['modelValue', 'label', 'type', 'error', 'placeholder', 'required'],
  emits: ['update:modelValue'],
  template: `
    <div>
      <label>{{ label }}</label>
      <input :type="type" :value="modelValue" @input="$emit('update:modelValue', $event.target.value)" />
      <p v-if="error" class="error">{{ error }}</p>
      <slot name="icon" />
    </div>
  `,
}

const BaseButtonStub = { template: '<button v-bind="$attrs" @click="$emit(\'click\')"><slot/></button>' }

const mountView = () =>
  mount(ResetPasswordView, {
    attachTo: document.body,
    global: {
      stubs: { Transition: { template: '<div><slot/></div>' }, BaseInput: BaseInputStub, BaseButton: BaseButtonStub },
    },
  })

describe('ResetPasswordView', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    verifyForgotOtp = vi.fn().mockResolvedValue({})
    resetPassword = vi.fn().mockResolvedValue({})
  })
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('renders email from route and shows step 1 header', async () => {
    const wrapper = mountView()
    await nextTick()
    expect(wrapper.text()).toContain('Enter OTP')
    expect(wrapper.text()).toContain('me@site.test')
  })

  it('OTP input moves focus and handles paste', async () => {
    const wrapper = mountView()
    await nextTick()
    const otpInputs = wrapper.findAll('input').filter(i => i.attributes('maxlength') === '1')
    expect(otpInputs).toHaveLength(6)

    await otpInputs[0].setValue('1')
    await nextTick()
    expect(document.activeElement).toBe(otpInputs[1].element)

    await otpInputs[0].trigger('paste', { clipboardData: { getData: () => '987654' } })
    await nextTick()
    const vals = otpInputs.map(i => (i.element as HTMLInputElement).value)
    expect(vals.join('')).toBe('987654')
  })

  it('verifyForgotOtp success advances to step 2', async () => {
    const wrapper = mountView()
    await nextTick()
    const otpInputs = wrapper.findAll('input').filter(i => i.attributes('maxlength') === '1')
    for (let i = 0; i < 6; i++) await otpInputs[i].setValue(String(i + 1))
    await nextTick()

    const btn = wrapper.findAll('button').find(b => b.text().includes('Verify OTP'))!
    await btn.trigger('click')
    await flushPromises()
    await nextTick()

    expect(verifyForgotOtp).toHaveBeenCalledWith({ email: 'me@site.test', otp: '123456' })
    expect(wrapper.text()).toContain('New Password')
  })

  it('verifyForgotOtp failure shows error, clears inputs and focuses first', async () => {
    verifyForgotOtp = vi.fn().mockRejectedValue({ response: { data: { message: 'Bad OTP' } } })
    const wrapper = mountView()
    await nextTick()
    const otpInputs = wrapper.findAll('input').filter(i => i.attributes('maxlength') === '1')
    for (let i = 0; i < 6; i++) await otpInputs[i].setValue('9')
    await nextTick()

    const btn = wrapper.findAll('button').find(b => b.text().includes('Verify OTP'))!
    await btn.trigger('click')
    await flushPromises()
    await nextTick()

    expect(wrapper.text()).toContain('Bad OTP')
    const vals = otpInputs.map(i => (i.element as HTMLInputElement).value)
    expect(vals.every(v => v === '')).toBe(true)
    expect(document.activeElement).toBe(otpInputs[0].element)
  })

  it('validates new password length and mismatch', async () => {
    const wrapper = mountView()
    ;(wrapper.vm as any).step = 2
    await nextTick()

    const pwdInputs = wrapper.findAll('input').filter(i => i.attributes('type') === 'password')
    await pwdInputs[0].setValue('short')
    await pwdInputs[1].setValue('short')
    await nextTick()
    await wrapper.find('form').trigger('submit')
    await nextTick()
    expect(wrapper.text()).toContain('Minimum 8 characters')

    // mismatch
    await pwdInputs[0].setValue('longenough')
    await pwdInputs[1].setValue('different')
    await nextTick()
    await wrapper.find('form').trigger('submit')
    await nextTick()
    expect(wrapper.text()).toContain('Passwords do not match')
  })

  it('resetPassword success shows toast and navigates', async () => {
    const wrapper = mountView()
    ;(wrapper.vm as any).step = 2
    await nextTick()
    const pwdInputs = wrapper.findAll('input').filter(i => i.attributes('type') === 'password')
    await pwdInputs[0].setValue('longenough')
    await pwdInputs[1].setValue('longenough')
    await nextTick()

    await wrapper.find('form').trigger('submit')
    await flushPromises()
    await nextTick()

    expect(resetPassword).toHaveBeenCalledWith({ resetToken: 'rt-123', newPassword: 'longenough', confirmPassword: 'longenough' })
    expect(mockShowSuccess).toHaveBeenCalledWith('Password reset successfully!')
    expect(mockPush).toHaveBeenCalledWith('/login')
  })

  it('resetPassword failure shows generic fallback', async () => {
    resetPassword = vi.fn().mockRejectedValue(new Error('fail'))
    const wrapper = mountView()
    ;(wrapper.vm as any).step = 2
    await nextTick()
    const pwdInputs = wrapper.findAll('input').filter(i => i.attributes('type') === 'password')
    await pwdInputs[0].setValue('longenough')
    await pwdInputs[1].setValue('longenough')
    await nextTick()

    await wrapper.find('form').trigger('submit')
    await flushPromises()
    await nextTick()

    expect(wrapper.text()).toContain('Reset failed.')
  })
})