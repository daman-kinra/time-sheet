import type { QuickNotePanelSize } from '@/types'

const PREFS_KEY = 'timesheet.quickNotePanel.v1'

export interface QuickNotePanelPrefs {
  size: QuickNotePanelSize
}

const defaultPrefs: QuickNotePanelPrefs = {
  size: 'normal',
}

export function loadQuickNotePanelPrefs(): QuickNotePanelPrefs {
  try {
    const raw = localStorage.getItem(PREFS_KEY)
    if (!raw) return defaultPrefs
    const parsed = JSON.parse(raw) as QuickNotePanelPrefs
    if (
      parsed.size === 'collapsed' ||
      parsed.size === 'normal' ||
      parsed.size === 'expanded'
    ) {
      return parsed
    }
    return defaultPrefs
  } catch {
    return defaultPrefs
  }
}

export function saveQuickNotePanelPrefs(prefs: QuickNotePanelPrefs): void {
  localStorage.setItem(PREFS_KEY, JSON.stringify(prefs))
}
