// Shared domain primitives. Per-module interfaces are added here alongside the batch that
// implements them. Batch 1 (this batch) added InventoryItem/StockMovement/PhysicalCount (built
// out fully) plus minimal read-only shapes for Purchases/Sales/Finance/Accounts (Supplier,
// PurchaseOrder, PurchaseOrderLine, GoodsReceipt, SupplierInvoice, Customer, SalesInvoice,
// SalesInvoiceLine, Payment, Account, JournalEntry, JournalLine) that the ledger needs to
// reference — the teams building those modules' pages own the authoritative versions.
//   Batch 2 (pending): CRM, Wholesale, Old Gold, Savings Schemes types
//   Batch 3 (pending): Manufacturing, QC, Repairs, Bullion types
//   Batch 4 (pending): Dispatch, E-commerce, HR, Reports/Audit, Administration types

import type { BasisPoints, Money, WeightMg } from './decimal'

export type ID = string // crypto.randomUUID()

export interface Branch {
  id: ID
  name: string
  code: string
  isVault: boolean
}

export interface InventoryItem {
  id: ID
  sku: string
  name: string
  category: string
  karat: 24 | 22 | 21 | 18 | 14
  grossWeightMg: WeightMg
  stoneWeightMg: WeightMg
  netWeightMg: WeightMg
  stoneDetails?: string
  branchId: ID
  ownership: 'company' | 'customer' | 'supplier-consignment'
  status: 'in-stock' | 'reserved' | 'sold' | 'transferred' | 'quarantined'
  makingChargeBp: BasisPoints
  costPricePerGramMoney: Money
  imageNote?: string // demo stand-in for a real photo attachment
  createdAt: string
}

export interface StockMovement {
  id: ID
  itemId: ID
  type: 'receipt' | 'adjustment' | 'transfer-out' | 'transfer-in' | 'sale' | 'quarantine' | 'release'
  branchId: ID
  relatedBranchId?: ID
  refType: 'po' | 'adjustment' | 'transfer' | 'sale' | 'physical-count'
  refId: ID
  note?: string
  postedAt: string
}

export interface PhysicalCount {
  id: ID
  branchId: ID
  countedAt: string
  expectedItemIds: ID[]
  foundItemIds: ID[]
  missingItemIds: ID[]
  note?: string
}

// Minimal shapes the ledger needs to reference across modules — the Purchases/Sales/Finance
// teams building those modules own the authoritative versions of these; keep these in sync
// if you see a conflict, but do not build the pages for them.
export interface Supplier {
  id: ID
  name: string
  contact: string
  phone: string
  address: string
  openingBalanceMoney: Money
}

export interface PurchaseOrderLine {
  id: ID
  description: string
  karat: 24 | 22 | 21 | 18 | 14
  weightMg: WeightMg
  ratePerGramMoney: Money
  lineTotalMoney: Money
}

export interface PurchaseOrder {
  id: ID
  poNumber: string
  supplierId: ID
  branchId: ID
  lines: PurchaseOrderLine[]
  status: 'draft' | 'sent' | 'received' | 'closed' | 'cancelled'
  totalMoney: Money
  createdAt: string
}

export interface GoodsReceipt {
  id: ID
  poId: ID
  receivedAt: string
  lineItemIds: ID[]
  postedRef: string
}

export interface SupplierInvoice {
  id: ID
  supplierId: ID
  poId?: ID
  invoiceNumber: string
  amountMoney: Money
  paidMoney: Money
  status: 'unpaid' | 'partial' | 'paid'
  dueDate: string
  createdAt: string
}

export interface Customer {
  id: ID
  name: string
  phone: string
  address: string
  openingBalanceMoney: Money
}

export interface SalesInvoiceLine {
  id: ID
  itemId: ID
  description: string
  weightMg: WeightMg
  ratePerGramMoney: Money
  metalValueMoney: Money
  makingChargeMoney: Money
  stoneChargeMoney: Money
  discountMoney: Money
  lineTotalMoney: Money
}

export interface SalesInvoice {
  id: ID
  invoiceNumber: string
  customerId: ID
  branchId: ID
  lines: SalesInvoiceLine[]
  subtotalMoney: Money
  taxMoney: Money
  totalMoney: Money
  paidMoney: Money
  status: 'draft' | 'confirmed' | 'paid' | 'partial' | 'cancelled' | 'reversed'
  postedRef: string
  createdAt: string
}

export interface Payment {
  id: ID
  direction: 'in' | 'out'
  partyType: 'customer' | 'supplier'
  partyId: ID
  amountMoney: Money
  method: 'cash' | 'bank' | 'card'
  refType: 'sales-invoice' | 'supplier-invoice' | 'other'
  refId?: ID
  postedRef: string
  createdAt: string
}

export interface Account {
  id: ID
  code: string
  name: string
  type: 'asset' | 'liability' | 'equity' | 'income' | 'expense'
}

export interface JournalLine {
  accountId: ID
  debitMoney: Money
  creditMoney: Money
  partyId?: ID
}

export interface JournalEntry {
  id: ID
  date: string
  memo: string
  lines: JournalLine[]
  refType: string
  refId: string
  postedRef: string
  reversedBy?: ID
}
