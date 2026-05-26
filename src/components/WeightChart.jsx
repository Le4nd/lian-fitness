import { C } from '../lib/constants'

export function WeightChart({ weightLog }) {
  if (weightLog.length < 2) return (
    <div style={{ background: C.white, borderRadius: 18, border: `1px solid ${C.neutralBorder}`, padding: 24, textAlign: 'center', color: C.textMuted, fontSize: 13 }}>
      Log at least 2 weight entries to see your trend chart.
    </div>
  )

  // Show last 60 entries max
  const data = weightLog.slice(-60)
  const weights = data.map(d => d.weight)
  const minW = Math.min(...weights) - 1
  const maxW = Math.max(...weights) + 1
  const range = maxW - minW

  const W = 320, H = 160, PAD = { top: 16, right: 16, bottom: 28, left: 36 }
  const chartW = W - PAD.left - PAD.right
  const chartH = H - PAD.top - PAD.bottom

  const px = (i) => PAD.left + (i / (data.length - 1)) * chartW
  const py = (w) => PAD.top + (1 - (w - minW) / range) * chartH

  const points = data.map((d, i) => `${px(i)},${py(d.weight)}`).join(' ')

  // Linear trend line
  const n = data.length
  const xMean = (n - 1) / 2
  const yMean = weights.reduce((a, b) => a + b, 0) / n
  const slope = weights.reduce((sum, w, i) => sum + (i - xMean) * (w - yMean), 0) /
    weights.reduce((sum, _, i) => sum + (i - xMean) ** 2, 0)
  const intercept = yMean - slope * xMean
  const trendY0 = intercept
  const trendY1 = slope * (n - 1) + intercept

  // Y axis labels
  const yTicks = Array.from({ length: 4 }, (_, i) => minW + (range / 3) * i)

  // X axis: show first, middle, last date labels
  const xLabels = [0, Math.floor((n - 1) / 2), n - 1].map(i => ({
    i, label: new Date(data[i].date + 'T12:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
  }))

  const lost = (data[0].weight - data[data.length - 1].weight).toFixed(1)
  const trendPerWeek = (slope * 7).toFixed(2)

  return (
    <div style={{ background: C.white, borderRadius: 18, border: `1px solid ${C.neutralBorder}`, overflow: 'hidden' }}>
      <div style={{ padding: '16px 16px 4px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: C.textMain }}>Weight trend</div>
          <div style={{ fontSize: 11, color: C.textMuted, marginTop: 2 }}>Last {data.length} entries</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: +lost > 0 ? C.green : C.red }}>
            {+lost > 0 ? `−${lost}` : `+${Math.abs(lost)}`} kg
          </div>
          <div style={{ fontSize: 11, color: C.textMuted }}>{+trendPerWeek < 0 ? `${trendPerWeek}` : `+${trendPerWeek}`} kg/week trend</div>
        </div>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
        {/* Grid lines */}
        {yTicks.map((w, i) => (
          <g key={i}>
            <line x1={PAD.left} y1={py(w)} x2={W - PAD.right} y2={py(w)} stroke={C.neutralBorder} strokeWidth="0.5" strokeDasharray="3,3" />
            <text x={PAD.left - 4} y={py(w) + 4} textAnchor="end" fontSize="8" fill={C.textMuted}>{w.toFixed(0)}</text>
          </g>
        ))}

        {/* Trend line */}
        <line x1={px(0)} y1={py(trendY0)} x2={px(n - 1)} y2={py(trendY1)}
          stroke={C.pinkDeep} strokeWidth="1.5" strokeDasharray="5,3" opacity="0.6" />

        {/* Area fill */}
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={C.blue} stopOpacity="0.15" />
            <stop offset="100%" stopColor={C.blue} stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon
          points={`${px(0)},${PAD.top + chartH} ${points} ${px(n - 1)},${PAD.top + chartH}`}
          fill="url(#areaGrad)" />

        {/* Line */}
        <polyline points={points} fill="none" stroke={C.blue} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />

        {/* Dots for first and last */}
        {[0, n - 1].map(i => (
          <circle key={i} cx={px(i)} cy={py(data[i].weight)} r="3.5"
            fill={C.white} stroke={i === n - 1 ? C.blueDeep : C.blueMid} strokeWidth="2" />
        ))}

        {/* X labels */}
        {xLabels.map(({ i, label }) => (
          <text key={i} x={px(i)} y={H - 4} textAnchor="middle" fontSize="8" fill={C.textMuted}>{label}</text>
        ))}
      </svg>

      {/* Target line note */}
      <div style={{ padding: '0 16px 14px', fontSize: 11, color: C.textMuted }}>
        <span style={{ display: 'inline-block', width: 20, height: 2, background: C.pinkDeep, verticalAlign: 'middle', marginRight: 4, opacity: 0.6 }} />
        trend line
        <span style={{ marginLeft: 12, display: 'inline-block', width: 20, height: 2, background: C.blue, verticalAlign: 'middle', marginRight: 4 }} />
        actual weight
      </div>
    </div>
  )
}
