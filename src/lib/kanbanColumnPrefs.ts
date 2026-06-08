import type { TaskStatus } from '@/types'

export type KanbanColumnColors = Record<TaskStatus, string>

export const DEFAULT_KANBAN_COLUMN_COLORS: KanbanColumnColors = {
  pending: '#64748b',
  running: '#3b82f6',
  paused: '#f59e0b',
  completed: '#22c55e',
}

export const KANBAN_COLUMN_LABELS: Record<TaskStatus, string> = {
  pending: 'Pending',
  running: 'In Progress',
  paused: 'Paused',
  completed: 'Completed',
}

export const KANBAN_COLUMN_STATUSES: TaskStatus[] = [
  'pending',
  'running',
  'paused',
  'completed',
]

const PREFS_KEY = 'timesheet.kanbanColumnColors.v1'

function isValidHexColor(value: unknown): value is string {
  return typeof value === 'string' && /^#[0-9A-Fa-f]{6}$/.test(value)
}

export function loadKanbanColumnColors(): KanbanColumnColors {
  try {
    const raw = localStorage.getItem(PREFS_KEY)
    if (!raw) return { ...DEFAULT_KANBAN_COLUMN_COLORS }

    const parsed = JSON.parse(raw) as Partial<KanbanColumnColors>
    return {
      pending: isValidHexColor(parsed.pending)
        ? parsed.pending
        : DEFAULT_KANBAN_COLUMN_COLORS.pending,
      running: isValidHexColor(parsed.running)
        ? parsed.running
        : DEFAULT_KANBAN_COLUMN_COLORS.running,
      paused: isValidHexColor(parsed.paused)
        ? parsed.paused
        : DEFAULT_KANBAN_COLUMN_COLORS.paused,
      completed: isValidHexColor(parsed.completed)
        ? parsed.completed
        : DEFAULT_KANBAN_COLUMN_COLORS.completed,
    }
  } catch {
    return { ...DEFAULT_KANBAN_COLUMN_COLORS }
  }
}

export function saveKanbanColumnColors(colors: KanbanColumnColors): void {
  localStorage.setItem(PREFS_KEY, JSON.stringify(colors))
}
