export const DASHBOARD_META = {
  asOf: '2026-10-25T09:15:00+04:00',
  goldRateAED: { '24K': 316.4, '22K': 290.1, '21K': 276.9, '18K': 237.3 },
  branches: ['All Branches', 'Deira Gold Souk', 'Dubai Mall', 'Abu Dhabi Marina', 'Sharjah City Centre'],
  channels: ['All Channels', 'Retail', 'Wholesale', 'Bullion', 'Online'],
}

export const KPI_CARDS = [
  { id: 'sales', label: 'Sales (MTD)', value: 4_286_500, deltaPct: 12.4, good: true },
  { id: 'collections', label: 'Collections (MTD)', value: 3_914_200, deltaPct: 8.1, good: true },
  { id: 'receivables', label: 'Outstanding Receivables', value: 1_042_300, deltaPct: -4.6, good: true },
  { id: 'gross-profit', label: 'Gross Profit (MTD)', value: 712_900, deltaPct: 6.9, good: true },
]

export const CASH_BANK = [
  { label: 'Cash in Hand', value: 186_400 },
  { label: 'Bank — ENBD Current', value: 2_240_000 },
  { label: 'Bank — ADCB Current', value: 980_500 },
  { label: 'Payment Gateway (pending settlement)', value: 64_250 },
]

export const GOLD_HOLDINGS = [
  { purity: '24K', grams: 18_420, fineGoldEquivGrams: 18_420 },
  { purity: '22K', grams: 46_980, fineGoldEquivGrams: 43_065 },
  { purity: '21K', grams: 12_150, fineGoldEquivGrams: 10_631 },
  { purity: '18K', grams: 5_640, fineGoldEquivGrams: 4_230 },
]

export const INVENTORY_VALUE = {
  costAED: 9_842_000,
  referenceValueAED: 11_206_500,
}

export const CHANNEL_SALES = [
  { channel: 'Retail', value: 2_310_000 },
  { channel: 'Wholesale', value: 1_180_000 },
  { channel: 'Bullion', value: 540_500 },
  { channel: 'Online', value: 256_000 },
]

export const SALES_TREND = [
  { day: '1', value: 118_000 },
  { day: '4', value: 142_500 },
  { day: '7', value: 129_000 },
  { day: '10', value: 168_200 },
  { day: '13', value: 151_400 },
  { day: '16', value: 182_900 },
  { day: '19', value: 176_300 },
  { day: '22', value: 204_600 },
  { day: '25', value: 191_800 },
]

export const BRANCH_COMPARISON = [
  { branch: 'Deira Gold Souk', sales: 1_640_200, target: 1_500_000, staff: 14 },
  { branch: 'Dubai Mall', sales: 1_320_900, target: 1_400_000, staff: 11 },
  { branch: 'Abu Dhabi Marina', sales: 842_600, target: 800_000, staff: 8 },
  { branch: 'Sharjah City Centre', sales: 482_800, target: 550_000, staff: 6 },
]

export const PRODUCTION_SUMMARY = {
  inProgressOrders: 36,
  completedThisMonth: 142,
  wastagePct: 2.8,
  recoveryPct: 96.1,
}

export const BULLION_EXPOSURE = {
  openPositionGrams: 8_420,
  unsettledTrades: 6,
  exposureAED: 2_662_800,
}

export type AlertSeverity = 'warning' | 'error' | 'info'

export const PENDING_ALERTS: { id: string; label: string; severity: AlertSeverity }[] = [
  { id: 'a1', label: '3 stock discrepancies awaiting review — Dubai Mall', severity: 'error' },
  { id: 'a2', label: '7 purchase orders pending approval', severity: 'warning' },
  { id: 'a3', label: '5 repair orders overdue for delivery', severity: 'warning' },
  { id: 'a4', label: 'Gold rate refreshed 15 minutes ago', severity: 'info' },
]

export type TxStatus = 'posted' | 'pending' | 'draft'

export const RECENT_TRANSACTIONS: {
  id: string
  type: string
  party: string
  branch: string
  amount: number
  status: TxStatus
}[] = [
  { id: 'INV-20431', type: 'Retail Sale', party: 'Fatima Al Suwaidi', branch: 'Dubai Mall', amount: 18_240, status: 'posted' },
  { id: 'PO-10822', type: 'Purchase Order', party: 'Al Etihad Bullion LLC', branch: 'Deira Gold Souk', amount: 412_000, status: 'pending' },
  { id: 'WS-9031', type: 'Wholesale Order', party: 'Noor Jewels Trading', branch: 'Sharjah City Centre', amount: 96_500, status: 'draft' },
  { id: 'REP-5521', type: 'Repair Collection', party: 'Hamdan Al Zaabi', branch: 'Abu Dhabi Marina', amount: 450, status: 'posted' },
  { id: 'BUL-2204', type: 'Bullion Settlement', party: 'Gulf Refinery FZE', branch: 'Deira Gold Souk', amount: 284_600, status: 'posted' },
]

export const QUICK_ACTIONS = [
  'New Sale Invoice',
  'New Purchase Order',
  'Stock Transfer Request',
  'Record Payment',
]
