import type { Category, Project, Task, TimeBlock, UserProfile } from '@/domain/types'
import type { StorageAdapter } from '@/storage/adapter'

export const DATABASE_VERSION = 1
export const DATABASE_KEY = 'timeblocking.db'

export interface Database {
  version: number
  profile: UserProfile | null
  tasks: Task[]
  timeBlocks: TimeBlock[]
  projects: Project[]
  categories: Category[]
}

export function createEmptyDatabase(): Database {
  return {
    version: DATABASE_VERSION,
    profile: null,
    tasks: [],
    timeBlocks: [],
    projects: [],
    categories: [],
  }
}

const defaultCategories: Omit<Category, 'createdAt' | 'updatedAt'>[] = [
  { id: 'category-study', name: 'Study', color: '#3b82f6' },
  { id: 'category-work', name: 'Work', color: '#10b981' },
  { id: 'category-programming', name: 'Programming', color: '#8b5cf6' },
  { id: 'category-personal', name: 'Personal', color: '#f59e0b' },
  { id: 'category-exercise', name: 'Exercise', color: '#ef4444' },
  { id: 'category-other', name: 'Other', color: '#6b7280' },
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
  return {
    ...database,
    tasks: database.tasks.map((task) => ({
      ...task,
      completedAt: task.completedAt ?? null,
    })),
  }
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