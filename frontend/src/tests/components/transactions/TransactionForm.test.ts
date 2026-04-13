import { mount } from '@vue/test-utils'
import { describe, it, expect, vi } from 'vitest'

const mockAdd = vi.fn().mockResolvedValue({})
const mockShowSuccess = vi.fn()

vi.mock('@/stores/authStore', () => ({
  useAuthStore: () => ({ user: { currentBalance: 100, name: 'Alice', email: 'a@a.com' } }),
}))

vi.mock('@/stores/transactionStore', () => ({
  useTransactionStore: () => ({ addTransaction: mockAdd }),
}))

vi.mock('@/stores/sessionStore', () => ({
  useSessionStore: () => ({ showSuccess: mockShowSuccess }),
}))

import TransactionForm from '@/components/transactions/TransactionForm.vue'

describe('TransactionForm', () => {
  it('shows insufficient balance error for withdrawal', async () => {
    const wrapper = mount(TransactionForm, {
      global: {
        stubs: {
          BaseButton: { template: '<button @click="$emit(\'click\')"><slot/></button>' },
        },
      },
    })

    // Click Withdraw toggle
    const toggle = wrapper.findAll('button').find(b => b.text().includes('Withdraw'))
    await toggle!.trigger('click')

    // Enter amount greater than currentBalance (100)
    const amount = wrapper.find('input[type="number"]')
    await amount.setValue('200')

    // Click submit (Add Withdrawal)
    const submit = wrapper.findAll('button').find(b => b.text().includes('Add Withdrawal'))!
    await submit.trigger('click')

    expect(wrapper.text()).toContain('Insufficient balance')
  })

  it('submits deposit successfully and emits success + shows toast', async () => {
    mockAdd.mockResolvedValueOnce({})

    const wrapper = mount(TransactionForm, {
      global: {
        stubs: {
          BaseButton: { template: '<button @click="$emit(\'click\')"><slot/></button>' },
        },
      },
    })

    // Ensure Deposit selected (default)
    const amount = wrapper.find('input[type="number"]')
    await amount.setValue('50')

    const submit = wrapper.findAll('button').find(b => b.text().includes('Add Deposit'))!
    await submit.trigger('click')

    await wrapper.vm.$nextTick()

    expect(mockAdd).toHaveBeenCalled()
    expect(mockShowSuccess).toHaveBeenCalled()
    expect(wrapper.emitted('success')).toBeTruthy()
  })
})
