import { Badge, type BadgeTone } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import type { Account } from '@/lib/domain-types'
import { useAccounts } from '@/lib/stores/accounts'

const TYPE_TONE: Record<Account['type'], BadgeTone> = {
  asset: 'info',
  liability: 'warning',
  equity: 'neutral',
  income: 'success',
  expense: 'error',
}

const TYPE_LABEL: Record<Account['type'], string> = {
  asset: 'Asset',
  liability: 'Liability',
  equity: 'Equity',
  income: 'Income',
  expense: 'Expense',
}

/** Read-only chart of accounts view over `useAccounts()` — no write capability here, the
 * chart of accounts is seeded once and not editable from this module. */
export function ChartOfAccounts() {
  const accounts = useAccounts()

  return (
    <Card>
      <CardHeader>
        <CardTitle>Chart of Accounts</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {accounts.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} className="py-8 text-center text-slate-green">
                  No accounts seeded.
                </TableCell>
              </TableRow>
            )}
            {accounts.map((a) => (
              <TableRow key={a.id}>
                <TableCell className="font-medium tabular-nums">{a.code}</TableCell>
                <TableCell className="text-charcoal">{a.name}</TableCell>
                <TableCell>
                  <Badge tone={TYPE_TONE[a.type]}>{TYPE_LABEL[a.type]}</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
