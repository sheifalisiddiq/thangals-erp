import { seedFinance } from '@/data/seed-finance'
import type { JournalEntry, Payment } from '@/lib/domain-types'
import { getSlice, updateSlice, useSlice } from '@/lib/store'

export interface FinanceSlice {
  payments: Payment[]
  journalEntries: JournalEntry[]
}

const EMPTY_SLICE: FinanceSlice = { payments: [], journalEntries: [] }

/** Lazily seeds the finance slice on first read, mirroring purchases.ts/sales.ts's pattern.
 * Depends on the accounts slice (via seedFinance's getAccountIdByCode calls) — stores/accounts.ts
 * seeds itself at module load, so by the time this runs the chart of accounts already exists. */
export function ensureFinanceSeeded(): void {
  if (!getSlice('finance')) {
    updateSlice('finance', () => seedFinance())
  }
}

ensureFinanceSeeded()

export function getFinance(): FinanceSlice {
  ensureFinanceSeeded()
  return (getSlice('finance') as FinanceSlice) ?? EMPTY_SLICE
}

export function useFinance(): FinanceSlice {
  ensureFinanceSeeded()
  return (useSlice('finance') as FinanceSlice) ?? EMPTY_SLICE
}
