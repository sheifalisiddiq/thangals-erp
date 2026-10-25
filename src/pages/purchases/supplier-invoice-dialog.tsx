import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { FormField } from '@/components/ui/form-field'
import { Input, NumberInput } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toMoney } from '@/lib/decimal'
import { addSupplierInvoice, usePurchases } from '@/lib/stores/purchases'

const NO_PO = 'none'

interface FormState {
  supplierId: string
  poId: string
  invoiceNumber: string
  amountAED: number
  dueDate: string
}

function emptyForm(): FormState {
  return { supplierId: '', poId: NO_PO, invoiceNumber: '', amountAED: 0, dueDate: '' }
}

export function SupplierInvoiceDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { suppliers, purchaseOrders } = usePurchases()
  const [form, setForm] = useState<FormState>(emptyForm)
  const [error, setError] = useState<string | null>(null)

  function handleOpenChange(next: boolean) {
    if (next) {
      setForm(emptyForm())
      setError(null)
    }
    onOpenChange(next)
  }

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const poOptions = purchaseOrders.filter((po) => !form.supplierId || po.supplierId === form.supplierId)

  function handleSubmit() {
    if (!form.supplierId || !form.invoiceNumber.trim() || form.amountAED <= 0 || !form.dueDate) {
      setError('Supplier, invoice number, amount and due date are required.')
      return
    }
    addSupplierInvoice({
      supplierId: form.supplierId,
      poId: form.poId === NO_PO ? undefined : form.poId,
      invoiceNumber: form.invoiceNumber.trim(),
      amountMoney: toMoney(form.amountAED),
      dueDate: new Date(form.dueDate).toISOString(),
    })
    handleOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Supplier Invoice</DialogTitle>
          <DialogDescription>Record an invoice received from a supplier.</DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <FormField label="Supplier">
            <Select value={form.supplierId} onValueChange={(v) => update('supplierId', v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select a supplier" />
              </SelectTrigger>
              <SelectContent>
                {suppliers.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>

          <FormField label="Purchase order (optional)">
            <Select value={form.poId} onValueChange={(v) => update('poId', v)}>
              <SelectTrigger>
                <SelectValue placeholder="No linked PO" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NO_PO}>No linked PO</SelectItem>
                {poOptions.map((po) => (
                  <SelectItem key={po.id} value={po.id}>
                    {po.poNumber}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>

          <FormField label="Invoice number">
            <Input value={form.invoiceNumber} onChange={(e) => update('invoiceNumber', e.target.value)} placeholder="INV-AF-7731" />
          </FormField>

          <FormField label="Amount (AED)">
            <NumberInput value={form.amountAED} onValueChange={(v) => update('amountAED', v)} />
          </FormField>

          <FormField label="Due date">
            <Input type="date" value={form.dueDate} onChange={(e) => update('dueDate', e.target.value)} />
          </FormField>
        </div>

        {error && <p className="mt-2 text-xs text-error">{error}</p>}

        <DialogFooter>
          <Button variant="secondary" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Add invoice</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
