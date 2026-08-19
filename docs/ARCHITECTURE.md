# TimeBlocking Architecture

## 1. Architecture Style

Use a clean frontend architecture with clear separation between:

```text
UI
 ↓
Application Logic
 ↓
Domain Logic
 ↓
Repositories
 ↓
Local Storage
```

---

# 2. Suggested Structure

Use a feature-oriented structure where practical.

```text
src/
├── app/
│   ├── routes/
│   └── providers/
│
├── components/
│   ├── ui/
│   └── shared/
│
├── features/
│   ├── calendar/
│   ├── tasks/
│   ├── projects/
│   ├── categories/
│   ├── dashboard/
│   ├── profile/
│   └── settings/
│
├── domain/
│   ├── tasks/
│   ├── time-blocks/
│   ├── projects/
│   └── calendar/
│
├── repositories/
│   ├── interfaces/
│   └── local/
│
├── storage/
│
├── hooks/
│
├── utils/
│   ├── date/
│   ├── time/
│   └── validation/
│
├── types/
│
└── lib/
```

Do not blindly follow this structure if the actual project setup makes a simpler structure more appropriate.

---

# 3. Domain Models

Core entities:

```text
UserProfile
Task
TimeBlock
Project
Category
Subtask
Settings
```

---

# 4. Repository Layer

The UI must not directly depend on localStorage or IndexedDB.

Example:

```ts
interface TaskRepository {
  getAll(): Promise<Task[]>;
  getById(id: string): Promise<Task | null>;
  create(task: Task): Promise<Task>;
  update(task: Task): Promise<Task>;
  delete(id: string): Promise<void>;
}
```

V1:

```text
TaskRepository
      ↓
LocalTaskRepository
      ↓
Browser Storage
```

Future:

```text
TaskRepository
      ↓
SupabaseTaskRepository
      ↓
Supabase
```

---

# 5. Business Logic

Important business logic must be reusable.

Examples:

```text
getTimeBlockStatus()
calculateRemainingTime()
calculateProgress()
calculateActualDuration()
detectConflicts()
findNextTask()
getCurrentTask()
```

These functions should not be tied to a specific UI component.

---

# 6. Time Block State Engine

The state engine is central to the application.

Input:

* time block
* current timestamp

Output:

```text
UPCOMING
ACTIVE
COMPLETED
OVERDUE
MISSED
```

All features should use the same state engine.

---

# 7. Countdown Architecture

Use a timestamp-based countdown.

The current timestamp is the source of truth.

The timer hook may trigger UI updates every second.

Do not update the entire application every second.

---

# 8. State Management

Use the simplest appropriate state-management approach.

Do not introduce Redux unless the application genuinely requires it.

Prefer:

* React state
* context where appropriate
* feature-level state
* repository data

Avoid global state for data that does not need to be global.

---

# 9. Persistence

All persistence must go through repositories.

Never do this inside UI components:

```ts
localStorage.setItem(...)
```

Instead:

```ts
taskRepository.create(task)
```

---

# 10. Date and Time

Internally use timestamp-based representations.

Create reusable date/time utilities.

Avoid scattering date calculations throughout components.

---

# 11. Testing Strategy

Prefer unit tests for domain logic and business rules.

The goal is fast, isolated tests that do not require a browser or a running server.

### What to test

The most important business logic to unit test:

```text
getTimeBlockStatus()        state calculation for every state
calculateRemainingTime()    countdown math
calculateProgress()         partial and completed progress
calculateActualDuration()   planned vs actual duration
detectConflicts()           overlapping time blocks
findCurrentTask()           selection of the active block
findNextTask()              selection of the upcoming block
rescheduling rules          moving blocks between days/times
completion rules            recording startedAt/completedAt
```

### Edge cases

Test dates and times thoroughly:

```text
* midnight boundaries
* end of day
* daylight saving transitions
* blocks spanning midnight
* equal start and end times
* end before start (invalid input)
* negative remaining time
* refresh / sleep / inactive tab recovery
```

### Test placement

Keep tests close to the code they verify:

```text
src/domain/time-blocks/__tests__/
src/domain/tasks/__tests__/
src/utils/date/__tests__/
src/utils/time/__tests__/
```

### What not to test heavily

Do not write many UI snapshot tests.

Do not test implementation details.

Prefer testing behavior and business rules over render output.

### Tooling

Use a minimal, standard test setup:

```text
Vitest    test runner
React Testing Library   component tests where needed
```

Do not add heavy test infrastructure unless a demonstrated need exists.

---

# 12. Future Migration

The architecture must allow:

```text
V1

React
 ↓
Repositories
 ↓
Local Storage


V2

React
 ↓
Repositories
 ↓
Supabase
 ↓
PostgreSQL
```

The goal is to replace the persistence implementation rather than rewrite the application.

