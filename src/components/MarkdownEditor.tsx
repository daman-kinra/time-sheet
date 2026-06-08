import { useState } from 'react'
import { Eye, Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { MarkdownPreview } from '@/components/MarkdownPreview'

type MarkdownView = 'edit' | 'preview'

interface MarkdownEditorProps {
  id?: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  minRows?: number
  className?: string
  defaultView?: MarkdownView
  showViewToggle?: boolean
  compact?: boolean
}

export function MarkdownEditor({
  id,
  value,
  onChange,
  placeholder = 'Write in Markdown…',
  disabled,
  minRows = 4,
  className,
  defaultView = 'edit',
  showViewToggle = true,
  compact,
}: MarkdownEditorProps) {
  const [view, setView] = useState<MarkdownView>(defaultView)

  return (
    <div className={cn('space-y-2', className)}>
      {showViewToggle && (
        <div className="flex items-center gap-1">
          <Button
            type="button"
            size="xs"
            variant={view === 'edit' ? 'secondary' : 'ghost'}
            onClick={() => setView('edit')}
            disabled={disabled}
            aria-pressed={view === 'edit'}
          >
            <Pencil className="size-3" />
            Write
          </Button>
          <Button
            type="button"
            size="xs"
            variant={view === 'preview' ? 'secondary' : 'ghost'}
            onClick={() => setView('preview')}
            disabled={disabled}
            aria-pressed={view === 'preview'}
          >
            <Eye className="size-3" />
            Preview
          </Button>
        </div>
      )}

      {view === 'edit' ? (
        <textarea
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          rows={compact ? Math.min(minRows, 3) : minRows}
          className={cn(
            'w-full resize-y rounded-lg border border-input bg-transparent px-3 py-2 font-mono text-sm shadow-xs outline-none transition-colors',
            'placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50',
            'disabled:cursor-not-allowed disabled:opacity-50',
          )}
        />
      ) : (
        <div
          className={cn(
            'rounded-lg border border-border bg-muted/30 px-3 py-2',
            compact && 'max-h-24 overflow-y-auto',
          )}
        >
          <MarkdownPreview content={value} emptyMessage={placeholder} />
        </div>
      )}
    </div>
  )
}
