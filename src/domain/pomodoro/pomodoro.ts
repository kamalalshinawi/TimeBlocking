import type { PomodoroPhase, PomodoroSession, PomodoroSettings, PomodoroState, PomodoroStatus } from '@/domain/types'
import { generateId, nowIso } from '@/storage/database'
import { parseIso } from '@/utils/date/format'

export function phaseDurationSeconds(phase: PomodoroPhase, settings: PomodoroSettings): number {
  const minutes =
    phase === 'focus'
      ? settings.focusMinutes
      : phase === 'short-break'
        ? settings.shortBreakMinutes
        : settings.longBreakMinutes
  return minutes * 60
}

export function createIdleSession(phase: PomodoroPhase, settings: PomodoroSettings, taskId: string | null = null): PomodoroSession {
  const timestamp = nowIso()
  return {
    id: generateId(),
    phase,
    taskId,
    plannedSeconds: phaseDurationSeconds(phase, settings),
    accumulatedSeconds: 0,
    startedAt: null,
    pausedAt: null,
    status: 'idle',
    completedAt: null,
    createdAt: timestamp,
    updatedAt: timestamp,
  }
}

export function startSession(session: PomodoroSession, startedAt: Date): PomodoroSession {
  return {
    ...session,
    status: 'running',
    startedAt: startedAt.toISOString(),
    pausedAt: null,
    updatedAt: nowIso(),
  }
}

export function getElapsedSeconds(session: PomodoroSession, now: Date): number {
  if (session.status === 'idle' || session.status === 'paused') return session.accumulatedSeconds
  if (session.status === 'completed') return session.plannedSeconds
  const runElapsed = session.startedAt ? (now.getTime() - parseIso(session.startedAt).getTime()) / 1000 : 0
  return session.accumulatedSeconds + Math.max(0, runElapsed)
}

export function getRemainingSeconds(session: PomodoroSession, now: Date): number {
  if (session.status === 'completed') return 0
  return Math.max(0, session.plannedSeconds - getElapsedSeconds(session, now))
}

export function getProgress(session: PomodoroSession, now: Date): number {
  if (session.plannedSeconds <= 0) return 0
  return Math.min(1, getElapsedSeconds(session, now) / session.plannedSeconds)
}

export function isFinished(session: PomodoroSession, now: Date): boolean {
  if (session.status === 'completed') return true
  if (session.status !== 'running') return false
  return getElapsedSeconds(session, now) >= session.plannedSeconds
}

export function pauseSession(session: PomodoroSession, pausedAt: Date): PomodoroSession {
  if (session.status !== 'running') return session
  return {
    ...session,
    status: 'paused',
    accumulatedSeconds: getElapsedSeconds(session, pausedAt),
    pausedAt: pausedAt.toISOString(),
    updatedAt: nowIso(),
  }
}

export function resumeSession(session: PomodoroSession, resumedAt: Date): PomodoroSession {
  if (session.status !== 'paused') return session
  return {
    ...session,
    status: 'running',
    startedAt: resumedAt.toISOString(),
    pausedAt: null,
    updatedAt: nowIso(),
  }
}

export function completeSession(session: PomodoroSession, completedAt: Date): PomodoroSession {
  return {
    ...session,
    status: 'completed',
    accumulatedSeconds: session.plannedSeconds,
    startedAt: null,
    pausedAt: null,
    completedAt: completedAt.toISOString(),
    updatedAt: nowIso(),
  }
}

export function nextPhase(currentPhase: PomodoroPhase, focusCycleCount: number, settings: PomodoroSettings): PomodoroPhase {
  if (currentPhase === 'focus') {
    return focusCycleCount % settings.longBreakInterval === 0 ? 'long-break' : 'short-break'
  }
  return 'focus'
}

export interface TransitionResult {
  completed: PomodoroSession | null
  state: PomodoroState
}

export function transitionPomodoro(state: PomodoroState, settings: PomodoroSettings, now: Date): TransitionResult {
  const { activeSession } = state
  if (!activeSession || !isFinished(activeSession, now)) {
    return { completed: null, state }
  }

  const completed = completeSession(activeSession, now)
  const wasFocus = completed.phase === 'focus'
  const focusCycleCount = wasFocus ? state.focusCycleCount + 1 : state.focusCycleCount
  const phase = nextPhase(completed.phase, focusCycleCount, settings)
  const autoStart = wasFocus ? settings.autoStartBreaks : settings.autoStartFocus
  const nextSession = createIdleSession(phase, settings, wasFocus ? null : completed.taskId)

  return {
    completed,
    state: {
      focusCycleCount,
      activeSession: autoStart ? startSession(nextSession, now) : nextSession,
    },
  }
}

export function formatTimerLabel(totalSeconds: number): string {
  const seconds = Math.max(0, Math.ceil(totalSeconds))
  const minutes = Math.floor(seconds / 60)
  const rest = seconds % 60
  const pad = (value: number) => value.toString().padStart(2, '0')
  return `${pad(minutes)}:${pad(rest)}`
}

export function getStatusLabel(session: PomodoroSession): string {
  switch (session.status) {
    case 'running':
      return 'Running'
    case 'paused':
      return 'Paused'
    case 'idle':
      return 'Ready'
    case 'completed':
      return 'Completed'
  }
}

export function pomodoroStatus(session: PomodoroSession): PomodoroStatus {
  return session.status
}