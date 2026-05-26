import { supabase } from './supabase'

const today = () => new Date().toISOString().split('T')[0]
const yesterday = () => { const d = new Date(); d.setDate(d.getDate() - 1); return d.toISOString().split('T')[0] }

export async function getMeta(key) {
  const { data } = await supabase.from('app_meta').select('value').eq('key', key).maybeSingle()
  return data?.value ?? null
}
export async function setMeta(key, value) {
  const { error } = await supabase.from('app_meta').upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' })
  if (error) console.error('setMeta error:', error)
}

export async function getAllWeights() {
  const { data, error } = await supabase.from('weight_log').select('date, weight').order('date', { ascending: true })
  if (error) console.error('getAllWeights error:', error)
  return data ?? []
}
export async function logWeight(weight, date) {
  const d = date ?? today()
  const { error } = await supabase.from('weight_log').upsert({ date: d, weight }, { onConflict: 'date' })
  if (error) console.error('logWeight error:', error)
}

export async function getDaily(date) {
  const { data, error } = await supabase.from('daily_log').select('*').eq('date', date).maybeSingle()
  if (error) console.error('getDaily error:', error)
  return data ?? {}
}
export async function getDailyRange(dates) {
  const { data, error } = await supabase.from('daily_log').select('*').in('date', dates)
  if (error) console.error('getDailyRange error:', error)
  const map = {}
  ;(data ?? []).forEach(r => { map[r.date] = r })
  return map
}
export async function updateDailyForDate(date, field, value) {
  const { data: existing } = await supabase.from('daily_log').select('id').eq('date', date).maybeSingle()
  if (existing) {
    const { error } = await supabase.from('daily_log').update({ [field]: value, updated_at: new Date().toISOString() }).eq('date', date)
    if (error) console.error('updateDaily update error:', error)
  } else {
    const { error } = await supabase.from('daily_log').insert({ date, [field]: value })
    if (error) console.error('updateDaily insert error:', error)
  }
}

export async function getHabitsForDate(date) {
  const { data, error } = await supabase.from('habit_log').select('habit_id, done').eq('date', date)
  if (error) console.error('getHabitsForDate error:', error)
  const map = {}
  ;(data ?? []).forEach(r => { map[r.habit_id] = r.done })
  return map
}
export async function getHabitsRange(dates) {
  const { data, error } = await supabase.from('habit_log').select('date, habit_id, done').in('date', dates)
  if (error) console.error('getHabitsRange error:', error)
  const map = {}
  ;(data ?? []).forEach(r => {
    if (!map[r.date]) map[r.date] = {}
    map[r.date][r.habit_id] = r.done
  })
  return map
}
export async function setHabitForDate(date, habitId, done) {
  const { error } = await supabase.from('habit_log').upsert(
    { date, habit_id: habitId, done },
    { onConflict: 'date,habit_id' }
  )
  if (error) console.error('setHabit error:', error)
}

export async function getAllMeasurements() {
  const { data, error } = await supabase.from('measurements').select('date, waist, hips, thighs').order('date', { ascending: true })
  if (error) console.error('getAllMeasurements error:', error)
  return data ?? []
}
export async function logMeasurementsForDate(date, { waist, hips, thighs }) {
  const { error } = await supabase.from('measurements').upsert({ date, waist, hips, thighs }, { onConflict: 'date' })
  if (error) console.error('logMeasurements error:', error)
}

export async function getGymHistory(dayId, exIdx, limit = 5) {
  const { data, error } = await supabase
    .from('gym_history').select('date, set_idx, kg, reps')
    .eq('day_id', dayId).eq('ex_idx', exIdx)
    .order('date', { ascending: false }).order('set_idx', { ascending: true })
    .limit(limit * 6)
  if (error) console.error('getGymHistory error:', error)
  if (!data || data.length === 0) return []
  // Only return sets from the most recent session date for this specific day
  const mostRecent = data[0].date
  return data.filter(r => r.date === mostRecent)
}
export async function saveGymSets(dayId, exIdx, sets, date) {
  const d = date ?? today()
  const rows = sets
    .filter(s => s.kg !== '' && s.kg != null && s.reps !== '' && s.reps != null)
    .map(s => ({ date: d, day_id: dayId, ex_idx: exIdx, set_idx: s.setIdx, kg: parseFloat(s.kg), reps: parseInt(s.reps) }))
  if (rows.length) {
    const { error } = await supabase.from('gym_history').upsert(rows, { onConflict: 'date,day_id,ex_idx,set_idx' })
    if (error) console.error('saveGymSets error:', error)
  }
  return rows.length
}

export async function getGymSetsForDate(date) {
  const { data, error } = await supabase.from('gym_sets_today').select('day_id, ex_idx, set_idx, kg, reps').eq('date', date)
  if (error) console.error('getGymSetsForDate error:', error)
  const map = {}
  ;(data ?? []).forEach(r => {
    map[`${r.day_id}:${r.ex_idx}:${r.set_idx}`] = { kg: r.kg?.toString() ?? '', reps: r.reps?.toString() ?? '' }
  })
  return map
}
export async function upsertGymSet(date, dayId, exIdx, setIdx, kg, reps) {
  const { error } = await supabase.from('gym_sets_today').upsert(
    { date, day_id: dayId, ex_idx: exIdx, set_idx: setIdx, kg: kg ? parseFloat(kg) : null, reps: reps ? parseInt(reps) : null, updated_at: new Date().toISOString() },
    { onConflict: 'date,day_id,ex_idx,set_idx' }
  )
  if (error) console.error('upsertGymSet error:', error)
}

export async function loadAndUpdateStreak() {
  try {
    const meta = await getMeta('streak')
    let streak = meta?.streak ?? 1
    const lastVisit = meta?.lastVisit ?? today()
    if (lastVisit !== today()) {
      streak = lastVisit === yesterday() ? streak + 1 : 1
      await setMeta('streak', { streak, lastVisit: today() })
    } else if (!meta) {
      await setMeta('streak', { streak: 1, lastVisit: today() })
    }
    return streak
  } catch (e) {
    console.error('loadAndUpdateStreak error:', e)
    return 1
  }
}
