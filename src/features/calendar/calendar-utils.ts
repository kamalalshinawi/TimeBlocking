import { addDays, addWeeks, endOfMonth, format, isSameDay, startOfMonth, startOfWeek } from 'date-fns'
import type { TimeBlock } from '@/domain/types'
import { minutesSinceMidnight, parseIso } from '@/utils/date/format'

export const HOURS_PER_DAY = 24
export const MINUTES_PER_DAY = 1440
export const PX_PER_MINUTE = 1
export const GRID_HEIGHT = MINUTES_PER_DAY * PX_PER_MINUTE

export interface GridPosition {
  top: number
  height: number
}

export function getGridPosition(timeBlock: TimeBlock): GridPosition {
  const start = parseIso(timeBlock.startAt)
  const end = parseIso(timeBlock.endAt)
  let startMin = minutesSinceMidnight(start)
  let endMin = minutesSinceMidnight(end)
  if (endMin <= startMin) endMin = MINUTES_PER_DAY
  const top = startMin * PX_PER_MINUTE
  const height = Math.max(6, (endMin - startMin) * PX_PER_MINUTE)
  return { top, height }
}

export function minutesToDate(day: Date, minutes: number): Date {
  const base = new Date(day)
  base.setHours(0, 0, 0, 0)
  return new Date(base.getTime() + minutes * 60000)
}

export { minutesSinceMidnight } from '@/utils/date/format'

export function blocksForDay(timeBlocks: TimeBlock[], day: Date): TimeBlock[] {
  return timeBlocks
    .filter((block) => isSameDay(parseIso(block.startAt), day))
    .sort((a, b) => parseIso(a.startAt).getTime() - parseIso(b.startAt).getTime())
}

export function weekDays(anchor: Date): Date[] {
  const start = startOfWeek(anchor, { weekStartsOn: 0 })
  return Array.from({ length: 7 }, (_, index) => addDays(start, index))
}

export function monthWeeks(anchor: Date): Date[][] {
  const first = startOfWeek(startOfMonth(anchor), { weekStartsOn: 0 })
  const last = endOfMonth(anchor)
  const days: Date[] = []
  let cursor = first
  while (cursor <= last || days.length % 7 !== 0) {
    days.push(cursor)
    cursor = addDays(cursor, 1)
  }
  const weeks: Date[][] = []
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7))
  }
  return weeks
}

export function monthLabel(date: Date): string {
  return format(date, 'MMMM yyyy')
}

export function moveWeek(anchor: Date, direction: -1 | 1): Date {
  return addWeeks(anchor, direction)
}

export function dayLabel(date: Date): string {
  return format(date, 'EEEE, MMMM d')
}

export function weekdayShort(date: Date): string {
  return format(date, 'EEE')
}

export function dayNumber(date: Date): string {
  return format(date, 'd')
}