// The transaction/posting engine. This is the ONLY module allowed to call `updateSnapshot` —
// every function here does exactly one read-mutate-write cycle against the snapshot draft, so a
// posting that touches multiple slices (inventory + finance, say) either fully commits or never
// partially lands. Manual, non-posting edits (e.g. creating an inventory item by hand in the UI)
// go through each slice's own store file instead (see `src/lib/stores/inventory.ts`).

import {
  assertBalanced,
  journalForGoodsReceipt,
  journalForPaymentReceived,
  journalForSaleConfirm,
  journalForSupplierPayment,
  reverseJournalLines,
} from './accounting-rules'
import { addMoney, toGrams, type Money } from './decimal'
import type {
  GoodsReceipt,
  ID,
  InventoryItem,
  JournalEntry,
  Payment,
  PurchaseOrder,
  SalesInvoice,
  StockMovement,
} from './domain-types'
import { getAccountIdByCode } from './stores/accounts'
import { getSnapshot, updateSnapshot } from './store'

/** Scans posted journal entries for a matching `postedRef`; throws if one already exists. This
 * is the idempotency guard every posting function calls before it starts its transaction. */
function assertNotPosted(ref: string): void {
  const alreadyPosted = getSnapshot().finance?.journalEntries?.some((je) => je.postedRef === ref)
  if (alreadyPosted) {
    throw new Error(`A posting with reference "${ref}" has already been made`)
  }
}

/** cost for a sale line = round(costPricePerGramMoney * grams(netWeightMg)) — integer Money out. */
function costOfGoodsForItem(item: InventoryItem): Money {
  return Math.round(item.costPricePerGramMoney * toGrams(item.netWeightMg))
}

/** Updates the item's status/note and appends a StockMovement 'adjustment'. Single updateSnapshot call. */
export function adjustStock(itemId: ID, note: string, newStatus?: InventoryItem['status']): StockMovement {
  let movement!: StockMovement
  updateSnapshot((draft) => {
    const inventory = draft.inventory
    if (!inventory) throw new Error('Inventory has not been seeded')
    const item = inventory.items.find((i) => i.id === itemId)
    if (!item) throw new Error(`Inventory item ${itemId} not found`)

    if (newStatus) item.status = newStatus

    movement = {
      id: crypto.randomUUID(),
      itemId,
      type: 'adjustment',
      branchId: item.branchId,
      refType: 'adjustment',
      refId: crypto.randomUUID(),
      note,
      postedAt: new Date().toISOString(),
    }
    inventory.movements.push(movement)
    return draft
  })
  return movement
}

/** Moves item.branchId to toBranchId, appends transfer-out + transfer-in movements. Single updateSnapshot call. */
export function transferStock(itemId: ID, toBranchId: ID): [StockMovement, StockMovement] {
  let result!: [StockMovement, StockMovement]
  updateSnapshot((draft) => {
    const inventory = draft.inventory
    if (!inventory) throw new Error('Inventory has not been seeded')
    const item = inventory.items.find((i) => i.id === itemId)
    if (!item) throw new Error(`Inventory item ${itemId} not found`)

    const fromBranchId = item.branchId
    const now = new Date().toISOString()
    const refId = crypto.randomUUID()

    const transferOut: StockMovement = {
      id: crypto.randomUUID(),
      itemId,
      type: 'transfer-out',
      branchId: fromBranchId,
      relatedBranchId: toBranchId,
      refType: 'transfer',
      refId,
      postedAt: now,
    }
    const transferIn: StockMovement = {
      id: crypto.randomUUID(),
      itemId,
      type: 'transfer-in',
      branchId: toBranchId,
      relatedBranchId: fromBranchId,
      refType: 'transfer',
      refId,
      postedAt: now,
    }

    item.branchId = toBranchId
    inventory.movements.push(transferOut, transferIn)
    result = [transferOut, transferIn]
    return draft
  })
  return result
}

/** Creates one InventoryItem per PO line, a receipt StockMovement per item, a GoodsReceipt
 * record, flips the PO to 'received', and posts a balanced journal entry. Single updateSnapshot call. */
