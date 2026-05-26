import { C } from '../lib/constants'

export function SyncDot({ status }) {
  const map = {
    idle:    { color: C.green,    label: 'synced' },
    saving:  { color: C.gold,     label: 'saving…' },
    error:   { color: C.red,      label: 'error' },
    loading: { color: C.blueDeep, label: 'loading…' },
  }
  const { color, label } = map[status] ?? map.idle
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: C.textMuted, fontFamily: "'DM Sans',sans-serif" }}>
      <div style={{
        width: 7, height: 7, borderRadius: '50%', background: color,
        boxShadow: status === 'saving' ? `0 0 6px ${C.gold}` : 'none',
        transition: 'all .3s',
      }} />
      {label}
    </div>
  )
}
