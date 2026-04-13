// src/utils/formatCurrency.ts
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  }).format(amount)
}

export const formatAmount = (amount: number): string => {
  return new Intl.NumberFormat('en-IN').format(amount)
}