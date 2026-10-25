import { useState } from 'react'
import { Can } from '@/components/can'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatMoney } from '@/lib/format'
import { usePurchases } from '@/lib/stores/purchases'
import { SupplierDialog } from './supplier-dialog'

export function SupplierList() {
  const { suppliers } = usePurchases()
  const [createOpen, setCreateOpen] = useState(false)

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Can module="purchases" action="create">
          <Button onClick={() => setCreateOpen(true)}>Add Supplier</Button>
        </Can>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Suppliers</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Address</TableHead>
                <TableHead className="text-right">Opening Balance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {suppliers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="py-8 text-center text-slate-green">
                    No suppliers yet.
                  </TableCell>
                </TableRow>
              )}
              {suppliers.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">{s.name}</TableCell>
                  <TableCell className="text-slate-green">{s.contact}</TableCell>
                  <TableCell className="text-slate-green">{s.phone}</TableCell>
                  <TableCell className="text-slate-green">{s.address}</TableCell>
                  <TableCell className="text-right tabular-nums">
                    <Can.Money>{formatMoney(s.openingBalanceMoney)}</Can.Money>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <SupplierDialog open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  )
}
