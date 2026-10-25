import { toGrams, type Money, type WeightMg } from './decimal'
import { getSettings } from './settings'

const aedFormatter = new Intl.NumberFormat('en-AE', {
  style: 'currency',
  currency: 'AED',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

const aedFormatterCompact = new Intl.NumberFormat('en-AE', {
  style: 'currency',
  currency: 'AED',
  notation: 'compact',
  maximumFractionDigits: 1,
})

export function formatAED(amount: number): string {
  return aedFormatter.format(amount)
}

export function formatAEDCompact(amount: number): string {
  return aedFormatterCompact.format(amount)
}

export function formatGrams(grams: number, fractionDigits = 2): string {
  return `${grams.toLocaleString('en-AE', {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  })} g`
}

export function formatKarat(karat: 24 | 22 | 21 | 18 | 14): string {
  return `${karat}K`
}

export function formatPercent(value: number, fractionDigits = 1): string {
  return `${value.toLocaleString('en-AE', {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  })}%`
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('en-AE', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

/** Currency-configurable formatter for Money (integer minor units) — reads live settings. */
export function formatMoney(m: Money): string {
  const { currencyCode, locale } = getSettings()
  const formatter = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
  return formatter.format(m / 100)
}

/** Weight-configurable formatter for WeightMg (integer milligrams). */
export function formatWeight(mg: WeightMg, fractionDigits = 2): string {
  return formatGrams(toGrams(mg), fractionDigits)
}
