-- ==============================================================================
-- LiftIQ / Kinetic Obsidian - 50% Submission Database Schema
-- Version: 2.0 (Supabase PostgreSQL + RLS + Epley PR Engine)
-- ==============================================================================

-- 1. EXTENSIONS
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ==============================================================================
-- 2. TABLE DEFINITIONS
-- ==============================================================================

-- PROFILES (Linked 1:1 with auth.users)
create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  name text not null default 'Athlete',
  sex text check (sex in ('male', 'female')),
  date_of_birth date,
  height_cm numeric(5,2) check (height_cm is null or height_cm > 0),
  activity_level text default 'moderate',
  unit_pref text default 'kg' check (unit_pref in ('kg', 'lb')),
  goal_weight_kg numeric(5,2) check (goal_weight_kg is null or goal_weight_kg > 0),
  calorie_target integer default 2600 check (calorie_target > 0),
  protein_target_g integer default 160 check (protein_target_g > 0),
  updated_at timestamptz default now()
);

-- EXERCISES (Global presets where user_id IS NULL + Custom exercises per user)
create table if not exists public.exercises (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade, -- NULL = System Global Preset
  name text not null,
  muscle_group text not null,
  equipment text not null,
  movement_type text not null default 'compound',
  target_muscle text,
  description text,
  is_archived boolean default false,
  created_at timestamptz default now()
);

create unique index if not exists unique_preset_exercise_name 
  on public.exercises (lower(name)) where user_id is null;

create unique index if not exists unique_custom_exercise_name 
  on public.exercises (user_id, lower(name)) where user_id is not null;

-- WORKOUT SESSIONS (Individual gym workouts)
create table if not exists public.workout_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  duration_minutes integer default 0,
  target_rpe numeric(3,1) default 8.5,
  tonnage_kg numeric(8,2) default 0,
  notes text
);

-- WORKOUT EXERCISES (Exercises performed in a workout session)
create table if not exists public.workout_exercises (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.workout_sessions(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  exercise_id uuid not null references public.exercises(id) on delete restrict,
  position integer not null default 0 check (position >= 0),
  notes text
);

-- WORKOUT SETS (Individual sets logged inside an exercise)
create table if not exists public.workout_sets (
  id uuid primary key default gen_random_uuid(),
  workout_exercise_id uuid not null references public.workout_exercises(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  set_number integer not null check (set_number > 0),
  weight_kg numeric(6,2) not null check (weight_kg >= 0),
  reps integer not null check (reps > 0),
  rir integer default 1 check (rir between 0 and 10),
  is_warmup boolean default false,
  is_pr_weight boolean default false,
  is_pr_e1rm boolean default false,
  completed_at timestamptz default now()
);

-- FOOD ENTRIES (Nutrition logging with macro breakdown)
create table if not exists public.food_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  eaten_on date not null default current_date,
  meal_type text default 'snack' check (meal_type in ('breakfast', 'lunch', 'dinner', 'snack')),
  name text not null,
  calories numeric(6,1) not null check (calories >= 0),
  protein_g numeric(5,1) not null check (protein_g >= 0),
  carbs_g numeric(5,1) not null check (carbs_g >= 0),
  fat_g numeric(5,1) not null check (fat_g >= 0),
  source text default 'manual' check (source in ('manual', 'ai')),
  created_at timestamptz default now()
);

-- WEIGHT ENTRIES (Daily body weight telemetry)
create table if not exists public.weight_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  measured_on date not null default current_date,
  weight_kg numeric(5,2) not null check (weight_kg between 20 and 400),
  note text,
  created_at timestamptz default now(),
  unique(user_id, measured_on)
);

-- REPORTS (Aggregated metrics - populated server-side)
create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  period text check (period in ('weekly', 'monthly')),
  period_start date not null,
  period_end date not null,
  metrics jsonb not null default '{}'::jsonb,
  ai_summary text,
  created_at timestamptz default now(),
  unique(user_id, period, period_start)
);

-- ==============================================================================
-- 3. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

alter table public.profiles enable row level security;
alter table public.exercises enable row level security;
alter table public.workout_sessions enable row level security;
alter table public.workout_exercises enable row level security;
alter table public.workout_sets enable row level security;
alter table public.food_entries enable row level security;
alter table public.weight_entries enable row level security;
alter table public.reports enable row level security;

-- PROFILES Policies
create policy "Users can read own profile" 
  on public.profiles for select using ((select auth.uid()) = user_id);

create policy "Users can insert own profile" 
  on public.profiles for insert with check ((select auth.uid()) = user_id);

create policy "Users can update own profile" 
  on public.profiles for update 
  using ((select auth.uid()) = user_id) 
  with check ((select auth.uid()) = user_id);

-- EXERCISES Policies
create policy "Read global presets and custom exercises" 
  on public.exercises for select 
  using (user_id is null or (select auth.uid()) = user_id);

create policy "Insert custom exercises" 
  on public.exercises for insert 
  with check ((select auth.uid()) = user_id);

create policy "Update custom exercises" 
  on public.exercises for update 
  using ((select auth.uid()) = user_id) 
  with check ((select auth.uid()) = user_id);

create policy "Delete custom exercises" 
  on public.exercises for delete 
  using ((select auth.uid()) = user_id);

