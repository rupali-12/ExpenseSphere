import { mount, flushPromises } from '@vue/test-utils'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { nextTick } from 'vue'
import DashboardView from '@/views/dashboard/DashboardView.vue'

// ─── Router stub ─────────────────────────────────────────────────────────────
vi.mock('vue-router', async () => {
  const actual = await vi.importActual<any>('vue-router')
  return {
    ...actual,
    RouterLink: { template: '<a><slot /></a>' },
    useRoute:   () => ({ path: '/app/dashboard' }),
  }
})

// ─── Utility mock ─────────────────────────────────────────────────────────────
vi.mock('@/utils/formatCurrency', () => ({
  formatAmount: (n: number) => n.toLocaleString('en-IN'),
}))

// ─── Mutable user — tests write directly to its properties ───────────────────
const mockUser = {
  _id:            'u1',
  name:           'Alice',
  email:          'alice@example.com',
  currentBalance: 1234,
}

vi.mock('@/stores/authStore', () => ({
  useAuthStore: () => ({ user: mockUser }),
}))

// ─── Transaction store ────────────────────────────────────────────────────────
// `mockAdd` is declared with `let` so each test can reassign it to a fresh spy.
// The store delegates through arrow functions so reassignment is picked up.
let mockAdd = vi.fn().mockResolvedValue({})
const mockFetch = vi.fn().mockResolvedValue(undefined)
const mockShowSuccess = vi.fn()

const txStoreState = {
  totalDeposits:    1000,
  totalWithdrawals: 200,
  netChange:        800,
  total:            5,
  isLoading:        false,
  transactions:     [] as any[],
  fetchTransactions: (...args: any[]) => mockFetch(...args),
  addTransaction:    (...args: any[]) => mockAdd(...args),
}

vi.mock('@/stores/transactionStore', () => ({
  useTransactionStore: () => txStoreState,
}))

vi.mock('@/stores/sessionStore', () => ({
  useSessionStore: () => ({ showSuccess: mockShowSuccess }),
}))

// ─── Mount helper ─────────────────────────────────────────────────────────────
const mountDashboard = () =>
  mount(DashboardView, {
    global: {
      stubs: {
        // BaseButton forwards click so handleAdd fires
        BaseButton: {
          template: '<button v-bind="$attrs" @click="$emit(\'click\')"><slot/></button>',
        },
        BaseSpinner:    { template: '<div class="spinner" />' },
        TransactionRow: { template: '<div class="tx-row" />' },
        Transition:     { template: '<div><slot/></div>' },
      },
    },
  })

const findAddBtn = (wrapper: ReturnType<typeof mount>) =>
  wrapper.findAll('button').find(b => /Add (Deposit|Withdrawal)/.test(b.text()))!

