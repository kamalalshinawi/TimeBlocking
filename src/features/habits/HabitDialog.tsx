import { useState, type FormEvent } from 'react'
import type { Habit, HabitFrequency } from '@/domain/types'
import { useToast } from '@/components/shared/toast'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { HABIT_ICON_KEYS, getHabitIcon } from '@/features/habits/habit-icons'
import { cn } from '@/lib/utils'

const DEFAULT_COLOR = '#4f46e5'
const WEEKDAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const FREQUENCY_LABELS: Record<HabitFrequency, string> = {
  daily: 'Every day',
  weekly: 'Times per week',
  custom: 'On chosen days',
}

function IconPicker({ value, onChange }: { value: string; onChange: (icon: string) => void }) {
  return (
    <div className="grid grid-cols-7 gap-1.5">
      {HABIT_ICON_KEYS.map((key) => {
        const Icon = getHabitIcon(key)
        return (
          <button
            key={key}
            type="button"
            aria-label={`Icon ${key}`}
            aria-pressed={value === key}
            onClick={() => onChange(key)}
            className={cn(
              'flex size-9 items-center justify-center rounded-md border transition-colors focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50',
              value === key
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-input text-muted-foreground hover:bg-muted',
            )}
          >
            <Icon aria-hidden="true" className="size-4" />
          </button>
        )
      })}
    </div>
  )
}

export function HabitDialog({
  open,
  onOpenChange,
  habit,
  onCreate,
  onUpdate,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  habit: Habit | null
  onCreate: (input: {
    name: string
    description: string
    color: string
    icon: string
    frequency: HabitFrequency
    daysOfWeek: number[]
    weeklyTarget: number
  }) => Promise<void>
  onUpdate: (habit: Habit) => Promise<void>
}) {
  const { toast } = useToast()
  const [name, setName] = useState(habit?.name ?? '')
  const [description, setDescription] = useState(habit?.description ?? '')
  const [color, setColor] = useState(habit?.color ?? DEFAULT_COLOR)
  const [icon, setIcon] = useState(habit?.icon ?? 'Sparkles')
  const [frequency, setFrequency] = useState<HabitFrequency>(habit?.frequency ?? 'daily')
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>(habit?.daysOfWeek ?? [])
  const [weeklyTarget, setWeeklyTarget] = useState(habit?.weeklyTarget ?? 3)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function toggleDay(day: number) {
    setDaysOfWeek((current) =>
      current.includes(day) ? current.filter((item) => item !== day) : [...current, day],
    )
  }

  async function submit(event: FormEvent) {
    event.preventDefault()
    if (!name.trim()) {
      setError('Name is required')
      return
    }
    if (frequency === 'custom' && daysOfWeek.length === 0) {
      setError('Choose at least one day')
      return
    }
    if (frequency === 'weekly' && weeklyTarget < 1) {
      setError('Target must be at least 1')
      return
    }
    setBusy(true)
    setError(null)
    try {
      if (habit) {
        await onUpdate({
          ...habit,
          name: name.trim(),
          description: description.trim(),
          color,
          icon,
          frequency,
          daysOfWeek,
          weeklyTarget,
        })
      } else {
        await onCreate({
          name: name.trim(),
          description: description.trim(),
          color,
          icon,
          frequency,
          daysOfWeek,
          weeklyTarget,
        })
      }
      onOpenChange(false)
      toast(habit ? 'Habit updated' : 'Habit created')
    } catch {
      setError('Could not save habit')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{habit ? 'Edit habit' : 'New habit'}</DialogTitle>
          <DialogDescription>
            Define what you want to repeat and how often.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="habit-name">Name</Label>
            <Input
              id="habit-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="e.g. Read 20 pages"
              autoFocus
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="habit-description">Description</Label>
            <Textarea
              id="habit-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Optional note"
              rows={2}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="habit-color">Color</Label>
              <div className="flex items-center gap-2">
                <input
                  id="habit-color"
                  type="color"
                  value={color}
                  onChange={(event) => setColor(event.target.value)}
                  className="h-9 w-12 cursor-pointer rounded border bg-transparent"
                />
                <span className="text-sm text-muted-foreground">{color}</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="habit-frequency">Frequency</Label>
              <Select value={frequency} onValueChange={(value) => setFrequency(value as HabitFrequency)}>
                <SelectTrigger id="habit-frequency" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">{FREQUENCY_LABELS.daily}</SelectItem>
                  <SelectItem value="weekly">{FREQUENCY_LABELS.weekly}</SelectItem>
                  <SelectItem value="custom">{FREQUENCY_LABELS.custom}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {frequency === 'custom' ? (
            <div className="space-y-2">
              <Label>Days of the week</Label>
              <div className="flex flex-wrap gap-1.5">
                {WEEKDAY_LABELS.map((label, index) => (
                  <button
                    key={label}
                    type="button"
                    aria-pressed={daysOfWeek.includes(index)}
                    onClick={() => toggleDay(index)}
                    className={cn(
                      'rounded-md border px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50',
                      daysOfWeek.includes(index)
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-input text-muted-foreground hover:bg-muted',
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {frequency === 'weekly' ? (
            <div className="space-y-2">
              <Label htmlFor="habit-target">Target per week</Label>
              <Input
                id="habit-target"
                type="number"
                min={1}
                max={7}
                value={weeklyTarget}
                onChange={(event) => setWeeklyTarget(Number(event.target.value))}
                className="w-24"
              />
            </div>
          ) : null}

          <div className="space-y-2">
            <Label>Icon</Label>
            <IconPicker value={icon} onChange={setIcon} />
          </div>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}

          <DialogFooter>
            <div className="flex w-full justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={busy}>
                {busy ? 'Saving…' : 'Save'}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}