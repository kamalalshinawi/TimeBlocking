import type { TimeBlock } from '@/domain/types'
import { parseIso } from '@/utils/date/format'
import { getTimeBlockStatus } from '@/domain/time-blocks/status'

export function findCurrentBlock(timeBlocks: TimeBlock[], now: Date): TimeBlock | null {
  return timeBlocks.find((block) => getTimeBlockStatus(block, now) === 'ACTIVE') ?? null
}

export function findNextBlock(timeBlocks: TimeBlock[], now: Date): TimeBlock | null {
  const upcoming = timeBlocks
    .filter((block) => parseIso(block.startAt).getTime() > now.getTime())
    .sort((a, b) => parseIso(a.startAt).getTime() - parseIso(b.startAt).getTime())
  return upcoming[0] ?? null
}

export function findUpcomingTaskLabel(timeBlocks: TimeBlock[], now: Date): string | null {
  const next = findNextBlock(timeBlocks, now)
  if (!next) return null
  const ms = parseIso(next.startAt).getTime() - now.getTime()
  const minutes = Math.max(0, Math.round(ms / 60000))
  if (minutes < 1) return 'Starts now'
  if (minutes < 60) return `Starts in ${minutes} minutes`
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  return rest === 0 ? `Starts in ${hours}h` : `Starts in ${hours}h ${rest}m`
}