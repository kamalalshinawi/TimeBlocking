import { describe, expect, it } from 'vitest'
import type { TimeBlock } from '@/domain/types'
import { getTimeBlockStatus } from '@/domain/time-blocks/status'

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

describe('getTimeBlockStatus', () => {
  it('is UPCOMING before the start time', () => {
    const b = block('2026-08-20T18:00:00', '2026-08-20T19:30:00')
    expect(getTimeBlockStatus(b, new Date('2026-08-20T17:15:00'))).toBe('UPCOMING')
  })

  it('is ACTIVE exactly at start', () => {
    const b = block('2026-08-20T18:00:00', '2026-08-20T19:30:00')
    expect(getTimeBlockStatus(b, new Date('2026-08-20T18:00:00'))).toBe('ACTIVE')
  })

  it('is ACTIVE between start and end', () => {
    const b = block('2026-08-20T18:00:00', '2026-08-20T19:30:00')
    expect(getTimeBlockStatus(b, new Date('2026-08-20T18:45:00'))).toBe('ACTIVE')
  })

  it('is ACTIVE exactly at end', () => {
    const b = block('2026-08-20T18:00:00', '2026-08-20T19:30:00')
    expect(getTimeBlockStatus(b, new Date('2026-08-20T19:30:00'))).toBe('ACTIVE')
  })

  it('is COMPLETED when completed, even if time has passed', () => {
    const b = block('2026-08-20T18:00:00', '2026-08-20T19:30:00', '2026-08-20T19:00:00')
    expect(getTimeBlockStatus(b, new Date('2026-08-20T22:00:00'))).toBe('COMPLETED')
  })

  it('is OVERDUE when the end passed today without completion', () => {
    const b = block('2026-08-20T18:00:00', '2026-08-20T19:30:00')
    expect(getTimeBlockStatus(b, new Date('2026-08-20T20:00:00'))).toBe('OVERDUE')
  })

  it('is MISSED when the scheduled day passed without completion', () => {
    const b = block('2026-08-20T18:00:00', '2026-08-20T19:30:00')
    expect(getTimeBlockStatus(b, new Date('2026-08-21T10:00:00'))).toBe('MISSED')
  })

  it('handles blocks spanning midnight', () => {
    const b = block('2026-08-20T23:30:00', '2026-08-21T01:00:00')
    expect(getTimeBlockStatus(b, new Date('2026-08-20T23:45:00'))).toBe('ACTIVE')
    expect(getTimeBlockStatus(b, new Date('2026-08-21T00:30:00'))).toBe('ACTIVE')
  })
})