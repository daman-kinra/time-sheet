import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { fromDatetimeLocalValue, toDatetimeLocalValue } from '@/lib/time'
import type { Tag, Task, TaskStatus, TaskUpdate } from '@/types'

interface TaskEditDialogProps {
  task: Task | null
  tags: Tag[]
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (id: string, updates: TaskUpdate) => Promise<unknown>
  disabled?: boolean
}

interface TaskEditFormProps {
  formId: string
  task: Task
  tags: Tag[]
  onSave: (id: string, updates: TaskUpdate) => Promise<unknown>
  onClose: () => void
  disabled?: boolean
}

function TaskEditForm({ formId, task, tags, onSave, onClose, disabled }: TaskEditFormProps) {
  const [title, setTitle] = useState(task.title)
  const [description, setDescription] = useState(task.description ?? '')
  const [date, setDate] = useState(task.date)
  const [status, setStatus] = useState<TaskStatus>(task.status)
  const [createdAt, setCreatedAt] = useState(toDatetimeLocalValue(task.createdAt))
  const [startedAt, setStartedAt] = useState(
    task.startedAt ? toDatetimeLocalValue(task.startedAt) : '',
  )
  const [completedAt, setCompletedAt] = useState(
    task.completedAt ? toDatetimeLocalValue(task.completedAt) : '',
  )
  const [tagIds, setTagIds] = useState(task.tagIds)
  const [submitting, setSubmitting] = useState(false)

  const toggleTag = (id: string) => {
    setTagIds((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id],
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    setSubmitting(true)

    const updates: TaskUpdate = {
      title: title.trim(),
      description: description.trim() || undefined,
      date,
      status,
      createdAt: fromDatetimeLocalValue(createdAt),
      tagIds,
      startedAt: startedAt ? fromDatetimeLocalValue(startedAt) : undefined,
      completedAt: completedAt ? fromDatetimeLocalValue(completedAt) : undefined,
    }

    if (status === 'pending') {
      updates.startedAt = undefined
      updates.completedAt = undefined
    } else if (status === 'running') {
      updates.completedAt = undefined
      if (!updates.startedAt) {
        updates.startedAt = new Date().toISOString()
      }
    } else if (status === 'completed') {
      if (!updates.startedAt) {
        updates.startedAt = new Date().toISOString()
      }
      if (!updates.completedAt) {
        updates.completedAt = new Date().toISOString()
      }
    }

    await onSave(task.id, updates)
    setSubmitting(false)
    onClose()
  }

  return (
    <form id={formId} onSubmit={handleSubmit} className="space-y-4 py-2">
        <p className="text-xs text-muted-foreground">ID: {task.id}</p>

        <div className="space-y-2">
          <Label htmlFor="edit-title">Title</Label>
          <Input
            id="edit-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={disabled || submitting}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="edit-desc">Description</Label>
          <Input
            id="edit-desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={disabled || submitting}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="edit-date">Date</Label>
            <Input
              id="edit-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              disabled={disabled || submitting}
            />
          </div>
          <div className="space-y-2">
            <Label>Status</Label>
            <Select
              value={status}
              onValueChange={(v) => setStatus(v as TaskStatus)}
              disabled={disabled || submitting}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="running">Running</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="edit-created">Created time</Label>
          <Input
            id="edit-created"
            type="datetime-local"
            value={createdAt}
            onChange={(e) => setCreatedAt(e.target.value)}
            disabled={disabled || submitting}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="edit-started">Start time</Label>
          <Input
            id="edit-started"
            type="datetime-local"
            value={startedAt}
            onChange={(e) => setStartedAt(e.target.value)}
            disabled={disabled || submitting || status === 'pending'}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="edit-completed">End time</Label>
          <Input
            id="edit-completed"
            type="datetime-local"
            value={completedAt}
            onChange={(e) => setCompletedAt(e.target.value)}
            disabled={disabled || submitting || status !== 'completed'}
          />
        </div>

        {tags.length > 0 && (
          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex flex-wrap gap-3">
              {tags.map((tag) => (
                <label
                  key={tag.id}
                  className="flex cursor-pointer items-center gap-2 text-sm"
                >
                  <Checkbox
                    checked={tagIds.includes(tag.id)}
                    onCheckedChange={() => toggleTag(tag.id)}
                    disabled={disabled || submitting}
                  />
                  <span style={{ color: tag.color }}>{tag.name}</span>
                </label>
              ))}
            </div>
          </div>
        )}
    </form>
  )
}

export function TaskEditDialog({
  task,
  tags,
  open,
  onOpenChange,
  onSave,
  disabled,
}: TaskEditDialogProps) {
  const formId = 'edit-task-form'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit task</DialogTitle>
        </DialogHeader>

        {task && (
          <TaskEditForm
            key={task.id}
            formId={formId}
            task={task}
            tags={tags}
            onSave={onSave}
            onClose={() => onOpenChange(false)}
            disabled={disabled}
          />
        )}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={disabled}
          >
            Cancel
          </Button>
          <Button type="submit" form={formId} disabled={disabled}>
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
