import { useState, type FormEvent } from 'react'
import type { Priority, Task, TimeBlock } from '@/domain/types'
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
import { detectConflicts } from '@/domain/time-blocks/conflicts'
import { dateInputValue, parseIso, timeInputValue } from '@/utils/date/format'

interface TimeBlockDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  timeBlock: TimeBlock | null
  defaultDate: Date
  onSaved: () => void
  onDelete?: (timeBlock: TimeBlock) => void
}

interface TimeBlockFormProps {
  timeBlock: TimeBlock | null
  linkedTask: Task | null
  defaultDate: Date
  onSaved: () => void
  onDelete?: (timeBlock: TimeBlock) => void
}

function TimeBlockForm({ timeBlock, linkedTask, defaultDate, onSaved, onDelete }: TimeBlockFormProps) {
  const { timeBlocks, projects, categories, createTask, updateTask, createTimeBlock, updateTimeBlock } = useData()
  const { toast } = useToast()
  const [saving, setSaving] = useState(false)

  const initialStart = timeBlock ? parseIso(timeBlock.startAt) : null
  const initialEnd = timeBlock ? parseIso(timeBlock.endAt) : null

  const [title, setTitle] = useState(timeBlock ? (linkedTask?.title ?? '') : '')
  const [description, setDescription] = useState(timeBlock ? (linkedTask?.description ?? '') : '')
  const [date, setDate] = useState(timeBlock ? dateInputValue(initialStart!) : dateInputValue(defaultDate))
  const [start, setStart] = useState(timeBlock ? timeInputValue(initialStart!) : '09:00')
  const [end, setEnd] = useState(timeBlock ? timeInputValue(initialEnd!) : '10:00')
  const [projectId, setProjectId] = useState(timeBlock ? (linkedTask?.projectId ?? 'none') : 'none')
  const [categoryId, setCategoryId] = useState(timeBlock ? (linkedTask?.categoryId ?? 'none') : 'none')
  const [priority, setPriority] = useState<Priority>(timeBlock ? (linkedTask?.priority ?? 'medium') : 'medium')
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const trimmedTitle = title.trim()
    if (!trimmedTitle) {
      setError('Title is required')
      return
    }
    const startAt = new Date(`${date}T${start}:00`)
    const endAt = new Date(`${date}T${end}:00`)
    if (endAt.getTime() <= startAt.getTime()) {
      setError('End time must be after start time')
      return
    }
    const conflicts = detectConflicts(timeBlocks, timeBlock?.id ?? null, startAt, endAt)
    if (conflicts.length > 0) {
      setError('This time overlaps another time block. Adjust the times first.')
      return
    }

    setSaving(true)
    setError(null)
    try {
      if (timeBlock) {
        const taskToUpdate = linkedTask ?? (await createTask({ title: trimmedTitle }))
        await updateTask({
          ...taskToUpdate,
          title: trimmedTitle,
          description,
          projectId: projectId === 'none' ? null : projectId,
          categoryId: categoryId === 'none' ? null : categoryId,
          priority,
        })
        await updateTimeBlock({
          ...timeBlock,
          taskId: taskToUpdate.id,
          startAt: startAt.toISOString(),
          endAt: endAt.toISOString(),
        })
        toast('Time block updated')
      } else {
        const task = await createTask({
          title: trimmedTitle,
          description,
          projectId: projectId === 'none' ? null : projectId,
          categoryId: categoryId === 'none' ? null : categoryId,
          priority,
        })
        await createTimeBlock({
          taskId: task.id,
          startAt: startAt.toISOString(),
          endAt: endAt.toISOString(),
        })
        toast('Time block created')
      }
      onSaved()
    } catch {
      setError('Could not save the time block')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="tb-title">Title</Label>
        <Input
          id="tb-title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="e.g. Study React Native"
          autoFocus
        />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-2">
          <Label htmlFor="tb-date">Date</Label>
          <Input id="tb-date" type="date" value={date} onChange={(event) => setDate(event.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="tb-start">Start</Label>
          <Input id="tb-start" type="time" value={start} onChange={(event) => setStart(event.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="tb-end">End</Label>
          <Input id="tb-end" type="time" value={end} onChange={(event) => setEnd(event.target.value)} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="tb-project">Project</Label>
          <Select value={projectId} onValueChange={setProjectId}>
            <SelectTrigger id="tb-project" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No project</SelectItem>
              {projects.map((project) => (
                <SelectItem key={project.id} value={project.id}>
                  {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="tb-category">Category</Label>
          <Select value={categoryId} onValueChange={setCategoryId}>
            <SelectTrigger id="tb-category" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No category</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="tb-priority">Priority</Label>
        <Select value={priority} onValueChange={(value) => setPriority(value as Priority)}>
          <SelectTrigger id="tb-priority" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="tb-description">Description (optional)</Label>
        <Textarea
          id="tb-description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Add details…"
          rows={3}
        />
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <DialogFooter>
        <div className="flex w-full items-center justify-between">
          {onDelete && timeBlock ? (
            <Button type="button" variant="outline" className="text-destructive" onClick={() => onDelete(timeBlock)}>
              Delete
            </Button>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving…' : timeBlock ? 'Save changes' : 'Create'}
            </Button>
          </div>
        </div>
      </DialogFooter>
    </form>
  )
}

export function TimeBlockDialog({
  open,
  onOpenChange,
  timeBlock,
  defaultDate,
  onSaved,
  onDelete,
}: TimeBlockDialogProps) {
  const { tasks } = useData()
  const linkedTask = timeBlock ? (tasks.find((task) => task.id === timeBlock.taskId) ?? null) : null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{timeBlock ? 'Edit time block' : 'New time block'}</DialogTitle>
          <DialogDescription>Schedule a task on the calendar.</DialogDescription>
        </DialogHeader>
        <TimeBlockForm
          key={`${open}-${timeBlock?.id ?? 'new'}`}
          timeBlock={timeBlock}
          linkedTask={linkedTask}
          defaultDate={defaultDate}
          onSaved={() => {
            onOpenChange(false)
            onSaved()
          }}
          onDelete={
            onDelete
              ? (block) => {
                  onDelete(block)
                  onOpenChange(false)
                }
              : undefined
          }
        />
      </DialogContent>
    </Dialog>
  )
}