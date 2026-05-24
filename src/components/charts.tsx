// Charts inline em SVG — sem dependência de chart lib.
// Equivalente a Sparkline / LineChart / Donut / Bar da entrega de design.
import { useId } from 'react'

interface SparklineProps {
  points: number[]
  w?: number
  h?: number
  color?: string
  fill?: boolean
  dot?: boolean
  dashed?: boolean
}

export function Sparkline({
  points,
  w = 120,
  h = 36,
  color = 'var(--accent)',
  fill = true,
  dot = false,
  dashed = false,
}: SparklineProps) {
  const id = useId()
  if (!points || points.length < 2) return null
  const ys = points.slice()
  const minY = Math.min(...ys)
  const maxY = Math.max(...ys)
  const padY = (maxY - minY) * 0.18 || 1
  const yMin = minY - padY
  const yMax = maxY + padY
  const xS = (i: number) => (i / (ys.length - 1)) * (w - 4) + 2
  const yS = (v: number) => h - 2 - ((v - yMin) / (yMax - yMin || 1)) * (h - 4)
  const path = points.map((v, i) => `${i === 0 ? 'M' : 'L'}${xS(i).toFixed(1)},${yS(v).toFixed(1)}`).join(' ')
  const area = `${path} L${xS(points.length - 1).toFixed(1)},${h - 2} L${xS(0).toFixed(1)},${h - 2} Z`
  return (
    <svg width={w} height={h} style={{ display: 'block' }}>
      {fill && (
        <>
          <defs>
            <linearGradient id={`g${id}`} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.18" />
              <stop offset="100%" stopColor={color} stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={area} fill={`url(#g${id})`} />
        </>
      )}
      <path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={dashed ? '3 3' : undefined}
      />
      {dot && (
        <circle cx={xS(points.length - 1)} cy={yS(points[points.length - 1])} r="2.5" fill={color} />
      )}
    </svg>
  )
}

interface Series {
  name?: string
  color?: string
  points: number[]
}

interface LineChartProps {
  series: Series[]
  labels: string[]
  w?: number
  h?: number
  yLabel?: string
}

export function LineChart({ series, labels, w = 580, h = 220, yLabel = '' }: LineChartProps) {
  const all = series.flatMap((s) => s.points)
  if (all.length === 0) return null
  const minY = Math.min(...all)
  const maxY = Math.max(...all)
  const padY = (maxY - minY) * 0.2 || 1
  const yMin = Math.floor((minY - padY) * 10) / 10
  const yMax = Math.ceil((maxY + padY) * 10) / 10
  const padL = 38
  const padR = 14
  const padT = 14
  const padB = 28
  const cw = w - padL - padR
  const ch = h - padT - padB
  const n = labels.length
  const xS = (i: number) => padL + (n === 1 ? cw / 2 : (i / (n - 1)) * cw)
  const yS = (v: number) => padT + ch - ((v - yMin) / (yMax - yMin || 1)) * ch
  const ticks = 4
  const yTicks = Array.from({ length: ticks + 1 }, (_, i) => yMin + ((yMax - yMin) * i) / ticks)

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      width="100%"
      height={h}
      preserveAspectRatio="xMidYMid meet"
      style={{ display: 'block', overflow: 'visible', maxWidth: w }}
    >
      {yTicks.map((t, i) => (
        <g key={i}>
          <line
            x1={padL}
            x2={w - padR}
            y1={yS(t)}
            y2={yS(t)}
            stroke="var(--line)"
            strokeWidth="0.5"
            strokeDasharray={i === 0 ? '' : '2 3'}
          />
          <text
            x={padL - 8}
            y={yS(t) + 3.5}
            fontSize="10"
            fill="var(--ink-3)"
            textAnchor="end"
            className="tnum"
          >
            {t.toFixed(1)}
          </text>
        </g>
      ))}
      {labels.map((l, i) => (
        <text
          key={i}
          x={xS(i)}
          y={h - 10}
          fontSize="10.5"
          fill="var(--ink-3)"
          textAnchor="middle"
          className="tnum"
        >
          {l}
        </text>
      ))}
      {yLabel && (
        <text
          x={padL - 32}
          y={padT + ch / 2}
          fontSize="10"
          fill="var(--ink-3)"
          textAnchor="middle"
          transform={`rotate(-90 ${padL - 32} ${padT + ch / 2})`}
        >
          {yLabel}
        </text>
      )}
      {series.map((s, si) => {
        const c = s.color || 'var(--accent)'
        const path = s.points
          .map((v, i) => `${i === 0 ? 'M' : 'L'}${xS(i).toFixed(1)},${yS(v).toFixed(1)}`)
          .join(' ')
        return (
          <g key={si}>
            <path
              d={path}
              fill="none"
              stroke={c}
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {s.points.map((v, i) => (
              <circle
                key={i}
                cx={xS(i)}
                cy={yS(v)}
                r="3"
                fill="var(--paper-3)"
                stroke={c}
                strokeWidth="1.5"
              />
            ))}
          </g>
        )
      })}
    </svg>
  )
}

interface BarProps {
  value: number
  max: number
  color?: string
  w?: string | number
  h?: number
  label?: string
}

export function Bar({ value, max, color = 'var(--accent)', w = '100%', h = 6, label }: BarProps) {
  const pct = Math.max(0, Math.min(1, max === 0 ? 0 : value / max))
  return (
    <div style={{ width: w }}>
      <div
        style={{
          height: h,
          background: 'var(--paper-4)',
          borderRadius: 999,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${pct * 100}%`,
            height: '100%',
            background: color,
            transition: 'width .25s ease',
          }}
        />
      </div>
      {label && (
        <div style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 4 }}>{label}</div>
      )}
    </div>
  )
}

interface DonutProps {
  size?: number
  stroke?: number
  pct: number
  color?: string
  label?: string
  sub?: string
}

export function Donut({
  size = 84,
  stroke = 10,
  pct,
  color = 'var(--accent)',
  label,
  sub,
}: DonutProps) {
  const r = (size - stroke) / 2
  const cx = size / 2
  const C = 2 * Math.PI * r
  const off = C * (1 - Math.max(0, Math.min(1, pct)))
  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg width={size} height={size}>
          <circle cx={cx} cy={cx} r={r} stroke="var(--paper-4)" strokeWidth={stroke} fill="none" />
          <circle
            cx={cx}
            cy={cx}
            r={r}
            stroke={color}
            strokeWidth={stroke}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={C}
            strokeDashoffset={off}
            transform={`rotate(-90 ${cx} ${cx})`}
            style={{ transition: 'stroke-dashoffset .4s ease' }}
          />
        </svg>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'grid',
            placeItems: 'center',
            fontFamily: 'var(--font-display)',
            fontSize: size > 80 ? 19 : 15,
            fontWeight: 500,
          }}
        >
          {Math.round(pct * 100)}%
        </div>
      </div>
      {(label || sub) && (
        <div style={{ textAlign: 'center', lineHeight: 1.15 }}>
          {label && <div style={{ fontSize: 11.5, fontWeight: 500 }}>{label}</div>}
          {sub && <div style={{ fontSize: 11, color: 'var(--ink-3)' }}>{sub}</div>}
        </div>
      )}
    </div>
  )
}
