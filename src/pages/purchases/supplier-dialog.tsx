import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { FormField } from '@/components/ui/form-field'
import { Input, NumberInput } from '@/components/ui/input'
import { toMoney } from '@/lib/decimal'
import { addSupplier } from '@/lib/stores/purchases'

interface FormState {
  name: string
  contact: string
  phone: string
  address: string
  openingBalanceAED: number
}

function emptyForm(): FormState {
  return { name: '', contact: '', phone: '', address: '', openingBalanceAED: 0 }
}

export function SupplierDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
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
    if (!form.name.trim() || !form.contact.trim() || !form.phone.trim()) {
      setError('Name, contact and phone are required.')
      return
    }
    addSupplier({
      name: form.name.trim(),
      contact: form.contact.trim(),
      phone: form.phone.trim(),
      address: form.address.trim(),
      openingBalanceMoney: toMoney(form.openingBalanceAED),
    })
    handleOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Supplier</DialogTitle>
          <DialogDescription>Create a new supplier profile.</DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <FormField label="Supplier name">
            <Input value={form.name} onChange={(e) => update('name', e.target.value)} placeholder="Al Fardan Bullion Trading LLC" />
          </FormField>
          <FormField label="Contact person">
            <Input value={form.contact} onChange={(e) => update('contact', e.target.value)} placeholder="Yusuf Al Fardan" />
          </FormField>
          <FormField label="Phone">
            <Input value={form.phone} onChange={(e) => update('phone', e.target.value)} placeholder="+971 4 221 3345" />
          </FormField>
          <FormField label="Address">
            <Input value={form.address} onChange={(e) => update('address', e.target.value)} placeholder="Shop 112, Gold Souk, Deira, Dubai" />
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
          <Button onClick={handleSubmit}>Add supplier</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
