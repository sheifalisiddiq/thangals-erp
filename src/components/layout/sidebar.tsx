import { NavLink } from 'react-router-dom'
import { NAV_GROUPS } from '@/lib/nav'
import { cn } from '@/lib/cn'
import { usePermission } from '@/lib/use-permission'

export function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { visibleModules } = usePermission()
  const groups = NAV_GROUPS.filter((g) => visibleModules.includes(g.id))

  return (
    <>
      {open && (
        <button
          aria-label="Close navigation"
          className="fixed inset-0 z-30 bg-black/30 md:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex w-64 shrink-0 flex-col bg-brand-emerald-deep transition-transform md:static md:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex items-center justify-center px-5 py-6">
          <img src="/brand/logo-dark.jpg" alt="THANGALS" className="h-28 w-28 rounded-xl object-cover" />
        </div>

        <nav className="flex-1 overflow-y-auto px-3 pb-4">
          <ul className="space-y-0.5">
            {groups.map((group) => (
              <li key={group.id}>
                <NavLink
                  to={group.path}
                  onClick={onClose}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-white/80 transition-colors hover:bg-white/5 hover:text-white',
                      isActive && 'bg-nav-selected text-brand-emerald-deep hover:bg-nav-selected hover:text-brand-emerald-deep',
                    )
                  }
                >
                  <group.icon className="h-4 w-4 shrink-0" />
                  <span className="flex-1">{group.label}</span>
                  {group.status === 'planned' && (
                    <span className="rounded-full bg-white/10 px-1.5 py-0.5 text-[10px] font-medium text-white/60">
                      Soon
                    </span>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="border-t border-white/10 px-5 py-4 text-[11px] text-white/40">
          Demo build — frontend only
        </div>
      </aside>
    </>
  )
}
