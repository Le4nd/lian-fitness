import { C, MILESTONES, DEFAULT_HABITS, START_W, TARGET_W, todayStr } from '../lib/constants'
import { s } from '../lib/styles'

// ── WEIGHT TAB ──────────────────────────────────────────────────────────────
export function WeightTab({ weightLog, newWeight, setNewWeight, logWeight }) {
  const latestW = weightLog[weightLog.length - 1]?.weight ?? START_W
  const lostKg = Math.max(0, START_W - latestW).toFixed(1)
  const toGoKg = Math.max(0, latestW - TARGET_W).toFixed(1)
  const weightPct = Math.min(100, Math.round(((START_W - latestW) / (START_W - TARGET_W)) * 100))

  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 10, marginBottom: 20 }}>
        {[
          { label: 'current', value: `${latestW} kg`, bg: C.blueLight, border: C.blueMid, color: C.blueDeep },
          { label: 'target', value: '65 kg', bg: C.pinkLight, border: C.pinkMid, color: C.pinkDeep },
          { label: 'lost', value: `${lostKg} kg`, bg: C.pinkLight, border: C.pinkMid, color: C.pinkDeep },
          { label: 'to go', value: `${toGoKg} kg`, bg: C.blueLight, border: C.blueMid, color: C.blueDeep },
        ].map(sc => (
          <div key={sc.label} style={s.statCard(sc.bg, sc.border, sc.color)}>
            <div style={s.statNum}>{sc.value}</div>
            <div style={s.statLbl}>{sc.label}</div>
          </div>
        ))}
      </div>

      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: C.textMuted, marginBottom: 6 }}>
          <span>97kg → 65kg</span>
          <span style={{ color: C.blueDeep, fontWeight: 600 }}>{weightPct}%</span>
        </div>
        <div style={s.pBar}><div style={s.pFill(weightPct)} /></div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: C.textMuted, marginTop: 4 }}>
          <span>97kg</span><span>65kg</span>
        </div>
      </div>

      <div style={{ ...s.card, padding: 16, marginBottom: 16 }}>
        <span style={s.lbl}>Log today's weight</span>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            type="number" step="0.1" placeholder="e.g. 95.4" value={newWeight}
            onChange={e => setNewWeight(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && logWeight()}
            style={{ ...s.inp, flex: 1 }}
          />
          <button onClick={logWeight} style={s.btn}>Log</button>
        </div>
      </div>

      <span style={s.lbl}>Full weight history ({weightLog.length} entries)</span>
      <div style={s.card}>
        {weightLog.length === 0 && <div style={{ padding: 16, fontSize: 14, color: C.textMuted }}>No entries yet.</div>}
        {[...weightLog].reverse().map((e, i, arr) => {
          const prev = arr[i + 1]?.weight
          const diff = prev ? (e.weight - prev).toFixed(1) : null
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: i < arr.length - 1 ? `1px solid ${C.neutral}` : 'none' }}>
              <span style={{ fontSize: 13, color: C.textMuted }}>{e.date}</span>
              <span style={{ fontSize: 16, fontWeight: 500, fontFamily: "'DM Serif Display',serif" }}>{e.weight} kg</span>
              {diff
                ? <span style={{ fontSize: 12, fontWeight: 600, color: +diff < 0 ? C.green : C.red }}>{+diff < 0 ? diff : `+${diff}`}</span>
                : <span style={{ fontSize: 12, color: C.textMuted }}>—</span>}
            </div>
          )
        })}
      </div>
    </>
  )
}

