import { SALES_TREND } from '@/lib/demo-data'

const WIDTH = 560
const HEIGHT = 160
const PADDING = 24

export function SalesTrendChart() {
  const values = SALES_TREND.map((d) => d.value)
  const max = Math.max(...values)
  const min = Math.min(...values)
  const range = max - min || 1

  const points = SALES_TREND.map((d, i) => {
    const x = PADDING + (i / (SALES_TREND.length - 1)) * (WIDTH - PADDING * 2)
    const y = HEIGHT - PADDING - ((d.value - min) / range) * (HEIGHT - PADDING * 2)
    return { x, y, d }
  })

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${HEIGHT - PADDING} L ${points[0].x} ${HEIGHT - PADDING} Z`

  return (
    <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full" role="img" aria-label="Sales trend over the month">
      <defs>
        <linearGradient id="trend-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#006653" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#006653" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill="url(#trend-fill)" />
      <path d={linePath} fill="none" stroke="#006653" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="2.5" fill="#006653" />
      ))}
      {points.map((p, i) => (
        <text key={i} x={p.x} y={HEIGHT - 4} textAnchor="middle" className="fill-slate-green text-[9px]">
          {p.d.day}
        </text>
      ))}
    </svg>
  )
}
