import { seedBranches } from '@/data/seed-branches'
import type { Branch } from '@/lib/domain-types'
import { getSlice, updateSlice, useSlice } from '@/lib/store'

// Seed the branches slice once at module load (before any render), mirroring settings.ts's
// pattern — so getBranches/useBranches never need to lazily mutate the store mid-render.
if (!getSlice('branches')) {
  updateSlice('branches', () => seedBranches())
}

export function getBranches(): Branch[] {
  return getSlice('branches') ?? []
}

export function useBranches(): Branch[] {
  return useSlice('branches') ?? []
}

export function getBranchName(branchId: string): string {
  return getBranches().find((b) => b.id === branchId)?.name ?? 'Unknown branch'
}
