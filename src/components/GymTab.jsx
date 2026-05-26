import { useState } from 'react'
import { C, ROUTINE } from '../lib/constants'
import { s } from '../lib/styles'
import { ExerciseCard } from './ExerciseCard'

export function GymTab({ todayGymSets, gymHistory, onSetChange, onSaveHistory }) {
  const [gymDay, setGymDay] = useState(0)
  const day = ROUTINE[gymDay]

  const bc = day.badge === 'key'
    ? { bg: C.redLight, c: C.red }
    : day.badge === 'upper'
    ? { bg: C.blueLight, c: C.blueDeep }
    : day.badge === 'waist'
    ? { bg: C.greenLight, c: C.green }
    : null

  return (
    <>
      {/* Day selector */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
        {ROUTINE.map((d, i) => (
          <button
            key={d.id}
            onClick={() => setGymDay(i)}
            style={{
              padding: '7px 13px', borderRadius: 9, fontSize: 12, fontWeight: 600,
              border: 'none', cursor: 'pointer', transition: 'all .15s',
              background: gymDay === i ? `linear-gradient(135deg,${C.blue},${C.pink})` : C.neutral,
              color: gymDay === i ? '#fff' : C.textMuted,
            }}
          >
            {d.label}
          </button>
        ))}
      </div>

      {day.rest ? (
        <div style={{ background: C.white, borderRadius: 18, border: `1px solid ${C.neutralBorder}`, padding: '32px 20px', textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>🌙</div>
          <div style={{ fontSize: 18, fontFamily: "'DM Serif Display',serif", marginBottom: 6 }}>Rest day</div>
          <div style={{ fontSize: 13, color: C.textMuted, marginBottom: 20 }}>10k steps, daily vacuum, hip flexor stretch.</div>
          {[
            { n: 'Stomach vacuum', sets: 5, reps: '45–60 sec' },
            { n: 'Hip flexor stretch', sets: 2, reps: '60 sec each side' },
            { n: 'Glute bridge', sets: 3, reps: '30' },
          ].map((re, i) => (
            <div key={i} style={{ background: C.pinkLight, borderRadius: 12, padding: '10px 14px', textAlign: 'left', border: `1px solid ${C.pinkMid}`, marginBottom: 8 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.pinkDeep }}>{re.n}</div>
              <div style={{ fontSize: 12, color: C.textMuted, marginTop: 2 }}>{re.sets} sets · {re.reps}</div>
            </div>
          ))}
        </div>
      ) : (
        <>
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 20, fontFamily: "'DM Serif Display',serif" }}>{day.name}</span>
              {bc && (
                <span style={{
                  fontSize: 10, fontWeight: 700, padding: '2px 9px', borderRadius: 20,
                  background: bc.bg, color: bc.c, letterSpacing: '0.06em', textTransform: 'uppercase',
                }}>
                  {day.badge === 'key' ? 'most important' : day.badge}
                </span>
              )}
            </div>
            <p style={{ fontSize: 12, color: C.textMuted, margin: '4px 0 0' }}>{day.desc}</p>
          </div>

          {day.sections.map((sec, secIdx) => (
            <div key={secIdx} style={{ marginBottom: 16 }}>
              <span style={s.slbl}>{sec.title}</span>
              {sec.exs.map((ex, exIdx) => {
                // Get last session entries for this exercise
                const hist = gymHistory[`${day.id}:${exIdx}`] ?? []
                // Group by date, take most recent date's sets
                const byDate = {}
                hist.forEach(r => {
                  if (!byDate[r.date]) byDate[r.date] = []
                  byDate[r.date].push(r)
                })
                const dates = Object.keys(byDate).sort().reverse()
                const lastSession = dates.length ? byDate[dates[0]] : []

                return (
                  <ExerciseCard
                    key={exIdx}
                    ex={ex}
                    exIdx={exIdx}
                    dayId={day.id}
                    todayGymSets={todayGymSets}
                    lastSession={lastSession}
                    onSetChange={onSetChange}
                    onSaveHistory={onSaveHistory}
                  />
                )
              })}
            </div>
          ))}

          <div style={{ fontSize: 12, color: C.textMuted, background: C.neutral, borderRadius: 9, padding: '9px 13px' }}>
            Stop 2 reps before failure · 60–90s rest between sets
          </div>
        </>
      )}
    </>
  )
}
