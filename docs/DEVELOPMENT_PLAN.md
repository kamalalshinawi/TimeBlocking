# TimeBlocking Development Plan

This document is the source of truth for implementation order.

Work is strictly phase-by-phase.

Do not build multiple phases at once.

After a phase is verified and accepted, move to the next phase.

## Status

Phases 0 through 12 are implemented and verified.

Google authentication with Supabase (sign in, sign up, sign out) has been implemented on top of the completed phases. It provides identity only; all application data remains local.

Phase 13 lists future features and must not be implemented in V1.

---

# Phase 0 — Project Foundation

### Goal

Establish a professional, working project foundation that every later phase builds on.

### Features

* React + TypeScript + Vite project
* Tailwind CSS configured
* shadcn/ui configured
* base UI components available
* path alias (`@/*`) configured
* folder structure per `docs/ARCHITECTURE.md`
* linting and type checking scripts
* production build script
* documentation (`AGENTS.md`, `docs/`)

### Acceptance Criteria

- [ ] `npm run dev` starts a local dev server
- [ ] `npm run typecheck` passes with no errors
- [ ] `npm run lint` passes with no errors
- [ ] `npm run build` produces a production bundle
- [ ] shadcn/ui components render correctly in light and dark mode
- [ ] folder structure matches `docs/ARCHITECTURE.md`
- [ ] project documentation exists and is accurate

### Not Included

* Routing
* Application shell / navigation
* Theme system
* Local profile
* Any product feature

---

# Phase 1 — Local Profile

### Goal

Let the user create and edit a local profile so the application is personalized.

### Features

* first launch screen
* profile creation
* profile editing
* settings
* local persistence through a repository

### Acceptance Criteria

- [ ] first launch asks for profile details
- [ ] profile can be edited later
- [ ] refresh preserves the profile
- [ ] browser restart preserves the profile
- [ ] no passwords or fake authentication anywhere

### Not Included

* Real authentication
* Cloud synchronization
* Backend storage

---

# Phase 2 — Local Data Layer

### Goal

Build the persistence foundation that all features depend on.

### Features

* TypeScript domain models
* repository interfaces
* local repository implementations
* storage abstraction
* schema versioning

Entities:

* Task
* TimeBlock
* Project
* Category
* Subtask

### Acceptance Criteria

- [ ] repositories expose create/read/update/delete operations
- [ ] UI components never call `localStorage` directly
- [ ] data survives refresh and browser restart
- [ ] schema versioning is in place
- [ ] the storage layer can be replaced without rewriting business logic

### Not Included

* Calendar UI
* Any screen using the data yet

---

# Phase 3 — Calendar MVP

### Goal

Render the calendar so the user can see and manage time blocks.

### Features

* Day view
* Week view
* Month view
* time grid
* current time indicator
* create time block
* edit time block
* delete time block

### Acceptance Criteria

- [ ] day, week, and month views render correctly
- [ ] block position represents start time
- [ ] block height represents duration
- [ ] a new block can be created, edited, and deleted
- [ ] changes persist across refresh
- [ ] current time indicator updates automatically

### Not Included

* Drag and drop
* Conflict detection
* Countdown
* Task execution

---

# Phase 4 — Calendar Interaction

### Goal

Make the calendar interactive and safe to edit by hand.

### Features

* drag and drop
* resize duration
* move between days
* conflict detection
* accessible keyboard alternatives

### Acceptance Criteria

- [ ] blocks can be moved with drag and drop
- [ ] blocks can be resized
- [ ] blocks can be moved between days
- [ ] overlapping blocks produce a conflict warning
- [ ] no block is silently overwritten
- [ ] drag and drop is not the only way to edit a block
- [ ] all changes persist locally

### Not Included

* Time block state engine
* Countdown

---

# Phase 5 — Time Block State Engine

### Goal

Centralize how a time block's state is computed.

### Features

* state derivation from timestamps
* states: `UPCOMING`, `ACTIVE`, `COMPLETED`, `OVERDUE`, `MISSED`
* single reusable state engine
* unit tests for every state and edge case

### Acceptance Criteria

- [ ] all states are produced by one shared function
- [ ] state changes automatically as time passes
- [ ] state survives refresh
- [ ] unit tests cover midnight, boundaries, and negative time

