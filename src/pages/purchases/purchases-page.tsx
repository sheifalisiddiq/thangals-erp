import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { usePermission } from '@/lib/use-permission'
import { PurchaseOrderList } from './purchase-order-list'
import { SupplierInvoiceList } from './supplier-invoice-list'
import { SupplierList } from './supplier-list'

function PurchasesPageInner() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-semibold text-charcoal">Purchases &amp; Suppliers</h2>
        <p className="text-sm text-slate-green">Supplier profiles, purchase orders, goods receipt and supplier invoices.</p>
      </div>

      <Tabs defaultValue="suppliers">
        <TabsList>
          <TabsTrigger value="suppliers">Suppliers</TabsTrigger>
          <TabsTrigger value="purchase-orders">Purchase Orders</TabsTrigger>
          <TabsTrigger value="supplier-invoices">Supplier Invoices</TabsTrigger>
        </TabsList>

        <TabsContent value="suppliers">
          <SupplierList />
        </TabsContent>
        <TabsContent value="purchase-orders">
          <PurchaseOrderList />
        </TabsContent>
        <TabsContent value="supplier-invoices">
          <SupplierInvoiceList />
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Defense in depth: the sidebar already won't link here if the role can't see this module, but
// a direct navigation should still be gated.
export function PurchasesPage() {
  const { can } = usePermission()
  if (!can('purchases', 'view')) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-sm text-slate-green">You don&apos;t have access to this module.</p>
      </div>
    )
  }
  return <PurchasesPageInner />
}
