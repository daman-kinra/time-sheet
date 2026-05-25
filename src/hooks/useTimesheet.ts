import { useCallback, useEffect, useMemo, useState } from 'react'
import { calculateDailyWorkedMs } from '@/lib/time'
import {
  completeTask,
  createTag,
  createTask,
  deleteTag,
  deleteTask,
  getTags,
  getTasksByDate,
  startTask,
  updateTask,
} from '@/services/storage'
import type { CreateTagInput, CreateTaskInput, Tag, Task, TaskUpdate } from '@/types'

export function useTimesheet(selectedDate: string) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [now, setNow] = useState(0)

  const hasRunningTask = useMemo(
    () => tasks.some((t) => t.status === 'running'),
    [tasks],
  )

  useEffect(() => {
    if (!hasRunningTask) return
    const tick = () => setNow(Date.now())
    tick()
    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [hasRunningTask])

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [loadedTasks, loadedTags] = await Promise.all([
        getTasksByDate(selectedDate),
        getTags(),
      ])
      setTasks(loadedTasks)
      setTags(loadedTags)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }, [selectedDate])

  // Data fetch when selected day changes
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load()
  }, [load])

  const workedMs = useMemo(
    () => calculateDailyWorkedMs(tasks, now),
    [tasks, now],
  )

  const runAction = useCallback(
    async <T,>(fn: () => Promise<T>): Promise<T | undefined> => {
      setActionLoading(true)
      setError(null)
      try {
        return await fn()
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Action failed')
        return undefined
      } finally {
        setActionLoading(false)
      }
    },
    [],
  )

  const addTask = useCallback(
    async (input: CreateTaskInput) => {
      const result = await runAction(() => createTask(input))
      if (result) await load()
      return result
    },
    [load, runAction],
  )

  const editTask = useCallback(
    async (id: string, updates: TaskUpdate) => {
      const result = await runAction(() => updateTask(id, updates))
      if (result) await load()
      return result
    },
    [load, runAction],
  )

  const start = useCallback(
    async (id: string) => {
      const result = await runAction(() => startTask(id))
      if (result) await load()
      return result
    },
    [load, runAction],
  )

  const complete = useCallback(
    async (id: string) => {
      const result = await runAction(() => completeTask(id))
      if (result) await load()
      return result
    },
    [load, runAction],
  )

  const remove = useCallback(
    async (id: string) => {
      await runAction(() => deleteTask(id))
      await load()
    },
    [load, runAction],
  )

  const addTag = useCallback(
    async (input: CreateTagInput) => {
      const result = await runAction(() => createTag(input))
      if (result) {
        const loadedTags = await getTags()
        setTags(loadedTags)
      }
      return result
    },
    [runAction],
  )

  const removeTag = useCallback(
    async (id: string) => {
      await runAction(() => deleteTag(id))
      await load()
    },
    [load, runAction],
  )

  return {
    tasks,
    tags,
    loading,
    actionLoading,
    error,
    workedMs,
    now,
    addTask,
    editTask,
    start,
    complete,
    remove,
    addTag,
    removeTag,
    refresh: load,
  }
}
