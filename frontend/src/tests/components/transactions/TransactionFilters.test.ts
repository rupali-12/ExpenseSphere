import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import TransactionFilters from '@/components/transactions/TransactionFilters.vue'
import type { TransactionFilters as TFilters } from '@/types/transaction.types'

const defaultModelValue: TFilters = {
  search: '', type: '', startDate: '', endDate: '', page: 1, limit: 10,
}

const globalConfig = {
  global: {
    components: {
      BaseButton: {
        template: '<button v-bind="$attrs" @click="$emit(\'click\')"><slot /></button>',
      },
    },
  },
}

describe('TransactionFilters', () => {
  it('renders a search input', () => {
    const wrapper = mount(TransactionFilters, { props: { modelValue: defaultModelValue }, ...globalConfig })
    expect(wrapper.find('input[type="text"]').exists()).toBe(true)
  })

  it('renders a type select with options', () => {
    const wrapper = mount(TransactionFilters, { props: { modelValue: defaultModelValue }, ...globalConfig })
    const select = wrapper.find('select')
    expect(select.exists()).toBe(true)
    expect(select.findAll('option')).toHaveLength(3) 
  })

  it('renders startDate and endDate date inputs', () => {
    const wrapper = mount(TransactionFilters, { props: { modelValue: defaultModelValue }, ...globalConfig })
    const dateInputs = wrapper.findAll('input[type="date"]')
    expect(dateInputs).toHaveLength(2)
  })

  it('reflects modelValue.search in search input', () => {
    const wrapper = mount(TransactionFilters, {
      props: { modelValue: { ...defaultModelValue, search: 'salary' } },
      ...globalConfig,
    })
    expect((wrapper.find('input[type="text"]').element as HTMLInputElement).value).toBe('salary')
  })

  it('emits update:modelValue when search changes', async () => {
    const wrapper = mount(TransactionFilters, { props: { modelValue: defaultModelValue }, ...globalConfig })
    const input = wrapper.find('input[type="text"]')
    await input.setValue('rent')
    const emitted = wrapper.emitted('update:modelValue')
    expect(emitted).toBeTruthy()
    expect((emitted![0][0] as TFilters).search).toBe('rent')
  })

  it('emits update:modelValue when type select changes', async () => {
    const wrapper = mount(TransactionFilters, { props: { modelValue: defaultModelValue }, ...globalConfig })
    await wrapper.find('select').setValue('deposit')
    const emitted = wrapper.emitted('update:modelValue')
    expect((emitted![0][0] as TFilters).type).toBe('deposit')
  })

  it('emits update:modelValue when startDate changes', async () => {
    const wrapper = mount(TransactionFilters, { props: { modelValue: defaultModelValue }, ...globalConfig })
    const dateInput = wrapper.findAll('input[type="date"]')[0]
    await dateInput.setValue('2024-01-01')
    const emitted = wrapper.emitted('update:modelValue')
    expect((emitted![0][0] as TFilters).startDate).toBe('2024-01-01')
  })

  it('emits update:modelValue when endDate changes', async () => {
    const wrapper = mount(TransactionFilters, { props: { modelValue: defaultModelValue }, ...globalConfig })
    const dateInput = wrapper.findAll('input[type="date"]')[1]
    await dateInput.setValue('2024-12-31')
    const emitted = wrapper.emitted('update:modelValue')
    expect((emitted![0][0] as TFilters).endDate).toBe('2024-12-31')
  })

  it('emits apply when Apply button is clicked', async () => {
    const wrapper = mount(TransactionFilters, { props: { modelValue: defaultModelValue }, ...globalConfig })
    const buttons = wrapper.findAll('button')
    const applyBtn = buttons.find(b => b.text() === 'Apply')
    await applyBtn!.trigger('click')
    expect(wrapper.emitted('apply')).toBeTruthy()
  })

  it('emits reset when Reset button is clicked', async () => {
    const wrapper = mount(TransactionFilters, { props: { modelValue: defaultModelValue }, ...globalConfig })
    const buttons = wrapper.findAll('button')
    const resetBtn = buttons.find(b => b.text() === 'Reset')
    await resetBtn!.trigger('click')
    expect(wrapper.emitted('reset')).toBeTruthy()
  })

  it('emits apply when Enter is pressed in search input', async () => {
    const wrapper = mount(TransactionFilters, { props: { modelValue: defaultModelValue }, ...globalConfig })
    await wrapper.find('input[type="text"]').trigger('keyup.enter')
    expect(wrapper.emitted('apply')).toBeTruthy()
  })

  it('preserves other filter values when one field changes', async () => {
    const modelValue = { ...defaultModelValue, type: 'deposit' as const, search: 'existing' }
    const wrapper = mount(TransactionFilters, { props: { modelValue }, ...globalConfig })
    const dateInput = wrapper.findAll('input[type="date"]')[0]
    await dateInput.setValue('2024-06-01')

    const emitted = wrapper.emitted('update:modelValue')
    const updated = emitted![0][0] as TFilters
    expect(updated.type).toBe('deposit')
    expect(updated.search).toBe('existing')
    expect(updated.startDate).toBe('2024-06-01')
  })
})