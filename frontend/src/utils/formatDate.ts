// src/utils/formatDate.ts
export const formatDate = (date: string): string => {
  const d = new Date(date)
  if (isNaN(d.getTime())) return 'Invalid Date'
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

export const formatDateShort = (date: string): string => {
  const d = new Date(date)
  if (isNaN(d.getTime())) return 'Invalid Date'
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: '2-digit' })
}

export const formatDateTime = (date: string): string => {
  const d = new Date(date)
  if (isNaN(d.getTime())) return 'Invalid Date'
  return d.toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export const formatMonthYear = (date: string): string => {
  const d = new Date(date)
  if (isNaN(d.getTime())) return 'Invalid Date'
  return d.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
}