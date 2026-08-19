import type { PomodoroSession } from '@/domain/types'
import { loadDatabase, nowIso, saveDatabase } from '@/storage/database'
import type { StorageAdapter } from '@/storage/adapter'
import type {
  ActivePomodoroRepository,
  PomodoroSessionRepository,
  PomodoroSettingsRepository,
} from '@/repositories/interfaces'

export function createLocalPomodoroSettingsRepository(adapter: StorageAdapter): PomodoroSettingsRepository {
  return {
    async get() {
      return loadDatabase(adapter).pomodoroSettings
    },
    async save(settings) {
      const db = loadDatabase(adapter)
      db.pomodoroSettings = { ...settings }
      saveDatabase(adapter, db)
      return db.pomodoroSettings
    },
  }
}

export function createLocalPomodoroSessionRepository(adapter: StorageAdapter): PomodoroSessionRepository {
  return {
    async getAll() {
      return loadDatabase(adapter).pomodoroSessions
    },
    async create(session) {
      const db = loadDatabase(adapter)
      const record: PomodoroSession = { ...session, updatedAt: nowIso() }
      db.pomodoroSessions.push(record)
      saveDatabase(adapter, db)
      return record
    },
  }
}

export function createLocalActivePomodoroRepository(adapter: StorageAdapter): ActivePomodoroRepository {
  return {
    async get() {
      return loadDatabase(adapter).activePomodoro
    },
    async save(state) {
      const db = loadDatabase(adapter)
      db.activePomodoro = state
      saveDatabase(adapter, db)
      return db.activePomodoro
    },
  }
}