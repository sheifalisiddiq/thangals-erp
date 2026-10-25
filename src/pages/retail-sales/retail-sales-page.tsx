import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { usePermission } from '@/lib/use-permission'
import { CustomerList } from './customer-list'
import { NewSale } from './new-sale'
import { SalesInvoiceList } from './sales-invoice-list'

function RetailSalesPageInner() {
  // Controlled (rather than defaultValue) so a successful "Confirm Sale" in NewSale can jump
  // the user straight to the Invoices tab to see the invoice they just created.
  const [tab, setTab] = useState('customers')

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-semibold text-charcoal">Retail Sales</h2>
        <p className="text-sm text-slate-green">Customer profiles, billing and sales invoices.</p>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="new-sale">New Sale</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
        </TabsList>

        <TabsContent value="customers">
          <CustomerList />
        </TabsContent>
        <TabsContent value="new-sale">
          <NewSale onSaleConfirmed={() => setTab('invoices')} />
        </TabsContent>
        <TabsContent value="invoices">
          <SalesInvoiceList />
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Defense in depth: the sidebar already won't link here if the role can't see this module, but
// a direct navigation should still be gated.
export function RetailSalesPage() {
  const { can } = usePermission()
  if (!can('retail-sales', 'view')) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-sm text-slate-green">You don&apos;t have access to this module.</p>
      </div>
    )
  }
  return <RetailSalesPageInner />
}
