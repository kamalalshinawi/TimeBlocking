import { addMinutes } from 'date-fns'
import type { TimeBlock } from '@/domain/types'
import { parseIso } from '@/utils/date/format'
import { nowIso } from '@/storage/database'

export function completeTimeBlock(timeBlock: TimeBlock, completedAt: Date): TimeBlock {
  return {
    ...timeBlock,
    completedAt: completedAt.toISOString(),
    updatedAt: nowIso(),
  }
}

export function extendTimeBlock(timeBlock: TimeBlock, minutes: number): TimeBlock {
  if (minutes <= 0) return timeBlock
  const newEnd = addMinutes(parseIso(timeBlock.endAt), minutes)
  return {
    ...timeBlock,
    endAt: newEnd.toISOString(),
    extensionMinutes: timeBlock.extensionMinutes + minutes,
    updatedAt: nowIso(),
  }
}

export function rescheduleTimeBlock(
  timeBlock: TimeBlock,
  startAt: Date,
  endAt: Date,
): TimeBlock {
  if (endAt.getTime() <= startAt.getTime()) {
    throw new Error('End time must be after start time')
  }
  return {
    ...timeBlock,
    startAt: startAt.toISOString(),
    endAt: endAt.toISOString(),
    updatedAt: nowIso(),
  }
}