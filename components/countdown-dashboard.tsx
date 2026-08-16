"use client";

import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { SortableContext, rectSortingStrategy } from "@dnd-kit/sortable";
import {
  type AppState,
  type ClockFormat,
  type FilterMode,
  type ListItem,
  type TodoList,
  isDisabled,
} from "@/lib/types";
import {
  DEFAULT_DURATION_MS,
  DURATION_PRESETS,
  type ListPreset,
  starterState,
  uid,
} from "@/lib/presets";
import { useLocalStorage } from "@/lib/use-local-storage";
import { useDndLists } from "@/lib/use-dnd-lists";
import { SortableListCard } from "@/components/sortable-list-card";
import { AddListMenu } from "@/components/add-list-menu";
import { ThemeToggle } from "@/components/theme-toggle";

const MotionSpan: any = motion.span;

const STORAGE_KEY = "countdown.state.v1";

const FILTERS: { key: FilterMode; label: string }[] = [
  { key: "all", label: "All" },
  { key: "active", label: "Active" },
  { key: "disabled", label: "Disabled" },
];

const initialState = (): AppState => {
  return {
    version: 1,
    defaultDurationMs: DEFAULT_DURATION_MS,
    clock: "24h",
    lists: starterState(),
  };
};

export function CountdownDashboard() {
  const [state, setState, hydrated] = useLocalStorage<AppState>(
    STORAGE_KEY,
    initialState,
  );
  const [filter, setFilter] = useState<FilterMode>("all");
  const [now, setNow] = useState(() => Date.now());

  // 1s ticker to drive countdowns
  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const stats = useMemo(() => {
    let active = 0;
    let disabled = 0;
    for (const list of state.lists) {
      for (const item of list.items) {
        if (isDisabled(item, now)) disabled++;
        else active++;
      }
    }
    return { active, disabled, total: active + disabled };
  }, [state.lists, now]);

  // ---- mutations -------------------------------------------------------
  const mapLists = (fn: (lists: AppState["lists"]) => AppState["lists"]) => {
    setState((prev) => ({ ...prev, lists: fn(prev.lists) }));
  };

  const updateList = (
    listId: string,
    fn: (l: AppState["lists"][number]) => AppState["lists"][number],
  ) => {
    mapLists((lists) => lists.map((l) => (l.id === listId ? fn(l) : l)));
  };

  const addListFromPreset = (preset: ListPreset) => {
    mapLists((lists) => [...lists, preset.build()]);
  };

  const deleteList = (listId: string) => {
    mapLists((lists) => lists.filter((l) => l.id !== listId));
  };

  const addRow = (listId: string, count = 1) => {
    const n = Math.max(1, Math.min(50, Math.floor(count)));
    updateList(listId, (l) => ({
      ...l,
      items: [
        ...l.items,
        ...Array.from({ length: n }, () => ({
          id: uid(),
          text: "",
          durationMs: state.defaultDurationMs,
          startedAt: null as number | null,
        })),
      ],
    }));
  };

  const toggleItem = (listId: string, itemId: string) => {
    const t = Date.now();
    updateList(listId, (l) => ({
      ...l,
      items: l.items.map((it) => {
        if (it.id !== itemId) return it;
        const currentlyDisabled =
          it.startedAt !== null && it.startedAt + it.durationMs > t;
        return { ...it, startedAt: currentlyDisabled ? null : t };
      }),
    }));
  };

  const setItemText = (listId: string, itemId: string, text: string) => {
    updateList(listId, (l) => ({
      ...l,
      items: l.items.map((it) => (it.id === itemId ? { ...it, text } : it)),
    }));
  };

  const setItemDuration = (listId: string, itemId: string, ms: number) => {
    updateList(listId, (l) => ({
      ...l,
      items: l.items.map((it) =>
        it.id === itemId ? { ...it, durationMs: ms } : it,
      ),
    }));
  };

  const deleteItem = (listId: string, itemId: string) => {
    updateList(listId, (l) => ({
      ...l,
      items: l.items.filter((it) => it.id !== itemId),
    }));
  };

  const setListTitle = (listId: string, title: string) => {
    updateList(listId, (l) => ({ ...l, title }));
  };

  const setDefaultDuration = (ms: number) => {
    setState((prev) => ({ ...prev, defaultDurationMs: ms }));
  };

  const setClock = (clock: ClockFormat) => {
    setState((prev) => ({ ...prev, clock }));
  };

  const reorderLists = (newLists: TodoList[]) => {
    setState((prev) => ({ ...prev, lists: newLists }));
  };

  const reorderItems = (listId: string, newItems: ListItem[]) => {
    updateList(listId, (l) => ({ ...l, items: newItems }));
  };

  // Drag and drop setup for cards
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  const handleListDragEnd = useDndLists(state.lists, reorderLists);

  // fall back gracefully for state saved before the clock setting existed
  const clock: ClockFormat = state.clock ?? "24h";
  const singleList = state.lists.length === 1;

  // ---------------------------------------------------------------------
  const pillTransition = { type: "spring", stiffness: 500, damping: 40 };
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:py-12">
      {/* masthead */}
      <header className="mb-8 flex flex-col gap-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="mt-1 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
              Countdn.
            </h1>
            <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
              Status &amp; Cooldown for your tasks
            </p>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <AddListMenu onSelect={addListFromPreset} />
          </div>
        </div>

        {/* stat bar */}
        <div className="grid grid-cols-3 gap-2 sm:max-w-md">
          <Stat label="Active" value={stats.active} solid />
          <Stat label="Disabled" value={stats.disabled} />
          <Stat label="Total" value={stats.total} />
        </div>

        {/* controls */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* filters */}
          <div
            className="inline-flex items-center gap-1 rounded-full border border-border bg-card p-1"
            role="tablist"
            aria-label="Filter items"
          >
            {FILTERS.map((f) => (
              <button
                key={f.key}
                type="button"
                role="tab"
                aria-selected={filter === f.key}
                onClick={() => setFilter(f.key)}
                className={cn(
                  "relative z-0 rounded-full px-3.5 py-1.5 font-mono text-xs uppercase tracking-widest transition-colors",
                  filter === f.key
                    ? "text-background"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {filter === f.key && (
                  <MotionSpan
                    layoutId="filter-pill"
                    transition={pillTransition}
                    className="absolute inset-0 rounded-full bg-foreground"
                  />
                )}
                <span className="relative z-10">{f.label}</span>
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* clock format */}
            <div className="flex items-center gap-2">
              <div
                className="inline-flex items-center gap-1 rounded-full border border-border bg-card p-1"
                role="group"
                aria-label="Clock format"
              >
                <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground px-2">
                  Clock
                </span>
                {(["24h", "12h"] as ClockFormat[]).map((c) => (
                  <button
                    key={c}
                    type="button"
                    aria-pressed={clock === c}
                    onClick={() => setClock(c)}
                    className={cn(
                      "relative z-0 rounded-full px-2.5 py-1 font-mono text-xs tabular-nums transition-colors",
                      clock === c
                        ? "text-background"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {clock === c && (
                      <MotionSpan
                        layoutId="clock-pill"
                        transition={pillTransition}
                        className="absolute inset-0 rounded-full bg-foreground"
                      />
                    )}
                    <span className="relative z-10">{c}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* default duration */}
            <div className="flex items-center gap-2">
              <div className="inline-flex items-center gap-1 rounded-full border border-border bg-card p-1">
                <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground px-2">
                  New rows
                </span>
                {DURATION_PRESETS.filter((p) =>
                  [4, 8, 12, 24].includes(Math.round(p.ms / 3600000)),
                ).map((p) => (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => setDefaultDuration(p.ms)}
                    className={cn(
                      "relative z-0 rounded-full px-2.5 py-1 font-mono text-xs tabular-nums transition-colors",
                      state.defaultDurationMs === p.ms
                        ? "text-background"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {state.defaultDurationMs === p.ms && (
                      <MotionSpan
                        layoutId="rows-pill"
                        transition={pillTransition}
                        className="absolute inset-0 rounded-full bg-foreground"
                      />
                    )}
                    <span className="relative z-10">{p.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* lists */}
      {!hydrated ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="h-48 animate-pulse rounded-3xl border border-border bg-card/50" />
          <div className="h-48 animate-pulse rounded-3xl border border-border bg-card/50" />
        </div>
      ) : state.lists.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border p-12 text-center">
          <p className="font-mono text-sm text-muted-foreground">
            No lists yet — create one from a preset.
          </p>
        </div>
      ) : (
        <DndContext sensors={sensors} onDragEnd={handleListDragEnd}>
          <SortableContext
            items={state.lists.map((l) => l.id)}
            strategy={rectSortingStrategy}
          >
            <div
              className={cn(
                "grid auto-rows-max grid-cols-1 items-start gap-4",
                singleList ? "" : "lg:grid-cols-2",
              )}
            >
              {state.lists.map((list) => (
                <SortableListCard
                  key={list.id}
                  list={list}
                  now={now}
                  filter={filter}
                  clock={clock}
                  onTitleChange={(title: string) =>
                    setListTitle(list.id, title)
                  }
                  onAddRow={(count: number) => addRow(list.id, count)}
                  onDeleteList={() => deleteList(list.id)}
                  onToggleItem={(itemId: string) => toggleItem(list.id, itemId)}
                  onItemTextChange={(itemId: string, text: string) =>
                    setItemText(list.id, itemId, text)
                  }
                  onItemDurationChange={(itemId: string, ms: number) =>
                    setItemDuration(list.id, itemId, ms)
                  }
                  onDeleteItem={(itemId: string) => deleteItem(list.id, itemId)}
                  onReorderItems={(newItems: ListItem[]) =>
                    reorderItems(list.id, newItems)
                  }
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      <footer className="mt-10 text-center font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        <p className="mt-2">
          Saved locally · JS &copy; {new Date().getFullYear()}
        </p>
      </footer>
    </div>
  );
}

const Stat = ({
  label,
  value,
  solid,
}: {
  label: string;
  value: number;
  solid?: boolean;
}) => {
  return (
    <div
      className={cn(
        "flex flex-col gap-1 rounded-2xl border px-4 py-3",
        solid
          ? "border-transparent bg-foreground text-background"
          : "border-border bg-card text-foreground",
      )}
    >
      <span className="font-mono text-3xl font-semibold tabular-nums">
        {value}
      </span>
      <span
        className={cn(
          "font-mono text-[10px] uppercase tracking-widest",
          solid ? "text-background/70" : "text-muted-foreground",
        )}
      >
        {label}
      </span>
    </div>
  );
};
