// Concrete, named journal-line builders for each posting event this batch's ledger needs.
// Deliberately not a generic rule engine — each function returns the exact JournalLine[] for
// one event type, given already-computed Money amounts and account/party ids. `ledger.ts` is
// the only caller; it runs `assertBalanced` on the result before pushing a JournalEntry.

import { addMoney, sumMoney, type Money } from './decimal'
import type { ID, JournalLine } from './domain-types'

/** Dr Inventory Asset / Cr Accounts Payable */
export function journalForGoodsReceipt(
  inventoryAssetAccountId: ID,
  apAccountId: ID,
  partyId: ID,
  amount: Money,
): JournalLine[] {
  return [
    { accountId: inventoryAssetAccountId, debitMoney: amount, creditMoney: 0, partyId },
    { accountId: apAccountId, debitMoney: 0, creditMoney: amount, partyId },
  ]
}

/**
 * Dr AR (subtotal+tax) / Cr Sales Income (subtotal) / Cr Tax Payable (tax),
 * plus Dr COGS / Cr Inventory Asset (costOfGoods) — each pair balances on its own, and the
 * combined entry balances across all lines.
 */
export function journalForSaleConfirm(
  arAccountId: ID,
  salesIncomeAccountId: ID,
  taxPayableAccountId: ID,
  cogsAccountId: ID,
  inventoryAssetAccountId: ID,
  partyId: ID,
  subtotal: Money,
  tax: Money,
  costOfGoods: Money,
): JournalLine[] {
  return [
    { accountId: arAccountId, debitMoney: addMoney(subtotal, tax), creditMoney: 0, partyId },
    { accountId: salesIncomeAccountId, debitMoney: 0, creditMoney: subtotal, partyId },
    { accountId: taxPayableAccountId, debitMoney: 0, creditMoney: tax, partyId },
    { accountId: cogsAccountId, debitMoney: costOfGoods, creditMoney: 0, partyId },
    { accountId: inventoryAssetAccountId, debitMoney: 0, creditMoney: costOfGoods, partyId },
  ]
}

/** Dr Cash/Bank / Cr AR */
export function journalForPaymentReceived(cashOrBankAccountId: ID, arAccountId: ID, partyId: ID, amount: Money): JournalLine[] {
  return [
    { accountId: cashOrBankAccountId, debitMoney: amount, creditMoney: 0, partyId },
    { accountId: arAccountId, debitMoney: 0, creditMoney: amount, partyId },
  ]
}

/** Dr AP / Cr Cash/Bank */
export function journalForSupplierPayment(apAccountId: ID, cashOrBankAccountId: ID, partyId: ID, amount: Money): JournalLine[] {
  return [
    { accountId: apAccountId, debitMoney: amount, creditMoney: 0, partyId },
    { accountId: cashOrBankAccountId, debitMoney: 0, creditMoney: amount, partyId },
  ]
}

/** Swaps every line's debitMoney/creditMoney — used by ledger.ts reversal functions. */
export function reverseJournalLines(lines: JournalLine[]): JournalLine[] {
  return lines.map((line) => ({ ...line, debitMoney: line.creditMoney, creditMoney: line.debitMoney }))
}

/** Throws if sum(debitMoney) !== sum(creditMoney) across lines — call this before every post. */
export function assertBalanced(lines: JournalLine[]): void {
  const totalDebit = sumMoney(lines.map((l) => l.debitMoney))
  const totalCredit = sumMoney(lines.map((l) => l.creditMoney))
  if (totalDebit !== totalCredit) {
    throw new Error(`Unbalanced journal entry: debits=${totalDebit} credits=${totalCredit}`)
  }
}
