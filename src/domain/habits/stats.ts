import { addDays, endOfWeek, isSameDay, startOfWeek, subWeeks } from 'date-fns'
import type { Habit } from '@/domain/types'
import { completedDateSet, dateKey, isHabitScheduledOn, scheduledDaysInRange } from '@/domain/habits/schedule'

export type HabitDayStatus = 'completed' | 'due' | 'not-due' | 'archived'

export function getTodayStatus(
  habit: Habit,
  completions: { habitId: string; date: string }[],
  today: Date,
): HabitDayStatus {
  if (habit.archived) return 'archived'
  if (!isHabitScheduledOn(habit, today)) return 'not-due'
  if (completedDateSet(habit.id, completions).has(dateKey(today))) return 'completed'
  return 'due'
}

export function getWeekTargetProgress(
  habit: Habit,
  completions: { habitId: string; date: string }[],
  today: Date,
): { completed: number; target: number } {
  const weekStart = startOfWeek(today, { weekStartsOn: 1 })
  const completed = completedDateSet(habit.id, completions)
  let count = 0
  for (let day = weekStart; day <= endOfWeek(today, { weekStartsOn: 1 }); day = addDays(day, 1)) {
    if (completed.has(dateKey(day))) count += 1
  }
  return { completed: count, target: habit.weeklyTarget }
}

export function getCompletionRate(
  habit: Habit,
  completions: { habitId: string; date: string }[],
  from: Date,
  to: Date,
): number {
  if (habit.archived) return 0
  const completed = completedDateSet(habit.id, completions)

  if (habit.frequency === 'weekly') {
    if (habit.weeklyTarget <= 0) return 0
    const days = scheduledDaysInRange(habit, from, to)
    const weeks = new Map<string, number>()
    for (const day of days) {
      const key = dateKey(startOfWeek(day, { weekStartsOn: 1 }))
      if (completed.has(dateKey(day))) weeks.set(key, (weeks.get(key) ?? 0) + 1)
    }
    const weekCount = Math.max(1, weeks.size)
    const met = [...weeks.values()].filter((count) => count >= habit.weeklyTarget).length
    return Math.min(1, met / weekCount)
  }

  const scheduled = scheduledDaysInRange(habit, from, to)
  if (scheduled.length === 0) return 0
  const done = scheduled.filter((day) => completed.has(dateKey(day))).length
  return done / scheduled.length
}

export interface HeatmapCell {
  date: string
  completed: boolean
  scheduled: boolean
}

export function getHeatmap(
  habit: Habit,
  completions: { habitId: string; date: string }[],
  today: Date,
  weeks = 12,
): HeatmapCell[] {
  const completed = completedDateSet(habit.id, completions)
  const start = startOfWeek(subWeeks(today, weeks - 1), { weekStartsOn: 1 })
  const cells: HeatmapCell[] = []
  for (let day = start; day <= today; day = addDays(day, 1)) {
    const scheduled = isHabitScheduledOn(habit, day)
    cells.push({
      date: dateKey(day),
      scheduled,
      completed: scheduled && completed.has(dateKey(day)),
    })
  }
  return cells
}

export function getWeeklyCompletionCount(
  habitId: string,
  completions: { habitId: string; date: string }[],
  day: Date,
): number {
  const completed = completedDateSet(habitId, completions)
  return completed.has(dateKey(day)) ? 1 : 0
}

export function habitCompletedOn(habitId: string, completions: { habitId: string; date: string }[], day: Date): boolean {
  return completedDateSet(habitId, completions).has(dateKey(day))
}

export function isSameDayHabit(a: Date, b: Date): boolean {
  return isSameDay(a, b)
}