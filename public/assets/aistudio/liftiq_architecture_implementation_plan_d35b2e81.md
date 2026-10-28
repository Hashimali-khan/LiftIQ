# LiftIQ: Architecture and Implementation Plan (Revised PWA & Supabase Edition)

**Project:** LiftIQ — AI-Assisted Workout & Nutrition Tracking Application  
**Version:** 2.0 (Supabase & PWA Modernized Stack)  
**Authors:** Muhammad Abbas Zaidi & Team  
**Date:** October 2026  

---

## 1. Executive Summary & System Overview

LiftIQ is a full-stack, mobile-first Progressive Web App (PWA) designed for seamless workout tracking, automated nutritional planning, and AI-driven coaching. 

### Modernized Architecture Blueprint

To eliminate cold starts, minimize server overhead, and ensure zero data loss during offline workouts, LiftIQ uses a **Hybrid Architecture**:
* **Direct Database & Auth Access (Client $\rightarrow$ Supabase):** Core low-latency operations (workout logging, body weight tracking, exercise querying, food logging) bypass intermediate application servers. The PWA client communicates directly with Supabase PostgreSQL via auto-generated PostgREST APIs protected by strict SQL **Row Level Security (RLS)** policies and **Postgres RPC (Remote Procedure Call)** functions.
* **Serverless / Compute Layer (Client $\rightarrow$ FastAPI on Render / Supabase Edge Functions):** Computationally heavy or secret-dependent operations—such as Grok AI prompts, BMR/TDEE math, automated report generation, and account cascade deletion—run through FastAPI endpoints (or optional TypeScript Edge Functions), authenticating incoming requests via verified Supabase JWTs.

```
+-----------------------------------------------------------------------------------+
|                              Browser / Mobile (PWA)                               |
|  [ Next.js App Router | TanStack Query | Serwist SW | IndexedDB Offline Queue ]  |
+----------------------------------------+------------------------------------------+
                                         |
            +----------------------------+----------------------------+
            | (Direct Data & Auth)                                    | (AI & Reports)
            v                                                         v
+-----------------------+                                 +-----------------------+
|    Supabase Cloud     |                                 |    FastAPI Backend    |
|  +-----------------+  |                                 |  +-----------------+  |
|  |  Supabase Auth  |  |                                 |  |  JWT Validator  |  |
|  +-----------------+  |                                 |  +--------+--------+  |
|  | Postgres (RLS)  |  |                                 |           |           |
|  |  & RPC Engine   |  |<================================|=== DB (Service Key)   |
|  +-----------------+  | (Service Role / Direct SQL read)|           |           |
+-----------------------+                                 +---------+-------------+
                                                                    |
                                                                    v
                                                          +-------------------+
                                                          |  Grok API (xAI)   |
                                                          +-------------------+
```

---

## 2. Tech Stack & Architectural Decisions

| Layer | Choice | Rationale & Deployment |
| :--- | :--- | :--- |
| **Frontend & PWA** | Next.js 15+ (App Router, TypeScript) + Serwist PWA | Static app shell caching, standalone display mode, server context, optimized for mobile WebKit and Chromium engines. |
| **Offline Cache** | TanStack Query v5 + IndexedDB Persister | Offline mutation queueing with client-side UUID generation for zero-latency workout logging. |
| **UI & Components** | Tailwind CSS + shadcn/ui | Mobile-first responsive layouts, optimized touch targets (minimum 48px), native-feeling interactions. |
| **Database & Auth** | Supabase PostgreSQL + Supabase Auth | Native RLS, built-in email auth, SSR cookie management, RPC functions for atomic transaction handling. |
| **Backend & AI** | FastAPI (Python 3.11) + Grok SDK (`openai`) | Strict Pydantic validation for AI JSON output, WeasyPrint/ReportLab PDF compiling, complex workout analytics. |
| **Schema Migrations** | Supabase CLI (`supabase/migrations`) | Unified SQL source of truth for schema alterations, index definitions, and RLS policies. |

---

## 3. Database Schema, RLS, & Atomic RPCs

