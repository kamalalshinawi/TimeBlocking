import { isSameDay, subDays } from 'date-fns'
import type { PomodoroSession, PomodoroSettings } from '@/domain/types'
import { parseIso } from '@/utils/date/format'

export function getFocusSessions(sessions: PomodoroSession[]): PomodoroSession[] {
  return sessions.filter((session) => session.phase === 'focus' && session.completedAt !== null)
}

export function getFocusSessionsOn(sessions: PomodoroSession[], day: Date): PomodoroSession[] {
  return getFocusSessions(sessions).filter((session) => isSameDay(parseIso(session.completedAt!), day))
}

export function getFocusSessionCount(sessions: PomodoroSession[], day: Date): number {
  return getFocusSessionsOn(sessions, day).length
}

export function getFocusMinutesOn(sessions: PomodoroSession[], day: Date): number {
  return getFocusSessionsOn(sessions, day).reduce((sum, session) => sum + session.plannedSeconds / 60, 0)
}

export function getFocusGoalProgress(
  sessions: PomodoroSession[],
  settings: PomodoroSettings,
  day: Date,
): { completed: number; goal: number } {
  const completed = getFocusSessionCount(sessions, day)
  return { completed, goal: settings.dailyFocusGoal }
}

export function getRecentFocusSummary(
  sessions: PomodoroSession[],
  today: Date,
  days = 7,
): { sessions: number; minutes: number } {
  let count = 0
  let minutes = 0
  for (let i = 0; i < days; i += 1) {
    const day = subDays(today, i)
    count += getFocusSessionCount(sessions, day)
    minutes += getFocusMinutesOn(sessions, day)
  }
  return { sessions: count, minutes }
}

export function getTotalFocusMinutes(sessions: PomodoroSession[]): number {
  return getFocusSessions(sessions).reduce((sum, session) => sum + session.plannedSeconds / 60, 0)
}