"use client";

import { useEffect, useRef, useState } from "react";
import { PenLine, X, Maximize2, Minimize2, Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocalStorage } from "@/lib/use-local-storage";

const NOTES_KEY = "countdown.notes.v1";

export function QuickNotes() {
  const [notes, setNotes] = useLocalStorage<string>(NOTES_KEY, "");
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const copyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Focus textarea
  useEffect(() => {
    if (open) {
      setTimeout(() => textareaRef.current?.focus(), 80);
    }
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const copyText = async () => {
    try {
      await navigator.clipboard.writeText(notes);
      setCopied(true);
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
      copyTimeoutRef.current = setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const charCount = notes.length;
  const hasNotes = notes.trim().length > 0;

  return (
    <>
      {/* Floating trigger button */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Close notes" : "Open quick notes"}
        title={open ? "Close notes" : "Quick notes (Esc to close)"}
        className={cn(
          "fixed bottom-6 right-6 z-40 inline-flex size-12 items-center justify-center rounded-full shadow-lg transition-all duration-200",
          "border border-border bg-card text-foreground hover:bg-accent",
          open &&
            "bg-foreground text-background hover:bg-foreground/90 border-transparent",
        )}
      >
        {/* Dot indicator */}
        {hasNotes && !open && (
          <span className="absolute -top-0.5 -right-0.5 size-2.5 rounded-full bg-primary border-2 border-background" />
        )}
        <PenLine className="size-5" aria-hidden="true" />
      </button>

      {/* Backdrop */}
      {open && expanded && (
        <div
          className="fixed inset-0 z-40 bg-background/60 backdrop-blur-sm"
          onClick={() => setExpanded(false)}
        />
      )}

      {/* Notes panel */}
      <div
        ref={panelRef}
        role="dialog"
        aria-label="Quick notes"
        aria-modal={expanded}
        className={cn(
          "fixed z-50 flex flex-col rounded-2xl border border-border bg-card shadow-2xl",
          "transition-all duration-300 ease-out",
          !expanded && "bottom-18 right-6 w-80 max-h-[min(420px,60vh)]",
          expanded &&
            "bottom-auto top-1/2 left-1/2 w-[min(620px,90vw)] max-h-[70vh] h-[35vh]",
          // Open/closed visibility + transform, layered on top of the anchor.
          !open &&
            !expanded &&
            "pointer-events-none opacity-0 translate-y-4 scale-95",
          !open &&
            expanded &&
            "pointer-events-none opacity-0 -translate-x-1/2 translate-y-[calc(-50%+1rem)] scale-95",
          open &&
            !expanded &&
            "pointer-events-auto opacity-100 translate-y-0 scale-100",
          open &&
            expanded &&
            "pointer-events-auto opacity-100 -translate-x-1/2 -translate-y-1/2 scale-100",
        )}
      >
        {/* Panel header */}
        <div className="flex shrink-0 items-center justify-between gap-2 border-b border-border px-4 py-3">
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground select-none">
            Quick Notes
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={copyText}
              aria-label="Copy notes to clipboard"
              title="Copy to clipboard"
              className="inline-flex size-6 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              {copied ? (
                <Check className="size-3.5" aria-hidden="true" />
              ) : (
                <Copy className="size-3.5" aria-hidden="true" />
              )}
            </button>
            <button
              type="button"
              onClick={() => setExpanded((e) => !e)}
              aria-label={expanded ? "Shrink panel" : "Expand panel"}
              title={expanded ? "Shrink" : "Expand"}
              className="inline-flex size-6 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              {expanded ? (
                <Minimize2 className="size-3.5" aria-hidden="true" />
              ) : (
                <Maximize2 className="size-3.5" aria-hidden="true" />
              )}
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close notes"
              title="Close (Esc)"
              className="inline-flex size-6 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <X className="size-3.5" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Scribble something…"
          spellCheck
          className={cn(
            "min-h-0 flex-1 resize-none bg-transparent p-4",
            "font-mono text-sm text-foreground placeholder:text-muted-foreground/50",
            "focus:outline-none",
          )}
        />

        <div className="flex shrink-0 items-center justify-between border-t border-border px-4 py-2">
          <span className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground/60 select-none">
            Saved locally
          </span>
          <div className="flex items-center gap-3">
            {hasNotes && (
              <button
                type="button"
                onClick={() => setNotes("")}
                className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground/60 transition-colors hover:text-destructive"
              >
                Clear
              </button>
            )}
            <span className="font-mono text-[9px] tabular-nums text-muted-foreground/40">
              {charCount} ch
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
