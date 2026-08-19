import { useMemo, useState } from 'react'
import { isSameDay } from 'date-fns'
import { Plus, Search } from 'lucide-react'
import type { Priority, Task } from '@/domain/types'
import { useData } from '@/app/providers/data-provider'
import { useNow } from '@/hooks/use-now'
import { useToast } from '@/components/shared/toast'
import { PriorityBadge } from '@/components/shared/priority-badge'
import { EmptyState } from '@/components/shared/empty-state'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { TaskDialog } from '@/features/tasks/TaskDialog'
import { getTimeBlockStatus } from '@/domain/time-blocks/status'
import { formatTime, parseIso } from '@/utils/date/format'
import { cn } from '@/lib/utils'

type TaskFilter = 'all' | 'today' | 'upcoming' | 'completed' | 'missed' | 'overdue'
type SortKey = 'next' | 'title' | 'priority' | 'created'

interface TaskView extends Task {
  blocks: { id: string; startAt: string; endAt: string; completedAt: string | null; status: string }[]
  hasToday: boolean
  hasUpcoming: boolean
  hasMissed: boolean
  hasOverdue: boolean
  nextStart: number
}

const filters: { value: TaskFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'today', label: 'Today' },
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'completed', label: 'Completed' },
  { value: 'missed', label: 'Missed' },
  { value: 'overdue', label: 'Overdue' },
]

