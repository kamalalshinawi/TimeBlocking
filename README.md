# TimeBlocking

A **local-first** calendar and task manager with **time-block execution**.

TimeBlocking combines a calendar and a task manager with live time-block execution. You schedule a task as a block on the calendar (for example "Study React Native, 6:00 PM → 7:30 PM") and TimeBlocking guides you through it:

- **Before the block** → "Starts in 45 minutes"
- **During the block** → "ACTIVE — 01:30:00 remaining"
- **When finished** → "COMPLETED"
- **If time runs out** → "OVERDUE"

You can **complete**, **extend**, or **reschedule** every block.

## Current Status

**Phase 0 — Project Foundation** is in progress.

The project foundation and documentation are established. No product features (calendar, tasks, countdown, dashboard) are implemented yet.

## Technology

| Layer | Technology |
| --- | --- |
| Framework | React 19 |
| Language | TypeScript |
| Build tool | Vite |
| Styling | Tailwind CSS |
| UI components | shadcn/ui |
| Icons | Lucide |

All data stays in the browser. There is no backend.

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

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Type-check and build for production |
| `npm run typecheck` | Run the TypeScript type checker |
| `npm run lint` | Run the oxlint linter |
| `npm run preview` | Preview the production build |

## Roadmap

| Phase | Scope |
| --- | --- |
| 0 | Project Foundation |
| 1 | Local Profile |
| 2 | Local Data Layer |
| 3 | Calendar MVP |
| 4 | Calendar Interaction |
| 5 | Time Block State Engine |
| 6 | Countdown |
| 7 | Task Execution |
| 8 | Task Management |
| 9 | Dashboard |
| 10 | Today View |
| 11 | Import/Export |
| 12 | Polish, Responsive Design & Accessibility |
| 13 | Future Features |

Full details in [docs/DEVELOPMENT_PLAN.md](docs/DEVELOPMENT_PLAN.md).

## License

Private project. No license specified.