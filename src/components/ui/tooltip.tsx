import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface TooltipProps {
  label: string
  children: ReactNode
  className?: string
}

export function Tooltip({ label, children, className }: TooltipProps) {
  return (
    <div className={cn('group/tooltip relative', className)}>
      {children}
      <span
        role="tooltip"
        className="pointer-events-none absolute left-[calc(100%+0.5rem)] top-1/2 z-50 -translate-y-1/2 whitespace-nowrap rounded-md border bg-popover px-2 py-1 text-xs font-medium text-popover-foreground opacity-0 shadow-md transition-opacity group-hover/tooltip:opacity-100 group-focus-within/tooltip:opacity-100"
      >
        {label}
      </span>
    </div>
  )
}
