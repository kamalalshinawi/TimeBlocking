import { useState, type FormEvent } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import type { Priority, Subtask, Task } from '@/domain/types'
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
import { nowIso } from '@/storage/database'

interface TaskDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  task: Task | null
}

interface TaskFormProps {
  task: Task | null
  onClose: () => void
}

function TaskForm({ task, onClose }: TaskFormProps) {
  const { projects, categories, createTask, updateTask, deleteTask } = useData()
  const { toast } = useToast()
  const [saving, setSaving] = useState(false)
  const [title, setTitle] = useState(task?.title ?? '')
  const [description, setDescription] = useState(task?.description ?? '')
  const [projectId, setProjectId] = useState(task?.projectId ?? 'none')
  const [categoryId, setCategoryId] = useState(task?.categoryId ?? 'none')
  const [priority, setPriority] = useState<Priority>(task?.priority ?? 'medium')
  const [subtasks, setSubtasks] = useState<Subtask[]>(task?.subtasks ?? [])
  const [newSubtask, setNewSubtask] = useState('')
  const [error, setError] = useState<string | null>(null)

  function addSubtask() {
    const trimmed = newSubtask.trim()
    if (!trimmed) return
    const timestamp = nowIso()
    setSubtasks((current) => [
      ...current,
      { id: crypto.randomUUID(), title: trimmed, completed: false, createdAt: timestamp },
    ])
    setNewSubtask('')
  }

  function toggleSubtask(id: string) {
    setSubtasks((current) =>
      current.map((subtask) =>
        subtask.id === id ? { ...subtask, completed: !subtask.completed } : subtask,
      ),
    )
  }

  function removeSubtask(id: string) {
    setSubtasks((current) => current.filter((subtask) => subtask.id !== id))
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const trimmedTitle = title.trim()
    if (!trimmedTitle) {
      setError('Title is required')
      return
    }
    setSaving(true)
    setError(null)
    try {
      if (task) {
        await updateTask({
          ...task,
          title: trimmedTitle,
          description,
          projectId: projectId === 'none' ? null : projectId,
          categoryId: categoryId === 'none' ? null : categoryId,
          priority,
          subtasks,
        })
        toast('Task updated')
      } else {
        await createTask({
          title: trimmedTitle,
          description,
          projectId: projectId === 'none' ? null : projectId,
          categoryId: categoryId === 'none' ? null : categoryId,
          priority,
        })
        toast('Task created')
      }
      onClose()
    } catch {
      setError('Could not save the task')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!task) return
    await deleteTask(task.id)
    onClose()
    toast('Task deleted')
  }

  const completedSubtaskCount = subtasks.filter((subtask) => subtask.completed).length

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="task-title">Title</Label>
        <Input
          id="task-title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="e.g. Study React Native"
          autoFocus
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="task-project">Project</Label>
          <Select value={projectId} onValueChange={setProjectId}>
            <SelectTrigger id="task-project" className="w-full">
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
          <Label htmlFor="task-category">Category</Label>
          <Select value={categoryId} onValueChange={setCategoryId}>
            <SelectTrigger id="task-category" className="w-full">
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
        <Label htmlFor="task-priority">Priority</Label>
        <Select value={priority} onValueChange={(value) => setPriority(value as Priority)}>
          <SelectTrigger id="task-priority" className="w-full">
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
        <Label htmlFor="task-description">Description (optional)</Label>
        <Textarea
          id="task-description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label>Subtasks</Label>
        <div className="flex gap-2">
          <Input
            value={newSubtask}
            onChange={(event) => setNewSubtask(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault()
                addSubtask()
              }
            }}
            placeholder="Add a subtask…"
          />
          <Button type="button" variant="outline" onClick={addSubtask} aria-label="Add subtask">
            <Plus aria-hidden="true" />
          </Button>
        </div>
        {subtasks.length > 0 ? (
          <div className="space-y-1">
            {subtasks.map((subtask) => (
              <div key={subtask.id} className="flex items-center gap-2 rounded-md border px-2 py-1.5">
                <input
                  type="checkbox"
                  checked={subtask.completed}
                  onChange={() => toggleSubtask(subtask.id)}
                  aria-label={`Mark "${subtask.title}" complete`}
                  className="size-4 accent-primary"
                />
                <span
                  className={`flex-1 text-sm ${subtask.completed ? 'text-muted-foreground line-through' : ''}`}
                >
                  {subtask.title}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  aria-label={`Remove "${subtask.title}"`}
                  onClick={() => removeSubtask(subtask.id)}
                >
                  <Trash2 aria-hidden="true" className="size-3.5" />
                </Button>
              </div>
            ))}
          </div>
        ) : null}
        {subtasks.length > 0 ? (
          <p className="text-xs text-muted-foreground">
            {completedSubtaskCount} / {subtasks.length} complete —{' '}
            {Math.round((completedSubtaskCount / subtasks.length) * 100)}%
          </p>
        ) : null}
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <DialogFooter>
        <div className="flex w-full items-center justify-between">
          {task ? (
            <Button type="button" variant="outline" className="text-destructive" onClick={handleDelete}>
              Delete
            </Button>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving…' : task ? 'Save changes' : 'Create'}
            </Button>
          </div>
        </div>
      </DialogFooter>
    </form>
  )
}

export function TaskDialog({ open, onOpenChange, task }: TaskDialogProps) {
  const { timeBlocks } = useData()
  const hasBlocks = task ? timeBlocks.some((block) => block.taskId === task.id) : false

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{task ? 'Edit task' : 'New task'}</DialogTitle>
          <DialogDescription>
            {task && hasBlocks ? 'This task has scheduled time blocks.' : 'Create or edit a task.'}
          </DialogDescription>
        </DialogHeader>
        <TaskForm key={`${open}-${task?.id ?? 'new'}`} task={task} onClose={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  )
}