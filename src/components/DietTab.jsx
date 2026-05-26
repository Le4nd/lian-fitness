import { C, TARGET_KCAL, STEPS_GOAL, calcBMR, calcTDEE, START_W } from '../lib/constants'
import { s } from '../lib/styles'

export function DietTab({ todayData, weightLog, newCal, setNewCal, logCalories, newSteps, setNewSteps, logSteps }) {
  const latestW = weightLog[weightLog.length - 1]?.weight ?? START_W
  const bmr = calcBMR(latestW)
  const tdee = calcTDEE(latestW)
  const todayCal = todayData.calories ?? null
  const todaySteps = todayData.steps ?? null
  const calDiff = todayCal !== null ? todayCal - TARGET_KCAL : null
  const deficitVsTDEE = todayCal !== null ? tdee - todayCal : null

  return (
    <>
      <span style={s.lbl}>Steps today</span>
      <div style={{ ...s.card, padding: 16 }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: todaySteps ? 8 : 0 }}>
          <input
            type="number" placeholder="Steps today" value={newSteps}
            onChange={e => setNewSteps(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && logSteps()}
            style={{ ...s.inp, flex: 1 }}
          />
          <button onClick={logSteps} style={s.btn}>Log</button>
        </div>
        {todaySteps && <>
          <div style={s.pBar}><div style={s.pFill(Math.min(100, Math.round((todaySteps / STEPS_GOAL) * 100)))} /></div>
          <div style={{ fontSize: 11, color: todaySteps >= STEPS_GOAL ? C.green : C.textMuted, textAlign: 'right', marginTop: 3, fontWeight: 600 }}>
            {todaySteps.toLocaleString()} / {STEPS_GOAL.toLocaleString()} {todaySteps >= STEPS_GOAL ? '✓' : ''}
          </div>
        </>}
      </div>

      <span style={s.lbl}>Calories today</span>
      <div style={{ ...s.card, padding: 16 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            type="number" placeholder="Total kcal" value={newCal}
            onChange={e => setNewCal(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && logCalories()}
            style={{ ...s.inp, flex: 1 }}
          />
          <button onClick={logCalories} style={s.btn}>Log</button>
        </div>
      </div>

      {todayCal !== null && <>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
          <div style={s.statCard(C.blueLight, C.blueMid, C.blueDeep)}><div style={s.statNum}>{todayCal}</div><div style={s.statLbl}>eaten</div></div>
          <div style={s.statCard(C.pinkLight, C.pinkMid, C.pinkDeep)}><div style={s.statNum}>{TARGET_KCAL}</div><div style={s.statLbl}>target</div></div>
        </div>
        <div style={{ background: calDiff <= 0 ? C.greenLight : C.redLight, borderRadius: 14, padding: '12px 16px', border: `1px solid ${calDiff <= 0 ? C.greenBorder : C.redBorder}`, marginBottom: 10 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: calDiff <= 0 ? C.green : C.red }}>
            {calDiff <= 0 ? `${Math.abs(calDiff)} kcal under target ✓` : `${calDiff} kcal over target ↑`}
          </div>
        </div>
        <div style={{ background: deficitVsTDEE > 0 ? C.greenLight : C.redLight, borderRadius: 14, padding: '12px 16px', border: `1px solid ${deficitVsTDEE > 0 ? C.greenBorder : C.redBorder}`, marginBottom: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: deficitVsTDEE > 0 ? C.green : C.red, marginBottom: 4 }}>
            {deficitVsTDEE > 0 ? `In deficit — ${deficitVsTDEE} kcal below TDEE ✓` : `Not in deficit — ${Math.abs(deficitVsTDEE)} kcal above TDEE`}
          </div>
          <div style={{ fontSize: 12, color: C.textMuted }}>TDEE: ~{tdee} kcal · BMR: ~{bmr} kcal · {latestW}kg</div>
        </div>
      </>}

      <span style={s.lbl}>Meal plan reference</span>
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
