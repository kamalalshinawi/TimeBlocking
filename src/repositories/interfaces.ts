import type {
  Category,
  Habit,
  HabitCompletion,
  HabitFrequency,
  PomodoroSession,
  PomodoroSettings,
  PomodoroState,
  Priority,
  Project,
  Task,
  TimeBlock,
  UserProfile,
} from '@/domain/types'

export interface TaskRepository {
  getAll(): Promise<Task[]>
  getById(id: string): Promise<Task | null>
  create(input: NewTask): Promise<Task>
  update(task: Task): Promise<Task>
  delete(id: string): Promise<void>
}

export interface TimeBlockRepository {
  getAll(): Promise<TimeBlock[]>
  getById(id: string): Promise<TimeBlock | null>
  create(input: NewTimeBlock): Promise<TimeBlock>
  update(timeBlock: TimeBlock): Promise<TimeBlock>
  delete(id: string): Promise<void>
}

export interface ProjectRepository {
  getAll(): Promise<Project[]>
  getById(id: string): Promise<Project | null>
  create(input: NewProject): Promise<Project>
  update(project: Project): Promise<Project>
  delete(id: string): Promise<void>
}

export interface CategoryRepository {
  getAll(): Promise<Category[]>
  getById(id: string): Promise<Category | null>
  create(input: NewCategory): Promise<Category>
  update(category: Category): Promise<Category>
  delete(id: string): Promise<void>
}

export interface ProfileRepository {
  get(): Promise<UserProfile | null>
  save(profile: UserProfile): Promise<UserProfile>
}

export interface HabitRepository {
  getAll(): Promise<Habit[]>
  getById(id: string): Promise<Habit | null>
  create(input: NewHabit): Promise<Habit>
  update(habit: Habit): Promise<Habit>
  delete(id: string): Promise<void>
}

export interface HabitCompletionRepository {
  getAll(): Promise<HabitCompletion[]>
  create(input: NewHabitCompletion): Promise<HabitCompletion>
  delete(id: string): Promise<void>
  deleteForHabit(habitId: string): Promise<void>
}

export interface PomodoroSettingsRepository {
  get(): Promise<PomodoroSettings>
  save(settings: PomodoroSettings): Promise<PomodoroSettings>
}

export interface PomodoroSessionRepository {
  getAll(): Promise<PomodoroSession[]>
  create(session: PomodoroSession): Promise<PomodoroSession>
}

export interface ActivePomodoroRepository {
  get(): Promise<PomodoroState>
  save(state: PomodoroState): Promise<PomodoroState>
}

export interface NewTask {
  title: string
  description?: string
  projectId?: string | null
  categoryId?: string | null
  priority?: Priority
}

export interface NewTimeBlock {
  taskId: string
  startAt: string
  endAt: string
  completedAt?: string | null
  extensionMinutes?: number
}

export interface NewProject {
  name: string
  description?: string
  color?: string
}

export interface NewCategory {
  name: string
  color?: string
}

export interface NewHabit {
  name: string
  description?: string
  color?: string
  icon?: string
  frequency?: HabitFrequency
  daysOfWeek?: number[]
  weeklyTarget?: number
}

export interface NewHabitCompletion {
  habitId: string
  date: string
}