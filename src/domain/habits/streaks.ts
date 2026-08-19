import { addDays, startOfDay } from 'date-fns'
import type { Habit } from '@/domain/types'
import { completedDateSet, dateKey, isHabitScheduledOn, parseDateKey, scheduledDaysInRange } from '@/domain/habits/schedule'

function firstScheduledDay(habit: Habit): Date {
  const created = startOfDay(parseDateKey(dateKey(new Date(habit.createdAt))))
  if (isHabitScheduledOn(habit, created)) return created
  return scheduledDaysInRange(habit, created, addDays(created, 6))[0] ?? created
}

export function getCurrentStreak(
  habit: Habit,
  completions: { habitId: string; date: string }[],
  today: Date,
): number {
  if (habit.archived) return 0
  const completed = completedDateSet(habit.id, completions)
  const days = scheduledDaysInRange(habit, firstScheduledDay(habit), today)

  let cursor = days.length - 1
  if (cursor >= 0 && isHabitScheduledOn(habit, today) && !completed.has(dateKey(today))) {
    cursor -= 1
  }

  let streak = 0
  while (cursor >= 0) {
    if (!completed.has(dateKey(days[cursor]))) break
    streak += 1
    cursor -= 1
  }
  return streak
}

export function getLongestStreak(
  habit: Habit,
  completions: { habitId: string; date: string }[],
  today: Date,
): number {
  if (habit.archived) return 0
  const completed = completedDateSet(habit.id, completions)
  const from = firstScheduledDay(habit)
  const days = scheduledDaysInRange(habit, from, today)

  let longest = 0
  let current = 0
  for (const day of days) {
    if (completed.has(dateKey(day))) {
      current += 1
      if (current > longest) longest = current
    } else {
      current = 0
    }
  }
  return longest
}

export function getBestStreak(habit: Habit, completions: { habitId: string; date: string }[], today: Date): number {
  return Math.max(getCurrentStreak(habit, completions, today), getLongestStreak(habit, completions, today))
}