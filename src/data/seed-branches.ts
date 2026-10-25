import type { Branch } from '@/lib/domain-types'

export function seedBranches(): Branch[] {
  return [
    { id: crypto.randomUUID(), name: 'Deira Gold Souk', code: 'DXB-DS', isVault: false },
    { id: crypto.randomUUID(), name: 'Dubai Mall', code: 'DXB-DM', isVault: false },
    { id: crypto.randomUUID(), name: 'Central Vault', code: 'VLT-01', isVault: true },
  ]
}
