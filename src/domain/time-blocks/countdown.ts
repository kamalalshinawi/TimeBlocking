import type { TimeBlock, TimeBlockStatus } from '@/domain/types'
import { getTimeBlockStatus } from '@/domain/time-blocks/status'
import {
  formatClockDuration,
  formatHumanMinutes,
  progress,
  remainingMs,
} from '@/domain/time-blocks/time'
import { findUpcomingTaskLabel } from '@/domain/time-blocks/selection'

export interface CountdownInfo {
  status: TimeBlockStatus
  label: string
  progressValue: number
}

export function getCountdownInfo(timeBlock: TimeBlock, now: Date): CountdownInfo {
  const status = getTimeBlockStatus(timeBlock, now)

  switch (status) {
    case 'UPCOMING': {
      const label = findUpcomingTaskLabel([timeBlock], now)
      return { status, label: label ?? 'Upcoming', progressValue: 0 }
    }
    case 'ACTIVE': {
      return {
        status,
        label: `${formatClockDuration(remainingMs(timeBlock, now))} remaining`,
        progressValue: progress(timeBlock, now),
      }
    }
    case 'OVERDUE': {
      const overdueMinutes = -remainingMs(timeBlock, now) / 60000
      return {
        status,
        label: `Overdue by ${formatHumanMinutes(overdueMinutes)}`,
        progressValue: 1,
      }
    }
    case 'COMPLETED': {
      return { status, label: 'Completed', progressValue: 1 }
    }
    case 'MISSED': {
      return { status, label: 'Missed', progressValue: 1 }
    }
  }
}