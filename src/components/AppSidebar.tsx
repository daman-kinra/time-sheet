import { useState } from 'react'
import { Eye, EyeOff, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tooltip } from '@/components/ui/tooltip'
import {
  loadPrivacyEnabled,
  savePrivacyEnabled,
} from '@/lib/privacyPrefs'
import { cn } from '@/lib/utils'

interface AppSidebarProps {
  onOpenSettings: () => void
  disabled?: boolean
}

export function AppSidebar({ onOpenSettings, disabled }: AppSidebarProps) {
  const [privacyEnabled, setPrivacyEnabled] = useState(loadPrivacyEnabled)

  const togglePrivacy = () => {
    setPrivacyEnabled((on) => {
      const next = !on
      savePrivacyEnabled(next)
      return next
    })
  }

  return (
    <>
      {privacyEnabled && (
        <div
          className="fixed inset-y-0 right-0 left-12 z-[100] bg-background/50 backdrop-blur-2xl"
          aria-hidden
        />
      )}

      <aside className="relative z-[110] flex h-svh w-12 shrink-0 flex-col items-center gap-2 border-r border-sidebar-border bg-sidebar py-4">
        <Tooltip label={privacyEnabled ? 'Disable privacy mode' : 'Blur screen for sharing'}>
          <Button
            type="button"
            variant={privacyEnabled ? 'default' : 'outline'}
            size="icon"
            className={cn(
              'shadow-sm',
              privacyEnabled && 'ring-2 ring-primary/30',
            )}
            onClick={togglePrivacy}
            disabled={disabled}
            aria-pressed={privacyEnabled}
            aria-label={privacyEnabled ? 'Disable privacy mode' : 'Enable privacy mode'}
          >
            {privacyEnabled ? (
              <EyeOff className="size-4" />
            ) : (
              <Eye className="size-4" />
            )}
          </Button>
        </Tooltip>

        <Tooltip label="Settings">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="shadow-sm"
            onClick={onOpenSettings}
            disabled={disabled}
            aria-label="Settings"
          >
            <Settings className="size-4" />
          </Button>
        </Tooltip>
      </aside>
    </>
  )
}
