import { describe, expect, it } from 'vitest'
import type { TimeBlock } from '@/domain/types'
import { detectConflicts } from '@/domain/time-blocks/conflicts'
import { completeTimeBlock, extendTimeBlock, rescheduleTimeBlock } from '@/domain/time-blocks/operations'

function block(id: string, startAt: string, endAt: string, completedAt: string | null = null): TimeBlock {
  return {
    id,
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

describe('detectConflicts', () => {
  const existing = [
    block('a', '2026-08-20T06:00:00', '2026-08-20T07:30:00'),
    block('b', '2026-08-20T09:00:00', '2026-08-20T10:00:00'),
  ]

  it('detects a candidate that overlaps another block', () => {
    const conflicts = detectConflicts(
      existing,
      'new',
      new Date('2026-08-20T07:00:00'),
      new Date('2026-08-20T08:00:00'),
    )
    expect(conflicts.map((block) => block.id)).toEqual(['a'])
  })

  it('detects when a candidate is fully inside another block', () => {
    const conflicts = detectConflicts(
      existing,
      'new',
      new Date('2026-08-20T06:30:00'),
      new Date('2026-08-20T07:00:00'),
    )
    expect(conflicts.map((block) => block.id)).toEqual(['a'])
  })

  it('allows back-to-back blocks', () => {
    const conflicts = detectConflicts(
      existing,
      'new',
      new Date('2026-08-20T07:30:00'),
      new Date('2026-08-20T08:30:00'),
    )
    expect(conflicts).toEqual([])
  })

  it('ignores the candidate itself', () => {
    const conflicts = detectConflicts(
      existing,
      'a',
      new Date('2026-08-20T06:30:00'),
      new Date('2026-08-20T07:00:00'),
    )
    expect(conflicts).toEqual([])
  })

  it('ignores completed blocks', () => {
    const withCompleted = [...existing, block('c', '2026-08-20T06:00:00', '2026-08-20T08:00:00', '2026-08-20T07:00:00')]
    const conflicts = detectConflicts(
      withCompleted,
      'new',
      new Date('2026-08-20T07:00:00'),
      new Date('2026-08-20T08:00:00'),
    )
    expect(conflicts.map((block) => block.id)).not.toContain('c')
  })
})

describe('operations', () => {
  it('completes a time block', () => {
    const b = block('a', '2026-08-20T18:00:00', '2026-08-20T19:30:00')
    const completed = completeTimeBlock(b, new Date('2026-08-20T19:00:00'))
    expect(completed.completedAt).toBe(new Date('2026-08-20T19:00:00').toISOString())
  })

  it('extends a time block and records extension minutes', () => {
    const b = block('a', '2026-08-20T18:00:00', '2026-08-20T19:30:00')
    const extended = extendTimeBlock(b, 30)
    expect(parseISO(extended.endAt)).toBe(parseISO('2026-08-20T20:00:00'))
    expect(extended.extensionMinutes).toBe(30)
    expect(extended.originalEndAt).toBe(b.originalEndAt)
  })

  it('ignores non-positive extensions', () => {
    const b = block('a', '2026-08-20T18:00:00', '2026-08-20T19:30:00')
    expect(extendTimeBlock(b, 0).endAt).toBe(b.endAt)
    expect(extendTimeBlock(b, -10).endAt).toBe(b.endAt)
  })

  it('reschedules while preserving the original schedule', () => {
    const b = block('a', '2026-08-20T18:00:00', '2026-08-20T19:30:00')
    const rescheduled = rescheduleTimeBlock(b, new Date('2026-08-21T09:00:00'), new Date('2026-08-21T10:00:00'))
    expect(rescheduled.startAt).toBe(new Date('2026-08-21T09:00:00').toISOString())
    expect(rescheduled.endAt).toBe(new Date('2026-08-21T10:00:00').toISOString())
    expect(rescheduled.originalStartAt).toBe(b.originalStartAt)
  })

  it('rejects a reschedule with end before start', () => {
    const b = block('a', '2026-08-20T18:00:00', '2026-08-20T19:30:00')
    expect(() => rescheduleTimeBlock(b, new Date('2026-08-21T10:00:00'), new Date('2026-08-21T09:00:00'))).toThrow()
  })
})

function parseISO(iso: string): number {
  return new Date(iso).getTime()
}