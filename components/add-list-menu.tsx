"use client";

import { useEffect, useRef, useState } from "react";
import { Plus, Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import { LIST_PRESETS, type ListPreset } from "@/lib/presets";
import { parseImportFile } from "@/components/import-export-menu";
import { type TodoList } from "@/lib/types";

type Props = {
  onSelect: (preset: ListPreset) => void;
  onImport: (list: TodoList) => void;
};

export function AddListMenu({ onSelect, onImport }: Props) {
  const [open, setOpen] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = parseImportFile(ev.target?.result as string);
        onImport(parsed);
        setImportError(null);
        setOpen(false);
      } catch (err) {
        setImportError(err instanceof Error ? err.message : "Invalid file.");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => {
          setImportError(null);
          setOpen((o) => !o);
        }}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full bg-primary px-3.5 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90",
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
                onSelect(preset);
                setOpen(false);
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

          <div className="my-1 h-px bg-border" role="separator" />

          {/* Import from file */}
          <button
            type="button"
            role="menuitem"
            onClick={() => fileRef.current?.click()}
            className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left transition-colors hover:bg-accent"
          >
            <Upload
              className="size-3.5 shrink-0 text-muted-foreground"
              aria-hidden="true"
            />
            <div>
              <span className="block text-sm font-medium text-foreground">
                Import from file
              </span>
              <span className="block text-xs text-muted-foreground">
                Restore a saved list
              </span>
            </div>
          </button>

          {importError && (
            <p className="mt-1 rounded-xl bg-destructive/10 px-2.5 py-2 font-mono text-[10px] text-destructive">
              {importError}
            </p>
          )}

          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="sr-only"
            onChange={handleFileChange}
            aria-hidden="true"
          />
        </div>
      )}
    </div>
  );
}