export function TasksPage() {
  const { tasks, timeBlocks, projects, categories, profile, setTaskCompletion } = useData()
  const { toast } = useToast()
  const now = useNow(30_000)
  const timeFormat = profile?.timeFormat ?? '12h'
  const [filter, setFilter] = useState<TaskFilter>('all')
  const [search, setSearch] = useState('')
  const [priorityFilter, setPriorityFilter] = useState<'all' | Priority>('all')
  const [projectFilter, setProjectFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [sort, setSort] = useState<SortKey>('next')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)

  const views = useMemo<TaskView[]>(() => {
    return tasks.map((task) => {
      const blocks = timeBlocks
        .filter((block) => block.taskId === task.id)
        .sort((a, b) => parseIso(a.startAt).getTime() - parseIso(b.startAt).getTime())
      const nextStart =
        blocks.find((block) => parseIso(block.startAt).getTime() > now.getTime())?.startAt ?? '9999'
      return {
        ...task,
        blocks: blocks.map((block) => ({
          id: block.id,
          startAt: block.startAt,
          endAt: block.endAt,
          completedAt: block.completedAt,
          status: getTimeBlockStatus(block, now),
        })),
        hasToday: blocks.some((block) => isSameDay(parseIso(block.startAt), now)),
        hasUpcoming: blocks.some((block) => getTimeBlockStatus(block, now) === 'UPCOMING'),
        hasMissed: blocks.some((block) => getTimeBlockStatus(block, now) === 'MISSED'),
        hasOverdue: blocks.some((block) => getTimeBlockStatus(block, now) === 'OVERDUE'),
        nextStart: parseIso(nextStart).getTime(),
      }
    })
  }, [tasks, timeBlocks, now])

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    const result = views.filter((task) => {
      if (filter === 'today' && !task.hasToday) return false
      if (filter === 'upcoming' && !task.hasUpcoming) return false
      if (filter === 'completed' && task.completedAt === null) return false
      if (filter === 'missed' && !task.hasMissed) return false
      if (filter === 'overdue' && !task.hasOverdue) return false
      if (priorityFilter !== 'all' && task.priority !== priorityFilter) return false
      if (projectFilter !== 'all' && task.projectId !== projectFilter) return false
      if (categoryFilter !== 'all' && task.categoryId !== categoryFilter) return false
      if (query && !task.title.toLowerCase().includes(query)) return false
      return true
    })
    result.sort((a, b) => {
      if (sort === 'title') return a.title.localeCompare(b.title)
      if (sort === 'priority') {
        const order: Record<Priority, number> = { high: 0, medium: 1, low: 2 }
        return order[a.priority] - order[b.priority]
      }
      if (sort === 'created') return a.createdAt.localeCompare(b.createdAt)
      return a.nextStart - b.nextStart
    })
    return result
  }, [views, filter, search, priorityFilter, projectFilter, categoryFilter, sort])

  function openNew() {
    setEditingTask(null)
    setDialogOpen(true)
  }

  function openEdit(task: Task) {
    setEditingTask(task)
    setDialogOpen(true)
  }

  async function toggleCompletion(task: Task) {
    const completed = task.completedAt === null
    await setTaskCompletion(task.id, completed)
    toast(completed ? 'Task completed' : 'Task reopened')
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-semibold">Tasks</h1>
        <Button onClick={openNew}>
          <Plus aria-hidden="true" />
          New task
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-48">
          <Search aria-hidden="true" className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search tasks…"
            className="pl-9"
          />
        </div>
        <Select value={sort} onValueChange={(value) => setSort(value as SortKey)}>
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="next">Sort by time</SelectItem>
            <SelectItem value="title">Sort by title</SelectItem>
            <SelectItem value="priority">Sort by priority</SelectItem>
            <SelectItem value="created">Sort by created</SelectItem>
          </SelectContent>
        </Select>
        <Select value={priorityFilter} onValueChange={(value) => setPriorityFilter(value as 'all' | Priority)}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All priorities</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
        <Select value={projectFilter} onValueChange={setProjectFilter}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All projects</SelectItem>
            {projects.map((project) => (
              <SelectItem key={project.id} value={project.id}>
                {project.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-wrap gap-1">
        {filters.map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => setFilter(item.value)}
            className={cn(
              'rounded-full border px-3 py-1 text-sm font-medium transition-colors',
              filter === item.value
                ? 'border-primary bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:border-foreground/30 hover:text-foreground',
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No tasks found"
          description="Try changing the filters or create a new task."
          action={
            <Button onClick={openNew} variant="outline">
              <Plus aria-hidden="true" />
              New task
            </Button>
          }
        />
      ) : (
        <div className="space-y-2">
          {filtered.map((task) => {
            const project = task.projectId ? projects.find((p) => p.id === task.projectId) : null
            const category = task.categoryId ? categories.find((c) => c.id === task.categoryId) : null
            const nextBlock = task.blocks.find((block) => block.status === 'ACTIVE' || block.status === 'UPCOMING') ?? task.blocks[0]
            const completeCount = task.subtasks.filter((subtask) => subtask.completed).length
            return (
              <Card
                key={task.id}
                className="cursor-pointer transition-colors hover:bg-muted/30"
                onClick={() => openEdit(task)}
              >
                <CardContent className="flex flex-wrap items-center gap-3 p-4">
                  <input
                    type="checkbox"
                    checked={task.completedAt !== null}
                    onChange={() => toggleCompletion(task)}
                    onClick={(event) => event.stopPropagation()}
                    aria-label={`Mark "${task.title}" as ${task.completedAt ? 'not completed' : 'completed'}`}
                    className="size-4 shrink-0 cursor-pointer accent-primary"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className={cn('font-semibold', task.completedAt ? 'text-muted-foreground line-through' : '')}>
                        {task.title}
                      </p>
                      <PriorityBadge priority={task.priority} />
                      {project ? (
                        <span
                          className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium"
                          style={{ backgroundColor: `${project.color}22`, color: project.color }}
                        >
                          <span className="size-1.5 rounded-full" style={{ backgroundColor: project.color }} />
                          {project.name}
                        </span>
                      ) : null}
                      {category ? (
                        <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                          {category.name}
                        </span>
                      ) : null}
                    </div>
                    {task.subtasks.length > 0 ? (
                      <p className="mt-1 text-xs text-muted-foreground">
                        Subtasks {completeCount} / {task.subtasks.length}
                      </p>
                    ) : null}
                  </div>
                  {nextBlock ? (
                    <div className="text-right">
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        {nextBlock.status}
                      </p>
                      <p className="text-sm tabular-nums text-muted-foreground">
                        {formatTime(parseIso(nextBlock.startAt), timeFormat)}
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Unscheduled</p>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <TaskDialog open={dialogOpen} onOpenChange={setDialogOpen} task={editingTask} />
    </div>
  )
}