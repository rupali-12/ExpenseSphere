import { mount, flushPromises } from '@vue/test-utils'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { nextTick } from 'vue'
import ProfileView from '@/views/profile/ProfileView.vue'

// Mock formatAmount for predictable output
vi.mock('@/utils/formatCurrency', () => ({ formatAmount: (n: number) => n.toLocaleString('en-IN') }))

// Mock stores
const mockUser = { name: 'Bob', email: 'bob@ex.com', currentBalance: 1500 }
const authStoreStub: any = {
  user: mockUser,
  updateUser: vi.fn().mockResolvedValue({}),
  updateBalance: vi.fn().mockResolvedValue({}),
  resetToken: 'token-1',
}
const mockShowSuccess = vi.fn()

vi.mock('@/stores/authStore', () => ({ useAuthStore: () => authStoreStub }))
vi.mock('@/stores/sessionStore', () => ({ useSessionStore: () => ({ showSuccess: mockShowSuccess }) }))

// Simple BaseInput stub exposing an input and error paragraph
const BaseInputStub = {
  props: ['modelValue', 'label', 'type', 'error', 'placeholder', 'required'],
  emits: ['update:modelValue'],
  template: `
    <div>
      <label>{{ label }}</label>
      <input :type="type || 'text'" :placeholder="placeholder" :value="modelValue" @input="$emit('update:modelValue', $event.target.value)" />
      <p v-if="error" class="error">{{ error }}</p>
      <slot name="icon" />
    </div>
  `,
}

const BaseButtonStub = { template: '<button v-bind="$attrs" @click="$emit(\'click\')"><slot/></button>' }

const mountView = () =>
  mount(ProfileView, {
    attachTo: document.body,
    global: { stubs: { Transition: { template: '<div><slot/></div>' }, BaseInput: BaseInputStub, BaseButton: BaseButtonStub } },
  })

