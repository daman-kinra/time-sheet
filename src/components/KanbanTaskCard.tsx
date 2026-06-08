import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { Check, GripHorizontal, Pause, Pencil, Play, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { formatDuration, getTaskDurationMs } from '@/lib/time'
import type { Tag, Task } from '@/types'

interface KanbanTaskCardContentProps {
  task: Task
  tags: Tag[]
  now: number
  onStart: (id: string) => void
  onPause: (id: string) => void
  onResume: (id: string) => void
  onComplete: (id: string) => void
  onEdit: (task: Task) => void
  onDelete: (id: string) => void
  disabled?: boolean
}

function KanbanCardDragHandle({
  dragHandleProps,
  disabled,
  interactive = true,
}: {
  dragHandleProps?: React.HTMLAttributes<HTMLButtonElement>
  disabled?: boolean
  interactive?: boolean
}) {
  const className = cn(
    'flex h-5 w-full shrink-0 items-center justify-center border-t border-border/60 bg-muted/30 text-muted-foreground',
    interactive &&
      'cursor-grab touch-none hover:bg-muted/50 active:cursor-grabbing',
    disabled && interactive && 'pointer-events-none opacity-50',
  )

  if (!interactive) {
    return (
      <div className={className} aria-hidden>
        <GripHorizontal className="size-4" />
      </div>
    )
  }

  return (
    <button
      type="button"
      className={className}
      aria-label="Drag to change status"
      disabled={disabled}
      {...dragHandleProps}
    >
      <GripHorizontal className="size-4" />
    </button>
  )
}

function KanbanTaskCardContent({
  task,
  tags,
  now,
  onStart,
  onPause,
  onResume,
  onComplete,
  onEdit,
  onDelete,
  disabled,
}: KanbanTaskCardContentProps) {
  const taskTags = tags.filter((t) => task.tagIds.includes(t.id))
  const duration = getTaskDurationMs(task, now)

  return (
    <CardContent className="space-y-2 p-3">
      <div className="min-w-0 space-y-1.5">
        <div className="flex flex-wrap items-center gap-1.5">
          <h3 className="text-sm font-medium leading-snug">{task.title}</h3>
          {duration > 0 && (
            <Badge variant="outline" className="tabular-nums text-xs">
              {formatDuration(duration)}
            </Badge>
          )}
        </div>

        {task.description && (
          <p className="line-clamp-2 text-xs text-muted-foreground">
            {task.description}
          </p>
        )}

        {taskTags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {taskTags.map((tag) => (
              <Badge
                key={tag.id}
                variant="secondary"
                className="border px-1.5 text-[10px]"
                style={{ borderColor: tag.color, color: tag.color }}
              >
                {tag.name}
              </Badge>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-1">
        {task.status === 'pending' && (
          <Button
            size="xs"
            onClick={() => onStart(task.id)}
            disabled={disabled}
          >
            <Play className="size-3" />
            Start
          </Button>
        )}
        {task.status === 'running' && (
          <>
            <Button
              size="xs"
              variant="outline"
              onClick={() => onPause(task.id)}
              disabled={disabled}
            >
              <Pause className="size-3" />
              Pause
            </Button>
            <Button
              size="xs"
              variant="secondary"
              onClick={() => onComplete(task.id)}
              disabled={disabled}
            >
              <Check className="size-3" />
              Done
            </Button>
          </>
        )}
        {task.status === 'paused' && (
          <>
            <Button
              size="xs"
              onClick={() => onResume(task.id)}
              disabled={disabled}
            >
              <Play className="size-3" />
              Resume
            </Button>
            <Button
              size="xs"
              variant="secondary"
              onClick={() => onComplete(task.id)}
              disabled={disabled}
            >
              <Check className="size-3" />
              Done
            </Button>
          </>
        )}
        <Button
          size="xs"
          variant="outline"
          onClick={() => onEdit(task)}
          disabled={disabled}
        >
          <Pencil className="size-3" />
        </Button>
        <Button
          size="xs"
          variant="ghost"
          onClick={() => onDelete(task.id)}
          disabled={disabled}
        >
          <Trash2 className="size-3" />
        </Button>
      </div>
    </CardContent>
  )
}

interface KanbanTaskCardProps {
  task: Task
  tags: Tag[]
  now: number
  onStart: (id: string) => void
  onPause: (id: string) => void
  onResume: (id: string) => void
  onComplete: (id: string) => void
  onEdit: (task: Task) => void
  onDelete: (id: string) => void
  disabled?: boolean
}

export function KanbanTaskCard(props: KanbanTaskCardProps) {
  const { task, disabled } = props
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: task.id,
      disabled,
    })

  const style = transform
    ? { transform: CSS.Translate.toString(transform) }
    : undefined

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={cn('gap-0 overflow-hidden py-0', isDragging && 'opacity-40')}
    >
      <KanbanTaskCardContent {...props} />
      <KanbanCardDragHandle
        dragHandleProps={{ ...attributes, ...listeners }}
        disabled={disabled}
      />
    </Card>
  )
}

export function KanbanTaskCardOverlay(props: KanbanTaskCardProps) {
  return (
    <Card className="gap-0 overflow-hidden py-0 shadow-lg ring-2 ring-primary/20">
      <KanbanTaskCardContent {...props} />
      <KanbanCardDragHandle interactive={false} />
    </Card>
  )
}
