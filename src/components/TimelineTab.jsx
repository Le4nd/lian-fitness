import { useState, useEffect, useRef } from 'react'
import { C, START_W, TARGET_W, todayStr } from '../lib/constants'
import { s } from '../lib/styles'

const GOAL_W = TARGET_W

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
function getMonthLabel(offset) {
  const d = new Date()
  d.setMonth(d.getMonth() + offset)
  return MONTH_NAMES[d.getMonth()] + ' ' + d.getFullYear()
}
const START_WAIST = 97
const START_HIPS = 114

const MILESTONES = [
  { w: 95, label: '2kg gone', emoji: '🌱' },
  { w: 92, label: '5kg down', emoji: '⭐' },
  { w: 90, label: 'Under 90kg', emoji: '🎯' },
  { w: 85, label: '85kg', emoji: '✨' },
  { w: 80, label: 'Under 80kg', emoji: '💫' },
  { w: 75, label: '75kg', emoji: '🌸' },
  { w: 70, label: '70kg', emoji: '🏆' },
  { w: 65, label: 'Goal weight!', emoji: '🦋' },
]

function compute({ startW, startWaist, startHips, startThighs, gymDays, walkDays, kcal, factors, avgCalories }) {
  const tdee = Math.round((10 * startW + 6.25 * 167 - 5 * 22 + 5) * 1.375)
  const effectiveKcal = avgCalories || kcal
  const overlap = Math.min(gymDays, walkDays)
  const gymOnly = gymDays - overlap
  const walkOnly = walkDays - overlap
  const rest = Math.max(0, 7 - gymDays - walkOnly)

  const weeklyDeficit =
    overlap * (tdee + 750 + 500 - effectiveKcal) +
    gymOnly * (tdee + 750 - effectiveKcal) +
    walkOnly * (tdee + 500 - effectiveKcal) +
    rest * (tdee - effectiveKcal)

  let kgPerWeek = weeklyDeficit / 7700
  if (factors.retatrutide) kgPerWeek *= 1.25

  const avgDailyDeficit = Math.round(weeklyDeficit / 7)
  const avgExBurn = Math.round((overlap * 1250 + gymOnly * 750 + walkOnly * 500) / 7)

  // Build timeline
  let w = startW
  let waist = startWaist
  let hips = startHips
  let thighs = startThighs
  const rows = []

  for (let m = 1; m <= 12; m++) {
    const muscleEffect = factors.muscle && m <= 1 ? 0.65 : 1.0
    const adaptFactor = m > 4 ? 0.85 : 1.0
    const loss = Math.min(kgPerWeek * 4.33 * muscleEffect * adaptFactor, Math.max(0, w - GOAL_W))
    w = Math.max(GOAL_W, w - loss)

    const hrtWaist = factors.hrt && m >= 2 ? 0.5 : 0
    const tiltBonus = factors.tilt && m === 2 ? 1.5 : factors.tilt && m === 3 ? 0.5 : 0
    waist = Math.max(63, waist - loss * 0.85 - hrtWaist - tiltBonus)
    const hrtHip = factors.hrt && m >= 3 ? -0.25 : 0.4
    hips = Math.max(103, hips - loss * 0.25 + hrtHip)
    thighs = Math.max(48, thighs - loss * 0.35)
    const whr = parseFloat((waist / hips).toFixed(3))

    const hit = MILESTONES.filter(ms => w <= ms.w && startW > ms.w)
    const badges = []
    hit.forEach(ms => badges.push({ label: ms.emoji + ' ' + ms.label, type: 'green' }))
    if (whr <= 0.70 && (rows.length === 0 || rows[rows.length - 1].whr > 0.70)) badges.push({ label: 'Hourglass range 🌸', type: 'pink' })
    if (factors.hrt && m === 2) badges.push({ label: 'HRT redistribution starts', type: 'purple' })
    if (factors.retatrutide && m === 1) badges.push({ label: 'Retatrutide fully active', type: 'blue' })

    rows.push({ m, w: w.toFixed(1), waist: waist.toFixed(1), hips: hips.toFixed(1), thighs: thighs.toFixed(1), whr, badges, isMilestone: hit.length > 0, monthLabel: getMonthLabel(m - 1) })
    if (w <= GOAL_W) break
  }

  return { tdee, avgExBurn, avgDailyDeficit, kgPerWeek, rows }
}