export function receiveGoods(po: PurchaseOrder): GoodsReceipt {
  const ref = `po:${po.id}`
  assertNotPosted(ref)

  const inventoryAssetAccountId = getAccountIdByCode('1200')
  const apAccountId = getAccountIdByCode('2000')

  let receipt!: GoodsReceipt
  updateSnapshot((draft) => {
    const purchases = draft.purchases
    if (!purchases) throw new Error('Purchases have not been seeded')
    // Look up the PO by id in the snapshot rather than trusting the passed-in object's mutability.
    const storedPo = purchases.purchaseOrders.find((p) => p.id === po.id)
    if (!storedPo) throw new Error(`Purchase order ${po.id} not found`)

    const inventory = draft.inventory
    if (!inventory) throw new Error('Inventory has not been seeded')

    const now = new Date().toISOString()

    const newItems: InventoryItem[] = storedPo.lines.map((line) => ({
      id: crypto.randomUUID(),
      sku: `${storedPo.poNumber}-${line.id.slice(0, 6)}`,
      name: line.description,
      category: 'Uncategorized',
      karat: line.karat,
      grossWeightMg: line.weightMg,
      stoneWeightMg: 0,
      netWeightMg: line.weightMg,
      branchId: storedPo.branchId,
      ownership: 'company',
      status: 'in-stock',
      makingChargeBp: 0,
      costPricePerGramMoney: line.ratePerGramMoney,
      createdAt: now,
    }))
    inventory.items.push(...newItems)

    const newMovements: StockMovement[] = newItems.map((item) => ({
      id: crypto.randomUUID(),
      itemId: item.id,
      type: 'receipt',
      branchId: storedPo.branchId,
      refType: 'po',
      refId: storedPo.id,
      note: `Goods receipt for PO ${storedPo.poNumber}`,
      postedAt: now,
    }))
    inventory.movements.push(...newMovements)

    storedPo.status = 'received'

    const goodsReceipt: GoodsReceipt = {
      id: crypto.randomUUID(),
      poId: storedPo.id,
      receivedAt: now,
      lineItemIds: newItems.map((i) => i.id),
      postedRef: ref,
    }
    purchases.goodsReceipts.push(goodsReceipt)

    const lines = journalForGoodsReceipt(inventoryAssetAccountId, apAccountId, storedPo.supplierId, storedPo.totalMoney)
    assertBalanced(lines)

    const finance = draft.finance ?? { payments: [], journalEntries: [] }
    const journalEntry: JournalEntry = {
      id: crypto.randomUUID(),
      date: now,
      memo: `Goods receipt for PO ${storedPo.poNumber}`,
      lines,
      refType: 'po',
      refId: storedPo.id,
      postedRef: ref,
    }
    finance.journalEntries.push(journalEntry)
    draft.finance = finance

    receipt = goodsReceipt
    return draft
  })
  return receipt
}

/** For each line, verifies the InventoryItem is 'in-stock' (double-sell guard), flips each to
 * 'sold', computes COGS from cost-per-gram × net weight, and posts a balanced journal entry.
 * Single updateSnapshot call. */
export function confirmSale(invoice: SalesInvoice): void {
  const ref = `sale:${invoice.id}`
  assertNotPosted(ref)

  const arAccountId = getAccountIdByCode('1100')
  const salesIncomeAccountId = getAccountIdByCode('4000')
  const taxPayableAccountId = getAccountIdByCode('2100')
  const cogsAccountId = getAccountIdByCode('5000')
  const inventoryAssetAccountId = getAccountIdByCode('1200')

  updateSnapshot((draft) => {
    const sales = draft.sales
    if (!sales) throw new Error('Sales have not been seeded')
    const storedInvoice = sales.invoices.find((inv) => inv.id === invoice.id)
    if (!storedInvoice) throw new Error(`Sales invoice ${invoice.id} not found`)

    const inventory = draft.inventory
    if (!inventory) throw new Error('Inventory has not been seeded')

    const now = new Date().toISOString()
    let costOfGoods: Money = 0
    const newMovements: StockMovement[] = []

    for (const line of storedInvoice.lines) {
      const item = inventory.items.find((i) => i.id === line.itemId)
      if (!item) throw new Error(`Inventory item ${line.itemId} referenced by sale line not found`)
      if (item.status !== 'in-stock') {
        throw new Error(`Cannot sell item "${item.name}" (${item.sku}): status is "${item.status}", not in-stock`)
      }

      item.status = 'sold'
      costOfGoods = addMoney(costOfGoods, costOfGoodsForItem(item))
      newMovements.push({
        id: crypto.randomUUID(),
        itemId: item.id,
        type: 'sale',
        branchId: item.branchId,
        refType: 'sale',
        refId: storedInvoice.id,
        note: `Sold on invoice ${storedInvoice.invoiceNumber}`,
        postedAt: now,
      })
    }
    inventory.movements.push(...newMovements)

    const lines = journalForSaleConfirm(
      arAccountId,
      salesIncomeAccountId,
      taxPayableAccountId,
      cogsAccountId,
      inventoryAssetAccountId,
      storedInvoice.customerId,
      storedInvoice.subtotalMoney,
      storedInvoice.taxMoney,
      costOfGoods,
    )
    assertBalanced(lines)

    const finance = draft.finance ?? { payments: [], journalEntries: [] }
    finance.journalEntries.push({
      id: crypto.randomUUID(),
      date: now,
      memo: `Sale confirmed: invoice ${storedInvoice.invoiceNumber}`,
      lines,
      refType: 'sales-invoice',
      refId: storedInvoice.id,
      postedRef: ref,
    })
    draft.finance = finance

    storedInvoice.status = 'confirmed'
    storedInvoice.postedRef = ref

    return draft
  })
}

