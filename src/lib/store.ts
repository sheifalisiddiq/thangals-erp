import { useSyncExternalStore } from 'react'
import type { AppSettings } from './settings'
import type {
  Account,
  Branch,
  Customer,
  GoodsReceipt,
  InventoryItem,
  JournalEntry,
  Payment,
  PhysicalCount,
  PurchaseOrder,
  SalesInvoice,
  StockMovement,
  Supplier,
  SupplierInvoice,
} from './domain-types'

// Root snapshot: every module's demo data lives in one object under one localStorage key
// (`thangals-erp-db`), so a cross-module transaction in ledger.ts can commit via a single
// read-mutate-write cycle (updateSnapshot) instead of independent per-module writes that
// could leave partially-updated state if interrupted mid-operation.
export interface ErpSnapshot {
  settings?: AppSettings
  branches?: Branch[]
  inventory?: { items: InventoryItem[]; movements: StockMovement[]; physicalCounts: PhysicalCount[] }
  purchases?: { suppliers: Supplier[]; purchaseOrders: PurchaseOrder[]; goodsReceipts: GoodsReceipt[]; supplierInvoices: SupplierInvoice[] }
  sales?: { customers: Customer[]; invoices: SalesInvoice[] }
  finance?: { payments: Payment[]; journalEntries: JournalEntry[] }
  accounts?: { accounts: Account[] }
  // TODO(batch 2): crm, wholesale, oldGold, savings
  // TODO(batch 3): manufacturing, qc, repairs, bullion
  // TODO(batch 4): dispatch, ecommerce, hr, reports, admin
}

export function createStore<T>(key: string, seed: () => T) {
  const STORAGE_KEY = `thangals-erp-${key}`
  const listeners = new Set<() => void>()

  function load(): T {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      return raw ? (JSON.parse(raw) as T) : seed()
    } catch {
      return seed()
    }
  }

  let cached: T = load()

  function emit() {
    listeners.forEach((l) => l())
  }

  function persist() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cached))
    emit()
  }

  function get(): T {
    return cached
  }

  function set(next: T) {
    cached = next
    persist()
  }

  function update(fn: (draft: T) => T) {
    cached = fn(cached)
    persist()
  }

  function useStore(): T {
    return useSyncExternalStore(
      (onChange) => {
        listeners.add(onChange)
        return () => listeners.delete(onChange)
      },
      () => cached,
    )
  }

  return { get, set, update, useStore }
}

const rootStore = createStore<ErpSnapshot>('db', () => ({}))

export function getSnapshot(): ErpSnapshot {
  return rootStore.get()
}

export function useSnapshot(): ErpSnapshot {
  return rootStore.useStore()
}

/** The single commit path for cross-module postings — one read, one write, never partial. */
export function updateSnapshot(fn: (draft: ErpSnapshot) => ErpSnapshot): void {
  rootStore.update(fn)
}

export function getSlice<K extends keyof ErpSnapshot>(key: K): ErpSnapshot[K] {
  return rootStore.get()[key]
}

export function useSlice<K extends keyof ErpSnapshot>(key: K): ErpSnapshot[K] {
  return rootStore.useStore()[key]
}

export function updateSlice<K extends keyof ErpSnapshot>(
  key: K,
  fn: (draft: ErpSnapshot[K]) => ErpSnapshot[K],
): void {
  rootStore.update((draft) => ({ ...draft, [key]: fn(draft[key]) }))
}
