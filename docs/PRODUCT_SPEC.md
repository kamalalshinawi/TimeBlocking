# TimeBlocking — Product Specification

## 1. Product Overview

TimeBlocking is a local-first productivity application that combines:

* Calendar
* Task management
* Time blocking
* Live countdown
* Task execution tracking
* Daily planning
* Productivity statistics

The core difference from a traditional calendar is:

> A calendar tells the user what they scheduled. TimeBlocking actively helps the user execute the scheduled task.

---

# 2. Core User Experience

A user creates:

**Study React Native**

Date:

**August 20**

Time:

**6:00 PM → 7:30 PM**

The task appears as a visual block on the calendar.

Before 6:00 PM:

`Starts in 45 minutes`

At 6:00 PM:

`ACTIVE`

`01:30:00 remaining`

When the user finishes:

`COMPLETED`

The application records:

* planned duration
* actual duration
* start time
* completion time

If the user does not finish:

`OVERDUE`

The user can:

* Complete
* Extend
* Reschedule

---

# 3. V1 Scope

V1 must include:

* Local profile
* Google sign in / sign up
* Sign out
* Calendar
* Day view
* Week view
* Month view
* Tasks
* Time blocks
* Projects
* Categories
* Priorities
* Subtasks
* Live countdown
* Current task
* Upcoming task
* Completed tasks
* Missed tasks
* Overdue tasks
* Extend task
* Reschedule task
* Today view
* Dashboard
* Local persistence
* Export data
* Import data
* Dark mode
* Responsive UI

---

# 4. V1 Explicitly Excludes

Do NOT implement:

* PostgreSQL
* Backend
* Cloud synchronization
* Multi-device sync
* Google Calendar integration
* Apple Calendar integration
* Outlook integration
* AI assistant
* Team collaboration
* Shared calendars

These belong to future versions.

Authentication via Supabase (Google OAuth) is implemented for identity only. All application data remains local in the browser.

---

# 5. Local Profile

On first launch:

Ask for:

* Name
* Optional email
* Avatar
* Timezone
* Time format

When the user signs in with Google, the name and email fields are pre-filled from the Google account.

The profile is local only.

Do not store passwords.

Google authentication (Supabase) is used for sign-in identity only and must not be described as secure account authentication.

---

# 6. Calendar

Support:

* Day
* Week
* Month

Week view is the primary desktop experience.

Calendar blocks must be positioned according to:

* start time
* end time

The block height should represent duration.

---

# 7. Time Block

A time block represents a task scheduled for a specific period.

Required:

* title
* date
* start time
* end time

Optional:

* description
* project
* category
* priority
* subtasks
* reminder
* recurrence

---

# 8. Time Block States

The application must support:

`UPCOMING`

`ACTIVE`

`COMPLETED`

`OVERDUE`

`MISSED`

State must be derived from timestamps and completion information.

Do not duplicate state logic throughout the application.

Create one reusable state engine.

---

# 9. Countdown

Upcoming:

`Starts in 42 minutes`

Active:

`01:23:42 remaining`

Overdue:

`Overdue by 15 minutes`

The countdown must:

* update every second
* survive refresh
* survive tab switching
* remain timestamp-based
* not depend on an increment/decrement counter

---

# 10. Active Task

The active task should be visually prominent.

Show:

* title
* start time
* end time
* countdown
* progress
* Complete
* Extend
* Reschedule

---

# 11. Completion

When a task is completed, record:

* startedAt
* completedAt
* plannedDuration
* actualDuration

Completed tasks remain visible in the calendar.

---

# 12. Extension

Allow:

* +15 minutes
* +30 minutes
* +60 minutes
* custom duration

Preserve the original scheduled end time.

Record extension duration.

---

# 13. Rescheduling

Allow:

* Later today
* Tomorrow
* Custom date/time

Preserve original schedule for future analytics.

---

# 14. Tasks

Task page:

* All
* Today
* Upcoming
* Completed
* Missed
* Overdue

Support:

* search
* filtering
* sorting
* priority
* project
* category

---

# 15. Projects

Projects organize tasks.

Example:

* React Native App
* University
* Freelancing
* Personal

Each project has:

* name
* description
* color
* createdAt
* updatedAt

---

# 16. Categories

Default categories:

* Study
* Work
* Programming
* Personal
* Exercise
* Other

Users can create custom categories.

---

# 17. Subtasks

Tasks can contain subtasks.

Example:

Study React Native

* Navigation
* Components
* State management
* API requests

Display progress:

`2 / 4 — 50%`

---

# 18. Dashboard

Dashboard must immediately show:

### Current task

What should the user be doing now?

### Countdown

How much time remains?

### Next task

What comes next?

Also show:

* today's task count
* completed tasks
* planned duration
* completed duration
* completion percentage

---

# 19. Today View

Today is optimized for execution.

Show a timeline containing:

* all scheduled tasks
* current time
* current task
* upcoming tasks
* completed tasks

Automatically scroll toward the current time.

---

# 20. Current Time

Day and Week views display a current-time indicator.

It should update automatically.

---

# 21. Drag and Drop

Support:

* move task
* resize duration
* change day
* change start time
* change end time

All changes must persist locally.

Provide accessible alternatives to drag-and-drop.

---

# 22. Conflict Detection

Detect overlapping blocks.

Example:

6:00 → 7:30

and

7:00 → 8:00

Show a conflict warning.

Never silently overwrite a block.

---

# 23. Data Persistence

Data must survive:

* refresh
* browser restart
* navigation

Use a dedicated storage abstraction.

The storage implementation may use:

* localStorage for simple data
* IndexedDB if structured data becomes too large

Do not let components directly depend on the storage technology.

---

# 24. Backup

Provide:

**Export Data**

Exports a versioned JSON backup.

Provide:

**Import Data**

Validate the imported structure before loading it.

Provide:

**Clear All Data**

Require confirmation.

---

# 25. Responsive Design

Desktop:

Calendar-first experience.

Mobile:

Prioritize:

1. Current task
2. Today
3. Upcoming tasks
4. Calendar

Do not merely shrink the desktop interface.

---

# 26. Accessibility

Support:

* keyboard navigation
* focus states
* semantic HTML
* accessible dialogs
* accessible buttons
* sufficient contrast
* screen readers where appropriate

---

# 27. Future V2

The architecture should make it possible to add:

* PostgreSQL
* Cloud sync
* Multi-device sync
* Google Calendar
* Outlook
* Apple Calendar
* AI scheduling
* notifications
* shared calendars

Do not implement these now.

