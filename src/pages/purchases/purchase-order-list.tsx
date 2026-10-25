import { useState } from 'react'
import { Can } from '@/components/can'
import { Badge, type BadgeTone } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import type { PurchaseOrder } from '@/lib/domain-types'
import { formatDateTime, formatMoney } from '@/lib/format'
import { receiveGoods } from '@/lib/ledger'
import { useBranches } from '@/lib/stores/branches'
import { cancelPurchaseOrder, sendPurchaseOrder, usePurchases } from '@/lib/stores/purchases'
import { PurchaseOrderDialog } from './purchase-order-dialog'

const STATUS_TONE: Record<PurchaseOrder['status'], BadgeTone> = {
  draft: 'neutral',
  sent: 'info',
  received: 'success',
  closed: 'neutral',
  cancelled: 'error',
}

const STATUS_LABEL: Record<PurchaseOrder['status'], string> = {
  draft: 'Draft',
  sent: 'Sent',
  received: 'Received',
  closed: 'Closed',
  cancelled: 'Cancelled',
}

export function PurchaseOrderList() {
  const { purchaseOrders, suppliers } = usePurchases()
  const branches = useBranches()
  const [createOpen, setCreateOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [receivedMsg, setReceivedMsg] = useState<string | null>(null)

  function supplierName(id: string): string {
    return suppliers.find((s) => s.id === id)?.name ?? 'Unknown supplier'
  }
  function branchName(id: string): string {
    return branches.find((b) => b.id === id)?.name ?? 'Unknown branch'
  }

  function handleSend(poId: string) {
    try {
      sendPurchaseOrder(poId)
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not send PO.')
    }
  }

  function handleCancel(poId: string) {
    try {
      cancelPurchaseOrder(poId)
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not cancel PO.')
    }
  }

  function handleReceive(po: PurchaseOrder) {
    try {
      receiveGoods(po)
      setError(null)
      setReceivedMsg(`Goods received for ${po.poNumber} — inventory items created.`)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not receive goods.')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Can module="purchases" action="create">
          <Button onClick={() => setCreateOpen(true)}>New PO</Button>
        </Can>
      </div>

      {receivedMsg && <p className="text-xs text-success">{receivedMsg}</p>}
      {error && <p className="text-xs text-error">{error}</p>}

      <Card>
        <CardHeader>
          <CardTitle>Purchase Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>PO Number</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead>Branch</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {purchaseOrders.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="py-8 text-center text-slate-green">
                    No purchase orders yet.
                  </TableCell>
                </TableRow>
              )}
              {purchaseOrders.map((po) => (
                <TableRow key={po.id}>
                  <TableCell className="font-medium">{po.poNumber}</TableCell>
                  <TableCell className="text-slate-green">{supplierName(po.supplierId)}</TableCell>
                  <TableCell className="text-slate-green">{branchName(po.branchId)}</TableCell>
                  <TableCell>
                    <Badge tone={STATUS_TONE[po.status]}>{STATUS_LABEL[po.status]}</Badge>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    <Can.Money>{formatMoney(po.totalMoney)}</Can.Money>
                  </TableCell>
                  <TableCell className="text-slate-green">{formatDateTime(po.createdAt)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1.5">
                      {po.status === 'draft' && (
                        <Can module="purchases" action="edit">
                          <Button variant="ghost" size="sm" onClick={() => handleSend(po.id)}>
                            Send
                          </Button>
                        </Can>
                      )}
                      {po.status === 'sent' && (
                        <Can module="purchases" action="create">
                          <Button variant="ghost" size="sm" onClick={() => handleReceive(po)}>
                            Receive
                          </Button>
                        </Can>
                      )}
                      {(po.status === 'draft' || po.status === 'sent') && (
                        <Can module="purchases" action="cancel">
                          <Button variant="ghost" size="sm" onClick={() => handleCancel(po.id)}>
                            Cancel
                          </Button>
                        </Can>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <PurchaseOrderDialog open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  )
}
