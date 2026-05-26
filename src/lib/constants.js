export const C = {
  blue: '#55CDFC', pink: '#F7A8B8', white: '#FFFFFF',
  blueLight: '#e8f7fe', pinkLight: '#fef0f4',
  blueMid: '#b8e8f9', pinkMid: '#fadce5',
  blueDeep: '#1a7fa8', pinkDeep: '#c45a7a',
  neutral: '#f4f4f6', neutralBorder: '#e4e4e8',
  textMain: '#1a1a2e', textMuted: '#6b6b80',
  green: '#1a7a45', greenLight: '#e8fef0', greenBorder: '#b8ecd0',
  red: '#c0335a', redLight: '#fde8ef', redBorder: '#f5b8cc',
  gold: '#b8860b', goldLight: '#fefbe8', goldBorder: '#f0dfa0',
}

export const TARGET_KCAL = 1400
export const WATER_GOAL = 8
export const STEPS_GOAL = 10000
export const START_W = 97
export const TARGET_W = 65

export const calcBMR = (w) => Math.round(10 * w + 6.25 * 167 - 5 * 22 + 5)
export const calcTDEE = (w) => Math.round(calcBMR(w) * 1.375)
export const todayStr = () => new Date().toISOString().split('T')[0]

export const MILESTONES = [
  { weight: 95, label: 'First 2kg gone', emoji: '🌱' },
  { weight: 92, label: '5kg down', emoji: '⭐' },
  { weight: 90, label: 'Under 90kg', emoji: '🎯' },
  { weight: 85, label: '85kg — halfway visible', emoji: '✨' },
  { weight: 80, label: 'Under 80kg', emoji: '💫' },
  { weight: 75, label: '75kg — face fully changed', emoji: '🌸' },
  { weight: 70, label: 'Previous low reached', emoji: '🏆' },
  { weight: 65, label: 'GOAL — 65kg', emoji: '🦋' },
]

// Daily habits — some are auto-checked from logged data
export const DAILY_HABITS = [
  { id: 'h_gym',     name: 'Gym session',          icon: '🏋️', auto: false },
  { id: 'h_diet',    name: 'Diet on track',         icon: '🥗', auto: false },
  { id: 'h_vacuum',  name: 'Stomach vacuum',        icon: '🌀', auto: false },
  { id: 'h_stretch', name: 'Hip flexor stretch',    icon: '🧘', auto: false },
  { id: 'h_steps',   name: '10,000 steps',          icon: '👣', auto: 'steps' },
  { id: 'h_sleep',   name: 'Sleep 7.5h+',           icon: '💤', auto: 'sleep' },
  { id: 'h_weight',  name: 'Weight logged',         icon: '⚖️', auto: 'weight' },
]

// Weekly habits — tracked separately
export const WEEKLY_HABITS = [
  { id: 'w_retratutide', name: 'Retatrutide dose',      icon: '💊' },
  { id: 'w_measure',     name: 'Measurements logged',   icon: '📏', auto: 'measure' },
]

export const TAG_CONFIG = {
  g: { label: 'glute',   bg: '#fef0f4', color: '#c45a7a', border: '#fadce5' },
  c: { label: 'cardio',  bg: '#e8f7fe', color: '#1a7fa8', border: '#b8e8f9' },
  u: { label: 'upper',   bg: '#f0f0f8', color: '#555',    border: '#ddd' },
  w: { label: 'waist',   bg: '#e8fef0', color: '#1a7a45', border: '#b8ecd0' },
  p: { label: 'posture', bg: '#fef8e8', color: '#7a5c1a', border: '#f0dfa0' },
}

