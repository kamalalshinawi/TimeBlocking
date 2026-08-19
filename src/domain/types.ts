export type TimeFormat = '12h' | '24h'
export type ThemePreference = 'light' | 'dark' | 'system'

export interface UserProfile {
  id: string
  name: string
  email: string
  timezone: string
  timeFormat: TimeFormat
  theme: ThemePreference
  createdAt: string
  updatedAt: string
}

export type Priority = 'low' | 'medium' | 'high'

export interface Subtask {
  id: string
  title: string
  completed: boolean
  createdAt: string
}

export interface Task {
  id: string
  title: string
  description: string
  projectId: string | null
  categoryId: string | null
  priority: Priority
  subtasks: Subtask[]
  completedAt: string | null
  createdAt: string
  updatedAt: string
}

export type TimeBlockStatus = 'UPCOMING' | 'ACTIVE' | 'COMPLETED' | 'OVERDUE' | 'MISSED'

export interface TimeBlock {
  id: string
  taskId: string
  startAt: string
  endAt: string
  completedAt: string | null
  originalStartAt: string
  originalEndAt: string
  extensionMinutes: number
  createdAt: string
  updatedAt: string
}

export interface Project {
  id: string
  name: string
  description: string
  color: string
  createdAt: string
  updatedAt: string
}

export interface Category {
  id: string
  name: string
  color: string
  createdAt: string
  updatedAt: string
}