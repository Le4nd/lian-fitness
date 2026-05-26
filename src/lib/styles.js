import { C } from './constants'

export const s = {
  btn: {
    background: `linear-gradient(135deg,${C.blue},${C.pink})`,
    color: '#fff', border: 'none', borderRadius: 10,
    padding: '10px 18px', fontSize: 14, fontWeight: 600,
    cursor: 'pointer', fontFamily: "'DM Sans',sans-serif",
    letterSpacing: '0.01em', transition: 'opacity .15s',
  },
  btnGhost: {
    background: 'transparent', color: C.textMuted,
    border: `1px solid ${C.neutralBorder}`, borderRadius: 10,
    padding: '10px 18px', fontSize: 14, cursor: 'pointer',
    fontFamily: "'DM Sans',sans-serif", transition: 'opacity .15s',
  },
  inp: {
    border: `1px solid ${C.neutralBorder}`, borderRadius: 10,
    padding: '10px 12px', fontSize: 14, background: C.neutral,
    color: C.textMain, outline: 'none',
    fontFamily: "'DM Sans',sans-serif",
  },
  card: {
    background: C.white, borderRadius: 18,
    border: `1px solid ${C.neutralBorder}`,
    overflow: 'hidden', marginBottom: 16,
    boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
  },
  lbl: {
    fontSize: 11, fontWeight: 700, letterSpacing: '0.1em',
    textTransform: 'uppercase', color: C.textMuted,
    marginBottom: 10, display: 'block',
    fontFamily: "'DM Sans',sans-serif",
  },
  slbl: {
    fontSize: 10, fontWeight: 700, letterSpacing: '0.1em',
    textTransform: 'uppercase', color: C.textMuted,
    margin: '16px 0 8px', display: 'block',
    fontFamily: "'DM Sans',sans-serif",
  },
  statCard: (bg, border, color) => ({
    background: bg, borderRadius: 14, padding: '14px 12px',
    textAlign: 'center', border: `1px solid ${border}`, color,
  }),
  statNum: { fontSize: 22, fontFamily: "'DM Serif Display',serif", fontWeight: 400 },
  statLbl: {
    fontSize: 10, color: C.textMuted, marginTop: 2,
    textTransform: 'uppercase', letterSpacing: '0.06em',
    fontFamily: "'DM Sans',sans-serif",
  },
  pBar: { height: 8, borderRadius: 4, background: C.neutralBorder, overflow: 'hidden' },
  pFill: (pct) => ({
    height: '100%',
    width: `${Math.max(0, Math.min(100, pct))}%`,
    background: `linear-gradient(90deg,${C.blue},${C.pink})`,
    borderRadius: 4, transition: 'width .5s',
  }),
}
