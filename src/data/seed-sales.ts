import { addMoney, fromGrams, mulMoneyByBp, subMoney, sumMoney, toMoney, type Money } from '@/lib/decimal'
import type { Branch, Customer, SalesInvoice, SalesInvoiceLine } from '@/lib/domain-types'

function daysAgoIso(days: number): string {
  return new Date(Date.now() - days * 86_400_000).toISOString()
}

// Historical seed rows use a hardcoded ~5% VAT rate (matches the default TaxConfig at the time
// this demo data was authored) since seed data is static and doesn't read live settings.
const SEED_TAX_BP = 500

function makeLine(
  description: string,
  grams: number,
  ratePerGramAED: number,
  makingChargeBp: number,
  stoneChargeAED = 0,
  discountAED = 0,
): SalesInvoiceLine {
  const weightMg = fromGrams(grams)
  const ratePerGramMoney = toMoney(ratePerGramAED)
  const metalValueMoney: Money = Math.round(ratePerGramMoney * grams)
  const makingChargeMoney: Money = mulMoneyByBp(metalValueMoney, makingChargeBp)
  const stoneChargeMoney: Money = toMoney(stoneChargeAED)
  const discountMoney: Money = toMoney(discountAED)
  const lineTotalMoney = subMoney(addMoney(metalValueMoney, makingChargeMoney, stoneChargeMoney), discountMoney)
  return {
    id: crypto.randomUUID(),
    itemId: crypto.randomUUID(), // historical snapshot — doesn't need to resolve to a live InventoryItem
    description,
    weightMg,
    ratePerGramMoney,
    metalValueMoney,
    makingChargeMoney,
    stoneChargeMoney,
    discountMoney,
    lineTotalMoney,
  }
}

function makeInvoice(invoiceNumber: string, customerId: string, branchId: string, lines: SalesInvoiceLine[], createdDaysAgo: number): SalesInvoice {
  const subtotalMoney = sumMoney(lines.map((l) => l.lineTotalMoney))
  const taxMoney = mulMoneyByBp(subtotalMoney, SEED_TAX_BP)
  const totalMoney = addMoney(subtotalMoney, taxMoney)
  const id = crypto.randomUUID()
  return {
    id,
    invoiceNumber,
    customerId,
    branchId,
    lines,
    subtotalMoney,
    taxMoney,
    totalMoney,
    paidMoney: totalMoney, // fully paid, historical
    status: 'paid',
    postedRef: `sale:${id}`,
    createdAt: daysAgoIso(createdDaysAgo),
  }
}

/** 5-6 fictional UAE retail customers plus 2-3 historical, already-paid invoices (so Sales
 * History shows something from day one). Invoice lines carry their own itemId (randomly
 * generated, not resolved against live inventory — these are historical snapshots; the UI
 * falls back to the line's own stored description when the itemId doesn't match a live item). */
export function seedSales(branches: Branch[]): { customers: Customer[]; invoices: SalesInvoice[] } {
  const deira = branches.find((b) => b.code === 'DXB-DS') ?? branches[0]
  const dubaiMall = branches.find((b) => b.code === 'DXB-DM') ?? branches[1] ?? branches[0]

  const customers: Customer[] = [
    {
      id: crypto.randomUUID(),
      name: 'Fatima Al Mansouri',
      phone: '+971 50 123 4567',
      address: 'Villa 22, Al Barsha 2, Dubai',
      openingBalanceMoney: toMoney(0),
    },
    {
      id: crypto.randomUUID(),
      name: 'Rashid Hamdan',
      phone: '+971 55 234 5678',
      address: 'Apt 904, Marina Heights, Dubai Marina, Dubai',
      openingBalanceMoney: toMoney(0),
    },
    {
      id: crypto.randomUUID(),
      name: 'Priya Nambiar',
      phone: '+971 52 345 6789',
      address: 'Villa 7, Al Mizhar 1, Dubai',
      openingBalanceMoney: toMoney(1_200),
    },
    {
      id: crypto.randomUUID(),
      name: 'Mohammed Al Suwaidi',
      phone: '+971 50 456 7890',
      address: 'Flat 1203, Al Majaz Towers, Sharjah',
      openingBalanceMoney: toMoney(0),
    },
    {
      id: crypto.randomUUID(),
      name: 'Aisha Khan',
      phone: '+971 56 567 8901',
      address: 'Villa 14, Jumeirah Village Circle, Dubai',
      openingBalanceMoney: toMoney(0),
    },
    {
      id: crypto.randomUUID(),
      name: 'Walk-in Customer',
      phone: '+971 00 000 0000',
      address: 'N/A',
      openingBalanceMoney: toMoney(0),
    },
  ]

  const [fatima, rashid, priya] = customers

  const invoice1 = makeInvoice(
    'INV-2026-0001',
    fatima.id,
    deira.id,
    [makeLine('22K Gold Necklace Set', 24.5, 246, 1200, 0, 0)],
    25,
  )

  const invoice2 = makeInvoice(
    'INV-2026-0002',
    rashid.id,
    dubaiMall.id,
    [
      makeLine('21K Gold Bangle (pair)', 32, 235, 1000, 0, 500),
      makeLine('22K Gold Chain', 18, 246, 900, 0, 0),
    ],
    14,
  )

  const invoice3 = makeInvoice(
    'INV-2026-0003',
    priya.id,
    deira.id,
    [makeLine('18K Diamond Ring', 6.2, 198, 1500, 2_800, 0)],
    6,
  )

  const invoices: SalesInvoice[] = [invoice1, invoice2, invoice3]

  return { customers, invoices }
}
