# TimeBlocking

A **local-first** productivity suite that combines a **calendar**, **task manager**, **habit tracker**, and **pomodoro timer** around one core idea:

> A calendar tells you what you scheduled. TimeBlocking helps you actually do it.

Schedule a task as a block on the calendar — e.g. *“Study React Native, 6:00 PM → 7:30 PM”* — and TimeBlocking guides you through execution:

- **Before the block** → “Starts in 45 minutes”
- **During the block** → “ACTIVE — 01:30:00 remaining”
- **When you finish** → “COMPLETED”
- **If time runs out** → “OVERDUE”

You can **complete**, **extend**, or **reschedule** every block.

---

## Features

### Planning
- **Calendar** — day, week, and month views with drag-and-drop, resizing, and conflict detection
- **Time blocks** — schedule tasks as visual blocks with live state (`UPCOMING`, `ACTIVE`, `COMPLETED`, `OVERDUE`, `MISSED`)
- **Tasks** — search, filter, sort, priorities, projects, categories, and subtasks with progress
- **Projects & categories** — organize everything with colors

### Execution
- **Live countdown** — timestamp-based, survives refresh, tab switching, and computer sleep
- **Current / next task** — the dashboard and Today view always show what to do now
- **Extend & reschedule** — adjust blocks on the fly while preserving the original schedule

### Routines
- **Habit tracker** — daily / weekly / custom habits with streaks, completion stats, and a 12-week heatmap
- **Pomodoro timer** — timestamp-based focus/break timer with task linking, auto-start options, sound, and daily statistics

### Data
- **Local-first** — all data stays in your browser
- **Export / import** — versioned JSON backups with validation
- **Dark mode** — fully themed, system-aware

---

## Current Status

**Phases 0–12 are implemented** (project foundation through polish), plus two features built on top:

- **Feature 14 — Habit Tracker**
- **Feature 15 — Pomodoro Timer**

Phase 13 (cloud sync, calendar integrations, AI scheduling) is intentionally **not implemented** yet.

Google sign-in/sign-up/sign-out via **Supabase Auth** is implemented. It provides identity only — all application data stays local.

## Technology

| Layer | Technology |
| --- | --- |
| Framework | React 19 |
| Language | TypeScript |
| Build tool | Vite |
| Styling | Tailwind CSS (custom indigo design system) |
| UI components | shadcn/ui |
| Icons | Lucide |

All application data stays in the browser. Supabase is used only for Google sign-in, not for storing application data.

## Architecture

```
UI
 → Application Logic
 → Domain Logic
 → Repositories
 → Browser Storage
```

The repository layer isolates persistence. In the future it can be replaced with Supabase + PostgreSQL without rewriting the UI or business logic.

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for details.

## Documentation

| File | Purpose |
| --- | --- |
| [AGENTS.md](AGENTS.md) | Working rules for AI assistants and contributors |
| [docs/PRODUCT_SPEC.md](docs/PRODUCT_SPEC.md) | Product specification and V1 scope |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Technical architecture |
| [docs/DEVELOPMENT_PLAN.md](docs/DEVELOPMENT_PLAN.md) | Phased implementation roadmap |

## Development Setup

Requirements: Node.js (current LTS or newer) and npm.

```bash
npm install     # install dependencies
npm run dev     # start the dev server
```

## Google Sign-In Setup (Supabase)

The app signs in with Google through Supabase Auth. After creating your project:

1. **Add your credentials** — copy your project URL and anon key into `.env` (see `.env.example`).
2. **Enable Google** — in Supabase: Authentication → Providers → Google → enable, and paste your Google OAuth Client ID and Client Secret.
3. **Allow the app URL** — in Supabase: Authentication → URL Configuration. Set the Site URL and add your app URLs to Redirect URLs, e.g. `http://localhost:5173` and any deployed domain.
4. **Allow your Google account** — in Google Cloud Console → OAuth consent screen: if the app is in *Testing* mode, add the Google accounts you want to test with as **Test users**. Accounts that are not test users are blocked by Google, which looks like "it worked once, then nothing happens in another browser".

If a sign-in fails, the app shows the error returned by Google/Supabase on the login page instead of silently doing nothing.

### Deploying to Vercel

Your `.env` file is **not** uploaded to Vercel. If you deploy without the keys, the app crashes to a white page. Before/after deploying:

1. Vercel → your project → **Settings → Environment Variables**
2. Add both, one for each environment (Production/Preview):
   - `VITE_SUPABASE_URL` = `https://<your-project>.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = your anon key
3. **Redeploy** the project (Deployments → ⋯ → Redeploy).
4. Also add the production URL to Supabase → Authentication → URL Configuration → Redirect URLs (e.g. `https://your-app.vercel.app`).

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Type-check and build for production |
| `npm run typecheck` | Run the TypeScript type checker |
| `npm run test` | Run the Vitest test suite |
| `npm run lint` | Run the oxlint linter |
| `npm run preview` | Preview the production build |

## Roadmap

| Phase | Scope | Status |
| --- | --- | --- |
| 0 | Project Foundation | ✅ |
| 1 | Local Profile | ✅ |
| 2 | Local Data Layer | ✅ |
| 3 | Calendar MVP | ✅ |
| 4 | Calendar Interaction | ✅ |
| 5 | Time Block State Engine | ✅ |
| 6 | Countdown | ✅ |
| 7 | Task Execution | ✅ |
| 8 | Task Management | ✅ |
| 9 | Dashboard | ✅ |
| 10 | Today View | ✅ |
| 11 | Import/Export | ✅ |
| 12 | Polish, Responsive Design & Accessibility | ✅ |
| 13 | Future Features | ⏳ planned |
| 14 | Habit Tracker | ✅ |
| 15 | Pomodoro Timer | ✅ |

Full details in [docs/DEVELOPMENT_PLAN.md](docs/DEVELOPMENT_PLAN.md).

## License

Private project. No license specified.