describe('ProfileView', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    authStoreStub.user = { ...mockUser }
    authStoreStub.updateUser = vi.fn().mockResolvedValue({})
    authStoreStub.updateBalance = vi.fn().mockResolvedValue({})
    mockShowSuccess.mockClear()
  })
  afterEach(() => { document.body.innerHTML = '' })

  it('renders user initial, name, email and formatted balance', async () => {
    const wrapper = mountView()
    await nextTick()
    expect(wrapper.text()).toContain('B')
    expect(wrapper.text()).toContain('Bob')
    expect(wrapper.text()).toContain('bob@ex.com')
    expect(wrapper.text()).toContain('Balance: ₹1,500')
  })

  it('pre-fills details form on mount', async () => {
    const wrapper = mountView()
    await nextTick()
    const nameInput = wrapper.find('input[placeholder="Your name"]')
    const emailInput = wrapper.find('input[placeholder="you@example.com"]')
    expect((nameInput.element as HTMLInputElement).value).toBe('Bob')
    expect((emailInput.element as HTMLInputElement).value).toBe('bob@ex.com')
  })

  it('validates details form and shows errors without calling API', async () => {
    const wrapper = mountView()
    await nextTick()
    const nameInput = wrapper.find('input[placeholder="Your name"]')
    const emailInput = wrapper.find('input[placeholder="you@example.com"]')
    // First, empty name should trigger name validation and return early
    await nameInput.setValue('   ')
    await emailInput.setValue('not-an-email')
    await nextTick()

    const detailsForm = wrapper.findAll('form')[0]
    await detailsForm.trigger('submit')
    await nextTick()

    expect(wrapper.text()).toContain('Name is required')
    expect(authStoreStub.updateUser).not.toHaveBeenCalled()

    // Now set a valid name but invalid email to test email validation path
    await nameInput.setValue('Valid Name')
    await emailInput.setValue('not-an-email')
    await nextTick()
    await detailsForm.trigger('submit')
    await nextTick()

    expect(wrapper.text()).toContain('Enter valid email')
    expect(authStoreStub.updateUser).not.toHaveBeenCalled()
  })

  it('updates details successfully and shows success message', async () => {
    const wrapper = mountView()
    await nextTick()
    const nameInput = wrapper.find('input[placeholder="Your name"]')
    const emailInput = wrapper.find('input[placeholder="you@example.com"]')
    await nameInput.setValue('Robert')
    await emailInput.setValue('robert@ex.com')
    await nextTick()

    const detailsForm = wrapper.findAll('form')[0]
    await detailsForm.trigger('submit')
    await flushPromises()
    await nextTick()

    expect(authStoreStub.updateUser).toHaveBeenCalledWith({ name: 'Robert', email: 'robert@ex.com' })
    expect(wrapper.text()).toContain('Details updated successfully!')
    expect(mockShowSuccess).toHaveBeenCalledWith('Profile updated!')
  })

  it('shows details update error when API fails', async () => {
    authStoreStub.updateUser = vi.fn().mockRejectedValue({ response: { data: { message: 'Server error' } } })
    const wrapper = mountView()
    await nextTick()
    const nameInput = wrapper.find('input[placeholder="Your name"]')
    await nameInput.setValue('Robert')
    await nextTick()
    const detailsForm = wrapper.findAll('form')[0]
    await detailsForm.trigger('submit')
    await flushPromises()
    await nextTick()

    expect(wrapper.text()).toContain('Server error')
  })

  it('validates password form and prevents API call', async () => {
    const wrapper = mountView()
    await nextTick()
    // move to password section inputs
    const oldPwd = wrapper.find('input[placeholder="Enter current password"]')
    const newPwd = wrapper.find('input[placeholder="Min. 6 characters"]')
    // empty old password
    await oldPwd.setValue('')
    await newPwd.setValue('abcdef')
    await nextTick()
    const updateBtn = wrapper.findAll('button').find(b => b.text().includes('Update Password'))!
    await updateBtn.trigger('click')
    await nextTick()
    expect(wrapper.text()).toContain('Current password required')
    expect(authStoreStub.updateUser).not.toHaveBeenCalled()

    // short new password
    await oldPwd.setValue('oldpass')
    await newPwd.setValue('abc')
    await updateBtn.trigger('click')
    await nextTick()
    expect(wrapper.text()).toContain('Minimum 6 characters')
    expect(authStoreStub.updateUser).not.toHaveBeenCalled()
  })

  it('updates password successfully and clears inputs', async () => {
    const wrapper = mountView()
    await nextTick()
    const oldPwd = wrapper.find('input[placeholder="Enter current password"]')
    const newPwd = wrapper.find('input[placeholder="Min. 6 characters"]')
    await oldPwd.setValue('oldpass')
    await newPwd.setValue('newpass')
    await nextTick()

    const updateBtn = wrapper.findAll('button').find(b => b.text().includes('Update Password'))!
    await updateBtn.trigger('click')
    await flushPromises()
    await nextTick()

    expect(authStoreStub.updateUser).toHaveBeenCalledWith({ oldPassword: 'oldpass', newPassword: 'newpass' })
    expect(wrapper.text()).toContain('Password updated successfully!')
    expect(mockShowSuccess).toHaveBeenCalledWith('Password changed!')
    expect((oldPwd.element as HTMLInputElement).value).toBe('')
    expect((newPwd.element as HTMLInputElement).value).toBe('')
  })

  it('shows password API error message on failure', async () => {
    authStoreStub.updateUser = vi.fn().mockRejectedValue({ response: { data: { message: 'Pwd fail' } } })
    const wrapper = mountView()
    await nextTick()
    const oldPwd = wrapper.find('input[placeholder="Enter current password"]')
    const newPwd = wrapper.find('input[placeholder="Min. 6 characters"]')
    await oldPwd.setValue('old')
    await newPwd.setValue('newpass')
    await nextTick()
    const updateBtn = wrapper.findAll('button').find(b => b.text().includes('Update Password'))!
    await updateBtn.trigger('click')
    await flushPromises()
    await nextTick()
    expect(wrapper.text()).toContain('Pwd fail')
  })

  it('validates balance input and prevents update if invalid', async () => {
    const wrapper = mountView()
    await nextTick()
    const amountInput = wrapper.find('input[type="number"]')
    await amountInput.setValue('')
    const updateBtn = wrapper.findAll('button').find(b => b.text().includes('Update Balance'))!
    await updateBtn.trigger('click')
    await nextTick()
    expect(authStoreStub.updateBalance).not.toHaveBeenCalled()

    await amountInput.setValue('-10')
    await updateBtn.trigger('click')
    await nextTick()
    expect(authStoreStub.updateBalance).not.toHaveBeenCalled()
  })

  it('updates balance successfully and clears input', async () => {
    const wrapper = mountView()
    await nextTick()
    const amountInput = wrapper.find('input[type="number"]')
    await amountInput.setValue('2500')
    const updateBtn = wrapper.findAll('button').find(b => b.text().includes('Update Balance'))!
    await updateBtn.trigger('click')
    await flushPromises()
    await nextTick()
    expect(authStoreStub.updateBalance).toHaveBeenCalledWith({ currentBalance: 2500 })
    expect(wrapper.text()).toContain('Balance updated to ₹2,500')
    expect(mockShowSuccess).toHaveBeenCalledWith('Balance updated!')
    expect((amountInput.element as HTMLInputElement).value).toBe('')
  })

  it('shows balance API error message on failure', async () => {
    authStoreStub.updateBalance = vi.fn().mockRejectedValue({ response: { data: { message: 'Bal fail' } } })
    const wrapper = mountView()
    await nextTick()
    const amountInput = wrapper.find('input[type="number"]')
    await amountInput.setValue('500')
    const updateBtn = wrapper.findAll('button').find(b => b.text().includes('Update Balance'))!
    await updateBtn.trigger('click')
    await flushPromises()
    await nextTick()
    expect(wrapper.text()).toContain('Bal fail')
  })
})
