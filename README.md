# Futures Journal + Analytics + Edge/Playbook (v4)

Personal futures journal with a P/L calendar **plus** a trading-improvement analytics system **plus** an Edge/Playbook page. Single account, syncs across devices. Free to host.

If you're upgrading from an earlier version, see **Upgrading to v4** directly below.

---

## ⚡ Upgrading to v4 (the edge upgrade)

**One thing to do: run the new migration.** In Supabase → **SQL Editor** → **New query** → paste the entire contents of [`supabase-edge-upgrade.sql`](supabase-edge-upgrade.sql) → **Run**.

It is **100% additive and reversible**: it only *adds* nullable columns to `trades` (`setup_family`, `entry_trigger`, `setup_present`, `trigger_present`, `execution_quality`, `mistake_type`, `stop_loss`, `take_profit`, `is_eval`), *expands* (does not replace) the `market_type` CHECK to allow `reversal`/`breakout`/`slow`, and *creates* one new table (`no_trades`). **No existing trade, note, or P/L value is touched.** Run it once, then push the new code. Old trades keep working immediately and are auto-classified at read-time from their existing setup text. A commented rollback block is at the bottom of the SQL file.

> The **Settings** page shows whether the migration is live. Run the SQL *before* logging new trades with the new fields.

## What's new in v4

- **Graded edge analysis** — counts **every** logged trade (fixes the old "needs 30 trades" gate) and grades it honestly: *Too early → Promising but unproven → Statistically stronger → No edge detected*, each in plain language, with the full stat block (win rate, expectancy, profit factor, valid-trade expectancy, invalid-trade cost, best/worst setup & market).
- **Setup family vs entry trigger** — separated. Standardized setup families (Support & Resistance, VWAP, Trendline, Confluence, No-setup) mapped non-destructively from your old free-text labels, plus a separate Entry Trigger field.
- **Richer trade form** — stop/take-profit, setup present?, trigger present?, valid/invalid, execution quality, mistake type, eval toggle, and a "Suggest labels from notes" button (keyword-based, suggestion only).
- **Reorganized Analytics** — overview, edge confidence, setup / entry-trigger / setup+trigger-combo / market-type performance (news days highlighted), mistake-cost ranking, valid-vs-invalid audit, a **weekly coach summary** (replaces clicking each day), discipline tracker, and export.
- **Filters** — recompute every section: valid/invalid only, by setup family, exclude/only news, trend/chop days, last 20/30, eval only.
- **Edge / Playbook page** (replaces the Course tab) — your current edge, best/worst setups & markets, costliest mistakes, weekly coach, and a **playbook card** for each setup family driven by your real stats and example notes.
- **Export** — *Download Edge Report* (compact Markdown for ChatGPT) + *Export CSV* (raw trades, backward-compatible columns).

## Tabs

- **Journal** — P/L calendar, full CRUD, the extended trade form, and a no-trade (discipline) logger per day.
- **Analytics** — the full trading-improvement dashboard described above.
- **Edge / Playbook** — current edge summary + per-setup playbook cards + export.
- **Settings** — account, export, and migration status.

**Data safety:** the `trades` table is preserved — v4 only **adds** nullable columns. Old trades show "Unclassified" until you edit them, and are auto-classified at read-time from their raw setup text in the meantime. The Course UI was removed, but its data tables (`course_progress`, `course_checklist`) are left intact in your database.

---

## File layout

```
futures-journal-v2/
├── .env.example
├── .gitignore
├── README.md
├── index.html
├── package.json
├── postcss.config.js
├── supabase-course-setup.sql       ← v2 migration: course tables (still valid; tables kept)
├── supabase-analytics-setup.sql    ← v3 migration: analytics fields + daily_notes
├── supabase-edge-upgrade.sql       ← v4 migration: edge fields + no_trades (RUN THIS)
├── tailwind.config.js
├── vite.config.js
├── scripts/
│   └── selftest.mjs                ← node logic self-test (run: node scripts/selftest.mjs [trades.csv])
└── src/
    ├── App.jsx                      ← shell (auth + sidebar nav: Journal / Analytics / Edge / Settings)
    ├── Journal.jsx                  ← journal + extended trade form + no-trade tracker
    ├── Analytics.jsx                ← analytics dashboard (v4, reorganized + filters)
    ├── EdgePlaybook.jsx             ← Edge / Playbook page (v4, replaces Course)
    ├── Settings.jsx                 ← account + export + migration status (v4)
    ├── index.css
    ├── main.jsx
    ├── components/
    │   ├── Auth.jsx
    │   └── ExportButtons.jsx        ← shared Markdown report + CSV export (v4)
    └── lib/
        ├── supabase.js
        ├── analytics.js             ← pure analytics math: graded edge, groups, audits, weekly (v4)
        ├── classification.js        ← setup/trigger/market vocab + old→new keyword mapping (v4)
        ├── report.js                ← Markdown edge report + CSV builder (v4)
        ├── useJournalData.js        ← shared Supabase loader (trades + notes + no_trades) (v4)
        └── download.js              ← browser download helper (v4)
```

