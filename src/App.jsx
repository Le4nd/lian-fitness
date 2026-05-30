import { useState, useEffect, useRef, useCallback } from 'react'
import { C, DAILY_HABITS, WEEKLY_HABITS, MILESTONES, todayStr, ROUTINE } from './lib/constants'
import { s } from './lib/styles'
import * as db from './lib/db'
import { SyncDot } from './components/SyncDot'
import { TodayTab } from './components/TodayTab'
import { GymTab } from './components/GymTab'
import { DietTab } from './components/DietTab'
import { WeightTab, BodyTab, WeekTab, GoalsTab } from './components/Tabs'
import { QuickLog } from './components/QuickLog'
import { WeightChart } from './components/WeightChart'
import { enableNotifications, scheduleNotifications } from './lib/notifications'

const TABS = [
  { id: 'today', label: 'Today', icon: '🌸' },
  { id: 'gym',   label: 'Gym',   icon: '🏋️' },
  { id: 'diet',  label: 'Diet',  icon: '🥗' },
  { id: 'weight',label: 'Weight',icon: '⚖️' },
  { id: 'body',  label: 'Body',  icon: '📏' },
  { id: 'week',  label: 'Week',  icon: '📊' },
  { id: 'goals', label: 'Goals', icon: '🦋' },
]

function formatDateLabel(dateStr) {
  const isToday = dateStr === todayStr()
  const y = new Date(); y.setDate(y.getDate() - 1)
  const isYesterday = dateStr === y.toISOString().split('T')[0]
  if (isToday) return 'Today'
  if (isYesterday) return 'Yesterday'
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })
}

function DateNav({ selectedDate, setSelectedDate }) {
  const isToday = selectedDate === todayStr()
  const shiftDay = (n) => {
    const d = new Date(selectedDate + 'T12:00:00')
    d.setDate(d.getDate() + n)
    const next = d.toISOString().split('T')[0]
    if (next <= todayStr()) setSelectedDate(next)
  }
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '8px 16px', background: C.white, borderBottom: `1px solid ${C.neutralBorder}`, flexWrap: 'wrap' }}>
      <button onClick={() => shiftDay(-1)} style={{ ...s.btnGhost, padding: '5px 14px', fontSize: 18, lineHeight: 1 }}>‹</button>
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ fontSize: 14, fontWeight: 600, color: isToday ? C.blueDeep : C.pinkDeep, minWidth: 130, textAlign: 'center' }}>
          {formatDateLabel(selectedDate)}
        </span>
        <span style={{ fontSize: 14 }}>📅</span>
        <input type="date" max={todayStr()} value={selectedDate}
          onChange={e => { if (e.target.value && e.target.value <= todayStr()) setSelectedDate(e.target.value) }}
          style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', width: '100%' }} />
      </div>
      <button onClick={() => shiftDay(1)} disabled={isToday}
        style={{ ...s.btnGhost, padding: '5px 14px', fontSize: 18, lineHeight: 1, opacity: isToday ? 0.3 : 1 }}>›</button>
      {!isToday && (
        <button onClick={() => setSelectedDate(todayStr())} style={{ ...s.btn, padding: '4px 12px', fontSize: 11 }}>
          Back to today
        </button>
      )}
    </div>
  )
}

