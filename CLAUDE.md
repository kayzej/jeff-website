# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start dev server (port 3000)
npm run build        # Production build
npm start            # Start production server (port 8081)
npm run lint         # Lint
npm run lint:fix     # Lint and auto-fix
npm run prettier     # Format all files
```

## Pre-commit

Always run before committing:

```bash
npm run lint:fix
npm run prettier
```

## Deployment

Vercel auto-deploys on push to `master`. Development happens on `dev` — merge into `master` to deploy.

Only merge `dev` into `master` and push when the user explicitly asks to deploy or push to production. "commit and push" means push to `dev` only.

## Architecture

**Next.js 15 App Router** personal website with a health tracking dashboard.

### Pages

- `/` — Home (hero layout with animated background)
- `/about` — About page
- `/dailyLog` — Health logging interface (renders `DailyLogForm`)

### API Routes (`src/app/api/`)

Three routes, all GET (fetch by `?date=`) + POST (upsert):

- `/api/daily` — Daily log (sleep, exercise, timestamps, reflections)
- `/api/period` — Period log (mood, symptoms) — up to 4 entries/day keyed by period
- `/api/medications` — Medication log — batch upsert per period

All routes use a module-level `pg.Pool` with `DATABASE_URL` and `ssl: { rejectUnauthorized: false }`. The medications POST uses a transaction via `pool.connect()` / `pgClient.release()`.

### Database

TimescaleDB (Tiger Cloud) with schema `health`. Three tables:

- `health.daily_log` — one row per date
- `health.period_log` — up to 4 rows/day (period enum: morning/afternoon/evening/night)
- `health.medication_log` — one row per medication per period per date

Schema is in `setup.sql`. Column naming is snake_case in DB, camelCase in API responses (mapped via SQL aliases).

### DailyLogForm (`src/components/DailyLogForm.tsx`)

Large client component (~750 lines). Three independent sections — Daily, Period Log, Medications — each with their own fetch/submit/status state. All three are fetched on mount and on date change. Styles are defined inline via a `<style>` tag using DM Serif Display + DM Mono fonts.

### Path Alias

`@/*` → `./src/*`

## Environment

Requires `.env.local` with:

```
DATABASE_URL=postgres://user:password@host/dbname?sslmode=require
NODE_TLS_REJECT_UNAUTHORIZED=0
```
