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

export type HabitFrequency = 'daily' | 'weekly' | 'custom'

export interface Habit {
  id: string
  name: string
  description: string
  color: string
  icon: string
  frequency: HabitFrequency
  daysOfWeek: number[]
  weeklyTarget: number
  archived: boolean
  createdAt: string
  updatedAt: string
}

export interface HabitCompletion {
  id: string
  habitId: string
  date: string
  completedAt: string
}

export type PomodoroPhase = 'focus' | 'short-break' | 'long-break'
export type PomodoroStatus = 'idle' | 'running' | 'paused' | 'completed'

export interface PomodoroSettings {
  focusMinutes: number
  shortBreakMinutes: number
  longBreakMinutes: number
  longBreakInterval: number
  autoStartBreaks: boolean
  autoStartFocus: boolean
  dailyFocusGoal: number
  soundEnabled: boolean
}

export interface PomodoroSession {
  id: string
  phase: PomodoroPhase
  taskId: string | null
  plannedSeconds: number
  accumulatedSeconds: number
  startedAt: string | null
  pausedAt: string | null
  status: PomodoroStatus
  completedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface PomodoroState {
  activeSession: PomodoroSession | null
  focusCycleCount: number
}