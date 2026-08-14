"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  type ClockFormat,
  type FilterMode,
  type ListItem,
  type TodoList,
  isDisabled,
} from "@/lib/types";
import { ListItemRow } from "@/components/list-item-row";
import { ConfirmDialog } from "@/components/confirm-dialog";

type Props = {
  list: TodoList;
  now: number;
  filter: FilterMode;
  clock: ClockFormat;
  onTitleChange: (title: string) => void;
  onAddRow: (count: number) => void;
  onDeleteList: () => void;
  onToggleItem: (itemId: string) => void;
  onItemTextChange: (itemId: string, text: string) => void;
  onItemDurationChange: (itemId: string, ms: number) => void;
  onDeleteItem: (itemId: string) => void;
};

const ROW_COUNTS = [3, 5, 10];

function matchesFilter(item: ListItem, now: number, filter: FilterMode) {
  if (filter === "all") return true;
  const disabled = isDisabled(item, now);
  return filter === "disabled" ? disabled : !disabled;
}

export function ListCard({
  list,
  now,
  filter,
  clock,
  onTitleChange,
  onAddRow,
  onDeleteList,
  onToggleItem,
  onItemTextChange,
  onItemDurationChange,
  onDeleteItem,
}: Props) {
  const disabledCount = list.items.filter((i) => isDisabled(i, now)).length;
  const activeCount = list.items.length - disabledCount;
  const visible = list.items.filter((i) => matchesFilter(i, now, filter));

  const titleRef = useRef<HTMLInputElement>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [rowMenuOpen, setRowMenuOpen] = useState(false);
  const rowMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!rowMenuOpen) return;
    function onDoc(e: MouseEvent) {
      if (rowMenuRef.current && !rowMenuRef.current.contains(e.target as Node))
        setRowMenuOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [rowMenuOpen]);

  return (
    <section className="flex min-w-0 flex-col rounded-3xl border border-border bg-card/70 p-3 backdrop-blur-sm sm:p-4">
      {/* header */}
      <header className="flex items-center gap-2 px-1 pb-3">
        {/* editable title */}
        <button
          type="button"
          onClick={() => titleRef.current?.focus()}
          aria-label="Edit list title"
          className="group/title flex min-w-0 flex-1 items-center gap-1.5 rounded-lg px-1.5 py-1 text-left transition-colors hover:bg-accent/60"
        >
          <input
            ref={titleRef}
            value={list.title}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder="Untitled list"
            aria-label="List title"
            className="min-w-0 flex-1 bg-transparent text-lg font-semibold tracking-tight text-foreground outline-none transition-colors placeholder:text-muted-foreground/50 group-hover/title:border-border focus:border-foreground/60"
          />
        </button>
        <span className="ml-1 inline-flex shrink-0 items-center gap-1 rounded-full bg-foreground px-2 py-0.5 font-mono text-[10px] tabular-nums text-background">
          <span
            className="size-1.5 rounded-full bg-active"
            aria-hidden="true"
          />
          {activeCount}
        </span>
        <span className="inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 font-mono text-[10px] tabular-nums text-muted-foreground ring-1 ring-inset ring-border">
          <span
            className="size-1.5 rounded-full bg-disabled"
            aria-hidden="true"
          />
          {disabledCount}
        </span>
        <button
          type="button"
          onClick={() => setConfirmOpen(true)}
          aria-label="Delete list"
          title="Delete list"
          className="flex size-7 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-destructive hover:text-background"
        >
          <Trash2 className="size-3.5" aria-hidden="true" />
        </button>
      </header>

      {/* items */}
      <div className="flex flex-col gap-1.5">
        {visible.length === 0 ? (
          <p className="rounded-full bg-secondary/50 px-4 py-3 text-center font-mono text-xs text-muted-foreground">
            {list.items.length === 0 ? "No items yet." : `No ${filter} items.`}
          </p>
        ) : (
          visible.map((item) => (
            <ListItemRow
              key={item.id}
              item={item}
              now={now}
              clock={clock}
              onToggle={() => onToggleItem(item.id)}
              onTextChange={(text) => onItemTextChange(item.id, text)}
              onDurationChange={(ms) => onItemDurationChange(item.id, ms)}
              onDelete={() => onDeleteItem(item.id)}
            />
          ))
        )}
      </div>

      {/* add row(s) — split control */}
      <div className="mt-2 flex items-stretch gap-1.5">
        <button
          type="button"
          onClick={() => onAddRow(1)}
          className={cn(
            "inline-flex flex-1 items-center justify-center gap-1.5 rounded-full border border-dashed border-border px-3 py-2 font-mono text-xs uppercase tracking-widest text-muted-foreground transition-colors",
            "hover:border-foreground hover:text-foreground",
          )}
        >
          <Plus className="size-3.5" aria-hidden="true" />
          Add row
        </button>
        <div ref={rowMenuRef} className="relative">
          <button
            type="button"
            onClick={() => setRowMenuOpen((o) => !o)}
            aria-label="Add multiple rows"
            aria-haspopup="menu"
            aria-expanded={rowMenuOpen}
            className="flex h-full items-center justify-center rounded-full border border-dashed border-border px-3 text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
          >
            <ChevronDown className="size-3.5" aria-hidden="true" />
          </button>
          {rowMenuOpen && (
            <div
              role="menu"
              className="absolute bottom-full right-0 z-30 mb-1.5 w-36 rounded-2xl border border-border bg-popover p-1.5 shadow-lg"
            >
              <p className="px-2 py-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                Add rows
              </p>
              {ROW_COUNTS.map((count) => (
                <button
                  key={count}
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    onAddRow(count);
                    setRowMenuOpen(false);
                  }}
                  className="flex w-full items-center justify-between rounded-xl px-2.5 py-1.5 text-left font-mono text-xs transition-colors hover:bg-accent"
                >
                  <span className="text-foreground">+{count} rows</span>
                  <Plus
                    className="size-3 text-muted-foreground"
                    aria-hidden="true"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title={`Delete “${list.title || "Untitled list"}”?`}
        description={`This removes the entire list and all ${list.items.length} ${
          list.items.length === 1 ? "item" : "items"
        }, including any running timers. This can't be undone.`}
        confirmLabel="Delete list"
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => {
          setConfirmOpen(false);
          onDeleteList();
        }}
      />
    </section>
  );
}
