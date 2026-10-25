import { useSession } from './session'
import { can, canSeeModule, canSeeSensitiveFinance, isDashboardReadOnly, visibleModules, type Action } from './permissions'
import type { ModuleId } from './nav'

export function usePermission() {
  const session = useSession()
  const roleId = session?.roleId ?? ''
  return {
    roleId,
    can: (moduleId: ModuleId, action: Action) => can(roleId, moduleId, action),
    canSeeModule: (moduleId: ModuleId) => canSeeModule(roleId, moduleId),
    canSeeSensitiveFinance: canSeeSensitiveFinance(roleId),
    dashboardReadOnly: isDashboardReadOnly(roleId),
    visibleModules: visibleModules(roleId),
  }
}
