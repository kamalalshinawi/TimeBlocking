import { isSameDay } from 'date-fns'
import { CalendarPlus, CheckCircle2, Clock, ListTodo, Timer } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useData } from '@/app/providers/data-provider'
import { useNow } from '@/hooks/use-now'
import { Countdown } from '@/components/shared/countdown'
import { TimeBlockActions } from '@/components/shared/time-block-actions'
import { EmptyState } from '@/components/shared/empty-state'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { findCurrentBlock, findNextBlock } from '@/domain/time-blocks/selection'
import { formatDurationHoursMinutes, plannedDurationMs } from '@/domain/time-blocks/time'
import { formatDate, formatTime, parseIso } from '@/utils/date/format'

export function DashboardPage() {
  const { tasks, timeBlocks, profile } = useData()
  const now = useNow(1000)
  const timeFormat = profile?.timeFormat ?? '12h'

  const currentBlock = findCurrentBlock(timeBlocks, now)
  const nextBlock = findNextBlock(timeBlocks, now)
  const todayBlocks = timeBlocks.filter((block) => isSameDay(parseIso(block.startAt), now))

  const completedCount = todayBlocks.filter((block) => block.completedAt).length
  const plannedMs = todayBlocks.reduce((sum, block) => sum + plannedDurationMs(block), 0)
  const completionPct = todayBlocks.length === 0 ? 0 : Math.round((completedCount / todayBlocks.length) * 100)

  const hour = now.getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  const currentTask = currentBlock
    ? tasks.find((task) => task.id === currentBlock.taskId)
    : null
  const nextTask = nextBlock ? tasks.find((task) => task.id === nextBlock.taskId) : null

  const stats = [
    { label: "Today's tasks", value: String(todayBlocks.length), icon: ListTodo },
    { label: 'Completed', value: String(completedCount), icon: CheckCircle2 },
    { label: 'Planned time', value: formatDurationHoursMinutes(plannedMs), icon: Clock },
    { label: 'Completion', value: `${completionPct}%`, icon: Timer },
  ]

  const hasAnyContent = currentBlock || nextBlock || todayBlocks.length > 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">
          {greeting}
          {profile?.name ? `, ${profile.name}` : ''}
        </h1>
        <p className="text-sm text-muted-foreground">{formatDate(now)}</p>
      </div>

      {!hasAnyContent ? (
        <EmptyState
          icon={CalendarPlus}
          title="Nothing scheduled today"
          description="Create a time block to start using TimeBlocking."
          action={
            <Button asChild>
              <Link to="/calendar">Go to Calendar</Link>
            </Button>
          }
        />
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        {currentBlock ? (
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <span className="size-2 animate-pulse rounded-full bg-emerald-500" aria-hidden="true" />
                Current task
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-lg font-semibold">{currentTask?.title ?? 'Untitled'}</p>
                <p className="text-sm text-muted-foreground">
                  {formatTime(parseIso(currentBlock.startAt), timeFormat)} –{' '}
                  {formatTime(parseIso(currentBlock.endAt), timeFormat)}
                </p>
              </div>
              <Countdown timeBlock={currentBlock} />
              <TimeBlockActions timeBlock={currentBlock} />
            </CardContent>
          </Card>
        ) : null}

        {nextBlock ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <span className="size-2 rounded-full bg-blue-500" aria-hidden="true" />
                Next up
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="font-semibold">{nextTask?.title ?? 'Untitled'}</p>
              <Countdown timeBlock={nextBlock} showProgress={false} />
              <p className="text-sm text-muted-foreground">
                {formatTime(parseIso(nextBlock.startAt), timeFormat)} –{' '}
                {formatTime(parseIso(nextBlock.endAt), timeFormat)}
              </p>
            </CardContent>
          </Card>
        ) : null}
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="flex items-center gap-3 pt-6">
              <stat.icon aria-hidden="true" className="size-5 text-muted-foreground" />
              <div>
                <p className="text-2xl font-semibold tabular-nums">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}