import { useCallback, useEffect, useMemo, useState } from 'react'
import { Copy, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { buildTasksSummaryText, downloadTasksCsv } from '@/lib/export'
import { addDaysToDateKey, getTodayKey } from '@/lib/time'
import { cn } from '@/lib/utils'
import { getTasksInDateRange } from '@/services/storage'
import type { Task } from '@/types'

type RangePreset = 'today' | 'last7' | 'last30' | 'custom'

function getRangeForPreset(preset: RangePreset): {
  startDate: string
  endDate: string
} {
  const endDate = getTodayKey()
  switch (preset) {
    case 'today':
      return { startDate: endDate, endDate }
    case 'last7':
      return { startDate: addDaysToDateKey(endDate, -6), endDate }
    case 'last30':
      return { startDate: addDaysToDateKey(endDate, -29), endDate }
    default:
      return { startDate: endDate, endDate }
  }
}

const presetOptions: { value: RangePreset; label: string }[] = [
  { value: 'today', label: 'Today' },
  { value: 'last7', label: 'Last 7 days' },
  { value: 'last30', label: 'Last 30 days' },
  { value: 'custom', label: 'Custom range' },
]

export function ExportDialog({ disabled }: { disabled?: boolean }) {
  const today = getTodayKey()
  const [open, setOpen] = useState(false)
  const [preset, setPreset] = useState<RangePreset>('last7')
  const [startDate, setStartDate] = useState(addDaysToDateKey(today, -6))
  const [endDate, setEndDate] = useState(today)
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const activeRange = useMemo(() => {
    if (preset === 'custom') return { startDate, endDate }
    return getRangeForPreset(preset)
  }, [preset, startDate, endDate])

  const summaryText = useMemo(
    () => buildTasksSummaryText(tasks),
    [tasks],
  )

  const loadPreview = useCallback(async () => {
    const { startDate: start, endDate: end } = activeRange
    if (start > end) {
      setTasks([])
      setError('Start date must be on or before end date.')
      return
    }

    setLoading(true)
    setError(null)
    try {
      const loaded = await getTasksInDateRange(start, end)
      setTasks(loaded)
      if (loaded.length === 0) {
        setError('No tasks found for the selected date range.')
      }
    } catch (e) {
      setTasks([])
      setError(e instanceof Error ? e.message : 'Failed to load tasks')
    } finally {
      setLoading(false)
    }
  }, [activeRange])

  useEffect(() => {
    if (!open) return
    void loadPreview()
  }, [open, loadPreview])

  const handlePresetChange = (next: RangePreset) => {
    setPreset(next)
    setCopied(false)
    if (next !== 'custom') {
      const range = getRangeForPreset(next)
      setStartDate(range.startDate)
      setEndDate(range.endDate)
    }
  }

  const handleDownloadCsv = () => {
    const { startDate: start, endDate: end } = activeRange
    if (tasks.length === 0) return
    downloadTasksCsv(tasks, start, end)
  }

  const handleCopy = async () => {
    if (!summaryText) return
    try {
      await navigator.clipboard.writeText(summaryText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setError('Could not copy to clipboard.')
    }
  }

  const rangeInvalid = activeRange.startDate > activeRange.endDate

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button
        variant="outline"
        onClick={() => setOpen(true)}
        disabled={disabled}
      >
        <Download className="size-4" />
        Export
      </Button>

      <DialogContent className="flex max-h-[90vh] flex-col overflow-hidden sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Export timesheet</DialogTitle>
        </DialogHeader>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto">
          <fieldset className="space-y-2">
            <legend className="text-sm font-medium">Date range</legend>
            <div className="flex flex-wrap gap-2">
              {presetOptions.map((option) => (
                <Button
                  key={option.value}
                  type="button"
                  size="sm"
                  variant={preset === option.value ? 'default' : 'outline'}
                  onClick={() => handlePresetChange(option.value)}
                  disabled={loading}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </fieldset>

          {preset === 'custom' && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="export-start">From</Label>
                <Input
                  id="export-start"
                  type="date"
                  value={startDate}
                  max={endDate}
                  onChange={(e) => {
                    setStartDate(e.target.value)
                    setCopied(false)
                  }}
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="export-end">To</Label>
                <Input
                  id="export-end"
                  type="date"
                  value={endDate}
                  min={startDate}
                  max={today}
                  onChange={(e) => {
                    setEndDate(e.target.value)
                    setCopied(false)
                  }}
                  disabled={loading}
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <Label htmlFor="export-summary">Summary (copy)</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCopy}
                disabled={!summaryText || loading}
              >
                <Copy className="size-3.5" />
                {copied ? 'Copied' : 'Copy'}
              </Button>
            </div>
            <textarea
              id="export-summary"
              readOnly
              value={
                loading
                  ? 'Loading…'
                  : rangeInvalid
                    ? ''
                    : summaryText ||
                      (error ? '' : 'No tasks in this range.')
              }
              placeholder={
                rangeInvalid
                  ? 'Invalid date range.'
                  : 'Select a date range to preview tasks.'
              }
              className={cn(
                'min-h-[160px] w-full resize-y rounded-lg border border-input bg-transparent px-2.5 py-2 font-mono text-sm',
                'outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50',
              )}
            />
            <p className="text-xs text-muted-foreground">
              One line per task, e.g.{' '}
              <span className="font-mono">Meeting (1hr 30min)</span>. Running
              tasks use time tracked so far.
            </p>
          </div>

          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}
        </div>

        <DialogFooter className="shrink-0 gap-2 sm:gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
          >
            Close
          </Button>
          <Button
            type="button"
            onClick={handleDownloadCsv}
            disabled={loading || tasks.length === 0 || rangeInvalid}
          >
            <Download className="size-4" />
            Download CSV
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
