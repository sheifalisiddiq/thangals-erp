import { addMoney, toMoney } from '@/lib/decimal'
import type { JournalEntry, Payment } from '@/lib/domain-types'
import { getAccountIdByCode } from '@/lib/stores/accounts'

function daysAgoIso(days: number): string {
  return new Date(Date.now() - days * 86_400_000).toISOString()
}

/** Historical opening entries so the books aren't empty on first load: one opening-balance
 * JournalEntry (Dr Cash + Dr Bank / Cr Owner's Equity) and a few historical standalone Payment
 * records for variety. Uses distinct `postedRef`s (`opening-balance`, `expense:...`) that do not
 * collide with the `sale:...`/`po:...`/`payment:...` refs the other modules' seeds and
 * `ledger.ts` use. Each entry is individually debit=credit balanced (hand-verified below; callers
 * that want a self-check can additionally run `assertBalanced` from `accounting-rules.ts` against
 * `openingEntry.lines`). This is a demo — approximate realism across modules is fine, exact
 * cross-module reconciliation is not required. */
export function seedFinance(): { payments: Payment[]; journalEntries: JournalEntry[] } {
  const cashAccountId = getAccountIdByCode('1000')
  const bankAccountId = getAccountIdByCode('1010')
  const equityAccountId = getAccountIdByCode('3000')

  const openingCash = toMoney(50_000)
  const openingBank = toMoney(200_000)

  const openingEntry: JournalEntry = {
    id: crypto.randomUUID(),
    date: daysAgoIso(60),
    memo: 'Opening balance — owner capital injection',
    lines: [
      { accountId: cashAccountId, debitMoney: openingCash, creditMoney: 0 },
      { accountId: bankAccountId, debitMoney: openingBank, creditMoney: 0 },
      { accountId: equityAccountId, debitMoney: 0, creditMoney: addMoney(openingCash, openingBank) },
    ],
    refType: 'opening-balance',
    refId: 'opening-balance',
    postedRef: 'opening-balance',
  }

  const rentExpenseEntry: JournalEntry = {
    id: crypto.randomUUID(),
    date: daysAgoIso(20),
    memo: 'Shop rent — October 2026 (booked against Owner\'s Equity; see note on Misc Expense account)',
    lines: [
      { accountId: equityAccountId, debitMoney: toMoney(12_000), creditMoney: 0 },
      { accountId: bankAccountId, debitMoney: 0, creditMoney: toMoney(12_000) },
    ],
    refType: 'other',
    refId: 'expense:rent-oct-2026',
    postedRef: 'expense:rent-oct-2026',
  }

  const journalEntries: JournalEntry[] = [openingEntry, rentExpenseEntry]

  const payments: Payment[] = [
    {
      id: crypto.randomUUID(),
      direction: 'in',
      partyType: 'customer',
      partyId: 'house',
      amountMoney: openingCash,
      method: 'cash',
      refType: 'other',
      postedRef: 'opening-balance',
      createdAt: daysAgoIso(60),
    },
    {
      id: crypto.randomUUID(),
      direction: 'in',
      partyType: 'customer',
      partyId: 'house',
      amountMoney: openingBank,
      method: 'bank',
      refType: 'other',
      postedRef: 'opening-balance',
      createdAt: daysAgoIso(60),
    },
    {
      id: crypto.randomUUID(),
      direction: 'out',
      partyType: 'customer',
      partyId: 'house',
      amountMoney: toMoney(12_000),
      method: 'bank',
      refType: 'other',
      postedRef: 'expense:rent-oct-2026',
      createdAt: daysAgoIso(20),
    },
  ]

  return { payments, journalEntries }
}