describe('DashboardView', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockAdd = vi.fn().mockResolvedValue({})
    txStoreState.isLoading    = false
    txStoreState.transactions = []
    mockUser.currentBalance   = 1234
  })

  // ─── Balance cards ─────────────────────────────────────────────────────────
  describe('balance cards', () => {
    it('renders current balance', async () => {
      const wrapper = mountDashboard()
      await nextTick()
      expect(wrapper.text()).toContain('1,234')
    })

    it('renders total deposits', async () => {
      const wrapper = mountDashboard()
      await nextTick()
      expect(wrapper.text()).toContain('1,000')
    })

    it('renders total withdrawals', async () => {
      const wrapper = mountDashboard()
      await nextTick()
      expect(wrapper.text()).toContain('200')
    })

    it('renders net change', async () => {
      const wrapper = mountDashboard()
      await nextTick()
      expect(wrapper.text()).toContain('Net:')
      expect(wrapper.text()).toContain('800')
    })

    it('renders total transaction count', async () => {
      const wrapper = mountDashboard()
      await nextTick()
      expect(wrapper.text()).toContain('5 transactions total')
    })

    it('renders user name in balance card', async () => {
      const wrapper = mountDashboard()
      await nextTick()
      expect(wrapper.text()).toContain('Alice')
    })
  })

  // ─── onMounted ─────────────────────────────────────────────────────────────
  describe('onMounted', () => {
    it('calls fetchTransactions with page:1 limit:6 on mount', async () => {
      mountDashboard()
      await nextTick()
      expect(mockFetch).toHaveBeenCalledWith({ page: 1, limit: 6 })
    })
  })

  // ─── Loading state ─────────────────────────────────────────────────────────
  describe('loading state', () => {
    it('shows spinner when isLoading is true', async () => {
      txStoreState.isLoading = true
      const wrapper = mountDashboard()
      await nextTick()
      expect(wrapper.find('.spinner').exists()).toBe(true)
    })

    it('hides spinner when isLoading is false', async () => {
      const wrapper = mountDashboard()
      await nextTick()
      expect(wrapper.find('.spinner').exists()).toBe(false)
    })
  })

  // ─── Empty state ───────────────────────────────────────────────────────────
  describe('empty transactions state', () => {
    it('shows "No transactions yet"', async () => {
      const wrapper = mountDashboard()
      await nextTick()
      expect(wrapper.text()).toContain('No transactions yet')
    })

    it('shows helper text', async () => {
      const wrapper = mountDashboard()
      await nextTick()
      expect(wrapper.text()).toContain('Add your first transaction above')
    })
  })

  // ─── Transactions list ─────────────────────────────────────────────────────
  describe('transactions list', () => {
    it('renders at most 6 TransactionRow components', async () => {
      txStoreState.transactions = Array.from({ length: 8 }, (_, i) => ({
        _id: `tx${i}`, type: 'deposit', amount: 100,
        beforeBalance: 0, afterBalance: 100, date: '', createdAt: '', updatedAt: '', user: 'u1',
      }))
      const wrapper = mountDashboard()
      await nextTick()
      expect(wrapper.findAll('.tx-row')).toHaveLength(6)
    })

    it('hides empty state when transactions exist', async () => {
      txStoreState.transactions = [{ _id: 'tx1', type: 'deposit', amount: 100 }]
      const wrapper = mountDashboard()
      await nextTick()
      expect(wrapper.text()).not.toContain('No transactions yet')
    })
  })

  // ─── Type toggle ───────────────────────────────────────────────────────────
  describe('type toggle', () => {
    it('defaults to deposit', async () => {
      const wrapper = mountDashboard()
      await nextTick()
      expect(wrapper.text()).toContain('Add Deposit')
    })

    it('switches to withdrawal on click', async () => {
      const wrapper = mountDashboard()
      await nextTick()
      await wrapper.findAll('button').find(b => b.text().includes('Withdraw'))!.trigger('click')
      await nextTick()
      expect(wrapper.text()).toContain('Add Withdrawal')
    })

    it('shows available balance hint for withdrawal', async () => {
      const wrapper = mountDashboard()
      await nextTick()
      await wrapper.findAll('button').find(b => b.text().includes('Withdraw'))!.trigger('click')
      await nextTick()
      expect(wrapper.text()).toContain('Available:')
      expect(wrapper.text()).toContain('1,234')
    })

    it('hides available balance hint for deposit', async () => {
      const wrapper = mountDashboard()
      await nextTick()
      expect(wrapper.text()).not.toContain('Available:')
    })

    it('clears amountError on toggle', async () => {
      const wrapper = mountDashboard()
      await nextTick()

      // Produce an amountError
      await findAddBtn(wrapper).trigger('click')
      await nextTick()
      expect(wrapper.text()).toContain('Enter a valid amount')

      await wrapper.findAll('button').find(b => b.text().includes('Withdraw'))!.trigger('click')
      await nextTick()
      expect(wrapper.text()).not.toContain('Enter a valid amount')
    })

    it('clears formError on toggle', async () => {
      // Make the first call to addTransaction reject
      mockAdd = vi.fn().mockRejectedValueOnce({ response: { data: { message: 'Server error' } } })

      const wrapper = mountDashboard()
      await nextTick()

      await wrapper.find('input[type="number"]').setValue('100')
      await findAddBtn(wrapper).trigger('click')
      await flushPromises()
      await nextTick()
      expect(wrapper.text()).toContain('Server error')

      await wrapper.findAll('button').find(b => b.text().includes('Withdraw'))!.trigger('click')
      await nextTick()
      expect(wrapper.text()).not.toContain('Server error')
    })
  })

  // ─── Amount input ──────────────────────────────────────────────────────────
  describe('amount input interactions', () => {
    it('clears amountError on input event', async () => {
      const wrapper = mountDashboard()
      await nextTick()

      await findAddBtn(wrapper).trigger('click')
      await nextTick()
      expect(wrapper.text()).toContain('Enter a valid amount')

      await wrapper.find('input[type="number"]').trigger('input')
      await nextTick()
      expect(wrapper.text()).not.toContain('Enter a valid amount')
    })

    it('clears formError on input event', async () => {
      mockAdd = vi.fn().mockRejectedValueOnce({ response: { data: { message: 'Backend error' } } })

      const wrapper = mountDashboard()
      await nextTick()

      await wrapper.find('input[type="number"]').setValue('100')
      await findAddBtn(wrapper).trigger('click')
      await flushPromises()
      await nextTick()
      expect(wrapper.text()).toContain('Backend error')

      await wrapper.find('input[type="number"]').trigger('input')
      await nextTick()
      expect(wrapper.text()).not.toContain('Backend error')
    })

    it('shows error border class when amountError is set', async () => {
      const wrapper = mountDashboard()
      await nextTick()

      await findAddBtn(wrapper).trigger('click')
      await nextTick()

      expect(wrapper.find('input[type="number"]').classes()).toContain('border-[#DC2626]')
    })

    it('shows normal border class when no error', async () => {
      const wrapper = mountDashboard()
      await nextTick()
      expect(wrapper.find('input[type="number"]').classes()).toContain('border-[#E2E8F0]')
    })

    it('shows error border class when formError is set', async () => {
      mockUser.currentBalance = 50
      const wrapper = mountDashboard()
      await nextTick()

      await wrapper.findAll('button').find(b => b.text().includes('Withdraw'))!.trigger('click')
      await nextTick()
      await wrapper.find('input[type="number"]').setValue('200')
      await findAddBtn(wrapper).trigger('click')
      await nextTick()

      expect(wrapper.find('input[type="number"]').classes()).toContain('border-[#DC2626]')
    })
  })

  // ─── Note input ────────────────────────────────────────────────────────────
  describe('note input interactions', () => {
    it('clears formError on note input event', async () => {
      mockAdd = vi.fn().mockRejectedValueOnce({ response: { data: { message: 'Some error' } } })

      const wrapper = mountDashboard()
      await nextTick()

      await wrapper.find('input[type="number"]').setValue('100')
      await findAddBtn(wrapper).trigger('click')
      await flushPromises()
      await nextTick()
      expect(wrapper.text()).toContain('Some error')

      await wrapper.find('input[type="text"]').trigger('input')
      await nextTick()
      expect(wrapper.text()).not.toContain('Some error')
    })
  })

  // ─── handleAdd — validation ─────────────────────────────────────────────────
  describe('handleAdd — validation', () => {
    it('shows amountError for empty amount and does not call API', async () => {
      const wrapper = mountDashboard()
      await nextTick()

      await findAddBtn(wrapper).trigger('click')
      await nextTick()

      expect(wrapper.text()).toContain('Enter a valid amount')
      expect(mockAdd).not.toHaveBeenCalled()
    })

    it('shows amountError for amount = 0', async () => {
      const wrapper = mountDashboard()
      await nextTick()

      await wrapper.find('input[type="number"]').setValue('0')
      await findAddBtn(wrapper).trigger('click')
      await nextTick()

      expect(wrapper.text()).toContain('Enter a valid amount')
      expect(mockAdd).not.toHaveBeenCalled()
    })

    it('shows formError for withdrawal exceeding balance', async () => {
      mockUser.currentBalance = 100
      const wrapper = mountDashboard()
      await nextTick()

      await wrapper.findAll('button').find(b => b.text().includes('Withdraw'))!.trigger('click')
      await nextTick()
      await wrapper.find('input[type="number"]').setValue('500')
      await findAddBtn(wrapper).trigger('click')
      await nextTick()

      expect(wrapper.text()).toContain('Insufficient balance')
      expect(mockAdd).not.toHaveBeenCalled()
    })

    it('does not block deposit even when amount > balance', async () => {
      mockUser.currentBalance = 0
      const wrapper = mountDashboard()
      await nextTick()

      await wrapper.find('input[type="number"]').setValue('9999')
      await findAddBtn(wrapper).trigger('click')
      await flushPromises()

      expect(wrapper.text()).not.toContain('Insufficient balance')
      expect(mockAdd).toHaveBeenCalled()
    })
  })

  // ─── handleAdd — success ────────────────────────────────────────────────────
  describe('handleAdd — success', () => {
    it('calls addTransaction with correct deposit payload', async () => {
      const wrapper = mountDashboard()
      await nextTick()

      await wrapper.find('input[type="number"]').setValue('250')
      await wrapper.find('input[type="text"]').setValue('Salary')
      await findAddBtn(wrapper).trigger('click')
      await flushPromises()

      expect(mockAdd).toHaveBeenCalledWith({ type: 'deposit', amount: 250, note: 'Salary' })
    })

    it('sends undefined note when note field is empty', async () => {
      const wrapper = mountDashboard()
      await nextTick()

      await wrapper.find('input[type="number"]').setValue('100')
      await findAddBtn(wrapper).trigger('click')
      await flushPromises()

      expect(mockAdd).toHaveBeenCalledWith({ type: 'deposit', amount: 100, note: undefined })
    })

    it('calls addTransaction with withdrawal payload', async () => {
      mockUser.currentBalance = 1000
      const wrapper = mountDashboard()
      await nextTick()

      await wrapper.findAll('button').find(b => b.text().includes('Withdraw'))!.trigger('click')
      await nextTick()
      await wrapper.find('input[type="number"]').setValue('300')
      await wrapper.find('input[type="text"]').setValue('Rent')
      await findAddBtn(wrapper).trigger('click')
      await flushPromises()

      expect(mockAdd).toHaveBeenCalledWith({ type: 'withdrawal', amount: 300, note: 'Rent' })
    })

    it('shows deposit success toast', async () => {
      const wrapper = mountDashboard()
      await nextTick()

      await wrapper.find('input[type="number"]').setValue('100')
      await findAddBtn(wrapper).trigger('click')
      await flushPromises()

      expect(mockShowSuccess).toHaveBeenCalledWith('Deposit added successfully!')
    })

    it('shows withdrawal success toast', async () => {
      mockUser.currentBalance = 500
      const wrapper = mountDashboard()
      await nextTick()

      await wrapper.findAll('button').find(b => b.text().includes('Withdraw'))!.trigger('click')
      await nextTick()
      await wrapper.find('input[type="number"]').setValue('100')
      await findAddBtn(wrapper).trigger('click')
      await flushPromises()

      expect(mockShowSuccess).toHaveBeenCalledWith('Withdrawal recorded successfully!')
    })

    it('resets amount and note after success', async () => {
      const wrapper = mountDashboard()
      await nextTick()

      const amountInput = wrapper.find('input[type="number"]')
      const noteInput   = wrapper.find('input[type="text"]')
      await amountInput.setValue('150')
      await noteInput.setValue('Bonus')
      await findAddBtn(wrapper).trigger('click')
      await flushPromises()

      expect((amountInput.element as HTMLInputElement).value).toBe('')
      expect((noteInput.element as HTMLInputElement).value).toBe('')
    })

    it('clears formError after successful submission', async () => {
      // First call rejects, second resolves
      mockAdd = vi.fn()
        .mockRejectedValueOnce({ response: { data: { message: 'Temp error' } } })
        .mockResolvedValueOnce({})

      const wrapper = mountDashboard()
      await nextTick()

      // First attempt — must fail and show error
      await wrapper.find('input[type="number"]').setValue('100')
      await findAddBtn(wrapper).trigger('click')
      await flushPromises()
      await nextTick()
      expect(wrapper.text()).toContain('Temp error')

      // Second attempt — must succeed and clear error
      await wrapper.find('input[type="number"]').setValue('100')
      await findAddBtn(wrapper).trigger('click')
      await flushPromises()
      expect(wrapper.text()).not.toContain('Temp error')
    })
  })

  // ─── handleAdd — error ──────────────────────────────────────────────────────
  describe('handleAdd — error', () => {
    it('shows backend error message', async () => {
      mockAdd = vi.fn().mockRejectedValueOnce({
        response: { data: { message: 'Daily limit exceeded' } },
      })

      const wrapper = mountDashboard()
      await nextTick()

      await wrapper.find('input[type="number"]').setValue('100')
      await findAddBtn(wrapper).trigger('click')
      await flushPromises()
      await nextTick()

      expect(wrapper.text()).toContain('Daily limit exceeded')
    })

    it('shows generic fallback when no response message', async () => {
      mockAdd = vi.fn().mockRejectedValueOnce(new Error('Network Error'))

      const wrapper = mountDashboard()
      await nextTick()

      await wrapper.find('input[type="number"]').setValue('100')
      await findAddBtn(wrapper).trigger('click')
      await flushPromises()
      await nextTick()

      expect(wrapper.text()).toContain('Transaction failed. Try again.')
    })

    it('does not call showSuccess on error', async () => {
      mockAdd = vi.fn().mockRejectedValueOnce(new Error('fail'))

      const wrapper = mountDashboard()
      await nextTick()

      await wrapper.find('input[type="number"]').setValue('100')
      await findAddBtn(wrapper).trigger('click')
      await flushPromises()
      await nextTick()

      expect(mockShowSuccess).not.toHaveBeenCalled()
    })

    it('resets adding flag (finally block) after failure', async () => {
      mockAdd = vi.fn().mockRejectedValueOnce(new Error('fail'))

      const wrapper = mountDashboard()
      await nextTick()

      const btn = findAddBtn(wrapper)
      await wrapper.find('input[type="number"]').setValue('100')
      await btn.trigger('click')
      await flushPromises()

      // `adding` is false again — our BaseButton stub doesn't set disabled from the
      // loading prop, but if adding were still true the component would have it set
      expect(btn.attributes('disabled')).toBeUndefined()
    })
  })

  // ─── formError block visibility ─────────────────────────────────────────────
  describe('formError inline error block', () => {
    it('shows error text when formError is set', async () => {
      mockAdd = vi.fn().mockRejectedValueOnce({
        response: { data: { message: 'Visible error!' } },
      })

      const wrapper = mountDashboard()
      await nextTick()

      await wrapper.find('input[type="number"]').setValue('100')
      await findAddBtn(wrapper).trigger('click')
      await flushPromises()
      await nextTick()

      expect(wrapper.text()).toContain('Visible error!')
    })

    it('shows no error text on clean render', async () => {
      const wrapper = mountDashboard()
      await nextTick()

      expect(wrapper.text()).not.toContain('Transaction failed')
      expect(wrapper.text()).not.toContain('Insufficient balance')
      expect(wrapper.text()).not.toContain('Enter a valid amount')
    })
  })

  // ─── View all link ──────────────────────────────────────────────────────────
  describe('view all link', () => {
    it('renders "View all" link', async () => {
      const wrapper = mountDashboard()
      await nextTick()
      expect(wrapper.text()).toContain('View all')
    })
  })
})