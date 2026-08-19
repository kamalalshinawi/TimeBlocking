import type { Task } from '@/domain/types'
import { generateId, loadDatabase, nowIso, saveDatabase } from '@/storage/database'
import type { StorageAdapter } from '@/storage/adapter'
import type { TaskRepository } from '@/repositories/interfaces'

export function createLocalTaskRepository(adapter: StorageAdapter): TaskRepository {
  return {
    async getAll() {
      return loadDatabase(adapter).tasks
    },
    async getById(id) {
      return loadDatabase(adapter).tasks.find((task) => task.id === id) ?? null
    },
    async create(input) {
      const db = loadDatabase(adapter)
      const timestamp = nowIso()
      const task: Task = {
        id: generateId(),
        title: input.title,
        description: input.description ?? '',
        projectId: input.projectId ?? null,
        categoryId: input.categoryId ?? null,
        priority: input.priority ?? 'medium',
        subtasks: [],
        completedAt: null,
        createdAt: timestamp,
        updatedAt: timestamp,
      }
      db.tasks.push(task)
      saveDatabase(adapter, db)
      return task
    },
    async update(task) {
      const db = loadDatabase(adapter)
      const index = db.tasks.findIndex((existing) => existing.id === task.id)
      if (index === -1) throw new Error(`Task not found: ${task.id}`)
      const updated: Task = { ...task, updatedAt: nowIso() }
      db.tasks[index] = updated
      saveDatabase(adapter, db)
      return updated
    },
    async delete(id) {
      const db = loadDatabase(adapter)
      db.tasks = db.tasks.filter((task) => task.id !== id)
      saveDatabase(adapter, db)
    },
  }
}