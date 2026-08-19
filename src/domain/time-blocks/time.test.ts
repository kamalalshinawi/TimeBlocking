import { describe, expect, it } from 'vitest'
import type { TimeBlock } from '@/domain/types'
import {
  actualDurationMs,
  formatClockDuration,
  formatHumanMinutes,
  plannedDurationMs,
  progress,
  remainingMs,
} from '@/domain/time-blocks/time'

function block(startAt: string, endAt: string, completedAt: string | null = null): TimeBlock {
  return {
    id: 'block-1',
    taskId: 'task-1',
    startAt: new Date(startAt).toISOString(),
    endAt: new Date(endAt).toISOString(),
    completedAt,
    originalStartAt: new Date(startAt).toISOString(),
    originalEndAt: new Date(endAt).toISOString(),
    extensionMinutes: 0,
    createdAt: new Date(startAt).toISOString(),
    updatedAt: new Date(startAt).toISOString(),
  }
}

describe('time calculations', () => {
  it('computes planned duration in milliseconds', () => {
    const b = block('2026-08-20T18:00:00', '2026-08-20T19:30:00')
    expect(plannedDurationMs(b)).toBe(90 * 60 * 1000)
  })

  it('computes remaining time relative to now', () => {
    const b = block('2026-08-20T18:00:00', '2026-08-20T19:30:00')
    expect(remainingMs(b, new Date('2026-08-20T18:45:00'))).toBe(45 * 60 * 1000)
  })

  it('returns negative remaining time after the end', () => {
    const b = block('2026-08-20T18:00:00', '2026-08-20T19:30:00')
    expect(remainingMs(b, new Date('2026-08-20T19:45:00'))).toBe(-15 * 60 * 1000)
  })

  it('computes actual duration from completion', () => {
    const b = block('2026-08-20T18:00:00', '2026-08-20T19:30:00', '2026-08-20T19:10:00')
    expect(actualDurationMs(b)).toBe(70 * 60 * 1000)
  })

  it('returns null actual duration when not completed', () => {
    const b = block('2026-08-20T18:00:00', '2026-08-20T19:30:00')
    expect(actualDurationMs(b)).toBeNull()
  })

  it('clamps progress between 0 and 1', () => {
    const b = block('2026-08-20T18:00:00', '2026-08-20T19:30:00')
    expect(progress(b, new Date('2026-08-20T17:00:00'))).toBe(0)
    expect(progress(b, new Date('2026-08-20T18:00:00'))).toBe(0)
    expect(progress(b, new Date('2026-08-20T18:45:00'))).toBeCloseTo(0.5)
    expect(progress(b, new Date('2026-08-20T21:00:00'))).toBe(1)
  })
})

describe('formatting', () => {
  it('formats clock duration as HH:MM:SS', () => {
    expect(formatClockDuration(0)).toBe('00:00:00')
    expect(formatClockDuration(1000)).toBe('00:00:01')
    expect(formatClockDuration(90 * 60 * 1000)).toBe('01:30:00')
    expect(formatClockDuration(-5000)).toBe('00:00:00')
  })

  it('formats human minutes', () => {
    expect(formatHumanMinutes(15)).toBe('15 min')
    expect(formatHumanMinutes(60)).toBe('1h')
    expect(formatHumanMinutes(90)).toBe('1h 30m')
  })
})