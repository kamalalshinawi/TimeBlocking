import { describe, expect, it } from 'vitest'
import type { Habit, HabitCompletion } from '@/domain/types'
import { dateKey, isHabitScheduledOn, parseDateKey, scheduledDaysInRange } from '@/domain/habits/schedule'
import { getBestStreak, getCurrentStreak, getLongestStreak } from '@/domain/habits/streaks'
import { getCompletionRate, getHeatmap, getTodayStatus, getWeekTargetProgress } from '@/domain/habits/stats'

const now = new Date(2026, 7, 19, 12, 0, 0)

function makeHabit(overrides: Partial<Habit> = {}): Habit {
  return {
    id: 'habit-1',
    name: 'Read',
    description: '',
    color: '#3b82f6',
    icon: 'BookOpen',
    frequency: 'daily',
    daysOfWeek: [1, 3, 5],
    weeklyTarget: 3,
    archived: false,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  }
}

function completion(date: string): HabitCompletion {
  return { id: `c-${date}`, habitId: 'habit-1', date, completedAt: `${date}T09:00:00.000Z` }
}

function datesFrom(start: Date, days: number, step = 1): Date[] {
  const result: Date[] = []
  for (let i = 0; i < days; i += step) {
    result.push(new Date(start.getFullYear(), start.getMonth(), start.getDate() - i, 12, 0, 0))
  }
  return result
}

describe('isHabitScheduledOn', () => {
  it('schedules a daily habit every day', () => {
    const habit = makeHabit()
    for (const day of datesFrom(now, 14)) {
      expect(isHabitScheduledOn(habit, day)).toBe(true)
    }
  })

  it('schedules a weekly habit on any day', () => {
    const habit = makeHabit({ frequency: 'weekly' })
    for (const day of datesFrom(now, 14)) {
      expect(isHabitScheduledOn(habit, day)).toBe(true)
    }
  })

  it('schedules a custom habit only on chosen weekdays', () => {
    const habit = makeHabit({ frequency: 'custom' })
    expect(isHabitScheduledOn(habit, new Date(2026, 7, 20, 12))) // Thu
      .toBe(false)
    expect(isHabitScheduledOn(habit, new Date(2026, 7, 21, 12))) // Fri
      .toBe(true)
  })

  it('never schedules an archived habit', () => {
    const habit = makeHabit({ archived: true })
    expect(isHabitScheduledOn(habit, now)).toBe(false)
  })
})

describe('scheduledDaysInRange', () => {
  it('returns all days for a daily habit', () => {
    const habit = makeHabit()
    const days = scheduledDaysInRange(habit, new Date(2026, 7, 10), new Date(2026, 7, 12))
    expect(days).toHaveLength(3)
  })

  it('returns only chosen weekdays for a custom habit', () => {
    const habit = makeHabit({ frequency: 'custom' })
    const days = scheduledDaysInRange(habit, new Date(2026, 7, 17), new Date(2026, 7, 23))
    expect(days.map((day) => dateKey(day))).toEqual(['2026-08-17', '2026-08-19', '2026-08-21'])
  })

  it('returns an empty array when the range is inverted', () => {
    const habit = makeHabit()
    expect(scheduledDaysInRange(habit, new Date(2026, 7, 12), new Date(2026, 7, 10))).toEqual([])
  })
})

describe('getCurrentStreak', () => {
  it('counts consecutive completed scheduled days including today', () => {
    const habit = makeHabit()
    const completions = [
      completion('2026-08-19'),
      completion('2026-08-18'),
      completion('2026-08-17'),
      completion('2026-08-16'),
    ]
    expect(getCurrentStreak(habit, completions, now)).toBe(4)
  })

  it('starts from yesterday when today is not yet completed', () => {
    const habit = makeHabit()
    const completions = [completion('2026-08-18'), completion('2026-08-17'), completion('2026-08-16')]
    expect(getCurrentStreak(habit, completions, now)).toBe(3)
  })

  it('breaks the streak on a scheduled missed day', () => {
    const habit = makeHabit()
    const completions = [completion('2026-08-18'), completion('2026-08-17'), completion('2026-08-15')]
    expect(getCurrentStreak(habit, completions, now)).toBe(2)
  })

  it('only counts scheduled days for custom frequency', () => {
    const habit = makeHabit({ frequency: 'custom' })
    const completions = [completion('2026-08-19'), completion('2026-08-17')]
    expect(getCurrentStreak(habit, completions, now)).toBe(2)
  })

  it('returns zero when nothing has been completed', () => {
    const habit = makeHabit()
    expect(getCurrentStreak(habit, completionsFor(habit.id, []), now)).toBe(0)
  })

  it('returns zero for an archived habit', () => {
    const habit = makeHabit({ archived: true })
    expect(getCurrentStreak(habit, [completion('2026-08-18')], now)).toBe(0)
  })
})

