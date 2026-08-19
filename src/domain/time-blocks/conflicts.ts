import type { TimeBlock } from '@/domain/types'
import { parseIso } from '@/utils/date/format'

function overlaps(startA: Date, endA: Date, startB: Date, endB: Date): boolean {
  return startA.getTime() < endB.getTime() && endA.getTime() > startB.getTime()
}

export function detectConflicts(
  timeBlocks: TimeBlock[],
  candidateId: string | null,
  startAt: Date,
  endAt: Date,
): TimeBlock[] {
  return timeBlocks.filter((block) => {
    if (block.id === candidateId) return false
    if (block.completedAt) return false
    return overlaps(startAt, endAt, parseIso(block.startAt), parseIso(block.endAt))
  })
}