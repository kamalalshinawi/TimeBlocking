import { useRef } from 'react'
import { format, isSameDay } from 'date-fns'
import type { Project, Task, TimeBlock, TimeFormat } from '@/domain/types'
import { cn } from '@/lib/utils'
import {
  blocksForDay,
  dayNumber,
  monthWeeks,
  PX_PER_MINUTE,
  weekDays,
  weekdayShort,
} from '@/features/calendar/calendar-utils'
import { CurrentTimeLine, HourLabels, HourLines } from '@/features/calendar/time-grid'
import { TimeBlockCard } from '@/features/calendar/TimeBlockCard'
import { formatTime, parseIso } from '@/utils/date/format'
import { getTimeBlockStatus } from '@/domain/time-blocks/status'

interface ViewProps {
  date: Date
  now: Date
  timeBlocks: TimeBlock[]
  tasks: Task[]
  projects: Project[]
  timeFormat: TimeFormat
  onEdit: (timeBlock: TimeBlock) => void
  onAddAt: (date: Date, minutes: number) => void
  onSelectDay?: (day: Date) => void
}

function blockTaskTitle(timeBlock: TimeBlock, tasks: Task[]): string {
  return tasks.find((task) => task.id === timeBlock.taskId)?.title ?? 'Untitled'
}

function blockProject(timeBlock: TimeBlock, tasks: Task[], projects: Project[]): Project | undefined {
  const task = tasks.find((task) => task.id === timeBlock.taskId)
  if (!task?.projectId) return undefined
  return projects.find((project) => project.id === task.projectId)
}

function useEmptyGridClick(onAddAt: ViewProps['onAddAt'], date: Date) {
  const containerRef = useRef<HTMLDivElement>(null)
  return {
    containerRef,
    handleClick(event: React.MouseEvent) {
      const target = event.target as HTMLElement
      if (target.closest('[data-timeblock]')) return
      const rect = containerRef.current?.getBoundingClientRect()
      if (!rect) return
      const minutes = Math.round((event.clientY - rect.top) / PX_PER_MINUTE / 5) * 5
      onAddAt(date, Math.max(0, Math.min(1425, minutes)))
    },
  }
}

export function DayView({ date, now, timeBlocks, tasks, projects, timeFormat, onEdit, onAddAt }: ViewProps) {
  const { containerRef, handleClick } = useEmptyGridClick(onAddAt, date)
  const dayBlocks = blocksForDay(timeBlocks, date)

  return (
    <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <p className="text-sm font-semibold">{format(date, 'EEEE, MMMM d')}</p>
        {isSameDay(date, now) ? (
          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">Today</span>
        ) : null}
      </div>
      <div ref={containerRef} onClick={handleClick} className="flex w-full overflow-x-auto">
        <HourLabels timeFormat={timeFormat} />
        <div className="relative flex-1" style={{ height: 1440 * PX_PER_MINUTE }}>
          <HourLines />
          {dayBlocks.map((block) => (
            <TimeBlockCard
              key={block.id}
              timeBlock={block}
              day={date}
              now={now}
              taskTitle={blockTaskTitle(block, tasks)}
              projectColor={blockProject(block, tasks, projects)?.color}
              timeFormat={timeFormat}
              onEdit={onEdit}
            />
          ))}
          <CurrentTimeLine day={date} timeFormat={timeFormat} now={now} />
        </div>
      </div>
    </div>
  )
}

function isWeekend(day: Date): boolean {
  return day.getDay() === 0 || day.getDay() === 6
}

