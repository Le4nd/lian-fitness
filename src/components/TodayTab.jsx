import { C, DAILY_HABITS, WEEKLY_HABITS, STEPS_GOAL, WATER_GOAL, START_W, TARGET_W, todayStr } from '../lib/constants'
import { s } from '../lib/styles'
import { SleepLog } from './SleepLog'

// Compute auto-checked state for a habit based on logged data
function isAutoChecked(habit, todayData, weightLog, measureLog, selectedDate) {
  if (!habit.auto) return null // not auto — returns null meaning "use manual state"
  if (habit.auto === 'steps') return (todayData.steps ?? 0) >= STEPS_GOAL
  if (habit.auto === 'sleep') return (todayData.sleep ?? 0) >= 7.5
  if (habit.auto === 'weight') return weightLog.some(e => e.date === selectedDate)
  return null
}

function isWeeklyAutoChecked(habit, measureLog) {
  if (habit.auto !== 'measure') return null
  const weekStart = (() => {
    const d = new Date(); d.setDate(d.getDate() - d.getDay()); return d.toISOString().split('T')[0]
  })()
  return measureLog.some(m => m.date >= weekStart)
}

function HabitRow({ habit, done, onToggle, autoChecked, disabled }) {
  const isAuto = autoChecked !== null
  const checked = isAuto ? autoChecked : done

  return (
    <div
      onClick={isAuto ? undefined : onToggle}
      style={{
        display: 'flex', alignItems: 'center', gap: 12, padding: '13px 16px',
        cursor: isAuto ? 'default' : 'pointer',
        background: checked ? C.blueLight : C.white,
        transition: 'background .2s',
      }}
    >
      <div style={{
        width: 24, height: 24, borderRadius: 7, flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: checked ? `linear-gradient(135deg,${C.blue},${C.pink})` : 'transparent',
        border: checked ? 'none' : `1.5px solid ${C.neutralBorder}`,
        transition: 'all .2s',
        opacity: isAuto && !checked ? 0.5 : 1,
      }}>
        {checked && <span style={{ color: '#fff', fontSize: 14 }}>✓</span>}
      </div>
      <span style={{ fontSize: 15 }}>{habit.icon}</span>
      <span style={{ fontSize: 14, flex: 1, color: checked ? C.textMuted : C.textMain, textDecoration: checked ? 'line-through' : 'none' }}>
        {habit.name}
      </span>
      {isAuto && (
        <span style={{ fontSize: 10, color: C.textMuted, background: C.neutral, padding: '2px 7px', borderRadius: 6, fontFamily: "'DM Sans',sans-serif" }}>
          auto
        </span>
      )}
    </div>
  )
}

export function TodayTab({ habits, toggleHabit, weeklyHabits, toggleWeeklyHabit, weightLog, todayData, addWater, removeWater, selectedDate, sleepHours, onLogSleep, measureLog }) {
  const latestW = weightLog[weightLog.length - 1]?.weight ?? START_W
  const lostKg = Math.max(0, START_W - latestW).toFixed(1)
  const toGoKg = Math.max(0, latestW - TARGET_W).toFixed(1)
  const weightPct = Math.min(100, Math.round(((START_W - latestW) / (START_W - TARGET_W)) * 100))
  const todaySteps = todayData.steps ?? null
  const todayWater = todayData.water ?? 0

  // Compute effective checked state for each daily habit
  const effectiveHabits = DAILY_HABITS.map(h => {
    const autoChecked = isAutoChecked(h, todayData, weightLog, measureLog, selectedDate)
    const manualDone = habits[h.id] ?? false
    return { ...h, effectiveDone: autoChecked !== null ? autoChecked : manualDone, autoChecked }
  })

  // Compute effective checked state for weekly habits
  const effectiveWeekly = WEEKLY_HABITS.map(h => {
    const autoChecked = isWeeklyAutoChecked(h, measureLog)
    const manualDone = weeklyHabits[h.id] ?? false
    return { ...h, effectiveDone: autoChecked !== null ? autoChecked : manualDone, autoChecked }
  })

  const dailyDone = effectiveHabits.filter(h => h.effectiveDone).length
  const weeklyDone = effectiveWeekly.filter(h => h.effectiveDone).length
  const totalDone = dailyDone + weeklyDone
  const totalHabits = DAILY_HABITS.length + WEEKLY_HABITS.length
  const habitPct = Math.round((totalDone / totalHabits) * 100)

  return (
    <>
      {/* Stats */}
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

      {/* Progress bar */}
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
      <div style={{ marginBottom: 16 }}>
        <SleepLog sleepHours={sleepHours} onSave={onLogSleep} selectedDate={selectedDate} />
      </div>

      {/* Daily habits */}
      <span style={s.lbl}>Daily — {dailyDone}/{DAILY_HABITS.length}</span>
      <div style={{ ...s.card, marginBottom: 16 }}>
        {effectiveHabits.map((h, i) => (
          <div key={h.id} style={{ borderBottom: i < effectiveHabits.length - 1 ? `1px solid ${C.neutral}` : 'none' }}>
            <HabitRow
              habit={h}
              done={habits[h.id] ?? false}
              autoChecked={h.autoChecked}
              onToggle={() => toggleHabit(h.id)}
            />
          </div>
        ))}
      </div>

      {/* Weekly habits */}
      <span style={s.lbl}>Weekly — {weeklyDone}/{WEEKLY_HABITS.length}</span>
      <div style={{ ...s.card, marginBottom: 16 }}>
        {effectiveWeekly.map((h, i) => (
          <div key={h.id} style={{ borderBottom: i < effectiveWeekly.length - 1 ? `1px solid ${C.neutral}` : 'none' }}>
            <HabitRow
              habit={h}
              done={weeklyHabits[h.id] ?? false}
              autoChecked={h.autoChecked}
              onToggle={() => toggleWeeklyHabit(h.id)}
            />
          </div>
        ))}
      </div>

      {/* Overall progress */}
      <div style={s.pBar}><div style={s.pFill(habitPct)} /></div>
      <div style={{ fontSize: 11, color: C.textMuted, textAlign: 'right', marginTop: 4 }}>{habitPct}% of all goals today</div>
    </>
  )
}
