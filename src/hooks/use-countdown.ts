import type { TimeBlock } from '@/domain/types'
import { getCountdownInfo, type CountdownInfo } from '@/domain/time-blocks/countdown'
import { useNow } from '@/hooks/use-now'

export function useCountdown(timeBlock: TimeBlock | null, intervalMs = 1000): CountdownInfo | null {
  const now = useNow(intervalMs)
  if (!timeBlock) return null
  return getCountdownInfo(timeBlock, now)
}