import { X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { Tag } from '@/types'

interface TagFilterProps {
  tags: Tag[]
  selectedTagIds: string[]
  onChange: (tagIds: string[]) => void
}

export function TagFilter({ tags, selectedTagIds, onChange }: TagFilterProps) {
  if (tags.length === 0) return null

  const toggleTag = (id: string) => {
    onChange(
      selectedTagIds.includes(id)
        ? selectedTagIds.filter((t) => t !== id)
        : [...selectedTagIds, id],
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-medium text-muted-foreground">Filter by tag</p>
        {selectedTagIds.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs"
            onClick={() => onChange([])}
          >
            <X className="size-3" />
            Clear
          </Button>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => {
          const selected = selectedTagIds.includes(tag.id)
          return (
            <button
              key={tag.id}
              type="button"
              onClick={() => toggleTag(tag.id)}
              className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Badge
                variant={selected ? 'default' : 'outline'}
                className={cn(
                  'cursor-pointer border transition-colors',
                  selected && 'ring-1 ring-offset-1 ring-offset-background',
                )}
                style={{
                  borderColor: tag.color,
                  color: selected ? undefined : tag.color,
                  ...(selected
                    ? { backgroundColor: tag.color, color: '#fff' }
                    : {}),
                }}
              >
                {tag.name}
              </Badge>
            </button>
          )
        })}
      </div>
    </div>
  )
}
