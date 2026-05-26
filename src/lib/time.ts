import { ensureSegments, getTaskDurationFromSegments } from '@/lib/segments'
import type { Task } from '@/types'

export const TIMEZONE = 'Asia/Kolkata' as const
const IST_OFFSET = '+05:30'

type DateParts = {
  year: number
  month: number
  day: number
  hour?: number
  minute?: number
}

function getISTParts(date: Date, includeTime = false): DateParts {
  const options: Intl.DateTimeFormatOptions = {
    timeZone: TIMEZONE,
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  }
  if (includeTime) {
    options.hour = '2-digit'
    options.minute = '2-digit'
    options.hour12 = false
  }
  const parts = new Intl.DateTimeFormat('en-US', options).formatToParts(date)
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((p) => p.type === type)?.value)

  const result: DateParts = {
    year: get('year'),
    month: get('month'),
    day: get('day'),
  }
  if (includeTime) {
    result.hour = get('hour')
    result.minute = get('minute')
  }
  return result
}

function pad2(n: number): string {
  return String(n).padStart(2, '0')
}

export function getTodayKey(): string {
  return toDateKey(new Date())
}

export function toDateKey(date: Date): string {
  const { year, month, day } = getISTParts(date)
  return `${year}-${pad2(month)}-${pad2(day)}`
}

export function addDaysToDateKey(key: string, offset: number): string {
  const d = new Date(`${key}T12:00:00${IST_OFFSET}`)
  d.setTime(d.getTime() + offset * 86_400_000)
  return toDateKey(d)
}

export function parseDateKey(key: string): Date {
  return new Date(`${key}T12:00:00${IST_OFFSET}`)
}

export function formatDisplayDate(key: string): string {
  const today = getTodayKey()
  const yesterday = addDaysToDateKey(today, -1)
  const tomorrow = addDaysToDateKey(today, 1)

  if (key === today) return 'Today'
  if (key === yesterday) return 'Yesterday'
  if (key === tomorrow) return 'Tomorrow'

  return parseDateKey(key).toLocaleDateString('en-IN', {
    timeZone: TIMEZONE,
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-IN', {
    timeZone: TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatDuration(ms: number): string {
  if (ms <= 0) return '0m'
  const totalMinutes = Math.floor(ms / 60000)
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  if (hours === 0) return `${minutes}m`
  if (minutes === 0) return `${hours}h`
  return `${hours}h ${minutes}m`
}

/** Human-readable duration for export copy, e.g. "1hr 30min". */
export function formatDurationExport(ms: number): string {
  if (ms <= 0) return '0min'
  const totalMinutes = Math.floor(ms / 60000)
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  const parts: string[] = []
  if (hours > 0) parts.push(`${hours}hr`)
  if (minutes > 0 || hours === 0) parts.push(`${minutes}min`)
  return parts.join(' ')
}

export function toDatetimeLocalValue(iso: string): string {
  const { year, month, day, hour = 0, minute = 0 } = getISTParts(
    new Date(iso),
    true,
  )
  return `${year}-${pad2(month)}-${pad2(day)}T${pad2(hour)}:${pad2(minute)}`
}

export function fromDatetimeLocalValue(value: string): string {
  return new Date(`${value}${IST_OFFSET}`).toISOString()
}

export function getTaskDurationMs(task: Task, now = Date.now()): number {
  const normalized = ensureSegments(task)
  if (normalized.segments.length === 0) return 0
  return getTaskDurationFromSegments(
    normalized.segments,
    normalized.status,
    now,
  )
}

export function calculateDailyWorkedMs(tasks: Task[], now = Date.now()): number {
  return tasks.reduce((sum, task) => sum + getTaskDurationMs(task, now), 0)
}
