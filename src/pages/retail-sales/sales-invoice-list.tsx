import { useState } from 'react'
import { Can } from '@/components/can'
import { Badge, type BadgeTone } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import type { SalesInvoice } from '@/lib/domain-types'
import { formatDateTime, formatMoney } from '@/lib/format'
import { reverseSale } from '@/lib/ledger'
import { useBranches } from '@/lib/stores/branches'
import { useSales } from '@/lib/stores/sales'
import { RecordPaymentDialog } from './record-payment-dialog'

const STATUS_TONE: Record<SalesInvoice['status'], BadgeTone> = {
  draft: 'neutral',
  confirmed: 'info',
  paid: 'success',
  partial: 'warning',
  cancelled: 'neutral',
  reversed: 'error',
}

const STATUS_LABEL: Record<SalesInvoice['status'], string> = {
  draft: 'Draft',
  confirmed: 'Confirmed',
  paid: 'Paid',
  partial: 'Partial',
  cancelled: 'Cancelled',
  reversed: 'Reversed',
}

export function SalesInvoiceList() {
  const { invoices, customers } = useSales()
  const branches = useBranches()
  const [paymentInvoice, setPaymentInvoice] = useState<SalesInvoice | null>(null)
  const [reverseError, setReverseError] = useState<string | null>(null)

  function customerName(id: string): string {
    return customers.find((c) => c.id === id)?.name ?? 'Unknown customer'
  }

  function branchName(id: string): string {
    return branches.find((b) => b.id === id)?.name ?? 'Unknown branch'
  }

  function handleReverse(invoice: SalesInvoice) {
    if (!window.confirm(`Reverse sale ${invoice.invoiceNumber}? This restores the items to in-stock and posts a reversing entry.`)) {
      return
    }
    try {
      reverseSale(invoice.id)
      setReverseError(null)
    } catch (e) {
      setReverseError(e instanceof Error ? e.message : 'Could not reverse sale.')
    }
  }

  return (
    <div className="space-y-4">
      {reverseError && <p className="text-xs text-error">{reverseError}</p>}

      <Card>
        <CardHeader>
          <CardTitle>Sales Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice #</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Branch</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">Paid</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="py-8 text-center text-slate-green">
                    No sales invoices yet.
                  </TableCell>
                </TableRow>
              )}
              {invoices.map((inv) => (
                <TableRow key={inv.id}>
                  <TableCell className="font-medium">{inv.invoiceNumber}</TableCell>
                  <TableCell className="text-slate-green">{customerName(inv.customerId)}</TableCell>
                  <TableCell className="text-slate-green">{branchName(inv.branchId)}</TableCell>
                  <TableCell className="text-right tabular-nums">
                    <Can.Money>{formatMoney(inv.totalMoney)}</Can.Money>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    <Can.Money>{formatMoney(inv.paidMoney)}</Can.Money>
                  </TableCell>
                  <TableCell>
                    <Badge tone={STATUS_TONE[inv.status]}>{STATUS_LABEL[inv.status]}</Badge>
                  </TableCell>
                  <TableCell className="text-slate-green">{formatDateTime(inv.createdAt)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1.5">
                      {(inv.status === 'confirmed' || inv.status === 'partial') && (
                        <Can module="retail-sales" action="post">
                          <Button variant="ghost" size="sm" onClick={() => setPaymentInvoice(inv)}>
                            Record Payment
                          </Button>
                        </Can>
                      )}
                      {inv.status === 'confirmed' && (
                        <Can module="retail-sales" action="reverse">
                          <Button variant="ghost" size="sm" onClick={() => handleReverse(inv)}>
                            Reverse
                          </Button>
                        </Can>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <RecordPaymentDialog
        invoice={paymentInvoice}
        open={paymentInvoice !== null}
        onOpenChange={(o) => !o && setPaymentInvoice(null)}
      />
    </div>
  )
}
