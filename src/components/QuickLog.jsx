import { useState } from 'react'
import { C } from '../lib/constants'
import { s } from '../lib/styles'

export function QuickLog({ onLogWeight, onLogSteps, onLogCalories, onAddWater, onLogSleep, selectedDate }) {
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(null) // 'weight' | 'steps' | 'cal' | 'sleep'
  const [val, setVal] = useState('')

  const isToday = selectedDate === new Date().toISOString().split('T')[0]

  const submit = () => {
    if (!val) return
    if (active === 'weight') onLogWeight(parseFloat(val))
    if (active === 'steps') onLogSteps(parseInt(val))
    if (active === 'cal') onLogCalories(parseInt(val))
    if (active === 'sleep') onLogSleep(parseFloat(val))
    setVal('')
    setActive(null)
    setOpen(false)
  }

  const actions = [
    { id: 'weight', label: 'Weight', icon: '⚖️', placeholder: 'kg (e.g. 94.5)', step: '0.1' },
    { id: 'steps', label: 'Steps', icon: '👣', placeholder: 'steps today', step: '1' },
    { id: 'cal', label: 'Calories', icon: '🍽', placeholder: 'kcal today', step: '1' },
    { id: 'sleep', label: 'Sleep', icon: '💤', placeholder: 'hours (e.g. 7.5)', step: '0.5' },
    { id: 'water', label: 'Water +1', icon: '💧', placeholder: null },
  ]

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div onClick={() => { setOpen(false); setActive(null); setVal('') }}
          style={{ position: 'fixed', inset: 0, zIndex: 49, background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(2px)' }} />
      )}

      {/* Panel */}
      {open && (
        <div style={{ position: 'fixed', bottom: 90, left: '50%', transform: 'translateX(-50%)', zIndex: 50, background: C.white, borderRadius: 20, padding: 16, width: 'calc(100vw - 32px)', maxWidth: 380, boxShadow: '0 8px 40px rgba(0,0,0,0.18)', border: `1px solid ${C.neutralBorder}` }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>
            Quick log — {isToday ? 'today' : selectedDate}
          </div>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: active ? 12 : 0 }}>
            {actions.map(a => (
              <button key={a.id} onClick={() => {
                if (a.id === 'water') { onAddWater(); setOpen(false); return }
                setActive(active === a.id ? null : a.id)
                setVal('')
              }} style={{
                padding: '8px 12px', borderRadius: 10, fontSize: 12, fontWeight: 600,
                border: `1px solid ${active === a.id ? C.blue : C.neutralBorder}`,
                background: active === a.id ? C.blueLight : C.neutral,
                color: active === a.id ? C.blueDeep : C.textMain,
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5,
              }}>
                {a.icon} {a.label}
              </button>
            ))}
          </div>

          {active && (() => {
            const a = actions.find(x => x.id === active)
            return (
              <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                <input autoFocus type="number" step={a.step} placeholder={a.placeholder}
                  value={val} onChange={e => setVal(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && submit()}
                  style={{ ...s.inp, flex: 1 }} />
                <button onClick={submit} style={s.btn}>Save</button>
              </div>
            )
          })()}
        </div>
      )}

      {/* FAB */}
      <button onClick={() => { setOpen(!open); setActive(null); setVal('') }} style={{
        position: 'fixed', bottom: 24, right: 24,
        width: 56, height: 56, borderRadius: '50%',
        background: `linear-gradient(135deg,${C.blue},${C.pink})`,
        border: 'none', cursor: 'pointer', zIndex: 51,
        fontSize: 24, display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 4px 20px rgba(85,205,252,0.45)',
        transform: open ? 'rotate(45deg)' : 'rotate(0)',
        transition: 'transform .2s',
      }}>
        ＋
      </button>
    </>
  )
}
