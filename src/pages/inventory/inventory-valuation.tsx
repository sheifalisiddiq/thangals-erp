import { Can } from '@/components/can'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toGrams, type Money } from '@/lib/decimal'
import type { InventoryItem } from '@/lib/domain-types'
import { formatMoney } from '@/lib/format'
import { goldRateForKarat } from '@/lib/settings'

/** Summary card: total stock cost vs. total current reference value (gold-rate based), both
 * sensitive figures masked via <Can.Money> for roles without sensitiveFinance access. */
export function InventoryValuation({ items }: { items: InventoryItem[] }) {
  let totalCost: Money = 0
  let totalReference: Money = 0

  for (const item of items) {
    const grams = toGrams(item.netWeightMg)
    totalCost += Math.round(item.costPricePerGramMoney * grams)
    totalReference += Math.round(goldRateForKarat(item.karat) * grams)
  }

  const unrealized = totalReference - totalCost

  return (
    <Card>
      <CardHeader>
        <CardTitle>Inventory Valuation</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-slate-green">Stock Cost</span>
          <span className="tabular-nums font-medium text-charcoal">
            <Can.Money>{formatMoney(totalCost)}</Can.Money>
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-green">Current Reference Value</span>
          <span className="tabular-nums font-medium text-charcoal">
            <Can.Money>{formatMoney(totalReference)}</Can.Money>
          </span>
        </div>
        <div className="mt-2 flex items-center justify-between border-t border-border-soft pt-2">
          <span className="font-medium text-charcoal">Unrealized Gain</span>
          <span className={`tabular-nums font-semibold ${unrealized >= 0 ? 'text-success' : 'text-error'}`}>
            <Can.Money>{formatMoney(unrealized)}</Can.Money>
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
