import { mount, flushPromises } from '@vue/test-utils'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { nextTick } from 'vue'
import OtpVerifyView from '@/views/auth/OtpVerifyView.vue'

// Mocks
const mockPush = vi.fn()
vi.mock('vue-router', async () => {
  const actual = await vi.importActual<any>('vue-router')
  return {
    ...actual,
    useRouter: () => ({ push: mockPush }),
    useRoute:  () => ({ query: { email: 'test@example.com' } }),
    RouterLink: { template: '<a><slot/></a>' },
  }
})

let verifyOtp = vi.fn().mockResolvedValue({})
let resendOtp = vi.fn().mockResolvedValue({})
const mockShowSuccess = vi.fn()

vi.mock('@/stores/authStore', () => ({
  useAuthStore: () => ({ verifyOtp: (...args: any[]) => verifyOtp(...args), resendOtp: (...args: any[]) => resendOtp(...args) }),
}))

vi.mock('@/stores/sessionStore', () => ({
  useSessionStore: () => ({ showSuccess: mockShowSuccess }),
}))

const mountView = () =>
  mount(OtpVerifyView, {
    attachTo: document.body,
    global: {
      stubs: {
        BaseButton: { template: '<button v-bind="$attrs" @click="$emit(\'click\')"><slot/></button>' },
        Transition: { template: '<div><slot/></div>' },
      },
    },
  })

describe('OtpVerifyView', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.clearAllMocks()
    verifyOtp = vi.fn().mockResolvedValue({})
    resendOtp = vi.fn().mockResolvedValue({})
    mockPush.mockClear()
  })
  afterEach(() => {
    vi.useRealTimers()
    document.body.innerHTML = ''
  })

  it('renders email from route', async () => {
    const wrapper = mountView()
    await nextTick()
    expect(wrapper.text()).toContain('test@example.com')
  })

  it('starts countdown and updates DOM', async () => {
    const wrapper = mountView()
    await nextTick()
    expect(wrapper.text()).toContain('Resend in 30s')
    vi.advanceTimersByTime(2000)
    await nextTick()
    expect(wrapper.text()).toContain('Resend in 28s')
  })

  it('input moves focus to next box on input and backspace moves focus back', async () => {
    const wrapper = mountView()
    await nextTick()
    const inputs = wrapper.findAll('input[type="text"]')
    await inputs[0].setValue('1')
    await nextTick()
    expect(document.activeElement).toBe(inputs[1].element)

    // ensure backspace moves focus back when empty
    await inputs[1].setValue('')
    await inputs[1].trigger('keydown', { key: 'Backspace' })
    await nextTick()
    expect(document.activeElement).toBe(inputs[0].element)
  })

  it('pastes numeric OTP into inputs and focuses last', async () => {
    const wrapper = mountView()
    await nextTick()
    const inputs = wrapper.findAll('input[type="text"]')
    await inputs[0].trigger('paste', { clipboardData: { getData: () => '123456' } })
    await nextTick()
    const values = inputs.map(i => (i.element as HTMLInputElement).value)
    expect(values.join('')).toBe('123456')
    expect(document.activeElement).toBe(inputs[5].element)
  })

  it('verifyOtp success navigates and shows toast', async () => {
    const wrapper = mountView()
    await nextTick()
    const inputs = wrapper.findAll('input[type="text"]')
    for (let i = 0; i < 6; i++) await inputs[i].setValue(String(i + 1))
    await nextTick()

    const btn = wrapper.find('button')
    await btn.trigger('click')
    await flushPromises()

    expect(verifyOtp).toHaveBeenCalledWith({ email: 'test@example.com', otp: '123456' })
    expect(mockShowSuccess).toHaveBeenCalledWith('Registration successful! Welcome!')
    expect(mockPush).toHaveBeenCalledWith('/app/dashboard')
  })

  it('verifyOtp failure shows error, clears inputs and focuses first', async () => {
    verifyOtp = vi.fn().mockRejectedValue({ response: { data: { message: 'Invalid code' } } })
    const wrapper = mountView()
    await nextTick()
    const inputs = wrapper.findAll('input[type="text"]')
    for (let i = 0; i < 6; i++) await inputs[i].setValue('9')
    await nextTick()

    const btn = wrapper.find('button')
    await btn.trigger('click')
    await flushPromises()
    await nextTick()

    expect(wrapper.text()).toContain('Invalid code')
    const values = inputs.map(i => (i.element as HTMLInputElement).value)
    expect(values.every(v => v === '')).toBe(true)
    expect(document.activeElement).toBe(inputs[0].element)
  })

  it('resendOtp success shows toast and restarts timer', async () => {
    const wrapper = mountView()
    await nextTick()
    // set countdown to 0 to show resend button
    ;(wrapper.vm as any).countdown = 0
    await nextTick()
    const resendBtn = wrapper.findAll('button').find(b => b.text().includes('Resend OTP'))!
    await resendBtn.trigger('click')
    await flushPromises()
    await nextTick()

    expect(resendOtp).toHaveBeenCalledWith('test@example.com')
    expect(mockShowSuccess).toHaveBeenCalledWith('New OTP sent!')
    expect((wrapper.vm as any).countdown).toBe(30)
  })

  it('resendOtp failure shows inline error', async () => {
    resendOtp = vi.fn().mockRejectedValue({ response: { data: { message: 'Too many requests' } } })
    const wrapper = mountView()
    await nextTick()
    ;(wrapper.vm as any).countdown = 0
    await nextTick()
    const resendBtn = wrapper.findAll('button').find(b => b.text().includes('Resend OTP'))!
    await resendBtn.trigger('click')
    await flushPromises()
    await nextTick()

    expect(wrapper.text()).toContain('Too many requests')
  })
})
