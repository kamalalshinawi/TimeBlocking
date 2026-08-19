import { useRef, useState } from 'react'
import { Check, CheckCircle2 } from 'lucide-react'
import type { TimeBlock, TimeFormat, TimeBlockStatus } from '@/domain/types'
import { useData } from '@/app/providers/data-provider'
import { useToast } from '@/components/shared/toast'
import { cn } from '@/lib/utils'
import {
  getGridPosition,
  MINUTES_PER_DAY,
  minutesSinceMidnight,
  minutesToDate,
} from '@/features/calendar/calendar-utils'
import { detectConflicts } from '@/domain/time-blocks/conflicts'
import { formatTime, parseIso } from '@/utils/date/format'
import { getTimeBlockStatus } from '@/domain/time-blocks/status'

interface TimeBlockCardProps {
  timeBlock: TimeBlock
  day: Date
  now: Date
  taskTitle: string
  projectColor?: string
  timeFormat: TimeFormat
  onEdit: (timeBlock: TimeBlock) => void
  className?: string
}

const DRAG_THRESHOLD = 3

const statusTone: Record<TimeBlockStatus, { dot: string; text: string }> = {
  ACTIVE: { dot: 'bg-emerald-500', text: 'text-emerald-600 dark:text-emerald-400' },
  UPCOMING: { dot: 'bg-foreground/40', text: 'text-muted-foreground' },
  COMPLETED: { dot: 'bg-emerald-500', text: 'text-emerald-600 dark:text-emerald-400' },
  OVERDUE: { dot: 'bg-destructive', text: 'text-destructive' },
  MISSED: { dot: 'bg-muted-foreground/50', text: 'text-muted-foreground' },
}