// ── BODY TAB ────────────────────────────────────────────────────────────────
export function BodyTab({ measureLog, newMeasure, setNewMeasure, logMeasurements }) {
  const latestMeasure = measureLog[measureLog.length - 1] ?? {}
  const whrRatio = latestMeasure.waist && latestMeasure.hips
    ? (latestMeasure.waist / latestMeasure.hips).toFixed(2)
    : null

  return (
    <>
      {whrRatio && (
        <div style={{ background: `linear-gradient(135deg,${C.blueLight},${C.pinkLight})`, borderRadius: 18, padding: 18, marginBottom: 16, border: `1px solid ${C.blueMid}`, textAlign: 'center' }}>
          <div style={{ fontSize: 32, fontFamily: "'DM Serif Display',serif", color: C.blueDeep }}>{whrRatio}</div>
          <div style={{ fontSize: 12, color: C.textMuted, marginTop: 2, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Waist-to-hip ratio</div>
          <div style={{ fontSize: 13, marginTop: 6, fontWeight: 600, color: +whrRatio < 0.70 ? C.green : +whrRatio < 0.80 ? C.blueDeep : C.red }}>
            {+whrRatio < 0.70 ? 'Hourglass range ✓' : +whrRatio < 0.80 ? 'Getting there — keep going' : 'Above hourglass range'}
          </div>
        </div>
      )}

      {latestMeasure.waist && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 16 }}>
          {[['Waist', latestMeasure.waist, C.pinkDeep, C.pinkLight, C.pinkMid],
            ['Hips', latestMeasure.hips, C.blueDeep, C.blueLight, C.blueMid],
            ['Thighs', latestMeasure.thighs, C.green, C.greenLight, C.greenBorder]
          ].map(([l, v, color, bg, border]) => (
            <div key={l} style={s.statCard(bg, border, color)}>
              <div style={{ ...s.statNum, fontSize: 18 }}>{v ?? '—'}<span style={{ fontSize: 11 }}> cm</span></div>
              <div style={s.statLbl}>{l}</div>
            </div>
          ))}
        </div>
      )}

      <span style={s.lbl}>Log measurements</span>
      <div style={{ ...s.card, padding: 16 }}>
        {[['waist', 'Waist (cm)', '85'], ['hips', 'Hips (cm)', '100'], ['thighs', 'Thighs (cm)', '65']].map(([k, label, ph]) => (
          <div key={k} style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 4 }}>{label}</div>
            <input
              type="number" step="0.1" placeholder={`e.g. ${ph}`} value={newMeasure[k]}
              onChange={e => setNewMeasure(m => ({ ...m, [k]: e.target.value }))}
              style={{ ...s.inp, width: '100%' }}
            />
          </div>
        ))}
        <button onClick={logMeasurements} style={{ ...s.btn, width: '100%' }}>Save measurements</button>
      </div>

      <span style={s.lbl}>Measurement history ({measureLog.length} entries)</span>
      <div style={s.card}>
        {measureLog.length === 0 && <div style={{ padding: 16, fontSize: 14, color: C.textMuted }}>No measurements yet.</div>}
        {[...measureLog].reverse().map(({ date, waist, hips, thighs }, i, arr) => (
          <div key={date} style={{ padding: '12px 16px', borderBottom: i < arr.length - 1 ? `1px solid ${C.neutral}` : 'none' }}>
            <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 4 }}>{date}</div>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              {waist && <span style={{ fontSize: 13 }}><b style={{ color: C.pinkDeep }}>W</b> {waist}cm</span>}
              {hips && <span style={{ fontSize: 13 }}><b style={{ color: C.blueDeep }}>H</b> {hips}cm</span>}
              {thighs && <span style={{ fontSize: 13 }}><b style={{ color: C.green }}>T</b> {thighs}cm</span>}
              {waist && hips && <span style={{ fontSize: 12, color: C.textMuted }}>WHR {(waist / hips).toFixed(2)}</span>}
            </div>
          </div>
        ))}
      </div>
    </>
  )
}

