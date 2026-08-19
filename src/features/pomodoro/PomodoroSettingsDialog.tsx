import { useState, type FormEvent } from 'react'
import type { PomodoroSettings } from '@/domain/types'
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
import { Switch } from '@/components/ui/switch'

function NumberField({
  id,
  label,
  value,
  onChange,
  min = 1,
  max = 180,
  suffix,
}: {
  id: string
  label: string
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  suffix: string
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="flex items-center gap-2">
        <Input
          id={id}
          type="number"
          min={min}
          max={max}
          value={value}
          onChange={(event) => onChange(Number(event.target.value))}
          className="w-24"
        />
        <span className="text-sm text-muted-foreground">{suffix}</span>
      </div>
    </div>
  )
}

function ToggleField({
  label,
  description,
  checked,
  onCheckedChange,
}: {
  label: string
  description: string
  checked: boolean
  onCheckedChange: (checked: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <Label>{label}</Label>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} aria-label={label} />
    </div>
  )
}

export function PomodoroSettingsDialog({
  open,
  onOpenChange,
  settings,
  onSave,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  settings: PomodoroSettings
  onSave: (settings: PomodoroSettings) => Promise<void>
}) {
  const { toast } = useToast()
  const [focusMinutes, setFocusMinutes] = useState(settings.focusMinutes)
  const [shortBreakMinutes, setShortBreakMinutes] = useState(settings.shortBreakMinutes)
  const [longBreakMinutes, setLongBreakMinutes] = useState(settings.longBreakMinutes)
  const [longBreakInterval, setLongBreakInterval] = useState(settings.longBreakInterval)
  const [dailyFocusGoal, setDailyFocusGoal] = useState(settings.dailyFocusGoal)
  const [autoStartBreaks, setAutoStartBreaks] = useState(settings.autoStartBreaks)
  const [autoStartFocus, setAutoStartFocus] = useState(settings.autoStartFocus)
  const [soundEnabled, setSoundEnabled] = useState(settings.soundEnabled)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function submit(event: FormEvent) {
    event.preventDefault()
    if (focusMinutes < 1 || shortBreakMinutes < 1 || longBreakMinutes < 1) {
      setError('Durations must be at least 1 minute')
      return
    }
    if (longBreakInterval < 1 || dailyFocusGoal < 1) {
      setError('Interval and daily goal must be at least 1')
      return
    }
    setBusy(true)
    setError(null)
    try {
      await onSave({
        focusMinutes,
        shortBreakMinutes,
        longBreakMinutes,
        longBreakInterval,
        dailyFocusGoal,
        autoStartBreaks,
        autoStartFocus,
        soundEnabled,
      })
      onOpenChange(false)
      toast('Timer settings saved')
    } catch {
      setError('Could not save settings')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Timer settings</DialogTitle>
          <DialogDescription>Changes apply to new sessions.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <NumberField id="focus-minutes" label="Focus duration" value={focusMinutes} onChange={setFocusMinutes} suffix="minutes" />
            <NumberField id="short-break-minutes" label="Short break" value={shortBreakMinutes} onChange={setShortBreakMinutes} suffix="minutes" />
            <NumberField id="long-break-minutes" label="Long break" value={longBreakMinutes} onChange={setLongBreakMinutes} suffix="minutes" />
            <NumberField id="long-break-interval" label="Long break after" value={longBreakInterval} onChange={setLongBreakInterval} min={1} max={12} suffix="focus sessions" />
          </div>

          <div className="space-y-3 rounded-lg border p-4">
            <ToggleField
              label="Auto-start breaks"
              description="Begin breaks automatically after each focus session."
              checked={autoStartBreaks}
              onCheckedChange={setAutoStartBreaks}
            />
            <ToggleField
              label="Auto-start focus"
              description="Begin the next focus session automatically after a break."
              checked={autoStartFocus}
              onCheckedChange={setAutoStartFocus}
            />
            <ToggleField
              label="Completion sound"
              description="Play a short chime when a session finishes."
              checked={soundEnabled}
              onCheckedChange={setSoundEnabled}
            />
          </div>

          <NumberField id="daily-goal" label="Daily focus goal" value={dailyFocusGoal} onChange={setDailyFocusGoal} min={1} max={40} suffix="sessions per day" />

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