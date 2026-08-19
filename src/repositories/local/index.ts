import type { StorageAdapter } from '@/storage/adapter'
import type {
  ActivePomodoroRepository,
  CategoryRepository,
  HabitCompletionRepository,
  HabitRepository,
  PomodoroSessionRepository,
  PomodoroSettingsRepository,
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
import {
  createLocalActivePomodoroRepository,
  createLocalPomodoroSessionRepository,
  createLocalPomodoroSettingsRepository,
} from '@/repositories/local/pomodoro-repository'

export interface Repositories {
  task: TaskRepository
  timeBlock: TimeBlockRepository
  project: ProjectRepository
  category: CategoryRepository
  profile: ProfileRepository
  habit: HabitRepository
  habitCompletion: HabitCompletionRepository
  pomodoroSettings: PomodoroSettingsRepository
  pomodoroSession: PomodoroSessionRepository
  activePomodoro: ActivePomodoroRepository
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
    pomodoroSettings: createLocalPomodoroSettingsRepository(adapter),
    pomodoroSession: createLocalPomodoroSessionRepository(adapter),
    activePomodoro: createLocalActivePomodoroRepository(adapter),
  }
}