import {
  LayoutDashboard,
  Users,
  Gem,
  Building2,
  Coins,
  Warehouse,
  Truck,
  Repeat,
  Hammer,
  BadgeCheck,
  Wrench,
  PackageCheck,
  Banknote,
  Gift,
  ShoppingBag,
  UserCog,
  FileBarChart,
  Settings,
  type LucideIcon,
} from 'lucide-react'

export type ModuleId =
  | 'overview' | 'crm' | 'retail-sales' | 'wholesale' | 'bullion' | 'inventory' | 'purchases'
  | 'old-gold' | 'manufacturing' | 'quality' | 'repairs' | 'dispatch' | 'finance' | 'savings'
  | 'ecommerce' | 'employees' | 'reports' | 'admin'

export interface NavGroup {
  id: ModuleId
  label: string
  path: string
  icon: LucideIcon
  status: 'active' | 'planned'
}

export const NAV_GROUPS: NavGroup[] = [
  { id: 'overview', label: 'Overview', path: '/dashboard', icon: LayoutDashboard, status: 'active' },
  { id: 'crm', label: 'Customers & CRM', path: '/crm', icon: Users, status: 'planned' },
  { id: 'retail-sales', label: 'Retail Sales', path: '/retail-sales', icon: Gem, status: 'active' },
  { id: 'wholesale', label: 'Wholesale & Dealers', path: '/wholesale', icon: Building2, status: 'planned' },
  { id: 'bullion', label: 'Bullion Trading', path: '/bullion', icon: Coins, status: 'planned' },
  { id: 'inventory', label: 'Inventory & Vault', path: '/inventory', icon: Warehouse, status: 'active' },
  { id: 'purchases', label: 'Purchases & Suppliers', path: '/purchases', icon: Truck, status: 'active' },
  { id: 'old-gold', label: 'Old Gold & Exchanges', path: '/old-gold', icon: Repeat, status: 'planned' },
  { id: 'manufacturing', label: 'Manufacturing & Karigars', path: '/manufacturing', icon: Hammer, status: 'planned' },
  { id: 'quality', label: 'Quality & Hallmarking', path: '/quality', icon: BadgeCheck, status: 'planned' },
  { id: 'repairs', label: 'Repairs & Alterations', path: '/repairs', icon: Wrench, status: 'planned' },
  { id: 'dispatch', label: 'Dispatch & Transfers', path: '/dispatch', icon: PackageCheck, status: 'planned' },
  { id: 'finance', label: 'Finance & Accounting', path: '/finance', icon: Banknote, status: 'active' },
  { id: 'savings', label: 'Savings Schemes & Loyalty', path: '/savings', icon: Gift, status: 'planned' },
  { id: 'ecommerce', label: 'E-commerce & Catalogue', path: '/ecommerce', icon: ShoppingBag, status: 'planned' },
  { id: 'employees', label: 'Employees & Payroll', path: '/employees', icon: UserCog, status: 'planned' },
  { id: 'reports', label: 'Reports & Audit', path: '/reports', icon: FileBarChart, status: 'planned' },
  { id: 'admin', label: 'Administration', path: '/admin', icon: Settings, status: 'planned' },
]
