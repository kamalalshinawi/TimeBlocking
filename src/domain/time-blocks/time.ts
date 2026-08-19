import type { TimeBlock } from '@/domain/types'
import { parseIso } from '@/utils/date/format'

export function plannedDurationMs(timeBlock: TimeBlock): number {
  return parseIso(timeBlock.endAt).getTime() - parseIso(timeBlock.startAt).getTime()
}

export function remainingMs(timeBlock: TimeBlock, now: Date): number {
  return parseIso(timeBlock.endAt).getTime() - now.getTime()
}

export function elapsedMs(timeBlock: TimeBlock, now: Date): number {
  return now.getTime() - parseIso(timeBlock.startAt).getTime()
}

export function actualDurationMs(timeBlock: TimeBlock): number | null {
  if (!timeBlock.completedAt) return null
  return parseIso(timeBlock.completedAt).getTime() - parseIso(timeBlock.startAt).getTime()
}

export function clampProgress(value: number): number {
  if (value < 0) return 0
  if (value > 1) return 1
  return value
}

export function progress(timeBlock: TimeBlock, now: Date): number {
  const total = plannedDurationMs(timeBlock)
  if (total <= 0) return 0
  return clampProgress(elapsedMs(timeBlock, now) / total)
}

export function formatClockDuration(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000))
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  const pad = (value: number) => value.toString().padStart(2, '0')
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
}

export function formatHumanMinutes(totalMinutes: number): string {
  const minutes = Math.max(0, Math.round(totalMinutes))
  if (minutes < 60) return `${minutes} min`
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  if (rest === 0) return `${hours}h`
  return `${hours}h ${rest}m`
}

export function formatDurationHoursMinutes(ms: number): string {
  return formatHumanMinutes(ms / 60000)
}