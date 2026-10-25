import { CHANNEL_SALES } from '@/lib/demo-data'
import { formatAEDCompact } from '@/lib/format'

const COLORS = ['#006653', '#c5a16d', '#1d5fae', '#64736d']

export function ChannelBars() {
  const max = Math.max(...CHANNEL_SALES.map((c) => c.value))
  return (
    <div className="space-y-3">
      {CHANNEL_SALES.map((c, i) => (
        <div key={c.channel}>
          <div className="mb-1 flex items-center justify-between text-xs">
            <span className="font-medium text-charcoal">{c.channel}</span>
            <span className="tabular-nums text-slate-green">{formatAEDCompact(c.value)}</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-ivory">
            <div
              className="h-full rounded-full"
              style={{ width: `${(c.value / max) * 100}%`, backgroundColor: COLORS[i % COLORS.length] }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}
