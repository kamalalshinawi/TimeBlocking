import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { Category, Habit, HabitCompletion, Project, Task, TimeBlock, UserProfile } from '@/domain/types'
import { createLocalStorageAdapter } from '@/storage/adapter'
import { createEmptyDatabase, isValidDatabase, loadDatabase, nowIso, saveDatabase } from '@/storage/database'
import { createRepositories } from '@/repositories/local'
import type {
  NewCategory,
  NewHabit,
  NewProject,
  NewTask,
  NewTimeBlock,
} from '@/repositories/interfaces'
import { completeTimeBlock, extendTimeBlock, rescheduleTimeBlock } from '@/domain/time-blocks/operations'

interface DataContextValue {
  ready: boolean
  profile: UserProfile | null
  tasks: Task[]
  timeBlocks: TimeBlock[]
  projects: Project[]
  categories: Category[]
  habits: Habit[]
  habitCompletions: HabitCompletion[]

  saveProfile: (profile: UserProfile) => Promise<void>

  createTask: (input: NewTask) => Promise<Task>
  updateTask: (task: Task) => Promise<void>
  deleteTask: (id: string) => Promise<void>
  setTaskCompletion: (id: string, completed: boolean) => Promise<void>

  createTimeBlock: (input: NewTimeBlock) => Promise<TimeBlock>
  updateTimeBlock: (timeBlock: TimeBlock) => Promise<void>
  deleteTimeBlock: (id: string) => Promise<void>
  completeTimeBlockById: (id: string) => Promise<void>
  extendTimeBlockById: (id: string, minutes: number) => Promise<void>
  rescheduleTimeBlockById: (id: string, startAt: Date, endAt: Date) => Promise<void>

  createProject: (input: NewProject) => Promise<Project>
  updateProject: (project: Project) => Promise<void>
  deleteProject: (id: string) => Promise<void>

  createCategory: (input: NewCategory) => Promise<Category>
  updateCategory: (category: Category) => Promise<void>
  deleteCategory: (id: string) => Promise<void>

  createHabit: (input: NewHabit) => Promise<Habit>
  updateHabit: (habit: Habit) => Promise<void>
  deleteHabit: (id: string) => Promise<void>
  toggleHabitCompletion: (habitId: string, date: string) => Promise<void>

  exportData: () => string
  importData: (json: string) => Promise<void>
  clearAllData: () => Promise<void>
}

const DataContext = createContext<DataContextValue | null>(null)

const adapter = createLocalStorageAdapter()
const repositories = createRepositories(adapter)

