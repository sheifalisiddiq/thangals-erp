import type { ComponentProps } from 'react'
import { cn } from '@/lib/cn'

export function Textarea({ className, ...props }: ComponentProps<'textarea'>) {
  return (
    <textarea
      className={cn(
        'flex min-h-[80px] w-full rounded-[var(--radius-card)] border border-border-soft bg-surface px-3 py-2 text-sm text-charcoal outline-none transition-colors placeholder:text-slate-green/60 focus:border-brand-emerald disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    />
  )
}