> The old `src/course/` directory and `Course.jsx` were removed in v4. The course **data tables** (`course_progress`, `course_checklist`) are intentionally left in your Supabase database, so no progress is lost if you ever re-add it.

---

## Upgrading

### From v2 to v3 (you've already got the course working)

Just **one** new thing: run the analytics SQL migration.

In Supabase → **SQL Editor** → **New query** → paste the entire contents of `supabase-analytics-setup.sql` → **Run**.

This adds four nullable columns to your existing `trades` table (`market_type`, `rules_followed`, `rule_breaks`, `loss_explanation`) and creates a new `daily_notes` table. Old trades are not modified — they'll just show "Unclassified" in the analytics groupings until you backfill them via the journal.

Then push the new v3 code to GitHub (same upload process you've already done). Vercel auto-redeploys.

### From v1 to v3 (full upgrade)

You already have:
- the v1 repo on GitHub (`malllma/futures-journal`)
- a Supabase project with the `trades` table
- a Vercel deployment connected to the repo

You need to do **two** things:

### 1. Run BOTH SQL migrations once

In Supabase dashboard → **SQL Editor** → **New query** → paste the entire contents of `supabase-course-setup.sql` → click **Run**.

Then **New query** again → paste `supabase-analytics-setup.sql` → **Run**.

Order matters slightly but both are safe to re-run. Together they add three tables (`course_progress`, `course_checklist`, `daily_notes`) and four nullable columns to `trades`. **No data is destroyed.**

### 2. Push the v3 code to GitHub

You can either:

**Option A — replace everything via GitHub web UI** (easiest):

1. Go to your repo on github.com.
2. For each top-level file (`package.json`, `index.html`, etc.) that exists in v3, click into it on GitHub, click the pencil icon, replace the contents, commit. (Most files are unchanged from v1, so you only really need to update files that are different.)
3. **Or simpler:** delete the existing `src/` folder on GitHub (open it, delete each file individually — GitHub web UI has no folder delete, but you can do it from the file view via the trash icon). Then upload the new `src/` contents.

**Option B — clean re-upload** (cleanest):

1. On your repo's main page, click the existing files one by one and delete them via the trash icon on the file view.
2. Click **Add file → Upload files**.
3. Drag everything inside the unzipped `futures-journal-v2/` folder onto the upload area.
4. Make sure you see folders like `src/course/modules/` in the staged list — if everything is flat, switch to Chrome/Edge (Safari/Firefox sometimes flatten folder uploads).
5. Commit.

Vercel auto-deploys when you commit. Wait ~2 min for the build.

### 3. Open the app

Same URL as before. You'll see:

- A sidebar (desktop) or top tabs (mobile) with **Journal**, **Analytics**, and **Course**.
- Journal works exactly as before, with all your trades intact. The trade form now has a "Review" section at the bottom (market type, rules followed, etc.).
- Analytics shows your full P/L metrics. Until you have 30+ trades, the edge analysis honestly tells you "insufficient data".
- Course is fresh — no progress, no checks. Start at module 01.

---

## Fresh install (if you don't have v1 already)

If you're setting this up from scratch:

### 1. Supabase

1. Go to https://supabase.com → sign up → **New Project**. Pick a region near you. Plan: Free.
2. While it provisions, write down the password it generated — store it in your password manager.
3. Once ready, go to **Authentication → Providers → Email** → turn off "Confirm email" and save (so signup is instant).
4. Go to **SQL Editor → New query**. Paste **both** of these blocks (one after the other, in order), click **Run** for each:

**Block A — the trades table** (this is what v1 uses):

```sql
create table if not exists public.trades (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  date date not null,
  symbol text not null,
  direction text not null check (direction in ('long', 'short')),
  pnl numeric not null,
  entry numeric,
  exit numeric,
  quantity numeric,
  setup text,
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists trades_user_date_idx on public.trades (user_id, date);

alter table public.trades enable row level security;

create policy "Users read own trades"   on public.trades for select using  (auth.uid() = user_id);
create policy "Users insert own trades" on public.trades for insert with check (auth.uid() = user_id);
create policy "Users update own trades" on public.trades for update using  (auth.uid() = user_id);
create policy "Users delete own trades" on public.trades for delete using  (auth.uid() = user_id);

alter publication supabase_realtime add table public.trades;
```

**Block B — the course tables** (in `supabase-course-setup.sql` in this repo):

Paste the contents of `supabase-course-setup.sql`. Run.

5. Go to **Project Settings → API** and copy two values:
   - **Project URL** (e.g. `https://abcdef.supabase.co`)
   - **anon public key** (a long string — usually `eyJ...` or `sb_publishable_...`)

### 2. GitHub

1. Sign up at https://github.com if you don't have an account.
2. Create a new repo named `futures-journal`. Public or private — your choice.
3. Click **Add file → Upload files**. Drag everything inside the unzipped `futures-journal-v2/` folder onto the upload area. Verify subfolders show as folders (not flattened files). Commit.

### 3. Vercel

1. Sign up at https://vercel.com using **Continue with GitHub**.
2. **Add New → Project** → import your `futures-journal` repo.
3. Vercel auto-detects Vite. Don't change anything.
4. Open **Environment Variables** and add two:
   - `VITE_SUPABASE_URL` = your Project URL
   - `VITE_SUPABASE_ANON_KEY` = your anon key
5. Click **Deploy**. Wait ~1 min.
6. Open the URL Vercel gives you, click **Sign up**, create an account with email + password (6+ chars).

You're in.

---

## Local dev (optional)

```bash
cp .env.example .env
# edit .env with your Supabase URL + anon key
npm install
npm run dev
```

Vite serves at http://localhost:5173.

---

## Course content notes

The course is built on the position that there is no "insider knowledge" worth selling. What matters is fundamentals done well, plus risk discipline, plus a feedback loop (the journal). Specifically:

- **No false promises.** The graduation checklist is a real gate. ~90% of prop-firm evals fail; this course aims to put you in the 10%, not promise you'll be there in 3 months.
- **ES from day one** is the path you chose. Modules 10–11 and the position calculator hammer the math: at $50 per point, a 5-point structural stop = $250/contract, so 1% risk on a $50K account = 1 contract. Discipline is non-negotiable.
- **Order flow content** (phase 4) is grounded in auction theory (Steidlmayer / Dalton lineage), DOM/tape, footprint, volume profile, market profile. This is the deepest part of the course.
- **Prop firms covered**: phase 6 has dedicated modules on Topstep ($50K Combine math, trailing drawdown trap, consistency rule) and MFFU (EOD drawdown, scaling). The graduation checklist explicitly requires reading current rules from the firm's site before paying — these change.

Each module has: lesson sections, an SVG diagram, takeaway checklist, practice task, and a 3–4 question quiz. Pass = 70%. Modules m10 and m11 also embed an interactive position-size calculator.

---

## Troubleshooting

**"Could not load trades" or course shows nothing.**
SQL didn't run completely. Re-run both SQL blocks (in fresh-install order: trades first, then course tables). Re-running is safe — `create table if not exists` and `if not exists` policies are idempotent. If a policy `already exists` error appears, you can ignore it.

**Course tab is empty / loading forever.**
The two new tables (`course_progress`, `course_checklist`) probably weren't created. Run `supabase-course-setup.sql` in the Supabase SQL Editor. Refresh the app.

**Course progress not syncing between devices.**
Realtime publication wasn't enabled. Re-run the last two lines of `supabase-course-setup.sql`:
```sql
alter publication supabase_realtime add table public.course_progress;
alter publication supabase_realtime add table public.course_checklist;
```
"Already a member of publication" errors mean it's already on — ignore.

**Vercel build fails with "Could not resolve …".**
Means a file is missing in your GitHub upload. Almost always one of `src/components/Auth.jsx`, `src/lib/supabase.js`, or one of the `src/course/...` files. Check the GitHub repo file tree against the `src/` layout above, and re-upload anything missing.

**Sign-up hangs or asks for email confirmation.**
You forgot to turn off "Confirm email" in Supabase → Authentication → Providers → Email. Turn it off and try again.

**Supabase project paused.**
Free projects pause after 7 days of zero activity. Click **Restore** in the dashboard. Doesn't happen if you use the app regularly.

---

## What's free

Both Supabase and Vercel free tiers cover personal use comfortably. No credit card needed for either signup. You will not be charged unless you actively upgrade.