function completionsFor(_habitId: string, items: HabitCompletion[]): HabitCompletion[] {
  return items
}

describe('getLongestStreak', () => {
  it('finds the longest run across the habit history', () => {
    const habit = makeHabit({ createdAt: '2026-08-01T00:00:00.000Z' })
    const completions = [
      completion('2026-08-16'),
      completion('2026-08-17'),
      completion('2026-08-18'),
      completion('2026-08-15'),
      completion('2026-08-14'),
      completion('2026-08-13'),
      completion('2026-08-10'),
    ]
    expect(getLongestStreak(habit, completions, now)).toBe(6)
  })

  it('returns zero when no completion exists', () => {
    const habit = makeHabit({ createdAt: '2026-08-01T00:00:00.000Z' })
    expect(getLongestStreak(habit, [], now)).toBe(0)
  })
})

describe('getBestStreak', () => {
  it('returns the larger of current and longest streak', () => {
    const habit = makeHabit({ createdAt: '2026-08-01T00:00:00.000Z' })
    const completions = [
      completion('2026-08-19'),
      completion('2026-08-18'),
      completion('2026-08-17'),
      completion('2026-08-16'),
      completion('2026-08-10'),
      completion('2026-08-11'),
    ]
    expect(getBestStreak(habit, completions, now)).toBe(4)
  })
})

describe('getTodayStatus', () => {
  it('reports completed when today is checked off', () => {
    const habit = makeHabit()
    expect(getTodayStatus(habit, [completion('2026-08-19')], now)).toBe('completed')
  })

  it('reports due for a scheduled uncompleted day', () => {
    const habit = makeHabit()
    expect(getTodayStatus(habit, [], now)).toBe('due')
  })

  it('reports not-due for custom habits when the day is not scheduled', () => {
    const habit = makeHabit({ frequency: 'custom' })
    expect(getTodayStatus(habit, [], new Date(2026, 7, 20, 12))).toBe('not-due')
  })

  it('reports archived for archived habits', () => {
    const habit = makeHabit({ archived: true })
    expect(getTodayStatus(habit, [], now)).toBe('archived')
  })
})

describe('getWeekTargetProgress', () => {
  it('counts completions within the current week', () => {
    const habit = makeHabit({ frequency: 'weekly', weeklyTarget: 4 })
    const completions = [completion('2026-08-17'), completion('2026-08-19')]
    expect(getWeekTargetProgress(habit, completions, now)).toEqual({ completed: 2, target: 4 })
  })
})

describe('getCompletionRate', () => {
  it('computes the ratio of completed scheduled days', () => {
    const habit = makeHabit()
    const completions = [completion('2026-08-17'), completion('2026-08-18'), completion('2026-08-19')]
    const from = new Date(2026, 7, 17, 0, 0, 0)
    const to = new Date(2026, 7, 19, 23, 59, 59)
    expect(getCompletionRate(habit, completions, from, to)).toBeCloseTo(1, 5)
  })

  it('returns zero when nothing was done', () => {
    const habit = makeHabit()
    expect(getCompletionRate(habit, [], new Date(2026, 7, 1), now)).toBe(0)
  })
})

describe('getHeatmap', () => {
  it('produces a cell per day ending today', () => {
    const habit = makeHabit()
    const cells = getHeatmap(habit, [completion('2026-08-19')], now, 2)
    expect(cells).toHaveLength(10)
    expect(cells[cells.length - 1]).toEqual({ date: '2026-08-19', scheduled: true, completed: true })
  })

  it('flags unscheduled cells for custom habits', () => {
    const habit = makeHabit({ frequency: 'custom' })
    const cells = getHeatmap(habit, [], new Date(2026, 7, 19, 12), 1)
    expect(cells.some((cell) => !cell.scheduled)).toBe(true)
  })
})

describe('parseDateKey', () => {
  it('parses a date key to a local midnight date', () => {
    const parsed = parseDateKey('2026-08-19')
    expect(parsed.getFullYear()).toBe(2026)
    expect(parsed.getMonth()).toBe(7)
    expect(parsed.getDate()).toBe(19)
  })
})