import type { ComponentProps } from 'react'
import { cn } from '@/lib/cn'

export function Input({ className, ...props }: ComponentProps<'input'>) {
  return (
    <input
      className={cn(
        'flex h-10 w-full rounded-[var(--radius-card)] border border-border-soft bg-surface px-3 text-sm text-charcoal outline-none transition-colors placeholder:text-slate-green/60 focus:border-brand-emerald disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    />
  )
}

/**
 * Numeric input for Money/WeightMg fields: displays/edits a plain decimal value and reports
 * it back via onValueChange, so callers convert through decimal.ts's toMoney/toGrams at the
 * boundary rather than doing float math on keystrokes.
 */
export function NumberInput({
  className,
  value,
  onValueChange,
  step = 'any',
  ...props
}: Omit<ComponentProps<'input'>, 'value' | 'onChange' | 'type'> & {
  value: number
  onValueChange: (value: number) => void
}) {
  return (
    <input
      type="number"
      inputMode="decimal"
      step={step}
      value={Number.isFinite(value) ? value : ''}
      onChange={(e) => {
        const next = e.target.valueAsNumber
        onValueChange(Number.isNaN(next) ? 0 : next)
      }}
      className={cn(
        'flex h-10 w-full rounded-[var(--radius-card)] border border-border-soft bg-surface px-3 text-right text-sm tabular-nums text-charcoal outline-none transition-colors focus:border-brand-emerald disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    />
  )
}
