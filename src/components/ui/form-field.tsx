import type { ReactNode } from 'react'
import { Label } from './label'
import { cn } from '@/lib/cn'

export function FormField({
  label,
  error,
  htmlFor,
  className,
  children,
}: {
  label: string
  error?: string
  htmlFor?: string
  className?: string
  children: ReactNode
}) {
  return (
    <div className={cn('space-y-1.5', className)}>
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {error && <p className="text-xs text-error">{error}</p>}
    </div>
  )
}
