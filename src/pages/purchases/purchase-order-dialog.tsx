import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { FormField } from '@/components/ui/form-field'
import { NumberInput, Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { fromGrams, fromMoney } from '@/lib/decimal'
import type { PurchaseOrderLine } from '@/lib/domain-types'
import { formatMoney } from '@/lib/format'
import { goldRateForKarat } from '@/lib/settings'
import { useBranches } from '@/lib/stores/branches'
import { createPurchaseOrder, usePurchases } from '@/lib/stores/purchases'

const KARATS: PurchaseOrderLine['karat'][] = [24, 22, 21, 18, 14]

interface LineForm {
  key: string
  description: string
  karat: PurchaseOrderLine['karat']
  weightGrams: number
  ratePerGramAED: number
}

function emptyLine(): LineForm {
  return { key: crypto.randomUUID(), description: '', karat: 22, weightGrams: 0, ratePerGramAED: goldRateForKaratAED(22) }
}

function goldRateForKaratAED(karat: PurchaseOrderLine['karat']): number {
  return fromMoney(goldRateForKarat(karat))
}

function lineTotalAED(line: LineForm): number {
  return line.ratePerGramAED * line.weightGrams
}

export function PurchaseOrderDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const branches = useBranches()
  const { suppliers } = usePurchases()
  const [supplierId, setSupplierId] = useState('')
  const [branchId, setBranchId] = useState('')
  const [lines, setLines] = useState<LineForm[]>([emptyLine()])
  const [error, setError] = useState<string | null>(null)

  function handleOpenChange(next: boolean) {
    if (next) {
      setSupplierId('')
      setBranchId(branches[0]?.id ?? '')
      setLines([emptyLine()])
      setError(null)
    }
    onOpenChange(next)
  }

  function updateLine(key: string, patch: Partial<LineForm>) {
    setLines((prev) => prev.map((l) => (l.key === key ? { ...l, ...patch } : l)))
  }

  function addLine() {
    setLines((prev) => [...prev, emptyLine()])
  }

  function removeLine(key: string) {
    setLines((prev) => (prev.length > 1 ? prev.filter((l) => l.key !== key) : prev))
  }

  const total = lines.reduce((sum, l) => sum + lineTotalAED(l), 0)

  function handleSubmit() {
    if (!supplierId || !branchId) {
      setError('Supplier and branch are required.')
      return
    }
    if (lines.length === 0 || lines.some((l) => !l.description.trim() || l.weightGrams <= 0 || l.ratePerGramAED <= 0)) {
      setError('Every line needs a description, positive weight, and positive rate.')
      return
    }
    createPurchaseOrder({
      supplierId,
      branchId,
      lines: lines.map((l) => ({
        description: l.description.trim(),
        karat: l.karat,
        weightMg: fromGrams(l.weightGrams),
        ratePerGramMoney: Math.round(l.ratePerGramAED * 100),
      })),
    })
    handleOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>New Purchase Order</DialogTitle>
          <DialogDescription>Create a draft purchase order with one or more line items.</DialogDescription>
        </DialogHeader>

        <div className="grid max-h-[65vh] gap-3 overflow-y-auto sm:grid-cols-2">
          <FormField label="Supplier">
            <Select value={supplierId} onValueChange={setSupplierId}>
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

          <FormField label="Branch">
            <Select value={branchId} onValueChange={setBranchId}>
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
        </div>

        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-charcoal">Line items</p>
            <Button type="button" variant="secondary" size="sm" onClick={addLine}>
              Add line
            </Button>
          </div>

          <div className="max-h-[32vh] space-y-3 overflow-y-auto">
            {lines.map((line, idx) => (
              <div key={line.key} className="rounded-[var(--radius-card)] border border-border-soft p-3">
                <div className="grid gap-2 sm:grid-cols-[2fr_1fr_1fr_1.3fr_auto]">
                  <FormField label="Description">
                    <Input
                      value={line.description}
                      onChange={(e) => updateLine(line.key, { description: e.target.value })}
                      placeholder="24K Gold Bars (1kg each)"
                    />
                  </FormField>
                  <FormField label="Karat">
                    <Select
                      value={String(line.karat)}
                      onValueChange={(v) => updateLine(line.key, { karat: Number(v) as PurchaseOrderLine['karat'] })}
                    >
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
                  <FormField label="Weight (g)">
                    <NumberInput value={line.weightGrams} onValueChange={(v) => updateLine(line.key, { weightGrams: v })} />
                  </FormField>
                  <FormField label="Rate / g (AED)">
                    <div className="flex gap-1">
                      <NumberInput value={line.ratePerGramAED} onValueChange={(v) => updateLine(line.key, { ratePerGramAED: v })} />
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        title="Use current gold rate"
                        onClick={() => updateLine(line.key, { ratePerGramAED: goldRateForKaratAED(line.karat) })}
                      >
                        Rate
                      </Button>
                    </div>
                  </FormField>
                  <div className="flex items-end justify-end pb-0.5">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeLine(line.key)}
                      disabled={lines.length === 1}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
                <p className="mt-1 text-right text-xs text-slate-green">
                  Line {idx + 1} total: <span className="tabular-nums text-charcoal">{formatMoney(Math.round(lineTotalAED(line) * 100))}</span>
                </p>
              </div>
            ))}
          </div>

          <div className="flex justify-end border-t border-border-soft pt-3 text-sm">
            <p>
              PO total: <span className="font-semibold tabular-nums text-charcoal">{formatMoney(Math.round(total * 100))}</span>
            </p>
          </div>
        </div>

        {error && <p className="mt-2 text-xs text-error">{error}</p>}

        <DialogFooter>
          <Button variant="secondary" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Create PO</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

