import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { usePermission } from '@/lib/use-permission'
import { ArAp } from './ar-ap'
import { CashBank } from './cash-bank'
import { ChartOfAccounts } from './chart-of-accounts'
import { Journal } from './journal'

function FinancePageInner() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-semibold text-charcoal">Finance &amp; Accounting</h2>
        <p className="text-sm text-slate-green">Chart of accounts, journal postings, receivables/payables and cash &amp; bank.</p>
      </div>

      <Tabs defaultValue="chart-of-accounts">
        <TabsList>
          <TabsTrigger value="chart-of-accounts">Chart of Accounts</TabsTrigger>
          <TabsTrigger value="journal">Journal</TabsTrigger>
          <TabsTrigger value="ar-ap">AR / AP</TabsTrigger>
          <TabsTrigger value="cash-bank">Cash &amp; Bank</TabsTrigger>
        </TabsList>

        <TabsContent value="chart-of-accounts">
          <ChartOfAccounts />
        </TabsContent>
        <TabsContent value="journal">
          <Journal />
        </TabsContent>
        <TabsContent value="ar-ap">
          <ArAp />
        </TabsContent>
        <TabsContent value="cash-bank">
          <CashBank />
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Defense in depth: the sidebar already won't link here if the role can't see this module, but
// a direct navigation should still be gated.
export function FinancePage() {
  const { can } = usePermission()
  if (!can('finance', 'view')) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-sm text-slate-green">You don&apos;t have access to this module.</p>
      </div>
    )
  }
  return <FinancePageInner />
}
