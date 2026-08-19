import { describe, expect, it } from 'vitest'
import type { PomodoroSession, PomodoroSettings, PomodoroState } from '@/domain/types'
import {
  completeSession,
  createIdleSession,
  formatTimerLabel,
  getElapsedSeconds,
  getFocusGoalProgress,
  getFocusMinutesOn,
  getFocusSessionCount,
  getFocusSessionsOn,
  getProgress,
  getRecentFocusSummary,
  getRemainingSeconds,
  isFinished,
  nextPhase,
  pauseSession,
  phaseDurationSeconds,
  resumeSession,
  startSession,
  transitionPomodoro,
} from '@/domain/pomodoro'

const settings: PomodoroSettings = {
  focusMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  longBreakInterval: 4,
  autoStartBreaks: false,
  autoStartFocus: false,
  dailyFocusGoal: 8,
  soundEnabled: true,
}

const baseTime = new Date(2026, 7, 19, 9, 0, 0)

function makeSession(overrides: Partial<PomodoroSession> = {}): PomodoroSession {
  return {
    id: 's-1',
    phase: 'focus',
    taskId: null,
    plannedSeconds: 25 * 60,
    accumulatedSeconds: 0,
    startedAt: null,
    pausedAt: null,
    status: 'idle',
    completedAt: null,
    createdAt: baseTime.toISOString(),
    updatedAt: baseTime.toISOString(),
    ...overrides,
  }
}

function makeState(overrides: Partial<PomodoroState> = {}): PomodoroState {
  return { activeSession: null, focusCycleCount: 0, ...overrides }
}

describe('phaseDurationSeconds', () => {
  it('uses the settings duration for each phase', () => {
    expect(phaseDurationSeconds('focus', settings)).toBe(25 * 60)
    expect(phaseDurationSeconds('short-break', settings)).toBe(5 * 60)
    expect(phaseDurationSeconds('long-break', settings)).toBe(15 * 60)
  })
})

describe('startSession', () => {
  it('sets status to running and records the start timestamp', () => {
    const session = startSession(createIdleSession('focus', settings), baseTime)
    expect(session.status).toBe('running')
    expect(session.startedAt).toBe(baseTime.toISOString())
  })
})

describe('getElapsedSeconds / getRemainingSeconds / getProgress', () => {
  it('computes remaining time from timestamps while running', () => {
    const running = startSession(makeSession(), baseTime)
    const later = new Date(baseTime.getTime() + 10 * 60 * 1000)
    expect(getRemainingSeconds(running, later)).toBe(15 * 60)
    expect(getElapsedSeconds(running, later)).toBe(10 * 60)
    expect(getProgress(running, later)).toBeCloseTo(0.4, 2)
  })

  it('keeps idle sessions at zero elapsed', () => {
    const idle = makeSession()
    expect(getElapsedSeconds(idle, baseTime)).toBe(0)
    expect(getRemainingSeconds(idle, baseTime)).toBe(25 * 60)
  })

  it('keeps paused sessions frozen', () => {
    const running = startSession(makeSession(), baseTime)
    const paused = pauseSession(running, new Date(baseTime.getTime() + 5 * 60 * 1000))
    const later = new Date(baseTime.getTime() + 30 * 60 * 1000)
    expect(getElapsedSeconds(paused, later)).toBe(5 * 60)
    expect(getRemainingSeconds(paused, later)).toBe(20 * 60)
  })

  it('returns zero remaining for completed sessions', () => {
    const completed = completeSession(makeSession(), baseTime)
    expect(getRemainingSeconds(completed, baseTime)).toBe(0)
  })

  it('never reports negative remaining time', () => {
    const running = startSession(makeSession(), baseTime)
    const longAfter = new Date(baseTime.getTime() + 26 * 60 * 1000)
    expect(getRemainingSeconds(running, longAfter)).toBe(0)
  })
})

describe('pauseSession / resumeSession', () => {
  it('pauses and resumes without losing elapsed time', () => {
    const running = startSession(makeSession(), baseTime)
    const paused = pauseSession(running, new Date(baseTime.getTime() + 10 * 60 * 1000))
    const resumed = resumeSession(paused, new Date(baseTime.getTime() + 12 * 60 * 1000))

    expect(paused.status).toBe('paused')
    expect(resumed.status).toBe('running')
    expect(resumed.startedAt).toBe(new Date(baseTime.getTime() + 12 * 60 * 1000).toISOString())

    const afterResumeRun = new Date(baseTime.getTime() + 12 * 60 * 1000 + 15 * 60 * 1000)
    expect(getElapsedSeconds(resumed, afterResumeRun)).toBe(25 * 60)
  })

  it('ignores pause when not running', () => {
    const idle = makeSession()
    expect(pauseSession(idle, baseTime)).toEqual(idle)
  })

  it('ignores resume when not paused', () => {
    const running = startSession(makeSession(), baseTime)
    expect(resumeSession(running, baseTime)).toEqual(running)
  })
})

describe('isFinished', () => {
  it('detects when a running session reaches its end', () => {
    const running = startSession(makeSession(), baseTime)
    expect(isFinished(running, new Date(baseTime.getTime() + 25 * 60 * 1000))).toBe(true)
    expect(isFinished(running, new Date(baseTime.getTime() + 24 * 60 * 1000))).toBe(false)
  })

  it('is never finished while idle or paused', () => {
    expect(isFinished(makeSession(), baseTime)).toBe(false)
    const paused = pauseSession(startSession(makeSession(), baseTime), baseTime)
    expect(isFinished(paused, new Date(baseTime.getTime() + 60 * 60 * 1000))).toBe(false)
  })
})

