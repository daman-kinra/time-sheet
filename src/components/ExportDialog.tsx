import { useMemo, useState } from 'react'
import { Download } from 'lucide-react'
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
import { downloadTasksCsv } from '@/lib/export'
import { addDaysToDateKey, getTodayKey } from '@/lib/time'
import { getTasksInDateRange } from '@/services/storage'

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
  const [exporting, setExporting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const activeRange = useMemo(() => {
    if (preset === 'custom') return { startDate, endDate }
    return getRangeForPreset(preset)
  }, [preset, startDate, endDate])

  const handlePresetChange = (next: RangePreset) => {
    setPreset(next)
    setError(null)
    if (next !== 'custom') {
      const range = getRangeForPreset(next)
      setStartDate(range.startDate)
      setEndDate(range.endDate)
    }
  }

  const handleExport = async () => {
    const { startDate: start, endDate: end } = activeRange
    if (start > end) {
      setError('Start date must be on or before end date.')
      return
    }

    setExporting(true)
    setError(null)
    try {
      const tasks = await getTasksInDateRange(start, end)
      if (tasks.length === 0) {
        setError('No tasks found for the selected date range.')
        return
      }
      downloadTasksCsv(tasks, start, end)
      setOpen(false)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Export failed')
    } finally {
      setExporting(false)
    }
  }

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

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Export timesheet</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
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
                  disabled={exporting}
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
                    setError(null)
                  }}
                  disabled={exporting}
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
                    setError(null)
                  }}
                  disabled={exporting}
                />
              </div>
            </div>
          )}

          {preset !== 'custom' && (
            <p className="text-sm text-muted-foreground">
              {activeRange.startDate === activeRange.endDate
                ? `Exporting tasks for ${activeRange.startDate} (IST).`
                : `Exporting tasks from ${activeRange.startDate} to ${activeRange.endDate} (IST).`}
            </p>
          )}

          <p className="text-xs text-muted-foreground">
            CSV includes date, title, description, start time, end time, and
            status. Times are in IST.
          </p>

          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={exporting}
          >
            Cancel
          </Button>
          <Button type="button" onClick={handleExport} disabled={exporting}>
            <Download className="size-4" />
            {exporting ? 'Exporting…' : 'Download CSV'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
