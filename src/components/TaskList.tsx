import { Skeleton } from '@/components/ui/skeleton'
import { TaskCard } from '@/components/TaskCard'
import type { Tag, Task } from '@/types'

interface TaskListProps {
  tasks: Task[]
  tags: Tag[]
  loading: boolean
  now: number
  onStart: (id: string) => void
  onComplete: (id: string) => void
  onEdit: (task: Task) => void
  onDelete: (id: string) => void
  disabled?: boolean
  emptyMessage?: string
}

export function TaskList({
  tasks,
  tags,
  loading,
  now,
  onStart,
  onComplete,
  onEdit,
  onDelete,
  disabled,
  emptyMessage,
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
  const completed = tasks.filter((t) => t.status === 'completed')

  const sections = [
    { label: 'Running', items: running },
    { label: 'Pending', items: pending },
    { label: 'Completed', items: completed },
  ].filter((s) => s.items.length > 0)

  return (
    <div className="space-y-6">
      {sections.map((section) => (
        <div key={section.label} className="space-y-3">
          <h2 className="text-sm font-medium text-muted-foreground">
            {section.label} ({section.items.length})
          </h2>
          <div className="space-y-3">
            {section.items.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                tags={tags}
                now={now}
                onStart={onStart}
                onComplete={onComplete}
                onEdit={onEdit}
                onDelete={onDelete}
                disabled={disabled}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