/** Records a Payment, applies it against the referenced sales/supplier invoice's paid amount
 * and status, and posts a balanced journal entry. Single updateSnapshot call. */
export function recordPayment(payment: Omit<Payment, 'id' | 'postedRef'>): Payment {
  const ref = `payment:${payment.direction}:${payment.refType}:${payment.refId ?? 'adhoc'}:${Date.now()}`
  assertNotPosted(ref)

  const cashAccountId = getAccountIdByCode('1000')
  const bankAccountId = getAccountIdByCode('1010')
  const arAccountId = getAccountIdByCode('1100')
  const apAccountId = getAccountIdByCode('2000')
  const cashOrBankAccountId = payment.method === 'bank' ? bankAccountId : cashAccountId

  let created!: Payment
  updateSnapshot((draft) => {
    const finance = draft.finance ?? { payments: [], journalEntries: [] }
    const now = new Date().toISOString()

    const newPayment: Payment = { ...payment, id: crypto.randomUUID(), postedRef: ref }
    finance.payments.push(newPayment)

    if (payment.refType === 'sales-invoice' && payment.refId) {
      const invoice = draft.sales?.invoices.find((inv) => inv.id === payment.refId)
      if (!invoice) throw new Error(`Sales invoice ${payment.refId} not found for payment`)
      invoice.paidMoney = addMoney(invoice.paidMoney, payment.amountMoney)
      invoice.status = invoice.paidMoney >= invoice.totalMoney ? 'paid' : 'partial'
    } else if (payment.refType === 'supplier-invoice' && payment.refId) {
      const supplierInvoice = draft.purchases?.supplierInvoices.find((inv) => inv.id === payment.refId)
      if (!supplierInvoice) throw new Error(`Supplier invoice ${payment.refId} not found for payment`)
      supplierInvoice.paidMoney = addMoney(supplierInvoice.paidMoney, payment.amountMoney)
      supplierInvoice.status = supplierInvoice.paidMoney >= supplierInvoice.amountMoney ? 'paid' : 'partial'
    }

    const lines =
      payment.direction === 'in'
        ? journalForPaymentReceived(cashOrBankAccountId, arAccountId, payment.partyId, payment.amountMoney)
        : journalForSupplierPayment(apAccountId, cashOrBankAccountId, payment.partyId, payment.amountMoney)
    assertBalanced(lines)

    finance.journalEntries.push({
      id: crypto.randomUUID(),
      date: now,
      memo: `Payment ${payment.direction === 'in' ? 'received from' : 'made to'} party ${payment.partyId}`,
      lines,
      refType: 'payment',
      refId: newPayment.id,
      postedRef: ref,
    })
    draft.finance = finance

    created = newPayment
    return draft
  })
  return created
}

/** Records a standalone/ad-hoc cash or bank movement not tied to any sales/supplier invoice
 * (e.g. a capital injection, an owner drawing, or a misc expense) — `refType:'other'`.
 *
 * Sentinel note: `Payment.partyType` is a closed union of `'customer' | 'supplier'` and
 * `Payment.partyId` is a plain `ID` string — there is no "no party" case in that type, because it
 * wasn't designed with a true house/ad-hoc movement in mind, and redesigning it now would ripple
 * into the 3 already-built modules (Purchases, Retail Sales) that construct `Payment` literals
 * against the current shape. Rather than lying about the party (e.g. picking a random real
 * customer/supplier id), this models a standalone payment as `partyType: 'customer'`,
 * `partyId: 'house'` — `'house'` is a sentinel, not a real customer id, and UI code reading
 * payments must special-case it (see `src/pages/finance/cash-bank.tsx`, which renders it as
 * "House account") rather than trying to resolve it against `sales.customers`.
 *
 * Accounting note: this always posts against Owner's Equity (3000) on the non-cash/bank side,
 * for both directions. For `direction: 'in'` that's correct (a capital injection is genuinely a
 * credit to equity). For `direction: 'out'` it's a simplification: an owner drawing is correctly
 * a debit to equity, but a misc *expense* (rent, utilities, etc.) should debit a dedicated
 * "Misc Expense" account, not equity — there is no such account in the seeded chart of accounts
 * (`src/data/seed-accounts.ts` has no generic expense account besides COGS/Wastage, neither of
 * which fits a cash expense). This function does NOT attempt to guess which case it is and does
 * NOT silently mislabel an expense as a drawing or vice versa — it posts to equity either way and
 * leaves this comment so a future pass adds a proper Misc Expense account (e.g. code "5200")
 * before this is fully correct for the expense case. */