// ── WEEK TAB ────────────────────────────────────────────────────────────────
export function WeekTab({ habits, weightLog, dailyLog, habitsRange }) {
  const today = todayStr()
  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i)); return d.toISOString().split('T')[0]
  })

  const doneCount = habits.filter(h => h.done).length
  const habitPct = Math.round((doneCount / habits.length) * 100)

  const weekHabitAvg = () => {
    const days = weekDates.map(d => {
      if (d === today) return habitPct
      const snap = habitsRange[d]
      return snap ? Math.round((Object.values(snap).filter(Boolean).length / DEFAULT_HABITS.length) * 100) : null
    }).filter(x => x !== null)
    return days.length ? Math.round(days.reduce((a, b) => a + b, 0) / days.length) : 0
  }

  const weekCalAvg = () => {
    const days = weekDates.map(d => dailyLog[d]?.calories).filter(Boolean)
    return days.length ? Math.round(days.reduce((a, b) => a + b, 0) / days.length) : null
  }

  const weekGymDays = () => weekDates.filter(d => {
    if (d === today) return habits.find(h => h.id === 'h2')?.done
    return habitsRange[d]?.h2
  }).length

  const weekWeightChange = () => {
    const inRange = weightLog.filter(e => weekDates.includes(e.date))
    if (inRange.length < 2) return null
    return (inRange[inRange.length - 1].weight - inRange[0].weight).toFixed(1)
  }

  const wc = weekWeightChange()

  return (
    <>
      <span style={s.lbl}>This week</span>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 10, marginBottom: 20 }}>
        {[
          { label: 'habit avg', value: `${weekHabitAvg()}%`, bg: C.blueLight, border: C.blueMid, color: C.blueDeep },
          { label: 'gym days', value: `${weekGymDays()}/7`, bg: C.pinkLight, border: C.pinkMid, color: C.pinkDeep },
          { label: 'avg calories', value: weekCalAvg() ? `${weekCalAvg()} kcal` : '—', bg: C.blueLight, border: C.blueMid, color: C.blueDeep },
          { label: 'weight change', value: wc === null ? '—' : +wc < 0 ? `${wc} kg` : wc === '0.0' ? 'stable' : `+${wc} kg`, bg: wc !== null && +wc < 0 ? C.greenLight : C.pinkLight, border: wc !== null && +wc < 0 ? C.greenBorder : C.pinkMid, color: wc !== null && +wc < 0 ? C.green : C.pinkDeep },
        ].map(sc => (
          <div key={sc.label} style={s.statCard(sc.bg, sc.border, sc.color)}>
            <div style={s.statNum}>{sc.value}</div>
            <div style={s.statLbl}>{sc.label}</div>
          </div>
        ))}
      </div>

      <span style={s.lbl}>Daily breakdown</span>
      <div style={s.card}>
        {weekDates.map((d, i) => {
          const isToday = d === today
          const snap = habitsRange[d]
          const done = isToday ? doneCount : snap ? Object.values(snap).filter(Boolean).length : null
          const steps = dailyLog[d]?.steps
          const cal = dailyLog[d]?.calories
          return (
            <div key={d} style={{ padding: '11px 16px', borderBottom: i < weekDates.length - 1 ? `1px solid ${C.neutral}` : 'none', background: isToday ? C.blueLight : 'transparent' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontSize: 13, fontWeight: 600, color: isToday ? C.blueDeep : C.textMain }}>
                    {new Date(d + 'T12:00:00').toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}
                    {isToday && <span style={{ fontSize: 11, color: C.blueDeep, marginLeft: 6 }}>today</span>}
                  </span>
                  <div style={{ fontSize: 11, color: C.textMuted, marginTop: 2 }}>
                    {steps ? `👣 ${steps.toLocaleString()}` : ''}{cal ? ` · 🍽 ${cal} kcal` : ''}
                  </div>
                </div>
                {done !== null
                  ? <div style={{ fontSize: 13, fontWeight: 600, color: done >= DEFAULT_HABITS.length ? C.green : C.textMuted }}>{done}/{DEFAULT_HABITS.length}</div>
                  : <div style={{ fontSize: 12, color: C.textMuted }}>—</div>}
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}

// ── GOALS TAB ───────────────────────────────────────────────────────────────
export function GoalsTab({ weightLog }) {
  const latestW = weightLog[weightLog.length - 1]?.weight ?? START_W
  const weightPct = Math.min(100, Math.round(((START_W - latestW) / (START_W - TARGET_W)) * 100))

  return (
    <>
      <span style={s.lbl}>Milestones</span>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
        {MILESTONES.map((m, i) => {
          const reached = latestW <= m.weight
          return (
            <div key={i} style={{
              background: reached ? C.goldLight : C.white,
              borderRadius: 14,
              border: `1px solid ${reached ? C.goldBorder : C.neutralBorder}`,
              padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 14,
              boxShadow: reached ? '0 2px 8px rgba(184,134,11,0.12)' : 'none',
            }}>
              <div style={{ fontSize: 30, opacity: reached ? 1 : 0.2 }}>{m.emoji}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: reached ? C.gold : C.textMuted }}>{m.label}</div>
                <div style={{ fontSize: 12, color: C.textMuted, marginTop: 1 }}>{m.weight}kg</div>
              </div>
              {reached
                ? <span style={{ fontSize: 11, fontWeight: 700, color: C.gold, background: '#fff', padding: '3px 10px', borderRadius: 20, border: `1px solid ${C.goldBorder}` }}>Reached ✓</span>
                : <span style={{ fontSize: 12, color: C.textMuted }}>{(latestW - m.weight).toFixed(1)}kg away</span>}
            </div>
          )
        })}
      </div>

      <span style={s.lbl}>Journey progress</span>
      <div style={{ background: C.white, borderRadius: 18, border: `1px solid ${C.neutralBorder}`, padding: 18 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: C.textMuted, marginBottom: 8 }}>
          <span>97kg → 65kg</span>
          <span style={{ fontWeight: 700, color: C.blueDeep }}>{weightPct}%</span>
        </div>
        <div style={{ position: 'relative', height: 16, borderRadius: 8, background: C.neutralBorder, marginBottom: 14, overflow: 'visible' }}>
          <div style={{ height: '100%', width: `${weightPct}%`, background: `linear-gradient(90deg,${C.blue},${C.pink})`, borderRadius: 8, transition: 'width .5s' }} />
          {MILESTONES.map(m => {
            const pos = Math.min(100, Math.round(((97 - m.weight) / (97 - 65)) * 100))
            const reached = latestW <= m.weight
            return (
              <div key={m.weight} title={`${m.label} (${m.weight}kg)`} style={{
                position: 'absolute', top: '50%', left: `${pos}%`,
                transform: 'translate(-50%,-50%)', width: 20, height: 20,
                borderRadius: '50%', background: reached ? C.gold : '#fff',
                border: `2px solid ${reached ? C.goldBorder : C.neutralBorder}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 9, zIndex: 1,
              }}>
                {reached ? '★' : '·'}
              </div>
            )
          })}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: C.textMuted }}>
          <span>97kg</span><span>65kg</span>
        </div>
      </div>
    </>
  )
}