export function WeekView({ date, now, timeBlocks, tasks, projects, timeFormat, onEdit, onAddAt }: ViewProps) {
  const days = weekDays(date)
  const { containerRef, handleClick } = useEmptyGridClick(onAddAt, date)

  return (
    <div className="overflow-x-auto rounded-xl border bg-card shadow-sm">
      <div className="grid min-w-[720px] grid-cols-[56px_repeat(7,minmax(0,1fr))]">
        <div />
        {days.map((day) => {
          const today = isSameDay(day, now)
          return (
            <div
              key={day.toISOString()}
              className={cn('border-l px-2 py-2 text-center', today && 'bg-primary/[0.04]', isWeekend(day) && !today && 'bg-muted/30')}
            >
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{weekdayShort(day)}</p>
              <p
                className={cn(
                  'mx-auto flex size-7 items-center justify-center rounded-full text-sm font-semibold',
                  today ? 'bg-primary text-primary-foreground shadow-sm' : 'text-foreground',
                )}
              >
                {dayNumber(day)}
              </p>
            </div>
          )
        })}
      </div>
      <div ref={containerRef} onClick={handleClick} className="grid min-w-[720px] grid-cols-[56px_repeat(7,minmax(0,1fr))]">
        <HourLabels timeFormat={timeFormat} />
        {days.map((day) => {
          const today = isSameDay(day, now)
          return (
            <div
              key={day.toISOString()}
              className={cn(
                'relative border-l border-t',
                today && 'bg-primary/[0.03]',
                isWeekend(day) && !today && 'bg-muted/20',
              )}
              style={{ height: 1440 * PX_PER_MINUTE }}
            >
              <HourLines />
              {blocksForDay(timeBlocks, day).map((block) => (
                <TimeBlockCard
                  key={block.id}
                  timeBlock={block}
                  day={day}
                  now={now}
                  taskTitle={blockTaskTitle(block, tasks)}
                  projectColor={blockProject(block, tasks, projects)?.color}
                  timeFormat={timeFormat}
                  onEdit={onEdit}
                />
              ))}
              <CurrentTimeLine day={day} timeFormat={timeFormat} now={now} />
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function MonthView({
  date,
  now,
  timeBlocks,
  tasks,
  projects,
  timeFormat,
  onEdit,
  onAddAt,
  onSelectDay,
}: ViewProps) {
  const weeks = monthWeeks(date)
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  return (
    <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
      <div className="grid grid-cols-7 border-b bg-muted/30">
        {weekdays.map((day) => (
          <div key={day} className="px-2 py-2 text-center text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {day}
          </div>
        ))}
      </div>
      {weeks.map((week, index) => (
        <div key={index} className="grid grid-cols-7 border-b last:border-b-0">
          {week.map((day) => {
            const dayBlocks = blocksForDay(timeBlocks, day)
            const inMonth = day.getMonth() === date.getMonth()
            const today = isSameDay(day, now)
            const weekend = isWeekend(day)
            return (
              <div
                key={day.toISOString()}
                onClick={() => onAddAt(day, 9 * 60)}
                className={cn(
                  'flex min-h-28 cursor-pointer flex-col items-stretch border-l first:border-l-0 p-1.5 text-left align-top transition-colors hover:bg-muted/40',
                  !inMonth && 'bg-muted/40',
                  weekend && inMonth && 'bg-muted/20',
                  today && 'bg-primary/[0.04]',
                )}
              >
                <span
                  className={cn(
                    'inline-flex size-6 items-center justify-center rounded-full text-sm',
                    today && 'bg-primary font-semibold text-primary-foreground shadow-sm',
                  )}
                >
                  {dayNumber(day)}
                </span>
                <div className="mt-1 flex flex-1 flex-col gap-1 overflow-hidden">
                  {dayBlocks.slice(0, 3).map((block) => {
                    const chipStatus = getTimeBlockStatus(block, now)
                    return (
                      <span
                        key={block.id}
                        role="button"
                        tabIndex={0}
                        onClick={(event) => {
                          event.stopPropagation()
                          onEdit(block)
                        }}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter' || event.key === ' ') {
                            event.stopPropagation()
                            onEdit(block)
                          }
                        }}
                        className={cn(
                          'block cursor-pointer truncate rounded-md border-l-2 bg-primary/10 px-1.5 py-0.5 text-[11px] font-medium hover:bg-primary/20',
                          chipStatus === 'COMPLETED' && 'opacity-55',
                          chipStatus === 'ACTIVE' && 'bg-primary/20 ring-1 ring-inset ring-primary/30',
                        )}
                        style={{ borderLeftColor: blockProject(block, tasks, projects)?.color ?? 'var(--primary)' }}
                      >
                        {formatTime(parseIso(block.startAt), timeFormat)} {blockTaskTitle(block, tasks)}
                      </span>
                    )
                  })}
                  {dayBlocks.length > 3 ? (
                    <span
                      role="button"
                      tabIndex={0}
                      onClick={(event) => {
                        event.stopPropagation()
                        onSelectDay?.(day)
                      }}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.stopPropagation()
                          onSelectDay?.(day)
                        }
                      }}
                      className="block cursor-pointer truncate rounded px-1.5 py-0.5 text-[11px] font-semibold text-muted-foreground hover:bg-muted"
                    >
                      +{dayBlocks.length - 3} more
                    </span>
                  ) : null}
                </div>
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}