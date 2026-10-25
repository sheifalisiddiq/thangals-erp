import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { FormField } from '@/components/ui/form-field'
import { NumberInput } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { fromMoney, subMoney, toMoney } from '@/lib/decimal'
import type { Payment, SalesInvoice } from '@/lib/domain-types'
import { recordPayment } from '@/lib/ledger'

const METHODS: Payment['method'][] = ['cash', 'bank', 'card']

export function RecordPaymentDialog({
  invoice,
  open,
  onOpenChange,
}: {
  invoice: SalesInvoice | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const remaining = invoice ? subMoney(invoice.totalMoney, invoice.paidMoney) : 0
  const [amountAED, setAmountAED] = useState(0)
  const [method, setMethod] = useState<Payment['method']>('cash')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open && invoice) {
      setAmountAED(fromMoney(remaining))
      setMethod('cash')
      setError(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, invoice?.id])

  function handleSubmit() {
    if (!invoice) return
    if (amountAED <= 0) {
      setError('Enter a positive payment amount.')
      return
    }
    try {
      recordPayment({
        direction: 'in',
        partyType: 'customer',
        partyId: invoice.customerId,
        amountMoney: toMoney(amountAED),
        method,
        refType: 'sales-invoice',
        refId: invoice.id,
        createdAt: new Date().toISOString(),
      })
      onOpenChange(false)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not record payment.')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Record Payment</DialogTitle>
          <DialogDescription>{invoice ? `Invoice ${invoice.invoiceNumber}` : 'Record a customer payment.'}</DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <FormField label="Amount (AED)">
            <NumberInput value={amountAED} onValueChange={setAmountAED} />
          </FormField>
          <FormField label="Method">
            <Select value={method} onValueChange={(v) => setMethod(v as Payment['method'])}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {METHODS.map((m) => (
                  <SelectItem key={m} value={m}>
                    {m.charAt(0).toUpperCase() + m.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
        </div>

        {error && <p className="mt-2 text-xs text-error">{error}</p>}

        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Record payment</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
