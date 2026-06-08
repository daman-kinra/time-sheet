import { useEffect, useState } from 'react'
import { RotateCcw, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  DEFAULT_KANBAN_COLUMN_COLORS,
  KANBAN_COLUMN_LABELS,
  KANBAN_COLUMN_STATUSES,
  type KanbanColumnColors,
} from '@/lib/kanbanColumnPrefs'
import { deleteAllData } from '@/services/storage'

interface SettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  disabled?: boolean
  onDataDeleted?: () => void
  columnColors: KanbanColumnColors
  onColumnColorsChange: (colors: KanbanColumnColors) => void
}

export function SettingsDialog({
  open,
  onOpenChange,
  disabled,
  onDataDeleted,
  columnColors,
  onColumnColorsChange,
}: SettingsDialogProps) {
  const [confirming, setConfirming] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [draftColors, setDraftColors] = useState(columnColors)

  useEffect(() => {
    if (open) setDraftColors(columnColors)
  }, [open, columnColors])

  const handleOpenChange = (next: boolean) => {
    onOpenChange(next)
    if (!next) {
      setConfirming(false)
      setError(null)
    }
  }

  const handleColorChange = (status: keyof KanbanColumnColors, color: string) => {
    const next = { ...draftColors, [status]: color }
    setDraftColors(next)
    onColumnColorsChange(next)
  }

  const handleResetColumnColors = () => {
    const next = { ...DEFAULT_KANBAN_COLUMN_COLORS }
    setDraftColors(next)
    onColumnColorsChange(next)
  }

  const handleDeleteAll = async () => {
    setDeleting(true)
    setError(null)
    try {
      await deleteAllData()
      setConfirming(false)
      onOpenChange(false)
      onDataDeleted?.()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete data')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Manage your timesheet data stored locally in this browser.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-lg border p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-sm font-medium">Status colors</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Customize status colors for list and kanban views.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="xs"
                onClick={handleResetColumnColors}
                disabled={disabled}
              >
                <RotateCcw className="size-3" />
                Reset
              </Button>
            </div>

            <ul className="mt-4 space-y-3">
              {KANBAN_COLUMN_STATUSES.map((status) => (
                <li
                  key={status}
                  className="flex items-center justify-between gap-3 rounded-lg border px-3 py-2"
                  style={{
                    borderColor: `color-mix(in srgb, ${draftColors[status]} 35%, transparent)`,
                    backgroundColor: `color-mix(in srgb, ${draftColors[status]} 8%, transparent)`,
                  }}
                >
                  <Label
                    htmlFor={`kanban-color-${status}`}
                    className="flex items-center gap-2 text-sm font-normal"
                  >
                    <span
                      className="size-2.5 rounded-full"
                      style={{ backgroundColor: draftColors[status] }}
                      aria-hidden
                    />
                    {KANBAN_COLUMN_LABELS[status]}
                  </Label>
                  <div className="flex items-center gap-2">
                    <input
                      id={`kanban-color-${status}`}
                      type="color"
                      value={draftColors[status]}
                      onChange={(e) => handleColorChange(status, e.target.value)}
                      disabled={disabled}
                      className="size-8 cursor-pointer rounded-md border border-input bg-transparent p-0.5 disabled:cursor-not-allowed disabled:opacity-50"
                      aria-label={`${KANBAN_COLUMN_LABELS[status]} column color`}
                    />
                    <span className="w-16 text-right text-xs tabular-nums text-muted-foreground uppercase">
                      {draftColors[status]}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4">
            <h3 className="text-sm font-medium text-destructive">Danger zone</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Permanently remove all tasks, tags, and quick notes from the local
              database. This cannot be undone.
            </p>

            {!confirming ? (
              <Button
                type="button"
                variant="destructive"
                className="mt-3"
                onClick={() => setConfirming(true)}
                disabled={deleting}
              >
                <Trash2 className="size-4" />
                Delete all data
              </Button>
            ) : (
              <div className="mt-3 space-y-3">
                <p className="text-sm font-medium">
                  Delete everything? This will wipe the entire database.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => void handleDeleteAll()}
                    disabled={deleting}
                  >
                    {deleting ? 'Deleting…' : 'Yes, delete all'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setConfirming(false)}
                    disabled={deleting}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>

          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}
        </div>

        <DialogFooter className="shrink-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={deleting}
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
