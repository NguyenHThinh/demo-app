import { twMerge } from 'tailwind-merge'

export function cn(...classes: (string | undefined | null | false)[]): string {
  return twMerge(classes.filter(Boolean).join(' '))
}

export function formatDateEnGb(
  value: string | Date | null | undefined,
  options: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
  },
): string {
  if (!value) return '-'
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return '-'
  return date.toLocaleDateString('en-GB', options)
}

export function formatMoney(
  value: number | string | null | undefined,
  options: { prefix?: string; suffix?: string } = {},
): string {
  if (value === null || value === undefined || value === '') return '-'
  const numeric = typeof value === 'number' ? value : Number(value)
  if (!Number.isFinite(numeric)) return String(value)
  if (isEffectivelyZero(numeric)) return '-'
  return `${options.prefix ?? ''}${numeric.toLocaleString('en-GB')}${options.suffix ?? ''}`
}

function isEffectivelyZero(value: number): boolean {
  return value === 0 || Object.is(value, -0)
}
