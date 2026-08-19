import { eachDayOfInterval, format, parseISO, startOfDay } from 'date-fns'
import type { Habit } from '@/domain/types'

export function dateKey(date: Date): string {
  return format(date, 'yyyy-MM-dd')
}

export function parseDateKey(key: string): Date {
  return parseISO(`${key}T00:00:00`)
}

export function isHabitScheduledOn(habit: Habit, date: Date): boolean {
  if (habit.archived) return false
  if (habit.frequency === 'daily') return true
  if (habit.frequency === 'weekly') return true
  if (habit.frequency === 'custom') return habit.daysOfWeek.includes(date.getDay())
  return false
}

export function scheduledDaysInRange(habit: Habit, from: Date, to: Date): Date[] {
  if (habit.archived) return []
  const start = startOfDay(from)
  const end = startOfDay(to)
  if (end.getTime() < start.getTime()) return []
  return eachDayOfInterval({ start, end }).filter((day) => isHabitScheduledOn(habit, day))
}

export function completedDateSet(habitId: string, completions: { habitId: string; date: string }[]): Set<string> {
  return new Set(
    completions
      .filter((completion) => completion.habitId === habitId)
      .map((completion) => completion.date),
  )
}