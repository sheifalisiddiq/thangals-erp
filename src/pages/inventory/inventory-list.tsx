import { useMemo, useState } from 'react'
import { Can } from '@/components/can'
import { Badge, type BadgeTone } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { FormField } from '@/components/ui/form-field'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
import { toGrams } from '@/lib/decimal'
import type { InventoryItem } from '@/lib/domain-types'
import { formatMoney, formatWeight } from '@/lib/format'
import { adjustStock } from '@/lib/ledger'
import { goldRateForKarat } from '@/lib/settings'
import { useBranches } from '@/lib/stores/branches'
import { useInventory } from '@/lib/stores/inventory'
import { usePermission } from '@/lib/use-permission'
import { InventoryItemDialog } from './inventory-item-dialog'
import { InventoryValuation } from './inventory-valuation'
import { ItemHistory } from './item-history'
import { StockTransferDialog } from './stock-transfer-dialog'

const STATUS_TONE: Record<InventoryItem['status'], BadgeTone> = {
  'in-stock': 'success',
  reserved: 'warning',
  quarantined: 'warning',
  sold: 'neutral',
  transferred: 'neutral',
}

const STATUS_LABEL: Record<InventoryItem['status'], string> = {
  'in-stock': 'In Stock',
  reserved: 'Reserved',
  quarantined: 'Quarantined',
  sold: 'Sold',
  transferred: 'Transferred',
}

const OWNERSHIP_LABEL: Record<InventoryItem['ownership'], string> = {
  company: 'Company',
  customer: 'Customer',
  'supplier-consignment': 'Supplier Consignment',
}

const ADJUSTABLE_STATUSES: InventoryItem['status'][] = ['in-stock', 'reserved', 'quarantined']

function AdjustStockDialog({
  itemId,
  open,
  onOpenChange,
}: {
  itemId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const inventory = useInventory()
  const item = inventory.items.find((i) => i.id === itemId)
  const [note, setNote] = useState('')
  const [newStatus, setNewStatus] = useState<string>('')
  const [error, setError] = useState<string | null>(null)

  function handleOpenChange(next: boolean) {
    if (next) {
      setNote('')
      setNewStatus('')
      setError(null)
    }
    onOpenChange(next)
  }

  function handleSubmit() {
    if (!itemId || !note.trim()) {
      setError('A reason note is required.')
      return
    }
    try {
      adjustStock(itemId, note.trim(), (newStatus || undefined) as InventoryItem['status'] | undefined)
      handleOpenChange(false)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Adjustment failed.')
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adjust Stock</DialogTitle>
          <DialogDescription>{item ? `${item.name} (${item.sku})` : 'Record a stock adjustment.'}</DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <FormField label="New status (optional)">
            <Select value={newStatus} onValueChange={setNewStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Keep current status" />
              </SelectTrigger>
              <SelectContent>
                {ADJUSTABLE_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {STATUS_LABEL[s]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>

          <FormField label="Reason" error={error ?? undefined}>
            <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Reason for this adjustment..." />
          </FormField>
        </div>

        <DialogFooter>
          <Button variant="secondary" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Save adjustment</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function InventoryListInner() {
  const inventory = useInventory()
  const branches = useBranches()

  const [branchFilter, setBranchFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [createOpen, setCreateOpen] = useState(false)
  const [adjustItemId, setAdjustItemId] = useState<string | null>(null)
  const [transferItemId, setTransferItemId] = useState<string | null>(null)
  const [historyItemId, setHistoryItemId] = useState<string | null>(null)

  const filteredItems = useMemo(() => {
    return inventory.items.filter((item) => {
      if (branchFilter !== 'all' && item.branchId !== branchFilter) return false
      if (statusFilter !== 'all' && item.status !== statusFilter) return false
      return true
    })
  }, [inventory.items, branchFilter, statusFilter])

  function branchName(id: string): string {
    return branches.find((b) => b.id === id)?.name ?? 'Unknown branch'
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-semibold text-charcoal">Inventory &amp; Vault</h2>
          <p className="text-sm text-slate-green">Stock items across branches and the central vault.</p>
        </div>
        <Can module="inventory" action="create">
          <Button onClick={() => setCreateOpen(true)}>Add item</Button>
        </Can>
      </div>

      <InventoryValuation items={inventory.items} />

      <Card>
        <CardHeader>
          <CardTitle>Items</CardTitle>
          <div className="flex flex-wrap gap-2">
            <Select value={branchFilter} onValueChange={setBranchFilter}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Branch" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All branches</SelectItem>
                {branches.map((b) => (
                  <SelectItem key={b.id} value={b.id}>
                    {b.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {(Object.keys(STATUS_LABEL) as InventoryItem['status'][]).map((s) => (
                  <SelectItem key={s} value={s}>
                    {STATUS_LABEL[s]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>SKU</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Karat</TableHead>
                <TableHead className="text-right">Net Weight</TableHead>
                <TableHead>Branch</TableHead>
                <TableHead>Ownership</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Valuation</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} className="py-8 text-center text-slate-green">
                    No items match the current filters.
                  </TableCell>
                </TableRow>
              )}
              {filteredItems.map((item) => {
                const grams = toGrams(item.netWeightMg)
                const valuation = Math.round(goldRateForKarat(item.karat) * grams)
                return (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.sku}</TableCell>
                    <TableCell>{item.name}</TableCell>
                    <TableCell className="tabular-nums">{item.karat}K</TableCell>
                    <TableCell className="text-right tabular-nums">{formatWeight(item.netWeightMg)}</TableCell>
                    <TableCell className="text-slate-green">{branchName(item.branchId)}</TableCell>
                    <TableCell className="text-slate-green">{OWNERSHIP_LABEL[item.ownership]}</TableCell>
                    <TableCell>
                      <Badge tone={STATUS_TONE[item.status]}>{STATUS_LABEL[item.status]}</Badge>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      <Can.Money>{formatMoney(valuation)}</Can.Money>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1.5">
                        <Can module="inventory" action="view">
                          <Button variant="ghost" size="sm" onClick={() => setHistoryItemId(item.id)}>
                            History
                          </Button>
                        </Can>
                        <Can module="inventory" action="edit">
                          <Button variant="ghost" size="sm" onClick={() => setAdjustItemId(item.id)}>
                            Adjust
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => setTransferItemId(item.id)}>
                            Transfer
                          </Button>
                        </Can>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <InventoryItemDialog open={createOpen} onOpenChange={setCreateOpen} />
      <AdjustStockDialog itemId={adjustItemId} open={adjustItemId !== null} onOpenChange={(o) => !o && setAdjustItemId(null)} />
      <StockTransferDialog itemId={transferItemId} open={transferItemId !== null} onOpenChange={(o) => !o && setTransferItemId(null)} />
      <ItemHistory itemId={historyItemId} open={historyItemId !== null} onOpenChange={(o) => !o && setHistoryItemId(null)} />
    </div>
  )
}

// Defense in depth: the sidebar already won't link here if the role can't see this module, but
// a direct navigation should still be gated.
export function InventoryList() {
  const { can } = usePermission()
  if (!can('inventory', 'view')) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-sm text-slate-green">You don&apos;t have access to this module.</p>
      </div>
    )
  }
  return <InventoryListInner />
}
