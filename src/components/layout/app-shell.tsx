import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Sidebar } from './sidebar'
import { Topbar } from './topbar'
import { DemoBanner } from '@/components/shared/demo-banner'
import { NAV_GROUPS } from '@/lib/nav'
import type { Session } from '@/lib/session'

export function AppShell({ session }: { session: Session }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()
  const current = NAV_GROUPS.find((g) => location.pathname.startsWith(g.path))

  return (
    <div className="flex h-screen overflow-hidden bg-ivory">
      <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <DemoBanner />
        <Topbar title={current?.label ?? 'Overview'} session={session} onMenuClick={() => setMenuOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
