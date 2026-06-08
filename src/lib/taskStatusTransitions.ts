import type { TaskStatus } from '@/types'

export type StatusAction = 'start' | 'pause' | 'resume' | 'complete'

export function getStatusTransitionAction(
  from: TaskStatus,
  to: TaskStatus,
): StatusAction | null {
  if (from === to || from === 'completed') return null

  if (to === 'running') {
    if (from === 'pending') return 'start'
    if (from === 'paused') return 'resume'
    return null
  }
  if (to === 'paused') {
    if (from === 'running') return 'pause'
    return null
  }
  if (to === 'completed') {
    if (from === 'running' || from === 'paused') return 'complete'
    return null
  }

  return null
}