export function recordStandalonePayment(payment: {
  direction: 'in' | 'out'
  amountMoney: Money
  method: 'cash' | 'bank' | 'card'
  note?: string
}): Payment {
  const ref = `standalone:${payment.direction}:${Date.now()}:${crypto.randomUUID().slice(0, 8)}`
  assertNotPosted(ref)

  const cashAccountId = getAccountIdByCode('1000')
  const bankAccountId = getAccountIdByCode('1010')
  const equityAccountId = getAccountIdByCode('3000')
  const cashOrBankAccountId = payment.method === 'bank' ? bankAccountId : cashAccountId

  let created!: Payment
  updateSnapshot((draft) => {
    const finance = draft.finance ?? { payments: [], journalEntries: [] }
    const now = new Date().toISOString()

    const newPayment: Payment = {
      id: crypto.randomUUID(),
      direction: payment.direction,
      partyType: 'customer',
      partyId: 'house', // sentinel — see function doc comment above
      amountMoney: payment.amountMoney,
      method: payment.method,
      refType: 'other',
      postedRef: ref,
      createdAt: now,
    }
    finance.payments.push(newPayment)

    const lines =
      payment.direction === 'in'
        ? [
            { accountId: cashOrBankAccountId, debitMoney: payment.amountMoney, creditMoney: 0 },
            { accountId: equityAccountId, debitMoney: 0, creditMoney: payment.amountMoney },
          ]
        : [
            { accountId: equityAccountId, debitMoney: payment.amountMoney, creditMoney: 0 },
            { accountId: cashOrBankAccountId, debitMoney: 0, creditMoney: payment.amountMoney },
          ]
    assertBalanced(lines)

    finance.journalEntries.push({
      id: crypto.randomUUID(),
      date: now,
      memo: payment.note || `Standalone ${payment.direction === 'in' ? 'receipt' : 'payment'} (house account)`,
      lines,
      refType: 'other',
      refId: newPayment.id,
      postedRef: ref,
    })
    draft.finance = finance

    created = newPayment
    return draft
  })
  return created
}

/** Reverses a confirmed sale: restores every sold item to 'in-stock', posts a reversing journal
 * entry (swapped debit/credit of the original), links reversedBy on the original, and sets the
 * invoice to 'reversed'. Single updateSnapshot call. */
export function reverseSale(invoiceId: ID): void {
  updateSnapshot((draft) => {
    const sales = draft.sales
    if (!sales) throw new Error('Sales have not been seeded')
    const invoice = sales.invoices.find((inv) => inv.id === invoiceId)
    if (!invoice) throw new Error(`Sales invoice ${invoiceId} not found`)

    const finance = draft.finance
    if (!finance) throw new Error('Finance has not been seeded')
    const originalEntry = finance.journalEntries.find(
      (je) => je.refType === 'sales-invoice' && je.refId === invoiceId && !je.reversedBy,
    )
    if (!originalEntry) {
      throw new Error(`No unreversed posted journal entry found for sales invoice ${invoiceId}`)
    }

    const inventory = draft.inventory
    if (!inventory) throw new Error('Inventory has not been seeded')

    const now = new Date().toISOString()
    for (const line of invoice.lines) {
      const item = inventory.items.find((i) => i.id === line.itemId)
      if (!item) continue
      item.status = 'in-stock'
      inventory.movements.push({
        id: crypto.randomUUID(),
        itemId: item.id,
        type: 'adjustment',
        branchId: item.branchId,
        refType: 'sale',
        refId: invoiceId,
        note: `Reversal of sale ${invoice.invoiceNumber}`,
        postedAt: now,
      })
    }

    const reversalEntry: JournalEntry = {
      id: crypto.randomUUID(),
      date: now,
      memo: `Reversal of sale ${invoice.invoiceNumber}`,
      lines: reverseJournalLines(originalEntry.lines),
      refType: 'sales-invoice',
      refId: invoiceId,
      postedRef: `reversal:${originalEntry.postedRef}`,
    }
    finance.journalEntries.push(reversalEntry)
    originalEntry.reversedBy = reversalEntry.id

    invoice.status = 'reversed'

    return draft
  })
}
