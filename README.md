# Aurelia — Liquid Glass AI Expense Tracker (Vercel-Ready)

A mobile-first Liquid Glass personal finance PWA with deterministic Indian bank SMS parsing (Kotak, HDFC, ICICI, SBI, Axis, UPI), manual transaction confirmation, budgets, analytics, recurring bills, and optional server-side AI fallback.

## Deploy to Vercel in 2 Minutes

1. **Unzip** this folder and push it to a GitHub repository (or run `npx vercel` inside the folder).
2. In **Vercel Dashboard**, import the repository (Framework Preset: **Other** — zero build step required).
3. *(Optional)* Add `GEMINI_API_KEY` under **Project Settings → Environment Variables** to enable the `/api/parse-sms` server-side AI fallback for unfamiliar SMS templates. Without an API key, the app runs 100% locally using the built-in Indian bank regex + heuristic engine and browser storage.

## Install on iPhone 16 Pro
Open your deployed Vercel URL in Safari → tap **Share** → **Add to Home Screen**.