describe('completeSession', () => {
  it('records completion and locks the duration', () => {
    const running = startSession(makeSession(), baseTime)
    const completed = completeSession(running, new Date(baseTime.getTime() + 25 * 60 * 1000))
    expect(completed.status).toBe('completed')
    expect(completed.completedAt).toBe(new Date(baseTime.getTime() + 25 * 60 * 1000).toISOString())
    expect(completed.accumulatedSeconds).toBe(25 * 60)
  })
})

describe('nextPhase', () => {
  it('returns a short break after a focus session below the interval', () => {
    expect(nextPhase('focus', 2, settings)).toBe('short-break')
  })

  it('returns a long break when the interval is reached', () => {
    expect(nextPhase('focus', 4, settings)).toBe('long-break')
  })

  it('returns focus after any break', () => {
    expect(nextPhase('short-break', 4, settings)).toBe('focus')
    expect(nextPhase('long-break', 4, settings)).toBe('focus')
  })
})

describe('transitionPomodoro', () => {
  it('does nothing when the active session has not finished', () => {
    const running = startSession(createIdleSession('focus', settings), baseTime)
    const state = makeState({ activeSession: running })
    const result = transitionPomodoro(state, settings, new Date(baseTime.getTime() + 60_000))
    expect(result.completed).toBeNull()
    expect(result.state).toEqual(state)
  })

  it('completes a finished focus session and advances to a short break', () => {
    const running = startSession(createIdleSession('focus', settings), baseTime)
    const state = makeState({ activeSession: running })
    const result = transitionPomodoro(state, settings, new Date(baseTime.getTime() + 25 * 60 * 1000))
    expect(result.completed?.status).toBe('completed')
    expect(result.state.focusCycleCount).toBe(1)
    expect(result.state.activeSession?.phase).toBe('short-break')
    expect(result.state.activeSession?.status).toBe('idle')
  })

  it('auto-starts the next session when configured', () => {
    const autoSettings = { ...settings, autoStartBreaks: true }
    const running = startSession(createIdleSession('focus', settings), baseTime)
    const result = transitionPomodoro(
      makeState({ activeSession: running }),
      autoSettings,
      new Date(baseTime.getTime() + 25 * 60 * 1000),
    )
    expect(result.state.activeSession?.status).toBe('running')
    expect(result.state.activeSession?.phase).toBe('short-break')
  })

  it('triggers a long break after the configured interval', () => {
    let state = makeState()
    for (let i = 0; i < 4; i += 1) {
      const session = startSession(createIdleSession('focus', settings), baseTime)
      state = transitionPomodoro(
        { ...state, activeSession: session },
        settings,
        new Date(baseTime.getTime() + 25 * 60 * 1000),
      ).state
    }
    expect(state.focusCycleCount).toBe(4)
    expect(state.activeSession?.phase).toBe('long-break')
  })

  it('returns to focus after a break and restores the linked task', () => {
    const breakSession = startSession(
      createIdleSession('short-break', settings),
      baseTime,
    )
    const state = makeState({ activeSession: breakSession, focusCycleCount: 2 })
    const result = transitionPomodoro(state, settings, new Date(baseTime.getTime() + 5 * 60 * 1000))
    expect(result.state.activeSession?.phase).toBe('focus')
    expect(result.state.focusCycleCount).toBe(2)
  })
})

describe('formatTimerLabel', () => {
  it('formats seconds as mm:ss', () => {
    expect(formatTimerLabel(0)).toBe('00:00')
    expect(formatTimerLabel(25 * 60)).toBe('25:00')
    expect(formatTimerLabel(1490)).toBe('24:50')
    expect(formatTimerLabel(61)).toBe('01:01')
    expect(formatTimerLabel(-10)).toBe('00:00')
  })
})

describe('stats', () => {
  const completedFocus = (minutes: number, date: Date): PomodoroSession =>
    completeSession(
      makeSession({ phase: 'focus', plannedSeconds: minutes * 60 }),
      date,
    )

  it('counts completed focus sessions for a day', () => {
    const sessions = [
      completedFocus(25, new Date(2026, 7, 19, 10, 0, 0)),
      completedFocus(25, new Date(2026, 7, 19, 11, 0, 0)),
      completedFocus(25, new Date(2026, 7, 18, 10, 0, 0)),
    ]
    expect(getFocusSessionCount(sessions, new Date(2026, 7, 19))).toBe(2)
    expect(getFocusSessionsOn(sessions, new Date(2026, 7, 19))).toHaveLength(2)
  })

  it('sums focus minutes per day', () => {
    const sessions = [
      completedFocus(25, new Date(2026, 7, 19, 10, 0, 0)),
      completedFocus(50, new Date(2026, 7, 19, 11, 0, 0)),
    ]
    expect(getFocusMinutesOn(sessions, new Date(2026, 7, 19))).toBe(75)
  })

  it('reports daily goal progress', () => {
    const sessions = [completedFocus(25, new Date(2026, 7, 19, 10, 0, 0))]
    expect(getFocusGoalProgress(sessions, settings, new Date(2026, 7, 19))).toEqual({
      completed: 1,
      goal: 8,
    })
  })

  it('summarizes recent focus activity', () => {
    const sessions = [
      completedFocus(25, new Date(2026, 7, 19, 10, 0, 0)),
      completedFocus(25, new Date(2026, 7, 18, 10, 0, 0)),
      completedFocus(25, new Date(2026, 7, 1, 10, 0, 0)),
    ]
    const summary = getRecentFocusSummary(sessions, new Date(2026, 7, 19), 7)
    expect(summary.sessions).toBe(2)
    expect(summary.minutes).toBe(50)
  })
})