The schema consists of **12 primary relational tables**. All user-owned tables carry a `user_id` foreign key referencing `auth.users(id)` and utilize Row Level Security (RLS). Primary keys use standard UUID v4 format to permit offline client-side generation.

```
                          +-------------------+
                          |    auth.users     |
                          +---------+---------+
                                    |
          +-------------------------+-------------------------+
          | 1:1                     | 1:N                     | 1:N
          v                         v                         v
+-------------------+     +-------------------+     +-------------------+
|     profiles      |     |  nutrition_plans  |     | workout_sessions  |
+-------------------+     +-------------------+     +---------+---------+
                                                              | 1:N
                                                              v
+-------------------+     +-------------------+     +-------------------+
|     exercises     |     |   food_entries    |     | workout_exercises |
| (Presets + Custom)|     +-------------------+     +---------+---------+
+---------+---------+                                         | 1:N
          | 1:N           +-------------------+               v
          +-------------->|  weight_entries   |     +-------------------+
                          +-------------------+     |   workout_sets    |
                                                    +-------------------+
```

### 3.1 Schema SQL & RLS Security Directives

```sql
-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- PROFILES (Linked 1:1 with auth.users)
create table public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  sex text check (sex in ('male', 'female')),
  date_of_birth date not null,
  height_cm numeric(5,2) not null check (height_cm > 0),
  activity_level text not null,
  unit_pref text default 'kg' check (unit_pref in ('kg', 'lb')),
  goal_weight_kg numeric(5,2) check (goal_weight_kg > 0),
  updated_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Users can read own profile" 
  on public.profiles for select using ((select auth.uid()) = user_id);

create policy "Users can insert own profile" 
  on public.profiles for insert with check ((select auth.uid()) = user_id);

create policy "Users can update own profile" 
  on public.profiles for update 
  using ((select auth.uid()) = user_id) 
  with check ((select auth.uid()) = user_id);

-- EXERCISES (Global presets + custom per user)
create table public.exercises (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade, -- NULL = System Preset
  name text not null,
  muscle_group text not null,
  equipment text not null,
  movement_type text not null,
  description text,
  is_archived boolean default false,
  created_at timestamptz default now()
);

create unique index unique_preset_exercise_name 
  on public.exercises (lower(name)) where user_id is null;

create unique index unique_custom_exercise_name 
  on public.exercises (user_id, lower(name)) where user_id is not null;

alter table public.exercises enable row level security;

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

-- WORKOUT SESSIONS, EXERCISES & SETS (Denormalized user_id for RLS safety)
create table public.workout_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  notes text
);

create table public.workout_exercises (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.workout_sessions(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  exercise_id uuid not null references public.exercises(id) on delete restrict,
  position integer not null check (position >= 0),
  notes text
);

create table public.workout_sets (
  id uuid primary key default gen_random_uuid(),
  workout_exercise_id uuid not null references public.workout_exercises(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  set_number integer not null check (set_number > 0),
  weight_kg numeric(6,2) not null check (weight_kg >= 0),
  reps integer not null check (reps > 0),
  rir integer check (rir between 0 and 10),
  is_warmup boolean default false,
  is_pr_weight boolean default false,
  is_pr_e1rm boolean default false,
  completed_at timestamptz default now()
);

alter table public.workout_sessions enable row level security;
alter table public.workout_exercises enable row level security;
alter table public.workout_sets enable row level security;

-- Cascading RLS Policies enforcing explicit user ownership
create policy "Manage workout sessions" on public.workout_sessions
  for all using ((select auth.uid()) = user_id) 
  with check ((select auth.uid()) = user_id);

create policy "Manage workout exercises" on public.workout_exercises
  for all using ((select auth.uid()) = user_id) 
  with check ((select auth.uid()) = user_id);

create policy "Manage workout sets" on public.workout_sets
  for all using ((select auth.uid()) = user_id) 
  with check ((select auth.uid()) = user_id);

-- FOOD & WEIGHT ENTRIES
create table public.food_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  eaten_on date not null,
  meal_type text check (meal_type in ('breakfast', 'lunch', 'dinner', 'snack')),
  name text not null,
  calories numeric(6,1) not null check (calories >= 0),
  protein_g numeric(5,1) not null check (protein_g >= 0),
  carbs_g numeric(5,1) not null check (carbs_g >= 0),
  fat_g numeric(5,1) not null check (fat_g >= 0),
  source text default 'manual' check (source in ('manual', 'ai'))
);

create table public.weight_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  measured_on date not null,
  weight_kg numeric(5,2) not null check (weight_kg between 20 and 400),
  note text,
  unique(user_id, measured_on)
);

alter table public.food_entries enable row level security;
alter table public.weight_entries enable row level security;

create policy "Manage food entries" on public.food_entries
  for all using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

create policy "Manage weight entries" on public.weight_entries
  for all using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

-- READ-ONLY SERVER TABLES (FastAPI writes via Service Key)
create table public.reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  period text check (period in ('weekly', 'monthly')),
  period_start date not null,
  period_end date not null,
  metrics jsonb not null,
  ai_summary text,
  created_at timestamptz default now(),
  unique(user_id, period, period_start)
);

alter table public.reports enable row level security;
create policy "Users view own reports" on public.reports
  for select using ((select auth.uid()) = user_id);
-- Note: No INSERT/UPDATE policy for public authenticated role; written exclusively by FastAPI backend.
```

