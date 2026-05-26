# Lian's Fitness App — Deploy Guide

A PWA (installable on iPhone) with real-time cross-device sync via Supabase.

---

## Step 1 — GitHub

1. Go to **github.com** → sign up
2. Click **New repository** → name it `lian-fitness` → **Create repository**
3. You'll see a page with commands. Leave it open.

---

## Step 2 — Supabase (database)

1. Go to **supabase.com** → **Sign up with GitHub**
2. Click **New project** → name it `lian-fitness` → set a database password → **Create project** (takes ~1 min)
3. When ready, go to **Settings → API**
4. Copy these two values — you'll need them:
   - **Project URL** (looks like `https://xxxx.supabase.co`)
   - **anon public** key (long string under "Project API keys")
5. Go to **SQL Editor** (left sidebar) → **New query**
6. Open the file `supabase-schema.sql` from this project, paste the entire contents → click **Run**
7. You should see "Success. No rows returned"

---

## Step 3 — Add your Supabase credentials

In the project folder, copy `.env.example` to a new file called `.env`:

```
VITE_SUPABASE_URL=https://your-actual-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-actual-anon-key-here
```

Replace the placeholder values with what you copied from Supabase.

---

## Step 4 — Push to GitHub

Install Node.js from **nodejs.org** if you don't have it, then open a terminal in the project folder:

```bash
npm install
npm run build       # test it builds without errors

git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/lian-fitness.git
git push -u origin main
```

---

## Step 5 — Deploy on Vercel

1. Go to **vercel.com** → **Sign up with GitHub**
2. Click **Add New Project** → select your `lian-fitness` repo → **Import**
3. Under **Environment Variables**, add:
   - `VITE_SUPABASE_URL` → your Project URL
   - `VITE_SUPABASE_ANON_KEY` → your anon key
4. Click **Deploy** — takes about 30 seconds
5. Vercel gives you a URL like `lian-fitness.vercel.app` — that's your app!

---

## Step 6 — Install on iPhone

1. Open **Safari** on your iPhone (must be Safari, not Chrome)
2. Go to your Vercel URL
3. Tap the **Share** button (box with arrow pointing up)
4. Tap **Add to Home Screen**
5. Tap **Add** → the app icon appears on your home screen

It works fullscreen, offline-capable, and syncs with your PC automatically.

---

## Syncing between devices

Just open the same Vercel URL on any device. All data (weight, habits, gym logs, measurements) is stored in your Supabase database — fully shared across phone and PC in real time.

---

## Future updates

Any time you change the code:
```bash
git add .
git commit -m "Update"
git push
```
Vercel auto-deploys within seconds.
