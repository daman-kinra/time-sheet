export type TaskLayout = 'list' | 'kanban'

const PREFS_KEY = 'timesheet.taskLayout.v1'

export function loadTaskLayout(): TaskLayout {
  try {
    const raw = localStorage.getItem(PREFS_KEY)
    if (raw === 'list' || raw === 'kanban') return raw
    return 'list'
  } catch {
    return 'list'
  }
}

export function saveTaskLayout(layout: TaskLayout): void {
  localStorage.setItem(PREFS_KEY, layout)
}