const BADGE_COLORS = {
  green:  { bg: C.greenLight,  color: C.green,    border: C.greenBorder },
  pink:   { bg: C.pinkLight,   color: C.pinkDeep, border: C.pinkMid },
  purple: { bg: '#eeedfe',     color: '#3c3489',   border: '#c8c6f5' },
  blue:   { bg: C.blueLight,   color: C.blueDeep, border: C.blueMid },
}

export function TimelineTab({ weightLog, measureLog, dailyLog }) {
  const [gymDays, setGymDays] = useState(4)
  const [walkDays, setWalkDays] = useState(5)
  const [kcal, setKcal] = useState(1700)
  const [factors, setFactors] = useState({ retatrutide: true, hrt: true, muscle: true, tilt: true })

  const toggleFactor = (f) => setFactors(prev => ({ ...prev, [f]: !prev[f] }))

  const latestW = weightLog[weightLog.length - 1]?.weight ?? START_W
  const latestM = measureLog[measureLog.length - 1] ?? { waist: START_WAIST, hips: START_HIPS, thighs: 63 }
  const lostKg = Math.max(0, START_W - latestW).toFixed(1)
  const pct = Math.min(100, Math.round(((START_W - latestW) / (START_W - GOAL_W)) * 100))
  const whr = latestM.waist && latestM.hips ? (latestM.waist / latestM.hips).toFixed(3) : '—'

  // Average logged calories
  const calEntries = Object.values(dailyLog).filter(d => d?.calories).map(d => d.calories)
  const avgCalories = calEntries.length ? Math.round(calEntries.reduce((a, b) => a + b, 0) / calEntries.length) : null

  const { tdee, avgExBurn, avgDailyDeficit, kgPerWeek, rows } = compute({
    startW: latestW,
    startWaist: latestM.waist || START_WAIST,
    startHips: latestM.hips || START_HIPS,
    startThighs: latestM.thighs || 63,
    gymDays, walkDays, kcal, factors, avgCalories,
  })

  const SliderRow = ({ label, id, min, max, step, value, onChange, suffix }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
      <span style={{ fontSize: 13, color: C.textMuted, minWidth: 200 }}>{label}</span>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        style={{ flex: 1, accentColor: C.blue }} />
      <span style={{ fontSize: 13, fontWeight: 600, color: C.textMain, minWidth: 48, textAlign: 'right' }}>
        {value}{suffix}
      </span>
    </div>
  )

  const ToggleBtn = ({ id, label }) => (
    <button onClick={() => toggleFactor(id)} style={{
      padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600,
      border: `1px solid ${factors[id] ? C.blueMid : C.neutralBorder}`,
      background: factors[id] ? C.blueLight : 'transparent',
      color: factors[id] ? C.blueDeep : C.textMuted,
      cursor: 'pointer', transition: 'all .15s',
    }}>{label}</button>
  )

  return (
    <>
      {/* Live summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 16 }}>
        {[
          { label: 'current weight', value: `${latestW}kg`, color: C.blueDeep, bg: C.blueLight, border: C.blueMid },
          { label: 'lost so far', value: `${lostKg}kg`, color: C.green, bg: C.greenLight, border: C.greenBorder },
          { label: 'latest waist', value: latestM.waist ? `${latestM.waist}cm` : '—', color: C.pinkDeep, bg: C.pinkLight, border: C.pinkMid },
          { label: 'current WHR', value: whr, color: C.blueDeep, bg: C.blueLight, border: C.blueMid },
        ].map(sc => (
          <div key={sc.label} style={s.statCard(sc.bg, sc.border, sc.color)}>
            <div style={{ ...s.statNum, fontSize: 18 }}>{sc.value}</div>
            <div style={s.statLbl}>{sc.label}</div>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: C.textMuted, marginBottom: 5 }}>
          <span>97kg start</span>
          <span style={{ fontWeight: 600, color: C.blueDeep }}>{pct}% to goal</span>
          <span>65kg goal</span>
        </div>
        <div style={s.pBar}><div style={s.pFill(pct)} /></div>
      </div>

      {/* Inputs */}
      <div style={{ ...s.card, marginBottom: 16 }}>
        <span style={s.lbl}>Adjust projections</span>
        <SliderRow label="Gym days per week" id="gym" min={1} max={6} step={1} value={gymDays} onChange={setGymDays} suffix=" days" />
        <SliderRow label="Walking days (10km) per week" id="walk" min={0} max={7} step={1} value={walkDays} onChange={setWalkDays} suffix=" days" />
        <SliderRow label="Max calories per day" id="kcal" min={1000} max={2500} step={50} value={kcal} onChange={setKcal} suffix=" kcal" />
        {avgCalories && (
          <div style={{ fontSize: 12, color: C.textMuted, background: C.blueLight, borderRadius: 8, padding: '6px 10px', marginBottom: 12 }}>
            Your logged average: <strong>{avgCalories} kcal/day</strong> over {calEntries.length} days — used in calculations
          </div>
        )}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <ToggleBtn id="retatrutide" label="Retatrutide" />
          <ToggleBtn id="hrt" label="HRT" />
          <ToggleBtn id="muscle" label="Muscle memory" />
          <ToggleBtn id="tilt" label="Pelvic tilt correction" />
        </div>
      </div>

      {/* Energy balance */}
      <div style={{ ...s.card, marginBottom: 16 }}>
        <span style={s.lbl}>Energy balance</span>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 }}>
          {[
            { label: 'Base TDEE', value: tdee + ' kcal' },
            { label: 'Avg exercise burn', value: '+' + avgExBurn + ' kcal' },
            { label: 'Daily deficit', value: avgDailyDeficit + ' kcal' },
            { label: 'Fat loss / week', value: kgPerWeek.toFixed(2) + ' kg' },
          ].map(sc => (
            <div key={sc.label} style={{ background: C.neutral, borderRadius: 10, padding: 12 }}>
              <div style={{ fontSize: 16, fontWeight: 600, color: C.textMain }}>{sc.value}</div>
              <div style={{ fontSize: 10, color: C.textMuted, marginTop: 3, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{sc.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Timeline */}
      <span style={s.lbl}>Month by month timeline</span>
      <div style={s.card}>
        {rows.map((r, i) => (
          <div key={r.m} style={{ display: 'grid', gridTemplateColumns: '72px 1fr', borderBottom: i < rows.length - 1 ? `1px solid ${C.neutral}` : 'none' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: r.isMilestone ? C.red : C.textMuted, padding: '14px 10px 14px 0', borderRight: `2px solid ${r.isMilestone ? C.red : C.neutralBorder}`, textAlign: 'right', position: 'relative' }}>
              {getMonthLabel(r.m - 1)}
              <div style={{ width: r.isMilestone ? 10 : 8, height: r.isMilestone ? 10 : 8, borderRadius: '50%', background: r.isMilestone ? C.red : C.neutralBorder, position: 'absolute', right: r.isMilestone ? -6 : -5, top: '50%', transform: 'translateY(-50%)' }} />
            </div>
            <div style={{ padding: '12px 0 12px 16px' }}>
              <div style={{ fontSize: 18, fontWeight: 600, color: C.textMain, fontFamily: "'DM Serif Display',serif" }}>{r.w} kg</div>
              <div style={{ fontSize: 12, color: C.textMuted, marginTop: 3 }}>
                Waist {r.waist}cm · Hips {r.hips}cm · Thighs {r.thighs}cm · WHR {r.whr}
              </div>
              {r.badges.length > 0 && (
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 6 }}>
                  {r.badges.map((b, bi) => {
                    const bc = BADGE_COLORS[b.type]
                    return (
                      <span key={bi} style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, fontWeight: 600, background: bc.bg, color: bc.color, border: `1px solid ${bc.border}` }}>
                        {b.label}
                      </span>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
