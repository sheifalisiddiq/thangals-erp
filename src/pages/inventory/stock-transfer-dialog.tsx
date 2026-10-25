import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { FormField } from '@/components/ui/form-field'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { transferStock } from '@/lib/ledger'
import { useBranches } from '@/lib/stores/branches'
import { useInventory } from '@/lib/stores/inventory'

export function StockTransferDialog({
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
  const [toBranchId, setToBranchId] = useState<string>('')
  const [error, setError] = useState<string | null>(null)

  const item = inventory.items.find((i) => i.id === itemId)
  const destinationOptions = branches.filter((b) => b.id !== item?.branchId)

  function handleOpenChange(next: boolean) {
    if (next) {
      setToBranchId('')
      setError(null)
    }
    onOpenChange(next)
  }

  function handleSubmit() {
    if (!itemId || !toBranchId) {
      setError('Choose a destination branch.')
      return
    }
    try {
      transferStock(itemId, toBranchId)
      handleOpenChange(false)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Transfer failed.')
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Transfer Stock</DialogTitle>
          <DialogDescription>
            {item ? `${item.name} (${item.sku})` : 'Move this item to another branch or the vault.'}
          </DialogDescription>
        </DialogHeader>

        <FormField label="Destination branch" error={error ?? undefined}>
          <Select value={toBranchId} onValueChange={setToBranchId}>
            <SelectTrigger>
              <SelectValue placeholder="Select a branch" />
            </SelectTrigger>
            <SelectContent>
              {destinationOptions.map((b) => (
                <SelectItem key={b.id} value={b.id}>
                  {b.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>

        <DialogFooter>
          <Button variant="secondary" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Transfer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
