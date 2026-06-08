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
import { MarkdownEditor } from '@/components/MarkdownEditor'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { applyTaskEditUpdates } from '@/lib/segments'
import { fromDatetimeLocalValue, toDatetimeLocalValue } from '@/lib/time'
import type { Tag, Task, TaskStatus, TaskUpdate, TimeSegment } from '@/types'

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
  const [segments, setSegments] = useState<{ startedAt: string; endedAt: string }[]>(
    task.segments.length > 0
      ? task.segments.map((segment) => ({
          startedAt: toDatetimeLocalValue(segment.startedAt),
          endedAt: segment.endedAt ? toDatetimeLocalValue(segment.endedAt) : '',
        }))
      : task.startedAt
        ? [
            {
              startedAt: toDatetimeLocalValue(task.startedAt),
              endedAt: task.completedAt ? toDatetimeLocalValue(task.completedAt) : '',
            },
          ]
        : [],
  )
  const [tagIds, setTagIds] = useState(task.tagIds)
  const [submitting, setSubmitting] = useState(false)

  const toggleTag = (id: string) => {
    setTagIds((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id],
    )
  }

  const updateSegment = (
    index: number,
    field: 'startedAt' | 'endedAt',
    value: string,
  ) => {
    setSegments((prev) =>
      prev.map((segment, i) =>
        i === index ? { ...segment, [field]: value } : segment,
      ),
    )
  }

  const addSegment = () => {
    setSegments((prev) => [...prev, { startedAt: '', endedAt: '' }])
  }

  const removeSegment = (index: number) => {
    setSegments((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    setSubmitting(true)

    const updatedSegments: TimeSegment[] = segments
      .filter((segment) => segment.startedAt)
      .map((segment) => ({
        startedAt: fromDatetimeLocalValue(segment.startedAt),
        endedAt: segment.endedAt
          ? fromDatetimeLocalValue(segment.endedAt)
          : undefined,
      }))

    const base: TaskUpdate = {
      title: title.trim(),
      description: description.trim() || undefined,
      date,
      status,
      createdAt: fromDatetimeLocalValue(createdAt),
      tagIds,
      segments: updatedSegments,
      startedAt: updatedSegments[0]?.startedAt,
      completedAt: updatedSegments[updatedSegments.length - 1]?.endedAt,
    }

    const updates = applyTaskEditUpdates(task, base)

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
          <MarkdownEditor
            id="edit-desc"
            value={description}
            onChange={setDescription}
            placeholder="Notes in Markdown…"
            disabled={disabled || submitting}
            minRows={5}
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
                <SelectItem value="paused">Paused</SelectItem>
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

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Segments</Label>
            <Button
              type="button"
              variant="outline"
              onClick={addSegment}
              disabled={disabled || submitting || status === 'pending'}
            >
              Add segment
            </Button>
          </div>
          <div className="space-y-3">
            {segments.map((segment, index) => (
              <div key={`${index}-${segment.startedAt}`} className="rounded-md border p-3">
                <p className="mb-3 text-xs text-muted-foreground">Segment {index + 1}</p>
                <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
                  <div className="space-y-2">
                    <Label htmlFor={`edit-segment-start-${index}`}>Start time</Label>
                    <Input
                      id={`edit-segment-start-${index}`}
                      type="datetime-local"
                      value={segment.startedAt}
                      onChange={(e) =>
                        updateSegment(index, 'startedAt', e.target.value)
                      }
                      disabled={disabled || submitting || status === 'pending'}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`edit-segment-end-${index}`}>End time</Label>
                    <Input
                      id={`edit-segment-end-${index}`}
                      type="datetime-local"
                      value={segment.endedAt}
                      onChange={(e) =>
                        updateSegment(index, 'endedAt', e.target.value)
                      }
                      disabled={disabled || submitting}
                    />
                  </div>
                  <div className="flex items-end">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => removeSegment(index)}
                      disabled={disabled || submitting}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            {segments.length === 0 && (
              <p className="text-xs text-muted-foreground">
                No segments yet. Add one to set start/end times.
              </p>
            )}
          </div>
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
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
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
