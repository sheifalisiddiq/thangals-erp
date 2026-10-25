// Role → capability map, derived line-by-line from THANGALS_SCOPE.md's 24 role sections.
// Every explicit "NO access to X" in the spec is modeled as a hard deny here (an omission from
// `modules`/`actions`), not left implicit. This is a frontend-only demo: these checks gate the
// UI only, there is no backend to enforce them — see the DemoBanner security disclaimer.

import type { ModuleId } from './nav'

export type Action = 'view' | 'create' | 'edit' | 'approve' | 'export' | 'post' | 'reverse' | 'cancel' | 'refund' | 'settle'

export interface RolePermission {
  roleId: string
  /** Modules this role sees in navigation. Portal roles get an empty list — they use /portal/* instead. */
  modules: ModuleId[]
  /** Per-module allowed actions. A module listed in `modules` with no entry here is view-only. */
  actions: Partial<Record<ModuleId, Action[]>>
  /** Can see margins, costs, receivables/payables, cash balances and other sensitive figures. */
  sensitiveFinance: boolean
  /** Dashboard renders with zero write affordances (used for Auditor). */
  dashboardReadOnly: boolean
}

const ALL_MODULES: ModuleId[] = [
  'overview', 'crm', 'retail-sales', 'wholesale', 'bullion', 'inventory', 'purchases',
  'old-gold', 'manufacturing', 'quality', 'repairs', 'dispatch', 'finance', 'savings',
  'ecommerce', 'employees', 'reports', 'admin',
]

const FULL_ACTIONS: Action[] = ['view', 'create', 'edit', 'approve', 'export', 'post', 'reverse', 'cancel', 'refund', 'settle']
const VIEW_EXPORT: Action[] = ['view', 'export']
const VIEW_ONLY: Action[] = ['view']
const CRUD: Action[] = ['view', 'create', 'edit']
const CRUD_APPROVE: Action[] = ['view', 'create', 'edit', 'approve']

