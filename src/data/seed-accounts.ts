import type { Account } from '@/lib/domain-types'

export function seedAccounts(): Account[] {
  return [
    { id: crypto.randomUUID(), code: '1000', name: 'Cash', type: 'asset' },
    { id: crypto.randomUUID(), code: '1010', name: 'Bank', type: 'asset' },
    { id: crypto.randomUUID(), code: '1100', name: 'Accounts Receivable', type: 'asset' },
    { id: crypto.randomUUID(), code: '1200', name: 'Inventory Asset', type: 'asset' },
    { id: crypto.randomUUID(), code: '1300', name: 'Fixed Assets', type: 'asset' },
    { id: crypto.randomUUID(), code: '2000', name: 'Accounts Payable', type: 'liability' },
    { id: crypto.randomUUID(), code: '2100', name: 'Tax Payable', type: 'liability' },
    { id: crypto.randomUUID(), code: '3000', name: "Owner's Equity", type: 'equity' },
    { id: crypto.randomUUID(), code: '4000', name: 'Sales Income', type: 'income' },
    { id: crypto.randomUUID(), code: '4100', name: 'Making Charge Income', type: 'income' },
    { id: crypto.randomUUID(), code: '5000', name: 'Cost of Goods Sold', type: 'expense' },
    { id: crypto.randomUUID(), code: '5100', name: 'Wastage Expense', type: 'expense' },
  ]
}
