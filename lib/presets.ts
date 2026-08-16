import type { TodoList } from "./types";

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

export const DEFAULT_DURATION_MS = 24 * HOUR;

/** Quick-pick cooldown durations shown as pills. */
export const DURATION_PRESETS: { label: string; ms: number }[] = [
  { label: "1h", ms: 1 * HOUR },
  { label: "4h", ms: 4 * HOUR },
  { label: "8h", ms: 8 * HOUR },
  { label: "12h", ms: 12 * HOUR },
  { label: "24h", ms: 24 * HOUR },
  { label: "7d", ms: 7 * DAY },
];

export function uid(): string {
  return (
    Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4)
  );
}

const makeItems = (texts: string[], durationMs: number) => {
  return texts.map((text) => ({
    id: uid(),
    text,
    durationMs,
    startedAt: null,
  }));
};

/** Pre-made list templates the user can drop in. */
export type ListPreset = {
  key: string;
  name: string;
  description: string;
  build: () => TodoList;
};

export const LIST_PRESETS: ListPreset[] = [
  {
    key: "daily",
    name: "Daily reset",
    description: "Services that free up every 24 hours.",
    build: () => ({
      id: uid(),
      title: "Daily reset",
      items: makeItems(
        ["ChatGPT", "Claude", "AI Studio", "Gemini", "Perplexity"],
        24 * HOUR,
      ),
    }),
  },
  {
    key: "gaming",
    name: "Game timers",
    description: "Track daily / weekly in-game resets.",
    build: () => ({
      id: uid(),
      title: "Game timers",
      items: makeItems(
        ["Daily quests", "Raid lockout", "Weekly vault", "Steam sale"],
        7 * DAY,
      ),
    }),
  },
  {
    key: "content",
    name: "Content cooldowns",
    description: "Re-post windows across channels.",
    build: () => ({
      id: uid(),
      title: "Content cooldowns",
      items: makeItems(
        [
          "Twitter thread",
          "LinkedIn post",
          "Instagram story",
          "YouTube upload",
        ],
        48 * HOUR,
      ),
    }),
  },
  {
    key: "blank",
    name: "Blank list",
    description: "Start empty with a single row.",
    build: () => ({
      id: uid(),
      title: "New list",
      items: makeItems(["New item"], DEFAULT_DURATION_MS),
    }),
  },
];

export function starterState(): TodoList[] {
  return [LIST_PRESETS[0].build()];
}
