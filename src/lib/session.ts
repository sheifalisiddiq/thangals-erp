import { useSyncExternalStore } from 'react'
import type { Role } from './roles'

export interface Session {
  roleId: string
  roleLabel: string
  loggedInAt: string
}

const STORAGE_KEY = 'thangals-erp-session'
const listeners = new Set<() => void>()

function readSession(): Session | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as Session) : null
  } catch {
    return null
  }
}

let cached = readSession()

function emit() {
  listeners.forEach((l) => l())
}

export function login(role: Role) {
  cached = { roleId: role.id, roleLabel: role.label, loggedInAt: new Date().toISOString() }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cached))
  emit()
}

export function logout() {
  cached = null
  localStorage.removeItem(STORAGE_KEY)
  emit()
}

export function resetDemoData() {
  const keysToKeep = new Set([STORAGE_KEY])
  Object.keys(localStorage)
    .filter((k) => k.startsWith('thangals-erp-') && !keysToKeep.has(k))
    .forEach((k) => localStorage.removeItem(k))
  emit()
}

export function useSession(): Session | null {
  return useSyncExternalStore(
    (onChange) => {
      listeners.add(onChange)
      return () => listeners.delete(onChange)
    },
    () => cached,
  )
}
