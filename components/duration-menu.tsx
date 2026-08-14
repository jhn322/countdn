'use client'

import { useEffect, useRef, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { DURATION_PRESETS } from '@/lib/presets'
import { formatDurationLabel } from '@/lib/format'

type Props = {
  valueMs: number
  onChange: (ms: number) => void
  /** disable interaction (e.g. while item is on cooldown) */
  disabled?: boolean
  className?: string
  align?: 'left' | 'right'
}

const HOUR = 60 * 60 * 1000

export function DurationMenu({
  valueMs,
  onChange,
  disabled,
  className,
  align = 'right',
}: Props) {
  const [open, setOpen] = useState(false)
  const [custom, setCustom] = useState('')
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

  function applyCustom() {
    const hours = Number.parseFloat(custom)
    if (Number.isFinite(hours) && hours > 0) {
      onChange(Math.round(hours * HOUR))
      setCustom('')
      setOpen(false)
    }
  }

  return (
    <div ref={ref} className={cn('relative', className)}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        className={cn(
          'inline-flex items-center gap-1 rounded-full border border-border bg-secondary px-2.5 py-1 font-mono text-xs tabular-nums text-secondary-foreground transition-colors',
          'hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50',
        )}
        aria-label="Set cooldown duration"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        {formatDurationLabel(valueMs)}
        <ChevronDown className="size-3 opacity-60" aria-hidden="true" />
      </button>

      {open && (
        <div
          role="menu"
          className={cn(
            'absolute z-30 mt-1 w-44 rounded-xl border border-border bg-popover p-1.5 shadow-lg',
            align === 'right' ? 'right-0' : 'left-0',
          )}
        >
          <p className="px-2 py-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Cooldown
          </p>
          <div className="grid grid-cols-3 gap-1">
            {DURATION_PRESETS.map((p) => (
              <button
                key={p.label}
                type="button"
                role="menuitemradio"
                aria-checked={p.ms === valueMs}
                onClick={() => {
                  onChange(p.ms)
                  setOpen(false)
                }}
                className={cn(
                  'rounded-full px-2 py-1 font-mono text-xs tabular-nums transition-colors',
                  p.ms === valueMs
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground hover:bg-accent',
                )}
              >
                {p.label}
              </button>
            ))}
          </div>
          <div className="mt-1.5 flex items-center gap-1 border-t border-border pt-1.5">
            <input
              value={custom}
              onChange={(e) => setCustom(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.nativeEvent.isComposing) applyCustom()
              }}
              inputMode="decimal"
              placeholder="hrs"
              className="w-full min-w-0 rounded-full border border-border bg-background px-2.5 py-1 font-mono text-xs outline-none focus:ring-2 focus:ring-ring"
            />
            <button
              type="button"
              onClick={applyCustom}
              className="shrink-0 rounded-full bg-primary px-2.5 py-1 font-mono text-xs text-primary-foreground hover:opacity-90"
            >
              set
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
