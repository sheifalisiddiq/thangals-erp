import { seedBranches } from '@/data/seed-branches'
import { seedInventory } from '@/data/seed-inventory'
import type { InventoryItem, PhysicalCount, StockMovement } from '@/lib/domain-types'
import { getSlice, updateSlice, useSlice } from '@/lib/store'

export interface InventorySlice {
  items: InventoryItem[]
  movements: StockMovement[]
  physicalCounts: PhysicalCount[]
}

/** Lazily seeds the inventory slice on first read, mirroring settings.ts's pattern. Depends on
 * branches, but falls back to seeding its own branches if that slice somehow isn't there yet
 * (defensive — in practice `src/lib/stores/branches.ts` seeds eagerly at module load). */
export function ensureInventorySeeded(): void {
  if (!getSlice('inventory')) {
    const branches = getSlice('branches') ?? seedBranches()
    updateSlice('inventory', () => seedInventory(branches))
  }
}

ensureInventorySeeded()

export function getInventory(): InventorySlice {
  ensureInventorySeeded()
  return getSlice('inventory') as InventorySlice
}

export function useInventory(): InventorySlice {
  ensureInventorySeeded()
  return (useSlice('inventory') as InventorySlice) ?? { items: [], movements: [], physicalCounts: [] }
}

/** Manual item creation isn't a cross-module posting — just append to inventory.items directly
 * (not through ledger.ts, which is reserved for postings that touch multiple slices). */
export function addInventoryItem(item: Omit<InventoryItem, 'id' | 'createdAt'>): InventoryItem {
  const newItem: InventoryItem = { ...item, id: crypto.randomUUID(), createdAt: new Date().toISOString() }
  updateSlice('inventory', (draft) => {
    const base = draft ?? { items: [], movements: [], physicalCounts: [] }
    return { ...base, items: [...base.items, newItem] }
  })
  return newItem
}
