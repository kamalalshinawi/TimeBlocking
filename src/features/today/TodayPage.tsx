import { useEffect, useMemo, useRef } from 'react'
import { CalendarPlus } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useData } from '@/app/providers/data-provider'
import { useNow } from '@/hooks/use-now'
import { Countdown } from '@/components/shared/countdown'
import { TimeBlockActions } from '@/components/shared/time-block-actions'
import { EmptyState } from '@/components/shared/empty-state'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { blocksForDay } from '@/features/calendar/calendar-utils'
import { formatFullDate, formatTime, parseIso } from '@/utils/date/format'

export function TodayPage() {
  const { tasks, timeBlocks, profile } = useData()
  const now = useNow(1000)
  const timeFormat = profile?.timeFormat ?? '12h'

  const todayBlocks = useMemo(() => blocksForDay(timeBlocks, now), [timeBlocks, now])
  const nowMinutes = now.getHours() * 60 + now.getMinutes()
  const scrollRef = useRef<HTMLDivElement>(null)

  const markerIndex = todayBlocks.findIndex(
    (block) => parseIso(block.startAt).getTime() > now.getTime(),
  )
  const todayKey = now.toDateString()

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [todayKey])

  const rows: React.ReactNode[] = []
  todayBlocks.forEach((block, index) => {
    if (index === markerIndex) {
      rows.push(
        <div key={`now-${index}`} ref={scrollRef} className="flex items-center gap-2 py-1">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs font-semibold uppercase tracking-wide text-primary">Now</span>
          <div className="h-px flex-1 bg-border" />
        </div>,
      )
    }
    rows.push(
      <div key={block.id} className="grid grid-cols-[72px_1fr] items-start gap-3">
        <div className="pt-3 text-right text-sm tabular-nums text-muted-foreground">
          {formatTime(parseIso(block.startAt), timeFormat)}
        </div>
        <Card className={block.completedAt ? 'opacity-70' : ''}>
          <CardContent className="space-y-2 p-4">
            <div className="flex items-start justify-between gap-2">
              <p className="font-semibold">
                {tasks.find((task) => task.id === block.taskId)?.title ?? 'Untitled'}
              </p>
              <span className="text-sm tabular-nums text-muted-foreground">
                {formatTime(parseIso(block.startAt), timeFormat)} –{' '}
                {formatTime(parseIso(block.endAt), timeFormat)}
              </span>
            </div>
            <Countdown timeBlock={block} />
            <TimeBlockActions
              timeBlock={block}
              allowComplete={block.completedAt === null}
              allowExtend={nowMinutes >= parseIso(block.startAt).getHours() * 60 + parseIso(block.startAt).getMinutes()}
              allowReschedule={block.completedAt === null}
            />
          </CardContent>
        </Card>
      </div>,
    )
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Today</h1>
          <p className="text-sm text-muted-foreground">{formatFullDate(now)}</p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link to="/calendar">
            <CalendarPlus aria-hidden="true" />
            Schedule
          </Link>
        </Button>
      </div>

      {todayBlocks.length === 0 ? (
        <EmptyState
          icon={CalendarPlus}
          title="Nothing scheduled today"
          description="Plan your day by creating a time block on the calendar."
          action={
            <Button asChild>
              <Link to="/calendar">Go to Calendar</Link>
            </Button>
          }
        />
      ) : (
        <div className="space-y-2">{rows}</div>
      )}
    </div>
  )
}