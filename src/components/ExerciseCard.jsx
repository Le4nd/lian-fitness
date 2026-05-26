import { C, TAG_CONFIG } from '../lib/constants'
import { s } from '../lib/styles'

export function ExerciseCard({ ex, exIdx, dayId, todayGymSets, lastSession, onSetChange, onSaveHistory }) {
  const tc = ex.tag && TAG_CONFIG[ex.tag]
  const isCardio = ex.tag === 'c'

  return (
    <div style={{
      background: C.white, borderRadius: 13,
      border: `1px solid ${C.neutralBorder}`,
      padding: '12px 14px', marginBottom: 8,
      boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
        <span style={{ fontSize: 14, fontWeight: 600, color: C.textMain, fontFamily: "'DM Serif Display',serif" }}>
          {ex.n}
        </span>
        {tc && (
          <span style={{
            fontSize: 10, fontWeight: 700, padding: '2px 8px',
            borderRadius: 10, background: tc.bg, color: tc.color,
            border: `1px solid ${tc.border}`, fontFamily: "'DM Sans',sans-serif",
            letterSpacing: '0.04em',
          }}>
            {tc.label}
          </span>
        )}
      </div>

      <div style={{ display: 'flex', gap: 16, marginBottom: ex.note ? 6 : 0 }}>
        {[['Sets', ex.sets], ['Reps', ex.reps], ['Weight', ex.w]].map(([label, val]) => (
          <div key={label}>
            <div style={{ fontSize: 10, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: "'DM Sans',sans-serif" }}>{label}</div>
            <div style={{ fontSize: 13, fontWeight: 500, color: C.textMain, fontFamily: "'DM Sans',sans-serif" }}>{val}</div>
          </div>
        ))}
      </div>

      {ex.note && (
        <div style={{ fontSize: 12, color: C.textMuted, fontFamily: "'DM Sans',sans-serif", marginBottom: 6 }}>
          {ex.note}
        </div>
      )}

      {!isCardio && (
        <div style={{ marginTop: 10 }}>
          {lastSession.length > 0 && (
            <div style={{
              marginBottom: 8, background: C.blueLight, borderRadius: 8,
              padding: '6px 10px', fontSize: 12, color: C.blueDeep,
              fontFamily: "'DM Sans',sans-serif",
            }}>
              📋 Last: {lastSession.map((s, i) => `Set ${i + 1}: ${s.kg}kg×${s.reps}`).join(' · ')}
            </div>
          )}

          <div style={{ fontSize: 10, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6, fontFamily: "'DM Sans',sans-serif" }}>
            Log today
          </div>

          {Array.from({ length: ex.sets }).map((_, setIdx) => {
            const setVal = todayGymSets[`${dayId}:${exIdx}:${setIdx}`] || {}
            return (
              <div key={setIdx} style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 5 }}>
                <span style={{ fontSize: 11, color: C.textMuted, minWidth: 40, fontFamily: "'DM Sans',sans-serif" }}>
                  Set {setIdx + 1}
                </span>
                <input
                  value={setVal.kg || ''}
                  onChange={e => onSetChange(dayId, exIdx, setIdx, 'kg', e.target.value)}
                  placeholder="kg"
                  style={{ ...s.inp, width: 60, padding: '5px 8px' }}
                />
                <input
                  value={setVal.reps || ''}
                  onChange={e => onSetChange(dayId, exIdx, setIdx, 'reps', e.target.value)}
                  placeholder="reps"
                  style={{ ...s.inp, width: 60, padding: '5px 8px' }}
                />
                <span style={{ fontSize: 13, color: setVal.kg && setVal.reps ? C.green : C.neutralBorder }}>
                  {setVal.kg && setVal.reps ? '✓' : '—'}
                </span>
              </div>
            )
          })}

          <button
            onClick={() => onSaveHistory(dayId, exIdx, ex.sets)}
            style={{ ...s.btn, padding: '5px 14px', fontSize: 11, marginTop: 4 }}
          >
            Save to history
          </button>
        </div>
      )}
    </div>
  )
}
