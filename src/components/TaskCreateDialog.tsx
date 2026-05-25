import { useState } from 'react'
import { Plus } from 'lucide-react'
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
import { fromDatetimeLocalValue, toDatetimeLocalValue } from '@/lib/time'
import type { CreateTaskInput, Tag } from '@/types'

interface TaskCreateDialogProps {
  selectedDate: string
  tags: Tag[]
  defaultTagIds: string[]
  onCreateTask: (input: CreateTaskInput) => Promise<unknown>
  disabled?: boolean
}

interface TaskCreateFormProps {
  formId: string
  selectedDate: string
  tags: Tag[]
  defaultTagIds: string[]
  onCreateTask: (input: CreateTaskInput) => Promise<unknown>
  onSuccess: () => void
  disabled?: boolean
}

function TaskCreateForm({
  formId,
  selectedDate,
  tags,
  defaultTagIds,
  onCreateTask,
  onSuccess,
  disabled,
}: TaskCreateFormProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState(selectedDate)
  const [createdAt, setCreatedAt] = useState(toDatetimeLocalValue(new Date().toISOString()))
  const [tagIds, setTagIds] = useState(defaultTagIds)
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
    const result = await onCreateTask({
      title: title.trim(),
      description: description.trim() || undefined,
      date,
      tagIds,
      createdAt: fromDatetimeLocalValue(createdAt),
    })
    setSubmitting(false)
    if (result) onSuccess()
  }

  return (
    <form id={formId} onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="task-title">Title</Label>
        <Input
          id="task-title"
          placeholder="What are you working on?"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={disabled || submitting}
          required
          autoFocus
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="task-desc">Description (optional)</Label>
        <Input
          id="task-desc"
          placeholder="Notes"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={disabled || submitting}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="task-date">Date</Label>
          <Input
            id="task-date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            disabled={disabled || submitting}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="task-created">Created time</Label>
          <Input
            id="task-created"
            type="datetime-local"
            value={createdAt}
            onChange={(e) => setCreatedAt(e.target.value)}
            disabled={disabled || submitting}
          />
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

export function TaskCreateDialog({
  selectedDate,
  tags,
  defaultTagIds,
  onCreateTask,
  disabled,
}: TaskCreateDialogProps) {
  const [open, setOpen] = useState(false)
  const formId = 'create-task-form'
  const formKey = `${selectedDate}-${defaultTagIds.join(',')}`
  const visibleTags =
    defaultTagIds.length > 0
      ? tags.filter((t) => defaultTagIds.includes(t.id))
      : tags

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button onClick={() => setOpen(true)} disabled={disabled}>
        <Plus className="size-4" />
        Add task
      </Button>

      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add task</DialogTitle>
        </DialogHeader>

        {open && (
          <TaskCreateForm
            key={formKey}
            formId={formId}
            selectedDate={selectedDate}
            tags={visibleTags}
            defaultTagIds={defaultTagIds}
            onCreateTask={onCreateTask}
            onSuccess={() => setOpen(false)}
            disabled={disabled}
          />
        )}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={disabled}
          >
            Cancel
          </Button>
          <Button type="submit" form={formId} disabled={disabled}>
            Add as pending
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
