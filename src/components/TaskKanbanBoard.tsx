import { useMemo, useState } from 'react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import { KanbanTaskCard, KanbanTaskCardOverlay } from '@/components/KanbanTaskCard'
import { Skeleton } from '@/components/ui/skeleton'
import {
  DEFAULT_KANBAN_COLUMN_COLORS,
  type KanbanColumnColors,
} from '@/lib/kanbanColumnPrefs'
import { getStatusTransitionAction } from '@/lib/taskStatusTransitions'
import type { Tag, Task, TaskStatus } from '@/types'

const COLUMNS: { status: TaskStatus; label: string }[] = [
  { status: 'pending', label: 'Pending' },
  { status: 'running', label: 'In Progress' },
  { status: 'paused', label: 'Paused' },
  { status: 'completed', label: 'Completed' },
]

interface TaskKanbanBoardProps {
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
  disabled?: boolean
  emptyMessage?: string
  columnColors?: KanbanColumnColors
}

interface KanbanColumnProps {
  status: TaskStatus
  label: string
  color: string
  tasks: Task[]
  tags: Tag[]
  now: number
  onStart: (id: string) => void
  onPause: (id: string) => void
  onResume: (id: string) => void
  onComplete: (id: string) => void
  onEdit: (task: Task) => void
  onDelete: (id: string) => void
  disabled?: boolean
  isOver?: boolean
}

function KanbanColumn({
  status,
  label,
  color,
  tasks,
  tags,
  now,
  onStart,
  onPause,
  onResume,
  onComplete,
  onEdit,
  onDelete,
  disabled,
  isOver,
}: KanbanColumnProps) {
  const { setNodeRef, isOver: isOverColumn } = useDroppable({ id: status })
  const highlighted = isOver || isOverColumn

  return (
    <div
      ref={setNodeRef}
      className="flex min-h-64 min-w-[220px] flex-1 flex-col rounded-xl border"
      style={{
        borderColor: highlighted
          ? `color-mix(in srgb, ${color} 55%, transparent)`
          : `color-mix(in srgb, ${color} 30%, transparent)`,
        backgroundColor: highlighted
          ? `color-mix(in srgb, ${color} 16%, transparent)`
          : `color-mix(in srgb, ${color} 8%, transparent)`,
        boxShadow: highlighted
          ? `0 0 0 2px color-mix(in srgb, ${color} 35%, transparent)`
          : undefined,
      }}
    >
      <div
        className="flex items-center justify-between border-b px-3 py-2.5"
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
          <h3 className="text-sm font-medium" style={{ color }}>
            {label}
          </h3>
        </div>
        <span
          className="rounded-full px-2 py-0.5 text-xs tabular-nums"
          style={{
            backgroundColor: `color-mix(in srgb, ${color} 18%, transparent)`,
            color,
          }}
        >
          {tasks.length}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-2">
        {tasks.length === 0 ? (
          <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed p-4 text-center">
            <p className="text-xs text-muted-foreground">
              {status === 'running'
                ? 'Drop a task here to start working'
                : status === 'paused'
                  ? 'Paused tasks appear here'
                  : status === 'completed'
                    ? 'Completed tasks land here'
                    : 'New tasks start here'}
            </p>
          </div>
        ) : (
          tasks.map((task) => (
            <KanbanTaskCard
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
              disabled={disabled}
            />
          ))
        )}
      </div>
    </div>
  )
}

export function TaskKanbanBoard({
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
  disabled,
  emptyMessage,
  columnColors = DEFAULT_KANBAN_COLUMN_COLORS,
}: TaskKanbanBoardProps) {
  const [activeTask, setActiveTask] = useState<Task | null>(null)
  const [overColumn, setOverColumn] = useState<TaskStatus | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
  )

  const tasksByStatus = useMemo(() => {
    const grouped: Record<TaskStatus, Task[]> = {
      pending: [],
      running: [],
      paused: [],
      completed: [],
    }

    for (const task of tasks) {
      grouped[task.status].push(task)
    }

    grouped.completed.sort(
      (a, b) =>
        new Date(a.completedAt ?? 0).getTime() -
        new Date(b.completedAt ?? 0).getTime(),
    )

    return grouped
  }, [tasks])

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find((t) => t.id === event.active.id)
    setActiveTask(task ?? null)
  }

  const handleDragOver = (event: { over: { id: string | number } | null }) => {
    const overId = event.over?.id
    if (
      overId === 'pending' ||
      overId === 'running' ||
      overId === 'paused' ||
      overId === 'completed'
    ) {
      setOverColumn(overId)
    } else {
      setOverColumn(null)
    }
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveTask(null)
    setOverColumn(null)

    const { active, over } = event
    if (!over) return

    const task = tasks.find((t) => t.id === active.id)
    if (!task) return

    const toStatus = over.id as TaskStatus
    if (!COLUMNS.some((c) => c.status === toStatus)) return

    const action = getStatusTransitionAction(task.status, toStatus)
    if (!action) return

    switch (action) {
      case 'start':
        await onStart(task.id)
        break
      case 'pause':
        await onPause(task.id)
        break
      case 'resume':
        await onResume(task.id)
        break
      case 'complete':
        await onComplete(task.id)
        break
    }
  }

  const handleDragCancel = () => {
    setActiveTask(null)
    setOverColumn(null)
  }

  if (loading) {
    return (
      <div className="flex gap-3 overflow-x-auto pb-2">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-72 min-w-[220px] flex-1 rounded-xl" />
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
            'Add a task above. Drag cards between columns to change status.'}
        </p>
      </div>
    )
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={(e) => void handleDragEnd(e)}
      onDragCancel={handleDragCancel}
    >
      <div className="flex gap-3 overflow-x-auto pb-2">
        {COLUMNS.map((column) => (
          <KanbanColumn
            key={column.status}
            status={column.status}
            label={column.label}
            color={columnColors[column.status]}
            tasks={tasksByStatus[column.status]}
            tags={tags}
            now={now}
            onStart={onStart}
            onPause={onPause}
            onResume={onResume}
            onComplete={onComplete}
            onEdit={onEdit}
            onDelete={onDelete}
            disabled={disabled}
            isOver={overColumn === column.status}
          />
        ))}
      </div>

      <DragOverlay dropAnimation={null}>
        {activeTask ? (
          <KanbanTaskCardOverlay
            task={activeTask}
            tags={tags}
            now={now}
            onStart={onStart}
            onPause={onPause}
            onResume={onResume}
            onComplete={onComplete}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
