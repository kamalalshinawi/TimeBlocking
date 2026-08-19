import { useMemo, useState } from 'react'
import { Check, Flame, MoreHorizontal, Plus, Repeat, Tag } from 'lucide-react'
import { subDays } from 'date-fns'
import type { Habit } from '@/domain/types'
import { useData } from '@/app/providers/data-provider'
import { useNow } from '@/hooks/use-now'
import { useToast } from '@/components/shared/toast'
import { EmptyState } from '@/components/shared/empty-state'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { HabitDialog } from '@/features/habits/HabitDialog'
import { HabitHeatmap } from '@/features/habits/HabitHeatmap'
import { HabitIcon } from '@/features/habits/habit-icons'
import {
  dateKey,
  getBestStreak,
  getCompletionRate,
  getCurrentStreak,
  getHeatmap,
  getTodayStatus,
  getWeekTargetProgress,
  scheduledDaysInRange,
} from '@/domain/habits'
import { cn } from '@/lib/utils'

const FREQUENCY_LABELS = {
  daily: 'Daily',
  weekly: 'Weekly',
  custom: 'Custom days',
} as const

export function HabitsPage() {
  const { habits, habitCompletions, createHabit, updateHabit, deleteHabit, toggleHabitCompletion } = useData()
  const { toast } = useToast()
  const now = useNow(60_000)
  const todayKey = dateKey(now)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null)
  const [habitToDelete, setHabitToDelete] = useState<Habit | null>(null)

  const activeHabits = useMemo(() => habits.filter((habit) => !habit.archived), [habits])
  const archivedHabits = useMemo(() => habits.filter((habit) => habit.archived), [habits])

  const dueToday = useMemo(
    () => activeHabits.filter((habit) => getTodayStatus(habit, habitCompletions, now) === 'due'),
    [activeHabits, habitCompletions, now],
  )
  const completedToday = useMemo(
    () => activeHabits.filter((habit) => getTodayStatus(habit, habitCompletions, now) === 'completed'),
    [activeHabits, habitCompletions, now],
  )

  const bestStreak = activeHabits.reduce(
    (max, habit) => Math.max(max, getCurrentStreak(habit, habitCompletions, now)),
    0,
  )

  const weekStart = subDays(now, 6)
  const weekStats = useMemo(() => {
    let scheduled = 0
    let done = 0
    for (const habit of activeHabits) {
      const days = scheduledDaysInRange(habit, weekStart, now)
      const doneDays = days.filter((day) =>
        habitCompletions.some((completion) => completion.habitId === habit.id && completion.date === dateKey(day)),
      ).length
      scheduled += days.length
      done += doneDays
    }
    return { scheduled, done }
  }, [activeHabits, habitCompletions, weekStart, now])

  const weekRate = weekStats.scheduled === 0 ? 0 : Math.round((weekStats.done / weekStats.scheduled) * 100)

  function openNewHabit() {
    setEditingHabit(null)
    setDialogOpen(true)
  }

  function openEditHabit(habit: Habit) {
    setEditingHabit(habit)
    setDialogOpen(true)
  }

  async function toggleArchive(habit: Habit) {
    await updateHabit({ ...habit, archived: !habit.archived })
    toast(habit.archived ? 'Habit restored' : 'Habit archived')
  }

  async function confirmDelete() {
    if (!habitToDelete) return
    await deleteHabit(habitToDelete.id)
    setHabitToDelete(null)
    toast('Habit deleted')
  }

  const stats = [
    { label: 'Active habits', value: String(activeHabits.length), icon: Tag },
    { label: 'Done today', value: String(completedToday.length), icon: Check },
    { label: 'Best streak', value: String(bestStreak), icon: Flame },
    { label: '7-day completion', value: `${weekRate}%`, icon: Repeat },
  ]

  const totalToday = dueToday.length + completedToday.length
  const showTodaySection = totalToday > 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Habits</h1>
          <p className="text-sm text-muted-foreground">Build routines that stick.</p>
        </div>
        <Button onClick={openNewHabit}>
          <Plus aria-hidden="true" />
          New habit
        </Button>
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

      {showTodaySection ? (
        <section aria-label="Today's habits">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-semibold">Today</h2>
            <p className="text-sm text-muted-foreground">
              {completedToday.length} of {totalToday} completed
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[...completedToday, ...dueToday].map((habit) => (
              <TodayHabitCard
                key={habit.id}
                habit={habit}
                completed={habitCompletions.some(
                  (completion) => completion.habitId === habit.id && completion.date === todayKey,
                )}
                streak={getCurrentStreak(habit, habitCompletions, now)}
                onToggle={() => void toggleHabitCompletion(habit.id, todayKey)}
                onEdit={() => openEditHabit(habit)}
              />
            ))}
          </div>
        </section>
      ) : null}

      <section aria-label="All habits">
        <h2 className="mb-3 text-base font-semibold">All habits</h2>
        {activeHabits.length === 0 ? (
          <EmptyState
            icon={Repeat}
            title="No habits yet"
            description="Create your first habit to start building a routine."
            action={
              <Button onClick={openNewHabit}>
                <Plus aria-hidden="true" />
                New habit
              </Button>
            }
          />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {activeHabits.map((habit) => (
              <HabitCard
                key={habit.id}
                habit={habit}
                completions={habitCompletions}
                now={now}
                onEdit={() => openEditHabit(habit)}
                onArchive={() => void toggleArchive(habit)}
                onDelete={() => setHabitToDelete(habit)}
              />
            ))}
          </div>
        )}
      </section>

      {archivedHabits.length > 0 ? (
        <section aria-label="Archived habits">
          <h2 className="mb-3 text-base font-semibold">Archived</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {archivedHabits.map((habit) => (
              <HabitCard
                key={habit.id}
                habit={habit}
                completions={habitCompletions}
                now={now}
                onEdit={() => openEditHabit(habit)}
                onArchive={() => void toggleArchive(habit)}
                onDelete={() => setHabitToDelete(habit)}
              />
            ))}
          </div>
        </section>
      ) : null}

      <HabitDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        habit={editingHabit}
        onCreate={async (input) => {
          await createHabit(input)
        }}
        onUpdate={updateHabit}
      />

      <AlertDialog open={habitToDelete !== null} onOpenChange={(open) => !open && setHabitToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete habit?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently deletes “{habitToDelete?.name}” and its completion history.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-white hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

function TodayHabitCard({
  habit,
  completed,
  streak,
  onToggle,
  onEdit,
}: {
  habit: Habit
  completed: boolean
  streak: number
  onToggle: () => void
  onEdit: () => void
}) {
  return (
    <Card className={cn('transition-colors', completed && 'opacity-75')}>
      <CardContent className="flex items-center gap-3 p-4">
        <button
          type="button"
          onClick={onToggle}
          aria-label={completed ? `Mark ${habit.name} as not done` : `Mark ${habit.name} as done`}
          aria-pressed={completed}
          className={cn(
            'flex size-9 shrink-0 items-center justify-center rounded-full border-2 transition-colors focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50',
            completed ? 'border-transparent text-white' : 'border-input text-transparent hover:bg-muted',
          )}
          style={completed ? { backgroundColor: habit.color } : undefined}
        >
          <Check aria-hidden="true" className="size-5" />
        </button>
        <button
          type="button"
          onClick={onEdit}
          className="min-w-0 flex-1 rounded text-left focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <div className="flex items-center gap-2">
            <HabitIcon name={habit.icon} className="size-4 shrink-0" style={{ color: habit.color }} />
            <p className={cn('truncate font-medium', completed && 'line-through')}>{habit.name}</p>
          </div>
          <p className="text-xs text-muted-foreground">
            {streak > 0 ? `${streak}-day streak` : FREQUENCY_LABELS[habit.frequency]}
          </p>
        </button>
      </CardContent>
    </Card>
  )
}

function HabitCard({
  habit,
  completions,
  now,
  onEdit,
  onArchive,
  onDelete,
}: {
  habit: Habit
  completions: { habitId: string; date: string }[]
  now: Date
  onEdit: () => void
  onArchive: () => void
  onDelete: () => void
}) {
  const streak = getCurrentStreak(habit, completions, now)
  const bestStreak = getBestStreak(habit, completions, now)
  const rate = Math.round(getCompletionRate(habit, completions, subDays(now, 29), now) * 100)
  const heatmap = getHeatmap(habit, completions, now, 12)
  const week = getWeekTargetProgress(habit, completions, now)

  return (
    <Card className={cn('transition-opacity', habit.archived && 'opacity-60')}>
      <CardContent className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <button
            type="button"
            onClick={onEdit}
            className="flex min-w-0 items-start gap-3 rounded text-left focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <span
              className="flex size-9 shrink-0 items-center justify-center rounded-lg"
              style={{ backgroundColor: `${habit.color}1a`, color: habit.color }}
            >
              <HabitIcon name={habit.icon} className="size-4" />
            </span>
            <span className="min-w-0">
              <span className="block truncate font-medium">{habit.name}</span>
              <span className="block text-xs text-muted-foreground">
                {habit.archived ? 'Archived · ' : ''}
                {FREQUENCY_LABELS[habit.frequency]}
                {habit.frequency === 'weekly' ? ` · ${week.completed}/${week.target} this week` : ''}
              </span>
            </span>
          </button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                aria-label={`Actions for ${habit.name}`}
                className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <MoreHorizontal aria-hidden="true" className="size-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={onEdit}>Edit</DropdownMenuItem>
              <DropdownMenuItem onSelect={onArchive}>
                {habit.archived ? 'Restore' : 'Archive'}
              </DropdownMenuItem>
              <DropdownMenuItem variant="destructive" onSelect={onDelete}>
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {habit.description ? (
          <p className="line-clamp-2 text-sm text-muted-foreground">{habit.description}</p>
        ) : null}

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Flame aria-hidden="true" className="size-3.5" />
            {streak} current · {bestStreak} best
          </span>
          <span>{rate}% last 30 days</span>
        </div>

        <HabitHeatmap cells={heatmap} color={habit.color} className="justify-start" />
      </CardContent>
    </Card>
  )
}