### 3.2 Atomic PR Detection RPC Function

To ensure offline synced sets correctly calculate Personal Records (PRs) without race conditions, set insertion is encapsulated in a PostgreSQL stored procedure (`SECURITY DEFINER` with fixed `search_path`):

```sql
create or replace function public.log_workout_set(
  p_id uuid,
  p_workout_exercise_id uuid,
  p_user_id uuid,
  p_set_number integer,
  p_weight_kg numeric,
  p_reps integer,
  p_rir integer,
  p_is_warmup boolean
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_exercise_id uuid;
  v_e1rm numeric;
  v_prev_max_weight numeric;
  v_prev_max_e1rm numeric;
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

  -- Compute e1RM using Epley Formula: w * (1 + reps / 30.0)
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
    id, workout_exercise_id, user_id, set_number, weight_kg, reps, rir, is_warmup, is_pr_weight, is_pr_e1rm
  ) values (
    p_id, p_workout_exercise_id, p_user_id, p_set_number, p_weight_kg, p_reps, p_rir, p_is_warmup, v_is_pr_weight, v_is_pr_e1rm
  )
  on conflict (id) do update set
    weight_kg = excluded.weight_kg,
    reps = excluded.reps,
    rir = excluded.rir,
    is_warmup = excluded.is_warmup,
    is_pr_weight = excluded.is_pr_weight,
    is_pr_e1rm = excluded.is_pr_e1rm;

  build_json:
  select jsonb_build_object(
    'id', p_id,
    'e1rm', v_e1rm,
    'is_pr_weight', v_is_pr_weight,
    'is_pr_e1rm', v_is_pr_e1rm
  ) into v_result;

  return v_result;
end;
$$;
```

---

## 4. Progressive Web App (PWA) & Offline-First Strategy

To provide an unbroken logging experience inside gym environments with poor connectivity, LiftIQ is structured around an offline-first data pipeline.

### 4.1 PWA Configuration Matrix
* **Manifest Settings:** `display: "standalone"`, `orientation: "portrait"`, safe area insets via `viewport-fit=cover`.
* **Static Assets:** Cached via Service Worker using Serwist / Next PWA integration.
* **Service Worker Scope & Bypass Rule:** Service Worker caches HTML shell, CSS/JS bundles, web fonts, and static icons. **API endpoints (`/rest/v1/*` and `/api/*`) are strictly excluded from Service Worker caches** to prevent stale state or unintended auth leakage.

### 4.2 Offline Mutation Queue & Synchronization Flow

```
[ User Logs Set Offline ]
           |
           v
[ Generate Client-Side UUID v4 ]
           |
           v
[ Optimistically Update UI & Write to IndexedDB Queue ]
           |
           +----------------------------------+
                                              |
                                    (Network Restored)
                                              |
                                              v
                             [ Check Supabase Auth Session ]
                                              |
                        +---------------------+---------------------+
                        | Valid Session                             | Session Expired
                        v                                           v
           [ Flush Queue to Supabase RPC ]                [ Refresh Auth Token ]
                        |                                           |
                        v                                           v
             [ Server Reconciles PRs ]                   [ Flush Queue to RPC ]
```

