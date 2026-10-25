import { toMoney, type BasisPoints, type Money } from './decimal'
import { getSlice, updateSlice, useSlice } from './store'

export interface GoldRateSetting {
  karat: 24 | 22 | 21 | 18 | 14
  ratePerGramMoney: Money
  effectiveAt: string
}

export interface TaxConfig {
  name: string
  rateBp: BasisPoints
  inclusive: boolean
  enabled: boolean
}

export interface AppSettings {
  currencyCode: string
  currencySymbol: string
  locale: string
  tax: TaxConfig
  goldRates: GoldRateSetting[]
}

const RATE_24K_PER_GRAM_AED = 270

export const DEFAULT_SETTINGS: AppSettings = {
  currencyCode: 'AED',
  currencySymbol: 'AED',
  locale: 'en-AE',
  tax: { name: 'VAT', rateBp: 500, inclusive: false, enabled: true },
  goldRates: ([24, 22, 21, 18, 14] as const).map((karat) => ({
    karat,
    ratePerGramMoney: toMoney(RATE_24K_PER_GRAM_AED * (karat / 24)),
    effectiveAt: new Date().toISOString(),
  })),
}

// Seed the settings slice once at module load (before any render), so getSettings/useSettings
// never need to lazily mutate the store mid-render.
if (!getSlice('settings')) {
  updateSlice('settings', () => DEFAULT_SETTINGS)
}

export function getSettings(): AppSettings {
  return getSlice('settings') ?? DEFAULT_SETTINGS
}

export function useSettings(): AppSettings {
  return useSlice('settings') ?? DEFAULT_SETTINGS
}

export function updateSettings(fn: (draft: AppSettings) => AppSettings): void {
  updateSlice('settings', (draft) => fn(draft ?? DEFAULT_SETTINGS))
}

export function goldRateForKarat(karat: 24 | 22 | 21 | 18 | 14): Money {
  const settings = getSettings()
  return settings.goldRates.find((r) => r.karat === karat)?.ratePerGramMoney ?? 0
}
