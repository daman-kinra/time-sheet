import type {
  CreateTagInput,
  CreateTaskInput,
  Tag,
  Task,
  TaskUpdate,
} from '@/types'
import {
  deleteTagById,
  deleteTaskById,
  getAllTags,
  getAllTasksFromDb,
  getTaskById,
  getTasksByDateRange,
  putTag,
  putTask,
  putTasks,
} from '@/services/idb'

const TAG_COLORS = [
  '#6366f1',
  '#8b5cf6',
  '#ec4899',
  '#f43f5e',
  '#f97316',
  '#eab308',
  '#22c55e',
  '#14b8a6',
  '#06b6d4',
  '#3b82f6',
]

function delay(ms = 80): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function generateId(): string {
  return crypto.randomUUID()
}

function pickTagColor(existing: Tag[]): string {
  const used = new Set(existing.map((t) => t.color))
  const available = TAG_COLORS.find((c) => !used.has(c))
  return available ?? TAG_COLORS[existing.length % TAG_COLORS.length]
}

export async function getTags(): Promise<Tag[]> {
  await delay()
  return getAllTags()
}

export async function createTag(input: CreateTagInput): Promise<Tag> {
  await delay()
  const tags = await getAllTags()
  const tag: Tag = {
    id: generateId(),
    name: input.name.trim(),
    color: input.color ?? pickTagColor(tags),
  }
  await putTag(tag)
  return tag
}

export async function deleteTag(id: string): Promise<void> {
  await delay()
  await deleteTagById(id)

  const tasks = await getAllTasksFromDb()
  const affected = tasks.filter((task) => task.tagIds.includes(id))
  if (affected.length > 0) {
    await putTasks(
      affected.map((task) => ({
        ...task,
        tagIds: task.tagIds.filter((tagId) => tagId !== id),
      })),
    )
  }
}

export async function getAllTasks(): Promise<Task[]> {
  await delay()
  return getAllTasksFromDb()
}

export async function getTasksByDate(date: string): Promise<Task[]> {
  await delay()
  return getTasksInDateRange(date, date)
}

export async function getTasksInDateRange(
  startDate: string,
  endDate: string,
): Promise<Task[]> {
  await delay()
  return getTasksByDateRange(startDate, endDate)
}

export async function createTask(input: CreateTaskInput): Promise<Task> {
  await delay()
  const now = new Date().toISOString()
  const task: Task = {
    id: generateId(),
    title: input.title.trim(),
    description: input.description?.trim() || undefined,
    date: input.date,
    tagIds: input.tagIds ?? [],
    status: 'pending',
    createdAt: input.createdAt ?? now,
  }
  await putTask(task)
  return task
}

export async function updateTask(id: string, updates: TaskUpdate): Promise<Task> {
  await delay()
  const current = await getTaskById(id)
  if (!current) throw new Error('Task not found')

  const next: Task = {
    ...current,
    ...updates,
    id: current.id,
    title: updates.title !== undefined ? updates.title.trim() : current.title,
    description:
      updates.description !== undefined
        ? updates.description.trim() || undefined
        : current.description,
  }

  await putTask(next)
  return next
}

export async function startTask(id: string): Promise<Task> {
  await delay()
  const now = new Date().toISOString()
  return updateTask(id, { status: 'running', startedAt: now })
}

export async function completeTask(id: string): Promise<Task> {
  await delay()
  const task = await getTaskById(id)
  if (!task) throw new Error('Task not found')

  const now = new Date().toISOString()
  return updateTask(id, {
    status: 'completed',
    startedAt: task.startedAt ?? now,
    completedAt: now,
  })
}

export async function deleteTask(id: string): Promise<void> {
  await delay()
  await deleteTaskById(id)
}
