import type { TimeBlockStatus } from '@/domain/types'
import { cn } from '@/lib/utils'

const styles: Record<TimeBlockStatus, { label: string; classes: string; dot: string }> = {
  UPCOMING: {
    label: 'Upcoming',
    classes: 'bg-blue-500/10 text-blue-700 dark:text-blue-400',
    dot: 'bg-blue-500',
  },
  ACTIVE: {
    label: 'Active',
    classes: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
    dot: 'bg-emerald-500',
  },
  COMPLETED: {
    label: 'Completed',
    classes: 'bg-muted text-muted-foreground',
    dot: 'bg-muted-foreground',
  },
  OVERDUE: {
    label: 'Overdue',
    classes: 'bg-amber-500/10 text-amber-700 dark:text-amber-400',
    dot: 'bg-amber-500',
  },
  MISSED: {
    label: 'Missed',
    classes: 'bg-red-500/10 text-red-700 dark:text-red-400',
    dot: 'bg-red-500',
  },
}

export function StatusBadge({ status }: { status: TimeBlockStatus }) {
  const style = styles[status]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium',
        style.classes,
      )}
    >
      <span aria-hidden="true" className={cn('size-1.5 rounded-full', style.dot)} />
      {style.label}
    </span>
  )
}