function withAlpha(hex: string | undefined, alpha: string): string | undefined {
  if (!hex || !/^#[0-9a-fA-F]{6}$/.test(hex)) return undefined
  return `${hex}${alpha}`
}

export function TimeBlockCard({
  timeBlock,
  day,
  now,
  taskTitle,
  projectColor,
  timeFormat,
  onEdit,
  className,
}: TimeBlockCardProps) {
  const { timeBlocks, updateTimeBlock, completeTimeBlockById } = useData()
  const { toast } = useToast()
  const [draft, setDraft] = useState<{ startMin: number; endMin: number } | null>(null)
  const draftRef = useRef<{ startMin: number; endMin: number } | null>(null)
  const gesture = useRef<{ y: number; startMin: number; endMin: number; mode: 'move' | 'resize' } | null>(null)
  const moved = useRef(false)

  const { top, height } = getGridPosition(timeBlock)
  const start = parseIso(timeBlock.startAt)
  const end = parseIso(timeBlock.endAt)
  const status = getTimeBlockStatus(timeBlock, now)
  const isCompleted = timeBlock.completedAt !== null

  const displayTop = draft?.startMin ?? top
  const displayHeight = draft ? (draft.endMin - draft.startMin) * 1 : height

  function commit() {
    const current = draftRef.current
    gesture.current = null
    if (!current) return
    const newStart = minutesToDate(day, current.startMin)
    const newEnd = minutesToDate(day, current.endMin)
    const conflicts = detectConflicts(timeBlocks, timeBlock.id, newStart, newEnd)
    if (conflicts.length > 0) {
      toast(`Conflict with another time block at ${formatTime(parseIso(conflicts[0].startAt), timeFormat)}`, 'destructive')
      setDraft(null)
      draftRef.current = null
      return
    }
    void updateTimeBlock({ ...timeBlock, startAt: newStart.toISOString(), endAt: newEnd.toISOString() })
    setDraft(null)
    draftRef.current = null
  }

  function beginDrag(event: React.PointerEvent, mode: 'move' | 'resize') {
    if (isCompleted) return
    event.preventDefault()
    event.stopPropagation()
    const startMin = minutesSinceMidnight(start)
    const endMin = startMin + Math.round((parseIso(timeBlock.endAt).getTime() - start.getTime()) / 60000)
    gesture.current = { y: event.clientY, startMin, endMin, mode }
    moved.current = false

    const onMove = (ev: PointerEvent) => {
      if (!gesture.current) return
      const deltaY = ev.clientY - gesture.current.y
      if (Math.abs(deltaY) > DRAG_THRESHOLD) moved.current = true
      const delta = Math.round(deltaY / 5) * 5
      let newStart = gesture.current.startMin
      let newEnd = gesture.current.endMin
      if (mode === 'move') {
        newStart = gesture.current.startMin + delta
        newEnd = gesture.current.endMin + delta
      } else {
        newEnd = gesture.current.endMin + delta
      }
      newStart = Math.max(0, newStart)
      newEnd = Math.min(MINUTES_PER_DAY, newEnd)
      if (newEnd - newStart < 5) return
      const next = { startMin: newStart, endMin: newEnd }
      draftRef.current = next
      setDraft(next)
    }

    const onUp = () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onUp)
      commit()
    }

    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    window.addEventListener('pointercancel', onUp)
  }

  function handleClick() {
    if (moved.current) return
    onEdit(timeBlock)
  }

  function handleKeyDown(event: React.KeyboardEvent) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onEdit(timeBlock)
    }
  }

  async function handleQuickComplete() {
    await completeTimeBlockById(timeBlock.id)
    toast('Time block completed')
  }

  const color = projectColor ?? 'var(--primary)'
  const accentBg =
    status === 'ACTIVE'
      ? withAlpha(projectColor, '2e') ?? 'color-mix(in srgb, var(--primary) 18%, transparent)'
      : status === 'COMPLETED'
        ? withAlpha(projectColor, '0f') ?? 'color-mix(in srgb, var(--primary) 6%, transparent)'
        : withAlpha(projectColor, '17') ?? 'color-mix(in srgb, var(--primary) 9%, transparent)'
  const tone = statusTone[status]

  return (
    <div
      role="button"
      tabIndex={0}
      title={`${taskTitle}, ${formatTime(start, timeFormat)} to ${formatTime(end, timeFormat)}`}
      aria-label={`${taskTitle}, ${formatTime(start, timeFormat)} to ${formatTime(end, timeFormat)}, status ${status.toLowerCase()}`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onPointerDown={(event) => beginDrag(event, 'move')}
      data-timeblock=""
      className={cn(
        'group absolute inset-x-1 z-10 cursor-grab touch-none overflow-hidden rounded-lg border-l-[3px] p-1.5 text-left outline-none transition-all hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring',
        isCompleted && 'opacity-55',
        className,
      )}
      style={{
        top: displayTop,
        height: displayHeight,
        borderLeftColor: color,
        backgroundColor: accentBg,
        boxShadow: status === 'ACTIVE' ? `0 0 0 1px ${color}40` : undefined,
      }}
    >
      {!isCompleted ? (
        <button
          type="button"
          aria-label={`Mark "${taskTitle}" block complete`}
          onPointerDown={(event) => event.stopPropagation()}
          onClick={(event) => {
            event.stopPropagation()
            void handleQuickComplete()
          }}
          className="absolute right-1 top-1 z-20 rounded-full bg-background p-1 opacity-0 shadow-sm ring-1 ring-border transition-opacity hover:bg-emerald-50 hover:text-emerald-600 focus-visible:opacity-100 group-hover:opacity-100 dark:hover:bg-emerald-950"
        >
          <Check aria-hidden="true" className="size-3" />
        </button>
      ) : null}

      <div className="flex h-full min-h-0 flex-col gap-0.5">
        <div className="flex items-start justify-between gap-1 pr-5">
          <p className={cn('truncate text-xs font-semibold leading-tight', isCompleted && 'line-through')}>
            {taskTitle}
          </p>
          {isCompleted ? (
            <CheckCircle2 aria-hidden="true" className="size-3.5 shrink-0 text-emerald-500" />
          ) : null}
        </div>
        <p className="truncate text-[10px] tabular-nums text-muted-foreground">
          {formatTime(start, timeFormat)} – {formatTime(end, timeFormat)}
        </p>
        <div className="mt-auto flex items-center gap-1.5">
          <span className={cn('size-1.5 shrink-0 rounded-full', tone.dot, status === 'ACTIVE' && 'animate-pulse')} />
          <span className={cn('truncate text-[9px] font-semibold uppercase tracking-widest', tone.text)}>
            {status === 'ACTIVE' && !isCompleted ? 'In progress' : status.toLowerCase()}
          </span>
        </div>
      </div>

      {!isCompleted ? (
        <button
          type="button"
          aria-label="Resize time block"
          className="absolute inset-x-0 bottom-0 h-2 cursor-ns-resize touch-none hover:bg-foreground/10"
          onPointerDown={(event) => {
            event.stopPropagation()
            beginDrag(event, 'resize')
          }}
        />
      ) : null}
    </div>
  )
}