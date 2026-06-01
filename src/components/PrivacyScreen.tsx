import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  loadPrivacyEnabled,
  savePrivacyEnabled,
} from '@/lib/privacyPrefs'
import { cn } from '@/lib/utils'

export function PrivacyScreen() {
  const [enabled, setEnabled] = useState(loadPrivacyEnabled)

  const toggle = () => {
    setEnabled((on) => {
      const next = !on
      savePrivacyEnabled(next)
      return next
    })
  }

  return (
    <>
      <Button
        type="button"
        variant={enabled ? 'default' : 'outline'}
        size="icon"
        className={cn(
          'fixed top-4 left-4 z-[110] shadow-sm',
          enabled && 'ring-2 ring-primary/30',
        )}
        onClick={toggle}
        aria-pressed={enabled}
        aria-label={enabled ? 'Disable privacy mode' : 'Enable privacy mode'}
        title={enabled ? 'Disable privacy mode' : 'Blur screen for sharing'}
      >
        {enabled ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
      </Button>

      {enabled && (
        <div
          className="fixed inset-0 z-[100] bg-background/50 backdrop-blur-2xl"
          aria-hidden
        />
      )}
    </>
  )
}
