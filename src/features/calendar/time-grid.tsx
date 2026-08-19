import { format, isSameDay } from 'date-fns'
import type { ReactNode } from 'react'
import type { TimeFormat } from '@/domain/types'
import { useNow } from '@/hooks/use-now'
import { cn } from '@/lib/utils'
import { GRID_HEIGHT, HOURS_PER_DAY, MINUTES_PER_DAY, PX_PER_MINUTE } from '@/features/calendar/calendar-utils'
import { formatTime } from '@/utils/date/format'

export function hourLabel(hour: number, timeFormat: TimeFormat): string {
  const date = new Date(2000, 0, 1, hour, 0)
  return timeFormat === '12h' ? format(date, 'h a') : format(date, 'HH:00')
}

export const hours = Array.from({ length: HOURS_PER_DAY }, (_, index) => index)

export function HourLabels({ timeFormat }: { timeFormat: TimeFormat }) {
  return (
    <div className="relative w-12 shrink-0 select-none" style={{ height: GRID_HEIGHT }}>
      {hours.map((hour) => (
        <span
          key={hour}
          className="absolute right-2 -translate-y-1/2 text-[11px] tabular-nums text-muted-foreground"
          style={{ top: hour * 60 * PX_PER_MINUTE }}
        >
          {hourLabel(hour, timeFormat)}
        </span>
      ))}
    </div>
  )
}

export function HourLines({ className }: { className?: string }) {
  return (
    <div aria-hidden="true" className={cn('pointer-events-none absolute inset-0', className)}>
      {hours.map((hour) => (
        <div
          key={hour}
          className="absolute inset-x-0 border-t border-border/60"
          style={{ top: hour * 60 * PX_PER_MINUTE }}
        />
      ))}
      {hours.map((hour) => (
        <div
          key={`half-${hour}`}
          className="absolute inset-x-0 border-t border-border/20"
          style={{ top: (hour * 60 + 30) * PX_PER_MINUTE }}
        />
      ))}
      <div className="absolute inset-x-0 top-0 h-px border-t border-border" />
    </div>
  )
}

export function CurrentTimeLine({
  day,
  timeFormat,
  now,
  className,
}: {
  day: Date
  timeFormat?: TimeFormat
  now?: Date
  className?: string
}) {
  const liveNow = useNow(30_000)
  const current = now ?? liveNow
  if (!isSameDay(current, day)) return null
  const top = Math.min(MINUTES_PER_DAY, current.getHours() * 60 + current.getMinutes()) * PX_PER_MINUTE
  return (
    <div aria-hidden="true" className={cn('pointer-events-none absolute inset-x-0 z-20', className)} style={{ top }}>
      <div className="relative -mt-px">
        <div className="h-0.5 rounded bg-red-500/90 shadow-[0_0_8px_rgba(239,68,68,0.6)]" />
        <span className="absolute -left-1 -top-[3px] size-2.5 rounded-full bg-red-500 ring-2 ring-background" />
        {timeFormat ? (
          <span className="absolute left-3 -top-2.5 rounded-md bg-red-500 px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-white shadow-sm">
            {formatTime(current, timeFormat)}
          </span>
        ) : null}
      </div>
    </div>
  )
}

export function TimeGrid({
  children,
  timeFormat,
  day,
  className,
}: {
  children: ReactNode
  timeFormat: TimeFormat
  day: Date
  className?: string
}) {
  return (
    <div className={cn('relative flex w-full overflow-hidden', className)}>
      <HourLabels timeFormat={timeFormat} />
      <div className="relative flex-1" style={{ height: GRID_HEIGHT }}>
        <HourLines />
        {children}
        <CurrentTimeLine day={day} />
      </div>
    </div>
  )
}