### Not Included

* Countdown UI
* Task execution actions

---

# Phase 6 — Countdown

### Goal

Show a live, timestamp-based countdown without slowing down the app.

### Features

* starts-in countdown
* active countdown
* overdue duration
* timestamp-based calculation
* efficient per-second updates

### Acceptance Criteria

- [ ] countdown updates once per second
- [ ] only countdown components rerender each second
- [ ] countdown survives refresh, tab switch, and computer sleep
- [ ] the countdown is derived from timestamps, never stored as a counter

### Not Included

* Completing or rescheduling tasks

---

# Phase 7 — Task Execution

### Goal

Let the user execute, finish, and adjust time blocks.

### Features

* current task display
* complete task
* extend task
* reschedule task
* record actual duration

### Acceptance Criteria

- [ ] the active task is clearly identified
- [ ] completing a task records `startedAt` and `completedAt`
- [ ] extending adds time while preserving the original schedule
- [ ] rescheduling updates the schedule
- [ ] completed, overdue, and missed tasks appear correctly
- [ ] all actions persist and survive refresh

### Not Included

* Task list management
* Dashboard

---

# Phase 8 — Task Management

### Goal

Manage the full task library beyond the calendar.

### Features

* task list
* filters
* search
* projects
* categories
* priorities
* subtasks

### Acceptance Criteria

- [ ] tasks can be searched, filtered, and sorted
- [ ] tasks can be assigned projects, categories, and priorities
- [ ] tasks support subtasks with progress display
- [ ] project references are validated
- [ ] changes persist locally

### Not Included

* Dashboard
* Today view

---

# Phase 9 — Dashboard

### Goal

Give the user an immediate overview of what to do now.

### Features

* current task
* countdown
* next task
* today's summary
* completion percentage

### Acceptance Criteria

- [ ] current task and countdown are immediately visible
- [ ] next task is clearly identified
- [ ] today's statistics are accurate
- [ ] dashboard reuses the shared state engine and countdown logic

### Not Included

* Analytics beyond the daily summary

---

# Phase 10 — Today View

### Goal

Provide a focused, execution-oriented view of today's schedule.

### Features

* daily timeline
* current task
* upcoming tasks
* completed tasks
* automatic current-time scrolling

### Acceptance Criteria

- [ ] today's timeline shows all scheduled blocks
- [ ] current task and upcoming tasks are visible
- [ ] view scrolls toward the current time automatically
- [ ] state and countdown reuse shared logic

### Not Included

* Import/export
* Final polish

---

# Phase 11 — Import/Export

### Goal

Give the user full ownership of their data.

### Features

* export JSON
* import JSON
* validation
* schema versioning
* clear all data with confirmation

### Acceptance Criteria

- [ ] export produces a versioned JSON backup
- [ ] import validates the structure before loading
- [ ] corrupted imports are rejected, never silently accepted
- [ ] clear all data requires confirmation

### Not Included

* Cloud backup
* Multi-device sync

---

# Phase 12 — Polish, Responsive Design & Accessibility

### Goal

Make the application professional on every device and for every user.

### Features

* responsive design
* mobile experience
* accessibility
* keyboard shortcuts
* empty states
* loading states
* error states
* dark mode
* animations where useful

### Acceptance Criteria

- [ ] desktop, laptop, tablet, and mobile layouts work well
- [ ] mobile prioritizes current task, today, upcoming, calendar
- [ ] keyboard navigation works throughout
- [ ] drag-and-drop has keyboard alternatives
- [ ] focus states are visible
- [ ] color contrast meets accessibility requirements
- [ ] dark mode is consistent across the application

### Not Included

* New product features

---

# Phase 13 — Future Features

### Goal

Keep the architecture ready for future versions without building them now.

### Features

Do not implement yet.

Potential future work:

* cloud sync
* multi-device sync
* notifications
* recurring tasks
* Google Calendar
* Outlook
* Apple Calendar
* AI scheduling
* shared calendars
* team collaboration

Google authentication (Supabase Auth) is already implemented and is not part of this phase.

### Acceptance Criteria

- [ ] none of these features exist in V1
- [ ] the repository layer makes a future backend swap possible

### Not Included

* Everything listed above