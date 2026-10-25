import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { FormField } from '@/components/ui/form-field'
import { Input, NumberInput } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toMoney } from '@/lib/decimal'
import type { Payment } from '@/lib/domain-types'
import { recordStandalonePayment } from '@/lib/ledger'

const METHODS: Payment['method'][] = ['cash', 'bank', 'card']
const DIRECTIONS: Payment['direction'][] = ['in', 'out']

/** Standalone/ad-hoc "Record Payment" dialog for cash/bank movements not tied to a specific
 * sales or supplier invoice (e.g. a capital injection or a misc expense) — calls
 * `ledger.ts`'s `recordStandalonePayment`, which posts against the 'house' sentinel party. */
export function RecordPaymentDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [direction, setDirection] = useState<Payment['direction']>('in')
  const [amountAED, setAmountAED] = useState(0)
  const [method, setMethod] = useState<Payment['method']>('cash')
  const [note, setNote] = useState('')
  const [error, setError] = useState<string | null>(null)

  function reset() {
    setDirection('in')
    setAmountAED(0)
    setMethod('cash')
    setNote('')
    setError(null)
  }

  function handleOpenChange(next: boolean) {
    if (!next) reset()
    onOpenChange(next)
  }

  function handleSubmit() {
    if (amountAED <= 0) {
      setError('Enter a positive payment amount.')
      return
    }
    try {
      recordStandalonePayment({
        direction,
        amountMoney: toMoney(amountAED),
        method,
        note: note || undefined,
      })
      handleOpenChange(false)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not record payment.')
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Record Payment</DialogTitle>
          <DialogDescription>Standalone cash/bank movement not tied to a specific invoice (e.g. capital injection or misc expense).</DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <FormField label="Direction">
            <Select value={direction} onValueChange={(v) => setDirection(v as Payment['direction'])}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DIRECTIONS.map((d) => (
                  <SelectItem key={d} value={d}>
                    {d === 'in' ? 'In (receipt)' : 'Out (payment)'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
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
          <FormField label="Note (optional)">
            <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Owner capital injection" />
          </FormField>
        </div>

        {error && <p className="mt-2 text-xs text-error">{error}</p>}

        <DialogFooter>
          <Button variant="secondary" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Record payment</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
