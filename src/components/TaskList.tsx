import { Skeleton } from '@/components/ui/skeleton'
import { TaskCard } from '@/components/TaskCard'
import {
  DEFAULT_KANBAN_COLUMN_COLORS,
  KANBAN_COLUMN_LABELS,
  type KanbanColumnColors,
} from '@/lib/kanbanColumnPrefs'
import type { Tag, Task, TaskStatus } from '@/types'

interface TaskListProps {
  tasks: Task[]
  tags: Tag[]
  loading: boolean
  now: number
  onStart: (id: string) => void
  onPause: (id: string) => void
  onResume: (id: string) => void
  onComplete: (id: string) => void
  onEdit: (task: Task) => void
  onDelete: (id: string) => void
  onSaveDescription: (id: string, description: string | undefined) => Promise<void>
  disabled?: boolean
  emptyMessage?: string
  columnColors?: KanbanColumnColors
}

export function TaskList({
  tasks,
  tags,
  loading,
  now,
  onStart,
  onPause,
  onResume,
  onComplete,
  onEdit,
  onDelete,
  onSaveDescription,
  disabled,
  emptyMessage,
  columnColors = DEFAULT_KANBAN_COLUMN_COLORS,
}: TaskListProps) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24 w-full rounded-xl" />
        ))}
      </div>
    )
  }

  if (tasks.length === 0) {
    return (
      <div className="rounded-xl border border-dashed p-8 text-center">
        <p className="font-medium">No tasks for this day</p>
        <p className="mt-1 text-sm text-muted-foreground">
          {emptyMessage ??
            'Add a task above. It will start in pending state until you start it.'}
        </p>
      </div>
    )
  }

  const pending = tasks.filter((t) => t.status === 'pending')
  const running = tasks.filter((t) => t.status === 'running')
  const paused = tasks.filter((t) => t.status === 'paused')
  const completed = tasks
    .filter((t) => t.status === 'completed')
    .sort(
      (a, b) =>
        new Date(a.completedAt ?? 0).getTime() -
        new Date(b.completedAt ?? 0).getTime(),
    )

  const sectionDefs: { status: TaskStatus; items: Task[] }[] = [
    { status: 'running', items: running },
    { status: 'paused', items: paused },
    { status: 'pending', items: pending },
    { status: 'completed', items: completed },
  ]

  const sections = sectionDefs
    .filter((s) => s.items.length > 0)
    .map((s) => ({
      ...s,
      label: KANBAN_COLUMN_LABELS[s.status],
    }))

  return (
    <div className="space-y-6">
      {sections.map((section) => {
        const color = columnColors[section.status]

        return (
          <div
            key={section.status}
            className="space-y-3 rounded-xl border p-3"
            style={{
              borderColor: `color-mix(in srgb, ${color} 30%, transparent)`,
              backgroundColor: `color-mix(in srgb, ${color} 8%, transparent)`,
            }}
          >
            <div
              className="flex items-center justify-between border-b pb-2.5"
              style={{
                borderColor: `color-mix(in srgb, ${color} 25%, transparent)`,
              }}
            >
              <div className="flex items-center gap-2">
                <span
                  className="size-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: color }}
                  aria-hidden
                />
                <h2 className="text-sm font-medium" style={{ color }}>
                  {section.label}
                </h2>
              </div>
              <span
                className="rounded-full px-2 py-0.5 text-xs tabular-nums"
                style={{
                  backgroundColor: `color-mix(in srgb, ${color} 18%, transparent)`,
                  color,
                }}
              >
                {section.items.length}
              </span>
            </div>

            <div className="space-y-3">
              {section.items.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  tags={tags}
                  now={now}
                  onStart={onStart}
                  onPause={onPause}
                  onResume={onResume}
                  onComplete={onComplete}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onSaveDescription={onSaveDescription}
                  disabled={disabled}
                />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
