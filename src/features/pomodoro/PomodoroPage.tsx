import { useEffect, useMemo, useRef, useState } from 'react'
import { Coffee, Flame, Pause, Play, RotateCcw, Settings, SkipForward, Timer, Trophy } from 'lucide-react'
import type { PomodoroPhase, PomodoroSettings } from '@/domain/types'
import { useData } from '@/app/providers/data-provider'
import { useNow } from '@/hooks/use-now'
import { useToast } from '@/components/shared/toast'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { TimerRing } from '@/features/pomodoro/TimerRing'
import { PomodoroSettingsDialog } from '@/features/pomodoro/PomodoroSettingsDialog'
import {
  createIdleSession,
  formatTimerLabel,
  getFocusGoalProgress,
  getFocusMinutesOn,
  getProgress,
  getRecentFocusSummary,
  getRemainingSeconds,
  getTotalFocusMinutes,
} from '@/domain/pomodoro'
import { playCompletionSound } from '@/utils/audio'
import { formatTime, parseIso } from '@/utils/date/format'
import { cn } from '@/lib/utils'

const PHASE_META: Record<PomodoroPhase, { label: string; color: string; ring: string }> = {
  focus: { label: 'Focus', color: 'text-red-600 dark:text-red-400', ring: '#ef4444' },
  'short-break': { label: 'Short break', color: 'text-emerald-600 dark:text-emerald-400', ring: '#10b981' },
  'long-break': { label: 'Long break', color: 'text-blue-600 dark:text-blue-400', ring: '#3b82f6' },
}

function phaseSessionLabel(sessionPhase: PomodoroPhase, focusCycleCount: number, settings: PomodoroSettings): string {
  if (sessionPhase === 'focus') {
    const current = (focusCycleCount % settings.longBreakInterval) + 1
    return `Focus session ${current} of ${settings.longBreakInterval}`
  }
  return sessionPhase === 'long-break' ? 'Long break' : 'Short break'
}

