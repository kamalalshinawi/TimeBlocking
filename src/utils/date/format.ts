import {
  addMinutes,
  format,
  isAfter,
  isBefore,
  isSameDay,
  parseISO,
  startOfDay,
} from 'date-fns'

export function parseIso(value: string): Date {
  return parseISO(value)
}

export function dateInputValue(date: Date): string {
  return format(date, 'yyyy-MM-dd')
}

export function timeInputValue(date: Date): string {
  return format(date, 'HH:mm')
}

export function combineDateAndTime(date: string, time: string): Date {
  return parseISO(`${date}T${time}:00`)
}

export function isSameLocalDay(a: Date, b: Date): boolean {
  return isSameDay(a, b)
}

export function startOfLocalDay(date: Date): Date {
  return startOfDay(date)
}

export function minutesSinceMidnight(date: Date): number {
  return date.getHours() * 60 + date.getMinutes()
}

export function addMinutesToDate(date: Date, minutes: number): Date {
  return addMinutes(date, minutes)
}

export function isDateAfter(a: Date, b: Date): boolean {
  return isAfter(a, b)
}

export function isDateBefore(a: Date, b: Date): boolean {
  return isBefore(a, b)
}

export function to12HourTime(date: Date): string {
  return format(date, 'h:mm a')
}

export function to24HourTime(date: Date): string {
  return format(date, 'HH:mm')
}

export function formatTime(date: Date, timeFormat: '12h' | '24h'): string {
  return timeFormat === '12h' ? to12HourTime(date) : to24HourTime(date)
}

export function formatDate(date: Date): string {
  return format(date, 'EEE, MMM d')
}

export function formatFullDate(date: Date): string {
  return format(date, 'EEEE, MMMM d, yyyy')
}