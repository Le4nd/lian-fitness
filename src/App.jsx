import { useState, useEffect, useRef, useCallback } from 'react'
import { C, DEFAULT_HABITS, MILESTONES, todayStr, ROUTINE } from './lib/constants'
import { s } from './lib/styles'
import * as db from './lib/db'
import { SyncDot } from './components/SyncDot'
import { TodayTab } from './components/TodayTab'
import { GymTab } from './components/GymTab'
import { DietTab } from './components/DietTab'
import { WeightTab, BodyTab, WeekTab, GoalsTab } from './components/Tabs'

const TABS = [
  { id: 'today', label: 'Today', icon: '🌸' },
  { id: 'gym',   label: 'Gym',   icon: '🏋️' },
  { id: 'diet',  label: 'Diet',  icon: '🥗' },
  { id: 'weight',label: 'Weight',icon: '⚖️' },
  { id: 'body',  label: 'Body',  icon: '📏' },
  { id: 'week',  label: 'Week',  icon: '📊' },
  { id: 'goals', label: 'Goals', icon: '🦋' },
]

export default function App() {
  const [tab, setTab] = useState('today')
  const [gymDay, setGymDay] = useState(0)  // lifted here so it never resets
  const [syncStatus, setSyncStatus] = useState('loading')
  const [showMilestone, setShowMilestone] = useState(null)

  const [streak, setStreak] = useState(1)
  const [habits, setHabits] = useState(DEFAULT_HABITS.map(h => ({ ...h, done: false })))
  const [weightLog, setWeightLog] = useState([])
  const [dailyLog, setDailyLog] = useState({})
  const [habitsRange, setHabitsRange] = useState({})
  const [measureLog, setMeasureLog] = useState([])
  const [gymHistory, setGymHistory] = useState({})
  const [todayGymSets, setTodayGymSets] = useState({})
  const [lastMilestone, setLastMilestone] = useState(null)

  const [newWeight, setNewWeight] = useState('')
  const [newCal, setNewCal] = useState('')
  const [newSteps, setNewSteps] = useState('')
  const [newMeasure, setNewMeasure] = useState({ waist: '', hips: '', thighs: '' })

  const debounceRef = useRef({})

  // ── INITIAL LOAD ──────────────────────────────────────────────────────────
  useEffect(() => {
    ;(async () => {
      try {
        setSyncStatus('loading')

        const [streakVal, weights, todayDaily, todayHabits, measures, gs] = await Promise.all([
          db.loadAndUpdateStreak(),
          db.getAllWeights(),
          db.getDaily(todayStr()),
          db.getHabitsForDate(todayStr()),
          db.getAllMeasurements(),
          db.getTodayGymSets(),
        ])

        setStreak(streakVal)
        setMeasureLog(measures)
        setTodayGymSets(gs)

        // Weight — seed if empty
        if (weights.length === 0) {
          await db.logWeight(97)
          weights.push({ date: todayStr(), weight: 97 })
        }
        setWeightLog(weights)

        // Habits
        if (Object.keys(todayHabits).length > 0) {
          setHabits(DEFAULT_HABITS.map(h => ({ ...h, done: todayHabits[h.id] ?? false })))
        }

        // Week range — merge, don't overwrite today
        const weekDates = Array.from({ length: 7 }, (_, i) => {
          const d = new Date(); d.setDate(d.getDate() - (6 - i))
          return d.toISOString().split('T')[0]
        })
        const [weekDaily, weekHabits] = await Promise.all([
          db.getDailyRange(weekDates),
          db.getHabitsRange(weekDates),
        ])
        // Merge today's fresh data into the week map
        setDailyLog({ ...weekDaily, [todayStr()]: todayDaily })
        setHabitsRange(weekHabits)

        // Gym history — load all exercises for all non-rest days
        const histMap = {}
        for (const day of ROUTINE.filter(d => !d.rest)) {
          // Flatten all exercises in this day to get correct global indices
          const flatExs = day.sections.flatMap(sec => sec.exs)
          for (let exIdx = 0; exIdx < flatExs.length; exIdx++) {
            const rows = await db.getGymHistory(day.id, exIdx, 5)
            if (rows.length) histMap[`${day.id}:${exIdx}`] = rows
          }
        }
        setGymHistory(histMap)

        const lm = await db.getMeta('milestone')
        setLastMilestone(lm?.weight ?? null)

        setSyncStatus('idle')
      } catch (err) {
        console.error('Load error:', err)
        setSyncStatus('error')
      }
    })()
  }, [])

  // ── HELPERS ───────────────────────────────────────────────────────────────
  const withSync = useCallback(async (fn) => {
    setSyncStatus('saving')
    try { await fn() } catch (e) { console.error(e); setSyncStatus('error'); return }
    setSyncStatus('idle')
  }, [])

  const patchDailyLog = (field, value) => {
    setDailyLog(prev => ({
      ...prev,
      [todayStr()]: { ...(prev[todayStr()] ?? {}), [field]: value }
    }))
  }

  // ── ACTIONS ───────────────────────────────────────────────────────────────
  const toggleHabit = async (id) => {
    const next = habits.map(h => h.id === id ? { ...h, done: !h.done } : h)
    setHabits(next)
    const h = next.find(h => h.id === id)
    await withSync(() => db.setHabit(id, h.done))
  }

  const addWater = async () => {
    const cur = dailyLog[todayStr()]?.water ?? 0
    const next = Math.min(cur + 1, 20)
    patchDailyLog('water', next)
    await withSync(() => db.updateDaily('water', next))
  }

  const removeWater = async () => {
    const cur = dailyLog[todayStr()]?.water ?? 0
    const next = Math.max(cur - 1, 0)
    patchDailyLog('water', next)
    await withSync(() => db.updateDaily('water', next))
  }

  const logWeight = async () => {
    const w = parseFloat(newWeight)
    if (!w || w < 30 || w > 250) return
    await withSync(async () => {
      await db.logWeight(w)
      const next = [...weightLog.filter(e => e.date !== todayStr()), { date: todayStr(), weight: w }]
        .sort((a, b) => a.date.localeCompare(b.date))
      setWeightLog(next)
      setNewWeight('')
      const hit = [...MILESTONES].reverse().find(m => w <= m.weight)
      if (hit && hit.weight !== lastMilestone) {
        setShowMilestone(hit)
        setLastMilestone(hit.weight)
        await db.setMeta('milestone', { weight: hit.weight })
      }
    })
  }

  const logCalories = async () => {
    const c = parseInt(newCal)
    if (!c || c < 0 || c > 10000) return
    patchDailyLog('calories', c)
    setNewCal('')
    await withSync(() => db.updateDaily('calories', c))
  }

  const logSteps = async () => {
    const st = parseInt(newSteps)
    if (!st || st < 0) return
    patchDailyLog('steps', st)
    setNewSteps('')
    await withSync(() => db.updateDaily('steps', st))
  }

  const logMeasurements = async () => {
    const { waist, hips, thighs } = newMeasure
    if (!waist && !hips && !thighs) return
    const entry = {
      waist: waist ? +waist : null,
      hips: hips ? +hips : null,
      thighs: thighs ? +thighs : null,
    }
    await withSync(async () => {
      await db.logMeasurements(entry)
      const next = [...measureLog.filter(m => m.date !== todayStr()), { date: todayStr(), ...entry }]
        .sort((a, b) => a.date.localeCompare(b.date))
      setMeasureLog(next)
      setNewMeasure({ waist: '', hips: '', thighs: '' })
    })
  }

  const handleSetChange = (dayId, exIdx, setIdx, field, val) => {
    const key = `${dayId}:${exIdx}:${setIdx}`
    const updated = { ...(todayGymSets[key] ?? {}), [field]: val }
    setTodayGymSets(prev => ({ ...prev, [key]: updated }))
    clearTimeout(debounceRef.current[key])
    debounceRef.current[key] = setTimeout(async () => {
      setSyncStatus('saving')
      await db.upsertGymSetToday(dayId, exIdx, setIdx, updated.kg, updated.reps)
      setSyncStatus('idle')
    }, 800)
  }

  const handleSaveHistory = async (dayId, exIdx, numSets) => {
    const sets = Array.from({ length: numSets }, (_, i) => {
      const sv = todayGymSets[`${dayId}:${exIdx}:${i}`] ?? {}
      return { setIdx: i, kg: sv.kg, reps: sv.reps }
    })
    await withSync(async () => {
      const saved = await db.saveGymSets(dayId, exIdx, sets)
      if (saved > 0) {
        // Reload history for this exercise
        const rows = await db.getGymHistory(dayId, exIdx, 5)
        setGymHistory(prev => ({ ...prev, [`${dayId}:${exIdx}`]: rows }))
      }
    })
  }

  // ── RENDER ────────────────────────────────────────────────────────────────
  const todayData = dailyLog[todayStr()] ?? {}

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

      {/* HEADER */}
      <div style={{ padding: '24px 20px 0', paddingTop: 'calc(24px + env(safe-area-inset-top))' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 400, margin: '0 0 3px', letterSpacing: '-0.5px', fontFamily: "'DM Serif Display',serif" }}>Lian's Journey</h1>
            <p style={{ fontSize: 13, color: C.textMuted, margin: 0 }}>
              {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
            <div style={{ background: `linear-gradient(135deg,${C.blue},${C.pink})`, borderRadius: 20, padding: '5px 14px' }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>🔥 {streak}d</span>
            </div>
            <SyncDot status={syncStatus} />
          </div>
        </div>
        <div style={{ display: 'flex', height: 3, borderRadius: 2, margin: '16px 0 0', overflow: 'hidden' }}>
          {[C.blue, C.pink, '#fff', C.pink, C.blue].map((c, i) => (
            <div key={i} style={{ flex: 1, background: c, border: c === '#fff' ? `1px solid ${C.neutralBorder}` : 'none' }} />
          ))}
        </div>
      </div>

      {/* TABS */}
      <div style={{ display: 'flex', padding: '0 4px', borderBottom: `1px solid ${C.neutralBorder}`, overflowX: 'auto', marginTop: 4 }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding: '10px 9px', fontSize: 11, fontWeight: 600, border: 'none',
            background: 'transparent',
            color: tab === t.id ? C.blueDeep : C.textMuted,
            borderBottom: tab === t.id ? `2px solid ${C.blue}` : '2px solid transparent',
            cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all .15s', flexShrink: 0,
          }}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* CONTENT */}
      <div style={{ padding: '20px 16px', paddingBottom: 'calc(40px + env(safe-area-inset-bottom))' }}>
        {tab === 'today' && (
          <TodayTab
            habits={habits} toggleHabit={toggleHabit}
            weightLog={weightLog} todayData={todayData}
            addWater={addWater} removeWater={removeWater}
          />
        )}
        {tab === 'gym' && (
          <GymTab
            gymDay={gymDay} setGymDay={setGymDay}
            todayGymSets={todayGymSets}
            gymHistory={gymHistory}
            onSetChange={handleSetChange}
            onSaveHistory={handleSaveHistory}
          />
        )}
        {tab === 'diet' && (
          <DietTab
            todayData={todayData} weightLog={weightLog}
            newCal={newCal} setNewCal={setNewCal} logCalories={logCalories}
            newSteps={newSteps} setNewSteps={setNewSteps} logSteps={logSteps}
          />
        )}
        {tab === 'weight' && (
          <WeightTab
            weightLog={weightLog}
            newWeight={newWeight} setNewWeight={setNewWeight} logWeight={logWeight}
          />
        )}
        {tab === 'body' && (
          <BodyTab
            measureLog={measureLog}
            newMeasure={newMeasure} setNewMeasure={setNewMeasure} logMeasurements={logMeasurements}
          />
        )}
        {tab === 'week' && (
          <WeekTab
            habits={habits} weightLog={weightLog}
            dailyLog={dailyLog} habitsRange={habitsRange}
          />
        )}
        {tab === 'goals' && <GoalsTab weightLog={weightLog} />}
      </div>
    </div>
  )
}
