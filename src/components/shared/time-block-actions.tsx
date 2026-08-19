import { useState } from 'react'
import { CalendarClock, Check, Plus } from 'lucide-react'
import { addDays, addMinutes } from 'date-fns'
import type { TimeBlock } from '@/domain/types'
import { useData } from '@/app/providers/data-provider'
import { useToast } from '@/components/shared/toast'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { plannedDurationMs } from '@/domain/time-blocks/time'
import { dateInputValue, formatTime, parseIso, timeInputValue } from '@/utils/date/format'

function roundUpToNextMinutes(date: Date, step: number): Date {
  const minutes = Math.ceil(date.getTime() / 60000 / step) * step * 60000
  return new Date(minutes)
}

function ExtendDialog({ timeBlock, disabled }: { timeBlock: TimeBlock; disabled: boolean }) {
  const { extendTimeBlockById } = useData()
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [custom, setCustom] = useState('15')
  const [busy, setBusy] = useState(false)

  const presets = [15, 30, 60]

  async function extend(minutes: number) {
    setBusy(true)
    try {
      await extendTimeBlockById(timeBlock.id, minutes)
      toast(`Extended by ${minutes} minutes`)
      setOpen(false)
    } catch {
      toast('Could not extend the time block', 'destructive')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" disabled={disabled}>
          <Plus aria-hidden="true" />
          Extend
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Extend time block</DialogTitle>
          <DialogDescription>
            Add time to the current block. The original schedule is preserved.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-3 gap-2">
          {presets.map((minutes) => (
            <Button
              key={minutes}
              variant="outline"
              onClick={() => extend(minutes)}
              disabled={busy}
            >
              +{minutes}m
            </Button>
          ))}
        </div>
        <div className="flex items-end gap-2">
          <div className="flex-1 space-y-2">
            <Label htmlFor="extend-custom">Custom minutes</Label>
            <Input
              id="extend-custom"
              type="number"
              min={1}
              max={1440}
              value={custom}
              onChange={(event) => setCustom(event.target.value)}
            />
          </div>
          <Button
            onClick={() => {
              const minutes = Number(custom)
              if (Number.isFinite(minutes) && minutes > 0) void extend(minutes)
            }}
            disabled={busy}
          >
            Extend
          </Button>
        </div>
        <DialogFooter className="sm:justify-start">
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function RescheduleDialog({ timeBlock }: { timeBlock: TimeBlock }) {
  const { rescheduleTimeBlockById } = useData()
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const durationMinutes = Math.max(30, Math.round(plannedDurationMs(timeBlock) / 60000))

  const originalStart = parseIso(timeBlock.startAt)
  const [customDate, setCustomDate] = useState(dateInputValue(originalStart))
  const [customStart, setCustomStart] = useState(timeInputValue(originalStart))
  const [customEnd, setCustomEnd] = useState(timeInputValue(parseIso(timeBlock.endAt)))

  async function apply(startAt: Date, endAt: Date) {
    setBusy(true)
    try {
      await rescheduleTimeBlockById(timeBlock.id, startAt, endAt)
      toast('Time block rescheduled')
      setOpen(false)
    } catch {
      toast('Could not reschedule the time block', 'destructive')
    } finally {
      setBusy(false)
    }
  }

  function laterToday() {
    const start = roundUpToNextMinutes(addMinutes(new Date(), 15), 5)
    apply(start, addMinutes(start, durationMinutes))
  }

  function tomorrow() {
    const start = addDays(originalStart, 1)
    apply(start, addMinutes(start, durationMinutes))
  }

  function custom() {
    const start = new Date(`${customDate}T${customStart}:00`)
    const end = new Date(`${customDate}T${customEnd}:00`)
    if (end.getTime() <= start.getTime()) {
      toast('End time must be after start time', 'destructive')
      return
    }
    apply(start, end)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <CalendarClock aria-hidden="true" />
          Reschedule
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reschedule time block</DialogTitle>
          <DialogDescription>Move this time block to a new day or time.</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" onClick={laterToday} disabled={busy}>
            Later today
          </Button>
          <Button variant="outline" onClick={tomorrow} disabled={busy}>
            Tomorrow
          </Button>
        </div>

        <div className="space-y-3 rounded-lg border p-3">
          <p className="text-sm font-medium">Custom date and time</p>
          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-1.5">
              <Label htmlFor="rs-date">Date</Label>
              <Input
                id="rs-date"
                type="date"
                value={customDate}
                onChange={(event) => setCustomDate(event.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="rs-start">Start</Label>
              <Input
                id="rs-start"
                type="time"
                value={customStart}
                onChange={(event) => setCustomStart(event.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="rs-end">End</Label>
              <Input
                id="rs-end"
                type="time"
                value={customEnd}
                onChange={(event) => setCustomEnd(event.target.value)}
              />
            </div>
          </div>
          <Button onClick={custom} disabled={busy} className="w-full">
            Apply custom time
          </Button>
        </div>

        <DialogFooter className="sm:justify-start">
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function TimeBlockActions({
  timeBlock,
  allowComplete = true,
  allowExtend = true,
  allowReschedule = true,
}: {
  timeBlock: TimeBlock
  allowComplete?: boolean
  allowExtend?: boolean
  allowReschedule?: boolean
}) {
  const { completeTimeBlockById } = useData()
  const { toast } = useToast()
  const [completing, setCompleting] = useState(false)
  const isCompleted = timeBlock.completedAt !== null

  async function complete() {
    setCompleting(true)
    try {
      await completeTimeBlockById(timeBlock.id)
      toast('Task completed')
    } catch {
      toast('Could not complete the task', 'destructive')
    } finally {
      setCompleting(false)
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {allowComplete && !isCompleted ? (
        <Button size="sm" onClick={complete} disabled={completing}>
          <Check aria-hidden="true" />
          {completing ? 'Completing…' : 'Complete'}
        </Button>
      ) : null}
      {allowExtend && !isCompleted ? <ExtendDialog timeBlock={timeBlock} disabled={completing} /> : null}
      {allowReschedule ? <RescheduleDialog timeBlock={timeBlock} /> : null}
      {isCompleted && timeBlock.completedAt ? (
        <span className="text-sm text-muted-foreground">
          Completed at {formatTime(parseIso(timeBlock.completedAt), '12h')}
        </span>
      ) : null}
    </div>
  )
}