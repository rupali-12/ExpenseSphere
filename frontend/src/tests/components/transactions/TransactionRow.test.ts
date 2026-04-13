import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import TransactionRow from '@/components/transactions/TransactionRow.vue'
import { formatAmount } from '@/utils/formatCurrency'
import { formatDate } from '@/utils/formatDate'

describe('TransactionRow', () => {
  it('renders transaction details with formatted amounts and date', () => {
    const tx = {
      type: 'deposit',
      amount: 1234,
      afterBalance: 5000,
      date: '2024-02-01T00:00:00.000Z',
      note: 'Salary',
    }

    const wrapper = mount(TransactionRow, {
      props: { transaction: tx as any },
    })

    // Note and date
    expect(wrapper.text()).toContain('Salary')
    expect(wrapper.text()).toContain(formatDate(tx.date))

    // Amount and balance formatting
    expect(wrapper.text()).toContain('+' + '₹' + formatAmount(tx.amount))
    expect(wrapper.text()).toContain('Bal: ₹' + formatAmount(tx.afterBalance))
  })
})
