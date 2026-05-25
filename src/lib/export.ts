import { rowsToCsv, downloadTextFile } from '@/lib/csv'
import {
  formatDurationExport,
  getTaskDurationMs,
  TIMEZONE,
} from '@/lib/time'
import type { Task } from '@/types'

const CSV_HEADERS = [
  'Date',
  'Title',
  'Description',
  'Start Time',
  'End Time',
  'Status',
] as const

function formatExportDateTime(iso: string | undefined): string {
  if (!iso) return ''
  return new Date(iso).toLocaleString('en-IN', {
    timeZone: TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}

function taskToCsvRow(task: Task): string[] {
  return [
    task.date,
    task.title,
    task.description ?? '',
    formatExportDateTime(task.startedAt),
    formatExportDateTime(task.completedAt),
    task.status,
  ]
}

export function buildTasksCsv(tasks: Task[]): string {
  return rowsToCsv(
    [...CSV_HEADERS],
    tasks.map(taskToCsvRow),
  )
}

export function downloadTasksCsv(
  tasks: Task[],
  startDate: string,
  endDate: string,
): void {
  const csv = buildTasksCsv(tasks)
  const filename =
    startDate === endDate
      ? `timesheet-${startDate}.csv`
      : `timesheet-${startDate}_to_${endDate}.csv`
  downloadTextFile(filename, csv)
}

export function formatTaskSummaryLine(task: Task, now = Date.now()): string {
  const duration = formatDurationExport(getTaskDurationMs(task, now))
  return `${task.title} (${duration})`
}

export function buildTasksSummaryText(tasks: Task[], now = Date.now()): string {
  if (tasks.length === 0) return ''

  const sorted = [...tasks].sort((a, b) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date)
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  })

  const dates = [...new Set(sorted.map((t) => t.date))]
  const lines: string[] = []

  for (const date of dates) {
    const dayTasks = sorted.filter((t) => t.date === date)
    if (dates.length > 1) {
      lines.push(date)
    }
    for (const task of dayTasks) {
      lines.push(formatTaskSummaryLine(task, now))
    }
    if (dates.length > 1) {
      lines.push('')
    }
  }

  return lines.join('\n').trim()
}
