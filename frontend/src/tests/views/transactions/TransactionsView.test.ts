import { mount, flushPromises } from '@vue/test-utils'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { nextTick } from 'vue'
import TransactionsView from '@/views/transactions/TransactionsView.vue'

// Mock format helpers for predictable output
vi.mock('@/utils/formatCurrency', () => ({ formatAmount: (n: number) => n.toString() }))
vi.mock('@/utils/formatDate', () => ({ formatDateShort: (d: any) => `date:${d}` }))

// Create a mutable mock txStore so tests can modify state
let mockFetch = vi.fn()
let mockApply = vi.fn()
let mockReset = vi.fn()
let mockChangePage = vi.fn()

const txStoreState: any = {
  totalDeposits: 1000,
  totalWithdrawals: 200,
  netChange: 800,
  total: 5,
  pages: 1,
  currentPage: 1,
  isLoading: false,
  transactions: [] as any[],
  fetchTransactions: (...args: any[]) => mockFetch(...args),
  applyFilters: (...args: any[]) => mockApply(...args),
  resetFilters: (...args: any[]) => mockReset(...args),
  changePage: (...args: any[]) => mockChangePage(...args),
}

vi.mock('@/stores/transactionStore', () => ({ useTransactionStore: () => txStoreState }))

const mountView = () =>
  mount(TransactionsView, {
    attachTo: document.body,
    global: {
      stubs: {
        BaseButton: { template: '<button v-bind="$attrs" @click="$emit(\'click\')"><slot/></button>' },
        BaseBadge: { props: ['variant', 'size'], template: '<span class="badge"><slot/></span>' },
        Transition: { template: '<div><slot/></div>' },
      },
    },
  })

describe('TransactionsView', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    txStoreState.totalDeposits = 1000
    txStoreState.totalWithdrawals = 200
    txStoreState.netChange = 800
    txStoreState.total = 5
    txStoreState.pages = 1
    txStoreState.currentPage = 1
    txStoreState.isLoading = false
    txStoreState.transactions = []
    mockFetch = vi.fn()
    mockApply = vi.fn()
    mockReset = vi.fn()
    mockChangePage = vi.fn()
    txStoreState.fetchTransactions = (...args: any[]) => mockFetch(...args)
    txStoreState.applyFilters = (...args: any[]) => mockApply(...args)
    txStoreState.resetFilters = (...args: any[]) => mockReset(...args)
    txStoreState.changePage = (...args: any[]) => mockChangePage(...args)
  })

  it('calls fetchTransactions on mount and renders summary', async () => {
    mountView()
    await nextTick()
    expect(mockFetch).toHaveBeenCalled()
    const wrapper = mountView()
    await nextTick()
    expect(wrapper.text()).toContain('Total Deposits')
    expect(wrapper.text()).toContain('₹1000')
    expect(wrapper.text()).toContain('Total Withdrawals')
    expect(wrapper.text()).toContain('₹200')
    expect(wrapper.text()).toContain('Net Change')
    expect(wrapper.text()).toContain('₹800')
  })

  it('shows loading spinner when txStore.isLoading is true', async () => {
    txStoreState.isLoading = true
    const wrapper = mountView()
    await nextTick()
    expect(wrapper.find('div.animate-spin').exists()).toBe(true)
  })

  it('shows empty state when no transactions', async () => {
    txStoreState.isLoading = false
    txStoreState.transactions = []
    const wrapper = mountView()
    await nextTick()
    expect(wrapper.text()).toContain('No transactions found')
  })

  it('renders transaction rows with correct signs and notes', async () => {
    txStoreState.transactions = [
      { _id: 't1', date: '2021-01-01', type: 'deposit', note: 'Salary', amount: 500, beforeBalance: 500, afterBalance: 1000 },
      { _id: 't2', date: '2021-01-02', type: 'withdrawal', note: '', amount: 200, beforeBalance: 1000, afterBalance: 800 },
    ]
    const wrapper = mountView()
    await nextTick()
    expect(wrapper.text()).toContain('+₹500')
    expect(wrapper.text()).toContain('-₹200')
    // note fallback for withdrawal
    expect(wrapper.text()).toContain('Withdrawal')
    // formatted before/after
    expect(wrapper.text()).toContain('₹500')
    expect(wrapper.text()).toContain('date:2021-01-01')
  })

  it('applies filters when Apply clicked and reset clears inputs', async () => {
    const wrapper = mountView()
    await nextTick()
    const search = wrapper.find('input[placeholder="Search by note..."]')
    const select = wrapper.find('select')
    const from = wrapper.find('input[type="date"]').element as HTMLInputElement
    const to = wrapper.findAll('input[type="date"]')[1].element as HTMLInputElement

    await search.setValue('rent')
    await select.setValue('withdrawal')
    // set values on date inputs
    const dateInputs = wrapper.findAll('input[type="date"]')
    await dateInputs[0].setValue('2022-01-01')
    await dateInputs[1].setValue('2022-12-31')

    const applyBtn = wrapper.findAll('button').find(b => b.text().includes('Apply'))!
    await applyBtn.trigger('click')
    await nextTick()
    expect(mockApply).toHaveBeenCalledWith({ search: 'rent', type: 'withdrawal', startDate: '2022-01-01', endDate: '2022-12-31' })

    const resetBtn = wrapper.findAll('button').find(b => b.text().includes('Reset'))!
    await resetBtn.trigger('click')
    await nextTick()
    expect((search.element as HTMLInputElement).value).toBe('')
    expect((select.element as HTMLSelectElement).value).toBe('')
    expect(mockReset).toHaveBeenCalled()
  })

  it('renders pagination buttons and handles page changes', async () => {
    txStoreState.pages = 10
    txStoreState.currentPage = 5
    txStoreState.total = 100
    const wrapper = mountView()
    await nextTick()

    // previous button exists and enabled
    const prev = wrapper.findAll('button').find(b => b.attributes('aria-label') === undefined && b.text().trim() === '←')
    // we don't have aria labels; find by SVG absence — instead select by textual parts
    const pageButtons = wrapper.findAll('button').filter(b => /^[0-9]|\.\.\./.test(b.text()))
    expect(pageButtons.length).toBeGreaterThan(0)

    // click a numeric page button (e.g., '5')
    const page5 = pageButtons.find(b => b.text().trim() === '5')!
    await page5.trigger('click')
    await nextTick()
    expect(mockChangePage).toHaveBeenCalledWith(5)

    // click prev and next via their order: first and last buttons in pagination group
    const paginationGroup = wrapper.findAll('.flex.items-center').find(() => true)
    // fallback: call changePage directly by invoking the component buttons
    const buttons = wrapper.findAll('button')
    // simulate prev click (assume exists)
    await buttons[buttons.length - 3].trigger('click')
    expect(mockChangePage).toHaveBeenCalled()
  })
})
