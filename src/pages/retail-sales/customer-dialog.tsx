import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { FormField } from '@/components/ui/form-field'
import { Input, NumberInput } from '@/components/ui/input'
import { toMoney } from '@/lib/decimal'
import { addCustomer } from '@/lib/stores/sales'

interface FormState {
  name: string
  phone: string
  address: string
  openingBalanceAED: number
}

function emptyForm(): FormState {
  return { name: '', phone: '', address: '', openingBalanceAED: 0 }
}

export function CustomerDialog({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated?: (customerId: string) => void
}) {
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

  function handleSubmit() {
    if (!form.name.trim() || !form.phone.trim()) {
      setError('Name and phone are required.')
      return
    }
    const customer = addCustomer({
      name: form.name.trim(),
      phone: form.phone.trim(),
      address: form.address.trim(),
      openingBalanceMoney: toMoney(form.openingBalanceAED),
    })
    handleOpenChange(false)
    onCreated?.(customer.id)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Customer</DialogTitle>
          <DialogDescription>Create a new retail customer profile.</DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <FormField label="Customer name">
            <Input value={form.name} onChange={(e) => update('name', e.target.value)} placeholder="Fatima Al Mansouri" />
          </FormField>
          <FormField label="Phone">
            <Input value={form.phone} onChange={(e) => update('phone', e.target.value)} placeholder="+971 50 123 4567" />
          </FormField>
          <FormField label="Address">
            <Input value={form.address} onChange={(e) => update('address', e.target.value)} placeholder="Villa 22, Al Barsha 2, Dubai" />
          </FormField>
          <FormField label="Opening balance (AED)">
            <NumberInput value={form.openingBalanceAED} onValueChange={(v) => update('openingBalanceAED', v)} />
          </FormField>
        </div>

        {error && <p className="mt-2 text-xs text-error">{error}</p>}

        <DialogFooter>
          <Button variant="secondary" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Add customer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
