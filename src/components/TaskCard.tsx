import { Check, Pencil, Play, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  formatDuration,
  formatTime,
  getTaskDurationMs,
} from '@/lib/time'
import type { Tag, Task } from '@/types'

const statusLabels = {
  pending: 'Pending',
  running: 'Running',
  completed: 'Completed',
} as const

const statusVariant = {
  pending: 'secondary',
  running: 'default',
  completed: 'outline',
} as const

interface TaskCardProps {
  task: Task
  tags: Tag[]
  now: number
  onStart: (id: string) => void
  onComplete: (id: string) => void
  onEdit: (task: Task) => void
  onDelete: (id: string) => void
  disabled?: boolean
}

export function TaskCard({
  task,
  tags,
  now,
  onStart,
  onComplete,
  onEdit,
  onDelete,
  disabled,
}: TaskCardProps) {
  const taskTags = tags.filter((t) => task.tagIds.includes(t.id))
  const duration = getTaskDurationMs(task, now)

  return (
    <Card className="overflow-hidden">
      <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-medium">{task.title}</h3>
            <Badge variant={statusVariant[task.status]}>
              {statusLabels[task.status]}
            </Badge>
            {duration > 0 && (
              <Badge variant="outline" className="tabular-nums">
                {formatDuration(duration)}
              </Badge>
            )}
          </div>

          {task.description && (
            <p className="text-sm text-muted-foreground">{task.description}</p>
          )}

          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span>Created: {formatTime(task.createdAt)}</span>
            {task.startedAt && <span>Started: {formatTime(task.startedAt)}</span>}
            {task.completedAt && (
              <span>Ended: {formatTime(task.completedAt)}</span>
            )}
          </div>

          {taskTags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {taskTags.map((tag) => (
                <Badge
                  key={tag.id}
                  variant="secondary"
                  className="border text-xs"
                  style={{ borderColor: tag.color, color: tag.color }}
                >
                  {tag.name}
                </Badge>
              ))}
            </div>
          )}
        </div>

        <div className="flex shrink-0 flex-wrap gap-2">
          {task.status === 'pending' && (
            <Button
              size="sm"
              onClick={() => onStart(task.id)}
              disabled={disabled}
            >
              <Play className="size-3.5" />
              Start now
            </Button>
          )}
          {task.status === 'running' && (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => onComplete(task.id)}
              disabled={disabled}
            >
              <Check className="size-3.5" />
              Complete
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            onClick={() => onEdit(task)}
            disabled={disabled}
          >
            <Pencil className="size-3.5" />
            Edit
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onDelete(task.id)}
            disabled={disabled}
          >
            <Trash2 className="size-3.5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
