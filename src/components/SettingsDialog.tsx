import { useState } from 'react'
import { Settings, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { deleteAllData } from '@/services/storage'

interface SettingsDialogProps {
  disabled?: boolean
  onDataDeleted?: () => void
}

export function SettingsDialog({ disabled, onDataDeleted }: SettingsDialogProps) {
  const [open, setOpen] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleOpenChange = (next: boolean) => {
    setOpen(next)
    if (!next) {
      setConfirming(false)
      setError(null)
    }
  }

  const handleDeleteAll = async () => {
    setDeleting(true)
    setError(null)
    try {
      await deleteAllData()
      setConfirming(false)
      setOpen(false)
      onDataDeleted?.()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete data')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="fixed top-4 left-14 z-[110] shadow-sm"
        onClick={() => setOpen(true)}
        disabled={disabled}
        aria-label="Settings"
        title="Settings"
      >
        <Settings className="size-4" />
      </Button>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Manage your timesheet data stored locally in this browser.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
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
