import { describe, it, expect } from 'vitest'
import {
  formatDate,
  formatDateShort,
  formatDateTime,
  formatMonthYear,
} from '@/utils/formatDate'

describe('formatDate utils', () => {
  describe('formatDate()', () => {
    it('formats a valid date to DD Mon YYYY (en-IN)', () => {
      const result = formatDate('2025-01-15')
      expect(result).toBe('15 Jan 2025')
    })

    it('returns "Invalid Date" for invalid input', () => {
      const result = formatDate('not-a-date')
      expect(result).toBe('Invalid Date')
    })
  })

  describe('formatDateShort()', () => {
    it('formats a valid date to DD/MM/YY style (en-IN)', () => {
      const result = formatDateShort('2025-01-15')
      expect(result).toBe('15/01/25')
    })

    it('returns "Invalid Date" for invalid input', () => {
      const result = formatDateShort('invalid')
      expect(result).toBe('Invalid Date')
    })
  })

  describe('formatDateTime()', () => {
    it('formats date and time correctly', () => {
      const result = formatDateTime('2025-01-15T10:30:00')

      // Example output: "15 Jan 2025, 10:30 am"
      expect(result).toContain('15 Jan 2025')
      expect(result).toMatch(/10:30/i)
    })

    it('returns "Invalid Date" for invalid input', () => {
      const result = formatDateTime('wrong-date')
      expect(result).toBe('Invalid Date')
    })
  })

  describe('formatMonthYear()', () => {
    it('formats month and year correctly', () => {
      const result = formatMonthYear('2025-01-15')
      expect(result).toBe('January 2025')
    })

    it('returns "Invalid Date" for invalid input', () => {
      const result = formatMonthYear('bad-input')
      expect(result).toBe('Invalid Date')
    })
  })
})