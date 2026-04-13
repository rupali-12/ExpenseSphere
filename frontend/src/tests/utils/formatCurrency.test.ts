import { describe, it, expect } from 'vitest'
import { formatCurrency, formatAmount } from '@/utils/formatCurrency'

describe('formatCurrency()', () => {
  it('formats a positive number as INR currency', () => {
    const result = formatCurrency(1234.5)
    expect(result).toBe('₹1,234.50')
  })

  it('formats an integer correctly', () => {
    const result = formatCurrency(1000)
    expect(result).toBe('₹1,000.00')
  })

  it('formats zero correctly', () => {
    const result = formatCurrency(0)
    expect(result).toBe('₹0.00')
  })

  it('formats a large number with Indian grouping', () => {
    const result = formatCurrency(12345678.9)
    // Indian grouping: 1,23,45,678.90
    expect(result).toBe('₹1,23,45,678.90')
  })
})

describe('formatAmount()', () => {
  it('formats a positive number with Indian number grouping', () => {
    const result = formatAmount(1234567)
    expect(result).toBe('12,34,567')
  })

  it('formats zero correctly', () => {
    const result = formatAmount(0)
    expect(result).toBe('0')
  })

  it('formats decimal numbers without forcing decimals', () => {
    const result = formatAmount(1234.56)
    expect(result).toBe('1,234.56')
  })

  it('formats negative numbers correctly', () => {
    const result = formatAmount(-987654)
    expect(result).toBe('-9,87,654')
  })
})