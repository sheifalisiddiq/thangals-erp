import { Can } from '@/components/can'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatDateTime, formatMoney } from '@/lib/format'
import { useAccounts } from '@/lib/stores/accounts'
import { useFinance } from '@/lib/stores/finance'

/** Read-only journal view over `useFinance().journalEntries`, sorted newest-first. Each entry's
 * lines are rendered inline as a nested table resolving account names via `useAccounts()`. */
export function Journal() {
  const { journalEntries } = useFinance()
  const accounts = useAccounts()
  const sorted = [...journalEntries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  function accountLabel(accountId: string): string {
    const account = accounts.find((a) => a.id === accountId)
    return account ? `${account.code} ${account.name}` : 'Unknown account'
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Journal</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {sorted.length === 0 && <p className="py-8 text-center text-sm text-slate-green">No journal entries yet.</p>}
        {sorted.map((entry) => {
          const totalDebit = entry.lines.reduce((sum, l) => sum + l.debitMoney, 0)
          const totalCredit = entry.lines.reduce((sum, l) => sum + l.creditMoney, 0)
          return (
            <div key={entry.id} className="rounded-[var(--radius-card)] border border-border-soft">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border-soft bg-ivory/40 px-4 py-2">
                <div>
                  <p className="text-sm font-medium text-charcoal">{entry.memo}</p>
                  <p className="text-xs text-slate-green">
                    {formatDateTime(entry.date)} &middot; {entry.refType}:{entry.refId}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {entry.reversedBy && <Badge tone="warning">Reversed</Badge>}
                  <Badge tone={totalDebit === totalCredit ? 'success' : 'error'}>
                    {totalDebit === totalCredit ? 'Balanced' : 'Unbalanced'}
                  </Badge>
                </div>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Account</TableHead>
                    <TableHead className="text-right">Debit</TableHead>
                    <TableHead className="text-right">Credit</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {entry.lines.map((line, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="text-slate-green">{accountLabel(line.accountId)}</TableCell>
                      <TableCell className="text-right tabular-nums">
                        {line.debitMoney > 0 ? <Can.Money>{formatMoney(line.debitMoney)}</Can.Money> : '—'}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {line.creditMoney > 0 ? <Can.Money>{formatMoney(line.creditMoney)}</Can.Money> : '—'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
