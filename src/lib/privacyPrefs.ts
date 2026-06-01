const PREFS_KEY = 'timesheet.privacy.v1'

export function loadPrivacyEnabled(): boolean {
  try {
    const raw = localStorage.getItem(PREFS_KEY)
    if (!raw) return false
    const parsed = JSON.parse(raw) as { enabled?: boolean }
    return parsed.enabled === true
  } catch {
    return false
  }
}

export function savePrivacyEnabled(enabled: boolean): void {
  localStorage.setItem(PREFS_KEY, JSON.stringify({ enabled }))
}

export function clearPrivacyPrefs(): void {
  localStorage.removeItem(PREFS_KEY)
}
