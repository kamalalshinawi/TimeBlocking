import { useState } from 'react'
import { addDays, addMonths, isSameDay } from 'date-fns'
import { CalendarPlus, ChevronLeft, ChevronRight } from 'lucide-react'
import type { TimeBlock } from '@/domain/types'
import { useData } from '@/app/providers/data-provider'
import { useToast } from '@/components/shared/toast'
import { useNow } from '@/hooks/use-now'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { DayView, MonthView, WeekView } from '@/features/calendar/views'
import { TimeBlockDialog } from '@/features/calendar/TimeBlockDialog'
import { dayLabel, monthLabel, moveWeek } from '@/features/calendar/calendar-utils'
import { parseIso } from '@/utils/date/format'

type ViewMode = 'day' | 'week' | 'month'

export function CalendarPage() {
  const { timeBlocks, tasks, projects, profile, deleteTimeBlock } = useData()
  const { toast } = useToast()
  const now = useNow(30_000)
  const [view, setView] = useState<ViewMode>('week')
  const [anchor, setAnchor] = useState<Date>(() => new Date())
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<TimeBlock | null>(null)
  const [addAt, setAddAt] = useState({ date: new Date(), minutes: 9 * 60 })

  const timeFormat = profile?.timeFormat ?? '12h'

  const viewModes: { value: ViewMode; label: string }[] = [
    { value: 'day', label: 'Day' },
    { value: 'week', label: 'Week' },
    { value: 'month', label: 'Month' },
  ]

  function goPrevious() {
    if (view === 'day') setAnchor((date) => addDays(date, -1))
    else if (view === 'week') setAnchor((date) => moveWeek(date, -1))
    else setAnchor((date) => addMonths(date, -1))
  }

  function goNext() {
    if (view === 'day') setAnchor((date) => addDays(date, 1))
    else if (view === 'week') setAnchor((date) => moveWeek(date, 1))
    else setAnchor((date) => addMonths(date, 1))
  }

  function goToday() {
    setAnchor(new Date())
  }

  function openCreate(date: Date, minutes: number) {
    setEditing(null)
    setAddAt({ date, minutes })
    setDialogOpen(true)
  }

  function openEdit(timeBlock: TimeBlock) {
    setEditing(timeBlock)
    setAddAt({ date: new Date(timeBlock.startAt), minutes: 9 * 60 })
    setDialogOpen(true)
  }

  function selectDay(day: Date) {
    setAnchor(day)
    setView('day')
  }

  async function handleDelete(timeBlock: TimeBlock) {
    await deleteTimeBlock(timeBlock.id)
    toast('Time block deleted')
  }

  const label = view === 'day' ? dayLabel(anchor) : monthLabel(anchor)
  const todayCount = timeBlocks.filter((block) => isSameDay(parseIso(block.startAt), now)).length

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold">Calendar</h1>
        <Button onClick={() => openCreate(new Date(), 9 * 60)}>
          <CalendarPlus aria-hidden="true" />
          New block
        </Button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-card p-2 shadow-sm">
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon-sm" onClick={goPrevious} aria-label="Previous">
            <ChevronLeft aria-hidden="true" />
          </Button>
          <Button variant="outline" size="sm" onClick={goToday} className="px-3">
            Today
          </Button>
          <Button variant="ghost" size="icon-sm" onClick={goNext} aria-label="Next">
            <ChevronRight aria-hidden="true" />
          </Button>
          <div className="ml-2 hidden sm:block">
            <p className="text-base font-semibold leading-tight">{label}</p>
            <p className="text-xs text-muted-foreground">
              {todayCount} {todayCount === 1 ? 'block' : 'blocks'} today
            </p>
          </div>
        </div>

        <div className="flex gap-1 rounded-lg bg-muted p-1">
          {viewModes.map((mode) => (
            <button
              key={mode.value}
              type="button"
              onClick={() => setView(mode.value)}
              className={cn(
                'rounded-md px-3 py-1 text-sm font-medium transition-colors',
                view === mode.value
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {mode.label}
            </button>
          ))}
        </div>
      </div>

      {view === 'day' ? (
        <DayView
          date={anchor}
          now={now}
          timeBlocks={timeBlocks}
          tasks={tasks}
          projects={projects}
          timeFormat={timeFormat}
          onEdit={openEdit}
          onAddAt={openCreate}
        />
      ) : null}
      {view === 'week' ? (
        <WeekView
          date={anchor}
          now={now}
          timeBlocks={timeBlocks}
          tasks={tasks}
          projects={projects}
          timeFormat={timeFormat}
          onEdit={openEdit}
          onAddAt={openCreate}
        />
      ) : null}
      {view === 'month' ? (
        <MonthView
          date={anchor}
          now={now}
          timeBlocks={timeBlocks}
          tasks={tasks}
          projects={projects}
          timeFormat={timeFormat}
          onEdit={openEdit}
          onAddAt={openCreate}
          onSelectDay={selectDay}
        />
      ) : null}

      <TimeBlockDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        timeBlock={editing}
        defaultDate={addAt.date}
        onSaved={() => undefined}
        onDelete={handleDelete}
      />
    </div>
  )
}