import { useState } from 'react'
import { Can } from '@/components/can'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { sumMoney, type Money } from '@/lib/decimal'
import type { Payment } from '@/lib/domain-types'
import { formatDateTime, formatMoney } from '@/lib/format'
import { useFinance } from '@/lib/stores/finance'
import { usePurchases } from '@/lib/stores/purchases'
import { useSales } from '@/lib/stores/sales'
import { RecordPaymentDialog } from './record-payment-dialog'

/** Cash & Bank running balances are computed purely from `useFinance().payments` (not from the
 * journal's Cash/Bank account lines) — a payment's `direction`/`method` signs it directly
 * ('in' adds, 'out' subtracts), summed separately for 'cash'-or-'card' method (Cash) vs 'bank'
 * method (Bank). This is an explicit choice, not a silent one: the journal's 1000/1010 account
 * lines should reconcile to the same totals for every posting made through `ledger.ts` (they do,
 * by construction — every function there posts both a Payment and a matching journal line), but
 * this view reads `payments` directly as the simpler, single source of truth for this card. */
function computeBalances(payments: Payment[]): { cash: Money; bank: Money } {
  const signed = (p: Payment): Money => (p.direction === 'in' ? p.amountMoney : -p.amountMoney)
  const cash = sumMoney(payments.filter((p) => p.method === 'cash' || p.method === 'card').map(signed))
  const bank = sumMoney(payments.filter((p) => p.method === 'bank').map(signed))
  return { cash, bank }
}

const DIRECTION_TONE: Record<Payment['direction'], 'success' | 'error'> = { in: 'success', out: 'error' }

export function CashBank() {
  const { payments } = useFinance()
  const { customers } = useSales()
  const { suppliers } = usePurchases()
  const [recordOpen, setRecordOpen] = useState(false)

  const sorted = [...payments].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  const { cash, bank } = computeBalances(payments)

  function partyLabel(p: Payment): string {
    if (p.refType === 'other' && p.partyId === 'house') return 'House account'
    if (p.partyType === 'customer') return customers.find((c) => c.id === p.partyId)?.name ?? 'Unknown customer'
    return suppliers.find((s) => s.id === p.partyId)?.name ?? 'Unknown supplier'
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Cash Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold tabular-nums text-charcoal">
              <Can.Money>{formatMoney(cash)}</Can.Money>
            </p>
            <p className="text-xs text-slate-green">Sum of all cash/card-method payments, signed by direction.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Bank Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold tabular-nums text-charcoal">
              <Can.Money>{formatMoney(bank)}</Can.Money>
            </p>
            <p className="text-xs text-slate-green">Sum of all bank-method payments, signed by direction.</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Can module="finance" action="post">
          <Button onClick={() => setRecordOpen(true)}>Record Payment</Button>
        </Can>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Payments</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Direction</TableHead>
                <TableHead>Party</TableHead>
                <TableHead>Method</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="py-8 text-center text-slate-green">
                    No payments yet.
                  </TableCell>
                </TableRow>
              )}
              {sorted.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="text-slate-green">{formatDateTime(p.createdAt)}</TableCell>
                  <TableCell>
                    <Badge tone={DIRECTION_TONE[p.direction]}>{p.direction === 'in' ? 'In' : 'Out'}</Badge>
                  </TableCell>
                  <TableCell className="text-charcoal">{partyLabel(p)}</TableCell>
                  <TableCell className="text-slate-green capitalize">{p.method}</TableCell>
                  <TableCell className="text-right tabular-nums">
                    <Can.Money>{formatMoney(p.amountMoney)}</Can.Money>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <RecordPaymentDialog open={recordOpen} onOpenChange={setRecordOpen} />
    </div>
  )
}
