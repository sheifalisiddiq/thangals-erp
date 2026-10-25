import type { ReactNode } from 'react'
import type { ModuleId } from '@/lib/nav'
import type { Action } from '@/lib/permissions'
import { usePermission } from '@/lib/use-permission'

/** Renders children only if the logged-in role has `action` on `module`; otherwise renders nothing. */
export function Can({ module, action, children }: { module: ModuleId; action: Action; children: ReactNode }) {
  const { can } = usePermission()
  if (!can(module, action)) return null
  return <>{children}</>
}

/** Masks sensitive financial figures ("•••") for roles without sensitiveFinance access. */
Can.Money = function CanMoney({ children }: { children: ReactNode }) {
  const { canSeeSensitiveFinance } = usePermission()
  if (!canSeeSensitiveFinance) return <span className="text-slate-green">•••••</span>
  return <>{children}</>
}