1. **Client-Side UUID Assignment:** Parent session, exercise container, and set entries generate UUID v4 identifiers locally before persistence.
2. **IndexedDB Persister:** Mutated sets are appended to IndexedDB using TanStack Query's `createAsyncStoragePersister`.
3. **Session Verification Before Replay:** Upon detecting the `window.addEventListener('online')` event or app visibility change, the application explicitly triggers `supabase.auth.refreshSession()`.
4. **Queue Flush Execution:** Following successful token validation, the pending mutation queue flushes to the `log_workout_set` RPC function.

### 4.3 Rest Timer Background Handling

Standard Web Workers and `setInterval` timers are suspended by iOS WebKit and Android Doze modes within 5–10 seconds of minimizing the application. 
* **Implementation:** The LiftIQ Rest Timer stores an absolute epoch timestamp: $\text{targetEndTime} = \text{Date.now()} + \text{restDurationMs}$.
* **Foreground Reconciliation:** When the user returns to the app, the UI listens for `visibilitychange` events and immediately recalculates remaining time: $\text{remaining} = \text{targetEndTime} - \text{Date.now()}$. 
* If $\text{remaining} \le 0$, the timer UI automatically triggers a visual alert and triggers `navigator.vibrate([200, 100, 200])`.

---

## 5. FastAPI Backend & AI Integration (Grok API)

FastAPI acts as a specialized stateless service for AI operations, PDF rendering, and complex reporting, authenticating all requests using Supabase-issued JWTs.

### 5.1 Python JWT Verification Middleware

```python
# app/core/security.py
import jwt
from fastapi import HTTPBearer, Security, HTTPException, status
from pydantic import BaseModel

class AuthenticatedUser(BaseModel):
    user_id: str
    email: str

security = HTTPBearer()
SUPABASE_JWT_SECRET = "your-supabase-jwt-secret-or-public-key"

def get_current_user(credentials=Security(security)) -> AuthenticatedUser:
    token = credentials.credentials
    try:
        payload = jwt.decode(
            token,
            SUPABASE_JWT_SECRET,
            algorithms=["HS256", "RS256"],
            audience="authenticated"
        )
        user_id: str = payload.get("sub")
        email: str = payload.get("email", "")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token subject")
        return AuthenticatedUser(user_id=user_id, email=email)
    except jwt.PyJWTError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Token validation failed: {str(e)}"
        )
```

### 5.2 Grok AI Orchestration Pipeline

All interactions with the xAI Grok API pass through a single, strictly bounded Python module (`app/services/ai_service.py`).

1. **Determinism First:** BMR, TDEE, macronutrient baselines, and volume numbers are calculated in Python functions prior to model invocation.
2. **Structured Output Enforcement:** Prompts mandate strict JSON schemas. Responses are validated against Pydantic models prior to database storage or client delivery.
3. **Graceful Fallbacks:** If the AI call fails (due to network timeout, rate limits, or invalid JSON), LiftIQ serves the pre-computed Python baseline metrics without throwing user-facing 500 errors.

```python
# app/services/ai_service.py
from openai import OpenAI
from pydantic import BaseModel
from app.core.config import settings

client = OpenAI(
    api_key=settings.XAI_API_KEY,
    base_url="https://api.x.ai/v1"
)

class NutritionPlanSchema(BaseModel):
    calories: int
    protein_g: int
    carbs_g: int
    fat_g: int
    explanation: str
    tips: list[str]

def generate_ai_nutrition_plan(profile_data: dict, baseline_calc: dict) -> NutritionPlanSchema:
    system_prompt = (
        "You are an expert sports nutritionist. You will be provided with a user profile "
        "and mathematically calculated baseline calorie and macro requirements. "
        "Return a valid JSON object matching the requested schema. Do not change baseline calories by more than 10%."
    )
    user_prompt = f"Profile: {profile_data}. Calculated Baseline: {baseline_calc}"

    try:
        response = client.chat.completions.create(
            model=settings.XAI_MODEL,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.3,
            response_format={"type": "json_object"},
            timeout=25.0
        )
        validated_data = NutritionPlanSchema.model_validate_json(
            response.choices[0].message.content
        )
        return validated_data
    except Exception as e:
        # Fallback to pure Python baseline on API failure
        return NutritionPlanSchema(
            calories=baseline_calc["tdee"],
            protein_g=baseline_calc["protein"],
            carbs_g=baseline_calc["carbs"],
            fat_g=baseline_calc["fat"],
            explanation="Generated using standard Mifflin-St Jeor equation (AI fallback applied).",
            tips=["Focus on consistent daily macro tracking.", "Ensure adequate hydration daily."]
        )
```

