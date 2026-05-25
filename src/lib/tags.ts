import type { Task } from '@/types'

export function filterTasksByTags(tasks: Task[], filterTagIds: string[]): Task[] {
  if (filterTagIds.length === 0) return tasks
  return tasks.filter((task) =>
    task.tagIds.some((id) => filterTagIds.includes(id)),
  )
}
