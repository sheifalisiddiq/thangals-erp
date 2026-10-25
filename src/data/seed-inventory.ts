import { fromGrams, toMoney } from '@/lib/decimal'
import type { Branch, InventoryItem, PhysicalCount, StockMovement } from '@/lib/domain-types'

function daysAgoIso(days: number): string {
  return new Date(Date.now() - days * 86_400_000).toISOString()
}

/** 10-14 realistic fictional jewellery items spread across branches, with varied status/ownership. */
export function seedInventory(branches: Branch[]): {
  items: InventoryItem[]
  movements: StockMovement[]
  physicalCounts: PhysicalCount[]
} {
  const deira = branches.find((b) => b.code === 'DXB-DS') ?? branches[0]
  const dubaiMall = branches.find((b) => b.code === 'DXB-DM') ?? branches[1]
  const vault = branches.find((b) => b.isVault) ?? branches[branches.length - 1]

  type Seed = Omit<InventoryItem, 'id' | 'createdAt' | 'grossWeightMg' | 'stoneWeightMg' | 'netWeightMg' | 'costPricePerGramMoney'> & {
    grossGrams: number
    stoneGrams: number
    netGrams: number
    costPerGramAED: number
    ageDays: number
  }

  const seeds: Seed[] = [
    {
      sku: 'RG-22K-001', name: '22K Gold Solitaire-Style Ring', category: 'Rings', karat: 22,
      grossGrams: 8.5, stoneGrams: 0.3, netGrams: 8.2, costPerGramAED: 245,
      branchId: deira.id, ownership: 'company', status: 'in-stock', makingChargeBp: 1200, ageDays: 40,
    },
    {
      sku: 'NK-21K-002', name: '21K Gold Chandni Necklace', category: 'Necklaces', karat: 21,
      grossGrams: 25, stoneGrams: 1.2, netGrams: 23.8, costPerGramAED: 234, stoneDetails: 'Polki stones, 1.2g',
      branchId: deira.id, ownership: 'company', status: 'in-stock', makingChargeBp: 1500, ageDays: 55,
    },
    {
      sku: 'BG-22K-003', name: '22K Gold Bangle Pair (Plain)', category: 'Bangles', karat: 22,
      grossGrams: 18, stoneGrams: 0, netGrams: 18, costPerGramAED: 246,
      branchId: dubaiMall.id, ownership: 'company', status: 'in-stock', makingChargeBp: 900, ageDays: 30,
    },
    {
      sku: 'ER-18K-004', name: '18K Gold Diamond Drop Earrings', category: 'Earrings', karat: 18,
      grossGrams: 4.2, stoneGrams: 0.4, netGrams: 3.8, costPerGramAED: 198, stoneDetails: 'Diamond, 0.4g, VS clarity',
      branchId: dubaiMall.id, ownership: 'company', status: 'in-stock', makingChargeBp: 1800, ageDays: 20,
    },
    {
      sku: 'NS-22K-005', name: '22K Gold Bridal Necklace Set', category: 'Necklaces', karat: 22,
      grossGrams: 45, stoneGrams: 3.5, netGrams: 41.5, costPerGramAED: 246, stoneDetails: 'Ruby & pearl accents, 3.5g',
      branchId: vault.id, ownership: 'company', status: 'in-stock', makingChargeBp: 1600, ageDays: 65,
    },
    {
      sku: 'RG-18K-006', name: '18K Gold Diamond Solitaire Ring', category: 'Rings', karat: 18,
      grossGrams: 3.1, stoneGrams: 0.6, netGrams: 2.5, costPerGramAED: 200, stoneDetails: 'Diamond, 0.6g, VVS',
      branchId: dubaiMall.id, ownership: 'company', status: 'reserved', makingChargeBp: 2000, ageDays: 12,
    },
    {
      sku: 'BG-21K-007', name: '21K Gold Bangle Pair (Antique)', category: 'Bangles', karat: 21,
      grossGrams: 20, stoneGrams: 0, netGrams: 20, costPerGramAED: 235,
      branchId: deira.id, ownership: 'company', status: 'sold', makingChargeBp: 1100, ageDays: 70,
    },
    {
      sku: 'CH-22K-008', name: '22K Gold Rope Chain', category: 'Chains', karat: 22,
      grossGrams: 12.5, stoneGrams: 0, netGrams: 12.5, costPerGramAED: 246,
      branchId: vault.id, ownership: 'company', status: 'in-stock', makingChargeBp: 800, ageDays: 25,
    },
    {
      sku: 'PD-14K-009', name: '14K Gold Pendant (Customer Repair Custody)', category: 'Pendants', karat: 14,
      grossGrams: 2.8, stoneGrams: 0.2, netGrams: 2.6, costPerGramAED: 155,
      branchId: dubaiMall.id, ownership: 'customer', status: 'in-stock', makingChargeBp: 0, ageDays: 5,
    },
    {
      sku: 'RG-22K-010', name: '22K Gold Ring (Supplier Consignment)', category: 'Rings', karat: 22,
      grossGrams: 6, stoneGrams: 0, netGrams: 6, costPerGramAED: 247,
      branchId: deira.id, ownership: 'supplier-consignment', status: 'in-stock', makingChargeBp: 1000, ageDays: 15,
    },
    {
      sku: 'ER-21K-011', name: '21K Gold Earrings (QC Hold)', category: 'Earrings', karat: 21,
      grossGrams: 5.5, stoneGrams: 0.5, netGrams: 5, costPerGramAED: 235, stoneDetails: 'Pending re-hallmark check',
      branchId: vault.id, ownership: 'company', status: 'quarantined', makingChargeBp: 1300, ageDays: 8,
    },
    {
      sku: 'BR-18K-012', name: '18K Gold Diamond Tennis Bracelet', category: 'Bracelets', karat: 18,
      grossGrams: 9, stoneGrams: 2, netGrams: 7, costPerGramAED: 200, stoneDetails: 'Diamonds, 2.0g total',
      branchId: dubaiMall.id, ownership: 'company', status: 'in-stock', makingChargeBp: 1900, ageDays: 18,
    },
    {
      sku: 'NK-24K-013', name: '24K Gold Coin Pendant Necklace', category: 'Necklaces', karat: 24,
      grossGrams: 15, stoneGrams: 0, netGrams: 15, costPerGramAED: 268,
      branchId: vault.id, ownership: 'company', status: 'in-stock', makingChargeBp: 500, ageDays: 45,
    },
    {
      sku: 'BG-22K-014', name: '22K Gold Bangle (Single, Engraved)', category: 'Bangles', karat: 22,
      grossGrams: 16, stoneGrams: 0, netGrams: 16, costPerGramAED: 246,
      branchId: deira.id, ownership: 'company', status: 'sold', makingChargeBp: 1000, ageDays: 60,
    },
  ]

  const items: InventoryItem[] = []
  const movements: StockMovement[] = []

  for (const s of seeds) {
    const id = crypto.randomUUID()
    const createdAt = daysAgoIso(s.ageDays)
    const item: InventoryItem = {
      id,
      sku: s.sku,
      name: s.name,
      category: s.category,
      karat: s.karat,
      grossWeightMg: fromGrams(s.grossGrams),
      stoneWeightMg: fromGrams(s.stoneGrams),
      netWeightMg: fromGrams(s.netGrams),
      stoneDetails: s.stoneDetails,
      branchId: s.branchId,
      ownership: s.ownership,
      status: s.status,
      makingChargeBp: s.makingChargeBp,
      costPricePerGramMoney: toMoney(s.costPerGramAED),
      createdAt,
    }
    items.push(item)
    movements.push({
      id: crypto.randomUUID(),
      itemId: id,
      type: 'receipt',
      branchId: s.branchId,
      refType: 'po',
      refId: crypto.randomUUID(),
      note: 'Initial stock-in (seed data)',
      postedAt: createdAt,
    })
  }

  return { items, movements, physicalCounts: [] }
}
