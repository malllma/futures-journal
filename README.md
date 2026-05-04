# Futures Journal + Course (v2)

Personal futures journal with a P/L calendar **plus** a 24-module course on ES futures trading. Single account, syncs across devices. Free to host.

If you're upgrading from v1, see the **Upgrading from v1** section below — it's a 5-minute job.

---

## What's in here

- **Journal tab** — P/L calendar, full CRUD on trades, exactly the same as v1.
- **Course tab** — 24 modules across 6 phases (Foundations → Charts → Risk → Order Flow → Strategy → Psychology & Prop Eval), with checklists, end-of-module quizzes, SVG diagrams, a live position sizing calculator, and a graduation checklist.
- **Auth** via Supabase email + password.
- **Sync** via Supabase realtime — your progress, checks, and trades stay current across phone and PC.

The journal table from v1 (`trades`) is **not touched** by the v2 install. Only two new tables (`course_progress`, `course_checklist`) are added.

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
├── supabase-course-setup.sql       ← run this once in Supabase
├── tailwind.config.js
├── vite.config.js
└── src/
    ├── App.jsx                      ← shell (auth + sidebar nav)
    ├── Journal.jsx                  ← original journal logic
    ├── Course.jsx                   ← course shell
    ├── index.css
    ├── main.jsx
    ├── components/
    │   └── Auth.jsx
    ├── lib/
    │   └── supabase.js
    └── course/
        ├── index.js                 ← phases, allModules, graduationChecklist
        ├── useCourseData.js         ← Supabase-synced progress + checklist hook
        ├── components/
        │   ├── Checklist.jsx
        │   ├── Diagrams.jsx
        │   ├── LessonBody.jsx
        │   ├── PositionCalculator.jsx
        │   └── Quiz.jsx
        └── modules/
            ├── phase1.js  (Foundations: m01–m04)
            ├── phase2.js  (Charts & Price Action: m05–m09)
            ├── phase3.js  (Risk & Position Sizing: m10–m13)
            ├── phase4.js  (Order Flow & Market Structure: m14–m17)
            ├── phase5.js  (Strategy & Playbook: m18–m21)
            └── phase6.js  (Psychology & Prop Eval: m22–m24)
```

---

## Upgrading from v1 (most likely you)

You already have:
- the v1 repo on GitHub (`malllma/futures-journal`)
- a Supabase project with the `trades` table
- a Vercel deployment connected to the repo

You need to do **two** things:

### 1. Run the course-tables SQL once

In Supabase dashboard → **SQL Editor** → **New query** → paste the entire contents of `supabase-course-setup.sql` → click **Run**.

You should see "Success. No rows returned." This adds two tables (`course_progress`, `course_checklist`), enables row-level security, and turns on realtime. **Your `trades` table is untouched.**

### 2. Push the v2 code to GitHub

You can either:

**Option A — replace everything via GitHub web UI** (easiest):

1. Go to your repo on github.com.
2. For each top-level file (`package.json`, `index.html`, etc.) that exists in v2, click into it on GitHub, click the pencil icon, replace the contents, commit. (Most files are unchanged from v1, so you only really need to update files that are different.)
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

- A sidebar (desktop) or top tabs (mobile) with **Journal** and **Course**.
- Journal works exactly as before, with all your trades intact.
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