export function DataProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [timeBlocks, setTimeBlocks] = useState<TimeBlock[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [habits, setHabits] = useState<Habit[]>([])
  const [habitCompletions, setHabitCompletions] = useState<HabitCompletion[]>([])

  useEffect(() => {
    let cancelled = false
    async function load() {
      const [profileResult, taskResult, blockResult, projectResult, categoryResult, habitResult, habitCompletionResult] =
        await Promise.all([
          repositories.profile.get(),
          repositories.task.getAll(),
          repositories.timeBlock.getAll(),
          repositories.project.getAll(),
          repositories.category.getAll(),
          repositories.habit.getAll(),
          repositories.habitCompletion.getAll(),
        ])
      if (cancelled) return
      setProfile(profileResult)
      setTasks(taskResult)
      setTimeBlocks(blockResult)
      setProjects(projectResult)
      setCategories(categoryResult)
      setHabits(habitResult)
      setHabitCompletions(habitCompletionResult)
      setReady(true)
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [])

  const refreshTasks = useCallback(async () => {
    setTasks(await repositories.task.getAll())
  }, [])
  const refreshTimeBlocks = useCallback(async () => {
    setTimeBlocks(await repositories.timeBlock.getAll())
  }, [])
  const refreshProjects = useCallback(async () => {
    setProjects(await repositories.project.getAll())
  }, [])
  const refreshCategories = useCallback(async () => {
    setCategories(await repositories.category.getAll())
  }, [])
  const refreshHabits = useCallback(async () => {
    setHabits(await repositories.habit.getAll())
  }, [])
  const refreshHabitCompletions = useCallback(async () => {
    setHabitCompletions(await repositories.habitCompletion.getAll())
  }, [])

  const value = useMemo<DataContextValue>(() => {
    return {
      ready,
      profile,
      tasks,
      timeBlocks,
      projects,
      categories,
      habits,
      habitCompletions,

      async saveProfile(newProfile) {
        await repositories.profile.save(newProfile)
        setProfile(await repositories.profile.get())
      },

      async createTask(input) {
        const task = await repositories.task.create(input)
        await refreshTasks()
        return task
      },
      async updateTask(task) {
        await repositories.task.update(task)
        await refreshTasks()
      },
      async deleteTask(id) {
        await repositories.task.delete(id)
        const blocks = await repositories.timeBlock.getAll()
        for (const block of blocks.filter((block) => block.taskId === id)) {
          await repositories.timeBlock.delete(block.id)
        }
        await refreshTasks()
        await refreshTimeBlocks()
      },
      async setTaskCompletion(id, completed) {
        const task = await repositories.task.getById(id)
        if (!task) throw new Error(`Task not found: ${id}`)
        const timestamp = nowIso()
        await repositories.task.update({ ...task, completedAt: completed ? timestamp : null })
        const blocks = await repositories.timeBlock.getAll()
        for (const block of blocks.filter((block) => block.taskId === id)) {
          await repositories.timeBlock.update({
            ...block,
            completedAt: completed ? (block.completedAt ?? timestamp) : null,
          })
        }
        await refreshTasks()
        await refreshTimeBlocks()
      },

      async createTimeBlock(input) {
        const block = await repositories.timeBlock.create(input)
        await refreshTimeBlocks()
        return block
      },
      async updateTimeBlock(timeBlock) {
        await repositories.timeBlock.update(timeBlock)
        await refreshTimeBlocks()
      },
      async deleteTimeBlock(id) {
        await repositories.timeBlock.delete(id)
        await refreshTimeBlocks()
      },
      async completeTimeBlockById(id) {
        const block = await repositories.timeBlock.getById(id)
        if (!block) throw new Error(`Time block not found: ${id}`)
        await repositories.timeBlock.update(completeTimeBlock(block, new Date()))
        const blocks = await repositories.timeBlock.getAll()
        const remaining = blocks.filter(
          (candidate) => candidate.taskId === block.taskId && candidate.completedAt === null,
        )
        if (remaining.length === 0) {
          const task = await repositories.task.getById(block.taskId)
          if (task && task.completedAt === null) {
            await repositories.task.update({ ...task, completedAt: nowIso() })
          }
        }
        await refreshTasks()
        await refreshTimeBlocks()
      },
      async extendTimeBlockById(id, minutes) {
        const block = await repositories.timeBlock.getById(id)
        if (!block) throw new Error(`Time block not found: ${id}`)
        await repositories.timeBlock.update(extendTimeBlock(block, minutes))
        await refreshTimeBlocks()
      },
      async rescheduleTimeBlockById(id, startAt, endAt) {
        const block = await repositories.timeBlock.getById(id)
        if (!block) throw new Error(`Time block not found: ${id}`)
        await repositories.timeBlock.update(rescheduleTimeBlock(block, startAt, endAt))
        await refreshTimeBlocks()
      },

      async createProject(input) {
        const project = await repositories.project.create(input)
        await refreshProjects()
        return project
      },
      async updateProject(project) {
        await repositories.project.update(project)
        await refreshProjects()
      },
      async deleteProject(id) {
        await repositories.project.delete(id)
        await refreshProjects()
      },

      async createCategory(input) {
        const category = await repositories.category.create(input)
        await refreshCategories()
        return category
      },
      async updateCategory(category) {
        await repositories.category.update(category)
        await refreshCategories()
      },
      async deleteCategory(id) {
        await repositories.category.delete(id)
        await refreshCategories()
      },

      async createHabit(input) {
        const habit = await repositories.habit.create(input)
        await refreshHabits()
        return habit
      },
      async updateHabit(habit) {
        await repositories.habit.update(habit)
        await refreshHabits()
      },
      async deleteHabit(id) {
        await repositories.habit.delete(id)
        await repositories.habitCompletion.deleteForHabit(id)
        await refreshHabits()
        await refreshHabitCompletions()
      },
      async toggleHabitCompletion(habitId, date) {
        const existing = await repositories.habitCompletion.getAll()
        const found = existing.find(
          (completion) => completion.habitId === habitId && completion.date === date,
        )
        if (found) {
          await repositories.habitCompletion.delete(found.id)
        } else {
          await repositories.habitCompletion.create({ habitId, date })
        }
        await refreshHabitCompletions()
      },

      exportData() {
        return JSON.stringify(loadDatabase(adapter), null, 2)
      },
      async importData(json) {
        const parsed: unknown = JSON.parse(json)
        if (!isValidDatabase(parsed)) {
          throw new Error('Invalid backup file')
        }
        saveDatabase(adapter, parsed)
        const [profileResult, taskResult, blockResult, projectResult, categoryResult, habitResult, habitCompletionResult] =
          await Promise.all([
            repositories.profile.get(),
            repositories.task.getAll(),
            repositories.timeBlock.getAll(),
            repositories.project.getAll(),
            repositories.category.getAll(),
            repositories.habit.getAll(),
            repositories.habitCompletion.getAll(),
          ])
        setProfile(profileResult)
        setTasks(taskResult)
        setTimeBlocks(blockResult)
        setProjects(projectResult)
        setCategories(categoryResult)
        setHabits(habitResult)
        setHabitCompletions(habitCompletionResult)
      },
      async clearAllData() {
        saveDatabase(adapter, createEmptyDatabase())
        setProfile(null)
        setTasks([])
        setTimeBlocks([])
        setProjects([])
        setCategories([])
        setHabits([])
        setHabitCompletions([])
      },
    }
  }, [ready, profile, tasks, timeBlocks, projects, categories, habits, habitCompletions, refreshTasks, refreshTimeBlocks, refreshProjects, refreshCategories, refreshHabits, refreshHabitCompletions])

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export function useData(): DataContextValue {
  const context = useContext(DataContext)
  if (!context) throw new Error('useData must be used within a DataProvider')
  return context
}