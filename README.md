# TimeBlocking

A **local-first** calendar and task manager with **time-block execution**.

TimeBlocking combines a calendar and a task manager with live time-block execution. You schedule a task as a block on the calendar (for example "Study React Native, 6:00 PM → 7:30 PM") and TimeBlocking guides you through it:

- **Before the block** → "Starts in 45 minutes"
- **During the block** → "ACTIVE — 01:30:00 remaining"
- **When finished** → "COMPLETED"
- **If time runs out** → "OVERDUE"

You can **complete**, **extend**, or **reschedule** every block.

## Current Status

**Phases 0–12 are implemented** (project foundation through polish).

The application supports local profiles, calendar day/week/month views with drag-and-resize and conflict detection, a time-block state engine, live countdowns, task execution (complete/extend/reschedule), task management (projects, categories, priorities, subtasks), a dashboard, a today view, and JSON import/export.

Phase 13 (cloud sync, calendar integrations, AI scheduling) is intentionally **not implemented** yet.

Google sign-in/sign-up/sign-out via **Supabase Auth** is implemented. It provides identity only — all application data stays local.

## Technology

| Layer | Technology |
| --- | --- |
| Framework | React 19 |
| Language | TypeScript |
| Build tool | Vite |
| Styling | Tailwind CSS |
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

If a sign-in fails, the app now shows the error returned by Google/Supabase on the login page instead of silently doing nothing.

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

Full details in [docs/DEVELOPMENT_PLAN.md](docs/DEVELOPMENT_PLAN.md).

## License

Private project. No license specified.