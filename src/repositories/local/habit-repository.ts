import type { Habit, HabitCompletion } from '@/domain/types'
import { generateId, loadDatabase, nowIso, saveDatabase } from '@/storage/database'
import type { StorageAdapter } from '@/storage/adapter'
import type { HabitCompletionRepository, HabitRepository, NewHabitCompletion } from '@/repositories/interfaces'

export function createLocalHabitRepository(adapter: StorageAdapter): HabitRepository {
  return {
    async getAll() {
      return loadDatabase(adapter).habits
    },
    async getById(id) {
      return loadDatabase(adapter).habits.find((habit) => habit.id === id) ?? null
    },
    async create(input) {
      const db = loadDatabase(adapter)
      const timestamp = nowIso()
      const habit: Habit = {
        id: generateId(),
        name: input.name,
        description: input.description ?? '',
        color: input.color ?? '#4f46e5',
        icon: input.icon ?? 'Sparkles',
        frequency: input.frequency ?? 'daily',
        daysOfWeek: input.daysOfWeek ?? [],
        weeklyTarget: input.weeklyTarget ?? 3,
        archived: false,
        createdAt: timestamp,
        updatedAt: timestamp,
      }
      db.habits.push(habit)
      saveDatabase(adapter, db)
      return habit
    },
    async update(habit) {
      const db = loadDatabase(adapter)
      const index = db.habits.findIndex((existing) => existing.id === habit.id)
      if (index === -1) throw new Error(`Habit not found: ${habit.id}`)
      const updated: Habit = { ...habit, updatedAt: nowIso() }
      db.habits[index] = updated
      saveDatabase(adapter, db)
      return updated
    },
    async delete(id) {
      const db = loadDatabase(adapter)
      db.habits = db.habits.filter((habit) => habit.id !== id)
      saveDatabase(adapter, db)
    },
  }
}

export function createLocalHabitCompletionRepository(adapter: StorageAdapter): HabitCompletionRepository {
  return {
    async getAll() {
      return loadDatabase(adapter).habitCompletions
    },
    async create(input: NewHabitCompletion) {
      const db = loadDatabase(adapter)
      const completion: HabitCompletion = {
        id: generateId(),
        habitId: input.habitId,
        date: input.date,
        completedAt: nowIso(),
      }
      db.habitCompletions.push(completion)
      saveDatabase(adapter, db)
      return completion
    },
    async delete(id) {
      const db = loadDatabase(adapter)
      db.habitCompletions = db.habitCompletions.filter((completion) => completion.id !== id)
      saveDatabase(adapter, db)
    },
    async deleteForHabit(habitId) {
      const db = loadDatabase(adapter)
      db.habitCompletions = db.habitCompletions.filter((completion) => completion.habitId !== habitId)
      saveDatabase(adapter, db)
    },
  }
}