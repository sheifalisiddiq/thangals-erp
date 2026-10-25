import { Can } from '@/components/can'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { subMoney, sumMoney, type Money } from '@/lib/decimal'
import { formatMoney } from '@/lib/format'
import { useAccounts } from '@/lib/stores/accounts'
import { useFinance } from '@/lib/stores/finance'
import { usePurchases } from '@/lib/stores/purchases'
import { useSales } from '@/lib/stores/sales'

interface PartyBalance {
  partyId: string
  balanceMoney: Money
}

/** Computed (not stored) per-party balances: for AR, net debit-minus-credit on the AR account's
 * lines, grouped by partyId; for AP, net credit-minus-debit on the AP account's lines. */
function balancesForAccount(
  lines: { accountId: string; debitMoney: Money; creditMoney: Money; partyId?: string }[],
  accountId: string,
  direction: 'debit-minus-credit' | 'credit-minus-debit',
): PartyBalance[] {
  const byParty = new Map<string, Money[]>()
  for (const line of lines) {
    if (line.accountId !== accountId || !line.partyId) continue
    const signed =
      direction === 'debit-minus-credit' ? subMoney(line.debitMoney, line.creditMoney) : subMoney(line.creditMoney, line.debitMoney)
    const existing = byParty.get(line.partyId) ?? []
    existing.push(signed)
    byParty.set(line.partyId, existing)
  }
  return Array.from(byParty.entries())
    .map(([partyId, amounts]) => ({ partyId, balanceMoney: sumMoney(amounts) }))
    .filter((b) => b.balanceMoney !== 0)
}

/** Two side-by-side (stacked on mobile) computed views: Accounts Receivable (net owed by each
 * customer) and Accounts Payable (net owed to each supplier) — derived entirely from
 * `useFinance().journalEntries`' AR ("1100") / AP ("2000") account lines, nothing newly stored. */
export function ArAp() {
  const { journalEntries } = useFinance()
  const accounts = useAccounts()
  const { customers } = useSales()
  const { suppliers } = usePurchases()

  const arAccount = accounts.find((a) => a.code === '1100')
  const apAccount = accounts.find((a) => a.code === '2000')
  const allLines = journalEntries.flatMap((je) => je.lines)

  const arBalances = arAccount ? balancesForAccount(allLines, arAccount.id, 'debit-minus-credit') : []
  const apBalances = apAccount ? balancesForAccount(allLines, apAccount.id, 'credit-minus-debit') : []

  function customerName(id: string): string {
    return customers.find((c) => c.id === id)?.name ?? (id === 'house' ? 'House account' : 'Unknown customer')
  }
  function supplierName(id: string): string {
    return suppliers.find((s) => s.id === id)?.name ?? (id === 'house' ? 'House account' : 'Unknown supplier')
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Accounts Receivable</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead className="text-right">Balance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {arBalances.length === 0 && (
                <TableRow>
                  <TableCell colSpan={2} className="py-8 text-center text-slate-green">
                    No outstanding receivables.
                  </TableCell>
                </TableRow>
              )}
              {arBalances.map((b) => (
                <TableRow key={b.partyId}>
                  <TableCell className="text-charcoal">{customerName(b.partyId)}</TableCell>
                  <TableCell className="text-right tabular-nums">
                    <Can.Money>{formatMoney(b.balanceMoney)}</Can.Money>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Accounts Payable</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Supplier</TableHead>
                <TableHead className="text-right">Balance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {apBalances.length === 0 && (
                <TableRow>
                  <TableCell colSpan={2} className="py-8 text-center text-slate-green">
                    No outstanding payables.
                  </TableCell>
                </TableRow>
              )}
              {apBalances.map((b) => (
                <TableRow key={b.partyId}>
                  <TableCell className="text-charcoal">{supplierName(b.partyId)}</TableCell>
                  <TableCell className="text-right tabular-nums">
                    <Can.Money>{formatMoney(b.balanceMoney)}</Can.Money>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