export function PomodoroPage() {
  const {
    tasks,
    pomodoroSettings,
    pomodoroSessions,
    activePomodoro,
    startPomodoro,
    pausePomodoro,
    resumePomodoro,
    finishPomodoro,
    skipPomodoro,
    resetPomodoro,
    attachTaskToPomodoro,
    updatePomodoroSettings,
  } = useData()
  const { toast } = useToast()
  const now = useNow(1000)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const finishingRef = useRef(false)

  const session = useMemo(() => {
    if (activePomodoro.activeSession) return activePomodoro.activeSession
    return createIdleSession('focus', pomodoroSettings)
  }, [activePomodoro.activeSession, pomodoroSettings])

  const remaining = getRemainingSeconds(session, now)
  const progress = getProgress(session, now)
  const meta = PHASE_META[session.phase]
  const persistedSession = activePomodoro.activeSession
  const phaseLabel = phaseSessionLabel(session.phase, activePomodoro.focusCycleCount, pomodoroSettings)

  useEffect(() => {
    if (session.status === 'running' && remaining <= 0 && !finishingRef.current) {
      finishingRef.current = true
      if (pomodoroSettings.soundEnabled) playCompletionSound()
      void finishPomodoro().finally(() => {
        finishingRef.current = false
      })
    }
  }, [session.status, remaining, finishPomodoro, pomodoroSettings.soundEnabled])

  useEffect(() => {
    if (session.status === 'running' || session.status === 'paused') {
      document.title = `${formatTimerLabel(remaining)} · ${meta.label} — TimeBlocking`
    } else {
      document.title = 'TimeBlocking'
    }
    return () => {
      document.title = 'TimeBlocking'
    }
  }, [session.status, remaining, meta.label])

  const today = now
  const goal = getFocusGoalProgress(pomodoroSessions, pomodoroSettings, today)
  const todayMinutes = Math.round(getFocusMinutesOn(pomodoroSessions, today))
  const week = getRecentFocusSummary(pomodoroSessions, today, 7)
  const totalMinutes = Math.round(getTotalFocusMinutes(pomodoroSessions))

  const linkedTask = session.taskId ? tasks.find((task) => task.id === session.taskId) : null

  function handleStart() {
    void startPomodoro()
  }

  function handleTaskChange(taskId: string) {
    if (taskId === 'none') {
      void attachTaskToPomodoro(null)
    } else if (persistedSession) {
      void attachTaskToPomodoro(taskId)
    } else {
      void startPomodoro(taskId)
    }
  }

  async function handleSkip() {
    if (!persistedSession) return
    await skipPomodoro()
    toast('Session skipped')
  }

  async function handleReset() {
    await resetPomodoro()
    toast('Timer reset')
  }

  const stats = [
    { label: "Today's sessions", value: `${goal.completed} / ${goal.goal}`, icon: Flame },
    { label: 'Focus today', value: `${todayMinutes}m`, icon: Timer },
    { label: 'This week', value: `${week.sessions} sessions`, icon: Trophy },
    { label: 'Total focus', value: `${totalMinutes}m`, icon: Coffee },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Pomodoro</h1>
          <p className="text-sm text-muted-foreground">Focus in intervals, rest in between.</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => setSettingsOpen(true)}>
          <Settings aria-hidden="true" />
          Timer settings
        </Button>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center gap-6 py-10">
          <p className={cn('flex items-center gap-2 text-sm font-medium', meta.color)}>
            <span className="size-2 animate-pulse rounded-full" style={{ backgroundColor: meta.ring }} aria-hidden="true" />
            {phaseLabel}
          </p>

          <TimerRing progress={progress} color={meta.ring}>
            <p className="font-mono text-6xl font-semibold tabular-nums tracking-tight sm:text-7xl">
              {formatTimerLabel(remaining)}
            </p>
            <p className="text-sm text-muted-foreground">
              {session.status === 'running'
                ? 'In progress'
                : session.status === 'paused'
                  ? 'Paused'
                  : session.status === 'completed'
                    ? 'Completed'
                    : 'Ready'}
            </p>
          </TimerRing>

          <div className="flex items-center gap-2">
            {session.status === 'running' ? (
              <Button size="lg" onClick={() => void pausePomodoro()}>
                <Pause aria-hidden="true" />
                Pause
              </Button>
            ) : session.status === 'paused' ? (
              <Button size="lg" onClick={() => void resumePomodoro()}>
                <Play aria-hidden="true" />
                Resume
              </Button>
            ) : (
              <Button size="lg" onClick={handleStart}>
                <Play aria-hidden="true" />
                Start
              </Button>
            )}
            <Button
              variant="outline"
              size="lg"
              onClick={() => void handleSkip()}
              disabled={!persistedSession}
            >
              <SkipForward aria-hidden="true" />
              Skip
            </Button>
            <Button
              variant="outline"
              size="icon-lg"
              onClick={() => void handleReset()}
              disabled={!persistedSession}
              aria-label="Reset timer"
            >
              <RotateCcw aria-hidden="true" />
            </Button>
          </div>

          {session.phase === 'focus' ? (
            <div className="w-full max-w-xs space-y-2">
              <label htmlFor="pomodoro-task" className="text-sm font-medium">
                Focus on a task
              </label>
              <Select
                value={session.taskId ?? 'none'}
                onValueChange={handleTaskChange}
                disabled={session.status === 'running'}
              >
                <SelectTrigger id="pomodoro-task" className="w-full">
                  <SelectValue placeholder="Choose a task" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No task</SelectItem>
                  {tasks.map((task) => (
                    <SelectItem key={task.id} value={task.id}>
                      {task.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {linkedTask ? (
                <p className="text-sm text-muted-foreground">Working on “{linkedTask.title}”</p>
              ) : null}
            </div>
          ) : null}
        </CardContent>
      </Card>

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

      <RecentSessions sessions={pomodoroSessions} />

      <PomodoroSettingsDialog
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        settings={pomodoroSettings}
        onSave={updatePomodoroSettings}
      />
    </div>
  )
}

function RecentSessions({ sessions }: { sessions: { phase: PomodoroPhase; plannedSeconds: number; completedAt: string | null; taskId: string | null }[] }) {
  const { tasks } = useData()
  const focusSessions = sessions
    .filter((session) => session.phase === 'focus' && session.completedAt)
    .slice()
    .sort((a, b) => (b.completedAt ?? '').localeCompare(a.completedAt ?? ''))
    .slice(0, 8)

  if (focusSessions.length === 0) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Recent focus sessions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {focusSessions.map((session, index) => {
          const task = session.taskId ? tasks.find((task) => task.id === session.taskId) : null
          return (
            <div key={index} className="flex items-center justify-between gap-3 border-b pb-2 text-sm last:border-0 last:pb-0">
              <div className="min-w-0">
                <p className="truncate font-medium">{task?.title ?? 'Focus session'}</p>
                <p className="text-xs text-muted-foreground">
                  {session.completedAt ? formatTime(parseIso(session.completedAt), '12h') : ''}
                </p>
              </div>
              <p className="shrink-0 font-mono text-sm tabular-nums text-muted-foreground">
                {formatTimerLabel(session.plannedSeconds)}
              </p>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}