import { addMoney, fromGrams, toMoney } from '@/lib/decimal'
import type { Branch, GoodsReceipt, PurchaseOrder, PurchaseOrderLine, Supplier, SupplierInvoice } from '@/lib/domain-types'

function daysAgoIso(days: number): string {
  return new Date(Date.now() - days * 86_400_000).toISOString()
}

/** 4 fictional UAE gold-trade suppliers, 3-4 POs (one already received with a matching
 * GoodsReceipt for Purchase History from day one, one sent/pending, one draft), and 2-3
 * supplier invoices tied to the received PO(s) with mixed paid/partial/unpaid status. */
export function seedPurchases(branches: Branch[]): {
  suppliers: Supplier[]
  purchaseOrders: PurchaseOrder[]
  goodsReceipts: GoodsReceipt[]
  supplierInvoices: SupplierInvoice[]
} {
  const deira = branches.find((b) => b.code === 'DXB-DS') ?? branches[0]
  const dubaiMall = branches.find((b) => b.code === 'DXB-DM') ?? branches[1]
  const vault = branches.find((b) => b.isVault) ?? branches[branches.length - 1]

  const suppliers: Supplier[] = [
    {
      id: crypto.randomUUID(),
      name: 'Al Fardan Bullion Trading LLC',
      contact: 'Yusuf Al Fardan',
      phone: '+971 4 221 3345',
      address: 'Shop 112, Gold Souk, Deira, Dubai',
      openingBalanceMoney: toMoney(45_000),
    },
    {
      id: crypto.randomUUID(),
      name: 'Dubai Gold Refinery FZE',
      contact: 'Meera Nair',
      phone: '+971 4 881 7720',
      address: 'Plot 7, Jebel Ali Free Zone, Dubai',
      openingBalanceMoney: toMoney(0),
    },
    {
      id: crypto.randomUUID(),
      name: 'Sharaf Precious Metals Trading',
      contact: 'Ahmed Sharaf',
      phone: '+971 4 355 9981',
      address: 'Office 404, Al Rigga Road, Deira, Dubai',
      openingBalanceMoney: toMoney(12_500),
    },
    {
      id: crypto.randomUUID(),
      name: 'Emirates Karigar Supplies Co.',
      contact: 'Pratik Shah',
      phone: '+971 6 574 2210',
      address: 'Warehouse 9, Industrial Area 3, Sharjah',
      openingBalanceMoney: toMoney(0),
    },
  ]

  const [alFardan, dgr, sharaf, emiratesKarigar] = suppliers

  function makeLine(description: string, karat: PurchaseOrderLine['karat'], grams: number, ratePerGramAED: number): PurchaseOrderLine {
    const weightMg = fromGrams(grams)
    const ratePerGramMoney = toMoney(ratePerGramAED)
    return {
      id: crypto.randomUUID(),
      description,
      karat,
      weightMg,
      ratePerGramMoney,
      lineTotalMoney: Math.round(ratePerGramMoney * grams),
    }
  }

  // PO 1: already received — historical record only, do NOT duplicate its items into the
  // inventory seed (this receipt is purely for Purchase History, not a live re-receive).
  const po1Lines: PurchaseOrderLine[] = [
    makeLine('24K Gold Bars (1kg each)', 24, 1000, 268),
    makeLine('22K Gold Casting Grain', 22, 500, 246),
  ]
  const po1: PurchaseOrder = {
    id: crypto.randomUUID(),
    poNumber: 'PO-2026-0001',
    supplierId: alFardan.id,
    branchId: vault.id,
    lines: po1Lines,
    status: 'received',
    totalMoney: addMoney(...po1Lines.map((l) => l.lineTotalMoney)),
    createdAt: daysAgoIso(42),
  }

  const receipt1: GoodsReceipt = {
    id: crypto.randomUUID(),
    poId: po1.id,
    receivedAt: daysAgoIso(38),
    lineItemIds: [], // historical seed record — no live InventoryItems were created for this
    postedRef: `po:${po1.id}`,
  }

  // PO 2: sent, pending receipt in the demo.
  const po2Lines: PurchaseOrderLine[] = [
    makeLine('21K Gold Sheet Stock', 21, 800, 235),
    makeLine('18K Gold Wire', 18, 300, 198),
  ]
  const po2: PurchaseOrder = {
    id: crypto.randomUUID(),
    poNumber: 'PO-2026-0002',
    supplierId: dgr.id,
    branchId: dubaiMall.id,
    lines: po2Lines,
    status: 'sent',
    totalMoney: addMoney(...po2Lines.map((l) => l.lineTotalMoney)),
    createdAt: daysAgoIso(5),
  }

  // PO 3: draft.
  const po3Lines: PurchaseOrderLine[] = [makeLine('22K Gold Chain Links (bulk)', 22, 400, 246)]
  const po3: PurchaseOrder = {
    id: crypto.randomUUID(),
    poNumber: 'PO-2026-0003',
    supplierId: sharaf.id,
    branchId: deira.id,
    lines: po3Lines,
    status: 'draft',
    totalMoney: addMoney(...po3Lines.map((l) => l.lineTotalMoney)),
    createdAt: daysAgoIso(1),
  }

  // PO 4: another sent order with a different (non-bullion) supplier, for variety.
  const po4Lines: PurchaseOrderLine[] = [makeLine('Polishing & Setting Consumables Lot', 18, 120, 198)]
  const po4: PurchaseOrder = {
    id: crypto.randomUUID(),
    poNumber: 'PO-2026-0004',
    supplierId: emiratesKarigar.id,
    branchId: deira.id,
    lines: po4Lines,
    status: 'sent',
    totalMoney: addMoney(...po4Lines.map((l) => l.lineTotalMoney)),
    createdAt: daysAgoIso(3),
  }

  const purchaseOrders: PurchaseOrder[] = [po1, po2, po3, po4]
  const goodsReceipts: GoodsReceipt[] = [receipt1]

  // Supplier invoices tied to the received PO — mixed unpaid/partial/paid, with paidMoney
  // consistent with status.
  const invoice1Amount = po1.totalMoney
  const invoice1Paid = invoice1Amount // fully paid
  const supplierInvoice1: SupplierInvoice = {
    id: crypto.randomUUID(),
    supplierId: alFardan.id,
    poId: po1.id,
    invoiceNumber: 'INV-AF-7731',
    amountMoney: invoice1Amount,
    paidMoney: invoice1Paid,
    status: 'paid',
    dueDate: daysAgoIso(10),
    createdAt: daysAgoIso(38),
  }

  const invoice2Amount = toMoney(18_000)
  const invoice2Paid = toMoney(9_000) // partially paid
  const supplierInvoice2: SupplierInvoice = {
    id: crypto.randomUUID(),
    supplierId: alFardan.id,
    poId: po1.id,
    invoiceNumber: 'INV-AF-7742',
    amountMoney: invoice2Amount,
    paidMoney: invoice2Paid,
    status: 'partial',
    dueDate: daysAgoIso(-5), // due in 5 days
    createdAt: daysAgoIso(30),
  }

  const invoice3Amount = toMoney(6_500)
  const supplierInvoice3: SupplierInvoice = {
    id: crypto.randomUUID(),
    supplierId: sharaf.id,
    invoiceNumber: 'INV-SP-0219',
    amountMoney: invoice3Amount,
    paidMoney: 0,
    status: 'unpaid',
    dueDate: daysAgoIso(-15), // due in 15 days
    createdAt: daysAgoIso(4),
  }

  const supplierInvoices: SupplierInvoice[] = [supplierInvoice1, supplierInvoice2, supplierInvoice3]

  return { suppliers, purchaseOrders, goodsReceipts, supplierInvoices }
}