export const ROUTINE = [
  {
    id: 'd1', label: 'D1', name: 'Glutes A + Cardio', rest: false, badge: null,
    desc: 'Primary glute session.',
    sections: [
      { title: 'Cardio', exs: [{ n: 'Incline treadmill walk', tag: 'c', sets: 1, reps: '20 min', w: '5–6% incline', note: 'Warm up.' }] },
      { title: 'Main', exs: [
        { n: 'Hip thrust machine (eGYM)', tag: 'g', sets: 4, reps: '15–20', w: 'Moderate → progressive', note: '1 sec hold at top.' },
        { n: 'Cable kickback', tag: 'g', sets: 3, reps: '20 each leg', w: 'Light', note: '3 sec lowering.' },
        { n: 'Abduction machine', tag: 'g', sets: 3, reps: '20–25', w: 'Moderate' },
        { n: 'Leg curl', tag: '', sets: 3, reps: '15', w: 'Moderate' },
      ]},
    ],
  },
  {
    id: 'd2', label: 'D2', name: 'Lower Body B + Cardio', rest: false, badge: null,
    desc: 'Volume day.',
    sections: [
      { title: 'Cardio', exs: [{ n: 'Incline treadmill walk', tag: 'c', sets: 1, reps: '15 min', w: 'Warm up' }] },
      { title: 'Main', exs: [
        { n: 'Leg press', tag: '', sets: 4, reps: '20', w: '~80–90kg feet high+wide' },
        { n: 'Bulgarian split squat', tag: 'g', sets: 3, reps: '15 each leg', w: 'Bodyweight or light' },
        { n: 'Adduction machine', tag: '', sets: 3, reps: '20', w: 'Moderate' },
        { n: 'Leg extension', tag: '', sets: 3, reps: '20', w: 'Light–moderate' },
      ]},
      { title: 'Cardio', exs: [{ n: 'Incline treadmill walk', tag: 'c', sets: 1, reps: '20 min', w: 'Post-workout burn' }] },
    ],
  },
  { id: 'd3', label: 'D3', name: 'Rest', rest: true },
  {
    id: 'd4', label: 'D4', name: 'Upper Body (Light)', rest: false, badge: 'upper',
    desc: 'Shape and posture only.',
    sections: [
      { title: 'Main', exs: [
        { n: 'Lat pulldown', tag: 'u', sets: 4, reps: '15–20', w: '~50–55kg' },
        { n: 'Seated row', tag: 'u', sets: 3, reps: '15–20', w: 'Light–moderate' },
        { n: 'Shoulder press machine', tag: 'u', sets: 3, reps: '15', w: 'Light' },
        { n: 'Cable fly / pec dec', tag: 'u', sets: 3, reps: '20', w: 'Light' },
        { n: 'Cable curl (rope)', tag: 'u', sets: 3, reps: '20', w: 'Light' },
      ]},
      { title: 'Cardio', exs: [{ n: 'Incline treadmill walk', tag: 'c', sets: 1, reps: '20 min', w: 'End upper with cardio' }] },
    ],
  },
  {
    id: 'd5', label: 'D5', name: 'Waist + Hourglass', rest: false, badge: 'waist',
    desc: 'Dedicated waist and hip session.',
    sections: [
      { title: 'Cardio', exs: [{ n: 'Incline treadmill walk', tag: 'c', sets: 1, reps: '20 min', w: '5–6% incline' }] },
      { title: 'Waist work', exs: [
        { n: 'Stomach vacuum', tag: 'w', sets: 5, reps: '45–60 sec', w: 'Bodyweight' },
        { n: 'Dead bug', tag: 'w', sets: 4, reps: '12 each side', w: 'Bodyweight' },
        { n: 'Plank', tag: 'w', sets: 4, reps: '45–60 sec', w: 'Bodyweight' },
      ]},
      { title: 'Hip flare', exs: [
        { n: 'Side-lying hip abduction', tag: 'g', sets: 4, reps: '20 each side', w: 'Bodyweight or ankle weight' },
        { n: 'Abduction machine', tag: 'g', sets: 3, reps: '25', w: 'Moderate' },
        { n: 'Cable pull-through', tag: 'g', sets: 3, reps: '15', w: 'Light–moderate' },
        { n: 'Glute bridge (high rep)', tag: 'g', sets: 3, reps: '30', w: 'Bodyweight' },
      ]},
      { title: 'Posture', exs: [
        { n: 'Hip flexor stretch', tag: 'p', sets: 3, reps: '60 sec each side', w: 'Bodyweight' },
        { n: 'Cat-cow', tag: 'p', sets: 2, reps: '15 slow reps', w: 'Bodyweight' },
        { n: 'Clamshell', tag: 'p', sets: 3, reps: '20 each side', w: 'Band optional' },
      ]},
    ],
  },
  {
    id: 'd6', label: 'D6', name: 'Full Lower — Peak Glute', rest: false, badge: 'key',
    desc: 'Highest volume day. Do not skip.',
    sections: [
      { title: 'Cardio', exs: [{ n: 'Incline treadmill walk', tag: 'c', sets: 1, reps: '20 min', w: 'Warm up' }] },
      { title: 'Main', exs: [
        { n: 'Hip thrust machine (eGYM)', tag: 'g', sets: 5, reps: '15', w: 'Heaviest of the week' },
        { n: 'Leg press', tag: '', sets: 3, reps: '20', w: '~80kg' },
        { n: 'Abduction machine', tag: 'g', sets: 4, reps: '25', w: 'Moderate' },
        { n: 'Cable kickback', tag: 'g', sets: 3, reps: '20 each', w: 'Match Day 1' },
        { n: 'Adduction machine', tag: '', sets: 3, reps: '20', w: 'Moderate' },
      ]},
      { title: 'Cardio', exs: [{ n: 'Incline treadmill walk', tag: 'c', sets: 1, reps: '25 min', w: 'Cool down + burn' }] },
    ],
  },
  { id: 'd7', label: 'D7', name: 'Rest', rest: true },
]
