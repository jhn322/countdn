"use client";

import { useEffect, useState } from "react";
import { Check, Copy, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  type ClockFormat,
  type ListItem,
  endAtMs,
  isDisabled,
  remainingMs,
} from "@/lib/types";
import { formatClockTime, formatCountdown } from "@/lib/format";
import { DurationMenu } from "@/components/duration-menu";

type Props = {
  item: ListItem;
  now: number;
  clock: ClockFormat;
  onToggle: () => void;
  onTextChange: (text: string) => void;
  onDurationChange: (ms: number) => void;
  onDelete: () => void;
};

export function ListItemRow({
  item,
  now,
  clock,
  onToggle,
  onTextChange,
  onDurationChange,
  onDelete,
}: Props) {
  const disabled = isDisabled(item, now);
  const remaining = remainingMs(item, now);
  const endAt = endAtMs(item);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1200);
    return () => clearTimeout(t);
  }, [copied]);

  async function copyText() {
    try {
      await navigator.clipboard.writeText(item.text);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div
      className={cn(
        "group flex items-center gap-2 rounded-full border px-2 py-1.5 transition-colors sm:gap-2.5 sm:px-2.5",
        disabled
          ? "border-transparent bg-secondary/60"
          : "border-border bg-card hover:border-foreground/30",
      )}
    >
      {/* checkbox */}
      <button
        type="button"
        role="checkbox"
        aria-checked={disabled}
        aria-label={disabled ? "Reactivate item" : "Start cooldown"}
        onClick={onToggle}
        className={cn(
          "flex size-6 shrink-0 items-center justify-center rounded-full border transition-colors",
          disabled
            ? "border-foreground bg-foreground text-background"
            : "border-foreground/40 bg-transparent hover:border-foreground",
        )}
      >
        {disabled && (
          <Check className="size-3.5" strokeWidth={3} aria-hidden="true" />
        )}
      </button>

      {/* text input */}
      <input
        value={item.text}
        onChange={(e) => onTextChange(e.target.value)}
        placeholder="Add item…"
        aria-label="Item text"
        className={cn(
          "min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/60",
          disabled &&
            "text-muted-foreground line-through decoration-foreground/40",
        )}
      />

      {/* status pill */}
      <span
        className={cn(
          "hidden shrink-0 items-center gap-1.5 rounded-full px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest sm:inline-flex",
          disabled
            ? "bg-transparent text-muted-foreground ring-1 ring-inset ring-border"
            : "bg-foreground text-background",
        )}
      >
        <span
          className={cn(
            "size-1.5 rounded-full",
            disabled ? "bg-disabled" : "bg-active",
          )}
          aria-hidden="true"
        />
        {disabled ? "Disabled" : "Active"}
      </span>

      {/* countdown + local re-activation time OR duration menu */}
      {disabled ? (
        <span className="flex shrink-0 items-center gap-1.5">
          {endAt !== null && (
            <span
              className="hidden items-center gap-1 rounded-full bg-secondary/60 px-2 py-1 font-mono text-[11px] tabular-nums text-muted-foreground sm:inline-flex"
              title={`Active again at ${formatClockTime(endAt, clock)}`}
            >
              <span className="text-muted-foreground/60">until</span>
              {formatClockTime(endAt, clock)}
            </span>
          )}
          <span
            className="rounded-full bg-background px-2.5 py-1 font-mono text-xs tabular-nums text-foreground ring-1 ring-inset ring-border"
            aria-label={`Time remaining ${formatCountdown(remaining)}, active again at ${
              endAt !== null ? formatClockTime(endAt, clock) : ""
            }`}
          >
            {formatCountdown(remaining)}
          </span>
        </span>
      ) : (
        <DurationMenu valueMs={item.durationMs} onChange={onDurationChange} />
      )}

      {/* copy */}
      <button
        type="button"
        onClick={copyText}
        aria-label="Copy item text"
        title="Copy text"
        className="flex size-7 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
      >
        {copied ? (
          <Check className="size-3.5" aria-hidden="true" />
        ) : (
          <Copy className="size-3.5" aria-hidden="true" />
        )}
      </button>

      {/* delete */}
      <button
        type="button"
        onClick={onDelete}
        aria-label="Delete item"
        title="Delete"
        className="flex size-7 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors transition-opacity hover:bg-destructive hover:text-background focus-visible:opacity-100 lg:opacity-0 lg:group-hover:opacity-100 lg:focus-visible:opacity-100"
      >
        <Trash2 className="size-3.5" aria-hidden="true" />
      </button>
    </div>
  );
}
