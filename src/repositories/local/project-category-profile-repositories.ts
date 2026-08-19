import type { Category, Project, UserProfile } from '@/domain/types'
import { generateId, loadDatabase, nowIso, saveDatabase } from '@/storage/database'
import type { StorageAdapter } from '@/storage/adapter'
import type {
  CategoryRepository,
  NewCategory,
  NewProject,
  ProfileRepository,
  ProjectRepository,
} from '@/repositories/interfaces'

export function createLocalProjectRepository(adapter: StorageAdapter): ProjectRepository {
  return {
    async getAll() {
      return loadDatabase(adapter).projects
    },
    async getById(id) {
      return loadDatabase(adapter).projects.find((project) => project.id === id) ?? null
    },
    async create(input: NewProject) {
      const db = loadDatabase(adapter)
      const timestamp = nowIso()
      const project: Project = {
        id: generateId(),
        name: input.name,
        description: input.description ?? '',
        color: input.color ?? '#3b82f6',
        createdAt: timestamp,
        updatedAt: timestamp,
      }
      db.projects.push(project)
      saveDatabase(adapter, db)
      return project
    },
    async update(project) {
      const db = loadDatabase(adapter)
      const index = db.projects.findIndex((existing) => existing.id === project.id)
      if (index === -1) throw new Error(`Project not found: ${project.id}`)
      const updated: Project = { ...project, updatedAt: nowIso() }
      db.projects[index] = updated
      saveDatabase(adapter, db)
      return updated
    },
    async delete(id) {
      const db = loadDatabase(adapter)
      db.projects = db.projects.filter((project) => project.id !== id)
      saveDatabase(adapter, db)
    },
  }
}

export function createLocalCategoryRepository(adapter: StorageAdapter): CategoryRepository {
  return {
    async getAll() {
      return loadDatabase(adapter).categories
    },
    async getById(id) {
      return loadDatabase(adapter).categories.find((category) => category.id === id) ?? null
    },
    async create(input: NewCategory) {
      const db = loadDatabase(adapter)
      const timestamp = nowIso()
      const category: Category = {
        id: generateId(),
        name: input.name,
        color: input.color ?? '#6b7280',
        createdAt: timestamp,
        updatedAt: timestamp,
      }
      db.categories.push(category)
      saveDatabase(adapter, db)
      return category
    },
    async update(category) {
      const db = loadDatabase(adapter)
      const index = db.categories.findIndex((existing) => existing.id === category.id)
      if (index === -1) throw new Error(`Category not found: ${category.id}`)
      const updated: Category = { ...category, updatedAt: nowIso() }
      db.categories[index] = updated
      saveDatabase(adapter, db)
      return updated
    },
    async delete(id) {
      const db = loadDatabase(adapter)
      db.categories = db.categories.filter((category) => category.id !== id)
      saveDatabase(adapter, db)
    },
  }
}

export function createLocalProfileRepository(adapter: StorageAdapter): ProfileRepository {
  return {
    async get() {
      return loadDatabase(adapter).profile
    },
    async save(profile: UserProfile) {
      const db = loadDatabase(adapter)
      const updated: UserProfile = { ...profile, updatedAt: nowIso() }
      db.profile = updated
      saveDatabase(adapter, db)
      return updated
    },
  }
}