---

## 6. Implementation Roadmap & Development Plan

Development is divided into **7 sequential, vertical module slices**.

```
[Week 1: Foundations & Supabase CLI Setup]
       |
       v
[Week 2-3: Mod 1 - Auth & Profiles] ───────► [Week 4-5: Mod 3 & 4 - Exercise & Offline Workouts]
                                                                  |
                                                                  v
[Week 8-9: Mod 6 & 7 - Weight & Reports/PDF] ◄─── [Week 6-7: Mod 2 & 5 - AI Nutrition & Food Log]
       |
       v
[Week 10-11: Mod 8 - AI Coach & Insights]
       |
       v
[Week 12-14: PWA Optimization, Security Review & Pre-Demo Verification]
```

### Module Breakdown & Task Scope

#### Phase 1: Infrastructure & Authentication (Weeks 1–3)
* **Supabase Initialization:** Setup local CLI project, apply initial SQL migrations, configure RLS security rules, establish GitHub Actions auto-migration script.
* **Auth Implementation:** Configure Supabase Auth with SSR cookies in Next.js. Implement sign-up, login, profile initialization, and account deletion flows.

#### Phase 2: Exercise Library & Offline Workout Logger (Weeks 4–5)
* **Exercise Library:** Seed database with ~100 standardized exercises. Implement search, muscle group filters, and custom user exercise forms.
* **Offline Workout Engine:** Build logging interface with set-level optimist updates, rest timer, and offline queueing via IndexedDB and TanStack Query. Deploy atomic `log_workout_set` RPC function.

#### Phase 3: AI Nutrition Planner & Food Logging (Weeks 6–7)
* **Nutrition Calculations:** Write pure Python unit-tested modules for Mifflin-St Jeor BMR/TDEE calculations.
* **Grok AI Integration:** Implement `ai_service.py` JSON parser and wire up nutrition plan generation with safety validation. Build food logging CRUD views.

#### Phase 4: Weight Tracking, Analytics & PDF Reports (Weeks 8–9)
* **Weight Engine:** Implement daily weigh-in forms, graph displays, and 7-day moving average calculation functions.
* **Reports Service:** Build SQL aggregate metrics pipeline in FastAPI. Compile weekly and monthly analytical reports and export downloadable PDF summaries using ReportLab.

#### Phase 5: AI Coach & PWA Polish (Weeks 10–14)
* **AI Coach:** Add double-progression automated recommendations, plateau detection logic, and data-contextualized AI assistant chat routes.
* **PWA Hardening:** Install and verify Serwist Service Worker precaching. Verify iOS display compatibility (safe-area spacing, virtual keyboard handling, rest timer background resumption). Conduct full security audit against Supabase RLS policies.

---

## 7. Operational Pre-Demo Verification Checklist

1. **Supabase Inactivity Ping:** Configure a scheduled GitHub Action to ping the Supabase project 2–3 times weekly to prevent free-tier project pausing.
2. **Dashboard Security Advisor:** Run Supabase's built-in RLS Security Advisor prior to deployment to verify zero exposed tables.
3. **PWA Production Build Testing:** Execute PWA audits (`next build && next start`) over an HTTPS tunnel to confirm offline caching and queue flush execution on physical iOS and Android hardware.
4. **Grok Credits & Usage Guardrails:** Confirm available usage balances within the xAI Developer Console and verify per-user daily rate limits.