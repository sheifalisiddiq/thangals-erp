import { useLocation } from 'react-router-dom'
import { Construction } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { NAV_GROUPS } from '@/lib/nav'

export function ModuleStub() {
  const location = useLocation()
  const group = NAV_GROUPS.find((g) => location.pathname.startsWith(g.path))

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <Card className="max-w-md">
        <CardContent className="flex flex-col items-center gap-3 pt-8 pb-8">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-nav-selected text-brand-emerald-deep">
            <Construction className="h-6 w-6" />
          </span>
          <h2 className="font-display text-xl font-semibold text-charcoal">{group?.label ?? 'Module'}</h2>
          <p className="text-sm text-slate-green">
            This module is planned for a later build phase. The current demo focuses on the Owner dashboard.
          </p>
          <span className="rounded-full bg-warning-bg px-3 py-1 text-xs font-medium text-warning">
            Coming soon — not yet implemented
          </span>
        </CardContent>
      </Card>
    </div>
  )
}
