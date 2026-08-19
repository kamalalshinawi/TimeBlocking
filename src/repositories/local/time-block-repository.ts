import type { TimeBlock } from '@/domain/types'
import { generateId, loadDatabase, nowIso, saveDatabase } from '@/storage/database'
import type { StorageAdapter } from '@/storage/adapter'
import type { TimeBlockRepository } from '@/repositories/interfaces'

export function createLocalTimeBlockRepository(
  adapter: StorageAdapter,
): TimeBlockRepository {
  return {
    async getAll() {
      return loadDatabase(adapter).timeBlocks
    },
    async getById(id) {
      return loadDatabase(adapter).timeBlocks.find((block) => block.id === id) ?? null
    },
    async create(input) {
      const db = loadDatabase(adapter)
      const timestamp = nowIso()
      const timeBlock: TimeBlock = {
        id: generateId(),
        taskId: input.taskId,
        startAt: input.startAt,
        endAt: input.endAt,
        completedAt: input.completedAt ?? null,
        originalStartAt: input.startAt,
        originalEndAt: input.endAt,
        extensionMinutes: input.extensionMinutes ?? 0,
        createdAt: timestamp,
        updatedAt: timestamp,
      }
      db.timeBlocks.push(timeBlock)
      saveDatabase(adapter, db)
      return timeBlock
    },
    async update(timeBlock) {
      const db = loadDatabase(adapter)
      const index = db.timeBlocks.findIndex((existing) => existing.id === timeBlock.id)
      if (index === -1) throw new Error(`Time block not found: ${timeBlock.id}`)
      const updated: TimeBlock = { ...timeBlock, updatedAt: nowIso() }
      db.timeBlocks[index] = updated
      saveDatabase(adapter, db)
      return updated
    },
    async delete(id) {
      const db = loadDatabase(adapter)
      db.timeBlocks = db.timeBlocks.filter((block) => block.id !== id)
      saveDatabase(adapter, db)
    },
  }
}