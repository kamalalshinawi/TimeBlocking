import type { TimeBlock } from '@/domain/types'
import { useCountdown } from '@/hooks/use-countdown'
import { StatusBadge } from '@/components/shared/status-badge'
import { cn } from '@/lib/utils'

export function Countdown({
  timeBlock,
  showProgress = true,
  className,
}: {
  timeBlock: TimeBlock
  showProgress?: boolean
  className?: string
}) {
  const info = useCountdown(timeBlock)

  if (!info) return null

  const isLive = info.status === 'ACTIVE' || info.status === 'UPCOMING' || info.status === 'OVERDUE'

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex flex-wrap items-center gap-2">
        <StatusBadge status={info.status} />
        <span
          className={cn(
            'font-mono text-sm tabular-nums',
            info.status === 'ACTIVE' ? 'font-semibold text-emerald-600 dark:text-emerald-400' : 'text-foreground',
          )}
        >
          {info.label}
        </span>
      </div>
      {showProgress && isLive ? (
        <div
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(info.progressValue * 100)}
          className="h-1.5 w-full overflow-hidden rounded-full bg-muted"
        >
          <div
            className={cn(
              'h-full rounded-full transition-[width] duration-1000',
              info.status === 'OVERDUE' ? 'bg-amber-500' : 'bg-primary',
            )}
            style={{ width: `${Math.round(info.progressValue * 100)}%` }}
          />
        </div>
      ) : null}
    </div>
  )
}