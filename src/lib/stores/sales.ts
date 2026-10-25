import { seedBranches } from '@/data/seed-branches'
import { seedSales } from '@/data/seed-sales'
import type { Customer, SalesInvoice } from '@/lib/domain-types'
import { getSlice, updateSlice, useSlice } from '@/lib/store'

export interface SalesSlice {
  customers: Customer[]
  invoices: SalesInvoice[]
}

const EMPTY_SLICE: SalesSlice = { customers: [], invoices: [] }

/** Lazily seeds the sales slice on first read, mirroring purchases.ts's pattern. Depends on
 * branches, but falls back to seeding its own branches if that slice somehow isn't there yet. */
export function ensureSalesSeeded(): void {
  if (!getSlice('sales')) {
    const branches = getSlice('branches') ?? seedBranches()
    updateSlice('sales', () => seedSales(branches))
  }
}

ensureSalesSeeded()

export function getSales(): SalesSlice {
  ensureSalesSeeded()
  return (getSlice('sales') as SalesSlice) ?? EMPTY_SLICE
}

export function useSales(): SalesSlice {
  ensureSalesSeeded()
  return (useSlice('sales') as SalesSlice) ?? EMPTY_SLICE
}

/** Manual customer creation isn't a cross-module posting — just append to sales.customers
 * directly (not through ledger.ts, which is reserved for postings that touch multiple slices). */
export function addCustomer(customer: Omit<Customer, 'id'>): Customer {
  const newCustomer: Customer = { ...customer, id: crypto.randomUUID() }
  updateSlice('sales', (draft) => {
    const base = draft ?? EMPTY_SLICE
    return { ...base, customers: [...base.customers, newCustomer] }
  })
  return newCustomer
}

/** Builds and persists a new draft SalesInvoice: generates a sequential-looking invoice number,
 * status starts 'draft', postedRef is pre-set to `sale:${id}` (the exact ref ledger.ts's
 * confirmSale will post under), paidMoney starts 0. This function MUST append the invoice into
 * sales.invoices before returning, since confirmSale expects to find it already there by id. */
export function saveDraftInvoice(
  invoice: Omit<SalesInvoice, 'id' | 'invoiceNumber' | 'createdAt' | 'status' | 'postedRef' | 'paidMoney'>,
): SalesInvoice {
  let created!: SalesInvoice
  updateSlice('sales', (draft) => {
    const base = draft ?? EMPTY_SLICE
    const id = crypto.randomUUID()
    const invoiceNumber = `INV-2026-${String(base.invoices.length + 1).padStart(4, '0')}`
    created = {
      ...invoice,
      id,
      invoiceNumber,
      status: 'draft',
      postedRef: `sale:${id}`,
      paidMoney: 0,
      createdAt: new Date().toISOString(),
    }
    return { ...base, invoices: [...base.invoices, created] }
  })
  return created
}
