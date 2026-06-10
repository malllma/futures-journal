-- ============================================================================
-- EDGE UPGRADE MIGRATION  (run AFTER supabase-course-setup.sql + supabase-analytics-setup.sql)
-- ============================================================================
-- Turns the journal into a trading-improvement system.
--
-- 100% ADDITIVE + BACKWARD-COMPATIBLE + REVERSIBLE.
--   * Every new column is nullable -> existing 34 trades are untouched and keep working.
--   * The old `setup` free-text column is KEPT (now treated as "raw / legacy setup label").
--   * No DROP TABLE, no DELETE, no TRUNCATE, no data rewrite anywhere.
--   * Safe to re-run (every statement is `if not exists` / `if exists`-guarded).
--   * A commented ROLLBACK block at the bottom undoes everything if you ever want to.
--
-- Run this in: Supabase Dashboard -> SQL Editor -> New query -> paste all -> Run.
-- ============================================================================


-- ----------------------------------------------------------------------------
-- 1. New review/classification columns on the existing `trades` table.
-- ----------------------------------------------------------------------------
-- All nullable. Old trades show "Unclassified" until you (optionally) edit them.
-- We deliberately do NOT add strict CHECK constraints on the text-vocab columns
-- (entry_trigger, execution_quality, mistake_type, setup_family) so the app can
-- extend the vocabularies later without another migration. The UI supplies clean
-- dropdown values; free text is still accepted and never rejected.

alter table public.trades add column if not exists setup_family      text;     -- support_resistance | vwap | trendline | confluence | no_setup
alter table public.trades add column if not exists entry_trigger     text;     -- rejection | break_and_hold | retest_hold | liquidity_sweep | ...
alter table public.trades add column if not exists setup_present     boolean;  -- was a real setup present?
alter table public.trades add column if not exists trigger_present    boolean;  -- was an entry trigger present?
alter table public.trades add column if not exists execution_quality  text;     -- clean | late | early | chased | hesitated | reentered_badly
alter table public.trades add column if not exists mistake_type       text;     -- no_setup | chased | late | oversized | revenge | ... | other
alter table public.trades add column if not exists stop_loss          numeric;  -- planned stop price
alter table public.trades add column if not exists take_profit        numeric;  -- planned target price
alter table public.trades add column if not exists is_eval            boolean;  -- true if this was an eval/combine (prop) trade

comment on column public.trades.setup is
  'Raw / legacy free-text setup label. Preserved verbatim. The app derives a standardized setup_family from this when setup_family is null.';
comment on column public.trades.setup_family is
  'Standardized setup family. Nullable; when null the app derives it at read-time from the raw `setup` text (non-destructive).';


-- ----------------------------------------------------------------------------
-- 2. EXPAND (not replace) the market_type CHECK constraint.
-- ----------------------------------------------------------------------------
-- The original analytics migration added market_type with an inline CHECK named
-- `trades_market_type_check` allowing: bull_trend, bear_trend, range, chop, news.
-- We keep ALL of those (so existing rows stay valid) and ADD: reversal, breakout, slow.
-- Dropping + re-adding a CHECK does not touch row data.

alter table public.trades drop constraint if exists trades_market_type_check;

alter table public.trades
  add constraint trades_market_type_check
  check (
    market_type in (
      'bull_trend', 'bear_trend',
      'range', 'chop',                 -- kept for backward compatibility with existing rows
      'news',
      'reversal', 'breakout', 'slow'   -- newly added market types
    )
    or market_type is null
  );


-- ----------------------------------------------------------------------------
-- 3. New `no_trades` table — discipline tracker for days you correctly stayed out.
-- ----------------------------------------------------------------------------
-- Completely SEPARATE from `trades` so it can never distort P/L or trade stats.

create table if not exists public.no_trades (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  date date not null,
  reason text,        -- no_setup | too_choppy | news_risk | missed_entry | already_hit_target | not_ready | waiting_confirmation | other
  note text,
  created_at timestamptz not null default now()
);

create index if not exists no_trades_user_date_idx on public.no_trades (user_id, date desc);

alter table public.no_trades enable row level security;

-- Policies are guarded so re-running this script doesn't error on "already exists".
do $$
begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='no_trades' and policyname='Users read own no_trades') then
    create policy "Users read own no_trades"   on public.no_trades for select using (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='no_trades' and policyname='Users insert own no_trades') then
    create policy "Users insert own no_trades" on public.no_trades for insert with check (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='no_trades' and policyname='Users update own no_trades') then
    create policy "Users update own no_trades" on public.no_trades for update using (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='no_trades' and policyname='Users delete own no_trades') then
    create policy "Users delete own no_trades" on public.no_trades for delete using (auth.uid() = user_id);
  end if;
end $$;

-- Realtime sync (phone <-> PC). Ignore "already member of publication" if it appears.
do $$
begin
  alter publication supabase_realtime add table public.no_trades;
exception
  when duplicate_object then null;  -- already added; fine
end $$;


-- ----------------------------------------------------------------------------
-- 4. Helpful indexes for the new group-by analytics (cheap, optional).
-- ----------------------------------------------------------------------------
create index if not exists trades_setup_family_idx   on public.trades (user_id, setup_family);
create index if not exists trades_entry_trigger_idx  on public.trades (user_id, entry_trigger);
create index if not exists trades_mistake_type_idx   on public.trades (user_id, mistake_type);


-- ============================================================================
-- DONE. Nothing above destroys or modifies existing data.
-- ============================================================================


-- ----------------------------------------------------------------------------
-- ROLLBACK (optional) — only if you ever want to fully undo this migration.
-- Uncomment and run. This drops only the NEW columns/table/constraint; your
-- original trade data (date, symbol, pnl, setup, notes, market_type, etc.) stays.
-- ----------------------------------------------------------------------------
-- alter table public.trades drop column if exists setup_family;
-- alter table public.trades drop column if exists entry_trigger;
-- alter table public.trades drop column if exists setup_present;
-- alter table public.trades drop column if exists trigger_present;
-- alter table public.trades drop column if exists execution_quality;
-- alter table public.trades drop column if exists mistake_type;
-- alter table public.trades drop column if exists stop_loss;
-- alter table public.trades drop column if exists take_profit;
-- alter table public.trades drop column if exists is_eval;
-- drop table if exists public.no_trades;
-- -- restore the original (narrower) market_type CHECK:
-- alter table public.trades drop constraint if exists trades_market_type_check;
-- alter table public.trades add constraint trades_market_type_check
--   check (market_type in ('bull_trend','bear_trend','range','chop','news') or market_type is null);
