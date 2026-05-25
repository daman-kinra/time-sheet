import { useState } from 'react'
import { Plus, Tags, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { Tag } from '@/types'

interface TagDialogProps {
  tags: Tag[]
  onCreateTag: (name: string) => Promise<unknown>
  onDeleteTag: (id: string) => Promise<void>
  disabled?: boolean
}

function TagCreateForm({
  onCreateTag,
  disabled,
}: {
  onCreateTag: (name: string) => Promise<unknown>
  disabled?: boolean
}) {
  const [name, setName] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    setSubmitting(true)
    const result = await onCreateTag(name.trim())
    setSubmitting(false)
    if (result) setName('')
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <div className="flex-1 space-y-1">
        <Label htmlFor="tag-name" className="sr-only">
          Tag name
        </Label>
        <Input
          id="tag-name"
          placeholder="New tag name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={disabled || submitting}
          autoFocus
        />
      </div>
      <Button type="submit" size="icon" disabled={disabled || submitting || !name.trim()}>
        <Plus className="size-4" />
      </Button>
    </form>
  )
}

export function TagDialog({
  tags,
  onCreateTag,
  onDeleteTag,
  disabled,
}: TagDialogProps) {
  const [open, setOpen] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    setDeletingId(id)
    await onDeleteTag(id)
    setDeletingId(null)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button variant="outline" onClick={() => setOpen(true)} disabled={disabled}>
        <Tags className="size-4" />
        Manage
      </Button>

      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Manage tags</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {open && <TagCreateForm onCreateTag={onCreateTag} disabled={disabled} />}

          {tags.length > 0 ? (
            <ul className="space-y-2">
              {tags.map((tag) => (
                <li
                  key={tag.id}
                  className="flex items-center justify-between gap-2 rounded-lg border px-3 py-2"
                >
                  <Badge
                    variant="secondary"
                    style={{ borderColor: tag.color, color: tag.color }}
                    className="border"
                  >
                    {tag.name}
                  </Badge>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => handleDelete(tag.id)}
                    disabled={disabled || deletingId === tag.id}
                    aria-label={`Delete ${tag.name}`}
                  >
                    <Trash2 className="size-4 text-destructive" />
                  </Button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">
              No tags yet. Create one to filter and assign to tasks.
            </p>
          )}
        </div>

        <DialogFooter>
          <Button type="button" onClick={() => setOpen(false)}>
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
