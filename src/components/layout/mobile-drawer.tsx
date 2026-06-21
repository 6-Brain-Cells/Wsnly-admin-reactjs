import { X } from 'lucide-react'
import { useEffect } from 'react'

import { Sidebar } from './sidebar'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function MobileDrawer({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  return (
    <div
      aria-hidden={!open}
      className={cn(
        'fixed inset-0 z-50 lg:hidden',
        open ? 'pointer-events-auto' : 'pointer-events-none',
      )}
    >
      <div
        onClick={onClose}
        className={cn(
          'absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity',
          open ? 'opacity-100' : 'opacity-0',
        )}
      />
      <aside
        className={cn(
          'absolute inset-y-0 left-0 w-72 max-w-[85vw] border-r border-sidebar-border bg-sidebar shadow-elevated transition-transform duration-200',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="absolute right-2 top-2 z-10">
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Close menu"
            className="h-9 w-9"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <Sidebar onNavigate={onClose} />
      </aside>
    </div>
  )
}
