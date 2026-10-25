import { AlertTriangle, Info, OctagonAlert } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/shared/status-badge'
import {
  BRANCH_COMPARISON,
  BULLION_EXPOSURE,
  CASH_BANK,
  DASHBOARD_META,
  GOLD_HOLDINGS,
  INVENTORY_VALUE,
  KPI_CARDS,
  PENDING_ALERTS,
  PRODUCTION_SUMMARY,
  QUICK_ACTIONS,
  RECENT_TRANSACTIONS,
  type AlertSeverity,
} from '@/lib/demo-data'
import { formatAED, formatDateTime, formatGrams, formatPercent } from '@/lib/format'
import { KpiCard } from './kpi-card'
import { SalesTrendChart } from './sales-trend-chart'
import { ChannelBars } from './channel-bars'

const ALERT_ICON: Record<AlertSeverity, typeof Info> = {
  error: OctagonAlert,
  warning: AlertTriangle,
  info: Info,
}
const ALERT_COLOR: Record<AlertSeverity, string> = {
  error: 'text-error',
  warning: 'text-warning',
  info: 'text-info',
}

export function OwnerDashboard() {
  const totalFineGold = GOLD_HOLDINGS.reduce((sum, g) => sum + g.fineGoldEquivGrams, 0)

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-semibold text-charcoal">Owner Overview</h2>
          <p className="text-sm text-slate-green">Consolidated view across all branches and channels.</p>
        </div>
        <p className="text-xs text-slate-green">
          Gold rate as of <span className="font-medium text-charcoal">{formatDateTime(DASHBOARD_META.asOf)}</span> ·{' '}
          24K {formatAED(DASHBOARD_META.goldRateAED['24K'])}/g
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {KPI_CARDS.map((k) => (
          <KpiCard key={k.id} label={k.label} value={k.value} deltaPct={k.deltaPct} good={k.good} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Sales Trend — This Month</CardTitle>
            <span className="text-xs text-slate-green">AED</span>
          </CardHeader>
          <CardContent>
            <SalesTrendChart />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sales by Channel</CardTitle>
          </CardHeader>
          <CardContent>
            <ChannelBars />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Cash &amp; Bank Balances</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {CASH_BANK.map((c) => (
              <div key={c.label} className="flex items-center justify-between text-sm">
                <span className="text-slate-green">{c.label}</span>
                <span className="tabular-nums font-medium text-charcoal">{formatAED(c.value)}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Gold Holdings by Purity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {GOLD_HOLDINGS.map((g) => (
              <div key={g.purity} className="flex items-center justify-between text-sm">
                <span className="text-slate-green">{g.purity} Gold</span>
                <span className="tabular-nums font-medium text-charcoal">{formatGrams(g.grams)}</span>
              </div>
            ))}
            <div className="mt-2 flex items-center justify-between border-t border-border-soft pt-2 text-sm">
              <span className="font-medium text-charcoal">Fine Gold Equivalent</span>
              <span className="tabular-nums font-semibold text-brand-emerald">{formatGrams(totalFineGold)}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Inventory Valuation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-green">Stock Cost</span>
              <span className="tabular-nums font-medium text-charcoal">{formatAED(INVENTORY_VALUE.costAED)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-green">Current Reference Value</span>
              <span className="tabular-nums font-medium text-charcoal">
                {formatAED(INVENTORY_VALUE.referenceValueAED)}
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between border-t border-border-soft pt-2 text-sm">
              <span className="font-medium text-charcoal">Unrealized Gain</span>
              <span className="tabular-nums font-semibold text-success">
                {formatAED(INVENTORY_VALUE.referenceValueAED - INVENTORY_VALUE.costAED)}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Branch Comparison</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full min-w-[520px] text-sm">
            <thead>
              <tr className="border-b border-border-soft text-left text-xs text-slate-green">
                <th className="py-2 font-medium">Branch</th>
                <th className="py-2 font-medium">Staff</th>
                <th className="py-2 text-right font-medium">Sales (MTD)</th>
                <th className="py-2 text-right font-medium">Target</th>
                <th className="py-2 text-right font-medium">Attainment</th>
              </tr>
            </thead>
            <tbody>
              {BRANCH_COMPARISON.map((b) => (
                <tr key={b.branch} className="border-b border-border-soft last:border-0">
                  <td className="py-2.5 font-medium text-charcoal">{b.branch}</td>
                  <td className="py-2.5 tabular-nums text-slate-green">{b.staff}</td>
                  <td className="py-2.5 text-right tabular-nums text-charcoal">{formatAED(b.sales)}</td>
                  <td className="py-2.5 text-right tabular-nums text-slate-green">{formatAED(b.target)}</td>
                  <td className="py-2.5 text-right tabular-nums font-medium text-brand-emerald">
                    {formatPercent((b.sales / b.target) * 100, 0)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Production &amp; Wastage</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-slate-green">In Progress Orders</span><span className="tabular-nums font-medium text-charcoal">{PRODUCTION_SUMMARY.inProgressOrders}</span></div>
            <div className="flex justify-between"><span className="text-slate-green">Completed This Month</span><span className="tabular-nums font-medium text-charcoal">{PRODUCTION_SUMMARY.completedThisMonth}</span></div>
            <div className="flex justify-between"><span className="text-slate-green">Wastage</span><span className="tabular-nums font-medium text-warning">{formatPercent(PRODUCTION_SUMMARY.wastagePct)}</span></div>
            <div className="flex justify-between"><span className="text-slate-green">Recovery</span><span className="tabular-nums font-medium text-success">{formatPercent(PRODUCTION_SUMMARY.recoveryPct)}</span></div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Bullion Exposure</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-slate-green">Open Position</span><span className="tabular-nums font-medium text-charcoal">{formatGrams(BULLION_EXPOSURE.openPositionGrams)}</span></div>
            <div className="flex justify-between"><span className="text-slate-green">Unsettled Trades</span><span className="tabular-nums font-medium text-charcoal">{BULLION_EXPOSURE.unsettledTrades}</span></div>
            <div className="flex justify-between"><span className="text-slate-green">Exposure Value</span><span className="tabular-nums font-medium text-charcoal">{formatAED(BULLION_EXPOSURE.exposureAED)}</span></div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pending Approvals &amp; Alerts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {PENDING_ALERTS.map((a) => {
              const Icon = ALERT_ICON[a.severity]
              return (
                <div key={a.id} className="flex items-start gap-2 text-sm">
                  <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${ALERT_COLOR[a.severity]}`} />
                  <span className="text-charcoal">{a.label}</span>
                </div>
              )
            })}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-border-soft text-left text-xs text-slate-green">
                <th className="py-2 font-medium">Reference</th>
                <th className="py-2 font-medium">Type</th>
                <th className="py-2 font-medium">Party</th>
                <th className="py-2 font-medium">Branch</th>
                <th className="py-2 text-right font-medium">Amount</th>
                <th className="py-2 text-right font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {RECENT_TRANSACTIONS.map((t) => (
                <tr key={t.id} className="border-b border-border-soft last:border-0">
                  <td className="py-2.5 font-medium text-charcoal">{t.id}</td>
                  <td className="py-2.5 text-slate-green">{t.type}</td>
                  <td className="py-2.5 text-charcoal">{t.party}</td>
                  <td className="py-2.5 text-slate-green">{t.branch}</td>
                  <td className="py-2.5 text-right tabular-nums text-charcoal">{formatAED(t.amount)}</td>
                  <td className="py-2.5 text-right">
                    <StatusBadge status={t.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {QUICK_ACTIONS.map((action) => (
            <Button key={action} variant="secondary" size="sm">
              {action}
            </Button>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
