import { useState } from 'react'
import { Can } from '@/components/can'
import { Badge, type BadgeTone } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import type { SupplierInvoice } from '@/lib/domain-types'
import { formatDateTime, formatMoney } from '@/lib/format'
import { usePurchases } from '@/lib/stores/purchases'
import { RecordPaymentDialog } from './record-payment-dialog'
import { SupplierInvoiceDialog } from './supplier-invoice-dialog'

const STATUS_TONE: Record<SupplierInvoice['status'], BadgeTone> = {
  unpaid: 'error',
  partial: 'warning',
  paid: 'success',
}

const STATUS_LABEL: Record<SupplierInvoice['status'], string> = {
  unpaid: 'Unpaid',
  partial: 'Partial',
  paid: 'Paid',
}

export function SupplierInvoiceList() {
  const { supplierInvoices, suppliers } = usePurchases()
  const [createOpen, setCreateOpen] = useState(false)
  const [paymentInvoice, setPaymentInvoice] = useState<SupplierInvoice | null>(null)

  function supplierName(id: string): string {
    return suppliers.find((s) => s.id === id)?.name ?? 'Unknown supplier'
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Can module="purchases" action="create">
          <Button onClick={() => setCreateOpen(true)}>Add Invoice</Button>
        </Can>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Supplier Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice #</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">Paid</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {supplierInvoices.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="py-8 text-center text-slate-green">
                    No supplier invoices yet.
                  </TableCell>
                </TableRow>
              )}
              {supplierInvoices.map((inv) => (
                <TableRow key={inv.id}>
                  <TableCell className="font-medium">{inv.invoiceNumber}</TableCell>
                  <TableCell className="text-slate-green">{supplierName(inv.supplierId)}</TableCell>
                  <TableCell className="text-right tabular-nums">
                    <Can.Money>{formatMoney(inv.amountMoney)}</Can.Money>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    <Can.Money>{formatMoney(inv.paidMoney)}</Can.Money>
                  </TableCell>
                  <TableCell>
                    <Badge tone={STATUS_TONE[inv.status]}>{STATUS_LABEL[inv.status]}</Badge>
                  </TableCell>
                  <TableCell className="text-slate-green">{formatDateTime(inv.dueDate)}</TableCell>
                  <TableCell className="text-right">
                    {inv.status !== 'paid' && (
                      <Can module="purchases" action="post">
                        <Button variant="ghost" size="sm" onClick={() => setPaymentInvoice(inv)}>
                          Record Payment
                        </Button>
                      </Can>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <SupplierInvoiceDialog open={createOpen} onOpenChange={setCreateOpen} />
      <RecordPaymentDialog
        invoice={paymentInvoice}
        open={paymentInvoice !== null}
        onOpenChange={(o) => !o && setPaymentInvoice(null)}
      />
    </div>
  )
}
