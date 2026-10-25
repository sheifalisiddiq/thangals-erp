import { useState } from 'react'
import { Menu, Search, Bell, ChevronDown, LogOut, RotateCcw } from 'lucide-react'
import { DASHBOARD_META } from '@/lib/demo-data'
import { logout, resetDemoData, type Session } from '@/lib/session'
import { Button } from '@/components/ui/button'

export function Topbar({
  title,
  session,
  onMenuClick,
}: {
  title: string
  session: Session
  onMenuClick: () => void
}) {
  const [branch, setBranch] = useState(DASHBOARD_META.branches[0])
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="flex h-16 shrink-0 items-center gap-3 border-b border-border-soft bg-surface px-4 md:px-6">
      <button
        aria-label="Open navigation"
        className="rounded-lg p-2 text-charcoal hover:bg-ivory md:hidden"
        onClick={onMenuClick}
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="min-w-0 flex-1">
        <p className="truncate text-xs text-slate-green">THANGALS ERP / {title}</p>
        <h1 className="truncate text-base font-semibold text-charcoal">{title}</h1>
      </div>

      <div className="hidden items-center gap-2 lg:flex">
        <div className="flex items-center gap-2 rounded-lg border border-border-soft px-3 py-2">
          <Search className="h-4 w-4 text-slate-green" aria-hidden />
          <input
            placeholder="Search customers, items, invoices..."
            className="w-56 bg-transparent text-sm text-charcoal outline-none placeholder:text-slate-green"
            aria-label="Search"
          />
        </div>
        <select
          aria-label="Branch"
          value={branch}
          onChange={(e) => setBranch(e.target.value)}
          className="rounded-lg border border-border-soft bg-surface px-3 py-2 text-sm text-charcoal"
        >
          {DASHBOARD_META.branches.map((b) => (
            <option key={b}>{b}</option>
          ))}
        </select>
        <span className="rounded-lg border border-border-soft px-3 py-2 text-sm text-slate-green">FY 2026–27</span>
      </div>

      <button aria-label="Notifications" className="relative rounded-lg p-2 text-charcoal hover:bg-ivory">
        <Bell className="h-5 w-5" />
        <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-error" />
      </button>

      <div className="relative">
        <button
          onClick={() => setMenuOpen((v) => !v)}
          className="flex items-center gap-2 rounded-lg border border-border-soft px-2 py-1.5 hover:bg-ivory"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-emerald text-xs font-semibold text-white">
            {session.roleLabel.slice(0, 1)}
          </span>
          <span className="hidden text-left sm:block">
            <span className="block text-xs font-medium text-charcoal">{session.roleLabel}</span>
            <span className="block text-[11px] text-slate-green">Demo user</span>
          </span>
          <ChevronDown className="h-4 w-4 text-slate-green" />
        </button>
        {menuOpen && (
          <div className="absolute right-0 z-20 mt-2 w-56 rounded-lg border border-border-soft bg-surface py-1 shadow-lg">
            <div className="border-b border-border-soft px-3 py-2">
              <p className="text-xs text-slate-green">Signed in as</p>
              <p className="text-sm font-medium text-charcoal">{session.roleLabel}</p>
            </div>
            <button
              onClick={() => {
                resetDemoData()
                setMenuOpen(false)
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-charcoal hover:bg-ivory"
            >
              <RotateCcw className="h-4 w-4" /> Reset demo data
            </button>
            <button
              onClick={() => logout()}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-error hover:bg-error-bg"
            >
              <LogOut className="h-4 w-4" /> Log out
            </button>
          </div>
        )}
      </div>

      <Button variant="secondary" size="sm" className="hidden lg:inline-flex" onClick={() => logout()}>
        Switch role
      </Button>
    </header>
  )
}
