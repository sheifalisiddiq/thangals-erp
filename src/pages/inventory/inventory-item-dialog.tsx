import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { FormField } from '@/components/ui/form-field'
import { Input, NumberInput } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { fromGrams, toMoney } from '@/lib/decimal'
import type { InventoryItem } from '@/lib/domain-types'
import { addInventoryItem } from '@/lib/stores/inventory'
import { useBranches } from '@/lib/stores/branches'

const KARATS: InventoryItem['karat'][] = [24, 22, 21, 18, 14]
const OWNERSHIPS: InventoryItem['ownership'][] = ['company', 'customer', 'supplier-consignment']

const OWNERSHIP_LABEL: Record<InventoryItem['ownership'], string> = {
  company: 'Company-owned',
  customer: 'Customer-owned',
  'supplier-consignment': 'Supplier consignment',
}

interface FormState {
  sku: string
  name: string
  category: string
  karat: InventoryItem['karat']
  grossGrams: number
  stoneGrams: number
  netGrams: number
  branchId: string
  ownership: InventoryItem['ownership']
  makingChargePct: number
  costPerGramAED: number
}

function emptyForm(defaultBranchId: string): FormState {
  return {
    sku: '',
    name: '',
    category: '',
    karat: 22,
    grossGrams: 0,
    stoneGrams: 0,
    netGrams: 0,
    branchId: defaultBranchId,
    ownership: 'company',
    makingChargePct: 0,
    costPerGramAED: 0,
  }
}

/** Create mode only, for now — manual item entry appends directly to the inventory slice (not
 * a cross-module posting, so it does not go through ledger.ts). */
export function InventoryItemDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const branches = useBranches()
  const [form, setForm] = useState<FormState>(() => emptyForm(branches[0]?.id ?? ''))
  const [error, setError] = useState<string | null>(null)

  function handleOpenChange(next: boolean) {
    if (next) {
      setForm(emptyForm(branches[0]?.id ?? ''))
      setError(null)
    }
    onOpenChange(next)
  }

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function handleSubmit() {
    if (!form.sku.trim() || !form.name.trim() || !form.category.trim() || !form.branchId) {
      setError('SKU, name, category and branch are required.')
      return
    }
    addInventoryItem({
      sku: form.sku.trim(),
      name: form.name.trim(),
      category: form.category.trim(),
      karat: form.karat,
      grossWeightMg: fromGrams(form.grossGrams),
      stoneWeightMg: fromGrams(form.stoneGrams),
      netWeightMg: fromGrams(form.netGrams),
      branchId: form.branchId,
      ownership: form.ownership,
      status: 'in-stock',
      makingChargeBp: Math.round(form.makingChargePct * 100),
      costPricePerGramMoney: toMoney(form.costPerGramAED),
    })
    handleOpenChange(false)
  }

  const netHint =
    form.grossGrams > 0 || form.stoneGrams > 0
      ? `Gross − stone = ${(form.grossGrams - form.stoneGrams).toFixed(3)}g (net weight is not auto-filled — enter the measured net weight)`
      : undefined

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Inventory Item</DialogTitle>
          <DialogDescription>Create a new item directly in stock.</DialogDescription>
        </DialogHeader>

        <div className="grid max-h-[70vh] grid-cols-1 gap-3 overflow-y-auto sm:grid-cols-2">
          <FormField label="SKU">
            <Input value={form.sku} onChange={(e) => update('sku', e.target.value)} placeholder="RG-22K-015" />
          </FormField>
          <FormField label="Category">
            <Input value={form.category} onChange={(e) => update('category', e.target.value)} placeholder="Rings" />
          </FormField>

          <FormField label="Name" className="sm:col-span-2">
            <Input value={form.name} onChange={(e) => update('name', e.target.value)} placeholder="22K Gold Band Ring" />
          </FormField>

          <FormField label="Karat">
            <Select value={String(form.karat)} onValueChange={(v) => update('karat', Number(v) as InventoryItem['karat'])}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {KARATS.map((k) => (
                  <SelectItem key={k} value={String(k)}>
                    {k}K
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>

          <FormField label="Branch">
            <Select value={form.branchId} onValueChange={(v) => update('branchId', v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select a branch" />
              </SelectTrigger>
              <SelectContent>
                {branches.map((b) => (
                  <SelectItem key={b.id} value={b.id}>
                    {b.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>

          <FormField label="Gross weight (g)">
            <NumberInput value={form.grossGrams} onValueChange={(v) => update('grossGrams', v)} />
          </FormField>
          <FormField label="Stone weight (g)">
            <NumberInput value={form.stoneGrams} onValueChange={(v) => update('stoneGrams', v)} />
          </FormField>
          <FormField label="Net weight (g)" className="sm:col-span-2">
            <NumberInput value={form.netGrams} onValueChange={(v) => update('netGrams', v)} />
            {netHint && <p className="text-xs text-slate-green">{netHint}</p>}
          </FormField>

          <FormField label="Ownership">
            <Select value={form.ownership} onValueChange={(v) => update('ownership', v as InventoryItem['ownership'])}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {OWNERSHIPS.map((o) => (
                  <SelectItem key={o} value={o}>
                    {OWNERSHIP_LABEL[o]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>

          <FormField label="Making charge (%)">
            <NumberInput value={form.makingChargePct} onValueChange={(v) => update('makingChargePct', v)} />
          </FormField>

          <FormField label="Cost price per gram (AED)" className="sm:col-span-2">
            <NumberInput value={form.costPerGramAED} onValueChange={(v) => update('costPerGramAED', v)} />
          </FormField>
        </div>

        {error && <p className="mt-2 text-xs text-error">{error}</p>}

        <DialogFooter>
          <Button variant="secondary" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Add item</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
