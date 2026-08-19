import { isSameDay } from 'date-fns'
import type { TimeBlock, TimeBlockStatus } from '@/domain/types'
import { parseIso } from '@/utils/date/format'

export function getTimeBlockStatus(timeBlock: TimeBlock, now: Date): TimeBlockStatus {
  if (timeBlock.completedAt) return 'COMPLETED'
  const start = parseIso(timeBlock.startAt)
  const end = parseIso(timeBlock.endAt)

  if (now.getTime() < start.getTime()) return 'UPCOMING'
  if (now.getTime() <= end.getTime()) return 'ACTIVE'

  if (isSameDay(start, now)) return 'OVERDUE'
  return 'MISSED'
}