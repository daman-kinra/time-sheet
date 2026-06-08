import { Kanban, LayoutList } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { TaskLayout } from '@/lib/taskLayoutPrefs'

interface LayoutToggleProps {
  layout: TaskLayout
  onChange: (layout: TaskLayout) => void
  disabled?: boolean
}

export function LayoutToggle({ layout, onChange, disabled }: LayoutToggleProps) {
  return (
    <div className="inline-flex rounded-lg border bg-muted/40 p-0.5">
      <Button
        type="button"
        size="xs"
        variant={layout === 'list' ? 'secondary' : 'ghost'}
        className={cn('gap-1.5', layout === 'list' && 'shadow-sm')}
        onClick={() => onChange('list')}
        disabled={disabled}
        aria-pressed={layout === 'list'}
      >
        <LayoutList className="size-3.5" />
        List
      </Button>
      <Button
        type="button"
        size="xs"
        variant={layout === 'kanban' ? 'secondary' : 'ghost'}
        className={cn('gap-1.5', layout === 'kanban' && 'shadow-sm')}
        onClick={() => onChange('kanban')}
        disabled={disabled}
        aria-pressed={layout === 'kanban'}
      >
        <Kanban className="size-3.5" />
        Kanban
      </Button>
    </div>
  )
}
