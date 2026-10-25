import { Navigate, Route, Routes } from 'react-router-dom'
import { LoginPage } from '@/pages/login-page'
import { AppShell } from '@/components/layout/app-shell'
import { OwnerDashboard } from '@/pages/dashboard/owner-dashboard'
import { InventoryList } from '@/pages/inventory/inventory-list'
import { FinancePage } from '@/pages/finance/finance-page'
import { PurchasesPage } from '@/pages/purchases/purchases-page'
import { RetailSalesPage } from '@/pages/retail-sales/retail-sales-page'
import { ModuleStub } from '@/pages/stubs/module-stub'
import { NAV_GROUPS } from '@/lib/nav'
import { useSession } from '@/lib/session'

export default function App() {
  const session = useSession()

  if (!session) {
    return (
      <Routes>
        <Route path="*" element={<LoginPage />} />
      </Routes>
    )
  }

  return (
    <Routes>
      <Route element={<AppShell session={session} />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<OwnerDashboard />} />
        <Route path="/inventory" element={<InventoryList />} />
        <Route path="/purchases" element={<PurchasesPage />} />
        <Route path="/retail-sales" element={<RetailSalesPage />} />
        <Route path="/finance" element={<FinancePage />} />
        {NAV_GROUPS.filter((g) => g.status === 'planned').map((g) => (
          <Route key={g.id} path={g.path} element={<ModuleStub />} />
        ))}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  )
}
