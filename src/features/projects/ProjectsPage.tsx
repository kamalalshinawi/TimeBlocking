import { useState, type FormEvent } from 'react'
import { FolderPlus, Tag, Trash2 } from 'lucide-react'
import type { Category, Project } from '@/domain/types'
import { useData } from '@/app/providers/data-provider'
import { useToast } from '@/components/shared/toast'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

const DEFAULT_COLOR = '#4f46e5'

function EntityForm({
  initialName,
  color,
  onColorChange,
  onSubmit,
  onDelete,
  onClose,
}: {
  initialName: string
  color: string
  onColorChange: (color: string) => void
  onSubmit: () => void
  onDelete?: () => void
  onClose: () => void
}) {
  const [name, setName] = useState(initialName)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function submit(event: FormEvent) {
    event.preventDefault()
    if (!name.trim()) {
      setError('Name is required')
      return
    }
    setBusy(true)
    setError(null)
    try {
      await onSubmit()
      onClose()
    } catch {
      setError('Could not save')
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="entity-name">Name</Label>
        <Input
          id="entity-name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Name"
          autoFocus
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="entity-color">Color</Label>
        <div className="flex items-center gap-2">
          <input
            id="entity-color"
            type="color"
            value={color}
            onChange={(event) => onColorChange(event.target.value)}
            className="h-9 w-12 cursor-pointer rounded border bg-transparent"
          />
          <span className="text-sm text-muted-foreground">{color}</span>
        </div>
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <DialogFooter>
        <div className="flex w-full items-center justify-between">
          {onDelete ? (
            <Button type="button" variant="outline" className="text-destructive" onClick={onDelete}>
              <Trash2 aria-hidden="true" />
              Delete
            </Button>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={busy}>
              {busy ? 'Saving…' : 'Save'}
            </Button>
          </div>
        </div>
      </DialogFooter>
    </form>
  )
}

function EntityDialog({
  open,
  onOpenChange,
  title,
  description,
  initialName,
  color,
  onColorChange,
  onSubmit,
  onDelete,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  initialName: string
  color: string
  onColorChange: (color: string) => void
  onSubmit: () => void
  onDelete?: () => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <EntityForm
          key={`${open}-${initialName}-${color}`}
          initialName={initialName}
          color={color}
          onColorChange={onColorChange}
          onSubmit={onSubmit}
          onDelete={onDelete}
          onClose={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  )
}

export function ProjectsPage() {
  const { projects, categories, tasks, createProject, updateProject, deleteProject, createCategory, updateCategory, deleteCategory } = useData()
  const { toast } = useToast()

  const [projectDialogOpen, setProjectDialogOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [projectName, setProjectName] = useState('')
  const [projectColor, setProjectColor] = useState(DEFAULT_COLOR)

  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [categoryName, setCategoryName] = useState('')
  const [categoryColor, setCategoryColor] = useState(DEFAULT_COLOR)

  function openNewProject() {
    setEditingProject(null)
    setProjectName('')
    setProjectColor(DEFAULT_COLOR)
    setProjectDialogOpen(true)
  }

  function openEditProject(project: Project) {
    setEditingProject(project)
    setProjectName(project.name)
    setProjectColor(project.color)
    setProjectDialogOpen(true)
  }

  function openNewCategory() {
    setEditingCategory(null)
    setCategoryName('')
    setCategoryColor(DEFAULT_COLOR)
    setCategoryDialogOpen(true)
  }

  function openEditCategory(category: Category) {
    setEditingCategory(category)
    setCategoryName(category.name)
    setCategoryColor(category.color)
    setCategoryDialogOpen(true)
  }

  async function submitProject() {
    if (editingProject) {
      await updateProject({ ...editingProject, name: projectName, color: projectColor })
      toast('Project updated')
    } else {
      await createProject({ name: projectName, color: projectColor })
      toast('Project created')
    }
  }

  async function removeProject() {
    if (!editingProject) return
    await deleteProject(editingProject.id)
    setProjectDialogOpen(false)
    toast('Project deleted')
  }

  async function submitCategory() {
    if (editingCategory) {
      await updateCategory({ ...editingCategory, name: categoryName, color: categoryColor })
      toast('Category updated')
    } else {
      await createCategory({ name: categoryName, color: categoryColor })
      toast('Category created')
    }
  }

  async function removeCategory() {
    if (!editingCategory) return
    await deleteCategory(editingCategory.id)
    setCategoryDialogOpen(false)
    toast('Category deleted')
  }

  function projectTaskCount(projectId: string): number {
    return tasks.filter((task) => task.projectId === projectId).length
  }

  function categoryTaskCount(categoryId: string): number {
    return tasks.filter((task) => task.categoryId === categoryId).length
  }

  return (
    <div className="space-y-4">
      <Tabs defaultValue="projects">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-xl font-semibold">Projects</h1>
          <TabsList>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="projects" className="mt-4 space-y-4">
          <div className="flex justify-end">
            <Button onClick={openNewProject}>
              <FolderPlus aria-hidden="true" />
              New project
            </Button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <Card
                key={project.id}
                className="cursor-pointer transition-colors hover:bg-muted/30"
                onClick={() => openEditProject(project)}
              >
                <CardContent className="flex items-center gap-3 p-4">
                  <span
                    aria-hidden="true"
                    className="size-3 shrink-0 rounded-full"
                    style={{ backgroundColor: project.color }}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">{project.name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {projectTaskCount(project.id)} task{projectTaskCount(project.id) === 1 ? '' : 's'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="categories" className="mt-4 space-y-4">
          <div className="flex justify-end">
            <Button onClick={openNewCategory}>
              <Tag aria-hidden="true" />
              New category
            </Button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => (
              <Card
                key={category.id}
                className="cursor-pointer transition-colors hover:bg-muted/30"
                onClick={() => openEditCategory(category)}
              >
                <CardContent className="flex items-center gap-3 p-4">
                  <span
                    aria-hidden="true"
                    className="size-3 shrink-0 rounded-full"
                    style={{ backgroundColor: category.color }}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">{category.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {categoryTaskCount(category.id)} task{categoryTaskCount(category.id) === 1 ? '' : 's'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <EntityDialog
        open={projectDialogOpen}
        onOpenChange={setProjectDialogOpen}
        title={editingProject ? 'Edit project' : 'New project'}
        description="Organize tasks into projects."
        initialName={projectName}
        color={projectColor}
        onColorChange={setProjectColor}
        onSubmit={submitProject}
        onDelete={editingProject ? removeProject : undefined}
      />
      <EntityDialog
        open={categoryDialogOpen}
        onOpenChange={setCategoryDialogOpen}
        title={editingCategory ? 'Edit category' : 'New category'}
        description="Group tasks by category."
        initialName={categoryName}
        color={categoryColor}
        onColorChange={setCategoryColor}
        onSubmit={submitCategory}
        onDelete={editingCategory ? removeCategory : undefined}
      />
    </div>
  )
}