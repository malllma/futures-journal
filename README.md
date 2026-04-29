# Futures Journal — Setup Guide

This is a personal trading journal that syncs across all your devices. Trades you log on your phone show up on your PC instantly, and vice versa.

You'll set this up once, then use it forever. Total time: about 20 minutes. Cost: free.

## How it works

- **Your code** lives on GitHub (free).
- **The website** runs on Vercel (free) at a URL like `your-app.vercel.app`.
- **Your trades** are stored in Supabase (free) — a tiny database that only you can read.
- You sign in once on each device with the same email, and everything stays in sync automatically.

You'll do everything below in a web browser. No terminal needed.

---

## Step 1 — Create your Supabase project

1. Go to **https://supabase.com** and click **Start your project**.
2. Sign up with GitHub or email. (If you sign up with email, confirm your email when they ask.)
3. Once you're in the dashboard, click **New Project**.
4. Fill in:
   - **Name**: `futures-journal` (or anything — just for you)
   - **Database password**: click **Generate a password** and **save it in your password manager**. You probably won't need it again, but don't lose it.
   - **Region**: pick the one closest to you (e.g. `Europe (Frankfurt)` if you're in Norway).
   - **Plan**: Free.
5. Click **Create new project**. It takes about 2 minutes to provision.

---

## Step 2 — Create the trades table

While you're waiting (or after), in the Supabase dashboard:

1. In the left sidebar, click the **SQL Editor** icon (looks like `</>`).
2. Click **New query**.
3. Paste this entire block in:

```sql
-- The trades table
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

-- Row Level Security: each user only sees their own trades
alter table public.trades enable row level security;

create policy "Users read own trades"   on public.trades for select using  (auth.uid() = user_id);
create policy "Users insert own trades" on public.trades for insert with check (auth.uid() = user_id);
create policy "Users update own trades" on public.trades for update using  (auth.uid() = user_id);
create policy "Users delete own trades" on public.trades for delete using  (auth.uid() = user_id);

-- Enable realtime so changes on one device push to the other
alter publication supabase_realtime add table public.trades;
```

4. Click **Run** (bottom right). You should see "Success. No rows returned."

---

## Step 3 — Turn off email confirmation (so signup is instant)

This is for your own use only, so you can skip the email-confirmation step.

1. In Supabase sidebar, click **Authentication**.
2. Click **Sign In / Providers** (or **Providers** in older UI).
3. Find **Email**. Click into it.
4. **Turn OFF** "Confirm email".
5. Click **Save**.

---

## Step 4 — Copy your API keys

Still in Supabase:

1. Click the **gear icon** (Project Settings) in the bottom-left.
2. Click **API** (or **Data API**).
3. You need two values. Keep this tab open — you'll paste these into Vercel in a few minutes:
   - **Project URL** — looks like `https://abcdefg.supabase.co`
   - **anon public key** — a long string starting with `eyJ...`

The `anon` key is safe to use in the browser. Row Level Security keeps your data private.

---

## Step 5 — Put the code on GitHub

1. Go to **https://github.com** and sign up if you don't have an account.
2. Click the **+** in the top right → **New repository**.
3. Name it `futures-journal`, leave everything else as default, and click **Create repository**.
4. On the next page, click **uploading an existing file**.
5. **Drag every file and folder from this `futures-journal` folder** into the upload area. Make sure you upload the contents (the `src` folder, `package.json`, etc.) — not the outer folder itself.
6. At the bottom, click **Commit changes**.

Your code is now on GitHub.

---

## Step 6 — Deploy to Vercel

1. Go to **https://vercel.com** and click **Sign Up**.
2. Sign up with **Continue with GitHub**. Authorize Vercel to read your repos.
3. Once in the dashboard, click **Add New… → Project**.
4. Find `futures-journal` in the list and click **Import**.
5. Vercel auto-detects Vite. Don't change anything there.
6. Open the **Environment Variables** section and add **two**:
   - Name: `VITE_SUPABASE_URL`  →  Value: paste your Project URL from Step 4
   - Name: `VITE_SUPABASE_ANON_KEY`  →  Value: paste your anon key from Step 4
7. Click **Deploy**.

Wait about a minute. When it's done, you'll see a confetti animation and a URL like `futures-journal-xxxx.vercel.app`. Click it.

---

## Step 7 — Use your journal

1. On the URL, click **Sign up**.
2. Use any email + password (at least 6 chars). Save them.
3. You're in. Log a trade.
4. On your phone, open the same URL. Sign in with the same email + password. Your trade is there.

That's the whole thing. From now on, just open the URL.

---

## Optional — Add to home screen so it feels like an app

**iPhone (Safari):** open the URL → Share → **Add to Home Screen**. The icon appears on your home screen and opens fullscreen.

**Android (Chrome):** open the URL → menu (⋮) → **Add to Home screen** or **Install app**.

**PC (Chrome/Edge):** click the install icon in the address bar (looks like a small monitor with an arrow).

---

## When you want to make changes

The app on Vercel is connected to your GitHub repo. Whenever you push a change to GitHub, Vercel rebuilds and redeploys automatically — usually within a minute. You don't have to do anything.

If you want me to add features later (analytics, CSV export, charts, filtering), tell me what you want and I'll give you updated files. You'd upload them to GitHub the same way as Step 5, and Vercel handles the rest.

---

## Troubleshooting

**"Could not load trades" or empty calendar after signing in.**
You probably skipped or mistyped the SQL in Step 2. Go back to Supabase → SQL Editor and re-run the block. Then refresh the app.

**Sign-up says "email confirmation required" or hangs.**
Step 3 wasn't done. Go to Supabase → Authentication → Email provider → turn off "Confirm email."

**"Missing Supabase env vars" in browser console.**
Vercel didn't pick up the env variables. In Vercel: project → Settings → Environment Variables → make sure both `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set, then go to **Deployments**, click the latest one's three-dot menu, and **Redeploy**.

**Changes from one device don't show on the other.**
Realtime probably isn't enabled. Check that the `alter publication supabase_realtime add table public.trades;` line in the SQL ran without error. (You can re-run just that one line — if it complains "already exists" that's fine.)

**Supabase says my project is paused.**
Free Supabase projects pause after 7 days of zero activity. Just click **Restore** in the dashboard. If you use the journal regularly, this won't happen.

---

## What's free and what's not

Both Supabase and Vercel have generous free tiers that comfortably cover personal use. You will not be charged unless you actively upgrade. There is no credit card required for either signup.
