import { ArrowDownRight, ArrowUpRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { formatAED } from '@/lib/format'

export function KpiCard({
  label,
  value,
  deltaPct,
  good,
}: {
  label: string
  value: number
  deltaPct: number
  good: boolean
}) {
  const positive = good
  const up = deltaPct >= 0
  return (
    <Card>
      <CardContent className="pt-5">
        <p className="text-xs font-medium text-slate-green">{label}</p>
        <p className="mt-2 tabular-nums text-2xl font-semibold text-charcoal">{formatAED(value)}</p>
        <div
          className={`mt-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
            positive ? 'bg-success-bg text-success' : 'bg-error-bg text-error'
          }`}
        >
          {up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
          <span className="tabular-nums">{Math.abs(deltaPct).toFixed(1)}%</span>
          <span className="font-normal text-slate-green">vs last month</span>
        </div>
      </CardContent>
    </Card>
  )
}