export default function App() {
  const [tab, setTab] = useState('today')
  const [gymDay, setGymDay] = useState(0)
  const [syncStatus, setSyncStatus] = useState('loading')
  const [showMilestone, setShowMilestone] = useState(null)
  const [selectedDate, setSelectedDate] = useState(todayStr())
  const [notifGranted, setNotifGranted] = useState(false)

  const [streak, setStreak] = useState(1)
  // Daily habits: { date: { habitId: bool } }
  const [habitsLog, setHabitsLog] = useState({})
  // Weekly habits: { habitId: bool } — current week only
  const [weeklyHabits, setWeeklyHabits] = useState({})
  const [weightLog, setWeightLog] = useState([])
  const [dailyLog, setDailyLog] = useState({})
  const [measureLog, setMeasureLog] = useState([])
  const [gymHistory, setGymHistory] = useState({})
  const [gymSets, setGymSets] = useState({})
  const [lastMilestone, setLastMilestone] = useState(null)

  const [newWeight, setNewWeight] = useState('')
  const [newCal, setNewCal] = useState('')
  const [newSteps, setNewSteps] = useState('')
  const [newMeasure, setNewMeasure] = useState({ waist: '', hips: '', thighs: '' })

  const debounceRef = useRef({})

  const todayData = dailyLog[selectedDate] ?? {}
  const selectedGymSets = gymSets[selectedDate] ?? {}
  const isToday = selectedDate === todayStr()

  // ── LOAD ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    ;(async () => {
      try {
        setSyncStatus('loading')
        const [streakVal, weights, measures, lm] = await Promise.all([
          db.loadAndUpdateStreak(), db.getAllWeights(), db.getAllMeasurements(), db.getMeta('milestone'),
        ])
        setStreak(streakVal)
        setMeasureLog(measures)
        setLastMilestone(lm?.weight ?? null)
        if (weights.length === 0) { await db.logWeight(97); weights.push({ date: todayStr(), weight: 97 }) }
        setWeightLog(weights)

        const dates30 = Array.from({ length: 30 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() - i); return d.toISOString().split('T')[0] })
        const [dailyMap, habitsMap, gs, wh] = await Promise.all([
          db.getDailyRange(dates30),
          db.getHabitsRange(dates30),
          db.getGymSetsForDate(todayStr()),
          db.getMeta('weekly_habits'),
        ])
        setDailyLog(dailyMap)
        setHabitsLog(habitsMap)
        setGymSets({ [todayStr()]: gs })
        setWeeklyHabits(wh ?? {})

        const histMap = {}
        for (const day of ROUTINE.filter(d => !d.rest)) {
          const flatExs = day.sections.flatMap(sec => sec.exs)
          for (let exIdx = 0; exIdx < flatExs.length; exIdx++) {
            const rows = await db.getGymHistory(day.id, exIdx, 5)
            if (rows.length) histMap[`${day.id}:${exIdx}`] = rows
          }
        }
        setGymHistory(histMap)
        setSyncStatus('idle')
        if (Notification?.permission === 'granted') { setNotifGranted(true); scheduleNotifications() }
      } catch (err) { console.error('Load error:', err); setSyncStatus('error') }
    })()
  }, [])

  useEffect(() => {
    if (gymSets[selectedDate] !== undefined) return
    ;(async () => {
      setSyncStatus('loading')
      const gs = await db.getGymSetsForDate(selectedDate)
      setGymSets(prev => ({ ...prev, [selectedDate]: gs }))
      setSyncStatus('idle')
    })()
  }, [selectedDate])

  // ── HELPERS ───────────────────────────────────────────────────────────────
  const withSync = useCallback(async (fn) => {
    setSyncStatus('saving')
    try { await fn() } catch (e) { console.error(e); setSyncStatus('error'); return }
    setSyncStatus('idle')
  }, [])

  const patchDaily = (date, field, value) =>
    setDailyLog(prev => ({ ...prev, [date]: { ...(prev[date] ?? {}), [field]: value } }))

  // ── ACTIONS ───────────────────────────────────────────────────────────────
  const toggleHabit = async (id) => {
    const next = !(habitsLog[selectedDate]?.[id] ?? false)
    setHabitsLog(prev => ({ ...prev, [selectedDate]: { ...(prev[selectedDate] ?? {}), [id]: next } }))
    await withSync(() => db.setHabitForDate(selectedDate, id, next))
  }

  const toggleWeeklyHabit = async (id) => {
    const next = !(weeklyHabits[id] ?? false)
    const updated = { ...weeklyHabits, [id]: next }
    setWeeklyHabits(updated)
    await withSync(() => db.setMeta('weekly_habits', updated))
  }

  const addWater = async () => {
    const next = Math.min((todayData.water ?? 0) + 1, 20)
    patchDaily(selectedDate, 'water', next)
    await withSync(() => db.updateDailyForDate(selectedDate, 'water', next))
  }
  const removeWater = async () => {
    const next = Math.max((todayData.water ?? 0) - 1, 0)
    patchDaily(selectedDate, 'water', next)
    await withSync(() => db.updateDailyForDate(selectedDate, 'water', next))
  }

  const logSleep = async (hours) => {
    patchDaily(selectedDate, 'sleep', hours)
    await withSync(() => db.updateDailyForDate(selectedDate, 'sleep', hours))
  }

  const doLogWeight = async (w) => {
    if (!w || w < 30 || w > 250) return
    await withSync(async () => {
      await db.logWeight(w, selectedDate)
      const next = [...weightLog.filter(e => e.date !== selectedDate), { date: selectedDate, weight: w }]
        .sort((a, b) => a.date.localeCompare(b.date))
      setWeightLog(next)
      setNewWeight('')
      if (isToday) {
        const hit = [...MILESTONES].reverse().find(m => w <= m.weight)
        if (hit && hit.weight !== lastMilestone) { setShowMilestone(hit); setLastMilestone(hit.weight); await db.setMeta('milestone', { weight: hit.weight }) }
      }
    })
  }
  const logWeight = () => doLogWeight(parseFloat(newWeight))

  const doLogCalories = async (c) => {
    if (!c || c < 0) return
    patchDaily(selectedDate, 'calories', c)
    setNewCal('')
    await withSync(() => db.updateDailyForDate(selectedDate, 'calories', c))
  }
  const logCalories = () => doLogCalories(parseInt(newCal))

  const doLogSteps = async (st) => {
    if (!st || st < 0) return
    patchDaily(selectedDate, 'steps', st)
    setNewSteps('')
    await withSync(() => db.updateDailyForDate(selectedDate, 'steps', st))
  }
  const logSteps = () => doLogSteps(parseInt(newSteps))

  const logExercise = async ({ exercise_calories, exercise_duration, exercise_distance }) => {
    await withSync(async () => {
      if (exercise_calories !== undefined) patchDaily(selectedDate, 'exercise_calories', exercise_calories)
      if (exercise_duration !== undefined) patchDaily(selectedDate, 'exercise_duration', exercise_duration)
      if (exercise_distance !== undefined) patchDaily(selectedDate, 'exercise_distance', exercise_distance)
      const updates = {}
      if (exercise_calories !== undefined) updates.exercise_calories = exercise_calories
      if (exercise_duration !== undefined) updates.exercise_duration = exercise_duration
      if (exercise_distance !== undefined) updates.exercise_distance = exercise_distance
      for (const [field, value] of Object.entries(updates)) {
        await db.updateDailyForDate(selectedDate, field, value)
      }
    })
  }

  const logMeasurements = async () => {
    const { waist, hips, thighs } = newMeasure
    if (!waist && !hips && !thighs) return
    const entry = { waist: waist ? +waist : null, hips: hips ? +hips : null, thighs: thighs ? +thighs : null }
    await withSync(async () => {
      await db.logMeasurementsForDate(selectedDate, entry)
      const next = [...measureLog.filter(m => m.date !== selectedDate), { date: selectedDate, ...entry }].sort((a, b) => a.date.localeCompare(b.date))
      setMeasureLog(next)
      setNewMeasure({ waist: '', hips: '', thighs: '' })
    })
  }

  const handleSetChange = (dayId, exIdx, setIdx, field, val) => {
    const key = `${dayId}:${exIdx}:${setIdx}`
    const updated = { ...(selectedGymSets[key] ?? {}), [field]: val }
    setGymSets(prev => ({ ...prev, [selectedDate]: { ...(prev[selectedDate] ?? {}), [key]: updated } }))
    clearTimeout(debounceRef.current[key])
    debounceRef.current[key] = setTimeout(async () => {
      setSyncStatus('saving')
      await db.upsertGymSet(selectedDate, dayId, exIdx, setIdx, updated.kg, updated.reps)
      setSyncStatus('idle')
    }, 800)
  }

  const handleSaveHistory = async (dayId, exIdx, numSets) => {
    const sets = Array.from({ length: numSets }, (_, i) => { const sv = selectedGymSets[`${dayId}:${exIdx}:${i}`] ?? {}; return { setIdx: i, kg: sv.kg, reps: sv.reps } })
    await withSync(async () => {
      const saved = await db.saveGymSets(dayId, exIdx, sets, selectedDate)
      if (saved > 0) { const rows = await db.getGymHistory(dayId, exIdx, 5); setGymHistory(prev => ({ ...prev, [`${dayId}:${exIdx}`]: rows })) }
    })
  }

  // ── RENDER ────────────────────────────────────────────────────────────────
  return (
    <div style={{ fontFamily: "'DM Sans',sans-serif", background: `linear-gradient(160deg,${C.blueLight} 0%,#fff 45%,${C.pinkLight} 100%)`, minHeight: '100vh', color: C.textMain }}>
      <style>{`
        * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
        input:focus { box-shadow: 0 0 0 2px ${C.blueMid}; border-color: ${C.blue} !important; outline: none; }
        button:active { transform: scale(0.97); }
        ::-webkit-scrollbar { display: none; }
        body { margin: 0; padding: 0; }
      `}</style>

      {showMilestone && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, backdropFilter: 'blur(4px)' }} onClick={() => setShowMilestone(null)}>
          <div style={{ background: '#fff', borderRadius: 28, padding: '40px 28px', textAlign: 'center', maxWidth: 320, width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>{showMilestone.emoji}</div>
            <div style={{ fontSize: 24, fontFamily: "'DM Serif Display',serif", marginBottom: 8 }}>Milestone reached!</div>
            <div style={{ fontSize: 15, color: C.textMuted, marginBottom: 24 }}>{showMilestone.label}</div>
            <button onClick={() => setShowMilestone(null)} style={{ ...s.btn, width: '100%', padding: '12px 18px' }}>Keep going 💪</button>
          </div>
        </div>
      )}

      <div style={{ padding: '20px 20px 0', paddingTop: 'calc(20px + env(safe-area-inset-top))' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <h1 style={{ fontSize: 26, fontWeight: 400, margin: '0 0 2px', letterSpacing: '-0.5px', fontFamily: "'DM Serif Display',serif" }}>Lian's Journey</h1>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
            <div style={{ background: `linear-gradient(135deg,${C.blue},${C.pink})`, borderRadius: 20, padding: '5px 14px' }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>🔥 {streak}d</span>
            </div>
            <SyncDot status={syncStatus} />
          </div>
        </div>
        <div style={{ display: 'flex', height: 3, borderRadius: 2, margin: '12px 0 0', overflow: 'hidden' }}>
          {[C.blue, C.pink, '#fff', C.pink, C.blue].map((c, i) => (
            <div key={i} style={{ flex: 1, background: c, border: c === '#fff' ? `1px solid ${C.neutralBorder}` : 'none' }} />
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', padding: '0 4px', borderBottom: `1px solid ${C.neutralBorder}`, overflowX: 'auto', marginTop: 4 }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding: '10px 9px', fontSize: 11, fontWeight: 600, border: 'none', background: 'transparent',
            color: tab === t.id ? C.blueDeep : C.textMuted,
            borderBottom: tab === t.id ? `2px solid ${C.blue}` : '2px solid transparent',
            cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all .15s', flexShrink: 0,
          }}>{t.icon} {t.label}</button>
        ))}
      </div>

      {['today', 'gym', 'diet', 'weight', 'body'].includes(tab) && (
        <DateNav selectedDate={selectedDate} setSelectedDate={setSelectedDate} />
      )}

      <div style={{ padding: '16px 16px', paddingBottom: 'calc(100px + env(safe-area-inset-bottom))' }}>
        {tab === 'today' && (
          <>
            <TodayTab
              habits={habitsLog[selectedDate] ?? {}}
              toggleHabit={toggleHabit}
              weeklyHabits={weeklyHabits}
              toggleWeeklyHabit={toggleWeeklyHabit}
              weightLog={weightLog}
              todayData={todayData}
              addWater={addWater}
              removeWater={removeWater}
              selectedDate={selectedDate}
              sleepHours={todayData.sleep ?? null}
              onLogSleep={logSleep}
              measureLog={measureLog}
            />
            {!notifGranted && isToday && (
              <div style={{ background: C.blueLight, borderRadius: 14, padding: '12px 16px', border: `1px solid ${C.blueMid}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.blueDeep }}>🔔 Daily reminders</div>
                  <div style={{ fontSize: 11, color: C.textMuted, marginTop: 2 }}>Get nudged to log weight & habits</div>
                </div>
                <button onClick={() => enableNotifications(() => setNotifGranted(true))} style={{ ...s.btn, padding: '7px 14px', fontSize: 12 }}>Enable</button>
              </div>
            )}
          </>
        )}
        {tab === 'gym' && <GymTab gymDay={gymDay} setGymDay={setGymDay} todayGymSets={selectedGymSets} gymHistory={gymHistory} onSetChange={handleSetChange} onSaveHistory={handleSaveHistory} selectedDate={selectedDate} />}
        {tab === 'diet' && <DietTab todayData={todayData} weightLog={weightLog} newCal={newCal} setNewCal={setNewCal} logCalories={logCalories} newSteps={newSteps} setNewSteps={setNewSteps} logSteps={logSteps} onLogExercise={logExercise} selectedDate={selectedDate} />}
        {tab === 'weight' && (
          <>
            <div style={{ marginBottom: 16 }}><WeightChart weightLog={weightLog} /></div>
            <WeightTab weightLog={weightLog} newWeight={newWeight} setNewWeight={setNewWeight} logWeight={logWeight} selectedDate={selectedDate} />
          </>
        )}
        {tab === 'body' && <BodyTab measureLog={measureLog} newMeasure={newMeasure} setNewMeasure={setNewMeasure} logMeasurements={logMeasurements} selectedDate={selectedDate} />}
        {tab === 'week' && <WeekTab weightLog={weightLog} dailyLog={dailyLog} habitsLog={habitsLog} setSelectedDate={(d) => { setSelectedDate(d); setTab('today') }} />}
        {tab === 'goals' && <GoalsTab weightLog={weightLog} />}
      </div>

      <QuickLog selectedDate={selectedDate} onLogWeight={doLogWeight} onLogSteps={doLogSteps} onLogCalories={doLogCalories} onAddWater={addWater} onLogSleep={logSleep} />
    </div>
  )
}
