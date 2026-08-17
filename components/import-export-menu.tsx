"use client";

import { useState } from "react";
import { Download, Upload, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { type TodoList } from "@/lib/types";
import { uid } from "@/lib/presets";

type Props = {
  list: TodoList;
};

function exportList(list: TodoList) {
  const payload = JSON.stringify(list, null, 2);
  const blob = new Blob([payload], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const safeName = (list.title || "list")
    .replace(/[^a-z0-9]+/gi, "-")
    .toLowerCase();
  a.href = url;
  a.download = `countdn-${safeName}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

/** Returns a cleaned TodoList or throws. */
export function parseImportFile(raw: string): TodoList {
  const data = JSON.parse(raw);

  if (typeof data !== "object" || data === null)
    throw new Error("Not an object.");
  if (typeof data.title !== "string") throw new Error("Missing title.");
  if (!Array.isArray(data.items)) throw new Error("Missing items array.");

  const items = data.items.map((it: unknown) => {
    if (typeof it !== "object" || it === null)
      throw new Error("Item is not an object.");
    const item = it as Record<string, unknown>;
    if (typeof item.text !== "string") throw new Error("Item missing text.");
    if (typeof item.durationMs !== "number")
      throw new Error("Item missing durationMs.");
    const startedAt =
      item.startedAt === null || item.startedAt === undefined
        ? null
        : typeof item.startedAt === "number"
          ? item.startedAt
          : null;
    // Remap IDs so imported list never collides with existing ones
    return {
      id: uid(),
      text: item.text,
      durationMs: item.durationMs,
      startedAt,
    };
  });

  return {
    id: uid(),
    title: data.title,
    items,
  };
}

export function ImportExportMenu({ list }: Props) {
  const [open, setOpen] = useState(false);

  const handleExport = () => {
    exportList(list);
    setOpen(false);
  };

  return (
    <div className="relative">
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Export list"
        title="Export list"
        className={cn(
          "flex size-7 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors",
          open
            ? "bg-accent text-foreground"
            : "hover:bg-accent/60 hover:text-foreground",
        )}
      >
        <Download className="size-3.5" aria-hidden="true" />
      </button>

      {/* Dropdown panel */}
      {open && (
        <>
          <div
            className="fixed inset-0 z-20"
            aria-hidden="true"
            onClick={() => setOpen(false)}
          />

          <div
            role="menu"
            className="absolute right-0 top-full z-30 mt-1.5 w-52 rounded-2xl border border-border bg-popover p-1.5 shadow-lg"
          >
            <div className="flex items-center justify-between px-2 py-1">
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                Share list
              </p>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="flex size-5 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                <X className="size-3" />
              </button>
            </div>

            {/* Export */}
            <button
              type="button"
              role="menuitem"
              onClick={handleExport}
              className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left font-mono text-xs transition-colors hover:bg-accent"
            >
              <Download
                className="size-3.5 shrink-0 text-muted-foreground"
                aria-hidden="true"
              />
              <div>
                <span className="block text-foreground">Export list</span>
                <span className="block text-[10px] text-muted-foreground">
                  Download as JSON file
                </span>
              </div>
            </button>
          </div>
        </>
      )}
    </div>
  );
}
