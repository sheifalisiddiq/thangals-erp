import { useState } from 'react'
import { Can } from '@/components/can'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatMoney } from '@/lib/format'
import { useSales } from '@/lib/stores/sales'
import { CustomerDialog } from './customer-dialog'

export function CustomerList() {
  const { customers } = useSales()
  const [createOpen, setCreateOpen] = useState(false)

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Can module="retail-sales" action="create">
          <Button onClick={() => setCreateOpen(true)}>Add Customer</Button>
        </Can>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Customers</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Address</TableHead>
                <TableHead className="text-right">Opening Balance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="py-8 text-center text-slate-green">
                    No customers yet.
                  </TableCell>
                </TableRow>
              )}
              {customers.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell className="text-slate-green">{c.phone}</TableCell>
                  <TableCell className="text-slate-green">{c.address}</TableCell>
                  <TableCell className="text-right tabular-nums">
                    <Can.Money>{formatMoney(c.openingBalanceMoney)}</Can.Money>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <CustomerDialog open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  )
}
