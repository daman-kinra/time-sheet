import { useMemo, useState } from 'react'
import { DayHeader } from '@/components/DayHeader'
import { TagDialog } from '@/components/TagDialog'
import { TagFilter } from '@/components/TagFilter'
import { TaskCreateDialog } from '@/components/TaskCreateDialog'
import { TaskEditDialog } from '@/components/TaskEditDialog'
import { TaskList } from '@/components/TaskList'
import { useTimesheet } from '@/hooks/useTimesheet'
import { filterTasksByTags } from '@/lib/tags'
import { calculateDailyWorkedMs, getTodayKey } from '@/lib/time'
import type { Task } from '@/types'

function App() {
  const [selectedDate, setSelectedDate] = useState(getTodayKey())
  const [filterTagIds, setFilterTagIds] = useState<string[]>([])
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [editOpen, setEditOpen] = useState(false)

  const {
    tasks,
    tags,
    loading,
    actionLoading,
    error,
    addTask,
    editTask,
    start,
    complete,
    remove,
    addTag,
    removeTag,
    now,
  } = useTimesheet(selectedDate)

  const filteredTasks = useMemo(
    () => filterTasksByTags(tasks, filterTagIds),
    [tasks, filterTagIds],
  )

  const filteredWorkedMs = useMemo(
    () => calculateDailyWorkedMs(filteredTasks, now),
    [filteredTasks, now],
  )

  const handleFilterChange = (tagIds: string[]) => {
    setFilterTagIds(tagIds)
  }

  const handleDeleteTag = async (id: string) => {
    await removeTag(id)
    setFilterTagIds((prev) => prev.filter((tagId) => tagId !== id))
  }

  const handleEdit = (task: Task) => {
    setEditingTask(task)
    setEditOpen(true)
  }

  return (
    <div className="min-h-svh bg-background">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <DayHeader
          selectedDate={selectedDate}
          workedMs={filteredWorkedMs}
          onDateChange={setSelectedDate}
          exportDisabled={actionLoading}
        />

        {error && (
          <div className="mt-4 rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <main className="mt-8 space-y-6">
          <TagFilter
            tags={tags}
            selectedTagIds={filterTagIds}
            onChange={handleFilterChange}
          />

          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-medium text-muted-foreground">
              Tasks
              {filterTagIds.length > 0 && (
                <span className="ml-2 text-xs">
                  ({filteredTasks.length} of {tasks.length})
                </span>
              )}
            </h2>
            <div className="flex items-center gap-2">
              <TagDialog
                tags={tags}
                onCreateTag={(name) => addTag({ name })}
                onDeleteTag={handleDeleteTag}
                disabled={actionLoading}
              />
              <TaskCreateDialog
                selectedDate={selectedDate}
                tags={tags}
                defaultTagIds={filterTagIds}
                onCreateTask={addTask}
                disabled={actionLoading}
              />
            </div>
          </div>

          <TaskList
            tasks={filteredTasks}
            tags={tags}
            loading={loading}
            now={now}
            onStart={(id) => start(id)}
            onComplete={(id) => complete(id)}
            onEdit={handleEdit}
            onDelete={(id) => remove(id)}
            disabled={actionLoading}
            emptyMessage={
              filterTagIds.length > 0
                ? 'No tasks match the selected tags for this day.'
                : undefined
            }
          />
        </main>
      </div>

      <TaskEditDialog
        task={editingTask}
        tags={tags}
        open={editOpen}
        onOpenChange={setEditOpen}
        onSave={editTask}
        disabled={actionLoading}
      />
    </div>
  )
}

export default App
