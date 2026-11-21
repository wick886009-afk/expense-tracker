# Aurelia — 16-Bit RPG AI Expense Tracker (Vercel + Supabase Cloud Sync)

A mobile-first personal expense tracker PWA with Indian bank SMS parsing (Kotak, HDFC, ICICI, SBI, Axis, UPI), manual transaction confirmation, budgets, analytics, interactive Minecraft Steve walkway, and live cross-device Supabase sync.

## Deploy to Vercel + Enable iPhone/Desktop Cloud Sync (4 Steps)

1. **Create a free Supabase project** at [supabase.com](https://supabase.com), open **SQL Editor**, and run `supabase/schema.sql`.
2. In Supabase, go to **Project Settings → API** and copy your **Project URL** and **anon public key**.
3. **Deploy to Vercel**: unzip this folder and push it to GitHub (or run `npx vercel`), using Framework Preset **Other** (no build command needed).
4. In **Vercel Project Settings → Environment Variables**, add:
   - `SUPABASE_URL` = your Supabase Project URL
   - `SUPABASE_ANON_KEY` = your Supabase anon public key
   - *(Optional)* `GEMINI_API_KEY` = enables the `/api/parse-sms` AI fallback for unfamiliar bank SMS templates
   Then **Redeploy**, open your Vercel link on iPhone & desktop, and sign in under **Settings → Cloud Sync**.

## Install on iPhone 16 Pro
Open your Vercel URL in Safari → tap **Share** → **Add to Home Screen**.
