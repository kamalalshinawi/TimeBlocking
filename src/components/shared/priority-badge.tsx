import type { Priority } from '@/domain/types'
import { cn } from '@/lib/utils'

const styles: Record<Priority, { label: string; classes: string }> = {
  low: { label: 'Low', classes: 'bg-muted text-muted-foreground' },
  medium: { label: 'Medium', classes: 'bg-blue-500/10 text-blue-700 dark:text-blue-400' },
  high: { label: 'High', classes: 'bg-red-500/10 text-red-700 dark:text-red-400' },
}

export function PriorityBadge({ priority }: { priority: Priority }) {
  const style = styles[priority]
  return (
    <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', style.classes)}>
      {style.label}
    </span>
  )
}