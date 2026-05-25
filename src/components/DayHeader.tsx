import { ChevronLeft, ChevronRight, Clock } from 'lucide-react'
import { ExportDialog } from '@/components/ExportDialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  addDaysToDateKey,
  formatDisplayDate,
  formatDuration,
  getTodayKey,
} from '@/lib/time'

interface DayHeaderProps {
  selectedDate: string
  workedMs: number
  onDateChange: (date: string) => void
  exportDisabled?: boolean
}

export function DayHeader({
  selectedDate,
  workedMs,
  onDateChange,
  exportDisabled,
}: DayHeaderProps) {
  const shiftDay = (offset: number) => {
    onDateChange(addDaysToDateKey(selectedDate, offset))
  }

  return (
    <header className="flex flex-col gap-4 border-b pb-6 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-sm font-medium text-muted-foreground">Timesheet</p>
        <h1 className="text-2xl font-semibold tracking-tight">
          {formatDisplayDate(selectedDate)}
        </h1>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <ExportDialog disabled={exportDisabled} />

        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            onClick={() => shiftDay(-1)}
            aria-label="Previous day"
          >
            <ChevronLeft className="size-4" />
          </Button>
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => onDateChange(e.target.value)}
            className="w-[150px]"
          />
          <Button
            variant="outline"
            size="icon"
            onClick={() => shiftDay(1)}
            aria-label="Next day"
          >
            <ChevronRight className="size-4" />
          </Button>
          {selectedDate !== getTodayKey() && (
            <Button variant="ghost" size="sm" onClick={() => onDateChange(getTodayKey())}>
              Today
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2 rounded-lg border bg-card px-4 py-2">
          <Clock className="size-4 text-muted-foreground" />
          <div>
            <p className="text-xs text-muted-foreground">Worked today</p>
            <p className="text-lg font-semibold tabular-nums">
              {formatDuration(workedMs)}
            </p>
          </div>
        </div>
      </div>
    </header>
  )
}
