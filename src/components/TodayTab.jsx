import { C, DEFAULT_HABITS, STEPS_GOAL, WATER_GOAL, START_W, TARGET_W } from '../lib/constants'
import { s } from '../lib/styles'
import { SleepLog } from './SleepLog'

export function TodayTab({ habits, toggleHabit, weightLog, todayData, addWater, removeWater, selectedDate, sleepHours, onLogSleep }) {
  const latestW = weightLog[weightLog.length - 1]?.weight ?? START_W
  const lostKg = Math.max(0, START_W - latestW).toFixed(1)
  const toGoKg = Math.max(0, latestW - TARGET_W).toFixed(1)
  const weightPct = Math.min(100, Math.round(((START_W - latestW) / (START_W - TARGET_W)) * 100))
  const doneCount = habits.filter(h => h.done).length
  const habitPct = Math.round((doneCount / habits.length) * 100)
  const todaySteps = todayData.steps ?? null
  const todayWater = todayData.water ?? 0
  const isToday = selectedDate === new Date().toISOString().split('T')[0]

  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 20 }}>
        {[
          { label: 'weight', value: `${latestW}kg`, bg: C.blueLight, border: C.blueMid, color: C.blueDeep },
          { label: 'lost', value: `${lostKg}kg`, bg: C.pinkLight, border: C.pinkMid, color: C.pinkDeep },
          { label: 'to go', value: `${toGoKg}kg`, bg: C.blueLight, border: C.blueMid, color: C.blueDeep },
        ].map(sc => (
          <div key={sc.label} style={s.statCard(sc.bg, sc.border, sc.color)}>
            <div style={s.statNum}>{sc.value}</div>
            <div style={s.statLbl}>{sc.label}</div>
          </div>
        ))}
      </div>

      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: C.textMuted, marginBottom: 6 }}>
          <span>Progress to 65kg</span>
          <span style={{ color: C.blueDeep, fontWeight: 600 }}>{weightPct}%</span>
        </div>
        <div style={s.pBar}><div style={s.pFill(weightPct)} /></div>
      </div>

      {/* Steps */}
      <div style={{ ...s.card, padding: '12px 16px', marginBottom: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 600 }}>👣 Steps</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: todaySteps && todaySteps >= STEPS_GOAL ? C.green : C.blueDeep }}>
            {todaySteps?.toLocaleString() ?? '—'} / {STEPS_GOAL.toLocaleString()}
          </span>
        </div>
        <div style={s.pBar}>
          <div style={s.pFill(todaySteps ? Math.min(100, Math.round((todaySteps / STEPS_GOAL) * 100)) : 0)} />
        </div>
      </div>

      {/* Water */}
      <div style={{ ...s.card, padding: '12px 16px', marginBottom: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 600 }}>💧 Water</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: todayWater >= WATER_GOAL ? C.green : C.blueDeep }}>
            {todayWater} / {WATER_GOAL} glasses
          </span>
        </div>
        <div style={{ display: 'flex', gap: 4, marginBottom: 10 }}>
          {Array.from({ length: WATER_GOAL }).map((_, i) => (
            <div key={i} style={{ flex: 1, height: 26, borderRadius: 6, background: i < todayWater ? C.blue : C.neutral, border: `1px solid ${i < todayWater ? C.blueMid : C.neutralBorder}`, transition: 'background .2s' }} />
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={addWater} style={{ ...s.btn, flex: 1, padding: '8px 12px', fontSize: 13 }}>+ Glass</button>
          <button onClick={removeWater} style={{ ...s.btnGhost, flex: 1, padding: '8px 12px', fontSize: 13 }}>− Remove</button>
        </div>
      </div>

      {/* Sleep */}
      <div style={{ marginBottom: 12 }}>
        <SleepLog sleepHours={sleepHours} onSave={onLogSleep} selectedDate={selectedDate} />
      </div>

      {/* Habits */}
      <span style={s.lbl}>Daily checklist — {doneCount}/{habits.length}</span>
      <div style={s.card}>
        {habits.map((h, i) => (
          <div key={h.id} onClick={() => toggleHabit(h.id)} style={{
            display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px',
            borderBottom: i < habits.length - 1 ? `1px solid ${C.neutral}` : 'none',
            cursor: 'pointer',
            background: h.done ? (i % 2 === 0 ? C.blueLight : C.pinkLight) : C.white,
            transition: 'background .2s',
          }}>
            <div style={{ width: 24, height: 24, borderRadius: 7, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: h.done ? `linear-gradient(135deg,${C.blue},${C.pink})` : 'transparent', border: h.done ? 'none' : `1.5px solid ${C.neutralBorder}`, transition: 'all .2s' }}>
              {h.done && <span style={{ color: '#fff', fontSize: 14 }}>✓</span>}
            </div>
            <span style={{ fontSize: 15 }}>{h.icon}</span>
            <span style={{ fontSize: 14, flex: 1, color: h.done ? C.textMuted : C.textMain, textDecoration: h.done ? 'line-through' : 'none' }}>{h.name}</span>
            {h.weekly && <span style={{ fontSize: 10, color: C.textMuted, background: C.neutral, padding: '2px 7px', borderRadius: 6 }}>weekly</span>}
          </div>
        ))}
      </div>
      <div style={s.pBar}><div style={s.pFill(habitPct)} /></div>
      <div style={{ fontSize: 11, color: C.textMuted, textAlign: 'right', marginTop: 4 }}>{habitPct}% of daily goals</div>
    </>
  )
}