export const ROLE_PERMISSIONS: Record<string, RolePermission> = {
  owner: {
    roleId: 'owner',
    modules: ALL_MODULES,
    actions: Object.fromEntries(ALL_MODULES.map((m) => [m, FULL_ACTIONS])),
    sensitiveFinance: true,
    dashboardReadOnly: false,
  },
  sysadmin: {
    roleId: 'sysadmin',
    modules: ALL_MODULES,
    actions: {
      admin: FULL_ACTIONS,
      ...Object.fromEntries(ALL_MODULES.filter((m) => m !== 'admin').map((m) => [m, VIEW_ONLY])),
    },
    // Spec: "financial/customer-data access only when separately authorized" — off by default.
    sensitiveFinance: false,
    dashboardReadOnly: false,
  },
  'branch-manager': {
    roleId: 'branch-manager',
    modules: ['overview', 'crm', 'retail-sales', 'wholesale', 'inventory', 'purchases', 'dispatch', 'repairs', 'finance', 'reports'],
    actions: {
      crm: CRUD,
      // CRUD_APPROVE plus 'reverse', added so a branch manager can reverse a confirmed
      // retail sale from the Invoices tab (Retail Sales' "Reverse" button is gated on 'reverse').
      'retail-sales': [...CRUD_APPROVE, 'reverse'],
      wholesale: CRUD_APPROVE,
      inventory: VIEW_ONLY,
      purchases: ['view', 'create'],
      dispatch: CRUD,
      repairs: VIEW_ONLY,
      finance: VIEW_ONLY,
      reports: VIEW_EXPORT,
    },
    sensitiveFinance: true,
    dashboardReadOnly: false,
  },
  receptionist: {
    roleId: 'receptionist',
    modules: ['overview', 'crm'],
    actions: { crm: CRUD },
    sensitiveFinance: false,
    dashboardReadOnly: true,
  },
  'retail-sales': {
    roleId: 'retail-sales',
    modules: ['overview', 'retail-sales', 'crm', 'inventory', 'old-gold'],
    actions: {
      // CRUD plus 'post', added so this role can record payments against its own sales
      // invoices (Retail Sales' "Record Payment" button is gated on the 'post' action).
      'retail-sales': [...CRUD, 'post'],
      crm: VIEW_ONLY,
      inventory: VIEW_ONLY,
      'old-gold': ['view', 'create'],
    },
    sensitiveFinance: false,
    dashboardReadOnly: true,
  },
  'wholesale-sales': {
    roleId: 'wholesale-sales',
    modules: ['overview', 'wholesale', 'crm', 'inventory'],
    actions: {
      wholesale: CRUD,
      crm: VIEW_ONLY,
      inventory: VIEW_ONLY,
    },
    sensitiveFinance: false,
    dashboardReadOnly: true,
  },
  cashier: {
    roleId: 'cashier',
    modules: ['overview', 'retail-sales', 'finance'],
    actions: {
      'retail-sales': ['view', 'create', 'post'],
      finance: ['view', 'create', 'post', 'refund'],
    },
    sensitiveFinance: false,
    dashboardReadOnly: true,
  },
  'inventory-controller': {
    roleId: 'inventory-controller',
    modules: ['overview', 'inventory', 'purchases', 'dispatch', 'manufacturing', 'quality'],
    actions: {
      inventory: CRUD_APPROVE,
      purchases: VIEW_ONLY,
      dispatch: ['view', 'create'],
      manufacturing: VIEW_ONLY,
      quality: VIEW_ONLY,
    },
    sensitiveFinance: false,
    dashboardReadOnly: true,
  },
  'purchase-executive': {
    roleId: 'purchase-executive',
    modules: ['overview', 'purchases', 'inventory', 'bullion'],
    actions: {
      purchases: [...CRUD, 'cancel', 'post'],
      inventory: VIEW_ONLY,
      bullion: VIEW_ONLY,
    },
    sensitiveFinance: false,
    dashboardReadOnly: true,
  },
  'bullion-trader': {
    roleId: 'bullion-trader',
    modules: ['overview', 'bullion', 'finance'],
    actions: {
      bullion: ['view', 'create', 'edit', 'cancel', 'settle'],
      finance: VIEW_ONLY,
    },
    sensitiveFinance: true,
    dashboardReadOnly: false,
  },
  assayer: {
    roleId: 'assayer',
    modules: ['overview', 'old-gold'],
    // Spec: "NO independent approval of own valuation" — 'approve' deliberately withheld.
    actions: { 'old-gold': CRUD },
    sensitiveFinance: false,
    dashboardReadOnly: true,
  },
  'production-manager': {
    roleId: 'production-manager',
    modules: ['overview', 'manufacturing', 'inventory', 'quality'],
    actions: {
      manufacturing: CRUD_APPROVE,
      inventory: VIEW_ONLY,
      quality: VIEW_ONLY,
    },
    sensitiveFinance: false,
    dashboardReadOnly: true,
  },
  karigar: {
    roleId: 'karigar',
    modules: ['overview', 'manufacturing'],
    actions: { manufacturing: ['view', 'edit'] },
    sensitiveFinance: false,
    dashboardReadOnly: true,
  },
  'qc-officer': {
    roleId: 'qc-officer',
    modules: ['overview', 'quality'],
    actions: { quality: CRUD_APPROVE },
    sensitiveFinance: false,
    dashboardReadOnly: true,
  },
  'repairs-executive': {
    roleId: 'repairs-executive',
    modules: ['overview', 'repairs', 'crm'],
    actions: { repairs: CRUD, crm: VIEW_ONLY },
    sensitiveFinance: false,
    dashboardReadOnly: true,
  },
  accountant: {
    roleId: 'accountant',
    modules: ['overview', 'finance', 'purchases', 'inventory', 'wholesale', 'bullion', 'manufacturing', 'savings', 'reports'],
    actions: {
      finance: FULL_ACTIONS,
      purchases: VIEW_ONLY,
      inventory: VIEW_ONLY,
      wholesale: VIEW_ONLY,
      bullion: VIEW_ONLY,
      manufacturing: VIEW_ONLY,
      savings: VIEW_ONLY,
      reports: VIEW_EXPORT,
    },
    sensitiveFinance: true,
    dashboardReadOnly: false,
  },
  'crm-executive': {
    roleId: 'crm-executive',
    modules: ['overview', 'crm', 'savings'],
    actions: { crm: CRUD, savings: VIEW_ONLY },
    sensitiveFinance: false,
    dashboardReadOnly: true,
  },
  'ecommerce-manager': {
    roleId: 'ecommerce-manager',
    modules: ['overview', 'ecommerce', 'inventory'],
    actions: { ecommerce: CRUD, inventory: VIEW_ONLY },
    sensitiveFinance: false,
    dashboardReadOnly: true,
  },
  'dispatch-executive': {
    roleId: 'dispatch-executive',
    modules: ['overview', 'dispatch', 'inventory'],
    actions: { dispatch: CRUD, inventory: VIEW_ONLY },
    sensitiveFinance: false,
    dashboardReadOnly: true,
  },
  'hr-payroll': {
    roleId: 'hr-payroll',
    modules: ['overview', 'employees'],
    actions: { employees: ['view', 'create', 'edit', 'approve', 'post'] },
    sensitiveFinance: false,
    dashboardReadOnly: true,
  },
  auditor: {
    roleId: 'auditor',
    modules: ALL_MODULES,
    actions: Object.fromEntries(ALL_MODULES.map((m) => [m, VIEW_EXPORT])),
    sensitiveFinance: true,
    dashboardReadOnly: true,
  },
  'customer-portal': { roleId: 'customer-portal', modules: [], actions: {}, sensitiveFinance: false, dashboardReadOnly: true },
  'supplier-portal': { roleId: 'supplier-portal', modules: [], actions: {}, sensitiveFinance: false, dashboardReadOnly: true },
  'karigar-portal': { roleId: 'karigar-portal', modules: [], actions: {}, sensitiveFinance: false, dashboardReadOnly: true },
}

function permissionFor(roleId: string): RolePermission {
  return ROLE_PERMISSIONS[roleId] ?? { roleId, modules: ['overview'], actions: {}, sensitiveFinance: false, dashboardReadOnly: true }
}

export function visibleModules(roleId: string): ModuleId[] {
  return permissionFor(roleId).modules
}

export function canSeeModule(roleId: string, moduleId: ModuleId): boolean {
  return permissionFor(roleId).modules.includes(moduleId)
}

export function can(roleId: string, moduleId: ModuleId, action: Action): boolean {
  const perm = permissionFor(roleId)
  if (!perm.modules.includes(moduleId)) return false
  const allowed = perm.actions[moduleId]
  if (!allowed) return action === 'view'
  return allowed.includes(action)
}

export function canSeeSensitiveFinance(roleId: string): boolean {
  return permissionFor(roleId).sensitiveFinance
}

export function isDashboardReadOnly(roleId: string): boolean {
  return permissionFor(roleId).dashboardReadOnly
}
