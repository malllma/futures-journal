-- COURSE TABLES — add to your existing Supabase project.
-- This does NOT touch your trades table. Safe to run.
-- Run this in: Supabase Dashboard -> SQL Editor -> New query -> paste -> Run.

-- Per-user, per-module progress (started, completed, quiz score, last position)
create table if not exists public.course_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  module_id text not null,            -- e.g. 'm01', 'm02'
  status text not null default 'not_started' check (status in ('not_started', 'in_progress', 'completed')),
  quiz_best_score numeric default 0,  -- 0 to 1
  quiz_attempts int default 0,
  last_section int default 0,
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  unique (user_id, module_id)
);

create index if not exists course_progress_user_idx on public.course_progress (user_id);

alter table public.course_progress enable row level security;

create policy "Users read own course progress"   on public.course_progress for select using (auth.uid() = user_id);
create policy "Users insert own course progress" on public.course_progress for insert with check (auth.uid() = user_id);
create policy "Users update own course progress" on public.course_progress for update using (auth.uid() = user_id);
create policy "Users delete own course progress" on public.course_progress for delete using (auth.uid() = user_id);

-- Per-user checklist item state. checklist_items live in code (module content).
-- We just track which item ids are checked.
create table if not exists public.course_checklist (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  item_id text not null,              -- e.g. 'm01.takeaway.3' or 'graduation.sim_30_days'
  checked boolean not null default true,
  updated_at timestamptz not null default now(),
  unique (user_id, item_id)
);

create index if not exists course_checklist_user_idx on public.course_checklist (user_id);

alter table public.course_checklist enable row level security;

create policy "Users read own checklist"   on public.course_checklist for select using (auth.uid() = user_id);
create policy "Users insert own checklist" on public.course_checklist for insert with check (auth.uid() = user_id);
create policy "Users update own checklist" on public.course_checklist for update using (auth.uid() = user_id);
create policy "Users delete own checklist" on public.course_checklist for delete using (auth.uid() = user_id);

-- Realtime so phone <-> PC stays in sync
alter publication supabase_realtime add table public.course_progress;
alter publication supabase_realtime add table public.course_checklist;
