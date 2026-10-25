import { useMemo, useState } from 'react'
import { Can } from '@/components/can'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input, NumberInput } from '@/components/ui/input'
import { FormField } from '@/components/ui/form-field'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { fromMoney, toMoney } from '@/lib/decimal'
import type { InventoryItem, SalesInvoice, SalesInvoiceLine } from '@/lib/domain-types'
import { formatMoney, formatWeight } from '@/lib/format'
import { confirmSale } from '@/lib/ledger'
import { priceInvoice, priceLine } from '@/lib/pricing'
import { goldRateForKarat, useSettings } from '@/lib/settings'
import { useBranches } from '@/lib/stores/branches'
import { useInventory } from '@/lib/stores/inventory'
import { saveDraftInvoice, useSales } from '@/lib/stores/sales'
import { CustomerDialog } from './customer-dialog'

interface LineForm {
  key: string
  item: InventoryItem
  ratePerGramAED: number
  makingChargePercent: number
  stoneChargeAED: number
  discountAED: number
}

function goldRateForKaratAED(karat: InventoryItem['karat']): number {
  return fromMoney(goldRateForKarat(karat))
}

function lineFormToPriced(line: LineForm) {
  return priceLine({
    item: line.item,
    ratePerGramMoney: toMoney(line.ratePerGramAED),
    makingChargeBp: Math.round(line.makingChargePercent * 100),
    stoneChargeMoney: toMoney(line.stoneChargeAED),
    discountMoney: toMoney(line.discountAED),
  })
}

