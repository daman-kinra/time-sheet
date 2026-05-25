import { rowsToCsv, downloadTextFile } from '@/lib/csv'
import { TIMEZONE } from '@/lib/time'
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
