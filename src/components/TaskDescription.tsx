import { useEffect, useState } from 'react'
import { Pencil, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { MarkdownEditor } from '@/components/MarkdownEditor'
import { MarkdownPreview } from '@/components/MarkdownPreview'
import { cn } from '@/lib/utils'

interface TaskDescriptionProps {
  description?: string
  completed: boolean
  onSave: (description: string | undefined) => Promise<void>
  disabled?: boolean
  compact?: boolean
}

export function TaskDescription({
  description,
  completed,
  onSave,
  disabled,
  compact,
}: TaskDescriptionProps) {
  const [editing, setEditing] = useState(!completed)
  const [draft, setDraft] = useState(description ?? '')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setDraft(description ?? '')
    if (completed) {
      setEditing(false)
    }
  }, [description, completed])

  const handleSave = async () => {
    setSaving(true)
    const trimmed = draft.trim()
    await onSave(trimmed || undefined)
    setSaving(false)
    if (completed) {
      setEditing(false)
    }
  }

  const handleCancel = () => {
    setDraft(description ?? '')
    setEditing(false)
  }

  if (completed && !editing) {
    return (
      <div className={cn('group/desc space-y-1', compact && 'space-y-0.5')}>
        <div className="flex items-start justify-between gap-2">
          <div
            className={cn(
              'min-w-0 flex-1',
              compact && 'line-clamp-3 overflow-hidden',
            )}
          >
            <MarkdownPreview
              content={description ?? ''}
              emptyMessage="No notes yet"
              className={compact ? 'text-xs' : undefined}
            />
          </div>
          <Button
            type="button"
            size="xs"
            variant="ghost"
            className="shrink-0 opacity-70 group-hover/desc:opacity-100"
            onClick={() => setEditing(true)}
            disabled={disabled}
            aria-label="Edit description"
          >
            <Pencil className="size-3" />
            Edit
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <MarkdownEditor
        value={draft}
        onChange={setDraft}
        disabled={disabled || saving}
        placeholder="Write notes in Markdown…"
        minRows={compact ? 3 : 4}
        compact={compact}
        defaultView="edit"
      />
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          size="xs"
          onClick={handleSave}
          disabled={disabled || saving}
        >
          Save
        </Button>
        {completed && (
          <Button
            type="button"
            size="xs"
            variant="outline"
            onClick={handleCancel}
            disabled={disabled || saving}
          >
            <X className="size-3" />
            Cancel
          </Button>
        )}
      </div>
    </div>
  )
}
