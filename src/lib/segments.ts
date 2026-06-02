import type { Task, TaskStatus, TaskUpdate, TimeSegment } from '@/types'

export function ensureSegments(task: Task): Task {
  if (task.segments?.length) {
    return syncTaskTimestamps({ ...task, segments: task.segments })
  }

  const segments: TimeSegment[] = []
  if (task.startedAt) {
    if (task.status === 'completed' && task.completedAt) {
      segments.push({ startedAt: task.startedAt, endedAt: task.completedAt })
    } else if (task.status === 'running') {
      segments.push({ startedAt: task.startedAt })
    } else if (task.status === 'paused') {
      segments.push({ startedAt: task.startedAt, endedAt: task.completedAt })
    }
  }

  return syncTaskTimestamps({ ...task, segments })
}

export function syncTaskTimestamps(task: Task): Task {
  const segments = task.segments ?? []
  const first = segments[0]
  const last = segments[segments.length - 1]

  return {
    ...task,
    segments,
    startedAt: first?.startedAt,
    completedAt:
      task.status === 'completed'
        ? (last?.endedAt ?? task.completedAt)
        : task.status === 'paused'
          ? (last?.endedAt ?? task.completedAt)
          : undefined,
  }
}

export function getOpenSegmentIndex(segments: TimeSegment[]): number {
  return segments.findIndex((s) => !s.endedAt)
}

export function closeOpenSegment(
  segments: TimeSegment[],
  endedAt: string,
): TimeSegment[] {
  const idx = getOpenSegmentIndex(segments)
  if (idx === -1) return segments
  return segments.map((s, i) => (i === idx ? { ...s, endedAt } : s))
}

export function getTaskDurationFromSegments(
  segments: TimeSegment[],
  status: TaskStatus,
  now = Date.now(),
): number {
  return segments.reduce((sum, seg) => {
    const start = new Date(seg.startedAt).getTime()
    const end = seg.endedAt
      ? new Date(seg.endedAt).getTime()
      : status === 'running'
        ? now
        : start
    return sum + Math.max(0, end - start)
  }, 0)
}

export function migrateStoredTask(raw: Task): Task {
  const status = raw.status === 'paused' ? 'paused' : raw.status
  return ensureSegments({ ...raw, status, segments: raw.segments ?? [] })
}

export function applyTaskEditUpdates(
  current: Task,
  updates: TaskUpdate,
): TaskUpdate {
  const task = ensureSegments({ ...current, ...updates })
  const status = updates.status ?? task.status
  const now = new Date().toISOString()
  let segments = updates.segments ? [...updates.segments] : [...task.segments]

  if (status === 'pending') {
    return {
      ...updates,
      status,
      segments: [],
      startedAt: undefined,
      completedAt: undefined,
    }
  }

  const startedAt =
    updates.startedAt !== undefined ? updates.startedAt : task.startedAt
  const completedAt =
    updates.completedAt !== undefined ? updates.completedAt : task.completedAt

  if (status === 'completed') {
    if (updates.segments) {
      const fallbackEnd = completedAt ?? now
      segments = closeAllSegments(segments, fallbackEnd)
      return syncTaskTimestamps({
        ...task,
        ...updates,
        status,
        segments,
        startedAt: segments[0]?.startedAt ?? startedAt ?? now,
        completedAt:
          segments[segments.length - 1]?.endedAt ?? completedAt ?? fallbackEnd,
      })
    }

    const start = startedAt ?? now
    const end = completedAt ?? now
    segments = [{ startedAt: start, endedAt: end }]
    return {
      ...updates,
      status,
      segments,
      startedAt: start,
      completedAt: end,
    }
  }

  if (status === 'running') {
    if (updates.segments) {
      const hasOpenSegment = getOpenSegmentIndex(segments) !== -1
      if (!hasOpenSegment) {
        segments = [...segments, { startedAt: startedAt ?? now }]
      }
      return {
        ...updates,
        status,
        segments,
        startedAt: segments[0]?.startedAt ?? startedAt ?? now,
        completedAt: undefined,
      }
    }

    const start = startedAt ?? now
    if (getOpenSegmentIndex(segments) === -1) {
      segments = [...closeAllSegments(segments, now), { startedAt: start }]
    } else if (startedAt && segments.length > 0) {
      const openIdx = getOpenSegmentIndex(segments)
      segments = segments.map((s, i) =>
        i === openIdx ? { ...s, startedAt: start } : s,
      )
    }
    return {
      ...updates,
      status,
      segments,
      startedAt: segments[0]?.startedAt ?? start,
      completedAt: undefined,
    }
  }

  if (status === 'paused') {
    segments = closeOpenSegment(segments, completedAt ?? now)
    return syncTaskTimestamps({
      ...task,
      ...updates,
      status,
      segments,
    })
  }

  return updates
}

function closeAllSegments(
  segments: TimeSegment[],
  endedAt: string,
): TimeSegment[] {
  return segments.map((s) => (s.endedAt ? s : { ...s, endedAt }))
}
