import type {
  Category,
  Habit,
  HabitCompletion,
  PomodoroSession,
  PomodoroSettings,
  PomodoroState,
  Project,
  Task,
  TimeBlock,
  UserProfile,
} from '@/domain/types'
import type { StorageAdapter } from '@/storage/adapter'

export const DATABASE_VERSION = 3
export const DATABASE_KEY = 'timeblocking.db'

export interface Database {
  version: number
  profile: UserProfile | null
  tasks: Task[]
  timeBlocks: TimeBlock[]
  projects: Project[]
  categories: Category[]
  habits: Habit[]
  habitCompletions: HabitCompletion[]
  pomodoroSettings: PomodoroSettings
  pomodoroSessions: PomodoroSession[]
  activePomodoro: PomodoroState
}

export const DEFAULT_POMODORO_SETTINGS: PomodoroSettings = {
  focusMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  longBreakInterval: 4,
  autoStartBreaks: false,
  autoStartFocus: false,
  dailyFocusGoal: 8,
  soundEnabled: true,
}

export function createEmptyPomodoroState(): PomodoroState {
  return { activeSession: null, focusCycleCount: 0 }
}

export function createEmptyDatabase(): Database {
  return {
    version: DATABASE_VERSION,
    profile: null,
    tasks: [],
    timeBlocks: [],
    projects: [],
    categories: [],
    habits: [],
    habitCompletions: [],
    pomodoroSettings: { ...DEFAULT_POMODORO_SETTINGS },
    pomodoroSessions: [],
    activePomodoro: createEmptyPomodoroState(),
  }
}

const defaultCategories: Omit<Category, 'createdAt' | 'updatedAt'>[] = [
  { id: 'category-study', name: 'Study', color: '#4f46e5' },
  { id: 'category-work', name: 'Work', color: '#0d9488' },
  { id: 'category-programming', name: 'Programming', color: '#7c3aed' },
  { id: 'category-personal', name: 'Personal', color: '#d97706' },
  { id: 'category-exercise', name: 'Exercise', color: '#e11d48' },
  { id: 'category-other', name: 'Other', color: '#64748b' },
]

export function createSeedDatabase(): Database {
  const now = new Date().toISOString()
  const categories = defaultCategories.map((category) => ({
    ...category,
    createdAt: now,
    updatedAt: now,
  }))
  return { ...createEmptyDatabase(), categories }
}

export function isValidDatabase(value: unknown): value is Database {
  if (typeof value !== 'object' || value === null) return false
  const db = value as Record<string, unknown>
  return (
    typeof db.version === 'number' &&
    Array.isArray(db.tasks) &&
    Array.isArray(db.timeBlocks) &&
    Array.isArray(db.projects) &&
    Array.isArray(db.categories)
  )
}

export function loadDatabase(adapter: StorageAdapter): Database {
  const raw = adapter.getItem(DATABASE_KEY)
  if (raw === null) {
    const seeded = createSeedDatabase()
    adapter.setItem(DATABASE_KEY, JSON.stringify(seeded))
    return seeded
  }
  try {
    const parsed: unknown = JSON.parse(raw)
    if (!isValidDatabase(parsed)) {
      throw new Error('Stored database failed validation')
    }
    return migrateDatabase(parsed)
  } catch {
    const seeded = createSeedDatabase()
    adapter.setItem(DATABASE_KEY, JSON.stringify(seeded))
    return seeded
  }
}

function migrateDatabase(database: Database): Database {
  const migrated: Database = {
    ...database,
    tasks: database.tasks.map((task) => ({
      ...task,
      completedAt: task.completedAt ?? null,
    })),
    habits: database.habits ?? [],
    habitCompletions: database.habitCompletions ?? [],
    pomodoroSettings: database.pomodoroSettings ?? { ...DEFAULT_POMODORO_SETTINGS },
    pomodoroSessions: database.pomodoroSessions ?? [],
    activePomodoro: database.activePomodoro ?? createEmptyPomodoroState(),
  }
  migrated.version = DATABASE_VERSION
  return migrated
}

export function saveDatabase(adapter: StorageAdapter, database: Database): void {
  adapter.setItem(DATABASE_KEY, JSON.stringify(database))
}

export function clearDatabase(adapter: StorageAdapter): void {
  adapter.removeItem(DATABASE_KEY)
}

export function generateId(): string {
  return crypto.randomUUID()
}

export function nowIso(): string {
  return new Date().toISOString()
}