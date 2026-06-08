import { rowsToCsv, downloadTextFile } from '@/lib/csv'
import {
  calculateDailyWorkedMs,
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

function formatExportDateWithTotal(date: string, totalMs: number): string {
  return `${date} (${formatDurationExport(totalMs)})`
}

function getDailyTotalsMs(
  tasks: Task[],
  now = Date.now(),
): Map<string, number> {
  const totals = new Map<string, number>()
  for (const task of tasks) {
    const current = totals.get(task.date) ?? 0
    totals.set(task.date, current + getTaskDurationMs(task, now))
  }
  return totals
}

function taskToCsvRow(
  task: Task,
  dailyTotals: Map<string, number>,
): string[] {
  const dayTotalMs = dailyTotals.get(task.date) ?? 0
  return [
    formatExportDateWithTotal(task.date, dayTotalMs),
    task.title,
    task.description ?? '',
    formatExportDateTime(task.startedAt),
    formatExportDateTime(task.completedAt),
    task.status,
  ]
}

export function buildTasksCsv(tasks: Task[], now = Date.now()): string {
  const dailyTotals = getDailyTotalsMs(tasks, now)
  return rowsToCsv(
    [...CSV_HEADERS],
    tasks.map((task) => taskToCsvRow(task, dailyTotals)),
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
    const dayTotalMs = calculateDailyWorkedMs(dayTasks, now)
    lines.push(formatExportDateWithTotal(date, dayTotalMs))
    for (const task of dayTasks) {
      lines.push(formatTaskSummaryLine(task, now))
    }
    if (dates.length > 1) {
      lines.push('')
    }
  }

  return lines.join('\n').trim()
}
