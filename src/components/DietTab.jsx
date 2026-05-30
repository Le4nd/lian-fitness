import { useState } from 'react'
import { C, TARGET_KCAL, STEPS_GOAL, calcBMR, calcTDEE, START_W } from '../lib/constants'
import { s } from '../lib/styles'

export function DietTab({ todayData, weightLog, newCal, setNewCal, logCalories, newSteps, setNewSteps, logSteps, onLogExercise, selectedDate }) {
  const [exCal, setExCal] = useState('')
  const [exDur, setExDur] = useState('')
  const [exDist, setExDist] = useState('')

  const latestW = weightLog[weightLog.length - 1]?.weight ?? START_W
  const bmr = calcBMR(latestW)
  const tdee = calcTDEE(latestW)
  const todayCal = todayData.calories ?? null
  const todaySteps = todayData.steps ?? null
  const exCalBurned = todayData.exercise_calories ?? null
  const exDuration = todayData.exercise_duration ?? null
  const exDistance = todayData.exercise_distance ?? null
  const isToday = selectedDate === new Date().toISOString().split('T')[0]

  // Updated calorie math including exercise burn
  const totalBurn = tdee + (exCalBurned ?? 0)
  const deficit = todayCal !== null ? totalBurn - todayCal : null
  const netVsTarget = todayCal !== null ? todayCal - TARGET_KCAL : null

  const handleLogExercise = () => {
    const cal = parseInt(exCal)
    const dur = parseInt(exDur)
    const dist = parseFloat(exDist)
    if (!cal && !dur && !dist) return
    onLogExercise({ exercise_calories: cal || null, exercise_duration: dur || null, exercise_distance: dist || null })
    setExCal(''); setExDur(''); setExDist('')
  }

  return (
    <>
      {/* Steps */}
      <span style={s.lbl}>Steps today</span>
      <div style={{ ...s.card, padding: 16 }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: todaySteps ? 8 : 0 }}>
          <input type="number" placeholder="Steps today" value={newSteps}
            onChange={e => setNewSteps(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && logSteps()}
            style={{ ...s.inp, flex: 1 }} />
          <button onClick={logSteps} style={s.btn}>Log</button>
        </div>
        {todaySteps && <>
          <div style={s.pBar}><div style={s.pFill(Math.min(100, Math.round((todaySteps / STEPS_GOAL) * 100)))} /></div>
          <div style={{ fontSize: 11, color: todaySteps >= STEPS_GOAL ? C.green : C.textMuted, textAlign: 'right', marginTop: 3, fontWeight: 600 }}>
            {todaySteps.toLocaleString()} / {STEPS_GOAL.toLocaleString()} {todaySteps >= STEPS_GOAL ? '✓' : ''}
          </div>
        </>}
      </div>

      {/* Exercise from band */}
      <span style={s.lbl}>Exercise (from band)</span>
      <div style={{ ...s.card, padding: 16 }}>
        {exCalBurned ? (
          <div style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <div style={s.statCard(C.redLight, C.redBorder, C.red)}>
                <div style={{ ...s.statNum, fontSize: 18 }}>{exCalBurned}</div>
                <div style={s.statLbl}>kcal burned</div>
              </div>
              {exDuration && <div style={s.statCard(C.blueLight, C.blueMid, C.blueDeep)}>
                <div style={{ ...s.statNum, fontSize: 18 }}>{exDuration}<span style={{ fontSize: 11 }}>min</span></div>
                <div style={s.statLbl}>duration</div>
              </div>}
              {exDistance && <div style={s.statCard(C.greenLight, C.greenBorder, C.green)}>
                <div style={{ ...s.statNum, fontSize: 18 }}>{exDistance}<span style={{ fontSize: 11 }}>km</span></div>
                <div style={s.statLbl}>distance</div>
              </div>}
            </div>
            <button onClick={() => onLogExercise({ exercise_calories: null, exercise_duration: null, exercise_distance: null })}
              style={{ ...s.btnGhost, fontSize: 11, padding: '4px 10px', marginTop: 10 }}>Edit</button>
          </div>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 10 }}>
              <div>
                <div style={{ fontSize: 10, color: C.textMuted, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Kcal burned</div>
                <input type="number" placeholder="e.g. 751" value={exCal}
                  onChange={e => setExCal(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleLogExercise()}
                  style={{ ...s.inp, width: '100%' }} />
              </div>
              <div>
                <div style={{ fontSize: 10, color: C.textMuted, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Duration (min)</div>
                <input type="number" placeholder="e.g. 213" value={exDur}
                  onChange={e => setExDur(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleLogExercise()}
                  style={{ ...s.inp, width: '100%' }} />
              </div>
              <div>
                <div style={{ fontSize: 10, color: C.textMuted, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Distance (km)</div>
                <input type="number" step="0.01" placeholder="e.g. 10.79" value={exDist}
                  onChange={e => setExDist(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleLogExercise()}
                  style={{ ...s.inp, width: '100%' }} />
              </div>
            </div>
            <button onClick={handleLogExercise} style={s.btn}>Log exercise</button>
          </>
        )}
      </div>

      {/* Calories eaten */}
      <span style={s.lbl}>Calories eaten</span>
      <div style={{ ...s.card, padding: 16 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <input type="number" placeholder="Total kcal" value={newCal}
            onChange={e => setNewCal(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && logCalories()}
            style={{ ...s.inp, flex: 1 }} />
          <button onClick={logCalories} style={s.btn}>Log</button>
        </div>
      </div>

      {/* Energy balance */}
      {todayCal !== null && <>
        <span style={s.lbl}>Energy balance</span>

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 12 }}>
          <div style={s.statCard(C.blueLight, C.blueMid, C.blueDeep)}>
            <div style={s.statNum}>{todayCal}</div><div style={s.statLbl}>eaten</div>
          </div>
          <div style={s.statCard(C.redLight, C.redBorder, C.red)}>
            <div style={s.statNum}>{totalBurn}</div><div style={s.statLbl}>total burn</div>
          </div>
          <div style={s.statCard(deficit > 0 ? C.greenLight : C.redLight, deficit > 0 ? C.greenBorder : C.redBorder, deficit > 0 ? C.green : C.red)}>
            <div style={s.statNum}>{deficit !== null ? Math.abs(Math.round(deficit)) : '—'}</div>
            <div style={s.statLbl}>{deficit > 0 ? 'deficit' : 'surplus'}</div>
          </div>
        </div>

        {/* Breakdown */}
        <div style={{ background: C.white, borderRadius: 14, border: `1px solid ${C.neutralBorder}`, padding: '14px 16px', marginBottom: 12 }}>
          {[
            { label: 'Base TDEE', value: tdee, color: C.textMuted },
            { label: 'Exercise burn', value: `+${exCalBurned ?? 0}`, color: C.red },
            { label: 'Total daily burn', value: totalBurn, color: C.textMain, bold: true },
            { label: 'Calories eaten', value: `-${todayCal}`, color: C.blueDeep },
          ].map((row, i, arr) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: i < arr.length - 1 ? `1px solid ${C.neutral}` : 'none' }}>
              <span style={{ fontSize: 12, color: C.textMuted }}>{row.label}</span>
              <span style={{ fontSize: 13, fontWeight: row.bold ? 700 : 500, color: row.color, fontFamily: "'DM Sans',sans-serif" }}>{row.value} kcal</span>
            </div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0 0', marginTop: 4, borderTop: `2px solid ${C.neutralBorder}` }}>
            <span style={{ fontSize: 13, fontWeight: 700 }}>Net deficit</span>
            <span style={{ fontSize: 16, fontWeight: 700, color: deficit > 0 ? C.green : C.red, fontFamily: 'monospace' }}>
              {deficit !== null ? `${deficit > 0 ? '-' : '+'}${Math.abs(Math.round(deficit))} kcal` : '—'}
            </span>
          </div>
        </div>

        {/* Weekly projection */}
        {deficit !== null && deficit > 0 && (
          <div style={{ background: C.greenLight, borderRadius: 14, padding: '12px 16px', border: `1px solid ${C.greenBorder}` }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.green, marginBottom: 4 }}>📉 Projected loss</div>
            <div style={{ fontSize: 12, color: C.textMuted }}>
              At this rate: <span style={{ fontWeight: 700, color: C.green }}>~{(deficit * 7 / 7700).toFixed(2)}kg/week</span>
              <span style={{ marginLeft: 8, opacity: 0.7 }}>({Math.round(deficit * 7 / 7700 * 1000)}g)</span>
            </div>
            <div style={{ fontSize: 11, color: C.textMuted, marginTop: 4 }}>Based on today's numbers · 7,700 kcal = 1kg fat</div>
          </div>
        )}

        {deficit !== null && deficit <= 0 && (
          <div style={{ background: C.redLight, borderRadius: 14, padding: '12px 16px', border: `1px solid ${C.redBorder}` }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: C.red }}>Not in deficit today — ate {Math.abs(Math.round(deficit))} kcal above burn</div>
          </div>
        )}
      </>}

      {/* Meal plan reference */}
      <span style={s.lbl} style={{ marginTop: 16 }}>Meal plan reference</span>
      <div style={s.card}>
        {[
          { meal: 'Breakfast', desc: 'Protein pudding 125g + banana or clementine', kcal: '~250' },
          { meal: 'Lunch', desc: '3 eggs + 40g ham + 20g cheese + 5 tomatoes', kcal: '~450' },
          { meal: 'Snack', desc: '1 banana OR 1 boiled egg', kcal: '~80–100' },
          { meal: 'Dinner', desc: 'Tuna+tomatoes / chicken / veggie omelette / soup', kcal: '~200–300' },
          { meal: 'Drinks', desc: 'Coke Zero · max 1 Monster Zero', kcal: '~0–10' },
        ].map((m, i, arr) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '13px 16px', borderBottom: i < arr.length - 1 ? `1px solid ${C.neutral}` : 'none' }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{m.meal}</div>
              <div style={{ fontSize: 12, color: C.textMuted, marginTop: 2 }}>{m.desc}</div>
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, color: C.blueDeep, minWidth: 65, textAlign: 'right' }}>{m.kcal}</div>
          </div>
        ))}
      </div>
    </>
  )
}
