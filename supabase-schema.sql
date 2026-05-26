-- ============================================================
-- Lian Fitness — Supabase Schema
-- Run this entire file in your Supabase SQL Editor
-- ============================================================

-- Weight log: one entry per day
create table if not exists weight_log (
  id uuid primary key default gen_random_uuid(),
  date date not null unique,
  weight numeric(5,2) not null,
  created_at timestamptz default now()
);

-- Daily log: calories, steps, water per day
create table if not exists daily_log (
  id uuid primary key default gen_random_uuid(),
  date date not null unique,
  calories integer,
  steps integer,
  water integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Habit completions: one row per habit per day
create table if not exists habit_log (
  id uuid primary key default gen_random_uuid(),
  date date not null,
  habit_id text not null,
  done boolean default false,
  created_at timestamptz default now(),
  unique(date, habit_id)
);

-- Body measurements: one entry per day
create table if not exists measurements (
  id uuid primary key default gen_random_uuid(),
  date date not null unique,
  waist numeric(5,1),
  hips numeric(5,1),
  thighs numeric(5,1),
  created_at timestamptz default now()
);

-- Gym set history: every saved set, unlimited
create table if not exists gym_history (
  id uuid primary key default gen_random_uuid(),
  date date not null,
  day_id text not null,
  ex_idx integer not null,
  set_idx integer not null,
  kg numeric(6,2),
  reps integer,
  created_at timestamptz default now()
);

-- Today's unsaved gym sets (temp buffer, cleared daily)
create table if not exists gym_sets_today (
  id uuid primary key default gen_random_uuid(),
  date date not null,
  day_id text not null,
  ex_idx integer not null,
  set_idx integer not null,
  kg numeric(6,2),
  reps integer,
  updated_at timestamptz default now(),
  unique(date, day_id, ex_idx, set_idx)
);

-- App meta: streak, last milestone, etc.
create table if not exists app_meta (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz default now()
);

-- ── Indexes ──────────────────────────────────────────────────
create index if not exists idx_weight_log_date on weight_log(date desc);
create index if not exists idx_daily_log_date on daily_log(date desc);
create index if not exists idx_habit_log_date on habit_log(date desc);
create index if not exists idx_measurements_date on measurements(date desc);
create index if not exists idx_gym_history_lookup on gym_history(day_id, ex_idx, date desc);
create index if not exists idx_gym_sets_today_date on gym_sets_today(date, day_id, ex_idx, set_idx);

-- ── Row Level Security (open — single user app) ──────────────
-- Since this is a personal app with no auth, we keep RLS off.
-- If you want to add auth later, enable it here.
alter table weight_log disable row level security;
alter table daily_log disable row level security;
alter table habit_log disable row level security;
alter table measurements disable row level security;
alter table gym_history disable row level security;
alter table gym_sets_today disable row level security;
alter table app_meta disable row level security;
