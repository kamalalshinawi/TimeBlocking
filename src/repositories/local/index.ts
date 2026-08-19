import type { StorageAdapter } from '@/storage/adapter'
import type {
  CategoryRepository,
  HabitCompletionRepository,
  HabitRepository,
  ProfileRepository,
  ProjectRepository,
  TaskRepository,
  TimeBlockRepository,
} from '@/repositories/interfaces'
import { createLocalTaskRepository } from '@/repositories/local/task-repository'
import { createLocalTimeBlockRepository } from '@/repositories/local/time-block-repository'
import {
  createLocalCategoryRepository,
  createLocalProfileRepository,
  createLocalProjectRepository,
} from '@/repositories/local/project-category-profile-repositories'
import {
  createLocalHabitCompletionRepository,
  createLocalHabitRepository,
} from '@/repositories/local/habit-repository'

export interface Repositories {
  task: TaskRepository
  timeBlock: TimeBlockRepository
  project: ProjectRepository
  category: CategoryRepository
  profile: ProfileRepository
  habit: HabitRepository
  habitCompletion: HabitCompletionRepository
}

export function createRepositories(adapter: StorageAdapter): Repositories {
  return {
    task: createLocalTaskRepository(adapter),
    timeBlock: createLocalTimeBlockRepository(adapter),
    project: createLocalProjectRepository(adapter),
    category: createLocalCategoryRepository(adapter),
    profile: createLocalProfileRepository(adapter),
    habit: createLocalHabitRepository(adapter),
    habitCompletion: createLocalHabitCompletionRepository(adapter),
  }
}