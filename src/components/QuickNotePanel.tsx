import { useEffect, useState } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  StickyNote,
  Trash2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { useQuickNotes } from '@/hooks/useQuickNotes'
import {
  loadQuickNotePanelPrefs,
  saveQuickNotePanelPrefs,
} from '@/lib/quickNotePrefs'
import { cn } from '@/lib/utils'
import type { QuickNotePanelSize } from '@/types'

const panelWidth: Record<QuickNotePanelSize, string> = {
  collapsed: 'w-12 shrink-0',
  normal: 'w-1/3 min-w-[280px] max-w-md shrink-0',
  expanded: 'w-1/2 min-w-[320px] max-w-xl shrink-0',
}

export function QuickNotePanel() {
  const [size, setSize] = useState<QuickNotePanelSize>(() =>
    loadQuickNotePanelPrefs().size,
  )
  const [draft, setDraft] = useState('')
  const { items, loading, busy, error, add, toggle, remove } = useQuickNotes()

  useEffect(() => {
    saveQuickNotePanelPrefs({ size })
  }, [size])

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    const text = draft.trim()
    if (!text) return
    const created = await add(text)
    if (created) setDraft('')
  }

  if (size === 'collapsed') {
    return (
      <aside
        className={cn(
          'flex h-svh shrink-0 flex-col overflow-hidden border-l bg-card/50',
          panelWidth.collapsed,
        )}
      >
        <div className="flex flex-1 flex-col items-center gap-2 py-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSize('normal')}
            aria-label="Open quick notes"
            title="Open quick notes"
          >
            <StickyNote className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSize('normal')}
            aria-label="Expand quick notes"
          >
            <ChevronLeft className="size-4" />
          </Button>
        </div>
      </aside>
    )
  }

  return (
    <aside
      className={cn(
        'flex h-svh shrink-0 flex-col overflow-hidden border-l bg-card/30',
        panelWidth[size],
      )}
    >
      <Card className="flex h-full min-h-0 flex-col rounded-none border-0 bg-transparent shadow-none ring-0">
        <CardHeader className="flex flex-row items-center justify-between gap-2 border-b py-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <StickyNote className="size-4 text-muted-foreground" />
            Quick notes
          </CardTitle>
          <div className="flex items-center gap-0.5">
            {size === 'normal' ? (
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setSize('expanded')}
                aria-label="Expand panel"
                title="Wider panel"
              >
                <Maximize2 className="size-4" />
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setSize('normal')}
                aria-label="Default panel width"
                title="Default width (1/3)"
              >
                <Minimize2 className="size-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setSize('collapsed')}
              aria-label="Collapse panel"
              title="Collapse"
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="flex min-h-0 flex-1 flex-col gap-0 p-0">
          {error && (
            <p className="border-b px-4 py-2 text-xs text-destructive" role="alert">
              {error}
            </p>
          )}

          <ul className="min-h-0 flex-1 space-y-1 overflow-y-auto px-3 py-3">
            {loading && (
              <li className="py-6 text-center text-sm text-muted-foreground">
                Loading…
              </li>
            )}
            {!loading && items.length === 0 && (
              <li className="py-6 text-center text-sm text-muted-foreground">
                Add a note below. These are separate from your timesheet tasks.
              </li>
            )}
            {items.map((item) => (
              <li
                key={item.id}
                className="group flex items-start gap-2 rounded-lg border bg-card px-2 py-2"
              >
                <Checkbox
                  checked={item.completed}
                  onCheckedChange={(checked) =>
                    void toggle(item.id, checked === true)
                  }
                  disabled={busy}
                  className="mt-0.5"
                />
                <span
                  className={cn(
                    'min-w-0 flex-1 text-sm leading-snug',
                    item.completed && 'text-muted-foreground line-through',
                  )}
                >
                  {item.text}
                </span>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  className="opacity-0 transition-opacity group-hover:opacity-100"
                  onClick={() => void remove(item.id)}
                  disabled={busy}
                  aria-label="Delete note"
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </li>
            ))}
          </ul>

          <form
            onSubmit={handleAdd}
            className="shrink-0 border-t bg-card/80 p-3"
          >
            <div className="flex gap-2">
              <Input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Add a note…"
                disabled={busy}
                className="flex-1"
              />
              <Button type="submit" size="sm" disabled={busy || !draft.trim()}>
                Add
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </aside>
  )
}
