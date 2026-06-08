import { useMemo, useState } from 'react'
import { AppSidebar } from '@/components/AppSidebar'
import { DayHeader } from '@/components/DayHeader'
import { LayoutToggle } from '@/components/LayoutToggle'
import { TagDialog } from '@/components/TagDialog'
import { TagFilter } from '@/components/TagFilter'
import { TaskCreateDialog } from '@/components/TaskCreateDialog'
import { TaskEditDialog } from '@/components/TaskEditDialog'
import { QuickNotePanel } from '@/components/QuickNotePanel'
import { SettingsDialog } from '@/components/SettingsDialog'
import { TaskKanbanBoard } from '@/components/TaskKanbanBoard'
import { TaskList } from '@/components/TaskList'
import { useTimesheet } from '@/hooks/useTimesheet'
import { filterTasksByTags } from '@/lib/tags'
import {
  loadKanbanColumnColors,
  saveKanbanColumnColors,
  type KanbanColumnColors,
} from '@/lib/kanbanColumnPrefs'
import {
  loadTaskLayout,
  saveTaskLayout,
  type TaskLayout,
} from '@/lib/taskLayoutPrefs'
import { calculateDailyWorkedMs, getTodayKey } from '@/lib/time'
import { cn } from '@/lib/utils'
import type { Task } from '@/types'

function App() {
  const [selectedDate, setSelectedDate] = useState(getTodayKey())
  const [filterTagIds, setFilterTagIds] = useState<string[]>([])
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [editOpen, setEditOpen] = useState(false)
  const [dataVersion, setDataVersion] = useState(0)
  const [layout, setLayout] = useState<TaskLayout>(() => loadTaskLayout())
  const [columnColors, setColumnColors] = useState<KanbanColumnColors>(() =>
    loadKanbanColumnColors(),
  )
  const [settingsOpen, setSettingsOpen] = useState(false)

  const {
    tasks,
    tags,
    loading,
    actionLoading,
    error,
    addTask,
    editTask,
    start,
    pause,
    resume,
    complete,
    remove,
    addTag,
    removeTag,
    refresh,
    now,
  } = useTimesheet(selectedDate)

  const handleDataDeleted = () => {
    setFilterTagIds([])
    setEditingTask(null)
    setEditOpen(false)
    setDataVersion((v) => v + 1)
    void refresh()
  }

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

  const handleLayoutChange = (next: TaskLayout) => {
    setLayout(next)
    saveTaskLayout(next)
  }

  const handleColumnColorsChange = (colors: KanbanColumnColors) => {
    setColumnColors(colors)
    saveKanbanColumnColors(colors)
  }

  return (
    <div className="flex h-svh overflow-hidden bg-background">
      <AppSidebar
        onOpenSettings={() => setSettingsOpen(true)}
        disabled={actionLoading}
      />

      <div className="min-h-0 min-w-0 flex-1 overflow-y-auto">
        <div
          className={cn(
            'mx-auto px-4 py-8 sm:px-6',
            layout === 'kanban' ? 'max-w-7xl' : 'max-w-3xl',
          )}
        >
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
              <LayoutToggle
                layout={layout}
                onChange={handleLayoutChange}
                disabled={actionLoading}
              />
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

          {layout === 'list' ? (
            <TaskList
              tasks={filteredTasks}
              tags={tags}
              loading={loading}
              now={now}
              onStart={(id) => start(id)}
              onPause={(id) => pause(id)}
              onResume={(id) => resume(id)}
              onComplete={(id) => complete(id)}
              onEdit={handleEdit}
              onDelete={(id) => remove(id)}
              onSaveDescription={async (id, description) => {
                await editTask(id, { description })
              }}
              disabled={actionLoading}
              columnColors={columnColors}
              emptyMessage={
                filterTagIds.length > 0
                  ? 'No tasks match the selected tags for this day.'
                  : undefined
              }
            />
          ) : (
            <TaskKanbanBoard
              tasks={filteredTasks}
              tags={tags}
              loading={loading}
              now={now}
              onStart={(id) => start(id)}
              onPause={(id) => pause(id)}
              onResume={(id) => resume(id)}
              onComplete={(id) => complete(id)}
              onEdit={handleEdit}
              onDelete={(id) => remove(id)}
              onSaveDescription={async (id, description) => {
                await editTask(id, { description })
              }}
              disabled={actionLoading}
              columnColors={columnColors}
              emptyMessage={
                filterTagIds.length > 0
                  ? 'No tasks match the selected tags for this day.'
                  : undefined
              }
            />
          )}
        </main>
        </div>
      </div>

      <QuickNotePanel key={dataVersion} />

      <TaskEditDialog
        task={editingTask}
        tags={tags}
        open={editOpen}
        onOpenChange={setEditOpen}
        onSave={editTask}
        disabled={actionLoading}
      />

      <SettingsDialog
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        disabled={actionLoading}
        onDataDeleted={handleDataDeleted}
        columnColors={columnColors}
        onColumnColorsChange={handleColumnColorsChange}
      />
    </div>
  )
}

export default App
