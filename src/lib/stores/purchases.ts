import { seedBranches } from '@/data/seed-branches'
import { seedPurchases } from '@/data/seed-purchases'
import { addMoney, toGrams } from '@/lib/decimal'
import type { GoodsReceipt, PurchaseOrder, PurchaseOrderLine, Supplier, SupplierInvoice } from '@/lib/domain-types'
import { getSlice, updateSlice, useSlice } from '@/lib/store'

export interface PurchasesSlice {
  suppliers: Supplier[]
  purchaseOrders: PurchaseOrder[]
  goodsReceipts: GoodsReceipt[]
  supplierInvoices: SupplierInvoice[]
}

const EMPTY_SLICE: PurchasesSlice = { suppliers: [], purchaseOrders: [], goodsReceipts: [], supplierInvoices: [] }

/** Lazily seeds the purchases slice on first read, mirroring inventory.ts's pattern. Depends on
 * branches, but falls back to seeding its own branches if that slice somehow isn't there yet. */
export function ensurePurchasesSeeded(): void {
  if (!getSlice('purchases')) {
    const branches = getSlice('branches') ?? seedBranches()
    updateSlice('purchases', () => seedPurchases(branches))
  }
}

ensurePurchasesSeeded()

export function getPurchases(): PurchasesSlice {
  ensurePurchasesSeeded()
  return (getSlice('purchases') as PurchasesSlice) ?? EMPTY_SLICE
}

export function usePurchases(): PurchasesSlice {
  ensurePurchasesSeeded()
  return (useSlice('purchases') as PurchasesSlice) ?? EMPTY_SLICE
}

/** Manual supplier creation isn't a cross-module posting — just append to purchases.suppliers
 * directly (not through ledger.ts, which is reserved for postings that touch multiple slices). */
export function addSupplier(supplier: Omit<Supplier, 'id'>): Supplier {
  const newSupplier: Supplier = { ...supplier, id: crypto.randomUUID() }
  updateSlice('purchases', (draft) => {
    const base = draft ?? EMPTY_SLICE
    return { ...base, suppliers: [...base.suppliers, newSupplier] }
  })
  return newSupplier
}

/** Builds a new draft PO: computes each line's lineTotalMoney, sums the PO total, and generates
 * a sequential-looking PO number. Not a ledger posting — receiveGoods (in ledger.ts) is what
 * actually posts inventory + AP when the PO is received. */
export function createPurchaseOrder(
  po: Omit<PurchaseOrder, 'id' | 'poNumber' | 'createdAt' | 'status' | 'totalMoney' | 'lines'> & {
    lines: Omit<PurchaseOrderLine, 'id' | 'lineTotalMoney'>[]
  },
): PurchaseOrder {
  let created!: PurchaseOrder
  updateSlice('purchases', (draft) => {
    const base = draft ?? EMPTY_SLICE
    const lines: PurchaseOrderLine[] = po.lines.map((line) => ({
      ...line,
      id: crypto.randomUUID(),
      lineTotalMoney: Math.round(line.ratePerGramMoney * toGrams(line.weightMg)),
    }))
    const totalMoney = addMoney(...lines.map((l) => l.lineTotalMoney))
    const poNumber = `PO-2026-${String(base.purchaseOrders.length + 1).padStart(4, '0')}`
    created = {
      id: crypto.randomUUID(),
      poNumber,
      supplierId: po.supplierId,
      branchId: po.branchId,
      lines,
      status: 'draft',
      totalMoney,
      createdAt: new Date().toISOString(),
    }
    return { ...base, purchaseOrders: [...base.purchaseOrders, created] }
  })
  return created
}

/** Flips a draft PO to 'sent'. Not a ledger posting — just a status transition. */
export function sendPurchaseOrder(poId: string): void {
  updateSlice('purchases', (draft) => {
    const base = draft ?? EMPTY_SLICE
    const po = base.purchaseOrders.find((p) => p.id === poId)
    if (!po) throw new Error(`Purchase order ${poId} not found`)
    if (po.status !== 'draft') throw new Error(`Only a draft PO can be sent (current status: ${po.status})`)
    po.status = 'sent'
    return { ...base, purchaseOrders: [...base.purchaseOrders] }
  })
}

/** Cancels a draft or sent PO. Throws if already received — a received PO has posted inventory
 * and AP via ledger.ts's receiveGoods and cannot simply be cancelled. */
export function cancelPurchaseOrder(poId: string): void {
  updateSlice('purchases', (draft) => {
    const base = draft ?? EMPTY_SLICE
    const po = base.purchaseOrders.find((p) => p.id === poId)
    if (!po) throw new Error(`Purchase order ${poId} not found`)
    if (po.status === 'received') throw new Error('A received purchase order cannot be cancelled')
    po.status = 'cancelled'
    return { ...base, purchaseOrders: [...base.purchaseOrders] }
  })
}

/** Manual supplier-invoice creation isn't a cross-module posting — paidMoney starts 0 and
 * status starts 'unpaid'; recordPayment (in ledger.ts) is what advances paidMoney/status. */
export function addSupplierInvoice(
  invoice: Omit<SupplierInvoice, 'id' | 'createdAt' | 'paidMoney' | 'status'>,
): SupplierInvoice {
  const newInvoice: SupplierInvoice = {
    ...invoice,
    id: crypto.randomUUID(),
    paidMoney: 0,
    status: 'unpaid',
    createdAt: new Date().toISOString(),
  }
  updateSlice('purchases', (draft) => {
    const base = draft ?? EMPTY_SLICE
    return { ...base, supplierInvoices: [...base.supplierInvoices, newInvoice] }
  })
  return newInvoice
}