export function NewSale({ onSaleConfirmed }: { onSaleConfirmed?: () => void }) {
  const branches = useBranches()
  const { customers } = useSales()
  const inventory = useInventory()
  const settings = useSettings()

  const [branchId, setBranchId] = useState<string>(branches[0]?.id ?? '')
  const [customerId, setCustomerId] = useState<string>('')
  const [customerDialogOpen, setCustomerDialogOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [lines, setLines] = useState<LineForm[]>([])
  const [error, setError] = useState<string | null>(null)
  const [confirmedInvoice, setConfirmedInvoice] = useState<SalesInvoice | null>(null)

  const addedItemIds = useMemo(() => new Set(lines.map((l) => l.item.id)), [lines])

  const availableItems = useMemo(() => {
    return inventory.items.filter((item) => {
      if (item.status !== 'in-stock') return false
      if (addedItemIds.has(item.id)) return false
      if (!search.trim()) return true
      const needle = search.trim().toLowerCase()
      return item.sku.toLowerCase().includes(needle) || item.name.toLowerCase().includes(needle)
    })
  }, [inventory.items, addedItemIds, search])

  const pricedLines = useMemo(() => lines.map((l) => ({ line: l, priced: lineFormToPriced(l) })), [lines])

  const invoiceTotals = useMemo(
    () => priceInvoice(pricedLines.map((p) => ({ lineTotalMoney: p.priced.lineTotalMoney })), settings.tax),
    [pricedLines, settings.tax],
  )

  function addItem(item: InventoryItem) {
    setLines((prev) => [
      ...prev,
      {
        key: crypto.randomUUID(),
        item,
        ratePerGramAED: goldRateForKaratAED(item.karat),
        makingChargePercent: item.makingChargeBp / 100,
        stoneChargeAED: 0,
        discountAED: 0,
      },
    ])
  }

  function updateLine(key: string, patch: Partial<LineForm>) {
    setLines((prev) => prev.map((l) => (l.key === key ? { ...l, ...patch } : l)))
  }

  function removeLine(key: string) {
    setLines((prev) => prev.filter((l) => l.key !== key))
  }

  function resetForm() {
    setBranchId(branches[0]?.id ?? '')
    setCustomerId('')
    setSearch('')
    setLines([])
    setError(null)
  }

  function handleConfirmSale() {
    setError(null)
    if (!branchId) {
      setError('Select a branch.')
      return
    }
    if (!customerId) {
      setError('Select a customer.')
      return
    }
    if (lines.length === 0) {
      setError('Add at least one item to the sale.')
      return
    }

    const invoiceLines: SalesInvoiceLine[] = pricedLines.map(({ line, priced }) => ({
      id: crypto.randomUUID(),
      itemId: line.item.id,
      description: line.item.name,
      weightMg: line.item.netWeightMg,
      ratePerGramMoney: toMoney(line.ratePerGramAED),
      metalValueMoney: priced.metalValueMoney,
      makingChargeMoney: priced.makingChargeMoney,
      stoneChargeMoney: priced.stoneChargeMoney,
      discountMoney: priced.discountMoney,
      lineTotalMoney: priced.lineTotalMoney,
    }))

    try {
      const draft = saveDraftInvoice({
        customerId,
        branchId,
        lines: invoiceLines,
        subtotalMoney: invoiceTotals.subtotalMoney,
        taxMoney: invoiceTotals.taxMoney,
        totalMoney: invoiceTotals.totalMoney,
      })
      confirmSale(draft)
      setConfirmedInvoice(draft)
      resetForm()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not confirm sale.')
    }
  }

  if (confirmedInvoice) {
    return (
      <Card>
        <CardContent className="space-y-3 pt-5 text-center">
          <p className="text-sm font-medium text-charcoal">
            Sale confirmed — invoice <span className="tabular-nums">{confirmedInvoice.invoiceNumber}</span> for{' '}
            <span className="tabular-nums">{formatMoney(confirmedInvoice.totalMoney)}</span>.
          </p>
          <div className="flex justify-center gap-2">
            <Button
              variant="secondary"
              onClick={() => {
                setConfirmedInvoice(null)
                onSaleConfirmed?.()
              }}
            >
              View in Invoices
            </Button>
            <Button onClick={() => setConfirmedInvoice(null)}>Start a new sale</Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Sale details</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
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

          <FormField label="Customer">
            <div className="flex gap-1">
              <Select value={customerId} onValueChange={setCustomerId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a customer" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button type="button" variant="secondary" size="sm" onClick={() => setCustomerDialogOpen(true)}>
                New
              </Button>
            </div>
          </FormField>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Add items</CardTitle>
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by SKU or name..."
            className="w-56"
          />
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>SKU</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Karat</TableHead>
                <TableHead className="text-right">Net Weight</TableHead>
                <TableHead className="text-right">Suggested Price</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {availableItems.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="py-8 text-center text-slate-green">
                    No in-stock items match.
                  </TableCell>
                </TableRow>
              )}
              {availableItems.map((item) => {
                const suggested = priceLine({ item, ratePerGramMoney: goldRateForKarat(item.karat) }).lineTotalMoney
                return (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.sku}</TableCell>
                    <TableCell>{item.name}</TableCell>
                    <TableCell className="tabular-nums">{item.karat}K</TableCell>
                    <TableCell className="text-right tabular-nums">{formatWeight(item.netWeightMg)}</TableCell>
                    <TableCell className="text-right tabular-nums">{formatMoney(suggested)}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => addItem(item)}>
                        Add to sale
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sale lines</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {lines.length === 0 && <p className="py-4 text-center text-sm text-slate-green">No items added yet.</p>}
          {pricedLines.map(({ line, priced }) => (
            <div key={line.key} className="rounded-[var(--radius-card)] border border-border-soft p-3">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-sm font-medium text-charcoal">
                  {line.item.name} <span className="text-slate-green">({line.item.sku})</span>
                </p>
                <Badge tone="neutral">{formatWeight(line.item.netWeightMg)}</Badge>
              </div>
              <div className="grid gap-2 sm:grid-cols-[1fr_1fr_1fr_1fr_auto]">
                <FormField label="Rate / g (AED)">
                  <NumberInput
                    value={line.ratePerGramAED}
                    onValueChange={(v) => updateLine(line.key, { ratePerGramAED: v })}
                  />
                </FormField>
                <FormField label="Making %">
                  <NumberInput
                    value={line.makingChargePercent}
                    onValueChange={(v) => updateLine(line.key, { makingChargePercent: v })}
                  />
                </FormField>
                <FormField label="Stone charge (AED)">
                  <NumberInput
                    value={line.stoneChargeAED}
                    onValueChange={(v) => updateLine(line.key, { stoneChargeAED: v })}
                  />
                </FormField>
                <FormField label="Discount (AED)">
                  <NumberInput value={line.discountAED} onValueChange={(v) => updateLine(line.key, { discountAED: v })} />
                </FormField>
                <div className="flex items-end justify-end pb-0.5">
                  <Button type="button" variant="ghost" size="sm" onClick={() => removeLine(line.key)}>
                    Remove
                  </Button>
                </div>
              </div>
              <p className="mt-1 text-right text-xs text-slate-green">
                Line total: <span className="tabular-nums text-charcoal">{formatMoney(priced.lineTotalMoney)}</span>
              </p>
            </div>
          ))}

          <div className="flex justify-end border-t border-border-soft pt-3 text-sm">
            <div className="space-y-1 text-right">
              <p>
                Subtotal: <span className="tabular-nums text-charcoal">{formatMoney(invoiceTotals.subtotalMoney)}</span>
              </p>
              <p>
                {settings.tax.name} ({settings.tax.enabled ? `${settings.tax.rateBp / 100}%` : 'disabled'}):{' '}
                <span className="tabular-nums text-charcoal">{formatMoney(invoiceTotals.taxMoney)}</span>
              </p>
              <p className="font-semibold">
                Total: <span className="tabular-nums text-charcoal">{formatMoney(invoiceTotals.totalMoney)}</span>
              </p>
            </div>
          </div>

          {error && <p className="text-right text-xs text-error">{error}</p>}

          <div className="flex justify-end">
            <Can module="retail-sales" action="create">
              <Button onClick={handleConfirmSale} disabled={lines.length === 0}>
                Confirm Sale
              </Button>
            </Can>
          </div>
        </CardContent>
      </Card>

      <CustomerDialog
        open={customerDialogOpen}
        onOpenChange={setCustomerDialogOpen}
        onCreated={(id) => setCustomerId(id)}
      />
    </div>
  )
}
