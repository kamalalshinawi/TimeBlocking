import type { HeatmapCell } from '@/domain/habits/stats'
import { cn } from '@/lib/utils'

function cellBackground(cell: HeatmapCell, color: string): string {
  if (!cell.scheduled) return 'var(--color-muted)'
  if (!cell.completed) return 'var(--color-muted)'
  return color
}

export function HabitHeatmap({ cells, color, className }: { cells: HeatmapCell[]; color: string; className?: string }) {
  if (cells.length === 0) return null

  const weeks: HeatmapCell[][] = []
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7))
  }

  return (
    <div className={cn('flex gap-1', className)} role="img" aria-label="Completion history over the last weeks">
      {weeks.map((week, index) => (
        <div key={index} className="flex flex-col gap-1">
          {week.map((cell) => (
            <span
              key={cell.date}
              title={`${cell.date}${cell.completed ? ' — completed' : cell.scheduled ? ' — missed' : ''}`}
              aria-hidden="true"
              className="size-2.5 rounded-[3px]"
              style={{ backgroundColor: cellBackground(cell, color) }}
            />
          ))}
        </div>
      ))}
    </div>
  )
}