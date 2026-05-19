-- ANALYTICS SETUP — run AFTER you've already run supabase-course-setup.sql.
-- Safe to re-run. All new columns are nullable so existing trades stay intact.
-- Run this in: Supabase Dashboard -> SQL Editor -> New query -> paste -> Run.

-- ============================================================================
-- 1. Add new review fields to the existing `trades` table.
-- ============================================================================
-- All nullable. Old trades will show "Unclassified" for these in analytics.

alter table public.trades
  add column if not exists market_type text
    check (market_type in ('bull_trend', 'bear_trend', 'range', 'chop', 'news') or market_type is null);

alter table public.trades
  add column if not exists rules_followed boolean;

alter table public.trades
  add column if not exists rule_breaks text;

alter table public.trades
  add column if not exists loss_explanation text;

-- Index for analytics group-by performance (cheap, optional).
create index if not exists trades_market_type_idx on public.trades (user_id, market_type);
create index if not exists trades_setup_idx       on public.trades (user_id, setup);

-- ============================================================================
-- 2. Daily notes table — one note per (user, date).
-- ============================================================================
-- For end-of-day journaling: "what worked, what didn't, what to fix tomorrow".

create table if not exists public.daily_notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  date date not null,
  note text,
  updated_at timestamptz not null default now(),
  unique (user_id, date)
);

create index if not exists daily_notes_user_date_idx on public.daily_notes (user_id, date desc);

alter table public.daily_notes enable row level security;

create policy "Users read own daily notes"   on public.daily_notes for select using (auth.uid() = user_id);
create policy "Users insert own daily notes" on public.daily_notes for insert with check (auth.uid() = user_id);
create policy "Users update own daily notes" on public.daily_notes for update using (auth.uid() = user_id);
create policy "Users delete own daily notes" on public.daily_notes for delete using (auth.uid() = user_id);

-- Realtime sync for daily notes (phone <-> PC)
alter publication supabase_realtime add table public.daily_notes;
