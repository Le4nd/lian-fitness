import { supabase } from './supabase'

const today = () => new Date().toISOString().split('T')[0]
const yesterday = () => { const d = new Date(); d.setDate(d.getDate() - 1); return d.toISOString().split('T')[0] }

// ── META ────────────────────────────────────────────────────────────────────
export async function getMeta(key) {
  const { data } = await supabase.from('app_meta').select('value').eq('key', key).single()
  return data?.value ?? null
}
export async function setMeta(key, value) {
  await supabase.from('app_meta').upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' })
}

// ── WEIGHT ──────────────────────────────────────────────────────────────────
export async function getAllWeights() {
  const { data } = await supabase.from('weight_log').select('date, weight').order('date', { ascending: true })
  return data ?? []
}
export async function logWeight(weight) {
  await supabase.from('weight_log').upsert({ date: today(), weight }, { onConflict: 'date' })
}

// ── DAILY (calories, steps, water) ──────────────────────────────────────────
export async function getDaily(date) {
  const { data } = await supabase.from('daily_log').select('*').eq('date', date).single()
  return data ?? {}
}
export async function getDailyRange(dates) {
  const { data } = await supabase.from('daily_log').select('*').in('date', dates)
  const map = {}
  ;(data ?? []).forEach(r => { map[r.date] = r })
  return map
}
export async function updateDaily(field, value) {
  const { data: existing } = await supabase.from('daily_log').select('id').eq('date', today()).single()
  if (existing) {
    await supabase.from('daily_log').update({ [field]: value, updated_at: new Date().toISOString() }).eq('date', today())
  } else {
    await supabase.from('daily_log').insert({ date: today(), [field]: value })
  }
}

// ── HABITS ──────────────────────────────────────────────────────────────────
export async function getHabitsForDate(date) {
  const { data } = await supabase.from('habit_log').select('habit_id, done').eq('date', date)
  const map = {}
  ;(data ?? []).forEach(r => { map[r.habit_id] = r.done })
  return map
}
export async function getHabitsRange(dates) {
  const { data } = await supabase.from('habit_log').select('date, habit_id, done').in('date', dates)
  const map = {}
  ;(data ?? []).forEach(r => {
    if (!map[r.date]) map[r.date] = {}
    map[r.date][r.habit_id] = r.done
  })
  return map
}
export async function setHabit(habitId, done) {
  await supabase.from('habit_log').upsert(
    { date: today(), habit_id: habitId, done },
    { onConflict: 'date,habit_id' }
  )
}

// ── MEASUREMENTS ────────────────────────────────────────────────────────────
export async function getAllMeasurements() {
  const { data } = await supabase.from('measurements').select('date, waist, hips, thighs').order('date', { ascending: true })
  return data ?? []
}
export async function logMeasurements({ waist, hips, thighs }) {
  await supabase.from('measurements').upsert({ date: today(), waist, hips, thighs }, { onConflict: 'date' })
}

// ── GYM HISTORY ─────────────────────────────────────────────────────────────
// Get last N sessions for a specific exercise
export async function getGymHistory(dayId, exIdx, limit = 5) {
  const { data } = await supabase
    .from('gym_history')
    .select('date, set_idx, kg, reps')
    .eq('day_id', dayId)
    .eq('ex_idx', exIdx)
    .order('date', { ascending: false })
    .order('set_idx', { ascending: true })
    .limit(limit * 10) // grab enough rows to cover multiple sets
  return data ?? []
}
export async function saveGymSets(dayId, exIdx, sets) {
  // sets: [{setIdx, kg, reps}]
  const rows = sets
    .filter(s => s.kg && s.reps)
    .map(s => ({ date: today(), day_id: dayId, ex_idx: exIdx, set_idx: s.setIdx, kg: s.kg, reps: s.reps }))
  if (rows.length) await supabase.from('gym_history').insert(rows)
}

// ── GYM SETS TODAY (temp buffer) ────────────────────────────────────────────
export async function getTodayGymSets() {
  const { data } = await supabase.from('gym_sets_today').select('day_id, ex_idx, set_idx, kg, reps').eq('date', today())
  const map = {}
  ;(data ?? []).forEach(r => { map[`${r.day_id}:${r.ex_idx}:${r.set_idx}`] = { kg: r.kg?.toString() ?? '', reps: r.reps?.toString() ?? '' } })
  return map
}
export async function upsertGymSetToday(dayId, exIdx, setIdx, kg, reps) {
  await supabase.from('gym_sets_today').upsert(
    { date: today(), day_id: dayId, ex_idx: exIdx, set_idx: setIdx, kg: kg || null, reps: reps ? parseInt(reps) : null, updated_at: new Date().toISOString() },
    { onConflict: 'date,day_id,ex_idx,set_idx' }
  )
}

// ── STREAK ──────────────────────────────────────────────────────────────────
export async function loadAndUpdateStreak() {
  const meta = await getMeta('streak')
  let streak = meta?.streak ?? 1
  const lastVisit = meta?.lastVisit ?? today()

  if (lastVisit !== today()) {
    // Rolled to new day — bump or reset streak
    streak = lastVisit === yesterday() ? streak + 1 : 1
    await setMeta('streak', { streak, lastVisit: today() })
  }
  return streak
}
