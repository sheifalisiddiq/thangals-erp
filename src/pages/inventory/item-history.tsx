import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useBranches } from '@/lib/stores/branches'
import { useInventory } from '@/lib/stores/inventory'
import { formatDateTime } from '@/lib/format'

const TYPE_LABEL: Record<string, string> = {
  receipt: 'Goods receipt',
  adjustment: 'Adjustment',
  'transfer-out': 'Transfer out',
  'transfer-in': 'Transfer in',
  sale: 'Sale',
  quarantine: 'Quarantine',
  release: 'Release',
}

export function ItemHistory({
  itemId,
  open,
  onOpenChange,
}: {
  itemId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const inventory = useInventory()
  const branches = useBranches()

  const item = inventory.items.find((i) => i.id === itemId)
  const movements = inventory.movements
    .filter((m) => m.itemId === itemId)
    .slice()
    .sort((a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime())

  function branchName(id?: string): string {
    if (!id) return '—'
    return branches.find((b) => b.id === id)?.name ?? 'Unknown branch'
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Item History{item ? ` — ${item.sku}` : ''}</DialogTitle>
          <DialogDescription>{item ? item.name : 'Stock movement history for this item.'}</DialogDescription>
        </DialogHeader>

        {movements.length === 0 ? (
          <p className="text-sm text-slate-green">No movements recorded for this item yet.</p>
        ) : (
          <div className="max-h-96 space-y-2 overflow-y-auto">
            {movements.map((m) => (
              <div key={m.id} className="rounded-[var(--radius-card)] border border-border-soft p-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-charcoal">{TYPE_LABEL[m.type] ?? m.type}</span>
                  <span className="text-xs text-slate-green">{formatDateTime(m.postedAt)}</span>
                </div>
                <div className="mt-1 text-xs text-slate-green">
                  {m.relatedBranchId
                    ? m.type === 'transfer-in'
                      ? `${branchName(m.relatedBranchId)} → ${branchName(m.branchId)}`
                      : `${branchName(m.branchId)} → ${branchName(m.relatedBranchId)}`
                    : branchName(m.branchId)}
                </div>
                {m.note && <div className="mt-1 text-xs text-charcoal">{m.note}</div>}
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
