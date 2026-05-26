import { useState } from 'react'
import { C } from '../lib/constants'
import { s } from '../lib/styles'

export function SleepLog({ sleepHours, onSave, selectedDate }) {
  const [val, setVal] = useState('')
  const isToday = selectedDate === new Date().toISOString().split('T')[0]

  const quality = sleepHours >= 8 ? { label: 'Great', color: C.green, bg: C.greenLight }
    : sleepHours >= 7.5 ? { label: 'Good', color: C.blueDeep, bg: C.blueLight }
    : sleepHours >= 6 ? { label: 'Okay', color: C.gold, bg: C.goldLight }
    : sleepHours ? { label: 'Poor', color: C.red, bg: C.redLight }
    : null

  return (
    <div style={{ ...s.card, padding: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <span style={{ fontSize: 13, fontWeight: 600 }}>💤 Sleep</span>
        {quality && (
          <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: quality.bg, color: quality.color }}>
            {sleepHours}h — {quality.label}
          </span>
        )}
      </div>
      {!sleepHours && (
        <div style={{ display: 'flex', gap: 8 }}>
          <input type="number" step="0.5" min="0" max="24" placeholder="Hours slept (e.g. 8.5)"
            value={val} onChange={e => setVal(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && val && onSave(parseFloat(val))}
            style={{ ...s.inp, flex: 1 }} />
          <button onClick={() => val && onSave(parseFloat(val))} style={s.btn}>Log</button>
        </div>
      )}
      {sleepHours && (
        <div style={{ display: 'flex', gap: 4 }}>
          {Array.from({ length: 10 }, (_, i) => {
            const hour = i + 1
            const filled = hour <= sleepHours
            return (
              <div key={i} style={{ flex: 1, height: 20, borderRadius: 4, background: filled ? (sleepHours >= 7.5 ? C.blue : C.gold) : C.neutral, border: `1px solid ${filled ? C.blueMid : C.neutralBorder}`, transition: 'background .2s' }} />
            )
          })}
        </div>
      )}
      {sleepHours && (
        <button onClick={() => onSave(null)} style={{ ...s.btnGhost, fontSize: 11, padding: '4px 10px', marginTop: 8 }}>Edit</button>
      )}
    </div>
  )
}