-- WORKOUT SESSIONS Policies
create policy "Manage own workout sessions" 
  on public.workout_sessions for all 
  using ((select auth.uid()) = user_id) 
  with check ((select auth.uid()) = user_id);

-- WORKOUT EXERCISES Policies
create policy "Manage own workout exercises" 
  on public.workout_exercises for all 
  using ((select auth.uid()) = user_id) 
  with check ((select auth.uid()) = user_id);

-- WORKOUT SETS Policies
create policy "Manage own workout sets" 
  on public.workout_sets for all 
  using ((select auth.uid()) = user_id) 
  with check ((select auth.uid()) = user_id);

-- FOOD ENTRIES Policies
create policy "Manage own food entries" 
  on public.food_entries for all 
  using ((select auth.uid()) = user_id) 
  with check ((select auth.uid()) = user_id);

-- WEIGHT ENTRIES Policies
create policy "Manage own weight entries" 
  on public.weight_entries for all 
  using ((select auth.uid()) = user_id) 
  with check ((select auth.uid()) = user_id);

-- REPORTS Policies
create policy "Users view own reports" 
  on public.reports for select 
  using ((select auth.uid()) = user_id);

-- ==============================================================================
-- 4. AUTOMATIC NEW USER ONBOARDING TRIGGER
-- ==============================================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  insert into public.profiles (user_id, name, updated_at)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1), 'Athlete'),
    now()
  )
  on conflict (user_id) do nothing;
  return new;
end;
$$;

-- Drop trigger if it already exists before recreating
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ==============================================================================
-- 5. ATOMIC PR ENGINE STORED PROCEDURE (log_workout_set)
-- ==============================================================================

create or replace function public.log_workout_set(
  p_id uuid,
  p_workout_exercise_id uuid,
  p_user_id uuid,
  p_set_number integer,
  p_weight_kg numeric,
  p_reps integer,
  p_rir integer default 1,
  p_is_warmup boolean default false
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_exercise_id uuid;
  v_e1rm numeric;
  v_prev_max_weight numeric := 0;
  v_prev_max_e1rm numeric := 0;
  v_is_pr_weight boolean := false;
  v_is_pr_e1rm boolean := false;
  v_result jsonb;
begin
  -- Validate caller matches requested user
  if auth.uid() is null or auth.uid() <> p_user_id then
    raise exception 'Unauthorized access';
  end if;

  -- Determine exercise_id from parent row
  select exercise_id into v_exercise_id
  from public.workout_exercises
  where id = p_workout_exercise_id and user_id = p_user_id;

  if v_exercise_id is null then
    raise exception 'Parent workout exercise not found or access denied';
  end if;

  -- Compute estimated 1-Rep Max using Epley Formula: weight * (1 + reps / 30.0)
  v_e1rm := round(p_weight_kg * (1.0 + (p_reps::numeric / 30.0)), 2);

  -- Evaluate PR criteria only for working sets (excluding warmups)
  if not p_is_warmup then
    select 
      coalesce(max(ws.weight_kg), 0),
      coalesce(max(round(ws.weight_kg * (1.0 + (ws.reps::numeric / 30.0)), 2)), 0)
    into v_prev_max_weight, v_prev_max_e1rm
    from public.workout_sets ws
    join public.workout_exercises we on ws.workout_exercise_id = we.id
    where we.exercise_id = v_exercise_id 
      and ws.user_id = p_user_id 
      and ws.is_warmup = false
      and ws.id <> p_id;

    if p_weight_kg > v_prev_max_weight and v_prev_max_weight > 0 then
      v_is_pr_weight := true;
    end if;

    if v_e1rm > v_prev_max_e1rm and v_prev_max_e1rm > 0 then
      v_is_pr_e1rm := true;
    end if;
  end if;

  -- Upsert set record (enabling client-side generated UUIDs)
  insert into public.workout_sets (
    id, workout_exercise_id, user_id, set_number, weight_kg, reps, rir, is_warmup, is_pr_weight, is_pr_e1rm, completed_at
  ) values (
    p_id, p_workout_exercise_id, p_user_id, p_set_number, p_weight_kg, p_reps, p_rir, p_is_warmup, v_is_pr_weight, v_is_pr_e1rm, now()
  )
  on conflict (id) do update set
    weight_kg = excluded.weight_kg,
    reps = excluded.reps,
    rir = excluded.rir,
    is_warmup = excluded.is_warmup,
    is_pr_weight = excluded.is_pr_weight,
    is_pr_e1rm = excluded.is_pr_e1rm,
    completed_at = now();

  -- Build return payload
  select jsonb_build_object(
    'id', p_id,
    'e1rm', v_e1rm,
    'is_pr_weight', v_is_pr_weight,
    'is_pr_e1rm', v_is_pr_e1rm
  ) into v_result;

  return v_result;
end;
$$;

-- ==============================================================================
-- 6. PERFORMANCE INDEXES
-- ==============================================================================

create index if not exists idx_workout_sessions_user_date on public.workout_sessions (user_id, started_at desc);
create index if not exists idx_workout_exercises_session on public.workout_exercises (session_id, position);
create index if not exists idx_workout_sets_exercise on public.workout_sets (workout_exercise_id, set_number);
create index if not exists idx_food_entries_user_date on public.food_entries (user_id, eaten_on desc);
create index if not exists idx_weight_entries_user_date on public.weight_entries (user_id, measured_on desc);

