'use client'

import { useEffect, useRef, useState } from 'react'
import { Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { LIST_PRESETS, type ListPreset } from '@/lib/presets'

type Props = {
  onSelect: (preset: ListPreset) => void
}

export function AddListMenu({ onSelect }: Props) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDoc)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          'inline-flex items-center gap-1.5 rounded-full bg-primary px-3.5 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90',
        )}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <Plus className="size-4" aria-hidden="true" />
        New list
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-30 mt-1.5 w-64 rounded-2xl border border-border bg-popover p-1.5 shadow-lg"
        >
          <p className="px-2 py-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Presets
          </p>
          {LIST_PRESETS.map((preset) => (
            <button
              key={preset.key}
              type="button"
              role="menuitem"
              onClick={() => {
                onSelect(preset)
                setOpen(false)
              }}
              className="flex w-full flex-col items-start gap-0.5 rounded-xl px-2.5 py-2 text-left transition-colors hover:bg-accent"
            >
              <span className="text-sm font-medium text-foreground">
                {preset.name}
              </span>
              <span className="text-xs text-muted-foreground">
                {preset.description}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
