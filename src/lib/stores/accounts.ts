import { seedAccounts } from '@/data/seed-accounts'
import type { Account } from '@/lib/domain-types'
import { getSlice, updateSlice, useSlice } from '@/lib/store'

// Seed the accounts slice once at module load (before any render), mirroring settings.ts's
// pattern — so getAccounts/useAccounts never need to lazily mutate the store mid-render.
if (!getSlice('accounts')) {
  updateSlice('accounts', () => ({ accounts: seedAccounts() }))
}

export function getAccounts(): Account[] {
  return getSlice('accounts')?.accounts ?? []
}

export function useAccounts(): Account[] {
  return useSlice('accounts')?.accounts ?? []
}

/** Looks up an account by its chart-of-accounts code (e.g. "1200"); throws if missing — a
 * missing core account means the chart of accounts seed is broken, which should fail loudly
 * rather than silently post against a wrong/undefined account. */
export function getAccountIdByCode(code: string): string {
  const account = getAccounts().find((a) => a.code === code)
  if (!account) throw new Error(`Chart of accounts is missing required account code "${code}"`)
  return account.id
}
