export interface Role {
  id: string
  label: string
  category: 'Internal' | 'Portal'
}

export const ROLES: Role[] = [
  { id: 'owner', label: 'Owner / Super Admin', category: 'Internal' },
  { id: 'sysadmin', label: 'System Administrator', category: 'Internal' },
  { id: 'branch-manager', label: 'Branch / Showroom Manager', category: 'Internal' },
  { id: 'receptionist', label: 'Receptionist / Front Desk Executive', category: 'Internal' },
  { id: 'retail-sales', label: 'Retail Sales Executive', category: 'Internal' },
  { id: 'wholesale-sales', label: 'Wholesale Sales Executive', category: 'Internal' },
  { id: 'cashier', label: 'Cashier / Billing Executive', category: 'Internal' },
  { id: 'inventory-controller', label: 'Inventory / Vault Controller', category: 'Internal' },
  { id: 'purchase-executive', label: 'Purchase / Procurement Executive', category: 'Internal' },
  { id: 'bullion-trader', label: 'Bullion Trading Executive', category: 'Internal' },
  { id: 'assayer', label: 'Gold Assayer / Exchange Evaluator', category: 'Internal' },
  { id: 'production-manager', label: 'Production / Manufacturing Manager', category: 'Internal' },
  { id: 'karigar', label: 'Karigar / Artisan', category: 'Internal' },
  { id: 'qc-officer', label: 'Quality Control / Hallmarking Officer', category: 'Internal' },
  { id: 'repairs-executive', label: 'Repairs / Alterations Executive', category: 'Internal' },
  { id: 'accountant', label: 'Accountant / Finance Manager', category: 'Internal' },
  { id: 'crm-executive', label: 'CRM / Customer Service Executive', category: 'Internal' },
  { id: 'ecommerce-manager', label: 'E-commerce / Catalogue Manager', category: 'Internal' },
  { id: 'dispatch-executive', label: 'Dispatch / Logistics Executive', category: 'Internal' },
  { id: 'hr-payroll', label: 'HR / Payroll Manager', category: 'Internal' },
  { id: 'auditor', label: 'Auditor / Compliance Officer', category: 'Internal' },
  { id: 'customer-portal', label: 'Customer / Dealer Portal User', category: 'Portal' },
  { id: 'supplier-portal', label: 'Supplier Portal User', category: 'Portal' },
  { id: 'karigar-portal', label: 'External Karigar / Job Worker Portal User', category: 'Portal' },
]

export const DEMO_PASSWORD = 'demo123'
